const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { UploadFileUgu } = require('../lib/uploader');

const DEBUG = true;

function debugLog(message, data = null) {
    if (DEBUG) {
        console.log(`[SHAZAM] ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
}

async function getMediaBuffer(message, type) {
    try {
        debugLog(`Checking for ${type} media...`);
        const m = message.message || {};
        let messageType, fileExt, downloadType;

        switch (type) {
            case 'audio':
                if (m.audioMessage) {
                    messageType = m.audioMessage;
                    fileExt = '.mp3';
                    downloadType = 'audio';
                    debugLog('Found audio message');
                }
                break;
            case 'video':
                if (m.videoMessage) {
                    messageType = m.videoMessage;
                    fileExt = '.mp4';
                    downloadType = 'video';
                    debugLog('Found video message');
                }
                break;
            case 'image':
                if (m.imageMessage) {
                    messageType = m.imageMessage;
                    fileExt = '.jpg';
                    downloadType = 'image';
                    debugLog('Found image message');
                }
                break;
        }

        if (messageType) {
            debugLog(`Downloading ${type} content...`);
            const stream = await downloadContentFromMessage(messageType, downloadType);
            const chunks = [];
            for await (const chunk of stream) {
                chunks.push(chunk);
            }
            const buffer = Buffer.concat(chunks);
            debugLog(`Downloaded ${type} buffer size:`, { size: buffer.length, type });
            return { buffer, ext: fileExt, type };
        }

        debugLog(`No ${type} message found`);
        return null;
    } catch (error) {
        console.error(`[SHAZAM] Error getting ${type} buffer:`, error.message);
        return null;
    }
}

async function getQuotedMediaBuffer(message, type) {
    try {
        debugLog(`Checking quoted message for ${type}...`);
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
        if (!quoted) {
            debugLog('No quoted message found');
            return null;
        }
        debugLog('Found quoted message, checking for media...');
        return await getMediaBuffer({ message: quoted }, type);
    } catch (error) {
        console.error(`[SHAZAM] Error getting quoted ${type} buffer:`, error.message);
        return null;
    }
}

async function getAllMediaBuffers(message) {
    debugLog('Scanning for all media types...');
    const mediaTypes = ['audio', 'video', 'image'];

    // Check current message
    for (const type of mediaTypes) {
        const media = await getMediaBuffer(message, type);
        if (media) {
            debugLog(`Found media in current message:`, { type: media.type, size: media.buffer.length });
            return media;
        }
    }

    debugLog('No media found in current message, checking quoted...');

    // Check quoted message
    for (const type of mediaTypes) {
        const media = await getQuotedMediaBuffer(message, type);
        if (media) {
            debugLog(`Found media in quoted message:`, { type: media.type, size: media.buffer.length });
            return media;
        }
    }

    debugLog('No media found in current or quoted message');
    return null;
}

async function shazamCommand(sock, chatId, message) {
    let tempPath = null;

    try {
        debugLog('Shazam command started', { chatId, messageId: message.key.id });

        await sock.sendMessage(chatId, {
            react: { text: '🔍', key: message.key }
        });

        const media = await getAllMediaBuffers(message);

        if (!media) {
            await sock.sendMessage(chatId, {
                text: '_Send or reply to audio/video to identify music._'
            }, { quoted: message });
            return;
        }

        const tempDir = path.join(__dirname, '../temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        tempPath = path.join(tempDir, `${Date.now()}_${media.type}${media.ext}`);
        fs.writeFileSync(tempPath, media.buffer);

        let mediaUrl = '';
        try {
            const res = await UploadFileUgu(tempPath);
            
            if (typeof res === 'string') {
                mediaUrl = res;
            } else if (res.url) {
                mediaUrl = res.url;
            } else if (res.url_full) {
                mediaUrl = res.url_full;
            } else if (res.data?.url) {
                mediaUrl = res.data.url;
            } else if (res.data?.url_full) {
                mediaUrl = res.data.url_full;
            }

            if (!mediaUrl) {
                await sock.sendMessage(chatId, { text: '_Upload failed. Try again._' }, { quoted: message });
                return;
            }
        } catch (uploadError) {
            console.error('[SHAZAM] Upload error:', uploadError);
            await sock.sendMessage(chatId, { text: '_Upload error. Try another file._' }, { quoted: message });
            return;
        }

        let resultText = '';
        try {
            const response = await axios.get(`https://apiskeith.vercel.app/ai/shazam`, {
                params: { url: mediaUrl },
                timeout: 30000
            });

            const song = response.data?.result || response.data;

            if (song && (song.title || song.artists)) {
                resultText = `_🎶 SONG FOUND_\n\n` +
                             `_🎵 Title:_ ${song.title || 'Unknown'}\n` +
                             `_🎤 Artist:_ ${song.artists || 'Unknown'}\n` +
                             `_💿 Album:_ ${song.album || 'N/A'}\n` +
                             `_📅 Release:_ ${song.release_date || 'N/A'}\n\n` +
                             `_🤖 Powered by DAVE-MD_`;
            } else {
                resultText = `_❌ Song not recognized. Try different audio._`;
            }
        } catch (apiError) {
            console.error('[SHAZAM] API error:', apiError.message);
            
            if (apiError.code === 'ECONNREFUSED') {
                resultText = `_❌ Service unavailable. Try later._`;
            } else if (apiError.response?.status === 404) {
                resultText = `_❌ No match found._`;
            } else {
                resultText = `_❌ Recognition failed._`;
            }
        }

        await sock.sendMessage(chatId, { text: resultText }, { quoted: message });

    } catch (error) {
        console.error('[SHAZAM] General error:', error.message);
        await sock.sendMessage(chatId, {
            text: `_❌ Processing error. Try again._`
        }, { quoted: message });
    } finally {
        if (tempPath && fs.existsSync(tempPath)) {
            try {
                fs.unlinkSync(tempPath);
            } catch (cleanupError) {
                console.error('[SHAZAM] Cleanup error:', cleanupError.message);
            }
        }
    }
}

module.exports = shazamCommand;