const fs = require('fs');
const path = require('path');

// Create fake contact for enhanced replies
function createFakeContact(message) {
    const sender = message.key.participant || message.key.remoteJid;
    const number = sender.split('@')[0];
    
    return {
        key: {
            participants: "0@s.whatsapp.net",
            remoteJid: "status@broadcast",
            fromMe: false,
            id: "VENOM-XMD"
        },
        message: {
            contactMessage: {
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:XL;Bot;;;\nFN:VENOM-XMD\nitem1.TEL;waid=${number}:${number}\nitem1.X-ABLabel:Phone\nEND:VCARD`
            }
        },
        participant: "0@s.whatsapp.net"
    };
}

// Path to store auto status configuration
const configPath = path.join(__dirname, '../data/autoStatus.json');

// Initialize config file if it doesn't exist
if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify({ 
        enabled: false, 
        reactOn: false,
        reactionEmoji: '❤️', // Default emoji
        randomReactions: true
    }, null, 2));
}

// Helper function to read config safely
function readConfig() {
    try {
        if (!fs.existsSync(configPath)) {
            const defaultConfig = { 
                enabled: false, 
                reactOn: false, 
                reactionEmoji: '❤️',
                randomReactions: true 
            };
            fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
            return defaultConfig;
        }
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (error) {
        console.error('Error reading config:', error);
        return { 
            enabled: false, 
            reactOn: false, 
            reactionEmoji: '❤️',
            randomReactions: true 
        };
    }
}

// Helper function to write config safely
function writeConfig(config) {
    try {
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing config:', error);
        return false;
    }
}

// Helper function to get random emoji
function getRandomEmoji() {
    const emojis = ['❤️', '😂', '😮', '😢', '😡', '👏', '🔥', '⭐', '🎉', '🙏', '👍', '👎', '💯', '🤔', '🤯', '😍', '🥰', '🤗', '😎', '🤩'];
    return emojis[Math.floor(Math.random() * emojis.length)];
}

async function autoStatusCommand(sock, chatId, msg, args) {
    try {
        // Create fake contact for reply
        const fake = createFakeContact(msg);
        
        // Check if sender is owner or sudo
        const { isSudo } = require('../lib/index');
        const senderId = msg.key.participant || msg.key.remoteJid;
        const senderIsSudo = await isSudo(senderId);
        const isOwner = msg.key.fromMe || senderIsSudo;

        if (!isOwner) {
            await sock.sendMessage(chatId, { 
                text: 'This command can only be used by the owner.'
            }, { quoted: fake });
            return;
        }

        // Read current config
        let config = readConfig();

        // If no arguments, show current status
        if (!args || args.length === 0) {
            const status = config.enabled ? 'ENABLED' : 'DISABLED';
            const reactStatus = config.reactOn ? 'ENABLED' : 'DISABLED';
            const currentEmoji = config.reactionEmoji || '❤️';
            const randomStatus = config.randomReactions ? 'ENABLED' : 'DISABLED';

            await sock.sendMessage(chatId, { 
                text: `AUTO STATUS SETTINGS\n\nAuto Status View: ${status}\nStatus Reactions: ${reactStatus}\nReaction Emoji: ${currentEmoji}\nRandom Reactions: ${randomStatus}\n\nCommands:\n• autostatus on - Enable auto status view\n• autostatus off - Disable auto status view\n• autostatus react on - Enable status reactions\n• autostatus react off - Disable status reactions\n• autostatus emoji <emoji> - Change reaction emoji\n• autostatus random on - Enable random reactions\n• autostatus random off - Disable random reactions\n• autostatus reset - Reset to default settings`
            }, { quoted: fake });
            return;
        }

        // Handle commands
        const command = args[0].toLowerCase();

        if (command === 'on') {
            config.enabled = true;
            if (writeConfig(config)) {
                await sock.sendMessage(chatId, { 
                    text: 'Auto status view has been enabled. Bot will now automatically view all contact statuses.'
                }, { quoted: fake });
            } else {
                throw new Error('Failed to save configuration');
            }
        } 
        else if (command === 'off') {
            config.enabled = false;
            if (writeConfig(config)) {
                await sock.sendMessage(chatId, { 
                    text: 'Auto status view has been disabled. Bot will no longer automatically view statuses.'
                }, { quoted: fake });
            } else {
                throw new Error('Failed to save configuration');
            }
        } 
        else if (command === 'react') {
            // Handle react subcommand
            if (!args[1]) {
                await sock.sendMessage(chatId, { 
                    text: 'Please specify on/off for reactions. Use: autostatus react on/off'
                }, { quoted: fake });
                return;
            }

            const reactCommand = args[1].toLowerCase();
            if (reactCommand === 'on') {
                config.reactOn = true;
                if (writeConfig(config)) {
                    const reactionType = config.randomReactions ? 'random emojis' : config.reactionEmoji;
                    await sock.sendMessage(chatId, { 
                        text: `Status reactions have been enabled. Bot will now react to status updates with ${reactionType}.`
                    }, { quoted: fake });
                } else {
                    throw new Error('Failed to save configuration');
                }
            } else if (reactCommand === 'off') {
                config.reactOn = false;
                if (writeConfig(config)) {
                    await sock.sendMessage(chatId, { 
                        text: 'Status reactions have been disabled. Bot will no longer react to status updates.'
                    }, { quoted: fake });
                } else {
                    throw new Error('Failed to save configuration');
                }
            } else {
                await sock.sendMessage(chatId, { 
                    text: 'Invalid reaction command. Use: autostatus react on/off'
                }, { quoted: fake });
            }
        }
        else if (command === 'emoji') {
            // Handle emoji change
            if (!args[1]) {
                await sock.sendMessage(chatId, { 
                    text: 'Please provide an emoji. Use: autostatus emoji <emoji>\nExample: autostatus emoji 👍'
                }, { quoted: fake });
                return;
            }

            const newEmoji = args[1].trim();

            // Basic emoji validation
            if (newEmoji.length > 4 || !/\p{Emoji}/u.test(newEmoji)) {
                await sock.sendMessage(chatId, { 
                    text: 'Please provide a valid single emoji.\nExample: autostatus emoji 🎉'
                }, { quoted: fake });
                return;
            }

            config.reactionEmoji = newEmoji;
            if (writeConfig(config)) {
                await sock.sendMessage(chatId, { 
                    text: `Reaction emoji changed to: ${newEmoji}\n${config.reactOn ? `Bot will now use ${newEmoji} for status reactions.` : 'Enable reactions with: autostatus react on'}`
                }, { quoted: fake });
            } else {
                throw new Error('Failed to save configuration');
            }
        }
        else if (command === 'random') {
            // Handle random reactions subcommand
            if (!args[1]) {
                await sock.sendMessage(chatId, { 
                    text: 'Please specify on/off for random reactions. Use: autostatus random on/off'
                }, { quoted: fake });
                return;
            }

            const randomCommand = args[1].toLowerCase();
            if (randomCommand === 'on') {
                config.randomReactions = true;
                if (writeConfig(config)) {
                    await sock.sendMessage(chatId, { 
                        text: 'Random reactions have been enabled. Bot will now use random emojis for status reactions.'
                    }, { quoted: fake });
                } else {
                    throw new Error('Failed to save configuration');
                }
            } else if (randomCommand === 'off') {
                config.randomReactions = false;
                if (writeConfig(config)) {
                    await sock.sendMessage(chatId, { 
                        text: `Random reactions have been disabled. Bot will now use the fixed emoji: ${config.reactionEmoji || '❤️'}`
                    }, { quoted: fake });
                } else {
                    throw new Error('Failed to save configuration');
                }
            } else {
                await sock.sendMessage(chatId, { 
                    text: 'Invalid random command. Use: autostatus random on/off'
                }, { quoted: fake });
            }
        }
        else if (command === 'reset') {
            // Reset to default settings
            const defaultConfig = { 
                enabled: false, 
                reactOn: false, 
                reactionEmoji: '❤️',
                randomReactions: true 
            };
            if (writeConfig(defaultConfig)) {
                await sock.sendMessage(chatId, { 
                    text: 'Auto status settings have been reset to default.\n\nAuto Status View: DISABLED\nStatus Reactions: DISABLED\nReaction Emoji: ❤️\nRandom Reactions: ENABLED'
                }, { quoted: fake });
            } else {
                throw new Error('Failed to reset configuration');
            }
        }
        else {
            await sock.sendMessage(chatId, { 
                text: 'Invalid command. Use:\n• autostatus on/off - Enable/disable\n• autostatus react on/off - Enable/disable status reactions\n• autostatus emoji <emoji> - Change reaction emoji\n• autostatus random on/off - Enable/disable random reactions\n• autostatus reset - Reset to default settings'
            }, { quoted: fake });
        }

    } catch (error) {
        console.error('Error in autostatus command:', error);
        const fake = createFakeContact(msg);
        await sock.sendMessage(chatId, { 
            text: 'Error occurred while managing auto status: ' + error.message
        }, { quoted: fake });
    }
}

// Function to check if auto status is enabled
function isAutoStatusEnabled() {
    try {
        const config = readConfig();
        return config.enabled;
    } catch (error) {
        console.error('Error checking auto status config:', error);
        return false;
    }
}

// Function to check if status reactions are enabled
function isStatusReactionEnabled() {
    try {
        const config = readConfig();
        return config.reactOn;
    } catch (error) {
        console.error('Error checking status reaction config:', error);
        return false;
    }
}

// Function to get reaction emoji
function getReactionEmoji() {
    try {
        const config = readConfig();

        // Return random emoji if random reactions are enabled
        if (config.randomReactions) {
            return getRandomEmoji();
        }

        // Otherwise return the fixed emoji
        return config.reactionEmoji || '❤️';
    } catch (error) {
        console.error('Error getting reaction emoji:', error);
        return '❤️';
    }
}

// Function to check if random reactions are enabled
function isRandomReactionsEnabled() {
    try {
        const config = readConfig();
        return config.randomReactions !== false;
    } catch (error) {
        console.error('Error checking random reactions config:', error);
        return true;
    }
}

// Function to react to status using proper method
async function reactToStatus(sock, statusKey) {
    try {
        if (!isStatusReactionEnabled()) {
            return;
        }

        const emoji = getReactionEmoji();

        await sock.relayMessage(
            'status@broadcast',
            {
                reactionMessage: {
                    key: {
                        remoteJid: 'status@broadcast',
                        id: statusKey.id,
                        participant: statusKey.participant || statusKey.remoteJid,
                        fromMe: false
                    },
                    text: emoji
                }
            },
            {
                messageId: statusKey.id,
                statusJidList: [statusKey.remoteJid, statusKey.participant || statusKey.remoteJid]
            }
        );

    } catch (error) {
        console.error('Error reacting to status:', error.message);
    }
}

// Function to handle status updates
async function handleStatusUpdate(sock, status) {
    try {
        if (!isAutoStatusEnabled()) {
            return;
        }

        // Add delay to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

        let statusKey = null;

        // Handle different status update formats
        if (status.messages && status.messages.length > 0) {
            statusKey = status.messages[0].key;
        } else if (status.key) {
            statusKey = status.key;
        } else if (status.reaction && status.reaction.key) {
            statusKey = status.reaction.key;
        }

        // Check if this is a status update
        if (statusKey && statusKey.remoteJid === 'status@broadcast') {
            try {
                // Mark status as viewed
                await sock.readMessages([statusKey]);

                // React to status if enabled
                await reactToStatus(sock, statusKey);

            } catch (err) {
                if (err.message?.includes('rate-overlimit')) {
                    console.log('Rate limit hit, waiting before retrying...');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    await sock.readMessages([statusKey]);
                } else {
                    console.error('Error processing status:', err.message);
                }
            }
        }

    } catch (error) {
        console.error('Error in auto status view:', error.message);
    }
}

module.exports = {
    autoStatusCommand,
    handleStatusUpdate,
    isAutoStatusEnabled,
    isStatusReactionEnabled,
    getReactionEmoji,
    isRandomReactionsEnabled,
    getRandomEmoji
};