const fs = require('fs');
const path = require('path');

const PREFIX_FILE = path.join(__dirname, '..', 'data', 'prefix.json');
const DEFAULT_PREFIX = '.';
const NO_PREFIX = 'none';

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(PREFIX_FILE)) {
    fs.writeFileSync(PREFIX_FILE, JSON.stringify({ prefix: DEFAULT_PREFIX }, null, 2));
}

function createFakeContact(message) {
    const phone = message.key.participant?.split('@')[0] || message.key.remoteJid.split('@')[0];
    return {
        key: {
            participants: "0@s.whatsapp.net",
            remoteJid: "0@s.whatsapp.net",
            fromMe: false
        },
        message: {
            contactMessage: {
                displayName: "Davex Prefix",
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Prefix;;;\nFN:Davex Prefix Settings\nitem1.TEL;waid=${phone}:${phone}\nitem1.X-ABLabel:Prefix Bot\nEND:VCARD`
            }
        },
        participant: "0@s.whatsapp.net"
    };
}

function getPrefix() {
    try {
        const data = JSON.parse(fs.readFileSync(PREFIX_FILE, 'utf8'));
        return data.prefix === NO_PREFIX ? '' : (data.prefix || DEFAULT_PREFIX);
    } catch (error) {
        console.error('Error reading prefix file:', error);
        return DEFAULT_PREFIX;
    }
}

function getRawPrefix() {
    try {
        const data = JSON.parse(fs.readFileSync(PREFIX_FILE, 'utf8'));
        return data.prefix || DEFAULT_PREFIX;
    } catch (error) {
        console.error('Error reading prefix file:', error);
        return DEFAULT_PREFIX;
    }
}

function setPrefix(newPrefix) {
    try {
        if (newPrefix === '') {
            const data = { prefix: NO_PREFIX };
            fs.writeFileSync(PREFIX_FILE, JSON.stringify(data, null, 2));
            return true;
        } else if (newPrefix && newPrefix.length <= 3) {
            const data = { prefix: newPrefix };
            fs.writeFileSync(PREFIX_FILE, JSON.stringify(data, null, 2));
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error setting prefix:', error);
        return false;
    }
}

function resetPrefix() {
    try {
        const data = { prefix: DEFAULT_PREFIX };
        fs.writeFileSync(PREFIX_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error resetting prefix:', error);
        return false;
    }
}

function isPrefixless() {
    return getRawPrefix() === NO_PREFIX;
}

async function handleSetPrefixCommand(sock, chatId, senderId, message, userMessage, currentPrefix) {
    const fakeContact = createFakeContact(message);
    const args = userMessage.split(' ').slice(1);
    const newPrefix = args[0];

    if (!message.key.fromMe) {
        await sock.sendMessage(chatId, { 
            text: 'Access denied'
        }, { quoted: fakeContact });
        return;
    }

    if (!newPrefix) {
        const current = getRawPrefix();
        const displayPrefix = current === NO_PREFIX ? 'Disabled' : current;
        const prefixText = current === NO_PREFIX ? 'prefix' : current + 'prefix';
        
        await sock.sendMessage(chatId, { 
            text: `Current prefix marker: ${displayPrefix}\n\nFormat: ${prefixText} [symbol]\nExamples:\n${prefixText} !\n${prefixText} off (no prefix)\n${prefixText} default`
        }, { quoted: fakeContact });
        return;
    }

    if (newPrefix === 'default') {
        const success = resetPrefix();
        if (success) {
            const defaultPrefix = getPrefix();
            await sock.sendMessage(chatId, { 
                text: `Prefix marker reset to: ${defaultPrefix}`
            }, { quoted: fakeContact });
        } else {
            await sock.sendMessage(chatId, { 
                text: 'Failed to reset prefix marker'
            }, { quoted: fakeContact });
        }
        return;
    }

    if (newPrefix === 'off') {
        const success = setPrefix('');
        if (success) {
            await sock.sendMessage(chatId, { 
                text: 'Prefix marker disabled'
            }, { quoted: fakeContact });
        } else {
            await sock.sendMessage(chatId, { 
                text: 'Failed to disable prefix marker'
            }, { quoted: fakeContact });
        }
        return;
    }

    if (newPrefix.length > 3) {
        await sock.sendMessage(chatId, { 
            text: 'Prefix marker limited to 3 characters'
        }, { quoted: fakeContact });
        return;
    }

    const success = setPrefix(newPrefix);
    if (success) {
        await sock.sendMessage(chatId, { 
            text: `Prefix marker updated to: ${newPrefix}`
        }, { quoted: fakeContact });
    } else {
        await sock.sendMessage(chatId, { 
            text: 'Failed to update prefix marker'
        }, { quoted: fakeContact });
    }
}

module.exports = {
    getPrefix,
    getRawPrefix,
    setPrefix,
    resetPrefix,
    isPrefixless,
    handleSetPrefixCommand,
    NO_PREFIX
};