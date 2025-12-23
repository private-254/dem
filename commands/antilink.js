const { setAntilink, getAntilink, removeAntilink } = require('../lib/index');
const isAdmin = require('../lib/isAdmin');

function createFakeContact(message) {
    return {
        key: {
            participants: "0@s.whatsapp.net",
            remoteJid: "0@s.whatsapp.net",
            fromMe: false
        },
        message: {
            contactMessage: {
                displayName: "DaveX Security",
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Security;;;\nFN:DaveX Security\nitem1.TEL;waid=${message.key.participant?.split('@')[0] || message.key.remoteJid.split('@')[0]}:${message.key.participant?.split('@')[0] || message.key.remoteJid.split('@')[0]}\nitem1.X-ABLabel:Security Bot\nEND:VCARD`
            }
        },
        participant: "0@s.whatsapp.net"
    };
}

async function handleAntilinkCommand(sock, chatId, userMessage, senderId, isSenderAdmin) {
    try {
        const fakeContact = createFakeContact({ key: { participant: senderId, remoteJid: chatId } });
        
        if (!isSenderAdmin) {
            await sock.sendMessage(chatId, { text: 'Admins only' }, { quoted: fakeContact });
            return;
        }

        const args = userMessage.slice(9).toLowerCase().trim().split(' ');
        const action = args[0];

        if (!action) {
            const text = 'Commands:\non\noff\nset delete/kick/warn\nget\n\n🎄 Merry Christmas';
            await sock.sendMessage(chatId, { text }, { quoted: fakeContact });
            return;
        }

        switch (action) {
            case 'on': {
                const existingConfig = await getAntilink(chatId, 'on');
                if (existingConfig?.enabled) {
                    await sock.sendMessage(chatId, { text: 'Already ON' }, { quoted: fakeContact });
                    return;
                }
                const result = await setAntilink(chatId, 'on', 'delete');
                await sock.sendMessage(chatId, { 
                    text: result ? 'Antilink ON' : 'Failed to enable' 
                }, { quoted: fakeContact });
                break;
            }

            case 'off': {
                await removeAntilink(chatId, 'on');
                await sock.sendMessage(chatId, { text: 'Antilink OFF' }, { quoted: fakeContact });
                break;
            }

            case 'set': {
                if (args.length < 2) {
                    await sock.sendMessage(chatId, { 
                        text: 'Set: delete, kick, or warn' 
                    }, { quoted: fakeContact });
                    return;
                }
                const setAction = args[1];
                if (!['delete', 'kick', 'warn'].includes(setAction)) {
                    await sock.sendMessage(chatId, { text: 'Invalid action' }, { quoted: fakeContact });
                    return;
                }
                const setResult = await setAntilink(chatId, 'on', setAction);
                await sock.sendMessage(chatId, { 
                    text: setResult ? `Action: ${setAction}` : 'Failed to set' 
                }, { quoted: fakeContact });
                break;
            }

            case 'get': {
                const status = await getAntilink(chatId, 'on');
                const actionConfig = await getAntilink(chatId, 'on');
                await sock.sendMessage(chatId, { 
                    text: `Status: ${status ? 'ON' : 'OFF'}\nAction: ${actionConfig ? actionConfig.action : 'Not set'}` 
                }, { quoted: fakeContact });
                break;
            }

            default:
                await sock.sendMessage(chatId, { text: 'Invalid command' }, { quoted: fakeContact });
        }
    } catch (error) {
        console.error('Antilink error:', error);
        await sock.sendMessage(chatId, { text: 'Error' }, { quoted: fakeContact });
    }
}

async function handleLinkDetection(sock, chatId, message, userMessage, senderId) {
    const antilinkConfig = await getAntilink(chatId, 'on');
    if (!antilinkConfig?.enabled) return;

    const senderIsAdmin = await isAdmin(sock, chatId, senderId);
    if (senderIsAdmin) return;

    const linkPatterns = {
        whatsappGroup: /chat\.whatsapp\.com\/[A-Za-z0-9]{20,}/,
        whatsappChannel: /wa\.me\/channel\/[A-Za-z0-9]{20,}/,
        telegram: /t\.me\/[A-Za-z0-9_]+/,
        allLinks: /https?:\/\/[^\s]+/,
    };

    let detected = false;
    if (linkPatterns.whatsappGroup.test(userMessage)) detected = true;
    else if (linkPatterns.whatsappChannel.test(userMessage)) detected = true;
    else if (linkPatterns.telegram.test(userMessage)) detected = true;
    else if (linkPatterns.allLinks.test(userMessage)) detected = true;

    if (!detected) return;

    const quotedMessageId = message.key.id;
    const quotedParticipant = message.key.participant || senderId;

    try {
        if (antilinkConfig.action === 'delete') {
            await sock.sendMessage(chatId, {
                delete: { remoteJid: chatId, fromMe: false, id: quotedMessageId, participant: quotedParticipant },
            });
        } else if (antilinkConfig.action === 'kick') {
            await sock.groupParticipantsUpdate(chatId, [senderId], 'remove');
        } else if (antilinkConfig.action === 'warn') {
            const mentionedJidList = [senderId];
            await sock.sendMessage(chatId, { 
                text: `@${senderId.split('@')[0]}, no links allowed`, 
                mentions: mentionedJidList 
            });
        }
    } catch (error) {
        console.error('Antilink action failed:', error);
    }
}

module.exports = {
    handleAntilinkCommand,
    handleLinkDetection,
};