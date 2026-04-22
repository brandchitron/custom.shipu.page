/**
 * Command: admin
 * Description: Admin Control Panel / Developer Biodata
 * Location: cmd/admin.js
 */

const mongoose = require('mongoose');

module.exports = {
    execute: async (psid, args, config, sendFBMessage) => {
        try {
            const User = mongoose.model('User');
            const isAdmin = config.admins.includes(psid);

            // ---------------------------------------------------------
            // ১. সাধারণ ইউজার ইন্টারফেস (Developer Biodata)
            // ---------------------------------------------------------
            if (!isAdmin) {
                const devBio = 
`👤 —— [ DEVELOPER PROFILE ] —— 👤

👋 হ্যালো! আমি চিত্রণ ভট্টাচার্য আদি, এই বটের নির্মাতা। আমার সম্পর্কে কিছু তথ্য নিচে দেওয়া হলো:

▪️ নাম: চিত্রণ ভট্টাচার্য (Adi)
▪️ পেশা: Full-stack Developer (PHP, Node.js, UI/UX)
▪️ বয়স: ২১ বছর
▪️ ঠিকানা: ময়মনসিংহ, বাংলাদেশ
▪️ দক্ষতা: Chatbot Automation, API Integration, Web development, Politics.

🔗 যোগাযোগ:
🔹 Facebook: facebook.com/ssfadi
🔹 GitHub: github.com/brandchitron
🔹 WhatsApp: wa.me/+8801316655254

"প্রযুক্তি আর সৃজনশীলতার মেলবন্ধনেই আমার পথচলা।"
━━━━━━━━━━━━━━━━━━━━
বট নিয়ে কোনো অভিযোগ বা পরামর্শ থাকলে সরাসরি নক দিতে পারেন।`;
                return await sendFBMessage(psid, devBio);
            }

            // ---------------------------------------------------------
            // ২. অ্যাডমিন প্যানেল (Admin Tools)
            // ---------------------------------------------------------
            const subCommand = args[0] ? args[0].toLowerCase() : null;

            // মেনু (যদি শুধু /admin লিখে)
            if (!subCommand) {
                const adminMenu = 
`🛡️ —— [ ADMIN DASHBOARD ] —— 🛡️

স্বাগতম অ্যাডমিন! আপনার পাওয়ারফুল টুলসগুলো নিচে দেওয়া হলো:

📊 [ মেইন টুলস ]
▪️ ${config.prefix}admin stats - বটের লাইভ রিপোর্ট।
▪️ ${config.prefix}admin broadcast <msg> - সবাইকে মেসেজ দিন।

🚫 [ ইউজার ম্যানেজমেন্ট ]
▪️ ${config.prefix}admin ban <PSID> - ইউজার ব্যান করুন।
▪️ ${config.prefix}admin unban <PSID> - ব্যান মুক্ত করুন।

⚙️ [ সেটিংস ]
▪️ ${config.prefix}admin list - অ্যাডমিনদের তালিকা।
▪️ ${config.prefix}admin pause - এআই রিপ্লাই সাময়িক বন্ধ/চালু।

💡 টিপস: PSID পেতে ইউজারের প্রোফাইল বা ডাটাবেজ চেক করুন।`;
                return await sendFBMessage(psid, adminMenu);
            }

            // --- Sub-Command: Stats ---
            if (subCommand === 'stats') {
                const total = await User.countDocuments();
                const banned = await User.countDocuments({ isBanned: true });
                const followers = await User.countDocuments({ isFollower: true });
                
                return await sendFBMessage(psid, 
`📊 [ REAL-TIME STATS ]
━━━━━━━━━━━━━━━━━━━━
▪️ মোট ইউজার: ${total}
▪️ একটিভ ফলোয়ার: ${followers}
▪️ ব্যান হওয়া ইউজার: ${banned}
▪️ ডাটাবেজ স্ট্যাটাস: Connected ✅`);
            }

            // --- Sub-Command: Broadcast ---
            if (subCommand === 'broadcast') {
                const broadcastMsg = args.slice(1).join(" ");
                if (!broadcastMsg) return await sendFBMessage(psid, "❌ মেসেজটি লিখুন। উদাহরণ: /admin broadcast হাই সবাই!");

                const allUsers = await User.find({}, 'psid');
                let count = 0;

                await sendFBMessage(psid, `📢 ব্রডকাস্ট শুরু হয়েছে ${allUsers.length} জন ইউজারের কাছে...`);

                for (const user of allUsers) {
                    try {
                        await sendFBMessage(user.psid, `📢 [ ANNOUNCEMENT ]\n\n${broadcastMsg}`);
                        count++;
                    } catch (e) { /* Skip if blocked */ }
                }

                return await sendFBMessage(psid, `✅ ব্রডকাস্ট সফল! মোট ${count} জনকে পাঠানো হয়েছে।`);
            }

            // --- Sub-Command: Ban/Unban ---
            if (subCommand === 'ban' || subCommand === 'unban') {
                const targetID = args[1];
                if (!targetID) return await sendFBMessage(psid, "❌ ইউজার PSID প্রদান করুন।");

                const status = (subCommand === 'ban');
                const result = await User.findOneAndUpdate({ psid: targetID }, { isBanned: status });

                if (result) {
                    return await sendFBMessage(psid, `✅ ইউজার ${targetID} কে ${status ? 'ব্যান' : 'আনব্যান'} করা হয়েছে।`);
                } else {
                    return await sendFBMessage(psid, "❌ এই আইডির কোনো ইউজার ডাটাবেজে পাওয়া যায়নি।");
                }
            }

            // --- Sub-Command: Pause/Resume AI ---
            if (subCommand === 'pause') {
                config.aiPaused = !config.aiPaused;
                const state = config.aiPaused ? 'বন্ধ ⏸️' : 'চালু ▶️';
                return await sendFBMessage(psid, `🤖 AI রিপ্লাই এখন ${state} করা হয়েছে।`);
            }

            // --- Sub-Command: Admin List ---
            if (subCommand === 'list') {
                const admins = config.admins.join("\n▪️ ");
                return await sendFBMessage(psid, `👥 [ ADMIN LIST ]\n━━━━━━━━━━━━━━━━━━━━\n▪️ ${admins}`);
            }

        } catch (error) {
            console.error("Error in admin.js:", error.message);
            await sendFBMessage(psid, "⚠️ অ্যাডমিন মডিউলে এরর হয়েছে। লজিক চেক করুন।");
        }
    }
};
