/**
 * Project: ShiPu AI 🤖 - Most Advanced Facebook Automation
 * Description: Auto-command Handler, Anti-Spam, & Satirical AI Engine
 * Author: Chitron Bhattacharjee (Adi)
 */

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// ১. কনফিগারেশন লোড
const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
const app = express();
app.use(express.json());

// ২. জিমিনি ও গ্লোবাল ভেরিয়েবল সেটআপ
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || config.gemini.apiKey);
const userCooldowns = new Map(); // এন্টি-স্প্যামের জন্য
const commands = new Map(); // ডাইনামিক কমান্ডের জন্য

// --- ৩. অটো কমান্ড স্ক্যানার (Dynamic Loader) ---
const cmdPath = path.join(__dirname, 'cmd');
if (!fs.existsSync(cmdPath)) fs.mkdirSync(cmdPath);

const commandFiles = fs.readdirSync(cmdPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const commandName = file.split('.')[0].toLowerCase();
    const commandModule = require(path.join(cmdPath, file));
    commands.set(commandName, commandModule);
}
console.log(`✨ [System] Loaded ${commands.size} commands: ${Array.from(commands.keys()).join(', ')}`);

// --- ৪. ডাটাবেজ কানেকশন ---
const userSchema = new mongoose.Schema({
    psid: { type: String, required: true, unique: true },
    isFollower: { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false },
    lastInteraction: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

mongoose.connect(process.env.MONGODB_URI || config.mongoURI)
    .then(() => console.log('✅ [Database] MongoDB Connected'))
    .catch(err => console.error('❌ [Database] Connection Error:', err.message));

// --- ৫. ফেসবুক ওয়েবহুক ভেরিফিকেশন ---
app.get('/webhook', (req, res) => {
    const token = process.env.FB_VERIFY_TOKEN || config.fbConfig.verifyToken;
    if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === token) {
        res.status(200).send(req.query['hub.challenge']);
    } else {
        res.sendStatus(403);
    }
});

// --- ৬. মেইন মেসেজ রিসিভার ---
app.post('/webhook', async (req, res) => {
    const body = req.body;
    if (body.object === 'page') {
        body.entry.forEach(async (entry) => {
            const webhook_event = entry.messaging[0];

            // টেক্সট মেসেজ হ্যান্ডলার
            if (webhook_event.message && webhook_event.message.text) {
                await handleCoreLogic(webhook_event.sender.id, webhook_event.message.text.trim());
            }

            // পোস্টব্যাক হ্যান্ডলার (Get Started বাটন ও অন্যান্য বাটন ক্লিক)
            if (webhook_event.postback) {
                await handlePostback(webhook_event.sender.id, webhook_event.postback.payload);
            }
        });
        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
});

// --- ৭. কোর ইঞ্জিন (Security & Logic) ---
async function handleCoreLogic(psid, text) {
    try {
        let user = await User.findOne({ psid }) || await User.create({ psid });

        // ব্যান চেক
        if (user.isBanned) {
            return await sendFBMessage(psid, "🚫 তোমাকে ব্যান করা হয়েছে। মানুষের মতো ব্যবহার শিখলে আনব্যান করার কথা ভাবা যাবে। 💅");
        }

        // এন্টি-স্প্যাম গেটওয়ে
        if (config.antiSpam.enabled) {
            const now = Date.now();
            const lastTime = userCooldowns.get(psid) || 0;
            if (now - lastTime < config.antiSpam.cooldownSeconds * 1000) {
                return await sendFBMessage(psid, config.antiSpam.warningMessage);
            }
            userCooldowns.set(psid, now);
        }

        // ফলোয়ার চেকিং
        if (!user.isFollower) {
            const following = await checkMetaFollowStatus(psid);
            if (!following) {
                return await sendFBMessage(psid, `👋 হ্যালো! আমি ${config.botName}। আমার বুদ্ধি দেখতে হলে আগে পেজটি ফলো করো, তারপর মেসেজ দাও! 🙄`);
            }
            user.isFollower = true;
            await user.save();
        }

        // ডাইনামিক কমান্ড হ্যান্ডলার (Prefix check)
        if (text.startsWith(config.prefix)) {
            const args = text.slice(config.prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();

            if (commands.has(commandName)) {
                // এডমিন পারমিশন চেক
                if (config.adminOnlyCommands.includes(commandName) && !config.admins.includes(psid)) {
                    return await sendFBMessage(psid, "⚠️ এই কমান্ডটি বড়দের (Admin) জন্য। তুমি দূরে গিয়ে খেলো! 💅");
                }
                const cmdFile = commands.get(commandName);
                return await cmdFile.execute(psid, args, config, sendFBMessage);
            }
        }

        // জেনারেল চ্যাট (Satirical AI)
        if (config.aiPaused) {
            return await sendFBMessage(psid, "⏸️ AI রিপ্লাই সাময়িকভাবে বন্ধ আছে। একটু পর চেষ্টা করো।");
        }
        await handleAIResponse(psid, text);

    } catch (error) {
        console.error("🔥 [Error]:", error.message);
        await sendFBMessage(psid, "🧠 আমার সার্কিটে জং ধরেছে মনে হয়, একটু পর চেষ্টা করো।");
    }
}

// --- ৮. পোস্টব্যাক হ্যান্ডলার (Get Started & Button Clicks) ---

async function handlePostback(psid, payload) {
    try {
        let user = await User.findOne({ psid }) || await User.create({ psid });

        if (payload === 'GET_STARTED') {
            user.isFollower = true;
            await user.save();
            return await sendFBMessage(psid,
`👋 স্বাগতম ${config.botName} এ!

আমি একটি স্যাটিরিক্যাল এআই — বুদ্ধিমান, মজাদার, এবং সামান্য রোস্টিং-প্রিয়। 😄

🔹 যেকোনো প্রশ্ন সরাসরি লিখে পাঠাও।
🔹 কমান্ড দেখতে লিখো: ${config.prefix}help

চলো শুরু করি! 🚀`);
        }

        // অন্য পেলোড থাকলে সাধারণ মেসেজ হিসেবে প্রসেস করো
        await handleCoreLogic(psid, payload);

    } catch (error) {
        console.error("🔥 [Postback Error]:", error.message);
    }
}


// --- ৯. স্যাটিরিক্যাল এআই রেসপন্স (Gemini) ---
async function handleAIResponse(psid, text) {
    try {
        const model = genAI.getGenerativeModel({ 
            model: config.gemini.model || "gemini-1.5-flash",
            systemInstruction: config.gemini.systemPrompt // Satire personality from config
        });

        const chat = model.startChat({
            generationConfig: {
                temperature: config.gemini.temperature || 0.8,
                maxOutputTokens: config.gemini.maxOutputTokens || 1024,
            }
        });

        const result = await chat.sendMessage(text);
        await sendFBMessage(psid, result.response.text());
    } catch (err) {
        console.error("❌ [Gemini Error]:", err.message);
        await sendFBMessage(psid, "🙄 এআই এখন ঘুমাচ্ছে, পরে বিরক্ত করো।");
    }
}

// --- ৯. মেটা গ্রাফ এপিআই (Check Status) ---
async function checkMetaFollowStatus(psid) {
    try {
        const res = await axios.get(`https://graph.facebook.com/${psid}`, {
            params: {
                fields: 'first_name',
                access_token: process.env.FB_PAGE_TOKEN || config.fbConfig.pageToken
            }
        });
        return !!res.data.first_name;
    } catch (err) { return false; }
}

// --- ১০. মেসেজ সেন্ডার ---
async function sendFBMessage(psid, text) {
    try {
        await axios.post(`https://graph.facebook.com/v21.0/me/messages`, {
            recipient: { id: psid },
            message: { text }
        }, {
            params: { access_token: process.env.FB_PAGE_TOKEN || config.fbConfig.pageToken }
        });
    } catch (err) { console.error("❌ [FB Error]:", err.response?.data || err.message); }
}

// ১১. ক্রাশ প্রোটেকশন
process.on('uncaughtException', (err) => console.error('🔥 Critical Failure:', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 ${config.botName} is LIVE on Port ${PORT}`));
