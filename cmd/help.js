/**
 * Command: help
 * Description: Displays a categorized menu of all available commands.
 * Location: cmd/help.js
 */

module.exports = {
    execute: async (psid, args, config, sendFBMessage) => {
        try {
            // ১. অ্যাডমিন স্ট্যাটাস চেক
            const isAdmin = config.admins.includes(psid);
            
            // ২. ডাইনামিক কমান্ড লিস্ট জেনারেশন
            // আপনি চাইলে config.json থেকেও ডাইনামিকলি রিড করতে পারেন, তবে হার্ডকোড করলে ডেসক্রিপশন সুন্দর হয়।
            
            let helpMenu = `✨ —— [ ${config.botName} HELP ] —— ✨\n\n`;
            
            helpMenu += `👋 হ্যালো! আমি ${config.botName}, আপনার স্মার্ট ফেসবুক অ্যাসিস্ট্যান্ট। আমাকে কমান্ড দিতে '${config.prefix}' প্রিপিক্স ব্যবহার করুন।\n\n`;

            // ক্যাটাগরি: সাধারণ কমান্ড
            helpMenu += `🌟 [ সাধারণ কমান্ড ]\n`;
            helpMenu += `━━━━━━━━━━━━━━━━━━━━\n`;
            helpMenu += `🔹 ${config.prefix}help : হেল্প মেনু দেখুন।\n`;
            helpMenu += `🔹 ${config.prefix}info : বটের কারিগরি তথ্য জানুন।\n\n`;

            // ক্যাটাগরি: এআই ফিচার
            helpMenu += `🧠 [ AI ফিচার ]\n`;
            helpMenu += `━━━━━━━━━━━━━━━━━━━━\n`;
            helpMenu += `🔹 ${config.prefix}bot <প্রশ্ন> : জিমিনি এআই এর সাথে সরাসরি কথা বলুন।\n`;
            helpMenu += `🔹 [সরাসরি মেসেজ] : কমান্ড ছাড়াও আমি জিমিনি এআই দিয়ে আপনার উত্তর দিতে পারি।\n\n`;

            // ক্যাটাগরি: অ্যাডমিন প্যানেল (শুধুমাত্র অ্যাডমিনরা দেখবে)
            if (isAdmin) {
                helpMenu += `🛡️ [ অ্যাডমিন প্যানেল ]\n`;
                helpMenu += `━━━━━━━━━━━━━━━━━━━━\n`;
                helpMenu += `🔸 ${config.prefix}admin stats : বটের মেমোরি ও ইউজার স্ট্যাটাস।\n`;
                helpMenu += `🔸 ${config.prefix}admin broadcast <টেক্সট> : সকল ইউজারকে মেসেজ পাঠান।\n\n`;
            }

            // ফুটার অংশ
            helpMenu += `📝 [ নোট ]\n`;
            helpMenu += `━━━━━━━━━━━━━━━━━━━━\n`;
            helpMenu += `বটটি সঠিকভাবে কাজ না করলে বা কোনো ফিডব্যাক থাকলে আমাদের ডেভেলপারকে জানান।\n\n`;
            helpMenu += `💡 প্রবাদ: "প্রযুক্তি যখন সৃজনশীলতা পায়, তখনই জাদু ঘটে।"\n`;
            helpMenu += `━━━━━━━━━━━━━━━━━━━━\n`;
            helpMenu += `© 2026 ${config.botName} | Powered by Gemini 1.5 Flash`;

            // ৩. মেসেজ পাঠানো
            await sendFBMessage(psid, helpMenu);

        } catch (error) {
            console.error("Error in help.js:", error.message);
            await sendFBMessage(psid, "⚠️ হেল্প মেনু লোড করতে সমস্যা হচ্ছে। কিছুক্ষণ পর চেষ্টা করুন।");
        }
    }
};
