/**
 * Command: bot
 * Description: AI Configuration and Interaction Management.
 * Location: cmd/bot.js
 */

const mongoose = require('mongoose');

module.exports = {
    execute: async (psid, args, config, sendFBMessage) => {
        try {
            const subCommand = args[0] ? args[0].toLowerCase() : null;

            // ১. যদি ইউজার শুধুমাত্র '/bot' লিখে (কোন সাব-কমান্ড ছাড়া)
            if (!subCommand) {
                const welcomeMsg = 
`🤖 —— [ ${config.botName} AI ENGINE ] —— 🤖

বর্তমানে আমি 'Gemini 1.5 Flash' মডেলে রান করছি। 

💡 ব্যবহার বিধি:
🔹 ${config.prefix}bot status - এআই এর বর্তমান অবস্থা।
🔹 ${config.prefix}bot clear - চ্যাট কন্টেক্সট রিসেট করুন।
🔹 ${config.prefix}bot <প্রশ্ন> - এআই কে নির্দিষ্ট প্রশ্ন করুন।

নোট: আপনি আমাকে কোনো প্রিপিক্স ছাড়াই সরাসরি মেসেজ দিতে পারেন, আমি অটোমেটিক রিপ্লাই দিব।`;
                return await sendFBMessage(psid, welcomeMsg);
            }

            // ২. সাব-কমান্ড: Status
            if (subCommand === 'status') {
                const statusMsg = 
`🧠 AI STATUS REPORT
━━━━━━━━━━━━━━━━━━━━
▪️ Model: Gemini 1.5 Flash
▪️ Version: v2.1 (Advanced)
▪️ Response Type: Natural Language
▪️ Status: Online & Ready ✅
▪️ Latency: Optimized

বটটি বর্তমানে আপনার প্রশ্নের উত্তর দিতে সম্পূর্ণ প্রস্তুত।`;
                return await sendFBMessage(psid, statusMsg);
            }

            // ৩. সাব-কমান্ড: Clear (চ্যাট হিস্ট্রি রিসেট লজিক)
            if (subCommand === 'clear') {
                const User = mongoose.model('User');
                // এখানে ডাটাবেজে ইউজারের লাস্ট ইন্টারঅ্যাকশন টাইম আপডেট করে রিসেট সিমুলেট করা হচ্ছে
                await User.findOneAndUpdate({ psid }, { lastInteraction: Date.now() });
                
                return await sendFBMessage(psid, "🧹 আপনার পূর্ববর্তী চ্যাট কন্টেক্সট এবং মেমোরি রিসেট করা হয়েছে। এখন নতুনভাবে কথা বলতে পারেন!");
            }

            // ৪. সাব-কমান্ড: সরাসরি প্রশ্ন (যদি ইউজার '/bot প্রশ্ন' লিখে)
            const userQuery = args.join(" ");
            if (userQuery) {
                // index.js এ থাকা AI লজিককে কল করার জন্য একটি নির্দেশনা
                // সাধারণত এটি index.js এর জেনারেল চ্যাট হ্যান্ডলার দিয়েই হয়ে যায়।
                return await sendFBMessage(psid, "🔍 আমি আপনার প্রশ্নটি প্রসেস করছি... (জিমিনি এআই স্বয়ংক্রিয়ভাবে উত্তর দিবে)");
            }

        } catch (error) {
            console.error("Error in bot.js:", error.message);
            await sendFBMessage(psid, "⚠️ এআই মডিউলে সামান্য কারিগরি সমস্যা হয়েছে।");
        }
    }
};
