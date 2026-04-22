/**
 * Command: info
 * Description: Displays advanced system status and bot information.
 * Location: cmd/info.js
 */

const os = require('os');
const mongoose = require('mongoose');

module.exports = {
    execute: async (psid, args, config, sendFBMessage) => {
        try {
            // ১. সিস্টেম স্ট্যাটাস ক্যালকুলেশন
            const uptimeSeconds = process.uptime();
            const days = Math.floor(uptimeSeconds / (3600 * 24));
            const hours = Math.floor((uptimeSeconds % (3600 * 24)) / 3600);
            const minutes = Math.floor((uptimeSeconds % 3600) / 60);
            
            const uptimeString = `${days}d ${hours}h ${minutes}m`;
            const ramUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
            const totalRam = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
            
            // ২. ডাটাবেজ থেকে ইউজার পরিসংখ্যান
            const User = mongoose.model('User');
            const totalUsers = await User.countDocuments();
            const activeFollowers = await User.countDocuments({ isFollower: true });

            // ৩. মেসেজ ডিজাইন (Minimalist & Aesthetic Style)
            const infoMessage = 
`✨ —— [ ${config.botName} STATUS ] —— ✨

🤖 SYSTEM INFO
━━━━━━━━━━━━━━━━━━━━
▪️ Platform: ${os.platform()} (${os.arch()})
▪️ Uptime: ${uptimeString}
▪️ RAM: ${ramUsage}MB / ${totalRam}GB
▪️ Node Version: ${process.version}
▪️ Latency: ${Date.now() - Date.now()}ms

📊 BOT STATISTICS
━━━━━━━━━━━━━━━━━━━━
▪️ Total Users: ${totalUsers}
▪️ Active Followers: ${activeFollowers}
▪️ Engine: Gemini 1.5 Flash
▪️ Database: MongoDB Atlas

👤 DEVELOPER INFO
━━━━━━━━━━━━━━━━━━━━
▪️ Dev: Chitron Bhattacharjee (Adi)
▪️ Location: Mymensingh, BD
▪️ Status: Active Development

💡 Tip: Use ${config.prefix}help to see all commands.
━━━━━━━━━━━━━━━━━━━━
© 2026 ShiPu AI | All Rights Reserved.`;

            // ৪. মেসেজ পাঠানো
            await sendFBMessage(psid, infoMessage);

        } catch (error) {
            console.error("Error in info.js:", error.message);
            await sendFBMessage(psid, "⚠️ সিস্টেম ইনফো লোড করতে সমস্যা হচ্ছে। কিছুক্ষণ পর চেষ্টা করুন।");
        }
    }
};
