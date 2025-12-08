// lib/case.js - Centralized Feature Control Center 🚀
import { getSetting, updateSetting, getChatData, updateChatData } from './database.js';
import { channelInfo } from './messageConfig.js';
import getCommandData from './database.js';


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
        

        // ✅ CHECK IF MESSAGE IS FROM THE OWNER (not just if lid exists)
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
// 🔹ANTILINK HAN🚫
//=============================//

const handleAntilink = async (sock, message, context) => {
    try {
        const { chatId, userMessage, isGroup, isSenderAdmin, isBotAdmin, senderIsSudo } = context;
        
        if (!isGroup) return;
        
        // Check if antilink is enabled (keep your existing check)
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
            // ... other patterns
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
                
                // Handle different actions (kick, warn, etc.) based on settings.action
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
    const isFromBot = message.key.fromMe;  
      
    // ❌ Remove this if you want the bot to react to its own messages  
      
      
    // Check mode conditions  
    if (autoreactMode === 'dm' && isGroup) return;  
    if (autoreactMode === 'group' && !isGroup) return;  
   // 'all' = works everywhere  
      
    // Get emojis from DB (fallback list included)  
    const reactionEmojis = getSetting('reactionEmojis', ['✅', '❤️', '😊', '👍', '🔥', '💯', '🌟', '⭐']);  
      
    // Random chance (30% react rate, tweak as you like)  
    //if (Math.random() > 0.3) return;  
      
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
}


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
        
        // Bad words list (you can expand this)
        const badWords = [
            'fuck', 'shit', 'bitch', 'asshole', 'damn', 'bastard',
            'motherfucker', 'bullshit', 'crap', 'piss', 'whore',
            // Add more bad words as needed
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
// 🔹 AUTOSTATUS HANDLER 👑
// ============================================
const handleAutostatus = async (sock) => {
    try {
        const autostatusEnabled = getSetting('autoviewstatus', false);
        if (!autostatusEnabled) return;
        
        // This function would be called when status updates are received
        // Implementation depends on your WhatsApp client setup
        
        
    } catch (error) {
        console.error('❌ Error in handleAutostatus:', error);
    }
};

// Add handleStatusUpdate alias for compatibility
const handleStatusUpdate = async (sock, statusUpdate) => {
    try {
        await handleAutostatus(sock);
        
    } catch (error) {
        console.error('❌ Error in handleStatusUpdate:', error);
    }
};

// ============================================
// 🔹 AUTOBIO HANDLER ✍️
//==============================//
// 🔹 AUTOBIO HANDLER ✍️
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
        // 'all' = works everywhere
        
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
                
                 
            }
        }
    } catch (error) {
        console.error('❌ Error in handleAnticall:', error);
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

// Auto Status Settings
const autostatusSettings = {
    enable: () => {
        
        const result = updateSetting('autoviewstatus', true);
        
        return result;
    },
    disable: () => {
        
        const result = updateSetting('autoviewstatus', false);
        
        return result;
    },
    isEnabled: () => {
        const status = getSetting('autoviewstatus', false);
        
        return status;
    }
};

// Auto Bio Settings
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
// ============================================
// 🔹 GLOBAL FEATURE MANAGER
// ============================================
global.featureManager = {
    antilink: antilinkSettings,
    autoreact: autoreactSettings,
    autoread: autoreadSettings,
    autotyping: autotypingSettings,
    autorecord: autorecordSettings,
    antibadword: antibadwordSettings,
    autostatus: autostatusSettings,
    autobio: autobioSettings,
    autoemoji: autoemojiSettings
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
    // Main handler
    handleMessageCases,
    
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
   //handleAutoEmoji,
   //autoemojiSettings

};

