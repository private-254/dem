const fs = require('fs');
const path = require('path');
const settings = require("../settings");
const os = require("os");

// Store bot start time
const botStartTime = Date.now();

// Platform detection function
const detectPlatform = () => {
  if (process.env.DYNO) return "Heroku";
  if (process.env.RENDER) return "Render";
  if (process.env.PREFIX && process.env.PREFIX.includes("termux")) return "Termux";
  if (process.env.PORTS && process.env.CYPHERX_HOST_ID) return "CypherX Platform";
  if (process.env.P_SERVER_UUID) return "Panel";
  if (process.env.LXC) return "Linux Container (LXC)";

  switch (os.platform()) {
    case "win32": return "Windows";
    case "darwin": return "macOS";
    case "linux": return "Linux";
    default: return "Unknown";
  }
};

// Format uptime function
function formatUptime(uptime) {
    const seconds = Math.floor(uptime / 1000);
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    const secs = seconds % 60;

    const parts = [];
    if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
    if (hours > 0) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
    if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs} second${secs > 1 ? 's' : ''}`);

    return parts.join(', ');
}

async function aliveCommand(sock, chatId, message) {
    try {
        const uptime = Date.now() - botStartTime;
        const formattedUptime = formatUptime(uptime);
        const hostName = detectPlatform();

        const message1 = `╔═══════════════════════\n` +
                        `║      DAVE-MD STATUS\n` +
                        `╠═══════════════════════\n` +
                        `║ UPTIME: ${formattedUptime}\n` +
                        `║ PLATFORM: ${hostName}\n` +
                        `║ VERSION: ${settings.version || '2.0.0'}\n` +
                        `║ DEVELOPER: Dave\n` +
                        `║ WEBSITE: davexsite-sable.vercel.app\n` +
                        `╚═══════════════════════`;
        
        // Read menu1 image
        const imgPath = path.join(__dirname, '../assets/menu1.jpg');
        const imgBuffer = fs.readFileSync(imgPath);
        
        // Send message with image
        await sock.sendMessage(chatId, {
            image: imgBuffer,
            caption: message1
        }, { quoted: message });

    } catch (error) {
        console.error('Error in alive command:', error);
        // Fallback simple message
        await sock.sendMessage(chatId, { 
            text: 'DAVE-MD is alive and running!\n\nVisit: https://davexsite-sable.vercel.app/' 
        }, { quoted: message });
    }
}

module.exports = aliveCommand;