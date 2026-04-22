/**
 * Command: ping
 * Description: Check bot response time and live status.
 * Usage: /ping
 * Location: cmd/ping.js
 */

module.exports = {
    execute: async (psid, args, config, sendFBMessage) => {
        try {
            const start = Date.now();
            await sendFBMessage(psid, '🏓 পিং করা হচ্ছে...');
            const latency = Date.now() - start;

            await sendFBMessage(psid,
`🏓 PONG!
━━━━━━━━━━━━━━━━━━━━
▪️ Latency: ${latency}ms
▪️ Status: Online ✅
▪️ Engine: ShiPu Ai (Lume V1.0)
▪️ Bot: ${config.botName}`);

        } catch (error) {
            console.error("Error in ping.js:", error.message);
            await sendFBMessage(psid, "⚠️ পিং চেক করতে সমস্যা হচ্ছে।");
        }
    }
};
