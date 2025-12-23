const axios = require('axios');

const processedMessages = new Set();

function createFakeContact(message) {
    return {
        key: {
            participants: "0@s.whatsapp.net",
            remoteJid: "0@s.whatsapp.net",
            fromMe: false
        },
        message: {
            contactMessage: {
                displayName: "DaveX TikTok",
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;TikTok;;;\nFN:DaveX TikTok\nitem1.TEL;waid=${message.key.participant?.split('@')[0] || message.key.remoteJid.split('@')[0]}:${message.key.participant?.split('@')[0] || message.key.remoteJid.split('@')[0]}\nitem1.X-ABLabel:TikTok Bot\nEND:VCARD`
            }
        },
        participant: "0@s.whatsapp.net"
    };
}

async function tiktokCommand(sock, chatId, message) {
    try {
        if (processedMessages.has(message.key.id)) {
            return;
        }
        
        processedMessages.add(message.key.id);
        
        setTimeout(() => {
            processedMessages.delete(message.key.id);
        }, 5 * 60 * 1000);

        const fakeContact = createFakeContact(message);
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        
        if (!text) {
            return await sock.sendMessage(chatId, { 
                text: "TikTok URL required"
            }, { quoted: fakeContact });
        }

        const url = text.replace(/^tt\s+/i, '').trim();
        
        if (!url) {
            return await sock.sendMessage(chatId, { 
                text: "URL required"
            }, { quoted: fakeContact });
        }

        const tiktokPatterns = [
            /https?:\/\/(?:www\.)?tiktok\.com\//,
            /https?:\/\/(?:vm\.)?tiktok\.com\//,
            /https?:\/\/(?:vt\.)?tiktok\.com\//,
            /https?:\/\/(?:www\.)?tiktok\.com\/@/,
            /https?:\/\/(?:www\.)?tiktok\.com\/t\//
        ];

        const isValidUrl = tiktokPatterns.some(pattern => pattern.test(url));
        
        if (!isValidUrl) {
            return await sock.sendMessage(chatId, { 
                text: "Invalid TikTok link"
            }, { quoted: fakeContact });
        }

        await sock.sendMessage(chatId, {
            react: { text: '🕖', key: message.key }
        });

        try {
            const apiUrl = `https://apis-sandarux.zone.id/api/tiktok/tiktokdl?url=${encodeURIComponent(url)}`;
            
            const response = await axios.get(apiUrl, { 
                timeout: 15000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            const data = response.data;

            if (!data || !data.status || !data.result) {
                return await sock.sendMessage(chatId, { 
                    text: "Failed to fetch video"
                }, { quoted: fakeContact });
            }

            const res = data.result;

            if (!res.nowm) {
                return await sock.sendMessage(chatId, { 
                    text: "No video URL found"
                }, { quoted: fakeContact });
            }

            const caption = `TikTok Download\n\n🎄 Merry Christmas\nAuthor: ${res.caption || "Unknown"}\nViews: ${res.stats?.views || "Unknown"}`;

            try {
                const videoResponse = await axios.get(res.nowm, {
                    responseType: 'arraybuffer',
                    timeout: 60000,
                    maxContentLength: 100 * 1024 * 1024,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Accept': 'video/mp4,video/*,*/*;q=0.9'
                    }
                });
                
                const videoBuffer = Buffer.from(videoResponse.data);
                
                if (videoBuffer.length === 0) {
                    throw new Error("Empty video");
                }
                
                await sock.sendMessage(chatId, {
                    video: videoBuffer,
                    caption: caption,
                    mimetype: "video/mp4"
                }, { quoted: fakeContact });

                await sock.sendMessage(chatId, {
                    react: { text: '✅', key: message.key }
                });

            } catch {
                await sock.sendMessage(chatId, {
                    video: { url: res.nowm },
                    caption: caption,
                    mimetype: "video/mp4"
                }, { quoted: fakeContact });

                await sock.sendMessage(chatId, {
                    react: { text: '✅', key: message.key }
                });
            }

        } catch (error) {
            console.error("TikTok Error:", error);
            
            if (error.code === 'ECONNABORTED') {
                await sock.sendMessage(chatId, { 
                    text: "Timeout"
                }, { quoted: fakeContact });
            } else if (error.response?.status === 404) {
                await sock.sendMessage(chatId, { 
                    text: "Video not found"
                }, { quoted: fakeContact });
            } else if (error.response?.status === 403) {
                await sock.sendMessage(chatId, { 
                    text: "Access forbidden"
                }, { quoted: fakeContact });
            } else {
                await sock.sendMessage(chatId, { 
                    text: "Failed to download"
                }, { quoted: fakeContact });
            }
        }
    } catch (error) {
        console.error('TikTok error:', error);
        const fakeContact = createFakeContact(message);
        await sock.sendMessage(chatId, { 
            text: "Unexpected error"
        }, { quoted: fakeContact });
    }
}

module.exports = tiktokCommand;