const fs = require('fs');
const path = require('path');

// Path for storing auto-reaction state and custom reactions
const USER_GROUP_DATA = path.join(__dirname, '../data/userGroupData.json');

// Default emojis for command reactions
const defaultEmojis = ['💞', '💘', '🥰', '💙','💓','💕'];

// Load auto-reaction state and custom reactions from file
function loadAutoReactionState() {
    try {
        if (fs.existsSync(USER_GROUP_DATA)) {
            const data = JSON.parse(fs.readFileSync(USER_GROUP_DATA));
            return {
                enabled: data.autoReaction?.enabled || false,
                customReactions: Array.isArray(data.autoReaction?.customReactions) 
                    ? data.autoReaction.customReactions 
                    : defaultEmojis
            };
        }
    } catch (error) {
        console.error('Error loading auto-reaction state:', error);
    }
    return {
        enabled: false,
        customReactions: defaultEmojis
    };
}

// Save auto-reaction state and custom reactions to file
function saveAutoReactionState(state, customReactions = null) {
    try {
        const data = fs.existsSync(USER_GROUP_DATA) 
            ? JSON.parse(fs.readFileSync(USER_GROUP_DATA))
            : { groups: [], chatbot: {} };
        
        const reactionsToSave = Array.isArray(customReactions) 
            ? customReactions 
            : (Array.isArray(data.autoReaction?.customReactions) 
                ? data.autoReaction.customReactions 
                : defaultEmojis);
        
        data.autoReaction = {
            enabled: state,
            customReactions: reactionsToSave
        };
        
        fs.writeFileSync(USER_GROUP_DATA, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error saving auto-reaction state:', error);
    }
}

// Store auto-reaction state
let autoReactionConfig = loadAutoReactionState();

// Function to get random emoji from custom reactions
function getRandomEmoji() {
    const reactions = autoReactionConfig.customReactions;
    if (!Array.isArray(reactions) || reactions.length === 0) {
        return defaultEmojis[Math.floor(Math.random() * defaultEmojis.length)];
    }
    return reactions[Math.floor(Math.random() * reactions.length)];
}

// Function to add reaction to a command message
async function addCommandReaction(sock, message) {
    try {
        if (!autoReactionConfig.enabled || !message?.key?.id) return;
        
        const emoji = getRandomEmoji();
        await sock.sendMessage(message.key.remoteJid, {
            react: {
                text: emoji,
                key: message.key
            }
        });
    } catch (error) {
        console.error('Error adding command reaction:', error);
    }
}

// Function to handle areact command
async function handleAreactCommand(sock, chatId, message, isOwner) {
    try {
        if (!isOwner) {
            await sock.sendMessage(chatId, { 
                text: '_This command is for owner only_',
                quoted: message
            });
            return;
        }

        const messageText = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const args = messageText.split(' ');
        const action = args[1]?.toLowerCase();

        if (action === 'on') {
            autoReactionConfig.enabled = true;
            saveAutoReactionState(true, autoReactionConfig.customReactions);
            await sock.sendMessage(chatId, { 
                text: '_Auto-reactions enabled globally_\n_Custom reactions will be used for all commands_',
                quoted: message
            });
        } else if (action === 'off') {
            autoReactionConfig.enabled = false;
            saveAutoReactionState(false, autoReactionConfig.customReactions);
            await sock.sendMessage(chatId, { 
                text: '_Auto-reactions disabled globally_',
                quoted: message
            });
        } else if (action === 'set') {
            const customReactions = args.slice(2);
            
            if (customReactions.length === 0) {
                await sock.sendMessage(chatId, { 
                    text: '_Please provide at least one emoji_\n_Example: .areact set 🎉 🚀 ⭐_',
                    quoted: message
                });
                return;
            }

            const validEmojis = customReactions.filter(emoji => 
                emoji.length <= 4 && /[\p{Emoji}]/u.test(emoji)
            );

            if (validEmojis.length === 0) {
                await sock.sendMessage(chatId, { 
                    text: '_Please provide valid emojis_',
                    quoted: message
                });
                return;
            }

            autoReactionConfig.customReactions = validEmojis;
            saveAutoReactionState(autoReactionConfig.enabled, validEmojis);
            
            await sock.sendMessage(chatId, { 
                text: `_Custom reactions updated_\n\n_New reactions: ${validEmojis.join(' ')}_\n_Auto-reactions: ${autoReactionConfig.enabled ? 'enabled' : 'disabled'}_`},
                { quoted: message
            });
        } else if (action === 'reset') {
            autoReactionConfig.customReactions = defaultEmojis;
            saveAutoReactionState(autoReactionConfig.enabled, defaultEmojis);
            
            await sock.sendMessage(chatId, { 
                text: `_Custom reactions reset to default_\n_Default reactions: ${defaultEmojis.join(' ')}_`,
                quoted: message
            });
        } else if (action === 'list') {
            const currentReactions = autoReactionConfig.customReactions.join(' ');
            await sock.sendMessage(chatId, { 
                text: `_Current custom reactions_\n\n${currentReactions}\n_Auto-reactions: ${autoReactionConfig.enabled ? 'enabled' : 'disabled'}_`,
                quoted: message
            });
        } else {
            const currentState = autoReactionConfig.enabled ? 'enabled' : 'disabled';
            const currentReactions = autoReactionConfig.customReactions.join(' ');
            
            await sock.sendMessage(chatId, { 
                text: `_Auto-reactions status: ${currentState}_\n\n_Current reactions: ${currentReactions}_\n\n_Commands:_\n_• .areact on - Enable auto-reactions_\n_• .areact off - Disable auto-reactions_\n_• .areact set <emojis> - Set custom reactions_\n_• .areact reset - Reset to default reactions_\n_• .areact list - Show current reactions_\n\n_Example:_\n_.areact set ❤️ 😅 🙂 🥹_`},
                { quoted: message
            });
        }
    } catch (error) {
        console.error('Error handling areact command:', error);
        await sock.sendMessage(chatId, { 
            text: '_Error controlling auto-reactions_',
            quoted: message
        });
    }
}

module.exports = {
    addCommandReaction,
    handleAreactCommand,
    getAutoReactionConfig: () => autoReactionConfig,
    defaultEmojis
};