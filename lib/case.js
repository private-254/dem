// lib/case.js - Centralized Feature Control Center 🚀
import { getSetting, updateSetting, getChatData, updateChatData } from './database.js';
import { channelInfo } from './messageConfig.js';
import getCommandData from './database.js';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import fs from 'fs';
import { writeFile, unlink, readdir } from 'fs/promises';
import path from 'path';

// Global message store for antidelete
const messageStore = new Map();
const TEMP_MEDIA_DIR = './tmp/antidelete';

// ============================
// 🔹 AUTOEMOJI HANDLER 😂🔥
// ============================
export const handleAutoEmoji = async (sock, message) => {
    try {
        const autoemojiMode = autoemojiSettings.getMode();
        
        if (autoemojiMode === 'off') return;

        const lid = global.ownerLid;
        const chatId = message.key.remoteJid;

        // ✅ GET THE ACTUAL MESSAGE SENDER
        const sender = message.key.fromMe 
            ? sock.user.id 
            : (message.key.participant || message.key.remoteJid);

        const isGroup = chatId.endsWith('@g.us');
        const isFromBot = message.key.fromMe;

        // ✅ CHECK IF MESSAGE IS FROM THE OWNER
        const isFromOwner = sender && lid && (
            sender.includes(lid) || 
            sender === lid + '@s.whatsapp.net' ||
            sender === lid + '@lid'
        );

        if (isFromBot || isFromOwner) {
            return;
        }

        // Mode conditions
        if (autoemojiMode === 'dm' && isGroup) return;
        if (autoemojiMode === 'group' && !isGroup) return;

        // ✅ Emoji list (fallback if DB empty)
        let emojis = autoemojiSettings.getList();
        if (!Array.isArray(emojis) || emojis.length === 0) {
            emojis = autoemojiSettings.defaultEmojis;
        }

        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

        await sock.sendMessage(chatId, {
            text: randomEmoji,
            quoted: message
        });

    } catch (error) {
        console.error('❌ Error in handleAutoEmoji:', error);
    }
};

//==============================//
// 🔹 AUTOEMOJI SETTINGS
//==============================//
const defaultEmojis = ['😂', '🔥', '❤️', '😎', '🥰', '💯', '🤖', '✨', '🙏'];

export const autoemojiSettings = {
    defaultEmojis,

    enable: (mode = 'all') => {
        const validModes = ['dm', 'group', 'all'];
        const selectedMode = validModes.includes(mode) ? mode : 'all';
        return updateSetting('autoemoji', selectedMode);
    },
    disable: () => {
        return updateSetting('autoemoji', 'off');
    },
    reset: () => {
        updateSetting('autoemojiList', defaultEmojis);
        return defaultEmojis;
    },
    isEnabled: () => {
        const status = getSetting('autoemoji', 'off');
        return status !== 'off';
    },
    getMode: () => {
        return getSetting('autoemoji', 'off');
    },
    setList: (list) => {
        if (typeof list === 'string') {
            list = list.split(/[\s,]+/).filter(Boolean);
        }
        return updateSetting('autoemojiList', list);
    },
    getList: () => {
        let list = getSetting('autoemojiList', []);
        if (typeof list === 'string') {
            list = list.split(/[\s,]+/).filter(Boolean);
        }
        return list;
    }
};

//==============================//
// 🔹 ANTILINK HANDLER 🚫
//=============================//
const handleAntilink = async (sock, message, context) => {
    try {
        const { chatId, userMessage, isGroup, isSenderAdmin, isBotAdmin, senderIsSudo } = context;
        
        if (!isGroup) return;
        
        // Check if antilink is enabled
        const antilinkEnabled = getChatData(chatId, 'antilink', false);
        if (!antilinkEnabled) return;
        
        // Get advanced settings from database
        const settings = getCommandData('antilink', chatId, {
            action: 'delete',
            customMessage: '🚫 Link detected and deleted!',
            allowedLinks: []
        });
        
        if (isSenderAdmin || senderIsSudo) return;
        if (!isBotAdmin) return;
        
        // Your existing link detection...
        const linkPatterns = [
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi,
        ];
        
        const hasLink = linkPatterns.some(pattern => pattern.test(userMessage));
        
        if (hasLink) {
            // Check if link is allowed
            const isAllowed = settings.allowedLinks.some(allowed => 
                userMessage.toLowerCase().includes(allowed.toLowerCase())
            );
            
            if (!isAllowed) {
                // Delete message
                await sock.sendMessage(chatId, { delete: message.key });
                
                // Use custom message
                await context.reply(settings.customMessage);
                
                // Handle different actions
                if (settings.action === 'kick') {
                    // Add kick logic here
                } else if (settings.action === 'warn') {
                    // Add warning logic here
                }
            }
        }
        
    } catch (error) {
        console.error('❌ Error in handleAntilink:', error);
    }
};

// ============================================
// 🔹 AUTOREACT HANDLER 😂😍
// ============================================
const handleAutoReaction = async (sock, message) => {  
    try {  
        const autoreactMode = getSetting('autoreact', 'off');  
        if (autoreactMode === 'off') return;  
        
        const chatId = message.key.remoteJid;  
        const isGroup = chatId.endsWith('@g.us');  
        
        // Check mode conditions  
        if (autoreactMode === 'dm' && isGroup) return;  
        if (autoreactMode === 'group' && !isGroup) return;  
        
        // Get emojis from DB
        const reactionEmojis = getSetting('reactionEmojis', ['✅', '❤️', '😊', '👍', '🔥', '💯', '🌟', '⭐']);  
        
        // Pick random emoji  
        const randomEmoji = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];  
        
        // React to the message  
        await sock.sendMessage(chatId, {  
            react: {  
                text: randomEmoji,  
                key: message.key  
            }  
        });  

    } catch (error) {
        console.error('❌ Error in handleAutoReact:', error);
    }
};

// ============================================
// 🔹 AUTOREAD HANDLER 👀
// ============================================
const handleAutoread = async (sock, message) => {
    try {
        const AutoreadEnabled = getSetting('autoread', false);
        
        if (!AutoreadEnabled) return;

        const lid = global.ownerLid;
        
        // ✅ GET THE ACTUAL MESSAGE SENDER
        const sender = message.key.fromMe 
            ? sock.user.id 
            : (message.key.participant || message.key.remoteJid);
        
        const isFromBot = message.key.fromMe;
        
        const isFromOwner = sender && lid && (
            sender.includes(lid) || 
            sender === lid + '@s.whatsapp.net' ||
            sender === lid + '@lid'
        );

        if (isFromBot || isFromOwner) {
            return;
        }

        if (message.key && message.key.remoteJid) {
            await sock.readMessages([message.key]);
        }

    } catch (error) {
        console.error('Error in handleAutoread:', error);
    }
};

// ============================================
// 🔹 AUTOTYPING HANDLER ⌨️
// ============================================
const handleAutoTyping = async (sock, chatId, delay = 2000) => {
    try {
        const autotypingEnabled = getSetting('autotype', false);
        if (!autotypingEnabled) return;
        
        // Show typing indicator
        await sock.sendPresenceUpdate('composing', chatId);
        
        // Stop typing after delay
        setTimeout(async () => {
            try {
                await sock.sendPresenceUpdate('paused', chatId);
            } catch (error) {
                console.error('❌ Error stopping typing:', error);
            }
        }, delay);
        
    } catch (error) {
        console.error('❌ Error in handleAutoTyping:', error);
    }
};

// Add alias for compatibility with main.js
const handleAutotypingForMessage = async (sock, chatId, delay = 2000) => {
    return await handleAutoTyping(sock, chatId, delay);
};

// ============================================
// 🔹 AUTORECORD HANDLER 🎤
// ============================================
const handleAutoRecord = async (sock, chatId, delay = 3000) => {
    try {
        const autorecordEnabled = getSetting('autorecord', false);
        if (!autorecordEnabled) return;
        
        // Show recording indicator
        await sock.sendPresenceUpdate('recording', chatId);
        
        // Stop recording after delay
        setTimeout(async () => {
            try {
                await sock.sendPresenceUpdate('paused', chatId);
            } catch (error) {
                console.error('❌ Error stopping recording:', error);
            }
        }, delay);
        
    } catch (error) {
        console.error('❌ Error in handleAutoRecord:', error);
    }
};

// ============================================
// 🔹 ANTIBADWORD HANDLER ❌
// ============================================
const handleAntibadword = async (sock, message, context) => {
    try {
        const { chatId, userMessage, isGroup, isSenderAdmin, isBotAdmin, senderIsSudo } = context;
        
        // Only work in groups
        if (!isGroup) return;
        
        // Get antibadword settings for this chat
        const antibadwordEnabled = getChatData(chatId, 'antibadword', false);
        if (!antibadwordEnabled) return;
        
        // Skip if sender is admin or sudo
        if (isSenderAdmin || senderIsSudo) return;
        
        // Check if bot has admin permissions
        if (!isBotAdmin) return;
        
        // Bad words list
        const badWords = [
            'fuck', 'shit', 'bitch', 'asshole', 'damn', 'bastard',
            'motherfucker', 'bullshit', 'crap', 'piss', 'whore',
        ];
        
        const hasBadWord = badWords.some(word => 
            userMessage.toLowerCase().includes(word.toLowerCase())
        );
        
        if (hasBadWord) {
            // Delete the message
            await sock.sendMessage(chatId, {
                delete: message.key
            });
            
            // Send warning
            await context.reply('❌ Bad word detected and deleted!\n\n🚫 Please keep the chat clean and respectful.');
        }
        
    } catch (error) {
        console.error('❌ Error in handleAntibadword:', error);
    }
};

// ============================================
// 🔹 AUTOSTATUS HANDLER 👑 (VIEW + REACT TO STATUS)
// ============================================
const handleAutostatus = async (sock, message) => {
    try {
        // Check if auto view status is enabled (default: true)
        const autostatusEnabled = getSetting('autoviewstatus', true);
        if (!autostatusEnabled) return false;
        
        // Check if message is a status
        if (!message.key || !message.key.remoteJid || message.key.remoteJid !== 'status@broadcast') {
            return false;
        }
        
        // Handle ephemeral messages
        if (message.message && Object.keys(message.message)[0] === 'ephemeralMessage') {
            message.message = message.message.ephemeralMessage.message;
        }
        
        if (!message.message) return false;
        
        console.log('📱 Status detected from:', message.key.participant);
        
        // 1. Mark status as viewed (read)
        try {
            await sock.readMessages([message.key]);
            console.log('✅ Status viewed automatically');
        } catch (readError) {
            console.error('❌ Failed to mark status as read:', readError);
        }
        
        // 2. Check if auto react to status is enabled (default: false)
        const autostatusreact = getSetting('autostatusreact', false);
        if (autostatusreact) {
            try {
                // Get custom reaction emojis or use default
                const statusEmojis = getSetting('statusEmojis', ['💙', '❤️', '🌚', '😍', '✅', '🔥', '✨', '⭐', '👍']);
                const randomEmoji = statusEmojis[Math.floor(Math.random() * statusEmojis.length)];
                
                // React to the status
                await sock.sendMessage(
                    'status@broadcast',
                    { react: { text: randomEmoji, key: message.key } },
                    { statusJidList: [message.key.participant] }
                );
                console.log(`✅ Reacted to status with: ${randomEmoji}`);
            } catch (reactError) {
                console.error('❌ Failed to react to status:', reactError);
            }
        }
        
        return true; // Indicate status was handled
        
    } catch (error) {
        console.error('❌ Error in handleAutostatus:', error);
        return false;
    }
};

// Add handleStatusUpdate alias for compatibility
const handleStatusUpdate = async (sock, message) => {
    try {
        return await handleAutostatus(sock, message);
    } catch (error) {
        console.error('❌ Error in handleStatusUpdate:', error);
        return false;
    }
};

// ============================================
// 🔹 AUTOBIO HANDLER ✍️
// ============================================
const handleAutobio = async (sock) => {
    try {
        const autobioEnabled = getSetting('autobio', false);
        if (!autobioEnabled) return;

        // Prepare some random bio texts
        const currentTime = new Date().toLocaleString('en-US', {
            timeZone: getSetting('timezone', 'Africa/Nairobi'),
            hour12: true,
            hour: 'numeric',
            minute: '2-digit',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });

        const bios = [
            `🤖 ${getSetting('botName', 'DAVE-MD')} | ⏰ ${currentTime}`,
            `🚀 Always Active | ⚡ Powered by DAVE-MD`,
            `🔥 ${getSetting('botName', 'DAVE-MD')} on duty 24/7`,
            `💡 Smart Bot, Smart Moves | ${currentTime}`,
            `✨ ${getSetting('botName', 'GIFYY MD')} – Here to serve!`
        ];

        // Pick random one
        const randomBio = bios[Math.floor(Math.random() * bios.length)];

        // Update bio
        await sock.updateProfileStatus(randomBio);
        console.log('✅ Bio updated:', randomBio);

    } catch (error) {
        console.error('❌ Error in handleAutobio:', error);
    }
};

// ============================================
// 🔹 AUTORECORDTYPE HANDLER 🎤⌨️
// ============================================
const handleAutoRecordType = async (sock, chatId, delay = 3000) => {
    try {
        const autorecordtypeMode = getSetting('autorecordtype', 'off');
        if (autorecordtypeMode === 'off') return;
        
        const isGroup = chatId.endsWith('@g.us');
        
        // Check mode conditions
        if (autorecordtypeMode === 'dm' && isGroup) return;
        if (autorecordtypeMode === 'group' && !isGroup) return;
        
        // Show recording indicator first
        await sock.sendPresenceUpdate('recording', chatId);
        
        // Switch to typing after half the delay
        setTimeout(async () => {
            try {
                await sock.sendPresenceUpdate('composing', chatId);
            } catch (error) {
                console.error('❌ Error switching to typing:', error);
            }
        }, delay / 2);
        
        // Stop all activity after full delay
        setTimeout(async () => {
            try {
                await sock.sendPresenceUpdate('paused', chatId);
            } catch (error) {
                console.error('❌ Error stopping record-type:', error);
            }
        }, delay);
        
    } catch (error) {
        console.error('❌ Error in handleAutoRecordType:', error);
    }
};

// ============================================
// 🔹 ANTICALL HANDLER 📞❌
// ============================================
const handleAnticall = async (sock, callData) => {
    try {
        const anticallEnabled = getSetting('anticall', false);
        if (!anticallEnabled) return;
        
        for (const call of callData) {
            if (call.status === 'offer') {
                // Reject the call
                await sock.rejectCall(call.id, call.from);
                
                // Send custom message
                const anticallMsg = getSetting('anticallmsg', 'Sorry, I cannot answer calls right now. Please send a message instead.');
                
                await sock.sendMessage(call.from, {
                    text: anticallMsg,
                    ...channelInfo
                });
                
                console.log('📞 Call rejected from:', call.from);
            }
        }
    } catch (error) {
        console.error('❌ Error in handleAnticall:', error);
    }
};

// ============================================
// 🔹 ANTIDELETE HANDLER 🗑️ (Anti-Delete Messages)
// ============================================
const handleAntidelete = async (sock, message) => {
    try {
        // Check if antidelete is enabled for this chat
        const chatId = message.key.remoteJid;
        const antideleteEnabled = getChatData(chatId, 'antidelete', false);
        
        if (!antideleteEnabled) return false;

        // Store the message
        await storeMessage(sock, message, chatId);
        
        return true;
    } catch (error) {
        console.error('❌ Error in handleAntidelete:', error);
        return false;
    }
};

// ============================================
// 🔹 ANTI-VIEWONCE HANDLER 🔒
// ============================================
const handleViewOnce = async (sock, message) => {
    try {
        const chatId = message.key.remoteJid;
        const antideleteEnabled = getChatData(chatId, 'antidelete', false);
        
        if (!antideleteEnabled) return false;

        // Check if this is a view-once message
        const viewOnceContainer = message.message?.viewOnceMessageV2?.message || 
                                message.message?.viewOnceMessage?.message;
        
        if (!viewOnceContainer) return false;

        // Handle view-once message
        await handleViewOnceMessage(sock, viewOnceContainer, chatId, message);
        
        return true;
    } catch (error) {
        console.error('❌ Error in handleViewOnce:', error);
        return false;
    }
};

// ============================================
// 🔹 MESSAGE REVOCATION HANDLER (Deleted Messages)
// ============================================
const handleMessageRevocation = async (sock, revocationMessage) => {
    try {
        const chatId = revocationMessage.key.remoteJid;
        const antideleteEnabled = getChatData(chatId, 'antidelete', false);
        
        if (!antideleteEnabled) return false;

        const messageId = revocationMessage.message?.protocolMessage?.key?.id;
        if (!messageId) return false;

        const deletedBy = revocationMessage.participant || revocationMessage.key.participant || revocationMessage.key.remoteJid;
        
        // Don't process if bot deleted the message
        const ownerNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        if (deletedBy.includes(sock.user.id) || deletedBy === ownerNumber) return false;

        const original = messageStore.get(messageId);
        if (!original) return false;

        // Send deletion notification
        await sendDeletionNotification(sock, original, deletedBy, chatId);
        
        // Cleanup
        cleanupStoredMessage(messageId, original);

        return true;
    } catch (error) {
        console.error('❌ Error in handleMessageRevocation:', error);
        return false;
    }
};

// ============================================
// 🔹 HELPER FUNCTIONS FOR ANTIDELETE
// ============================================

// Ensure temp directory exists
async function ensureTempDir() {
    try {
        await fs.promises.mkdir(TEMP_MEDIA_DIR, { recursive: true });
    } catch (err) {
        console.error('Error creating temp directory:', err);
    }
}

// Store message in memory
async function storeMessage(sock, message, chatId) {
    try {
        await ensureTempDir();
        
        if (!message.key?.id) return;

        const messageId = message.key.id;
        const sender = message.key.participant || message.key.remoteJid;

        const storedMessage = {
            content: '',
            mediaType: '',
            mediaPath: '',
            sender,
            chatId,
            timestamp: Date.now(),
            isViewOnce: false
        };

        // Extract content and media
        await extractMessageContent(message, storedMessage);
        
        if (storedMessage.content || storedMessage.mediaType) {
            messageStore.set(messageId, storedMessage);
        }

    } catch (error) {
        console.error('storeMessage error:', error);
    }
}

// Extract message content
async function extractMessageContent(message, storedMessage) {
    try {
        // Text messages
        if (message.message?.conversation) {
            storedMessage.content = message.message.conversation;
        } else if (message.message?.extendedTextMessage?.text) {
            storedMessage.content = message.message.extendedTextMessage.text;
        }

        // Media messages
        if (message.message?.imageMessage) {
            storedMessage.mediaType = 'image';
            storedMessage.content = message.message.imageMessage.caption || '';
            storedMessage.mediaPath = await downloadMedia(
                message.message.imageMessage, 
                'image', 
                `${storedMessage.timestamp}.jpg`
            );
        } else if (message.message?.videoMessage) {
            storedMessage.mediaType = 'video';
            storedMessage.content = message.message.videoMessage.caption || '';
            storedMessage.mediaPath = await downloadMedia(
                message.message.videoMessage, 
                'video', 
                `${storedMessage.timestamp}.mp4`
            );
        } else if (message.message?.audioMessage) {
            storedMessage.mediaType = 'audio';
            storedMessage.mediaPath = await downloadMedia(
                message.message.audioMessage, 
                'audio', 
                `${storedMessage.timestamp}.mp3`
            );
        } else if (message.message?.documentMessage) {
            storedMessage.mediaType = 'document';
            storedMessage.content = message.message.documentMessage.fileName || 'Document';
            storedMessage.mediaPath = await downloadMedia(
                message.message.documentMessage, 
                'document', 
                `${storedMessage.timestamp}_${message.message.documentMessage.fileName || 'file'}`
            );
        }

    } catch (error) {
        console.error('extractMessageContent error:', error);
    }
}

// Handle view-once messages
async function handleViewOnceMessage(sock, viewOnceContainer, chatId, originalMessage) {
    try {
        const storedMessage = {
            content: '',
            mediaType: '',
            mediaPath: '',
            sender: originalMessage.key.participant || originalMessage.key.remoteJid,
            chatId,
            timestamp: Date.now(),
            isViewOnce: true
        };

        if (viewOnceContainer.imageMessage) {
            storedMessage.mediaType = 'image';
            storedMessage.content = viewOnceContainer.imageMessage.caption || '';
            storedMessage.mediaPath = await downloadMedia(
                viewOnceContainer.imageMessage, 
                'image', 
                `${storedMessage.timestamp}_viewonce.jpg`
            );
        } else if (viewOnceContainer.videoMessage) {
            storedMessage.mediaType = 'video';
            storedMessage.content = viewOnceContainer.videoMessage.caption || '';
            storedMessage.mediaPath = await downloadMedia(
                viewOnceContainer.videoMessage, 
                'video', 
                `${storedMessage.timestamp}_viewonce.mp4`
            );
        }

        if (storedMessage.mediaPath) {
            const messageId = originalMessage.key.id;
            messageStore.set(messageId, storedMessage);
            
            // Forward view-once to bot owner immediately
            const ownerNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
            const senderName = storedMessage.sender.split('@')[0];
            
            try {
                if (storedMessage.mediaType === 'image') {
                    await sock.sendMessage(ownerNumber, {
                        image: { url: storedMessage.mediaPath },
                        caption: `*🔒 View Once Image*\nFrom: @${senderName}\nChat: ${chatId}`,
                        mentions: [storedMessage.sender]
                    });
                } else if (storedMessage.mediaType === 'video') {
                    await sock.sendMessage(ownerNumber, {
                        video: { url: storedMessage.mediaPath },
                        caption: `*🔒 View Once Video*\nFrom: @${senderName}\nChat: ${chatId}`,
                        mentions: [storedMessage.sender]
                    });
                }
            } catch (forwardError) {
                console.error('Error forwarding view-once:', forwardError);
            }
        }
    } catch (error) {
        console.error('handleViewOnceMessage error:', error);
    }
}

// Download media helper
async function downloadMedia(message, type, fileName) {
    try {
        const stream = await downloadContentFromMessage(message, type);
        let buffer = Buffer.from([]);
        
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        
        const filePath = path.join(TEMP_MEDIA_DIR, fileName);
        await writeFile(filePath, buffer);
        return filePath;
    } catch (err) {
        console.error(`Error downloading ${type}:`, err);
        return null;
    }
}

// Send deletion notification
async function sendDeletionNotification(sock, original, deletedBy, chatId) {
    try {
        const senderName = original.sender.split('@')[0];
        const deleterName = deletedBy.split('@')[0];
        
        const time = new Date(original.timestamp).toLocaleString('en-US', {
            timeZone: 'Asia/Kolkata',
            hour12: true, 
            hour: '2-digit', 
            minute: '2-digit',
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric'
        });

        let text = `*🗑️ Deleted Message Detected*\n\n` +
            `*Deleted By:* @${deleterName}\n` +
            `*Original Sender:* @${senderName}\n` +
            `*Time:* ${time}\n` +
            `*Chat:* ${chatId}\n`;

        if (original.isViewOnce) {
            text += `*Type:* View Once ${original.mediaType?.toUpperCase() || 'Media'}\n`;
        }

        if (original.content) {
            text += `\n*Message:*\n${original.content}`;
        }

        // Send to bot owner
        const ownerNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        
        await sock.sendMessage(ownerNumber, {
            text,
            mentions: [deletedBy, original.sender]
        });

        // Also send to the chat if not the same as owner
        if (chatId !== ownerNumber) {
            await sock.sendMessage(chatId, {
                text,
                mentions: [deletedBy, original.sender]
            });
        }

        // Send media if exists
        if (original.mediaType && original.mediaPath && fs.existsSync(original.mediaPath)) {
            await sendMediaNotification(sock, original, [ownerNumber, chatId]);
        }

    } catch (error) {
        console.error('sendDeletionNotification error:', error);
    }
}

// Send media notification
async function sendMediaNotification(sock, original, targets) {
    const senderName = original.sender.split('@')[0];
    
    for (const target of targets) {
        try {
            if (original.mediaType === 'image') {
                await sock.sendMessage(target, {
                    image: { url: original.mediaPath },
                    caption: `*Deleted Image*${original.isViewOnce ? ' (View Once)' : ''}\nFrom: @${senderName}`,
                    mentions: [original.sender]
                });
            } else if (original.mediaType === 'video') {
                await sock.sendMessage(target, {
                    video: { url: original.mediaPath },
                    caption: `*Deleted Video*${original.isViewOnce ? ' (View Once)' : ''}\nFrom: @${senderName}`,
                    mentions: [original.sender]
                });
            } else if (original.mediaType === 'audio') {
                await sock.sendMessage(target, {
                    audio: { url: original.mediaPath },
                    mimetype: 'audio/mpeg',
                    ptt: false,
                    caption: `*Deleted Audio*\nFrom: @${senderName}`,
                    mentions: [original.sender]
                });
            }
        } catch (error) {
            console.error(`Error sending media to ${target}:`, error);
        }
    }
}

// Cleanup stored message
function cleanupStoredMessage(messageId, original) {
    messageStore.delete(messageId);
    
    if (original.mediaPath && fs.existsSync(original.mediaPath)) {
        unlink(original.mediaPath).catch(err => {
            console.error('Media cleanup error:', err);
        });
    }
}

// ============================================
// 🔹 FEATURE SETTINGS CONTROLLERS
// ============================================

// Antilink Settings
const antilinkSettings = {
    enable: (chatId) => updateChatData(chatId, 'antilink', true),
    disable: (chatId) => updateChatData(chatId, 'antilink', false),
    isEnabled: (chatId) => getChatData(chatId, 'antilink', false)
};

// Auto React Settings
const autoreactSettings = {
    enable: (mode = 'all') => {
        const result = updateSetting('autoreact', mode);
        return result;
    },
    disable: () => {
        const result = updateSetting('autoreact', false);
        return result;
    },
    isEnabled: () => {
        const status = getSetting('autoreact', false);
        return status;
    }
};

// Auto Read Settings
const autoreadSettings = {
    enable: () => {
        const result = updateSetting('autoread', true);
        return result;
    },
    disable: () => {
        const result = updateSetting('autoread', false);
        return result;
    },
    isEnabled: () => {
        const status = getSetting('autoread', false);
        return status;
    }
};

// Auto Typing Settings
const autotypingSettings = {
    enable: () => {
        const result = updateSetting('autotype', true);
        return result;
    },
    disable: () => {
        const result = updateSetting('autotype', false);
        return result;
    },
    isEnabled: () => {
        const status = getSetting('autotype', false);
        return status;
    }
};

// Auto Record Settings
const autorecordSettings = {
    enable: () => {
        const result = updateSetting('autorecord', true);
        return result;
    },
    disable: () => {
        const result = updateSetting('autorecord', false);
        return result;
    },
    isEnabled: () => {
        const status = getSetting('autorecord', false);
        return status;
    }
};

// Antibadword Settings
const antibadwordSettings = {
    enable: (chatId) => updateChatData(chatId, 'antibadword', true),
    disable: (chatId) => updateChatData(chatId, 'antibadword', false),
    isEnabled: (chatId) => getChatData(chatId, 'antibadword', false)
};

// Auto Status Settings (with react feature)
const autostatusSettings = {
    enable: (react = false) => {
        const result = updateSetting('autoviewstatus', true);
        if (react) {
            updateSetting('autostatusreact', true);
        }
        return result;
    },
    disable: () => {
        const result = updateSetting('autoviewstatus', false);
        return result;
    },
    enableReact: () => {
        const result = updateSetting('autostatusreact', true);
        return result;
    },
    disableReact: () => {
        const result = updateSetting('autostatusreact', false);
        return result;
    },
    isEnabled: () => {
        const status = getSetting('autoviewstatus', true); // Default: true
        return status;
    },
    isReactEnabled: () => {
        const status = getSetting('autostatusreact', false); // Default: false
        return status;
    },
    setStatusEmojis: (emojis) => {
        if (typeof emojis === 'string') {
            emojis = emojis.split(/[\s,]+/).filter(Boolean);
        }
        return updateSetting('statusEmojis', emojis);
    },
    getStatusEmojis: () => {
        return getSetting('statusEmojis', ['💙', '❤️', '🌚', '😍', '✅', '🔥', '✨', '⭐', '👍']);
    }
};

// Auto Bio Settings
const autobioSettings = {
    enable: () => {
        const result = updateSetting('autobio', true);
        return result;
    },
    disable: () => {
        const result = updateSetting('autobio', false);
        return result;
    },
    isEnabled: () => {
        const status = getSetting('autobio', false);
        return status;
    },
    updateNow: async (sock) => {
        await handleAutobio(sock);
        return true;
    }
};

// Auto Record Type Settings
const autorecordtypeSettings = {
    enable: (mode = 'all') => {
        const validModes = ['dm', 'group', 'all'];
        const selectedMode = validModes.includes(mode) ? mode : 'all';
        const result = updateSetting('autorecordtype', selectedMode);
        return result;
    },
    disable: () => {
        const result = updateSetting('autorecordtype', 'off');
        return result;
    },
    isEnabled: () => {
        const status = getSetting('autorecordtype', 'off');
        return status !== 'off';
    },
    getMode: () => {
        const mode = getSetting('autorecordtype', 'off');
        return mode;
    }
};

// Antidelete Settings
const antideleteSettings = {
    enable: (chatId) => {
        const result = updateChatData(chatId, 'antidelete', true);
        console.log(`✅ Antidelete enabled for chat: ${chatId}`);
        return result;
    },
    disable: (chatId) => {
        const result = updateChatData(chatId, 'antidelete', false);
        console.log(`❌ Antidelete disabled for chat: ${chatId}`);
        return result;
    },
    isEnabled: (chatId) => {
        const status = getChatData(chatId, 'antidelete', false);
        return status;
    },
    cleanTemp: async () => {
        try {
            if (fs.existsSync(TEMP_MEDIA_DIR)) {
                const files = await readdir(TEMP_MEDIA_DIR);
                let deletedCount = 0;
                
                for (const file of files) {
                    try {
                        await unlink(path.join(TEMP_MEDIA_DIR, file));
                        deletedCount++;
                    } catch (err) {
                        // Ignore errors
                    }
                }
                
                messageStore.clear();
                console.log(`🧹 Cleared ${deletedCount} temp files and message store`);
                return deletedCount;
            }
            return 0;
        } catch (error) {
            console.error('❌ Error cleaning temp:', error);
            return 0;
        }
    },
    getStats: () => {
        return {
            storedMessages: messageStore.size,
            tempDir: TEMP_MEDIA_DIR
        };
    }
};

// ============================================
// 🔹 GLOBAL FEATURE MANAGER
// ============================================
global.featureManager = {
    antilink: antilinkSettings,
    autoreact: autoreactSettings,
    autoread: autoreadSettings,
    autotyping: autotypingSettings,
    autorecord: autorecordSettings,
    autorecordtype: autorecordtypeSettings,
    antibadword: antibadwordSettings,
    autostatus: autostatusSettings,
    autobio: autobioSettings,
    autoemoji: autoemojiSettings,
    antidelete: antideleteSettings  // Added antidelete
};

// ============================================
// 🔹 MAIN CASE HANDLER
// ============================================
const handleMessageCases = async (sock, message, context, isCmd) => {
    try {
        // Only run for non-command messages
        if (isCmd) return;
        
        const { chatId, isGroup } = context;
        
        // Run all handlers
        await handleAntilink(sock, message, context);
        await handleAntibadword(sock, message, context);
        await handleAutoReaction(sock, message);
        await handleAutoread(sock, message);
        
        // Auto typing for non-group messages or based on settings
        if (!isGroup || getSetting('autotype', false)) {
            await handleAutoTyping(sock, chatId);
        }
        
    } catch (error) {
        console.error('❌ Error in handleMessageCases:', error);
    }
};

// ============================================
// 🔹 STATUS CHECKER IN MAIN MESSAGE HANDLER
// ============================================
export const handleStatusInMessagesUpsert = async (sock, chatUpdate) => {
    try {
        // Check if status viewing is enabled (default: true)
        const autostatusEnabled = getSetting('autoviewstatus', true);
        if (!autostatusEnabled) return;
        
        if (!chatUpdate.messages || chatUpdate.messages.length === 0) return;
        
        const message = chatUpdate.messages[0];
        
        // Call the status handler
        await handleAutostatus(sock, message);
        
    } catch (error) {
        console.error('❌ Error in handleStatusInMessagesUpsert:', error);
    }
};

// ============================================
// 🔹 AUTO BIO TIMER (Run every 5 minutes)
// ============================================
setInterval(async () => {
    try {
        if (global.sock && autobioSettings.isEnabled()) {
            await handleAutobio(global.sock);
        }
    } catch (error) {
        console.error('❌ Error in auto bio timer:', error);
    }
}, 5 * 60 * 1000); // 5 minutes

// ============================================
// 🔹 EXPORTS
// ============================================
export {
    // Main handlers
    handleMessageCases,
    handleStatusInMessagesUpsert,
    
    // Individual handlers
    handleAntilink,
    handleAutoReaction,
    handleAutoread,
    handleAutoTyping,
    handleAutotypingForMessage,
    handleAutoRecord,
    handleAutoRecordType,
    handleAntibadword,
    handleAutostatus,
    handleStatusUpdate,
    handleAutobio,
    handleAnticall,
    
    // New antidelete handlers
    handleAntidelete,
    handleViewOnce,
    handleMessageRevocation,
    
    // Settings controllers
    antilinkSettings,
    autoreactSettings,
    autoreadSettings,
    autotypingSettings,
    autorecordSettings,
    autorecordtypeSettings,  
    antibadwordSettings,
    autostatusSettings,
    autobioSettings,
    antideleteSettings,  // Added antidelete
    autoemojiSettings
};