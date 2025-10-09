const fs = require('fs');
const path = require('path');
const isAdmin = require('../lib/isAdmin');

const ANTITAG_STATE_FILE = path.join(__dirname, 'antitag_state.json');

// Function to read antitag state
function readAntitagState() {
    try {
        if (fs.existsSync(ANTITAG_STATE_FILE)) {
            const data = fs.readFileSync(ANTITAG_STATE_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error reading antitag state:', error);
    }
    return { enabled: false, groups: {} };
}

// Function to save antitag state
function saveAntitagState(state) {
    try {
        fs.writeFileSync(ANTITAG_STATE_FILE, JSON.stringify(state, null, 2));
    } catch (error) {
        console.error('Error saving antitag state:', error);
    }
}

// Function to get antitag state
function getAntitag(groupId) {
    const state = readAntitagState();
    if (groupId) {
        return state.groups[groupId] || { enabled: false };
    }
    return state;
}

// Function to set antitag state
function setAntitag(groupId, enabled, action = 'delete') {
    const state = readAntitagState();
    if (groupId) {
        state.groups[groupId] = { 
            enabled: enabled, 
            action: action,
            enabledAt: enabled ? new Date().toISOString() : null 
        };
    } else {
        state.enabled = enabled;
        state.action = action;
    }
    saveAntitagState(state);
    return state.groups[groupId] || state;
}

// Function to remove antitag
function removeAntitag(groupId) {
    const state = readAntitagState();
    if (groupId && state.groups[groupId]) {
        delete state.groups[groupId];
        saveAntitagState(state);
        return true;
    }
    return false;
}

async function handleAntitagCommand(sock, chatId, userMessage, senderId, isSenderAdmin) {
    try {
        if (!isSenderAdmin) {
            await sock.sendMessage(chatId, { text: '```For Group Admins Only!```' });
            return;
        }

        const prefix = '.';
        const args = userMessage.slice(9).toLowerCase().trim().split(' ');
        const action = args[0];

        if (!action) {
            const usage = `\`\`\`ANTITAG SETUP\n\n${prefix}antitag on\n${prefix}antitag set delete | kick\n${prefix}antitag off\n\`\`\``;
            await sock.sendMessage(chatId, { text: usage });
            return;
        }

        switch (action) {
            case 'on':
                const existingConfig = getAntitag(chatId);
                if (existingConfig?.enabled) {
                    await sock.sendMessage(chatId, { text: '*_Antitag is already on_*' });
                    return;
                }
                const result = setAntitag(chatId, true, 'delete');
                await sock.sendMessage(chatId, { 
                    text: result ? '*_Antitag has been turned ON_*' : '*_Failed to turn on Antitag_*' 
                });
                break;

            case 'off':
                const removed = removeAntitag(chatId);
                await sock.sendMessage(chatId, { 
                    text: removed ? '*_Antitag has been turned OFF_*' : '*_Antitag was not active_*' 
                });
                break;

            case 'set':
                if (args.length < 2) {
                    await sock.sendMessage(chatId, { 
                        text: `*_Please specify an action: ${prefix}antitag set delete | kick_*` 
                    });
                    return;
                }
                const setAction = args[1];
                if (!['delete', 'kick'].includes(setAction)) {
                    await sock.sendMessage(chatId, { 
                        text: '*_Invalid action. Choose delete or kick._*' 
                    });
                    return;
                }
                const setResult = setAntitag(chatId, true, setAction);
                await sock.sendMessage(chatId, { 
                    text: setResult ? `*_Antitag action set to ${setAction}_*` : '*_Failed to set Antitag action_*' 
                });
                break;

            case 'get':
                const status = getAntitag(chatId);
                await sock.sendMessage(chatId, { 
                    text: `*_Antitag Configuration:_*\nStatus: ${status.enabled ? 'ON' : 'OFF'}\nAction: ${status.action || 'delete'}` 
                });
                break;

            default:
                await sock.sendMessage(chatId, { text: `*_Use ${prefix}antitag for usage._*` });
        }
    } catch (error) {
        console.error('Error in antitag command:', error);
        await sock.sendMessage(chatId, { text: '*_Error processing antitag command_*' });
    }
}

async function handleTagDetection(sock, chatId, message, senderId) {
    try {
        const antitagSetting = getAntitag(chatId);
        if (!antitagSetting || !antitagSetting.enabled) return;

        // Check if message contains mentions
        const mentions = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || 
                        [];

        // Check if it's a group message and has multiple mentions
        if (mentions.length > 0 && mentions.length >= 3) {
            // Get group participants to check if it's tagging most/all members
            const groupMetadata = await sock.groupMetadata(chatId);
            const participants = groupMetadata.participants || [];
            
            // If mentions are more than 50% of group members, consider it as tagall
            const mentionThreshold = Math.ceil(participants.length * 0.5);
            
            if (mentions.length >= mentionThreshold) {
                console.log(`Antitag: Detected tagall in group ${chatId} by ${senderId}`);
                
                const action = antitagSetting.action || 'delete';
                
                if (action === 'delete') {
                    // Delete the message
                    await sock.sendMessage(chatId, {
                        delete: {
                            remoteJid: chatId,
                            fromMe: false,
                            id: message.key.id,
                            participant: senderId
                        }
                    });
                    
                    // Send warning
                    await sock.sendMessage(chatId, {
                        text: `⚠️ *Tagall Detected!* Message has been deleted.`
                    });
                    
                } else if (action === 'kick') {
                    // Kick the user
                    await sock.groupParticipantsUpdate(chatId, [senderId], "remove");
                    
                    // Send notification
                    await sock.sendMessage(chatId, {
                        text: `🚫 *User Kicked!*\n\n@${senderId.split('@')[0]} has been kicked for tagging all members.`
                    });
                }
            }
        }
    } catch (error) {
        console.error('Error in tag detection:', error);
    }
}

module.exports = {
    readAntitagState,
    saveAntitagState,
    getAntitag,
    setAntitag,
    removeAntitag,
    handleAntitagCommand,
    handleTagDetection
};
