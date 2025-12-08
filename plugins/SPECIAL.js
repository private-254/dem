import axios from 'axios';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getSetting } from '../lib/database.js';
import moment from 'moment';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataFilePath = path.join(__dirname, '..', 'data', 'messageCount.json');

function loadMessageCounts() {
    if (fs.existsSync(dataFilePath)) {
        const data = fs.readFileSync(dataFilePath);
        return JSON.parse(data);
    }

    // Create default structure with isPublic synced from database
    const currentMode = getSetting('mode', 'public');
    return {
        isPublic: currentMode === 'public',
        messageCount: {}
    };
}

function saveMessageCounts(messageCounts) {
    const dataDir = path.dirname(dataFilePath);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    // Always sync isPublic with database when saving
    const currentMode = getSetting('mode', 'public');
    messageCounts.isPublic = (currentMode === 'public');

    fs.writeFileSync(dataFilePath, JSON.stringify(messageCounts, null, 2));
}

function incrementMessageCount(groupId, userId) {
    const messageCounts = loadMessageCounts();
    // Ensure messageCount object exists
    if (!messageCounts.messageCount) {
        messageCounts.messageCount = {};
    }
    if (!messageCounts.messageCount[groupId]) {
        messageCounts.messageCount[groupId] = {};
    }
    if (!messageCounts.messageCount[groupId][userId]) {
        messageCounts.messageCount[groupId][userId] = 0;
    }
    messageCounts.messageCount[groupId][userId] += 1;
    saveMessageCounts(messageCounts);
}

// Add this function to sync isPublic when mode changes
function syncMode() {
    try {
        const messageCounts = loadMessageCounts();
        saveMessageCounts(messageCounts); // This will sync isPublic automatically
        console.log('Synced messageCount.json with database mode');
    } catch (error) {
        console.error('Error syncing messageCount mode:', error);
    }
}

function resetUserCount(groupId, userId) {
    try {
        const messageCounts = loadMessageCounts();

        if (messageCounts.messageCount && messageCounts.messageCount[groupId]) {
            delete messageCounts.messageCount[groupId][userId];
            saveMessageCounts(messageCounts);
            console.log(`Reset message count for ${userId} in ${groupId}`);
        }
    } catch (error) {
        console.error('Error resetting user count:', error);
    }
}

export default [ 
    {
        name: 'topmembers',
        aliases: ['top', 'leaderboard'],
        category: 'group',
        description: 'Show top members by message count',
        usage: '.topmembers',
        execute: async (sock, message, args, context) => {
            const { chatId, reply } = context;
            if (!chatId.endsWith('@g.us')) {
                return await reply('This command is only available in group chats.');
            }
            try {
                const messageCounts = loadMessageCounts();

                // Handle both old and new structure
                const groupCounts = messageCounts.messageCount ? 
                    messageCounts.messageCount[chatId] || {} : 
                    messageCounts[chatId] || {};

                const sortedMembers = Object.entries(groupCounts)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5);

                if (sortedMembers.length === 0) {
                    return await reply('No message activity recorded yet.');
                }

                let responseMessage = 'Top Members Based on Message Count:\n\n';
                sortedMembers.forEach(([userId, count], index) => {
                    const rank = index === 0 ? '1st' : index === 1 ? '2nd' : index === 2 ? '3rd' : `${index + 1}th`;
                    responseMessage += `${rank}. @${userId.split('@')[0]} - ${count} messages\n`;
                });

                await sock.sendMessage(chatId, { 
                    text: responseMessage, 
                    mentions: sortedMembers.map(([userId]) => userId),
                    ...context.channelInfo
                });
            } catch (error) {
                console.error('Error in topmembers:', error);
                await reply('Failed to get top members list.');
            }
        }
    },
    {
        name: "github",
        aliases: ["repo","script"],
        description: "Get DAVE-MD repository information",
        category: "UTILITY MENU",
        usage: ".github",
        async execute(sock, m, args, context) {
            try {
                // Fetch repo info with correct username
                const res = await fetch('https://api.github.com/repos/gifteddevsmd/DAVE-MD2', {
                    headers: { 'User-Agent': 'DAVE-MD-Bot' }
                });

                if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);

                const repo = await res.json();

                let caption = `DAVE-MD Repository Information\n\n`;
                caption += `Name: ${repo.name}\n`;
                caption += `Owner: ${repo.owner.login}\n`;
                caption += `Private: ${repo.private ? 'Yes' : 'No'}\n`;
                caption += `Size: ${(repo.size / 1024).toFixed(2)} MB\n`;
                caption += `Stars: ${repo.stargazers_count}\n`;
                caption += `Forks: ${repo.forks_count}\n`;
                caption += `Watchers: ${repo.watchers_count}\n`;
                caption += `Last Updated: ${moment(repo.updated_at).format('DD/MM/YY - HH:mm:ss')}\n`;
                caption += `URL: ${repo.html_url}\n\n`;
                caption += `Don't forget to star the repo.`;

                // Send repo info
                const infoMsg = await context.replyPlain(caption, { quoted: m });

                // Download the repo zip
                const zipUrl = `https://github.com/gifteddevsmd/DAVE-MD2/archive/refs/heads/main.zip`;
                const zipPath = path.join(__dirname, "../tmp/repo.zip");
                fs.mkdirSync(path.dirname(zipPath), { recursive: true });

                const response = await axios.get(zipUrl, {
                    responseType: "arraybuffer",
                    headers: { "User-Agent": "DAVE-MD" }
                });

                fs.writeFileSync(zipPath, response.data);

                // Send ZIP as document
                await context.replyPlain({
                    document: fs.readFileSync(zipPath),
                    mimetype: "application/zip",
                    fileName: `${repo.name}.zip`
                }, { quoted: infoMsg });

                // Cleanup
                fs.unlinkSync(zipPath);

            } catch (error) {
                console.error('GitHub Command Error:', error);
                await context.reply('Failed to fetch repository information. Please try again later.', { quoted: m });
            }
        }
    }
];

export { incrementMessageCount, syncMode, resetUserCount };