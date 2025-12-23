const fs = require('fs');
const path = require('path');

const OWNER_FILE = path.join(__dirname, '..', 'data', 'owner.json');
const DEFAULT_OWNER_NAME = 'Not set';

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(OWNER_FILE)) {
    fs.writeFileSync(OWNER_FILE, JSON.stringify({ ownerName: DEFAULT_OWNER_NAME }, null, 2));
}

function getOwnerName() {
    try {
        const data = JSON.parse(fs.readFileSync(OWNER_FILE, 'utf8'));
        return data.ownerName || DEFAULT_OWNER_NAME;
    } catch (error) {
        console.error('Error reading owner file:', error);
        return DEFAULT_OWNER_NAME;
    }
}

function setOwnerName(newOwnerName) {
    try {
        if (!newOwnerName?.trim() || newOwnerName.trim().length > 20) return false;

        const trimmedName = newOwnerName.trim();
        fs.writeFileSync(OWNER_FILE, JSON.stringify({ ownerName: trimmedName }, null, 2));
        return true;
    } catch (error) {
        console.error('Error setting owner name:', error);
        return false;
    }
}

function resetOwnerName() {
    try {
        fs.writeFileSync(OWNER_FILE, JSON.stringify({ ownerName: DEFAULT_OWNER_NAME }, null, 2));
        return true;
    } catch (error) {
        console.error('Error resetting owner name:', error);
        return false;
    }
}

function validateOwnerName(name) {
    if (!name?.trim()) return { isValid: false, message: 'Owner name cannot be empty' };

    const trimmed = name.trim();
    if (trimmed.length > 20) return { isValid: false, message: 'Owner name must be 1-20 characters long' };

    const invalidChars = /[<>@#\$%\^\*\\\/]/;
    if (invalidChars.test(trimmed)) return { isValid: false, message: 'Owner name contains invalid characters' };

    return { isValid: true, message: 'Valid owner name' };
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
                displayName: "Davex Config",
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Config;;;\nFN:Davex Configuration\nitem1.TEL;waid=${phone}:${phone}\nitem1.X-ABLabel:Config Bot\nEND:VCARD`
            }
        },
        participant: "0@s.whatsapp.net"
    };
}

async function handleSetOwnerCommand(sock, chatId, senderId, message, userMessage, currentPrefix) {
    const fakeContact = createFakeContact(message);
    const args = userMessage.split(' ').slice(1);
    const input = args.join(' ');

    if (!message.key.fromMe) {
        await sock.sendMessage(chatId, { 
            text: 'Bot configuration access restricted'
        }, { quoted: fakeContact });
        return;
    }

    if (!input) {
        const current = getOwnerName();
        const replyText = `Current Owner Name: ${current}\n\nUse format: ${currentPrefix}setowner [name]\nSample: ${currentPrefix}setowner Admin\nTo revert: ${currentPrefix}setowner revert`;
        
        await sock.sendMessage(chatId, { 
            text: replyText 
        }, { quoted: fakeContact });
        return;
    }

    if (input.toLowerCase() === 'revert') {
        const success = resetOwnerName();
        const response = success ? 
            `Owner name reverted to default: ${DEFAULT_OWNER_NAME}` : 
            'Unable to revert owner name';
        await sock.sendMessage(chatId, { text: response }, { quoted: fakeContact });
        return;
    }

    const validation = validateOwnerName(input);
    if (!validation.isValid) {
        await sock.sendMessage(chatId, { 
            text: validation.message 
        }, { quoted: fakeContact });
        return;
    }

    const success = setOwnerName(input);
    const response = success ? 
        `Owner name configured to: ${input.trim()}` : 
        'Configuration update failed';

    await sock.sendMessage(chatId, { text: response }, { quoted: fakeContact });
}

function getOwnerInfo() {
    const ownerName = getOwnerName();
    return {
        name: ownerName,
        formattedName: ownerName,
        isDefault: ownerName === DEFAULT_OWNER_NAME
    };
}

function isOwnerNameMatch(nameToCheck, caseSensitive = true) {
    const currentOwner = getOwnerName();
    return caseSensitive ? 
        currentOwner === nameToCheck : 
        currentOwner.toLowerCase() === nameToCheck.toLowerCase();
}

module.exports = {
    getOwnerName,
    setOwnerName,
    resetOwnerName,
    handleSetOwnerCommand,
    validateOwnerName,
    getOwnerInfo,
    isOwnerNameMatch,
    DEFAULT_OWNER_NAME
};