/**
 * Command: uid
 * Description: Returns the sender's Facebook PSID.
 *              Useful for admins to find their own PSID for config.json setup.
 * Usage: /id
 * Location: cmd/uid.js
 */

module.exports = {
    execute: async (psid, args, config, sendFBMessage) => {
        try {
            const isAdmin = config.admins.includes(psid);

            await sendFBMessage(psid,
`🪪 YOUR FACEBOOK PSID
━━━━━━━━━━━━━━━━━━━━
▪️ PSID: ${psid}
▪️ Admin: ${isAdmin ? 'হ্যাঁ ✅' : 'না ❌'}

💡 এই PSID টি database এর "admins" অ্যারেতে যোগ করলে আপনি অ্যাডমিন অ্যাক্সেস পাবেন।`);

        } catch (error) {
            console.error("Error in id.js:", error.message);
            await sendFBMessage(psid, "⚠️ আইডি লোড করতে সমস্যা হচ্ছে।");
        }
    }
};
