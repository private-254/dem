// lib/case.js - Centralized Feature Control Center 🚀
import { getSetting, updateSetting, getChatData, updateChatData } from './database.js';
import { channelInfo } from './messageConfig.js';
import getCommandData from './database.js';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import fs from 'fs';
import { writeFile, unlink, readdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Global message store for antidelete
const messageStore = new Map();
const ANTIDELETE_DIR = path.join(__dirname, '../data/antidelete');
const STATE_PATH = path.join(ANTIDELETE_DIR, 'antidelete_state.json');
const MAX_CACHE = 1000;

// Ensure directories exist
function ensureDirectories() {
    try {
        fs.mkdirSync(ANTIDELETE_DIR, { recursive: true });
        
        // Initialize state file if it doesn't exist
        if (!fs.existsSync(STATE_PATH)) {
            // DEFAULT: antidelete is DISABLED by default
            fs.writeFileSync(STATE_PATH, JSON.stringify({ enabled: false }, null, 2));
        }
        
        // Initialize global antidelete state
        try {
            const state = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
            global.antiDeleteEnabled = state.enabled === true; // Default to false
        } catch {
            global.antiDeleteEnabled = false; // DEFAULT: DISABLED
        }
        
    } catch (error) {
        console.error('Error creating antidelete directories:', error);
        global.antiDeleteEnabled = false; // DEFAULT: DISABLED on error
    }
}

ensureDirectories();

// ============================
// 🔹 AUTOEMOJI HANDLER 😂🔥
// ============================
const handleAutoEmoji = async (sock, message) => {
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

const autoemojiSettings = {
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
// 🔹 STATUS CHECKER IN MAIN MESSAGE HANDLER
// ============================================
const handleStatusInMessagesUpsert = async (sock, chatUpdate) => {
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
// 🔹 ANTIDELETE HANDLER 🗑️ (Improved Version)
// ============================================
const handleAntidelete = async (sock, message) => {
    try {
        // Check if antidelete is enabled (DEFAULT: false)
        if (!global.antiDeleteEnabled || !message?.message) return false;

        const chat = message.key.remoteJid;
        const id = message.key.id || `${chat}-${Date.now()}`;
        const cacheKey = `${chat}:${id}`;

        // TEXT MESSAGE
        if (message.message.conversation || message.message.extendedTextMessage) {
            const text = message.message.conversation || message.message.extendedTextMessage?.text || '';
            
            messageStore.set(cacheKey, {
                id,
                chat,
                type: 'text',
                text,
                sender: message.key.participant || message.key.remoteJid,
                timestamp: Date.now()
            });
            
            // Clean old messages if cache is full
            if (messageStore.size > MAX_CACHE) {
                const firstKey = messageStore.keys().next().value;
                messageStore.delete(firstKey);
            }
            return true;
        }

        // MEDIA MESSAGE
        const mediaNode =
            message.message.imageMessage ||
            message.message.videoMessage ||
            message.message.audioMessage ||
            message.message.stickerMessage ||
            message.message.documentMessage ||
            null;

        if (mediaNode) {
            const mediaType =
                message.message.imageMessage ? 'image' :
                message.message.videoMessage ? 'video' :
                message.message.audioMessage ? 'audio' :
                message.message.stickerMessage ? 'sticker' :
                message.message.documentMessage ? 'document' : 'unknown';

            try {
                const stream = await downloadContentFromMessage(
                    mediaNode,
                    mediaType === 'document' ? (mediaNode.mimetype?.split('/')[0] || 'document') : mediaType
                );

                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }

                messageStore.set(cacheKey, {
                    id,
                    chat,
                    type: mediaType,
                    sender: message.key.participant || message.key.remoteJid,
                    timestamp: Date.now(),
                    fileName: mediaNode.fileName || null,
                    mimetype: mediaNode.mimetype || null,
                    size: buffer.length,
                    contentBuffer: buffer,
                    caption: mediaNode.caption || null
                });

                // Clean old messages if cache is full
                if (messageStore.size > MAX_CACHE) {
                    const firstKey = messageStore.keys().next().value;
                    messageStore.delete(firstKey);
                }
                return true;
            } catch (mediaError) {
                console.error('❌ Error downloading media for antidelete:', mediaError);
                return false;
            }
        }

        // OTHER MESSAGE TYPES
        messageStore.set(cacheKey, {
            id,
            chat,
            type: 'raw',
            raw: message.message,
            sender: message.key.participant || message.key.remoteJid,
            timestamp: Date.now()
        });

        return true;

    } catch (error) {
        console.error('❌ Error in handleAntidelete:', error);
        return false;
    }
};

// ============================================
// 🔹 VIEW-ONCE MESSAGE HANDLER
// ============================================
const handleViewOnce = async (sock, message) => {
    try {
        // Check if antidelete is enabled (DEFAULT: false)
        if (!global.antiDeleteEnabled) return false;

        const viewOnceContainer = message.message?.viewOnceMessageV2?.message || 
                                message.message?.viewOnceMessage?.message;

        if (!viewOnceContainer) return false;

        const chat = message.key.remoteJid;
        const id = message.key.id || `${chat}-${Date.now()}`;
        const cacheKey = `${chat}:${id}`;

        // Handle view-once media
        const mediaNode = viewOnceContainer.imageMessage || viewOnceContainer.videoMessage;
        if (mediaNode) {
            const mediaType = viewOnceContainer.imageMessage ? 'image' : 'video';

            try {
                const stream = await downloadContentFromMessage(mediaNode, mediaType);
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }

                messageStore.set(cacheKey, {
                    id,
                    chat,
                    type: mediaType,
                    sender: message.key.participant || message.key.remoteJid,
                    timestamp: Date.now(),
                    fileName: null,
                    mimetype: mediaNode.mimetype || null,
                    size: buffer.length,
                    contentBuffer: buffer,
                    caption: mediaNode.caption || null,
                    isViewOnce: true
                });

                console.log(`🔒 View-once ${mediaType} stored for antidelete`);
                return true;
            } catch (error) {
                console.error('❌ Error downloading view-once media:', error);
                return false;
            }
        }

        return false;
    } catch (error) {
        console.error('❌ Error in handleViewOnce:', error);
        return false;
    }
};

// ============================================
// 🔹 MESSAGE REVOCATION HANDLER (DELETED MESSAGES)
// ============================================
const handleMessageRevocation = async (sock, revocationMessage) => {
    try {
        // Check if antidelete is enabled (DEFAULT: false)
        if (!global.antiDeleteEnabled || !revocationMessage?.message?.protocolMessage) return false;

        const protoMsg = revocationMessage.message.protocolMessage;
        const revokedKey = protoMsg.key;
        if (!revokedKey) return false;

        const chat = revokedKey.remoteJid || revocationMessage.key.remoteJid;
        const revokedId = revokedKey.id;
        const cacheKey = `${chat}:${revokedId}`;
        const saved = messageStore.get(cacheKey);

        // Fail silently if message not found
        if (!saved) {
            console.log(`⚠️ Deleted message not found in cache: ${cacheKey}`);
            return false;
        }

        // Remove the message from cache after processing
        messageStore.delete(cacheKey);

        const isGroup = chat.endsWith('@g.us');
        const botNumber = sock.user.id;
        const senderJid = saved.sender || 'unknown@s.whatsapp.net';
        const userTag = `@${senderJid.split('@')[0]}`;

        // Get chat name
        let chatName = chat;
        if (isGroup) {
            try {
                const meta = await sock.groupMetadata(chat);
                chatName = meta?.subject || chat;
            } catch {
                chatName = chat;
            }
        }

        const header = `🛡️ *Anti-Delete*\nChat: ${chatName}\nUser: ${userTag}\nTime: ${new Date(saved.timestamp).toLocaleString()}`;

        // TEXT MESSAGE
        if (saved.type === 'text' && saved.text) {
            await sock.sendMessage(botNumber, {
                text: `${header}\n\nDeleted message:\n${saved.text}`,
                mentions: [senderJid]
            });
            return true;
        }

        // MEDIA MESSAGE
        if (['image', 'video', 'audio', 'sticker', 'document'].includes(saved.type)) {
            const msgOptions = {};
            
            switch (saved.type) {
                case 'image': 
                    msgOptions.image = saved.contentBuffer; 
                    break;
                case 'video': 
                    msgOptions.video = saved.contentBuffer; 
                    break;
                case 'audio': 
                    msgOptions.audio = saved.contentBuffer; 
                    msgOptions.mimetype = saved.mimetype || 'audio/mpeg'; 
                    break;
                case 'sticker': 
                    msgOptions.sticker = saved.contentBuffer; 
                    break;
                case 'document': 
                    msgOptions.document = saved.contentBuffer; 
                    msgOptions.fileName = saved.fileName || 'file'; 
                    break;
            }

            if (['image', 'video', 'document'].includes(saved.type)) {
                const caption = saved.caption ? `\nCaption: ${saved.caption}` : '';
                msgOptions.caption = `${header}${caption}`;
                msgOptions.mentions = [senderJid];
            }

            if (saved.isViewOnce) {
                msgOptions.caption = `${header}\n🔒 This was a view-once message${saved.caption ? `\nCaption: ${saved.caption}` : ''}`;
            }

            await sock.sendMessage(botNumber, msgOptions);
            return true;
        }

        return false;

    } catch (error) {
        console.error('❌ Error in handleMessageRevocation:', error);
        return false;
    }
};

// ============================================
// 🔹 ANTIPROMOTE HANDLER 🚫👑
// ============================================
const handleAntipromote = async (sock, update) => {
    try {
        const { id: chatId, participants, action } = update;
        
        if (action !== 'promote') return;
        
        // Check if antipromote is enabled for this chat
        const antipromoteEnabled = getChatData(chatId, 'antipromote', false);
        if (!antipromoteEnabled) return;

        const botNumber = sock.user.id;
        const settings = getChatData(chatId, 'antipromoteSettings', {
            enabled: false,
            mode: 'revert' // revert, kick, or warn
        });

        if (!settings.enabled) return;

        for (const user of participants) {
            // Don't act on the bot itself
            if (user === botNumber) continue;

            // Get admin info
            const adminStatus = await sock.groupMetadata(chatId).then(meta => 
                meta.participants.find(p => p.id === user)
            );

            // Skip if the user is already admin (shouldn't happen, but just in case)
            if (adminStatus && adminStatus.admin) continue;

            // Send notification
            await sock.sendMessage(chatId, {
                text: `🚫 *Promotion Blocked!*\nUser: @${user.split('@')[0]}\nMode: ${settings.mode.toUpperCase()}`,
                mentions: [user],
                ...channelInfo
            });

            // Take action based on mode
            if (settings.mode === 'revert') {
                await sock.groupParticipantsUpdate(chatId, [user], 'demote');
            } else if (settings.mode === 'kick') {
                await sock.groupParticipantsUpdate(chatId, [user], 'remove');
            }
            // If mode is 'warn', we just send the notification above
        }

    } catch (error) {
        console.error('❌ Error in handleAntipromote:', error);
    }
};

// ============================================
// 🔹 ANTIDEMOTE HANDLER 🚫⬇️
// ============================================
const handleAntidemote = async (sock, update) => {
    try {
        const { id: chatId, participants, action } = update;
        
        if (action !== 'demote') return;
        
        // Check if antidemote is enabled for this chat
        const antidemoteEnabled = getChatData(chatId, 'antidemote', false);
        if (!antidemoteEnabled) return;

        const botNumber = sock.user.id;
        const settings = getChatData(chatId, 'antidemoteSettings', {
            enabled: false,
            mode: 'revert' // revert, kick, or warn
        });

        if (!settings.enabled) return;

        for (const user of participants) {
            // Don't act on the bot itself
            if (user === botNumber) continue;

            // Send notification
            await sock.sendMessage(chatId, {
                text: `🚫 *Demotion Blocked!*\nUser: @${user.split('@')[0]}\nMode: ${settings.mode.toUpperCase()}`,
                mentions: [user],
                ...channelInfo
            });

            // Take action based on mode
            if (settings.mode === 'revert') {
                await sock.groupParticipantsUpdate(chatId, [user], 'promote');
            } else if (settings.mode === 'kick') {
                await sock.groupParticipantsUpdate(chatId, [user], 'remove');
            }
            // If mode is 'warn', we just send the notification above
        }

    } catch (error) {
        console.error('❌ Error in handleAntidemote:', error);
    }
};

// ============================================
// 🔹 GROUP PARTICIPANT UPDATE HANDLER
// ============================================
const handleGroupParticipantUpdate = async (sock, update) => {
    try {
        // Handle antipromote
        await handleAntipromote(sock, update);
        
        // Handle antidemote
        await handleAntidemote(sock, update);
        
        // You can add other group participant update handlers here
        
    } catch (error) {
        console.error('❌ Error in handleGroupParticipantUpdate:', error);
    }
};

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

// Antidelete Settings - DEFAULT: DISABLED
const antideleteSettings = {
    enable: () => {
        global.antiDeleteEnabled = true;
        try {
            fs.writeFileSync(STATE_PATH, JSON.stringify({ enabled: true }, null, 2));
        } catch (error) {
            console.error('❌ Error saving antidelete state:', error);
        }
        console.log('✅ Antidelete enabled globally');
        return true;
    },
    disable: () => {
        global.antiDeleteEnabled = false;
        try {
            fs.writeFileSync(STATE_PATH, JSON.stringify({ enabled: false }, null, 2));
        } catch (error) {
            console.error('❌ Error saving antidelete state:', error);
        }
        console.log('❌ Antidelete disabled globally');
        return true;
    },
    isEnabled: () => {
        return global.antiDeleteEnabled === true;
    },
    clearCache: () => {
        const size = messageStore.size;
        messageStore.clear();
        console.log(`🧹 Cleared ${size} messages from antidelete cache`);
        return size;
    },
    getStats: () => {
        return {
            storedMessages: messageStore.size,
            maxCache: MAX_CACHE,
            enabled: global.antiDeleteEnabled
        };
    }
};

// Antipromote Settings
const antipromoteSettings = {
    enable: (chatId, mode = 'revert') => {
        const validModes = ['revert', 'kick', 'warn'];
        const selectedMode = validModes.includes(mode) ? mode : 'revert';
        
        const settings = {
            enabled: true,
            mode: selectedMode
        };
        
        updateChatData(chatId, 'antipromote', true);
        updateChatData(chatId, 'antipromoteSettings', settings);
        
        console.log(`✅ Antipromote enabled for chat: ${chatId} (mode: ${selectedMode})`);
        return settings;
    },
    disable: (chatId) => {
        updateChatData(chatId, 'antipromote', false);
        console.log(`❌ Antipromote disabled for chat: ${chatId}`);
        return true;
    },
    isEnabled: (chatId) => {
        return getChatData(chatId, 'antipromote', false);
    },
    getSettings: (chatId) => {
        return getChatData(chatId, 'antipromoteSettings', {
            enabled: false,
            mode: 'revert'
        });
    },
    setMode: (chatId, mode) => {
        const validModes = ['revert', 'kick', 'warn'];
        const selectedMode = validModes.includes(mode) ? mode : 'revert';
        
        const settings = getChatData(chatId, 'antipromoteSettings', {
            enabled: true,
            mode: 'revert'
        });
        
        settings.mode = selectedMode;
        updateChatData(chatId, 'antipromoteSettings', settings);
        
        console.log(`⚙️ Antipromote mode updated for chat: ${chatId} (mode: ${selectedMode})`);
        return settings;
    }
};

// Antidemote Settings
const antidemoteSettings = {
    enable: (chatId, mode = 'revert') => {
        const validModes = ['revert', 'kick', 'warn'];
        const selectedMode = validModes.includes(mode) ? mode : 'revert';
        
        const settings = {
            enabled: true,
            mode: selectedMode
        };
        
        updateChatData(chatId, 'antidemote', true);
        updateChatData(chatId, 'antidemoteSettings', settings);
        
        console.log(`✅ Antidemote enabled for chat: ${chatId} (mode: ${selectedMode})`);
        return settings;
    },
    disable: (chatId) => {
        updateChatData(chatId, 'antidemote', false);
        console.log(`❌ Antidemote disabled for chat: ${chatId}`);
        return true;
    },
    isEnabled: (chatId) => {
        return getChatData(chatId, 'antidemote', false);
    },
    getSettings: (chatId) => {
        return getChatData(chatId, 'antidemoteSettings', {
            enabled: false,
            mode: 'revert'
        });
    },
    setMode: (chatId, mode) => {
        const validModes = ['revert', 'kick', 'warn'];
        const selectedMode = validModes.includes(mode) ? mode : 'revert';
        
        const settings = getChatData(chatId, 'antidemoteSettings', {
            enabled: true,
            mode: 'revert'
        });
        
        settings.mode = selectedMode;
        updateChatData(chatId, 'antidemoteSettings', settings);
        
        console.log(`⚙️ Antidemote mode updated for chat: ${chatId} (mode: ${selectedMode})`);
        return settings;
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
    antidelete: antideleteSettings,  // DEFAULT: DISABLED
    antipromote: antipromoteSettings,
    antidemote: antidemoteSettings
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
    handleGroupParticipantUpdate, // Export the handler

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

    // New antipromote/antidemote handlers
    handleAntipromote,
    handleAntidemote,

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
    antideleteSettings,
    antipromoteSettings,
    antidemoteSettings,

    // AutoEmoji handlers
    handleAutoEmoji,
    autoemojiSettings
};