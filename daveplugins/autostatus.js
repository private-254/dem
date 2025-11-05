const fs = require('fs');
const path = require('path');

const channelInfo = {
    contextInfo: {
        forwardingScore: 1,
        isForwarded: false,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '',
            newsletterName: '',
            serverMessageId: -1
        }
    }
};

// Path to store auto status configuration
const configPath = path.join(__dirname, '../data/autoStatus.json');

// Default emojis for random reactions
const defaultEmojis = ['❤️', '🔥', '⭐', '🎉', '👏', '💫', '🤩', '✨', '💖', '👍'];

// Initialize config file if it doesn't exist
if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify({ 
        enabled: false, 
        reactOn: false,
        customEmojis: defaultEmojis,
        lastReactionTime: {},
        reactionInterval: 1,
        randomChance: 100
    }));
}

// Function to get random emoji
function getRandomEmoji() {
    const config = JSON.parse(fs.readFileSync(configPath));
    const emojis = config.customEmojis || defaultEmojis;
    return emojis[Math.floor(Math.random() * emojis.length)];
}

// Function to check if enough time has passed for reaction
function canReactToStatus(userId) {
    try {
        const config = JSON.parse(fs.readFileSync(configPath));
        const lastReactionTime = config.lastReactionTime || {};
        const interval = config.reactionInterval || 1;

        const lastTime = lastReactionTime[userId];
        if (!lastTime) return true;

        const timeDiff = Date.now() - lastTime;
        const minutesDiff = timeDiff / (1000 * 60);

        return minutesDiff >= interval;
    } catch (error) {
        console.error('Error checking reaction time:', error);
        return true;
    }
}

// Function to check if we should react randomly
function shouldReactRandomly() {
    try {
        const config = JSON.parse(fs.readFileSync(configPath));
        const chance = config.randomChance || 100;
        const random = Math.random() * 100;
        return random <= chance;
    } catch (error) {
        console.error('Error checking random chance:', error);
        return true;
    }
}

// Function to update last reaction time
function updateReactionTime(userId) {
    try {
        const config = JSON.parse(fs.readFileSync(configPath));
        config.lastReactionTime = config.lastReactionTime || {};
        config.lastReactionTime[userId] = Date.now();
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    } catch (error) {
        console.error('Error updating reaction time:', error);
    }
}

async function autoStatusCommand(sock, chatId, msg, args) {
    try {
        // Check if sender is owner or sudo
        const { isSudo } = require('../lib/index');
        const senderId = msg.key.participant || msg.key.remoteJid;
        const senderIsSudo = await isSudo(senderId);
        const isOwner = msg.key.fromMe || senderIsSudo;

        if (!isOwner) {
            await sock.sendMessage(chatId, { 
                text: 'This command is for owner only.'
            },{quoted: msg});
            return;
        }

        // Read current config
        let config = JSON.parse(fs.readFileSync(configPath));

        // If no arguments, show current status
        if (!args || args.length === 0) {
            const status = config.enabled ? 'ON' : 'OFF';
            const reactStatus = config.reactOn ? 'ON' : 'OFF';
            const interval = config.reactionInterval || 1;
            const chance = config.randomChance || 100;
            const emojis = config.customEmojis || defaultEmojis;

            await sock.sendMessage(chatId, { 
                text: `*Auto Status Settings*\n\nStatus View: ${status}\nReactions: ${reactStatus}\nInterval: ${interval} min\nChance: ${chance}%\nEmojis: ${emojis.join(' ')}\n\n*Commands:*\n.autostatus on/off\n.autostatus react on/off\n.autostatus interval <minutes>\n.autostatus chance <1-100>\n.autostatus emoji add/remove/list/reset`
            },{ quoted: msg});
            return;
        }

        // Handle commands
        const command = args[0].toLowerCase();

        if (command === 'on') {
            config.enabled = true;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            await sock.sendMessage(chatId, { 
                text: 'Auto status view enabled.'
            },{quoted: msg});
        } else if (command === 'off') {
            config.enabled = false;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            await sock.sendMessage(chatId, { 
                text: 'Auto status view disabled.'
            },{quoted:msg});
        } else if (command === 'react') {
            if (!args[1]) {
                await sock.sendMessage(chatId, { 
                    text: 'Use: .autostatus react on/off'
                },{quoted:msg});
                return;
            }

            const reactCommand = args[1].toLowerCase();
            if (reactCommand === 'on') {
                config.reactOn = true;
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await sock.sendMessage(chatId, { 
                    text: `Status reactions enabled. Chance: ${config.randomChance || 100}%`
                },{quoted: msg});
            } else if (reactCommand === 'off') {
                config.reactOn = false;
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await sock.sendMessage(chatId, { 
                    text: 'Status reactions disabled.'
                },{quoted:msg});
            } else {
                await sock.sendMessage(chatId, { 
                    text: 'Use: .autostatus react on/off'
                },{quoted:msg});
            }
        } else if (command === 'interval') {
            if (!args[1] || isNaN(args[1])) {
                await sock.sendMessage(chatId, { 
                    text: 'Use: .autostatus interval <minutes>'
                },{quoted:msg});
                return;
            }

            const minutes = parseInt(args[1]);
            if (minutes < 1) {
                await sock.sendMessage(chatId, { 
                    text: 'Minimum 1 minute.'
                },{quoted:msg});
                return;
            }

            config.reactionInterval = minutes;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            await sock.sendMessage(chatId, { 
                text: `Reaction interval: ${minutes} minutes`
            },{quoted:msg});
        } else if (command === 'chance') {
            if (!args[1] || isNaN(args[1])) {
                await sock.sendMessage(chatId, { 
                    text: 'Use: .autostatus chance <1-100>'
                },{quoted:msg});
                return;
            }

            const chance = parseInt(args[1]);
            if (chance < 1 || chance > 100) {
                await sock.sendMessage(chatId, { 
                    text: 'Must be between 1-100'
                },{quoted:msg});
                return;
            }

            config.randomChance = chance;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            await sock.sendMessage(chatId, { 
                text: `Reaction chance: ${chance}%`
            },{quoted:msg});
        } else if (command === 'emoji') {
            const subCommand = args[1]?.toLowerCase();

            if (!subCommand) {
                await sock.sendMessage(chatId, { 
                    text: 'Use: .autostatus emoji add/remove/list/reset'
                },{quoted:msg});
                return;
            }

            if (subCommand === 'add') {
                const emoji = args[2];
                if (!emoji) {
                    await sock.sendMessage(chatId, { 
                        text: 'Use: .autostatus emoji add <emoji>'
                    },{quoted:msg});
                    return;
                }

                if (emoji.length > 4 || !/\p{Emoji}/u.test(emoji)) {
                    await sock.sendMessage(chatId, { 
                        text: 'Invalid emoji.'
                    },{quoted: msg});
                    return;
                }

                config.customEmojis = config.customEmojis || defaultEmojis;
                if (config.customEmojis.includes(emoji)) {
                    await sock.sendMessage(chatId, { 
                        text: 'Emoji already exists.'
                    },{quoted: msg});
                    return;
                }

                config.customEmojis.push(emoji);
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await sock.sendMessage(chatId, { 
                    text: `Added: ${emoji}\nCurrent: ${config.customEmojis.join(' ')}`
                },{quoted: msg});

            } else if (subCommand === 'remove') {
                const emoji = args[2];
                if (!emoji) {
                    await sock.sendMessage(chatId, { 
                        text: 'Use: .autostatus emoji remove <emoji>'
                    },{quoted: msg});
                    return;
                }

                config.customEmojis = config.customEmojis || defaultEmojis;
                const index = config.customEmojis.indexOf(emoji);
                if (index === -1) {
                    await sock.sendMessage(chatId, { 
                        text: 'Emoji not found.'
                    },{quoted: msg});
                    return;
                }

                config.customEmojis.splice(index, 1);
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await sock.sendMessage(chatId, { 
                    text: `Removed: ${emoji}\nCurrent: ${config.customEmojis.join(' ')}`
                },{quoted: msg});

            } else if (subCommand === 'list') {
                const emojis = config.customEmojis || defaultEmojis;
                await sock.sendMessage(chatId, { 
                    text: `Current emojis:\n${emojis.join(' ')}\nTotal: ${emojis.length}`
                },{quoted: msg});

            } else if (subCommand === 'reset') {
                config.customEmojis = defaultEmojis;
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                await sock.sendMessage(chatId, { 
                    text: `Reset to default: ${defaultEmojis.join(' ')}`
                },{quoted: msg});

            } else {
                await sock.sendMessage(chatId, { 
                    text: 'Use: .autostatus emoji add/remove/list/reset'
                },{quoted: msg});
            }
        } else {
            await sock.sendMessage(chatId, { 
                text: 'Invalid command. Use .autostatus for help.'
            },{quoted: msg});
        }

    } catch (error) {
        console.error('Error in autostatus command:', error);
        await sock.sendMessage(chatId, { 
            text: 'Error: ' + error.message
        },{quoted: msg});
    }
}

// Function to check if auto status is enabled
function isAutoStatusEnabled() {
    try {
        const config = JSON.parse(fs.readFileSync(configPath));
        return config.enabled;
    } catch (error) {
        console.error('Error checking auto status config:', error);
        return false;
    }
}

// Function to check if status reactions are enabled
function isStatusReactionEnabled() {
    try {
        const config = JSON.parse(fs.readFileSync(configPath));
        return config.reactOn;
    } catch (error) {
        console.error('Error checking status reaction config:', error);
        return false;
    }
}

// Function to react to status using proper method
async function reactToStatus(sock, statusKey) {
    try {
        if (!isStatusReactionEnabled()) {
            return;
        }

        const userId = statusKey.participant || statusKey.remoteJid;

        if (!canReactToStatus(userId)) {
            return;
        }

        if (!shouldReactRandomly()) {
            return;
        }

        const randomEmoji = getRandomEmoji();

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
                    text: randomEmoji
                }
            },
            {
                messageId: statusKey.id,
                statusJidList: [statusKey.remoteJid, statusKey.participant || statusKey.remoteJid]
            }
        );

        updateReactionTime(userId);

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

        await new Promise(resolve => setTimeout(resolve, 1000));

        if (status.messages && status.messages.length > 0) {
            const msg = status.messages[0];
            if (msg.key && msg.key.remoteJid === 'status@broadcast') {
                try {
                    await sock.readMessages([msg.key]);
                    await reactToStatus(sock, msg.key);
                } catch (err) {
                    if (err.message?.includes('rate-overlimit')) {
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        await sock.readMessages([msg.key]);
                    } else {
                        throw err;
                    }
                }
                return;
            }
        }

        if (status.key && status.key.remoteJid === 'status@broadcast') {
            try {
                await sock.readMessages([status.key]);
                await reactToStatus(sock, status.key);
            } catch (err) {
                if (err.message?.includes('rate-overlimit')) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    await sock.readMessages([status.key]);
                } else {
                    throw err;
                }
            }
            return;
        }

        if (status.reaction && status.reaction.key.remoteJid === 'status@broadcast') {
            try {
                await sock.readMessages([status.reaction.key]);
                await reactToStatus(sock, status.reaction.key);
            } catch (err) {
                if (err.message?.includes('rate-overlimit')) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    await sock.readMessages([status.reaction.key]);
                } else {
                    throw err;
                }
            }
            return;
        }

    } catch (error) {
        console.error('Error in auto status view:', error.message);
    }
}

module.exports = {
    autoStatusCommand,
    handleStatusUpdate
};