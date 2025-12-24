/*************************************
* Raw Output Suppression Code
*************************************/

const originalWrite = process.stdout.write;
process.stdout.write = function (chunk, encoding, callback) {
    const message = chunk.toString();

    if (message.includes('Closing session: SessionEntry') || message.includes('SessionEntry {')) {
        return;
    }

    return originalWrite.apply(this, arguments);
};

const originalWriteError = process.stderr.write;
process.stderr.write = function (chunk, encoding, callback) {
    const message = chunk.toString();
    if (message.includes('Closing session: SessionEntry')) {
        return;
    }
    return originalWriteError.apply(this, arguments);
};

const originalLog = console.log;
console.log = function (message, ...optionalParams) {

    if (typeof message === 'string' && message.startsWith('Closing session: SessionEntry')) {
        return;
    }

    originalLog.apply(console, [message, ...optionalParams]);
};

/*━━━━━━━━━━━━━━━━━━━━*/
// -----Core imports first-----
/*━━━━━━━━━━━━━━━━━━━━*/
const settings = require('./settings');
require('./config.js');
const { isBanned } = require('./lib/isBanned');
const yts = require('yt-search');
const { fetchBuffer } = require('./lib/myfunc');
const fs = require('fs');
const fsPromises = fs.promises; // Async file operations
const fetch = require('node-fetch');
const ytdl = require('ytdl-core');
const path = require('path');
const chalk = require('chalk');
const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');
const { jidDecode } = require('@whiskeysockets/baileys');
const { isSudo } = require('./lib/index');
const isAdmin = require('./lib/isAdmin');
const { Antilink } = require('./lib/antilink');
const { tictactoeCommand, handleTicTacToeMove } = require('./commands/tictactoe');

// Performance optimizations
const commandCache = new Map();
const adminCache = new Map();
const ADMIN_CACHE_TTL = 5000; // 5 seconds cache
const fileCache = new Map();
const FILE_CACHE_TTL = 3000; // 3 seconds cache

// Fast command queue to prevent overlap
class CommandQueue {
    constructor() {
        this.queue = [];
        this.processing = false;
    }

    async add(task) {
        return new Promise((resolve) => {
            this.queue.push({ task, resolve });
            if (!this.processing) {
                this.process();
            }
        });
    }

    async process() {
        if (this.queue.length === 0) {
            this.processing = false;
            return;
        }
        
        this.processing = true;
        const { task, resolve } = this.queue.shift();
        
        try {
            const result = await task();
            resolve(result);
        } catch (error) {
            console.error('Queue task error:', error.message);
            resolve(null);
        }
        
        setImmediate(() => this.process());
    }
}

const commandQueue = new CommandQueue();

/*━━━━━━━━━━━━━━━━━━━━*/
// Async file read with cache
async function cachedFileRead(filePath) {
    const cached = fileCache.get(filePath);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp < FILE_CACHE_TTL)) {
        return cached.data;
    }
    
    try {
        const data = await fsPromises.readFile(filePath, 'utf8');
        fileCache.set(filePath, { data, timestamp: now });
        return data;
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error.message);
        throw error;
    }
}

async function cachedAdminCheck(sock, chatId, userId) {
    const cacheKey = `${chatId}:${userId}`;
    const cached = adminCache.get(cacheKey);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp < ADMIN_CACHE_TTL)) {
        return cached.result;
    }
    
    const result = await isAdmin(sock, chatId, userId);
    adminCache.set(cacheKey, { result, timestamp: now });
    
    setTimeout(() => {
        adminCache.delete(cacheKey);
    }, ADMIN_CACHE_TTL + 1000);
    
    return result;
}

/*━━━━━━━━━━━━━━━━━━━━*/
// -----Command imports - Handlers-----
/*━━━━━━━━━━━━━━━━━━━━*/
const { 
   autotypingCommand,
   isAutotypingEnabled,
   handleAutotypingForMessage,
   handleAutotypingForCommand, 
   showTypingAfterCommand
} = require('./commands/autotyping');

const {
  getPrefix, 
  handleSetPrefixCommand 
} = require('./commands/setprefix');

const {
  getOwnerName, 
  handleSetOwnerCommand 
} = require('./commands/setowner');

const {
 autoreadCommand,
 isAutoreadEnabled, 
 handleAutoread 
} = require('./commands/autoread');

const { 
 incrementMessageCount, 
 topMembers 
} = require('./commands/topmembers');

const { 
 setGroupDescription, 
 setGroupName, 
 setGroupPhoto 
} = require('./commands/groupmanage');

const { 
 handleAntilinkCommand, 
 handleLinkDetection 
} = require('./commands/antilink');

const { 
 handleAntitagCommand, 
 handleTagDetection
} = require('./commands/antitag');

const { 
 handleMentionDetection,
 mentionToggleCommand,
 setMentionCommand
} = require('./commands/mention');

const { 
 handleAntiBadwordCommand,
 handleBadwordDetection
} = require('./lib/antibadword');

const { 
 handleChatbotCommand,
 handleChatbotResponse
} = require('./commands/chatbot');

const { 
  welcomeCommand,
  handleJoinEvent
} = require('./commands/welcome');

const {
 goodbyeCommand,
 handleLeaveEvent
} = require('./commands/goodbye');

const {
 handleAntideleteCommand,
 handleMessageRevocation,
 storeMessage 
} = require('./commands/antidelete');

const {
 anticallCommand,
 readState: readAnticallState 
} = require('./commands/anticall');

const {
 pmblockerCommand, 
 readState: readPmBlockerState 
} = require('./commands/pmblocker');

const {
 addCommandReaction, 
 handleAreactCommand 
} = require('./lib/reactions');

const {
  autoStatusCommand, 
  handleStatusUpdate 
} = require('./commands/autostatus');

const {
 startHangman, 
 guessLetter 
} = require('./commands/hangman');

const {
 startTrivia, 
 answerTrivia 
} = require('./commands/trivia');

const {
 miscCommand, 
 handleHeart 
} = require('./commands/misc');

/*━━━━━━━━━━━━━━━━━━━━*/
// -----Command imports-----
/*━━━━━━━━━━━━━━━━━━━━*/
const getppCommand = require('./commands/getpp');
const tagAllCommand = require('./commands/tagall');
const helpCommand = require('./commands/help');
const banCommand = require('./commands/ban');
const { promoteCommand } = require('./commands/promote');
const { demoteCommand } = require('./commands/demote');
const muteCommand = require('./commands/mute');
const unmuteCommand = require('./commands/unmute');
const stickerCommand = require('./commands/sticker');
const warnCommand = require('./commands/warn');
const warningsCommand = require('./commands/warnings');
const ttsCommand = require('./commands/tts');
const ownerCommand = require('./commands/owner');
const deleteCommand = require('./commands/delete');
const memeCommand = require('./commands/meme');
const tagCommand = require('./commands/tag');
const tagNotAdminCommand = require('./commands/tagnotadmin');
const hideTagCommand = require('./commands/hidetag');
const jokeCommand = require('./commands/joke');
const quoteCommand = require('./commands/quote');
const factCommand = require('./commands/fact');
const weatherCommand = require('./commands/weather');
const newsCommand = require('./commands/news');
const kickCommand = require('./commands/kick');
const simageCommand = require('./commands/simage');
const attpCommand = require('./commands/attp');
const { complimentCommand } = require('./commands/compliment');
const { insultCommand } = require('./commands/insult');
const { eightBallCommand } = require('./commands/eightball');
const { lyricsCommand } = require('./commands/lyrics');
const { dareCommand } = require('./commands/dare');
const { truthCommand } = require('./commands/truth');
const { clearCommand } = require('./commands/clear');
const pingCommand = require('./commands/ping');
const aliveCommand = require('./commands/alive');
const blurCommand = require('./commands/img-blur');
const githubCommand = require('./commands/github');
const antibadwordCommand = require('./commands/antibadword');
const takeCommand = require('./commands/take');
const { flirtCommand } = require('./commands/flirt');
const characterCommand = require('./commands/character');
const wastedCommand = require('./commands/wasted');
const shipCommand = require('./commands/ship');
const groupInfoCommand = require('./commands/groupinfo');
const resetlinkCommand = require('./commands/resetlink');
const staffCommand = require('./commands/staff');
const unbanCommand = require('./commands/unban');
const emojimixCommand = require('./commands/emojimix');
const { handlePromotionEvent } = require('./commands/promote');
const { handleDemotionEvent } = require('./commands/demote');
const viewOnceCommand = require('./commands/viewonce');
const clearSessionCommand = require('./commands/clearsession');
const { simpCommand } = require('./commands/simp');
const { stupidCommand } = require('./commands/stupid');
const stickerTelegramCommand = require('./commands/stickertelegram');
const textmakerCommand = require('./commands/textmaker');
const clearTmpCommand = require('./commands/cleartmp');
const setProfilePicture = require('./commands/setpp');
const instagramCommand = require('./commands/instagram');
const facebookCommand = require('./commands/facebook');
const spotifyCommand = require('./commands/spotify');
const playCommand = require('./commands/play');
const tiktokCommand = require('./commands/tiktok');
const songCommand = require('./commands/song');
const aiCommand = require('./commands/ai');
const urlCommand = require('./commands/url');
const { handleTranslateCommand } = require('./commands/translate');
const { handleSsCommand } = require('./commands/ss');
const { goodnightCommand } = require('./commands/goodnight');
const { shayariCommand } = require('./commands/shayari');
const { rosedayCommand } = require('./commands/roseday');
const imagineCommand = require('./commands/imagine');
const videoCommand = require('./commands/video');
const sudoCommand = require('./commands/sudo');
const { animeCommand } = require('./commands/anime');
const { piesCommand, piesAlias } = require('./commands/pies');
const stickercropCommand = require('./commands/stickercrop');
const updateCommand = require('./commands/update');
const removebgCommand = require('./commands/removebg');
const { reminiCommand } = require('./commands/remini');
const { igsCommand } = require('./commands/igs');
const settingsCommand = require('./commands/settings');
const soraCommand = require('./commands/sora');
const apkCommand = require('./commands/apk');
const menuConfigCommand = require('./commands/menuConfig');
const shazamCommand = require('./commands/shazam');
const saveStatusCommand = require('./commands/saveStatus');
const toAudioCommand = require('./commands/toAudio');
const gitcloneCommand = require('./commands/gitclone');
const leaveGroupCommand = require('./commands/leave');
const kickAllCommand = require('./commands/kickAll');
const { blockCommand, unblockCommand, blocklistCommand } = require('./commands/blockUnblock');
const ytsCommand = require('./commands/yts');
const setGroupStatusCommand = require('./commands/setGroupStatus');
const handleDevReact = require('./commands/devReact');

/*━━━━━━━━━━━━━━━━━━━━*/
// Global settings
/*━━━━━━━━━━━━━━━━━━━━*/
global.packname = settings?.packname || "DAVE MD";
global.author = settings?.author || "Vinpink2";
global.channelLink = "https://whatsapp.com/channel/0029VbApvFQ2Jl84lhONkc3k";
global.ytchanel = "";

// Channel info for message context
const channelInfo = {
    contextInfo: {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363400480173280@newsletter',
            newsletterName: 'Dave Tech',
            serverMessageId: -1
        }
    }
};

/*━━━━━━━━━━━━━━━━━━━━*/
// Optimized Command Handler with ALL Commands
/*━━━━━━━━━━━━━━━━━━━━*/
async function handleMessages(sock, messageUpdate, printLog) {
    // Use queue to prevent command overlap
    await commandQueue.add(async () => {
        await processMessage(sock, messageUpdate);
    });
}

async function processMessage(sock, messageUpdate) {
    try {
        const { messages, type } = messageUpdate;
        if (type !== 'notify') return;

        const message = messages[0];
        if (!message?.message) return;

        // Handle autoread functionality
        await handleAutoread(sock, message);

        // Handle devReact
        await handleDevReact(sock, message);

        // Store message for antidelete feature (non-blocking)
        if (message.message) {
            setImmediate(() => storeMessage(sock, message));
        }

        // Handle message revocation
        if (message.message?.protocolMessage?.type === 0) {
            await handleMessageRevocation(sock, message);
            return;
        }

        const chatId = message.key.remoteJid;
        const senderId = message.key.participant || message.key.remoteJid;

        /*━━━━━━━━━━━━━━━━━━━━*/
        // Dynamic prefix              
        /*━━━━━━━━━━━━━━━━━━━━*/
        const prefix = getPrefix();
        const isGroup = chatId.endsWith('@g.us');
        const senderIsSudo = await isSudo(senderId);

        const userMessage = (
            message.message?.conversation?.trim() ||
            message.message?.extendedTextMessage?.text?.trim() ||
            message.message?.imageMessage?.caption?.trim() ||
            message.message?.videoMessage?.caption?.trim() ||
            ''
        ).toLowerCase().replace(/\.\s+/g, '.').trim();

        // Preserve raw message for commands like .tag that need original casing
        const rawText = message.message?.conversation?.trim() ||
            message.message?.extendedTextMessage?.text?.trim() ||
            message.message?.imageMessage?.caption?.trim() ||
            message.message?.videoMessage?.caption?.trim() ||
            '';

        // fakeQuoted
        function createFakeContact(message) {
            return {
                key: {
                    participants: "0@s.whatsapp.net",
                    remoteJid: "status@broadcast",
                    fromMe: false,
                    id: "DAVE-X"
                },
                message: {
                    contactMessage: {
                        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:DAVE MD\nitem1.TEL;waid=${message.key.participant?.split('@')[0] || message.key.remoteJid.split('@')[0]}:${message.key.participant?.split('@')[0] || message.key.remoteJid.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
                    }
                },
                participant: "0@s.whatsapp.net"
            };
        }

        const fake = createFakeContact(message);

        /*━━━━━━━━━━━━━━━━━━━━*/
        // Console logging (optimized - non-blocking)
        /*━━━━━━━━━━━━━━━━━━━━*/
        if (userMessage) {
            sock.decodeJid = (jid) => {
                if (!jid) return jid;
                if (/:\d+@/gi.test(jid)) {
                    let decode = jidDecode(jid) || {};
                    return decode.user && decode.server ? `${decode.user}@${decode.server}` : jid;
                } else return jid;
            };

            const groupMetadata = isGroup
                ? await sock.groupMetadata(chatId).catch(() => ({}))
                : {};
            const from = sock.decodeJid(message.key.remoteJid);
            const participant = sock.decodeJid(message.key.participant || from);
            const body = message.message.conversation || message.message.extendedTextMessage?.text || '';
            const pushname = message.pushName || "Unknown User";
            const chatType = chatId.endsWith('@g.us') ? 'Group' : 'Private';
            const chatName = chatType === 'Group' ? (groupMetadata?.subject || 'Unknown Group') : pushname;
            const time = new Date().toLocaleTimeString();

            // Log asynchronously to not block command execution
            setImmediate(() => {
                console.log(chalk.bgHex('#121212').blue.bold(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📥 INCOMING MESSAGE: ${time}
  👤 From: ${pushname}: ${participant}
  💬 Chat Type: ${chatType}: ${chatName}
  💭 Message: ${body || "—"}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`));
            });
        }

        // Enforce private mode (async file read)
        try {
            const dataStr = await cachedFileRead('./data/messageCount.json');
            const data = JSON.parse(dataStr);
            if (!data.isPublic && !message.key.fromMe && !senderIsSudo) {
                return;
            }
        } catch (error) {
            console.error('Error checking access mode:', error.message);
        }

        // Check if user is banned
        if (isBanned(senderId) && !userMessage.startsWith(`${prefix}unban`)) {
            if (Math.random() < 0.1) {
                await sock.sendMessage(chatId, {
                    text: '❌ You are banned from using the bot. Contact an admin to get unbanned.',
                    ...channelInfo
                });
            }
            return;
        }

        // First check if it's a game move
        if (/^[1-9]$/.test(userMessage) || userMessage.toLowerCase() === 'surrender') {
            await handleTicTacToeMove(sock, chatId, senderId, userMessage);
            return;
        }

        // Increment message count (non-blocking)
        if (!message.key.fromMe) {
            setImmediate(() => incrementMessageCount(chatId, senderId));
        }

        // Check for bad words and antilink (parallel execution)
        if (isGroup && userMessage) {
            await Promise.all([
                handleBadwordDetection(sock, chatId, message, userMessage, senderId),
                Antilink(message, sock)
            ]);
        }

        // PM blocker
        if (!isGroup && !message.key.fromMe && !senderIsSudo) {
            try {
                const pmState = readPmBlockerState();
                if (pmState.enabled) {
                    await sock.sendMessage(chatId, { text: pmState.message || 'Private messages are blocked. Please contact the owner in groups only.' });
                    await new Promise(r => setTimeout(r, 1500));
                    try { await sock.updateBlockStatus(chatId, 'block'); } catch (e) { }
                    return;
                }
            } catch (e) { }
        }

        /*━━━━━━━━━━━━━━━━━━━━*/
        // Check for command prefix
        /*━━━━━━━━━━━━━━━━━━━━*/
        if (!userMessage.startsWith(prefix)) {
            await handleAutotypingForMessage(sock, chatId, userMessage);
            
            if (isGroup) {
                // Run non-command handlers in parallel
                await Promise.all([
                    handleChatbotResponse(sock, chatId, message, userMessage, senderId),
                    handleTagDetection(sock, chatId, message, senderId),
                    handleMentionDetection(sock, chatId, message)
                ]);
            }
            return;
        }

        // Pre-calculate admin status for group commands
        let isSenderAdmin = false;
        let isBotAdmin = false;
        
        if (isGroup) {
            const adminStatus = await cachedAdminCheck(sock, chatId, senderId);
            isSenderAdmin = adminStatus.isSenderAdmin;
            isBotAdmin = adminStatus.isBotAdmin;
        }

        // Execute command using optimized handler
        await executeCommandFast(sock, chatId, message, userMessage, rawText, prefix, fake, {
            isGroup,
            isSenderAdmin,
            isBotAdmin,
            senderId,
            senderIsSudo
        });

        // Show typing indicator after command (if enabled)
        await showTypingAfterCommand(sock, chatId);
        
        // Add reaction for commands starting with '.'
        if (userMessage.startsWith('.')) {
            await addCommandReaction(sock, message);
        }

    } catch (error) {
        console.error('❌ Error in message handler:', error.message);
        const chatId = messageUpdate.messages?.[0]?.key?.remoteJid;
        if (chatId) {
            await sock.sendMessage(chatId, {
                text: '❌ Failed to process command!',
                ...channelInfo
            });
        }
    }
}

/*━━━━━━━━━━━━━━━━━━━━*/
// ULTRA-FAST Command Router with ALL Commands
/*━━━━━━━━━━━━━━━━━━━━*/
async function executeCommandFast(sock, chatId, message, userMessage, rawText, prefix, fake, context) {
    const { isGroup, isSenderAdmin, isBotAdmin, senderId, senderIsSudo } = context;
    
    // Extract command and args
    const args = rawText.slice(prefix.length).trim().split(/\s+/);
    const command = args[0].toLowerCase();
    const commandArgs = args.slice(1).join(' ');

    // Command router - O(1) lookup instead of switch statement
    const commandRouter = {
        // Prefix commands
        'setprefix': async () => handleSetPrefixCommand(sock, chatId, senderId, message, userMessage, prefix),
        'setowner': async () => handleSetOwnerCommand(sock, chatId, senderId, message, userMessage, prefix),
        
        // Media conversion commands
        'simage': async () => {
            const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            quoted?.stickerMessage ? await simageCommand(sock, quoted, chatId) : 
            await sock.sendMessage(chatId, { text: 'Reply to a sticker', ...channelInfo }, { quoted: fake });
        },
        'toimage': async () => {
            const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            quoted?.stickerMessage ? await simageCommand(sock, quoted, chatId) : 
            await sock.sendMessage(chatId, { text: 'Reply to a sticker', ...channelInfo }, { quoted: fake });
        },
        
        // Admin commands
        'kick': async () => {
            const mentioned = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
            await kickCommand(sock, chatId, senderId, mentioned, message);
        },
        
        'mute': async () => {
            const parts = userMessage.trim().split(/\s+/);
            const muteArg = parts[1];
            const muteDuration = muteArg !== undefined ? parseInt(muteArg, 10) : undefined;
            if (muteArg !== undefined && (isNaN(muteDuration) || muteDuration <= 0)) {
                await sock.sendMessage(chatId, { text: 'Invalid duration' }, { quoted: message });
            } else {
                await muteCommand(sock, chatId, senderId, message, muteDuration);
            }
        },
        
        'unmute': async () => await unmuteCommand(sock, chatId, senderId),
        'ban': async () => await banCommand(sock, chatId, message),
        'unban': async () => await unbanCommand(sock, chatId, message),
        'promote': async () => {
            const mentioned = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
            await promoteCommand(sock, chatId, mentioned, message);
        },
        'demote': async () => {
            const mentioned = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
            await demoteCommand(sock, chatId, mentioned, message);
        },
        
        // Music/song commands
        'shazam': async () => await shazamCommand(sock, chatId, message),
        'whatsong': async () => await shazamCommand(sock, chatId, message),
        'find': async () => await shazamCommand(sock, chatId, message),
        
        // Help commands
        'help': async () => await helpCommand(sock, chatId, message),
        'menu': async () => await helpCommand(sock, chatId, message),
        'list': async () => await helpCommand(sock, chatId, message),
        
        // Menu config
        'menuconfig': async () => await menuConfigCommand(sock, chatId, message, commandArgs.split(' ')),
        'menuset': async () => await menuConfigCommand(sock, chatId, message, commandArgs.split(' ')),
        'setmenu': async () => await menuConfigCommand(sock, chatId, message, commandArgs.split(' ')),
        
        // Sticker commands
        'sticker': async () => await stickerCommand(sock, chatId, message),
        's': async () => await stickerCommand(sock, chatId, message),
        
        // Warning commands
        'warnings': async () => {
            const mentioned = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
            await warningsCommand(sock, chatId, mentioned);
        },
        
        'warn': async () => {
            const mentioned = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
            await warnCommand(sock, chatId, senderId, mentioned, message);
        },
        
        // TTS command
        'tts': async () => {
            const text = rawText.slice((prefix + 'tts').length).trim();
            await ttsCommand(sock, chatId, text, message);
        },
        
        // Delete command
        'delete': async () => await deleteCommand(sock, chatId, message, senderId),
        'del': async () => await deleteCommand(sock, chatId, message, senderId),
        
        // ATTTP command
        'attp': async () => await attpCommand(sock, chatId, message),
        
        // APK command
        'apk': async () => await apkCommand(sock, chatId, message),
        
        // Settings command
        'settings': async () => await settingsCommand(sock, chatId, message),
        'getsettings': async () => await settingsCommand(sock, chatId, message),
        
        // Mode command (optimized with async file ops)
        'mode': async () => {
            if (!message.key.fromMe && !senderIsSudo) {
                await sock.sendMessage(chatId, { text: 'Owner only!' }, { quoted: fake });
                return;
            }
            
            const action = args[1]?.toLowerCase();
            if (!action) {
                let data;
                try {
                    const dataStr = await cachedFileRead('./data/messageCount.json');
                    data = JSON.parse(dataStr);
                } catch (error) {
                    await sock.sendMessage(chatId, { text: 'Failed to read mode' }, { quoted: fake });
                    return;
                }
                const currentMode = data.isPublic ? 'public' : 'private';
                await sock.sendMessage(chatId, {
                    text: `Current mode: *${currentMode}*\n\n${prefix}mode public|private`
                }, { quoted: fake });
                return;
            }
            
            if (action !== 'public' && action !== 'private') {
                await sock.sendMessage(chatId, { text: `${prefix}mode public|private` }, { quoted: fake });
                return;
            }
            
            try {
                const dataStr = await cachedFileRead('./data/messageCount.json');
                const data = JSON.parse(dataStr);
                data.isPublic = action === 'public';
                await fsPromises.writeFile('./data/messageCount.json', JSON.stringify(data, null, 2));
                fileCache.delete('./data/messageCount.json');
                await sock.sendMessage(chatId, { text: `✅ Set to *${action}* mode` }, { quoted: fake });
            } catch (error) {
                await sock.sendMessage(chatId, { text: 'Failed to update mode' }, { quoted: fake });
            }
        },
        
        // Anticall command
        'anticall': async () => {
            if (!message.key.fromMe && !senderIsSudo) {
                await sock.sendMessage(chatId, { text: 'Owner only!' }, { quoted: fake });
                return;
            }
            await anticallCommand(sock, chatId, message, commandArgs);
        },
        
        // PM blocker command
        'pmblocker': async () => {
            if (!message.key.fromMe && !senderIsSudo) {
                await sock.sendMessage(chatId, { text: 'Owner only!' }, { quoted: message });
                return;
            }
            await pmblockerCommand(sock, chatId, message, commandArgs);
        },
        
        // Owner command
        'owner': async () => await ownerCommand(sock, chatId),
        
        // Group commands
        'tagall': async () => {
            if (isSenderAdmin || message.key.fromMe) {
                await tagAllCommand(sock, chatId, senderId, message);
            } else {
                await sock.sendMessage(chatId, { text: 'Admins only', ...channelInfo }, { quoted: fake });
            }
        },
        
        'tagnotadmin': async () => await tagNotAdminCommand(sock, chatId, senderId, message),
        
        'hidetag': async () => {
            const messageText = rawText.slice((prefix + 'hidetag').length).trim();
            const replyMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
            await hideTagCommand(sock, chatId, senderId, messageText, replyMessage, message);
        },
        
        'tag': async () => {
            const messageText = rawText.slice((prefix + 'tag').length).trim();
            const replyMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
            await tagCommand(sock, chatId, senderId, messageText, replyMessage, message);
        },
        
        'antilink': async () => {
            if (!isGroup) {
                await sock.sendMessage(chatId, { text: 'Groups only', ...channelInfo }, { quoted: fake });
                return;
            }
            if (!isBotAdmin) {
                await sock.sendMessage(chatId, { text: 'Bot must be admin', ...channelInfo }, { quoted: message });
                return;
            }
            await handleAntilinkCommand(sock, chatId, userMessage, senderId, isSenderAdmin, message);
        },
        
        'antitag': async () => {
            if (!isGroup) {
                await sock.sendMessage(chatId, { text: 'Groups only', ...channelInfo }, { quoted: message });
                return;
            }
            if (!isBotAdmin) {
                await sock.sendMessage(chatId, { text: 'Bot must be admin', ...channelInfo }, { quoted: message });
                return;
            }
            await handleAntitagCommand(sock, chatId, userMessage, senderId, isSenderAdmin, message);
        },
        
        // Media/social commands
        'send': async () => await saveStatusCommand(sock, chatId, message),
        'get': async () => await saveStatusCommand(sock, chatId, message),
        'status': async () => await saveStatusCommand(sock, chatId, message),
        
        'setgstatus': async () => await setGroupStatusCommand(sock, chatId, message),
        'togroupstatus': async () => await setGroupStatusCommand(sock, chatId, message),
        'tosgroup': async () => await setGroupStatusCommand(sock, chatId, message),
        
        'meme': async () => await memeCommand(sock, chatId, message),
        'joke': async () => await jokeCommand(sock, chatId, message),
        'quote': async () => await quoteCommand(sock, chatId, message),
        'fact': async () => await factCommand(sock, chatId, message),
        
        'weather': async () => {
            const city = userMessage.slice((prefix + 'weather').length).trim();
            city ? await weatherCommand(sock, chatId, message, city) :
            await sock.sendMessage(chatId, { text: `${prefix}weather London`, ...channelInfo }, { quoted: message });
        },
        
        'news': async () => await newsCommand(sock, chatId),
        
        // Game commands
        'ttt': async () => {
            const tttText = userMessage.split(' ').slice(1).join(' ');
            await tictactoeCommand(sock, chatId, senderId, tttText);
        },
        'tictactoe': async () => {
            const tttText = userMessage.split(' ').slice(1).join(' ');
            await tictactoeCommand(sock, chatId, senderId, tttText);
        },
        
        'move': async () => {
            const position = parseInt(userMessage.split(' ')[1]);
            isNaN(position) ?
            await sock.sendMessage(chatId, { text: 'Invalid position', ...channelInfo }, { quoted: message }) :
            await handleTicTacToeMove(sock, chatId, senderId, position.toString());
        },
        
        'topmembers': async () => topMembers(sock, chatId, isGroup),
        
        'hangman': async () => startHangman(sock, chatId),
        'guess': async () => {
            const guessedLetter = userMessage.split(' ')[1];
            guessedLetter ? guessLetter(sock, chatId, guessedLetter) :
            sock.sendMessage(chatId, { text: `${prefix}guess <letter>`, ...channelInfo }, { quoted: message });
        },
        
        'trivia': async () => startTrivia(sock, chatId),
        'answer': async () => {
            const answer = userMessage.split(' ').slice(1).join(' ');
            answer ? answerTrivia(sock, chatId, answer) :
            sock.sendMessage(chatId, { text: `${prefix}answer <answer>`, ...channelInfo }, { quoted: message });
        },
        
        'compliment': async () => await complimentCommand(sock, chatId, message),
        'insult': async () => await insultCommand(sock, chatId, message),
        '8ball': async () => {
            const question = userMessage.split(' ').slice(1).join(' ');
            await eightBallCommand(sock, chatId, question);
        },
        'lyrics': async () => {
            const songTitle = userMessage.split(' ').slice(1).join(' ');
            await lyricsCommand(sock, chatId, songTitle, message);
        },
        
        'simp': async () => {
            const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const mentionedJid = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            await simpCommand(sock, chatId, quotedMsg, mentionedJid, senderId);
        },
        
        'stupid': async () => {
            const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const mentionedJid = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            const stupidArgs = userMessage.split(' ').slice(1);
            await stupidCommand(sock, chatId, quotedMsg, mentionedJid, senderId, stupidArgs);
        },
        'itssostupid': async () => {
            const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const mentionedJid = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            const stupidArgs = userMessage.split(' ').slice(1);
            await stupidCommand(sock, chatId, quotedMsg, mentionedJid, senderId, stupidArgs);
        },
        'iss': async () => {
            const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const mentionedJid = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
            const stupidArgs = userMessage.split(' ').slice(1);
            await stupidCommand(sock, chatId, quotedMsg, mentionedJid, senderId, stupidArgs);
        },
        
        'dare': async () => await dareCommand(sock, chatId, message),
        'truth': async () => await truthCommand(sock, chatId, message),
        'clear': async () => isGroup && await clearCommand(sock, chatId),
        
        // Ping/uptime commands
        'ping': async () => await pingCommand(sock, chatId, message),
        'p': async () => await pingCommand(sock, chatId, message),
        'getpp': async () => await getppCommand(sock, chatId, message),
        
        'block': async () => await blockCommand(sock, chatId, message),
        'unblock': async () => await unblockCommand(sock, chatId, message),
        'blocklist': async () => await blocklistCommand(sock, chatId, message),
        'listblock': async () => await blocklistCommand(sock, chatId, message),
        
        'uptime': async () => await aliveCommand(sock, chatId, message),
        'up': async () => await aliveCommand(sock, chatId, message),
        'runtime': async () => await aliveCommand(sock, chatId, message),
        
        'mention': async () => {
            const isOwner = message.key.fromMe || senderIsSudo;
            await mentionToggleCommand(sock, chatId, message, commandArgs, isOwner);
        },
        'setmention': async () => {
            const isOwner = message.key.fromMe || senderIsSudo;
            await setMentionCommand(sock, chatId, message, isOwner);
        },
        
        'blur': async () => {
            const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            await blurCommand(sock, chatId, message, quotedMessage);
        },
        
        'welcome': async () => {
            if (!isGroup) {
                await sock.sendMessage(chatId, { text: 'Groups only', ...channelInfo }, { quoted: message });
                return;
            }
            if (!isSenderAdmin && !message.key.fromMe) {
                await sock.sendMessage(chatId, { text: 'Admins only', ...channelInfo }, { quoted: message });
                return;
            }
            await welcomeCommand(sock, chatId, message);
        },
        
        'goodbye': async () => {
            if (!isGroup) {
                await sock.sendMessage(chatId, { text: 'Groups only', ...channelInfo }, { quoted: message });
                return;
            }
            if (!isSenderAdmin && !message.key.fromMe) {
                await sock.sendMessage(chatId, { text: 'Admins only', ...channelInfo }, { quoted: message });
                return;
            }
            await goodbyeCommand(sock, chatId, message);
        },
        
        // GitHub/Script commands
        'git': async () => await githubCommand(sock, chatId, message),
        'github': async () => await githubCommand(sock, chatId, message),
        'sc': async () => await githubCommand(sock, chatId, message),
        'script': async () => await githubCommand(sock, chatId, message),
        'repo': async () => await githubCommand(sock, chatId, message),
        
        'antibadword': async () => {
            if (!isGroup) {
                await sock.sendMessage(chatId, { text: 'Groups only', ...channelInfo }, { quoted: message });
                return;
            }
            if (!isBotAdmin) {
                await sock.sendMessage(chatId, { text: 'Bot must be admin', ...channelInfo }, { quoted: message });
                return;
            }
            await antibadwordCommand(sock, chatId, message, senderId, isSenderAdmin);
        },
        
        'chatbot': async () => {
            if (!isGroup) {
                await sock.sendMessage(chatId, { text: 'Groups only', ...channelInfo }, { quoted: message });
                return;
            }
            if (!isSenderAdmin && !message.key.fromMe) {
                await sock.sendMessage(chatId, { text: 'Admins only', ...channelInfo }, { quoted: message });
                return;
            }
            const match = userMessage.slice((prefix + 'chatbot').length).trim();
            await handleChatbotCommand(sock, chatId, message, match);
        },
        
        'yts': async () => await ytsCommand(sock, chatId, senderId, message, userMessage),
        'ytsearch': async () => await ytsCommand(sock, chatId, senderId, message, userMessage),
        
        'take': async () => {
            const takeArgs = rawText.slice((prefix + 'take').length).trim().split(' ');
            await takeCommand(sock, chatId, message, takeArgs);
        },
        
        'flirt': async () => await flirtCommand(sock, chatId, message),
        'gitclone': async () => await gitcloneCommand(sock, chatId, message),
        'character': async () => await characterCommand(sock, chatId, message),
        'waste': async () => await wastedCommand(sock, chatId, message),
        
        'ship': async () => {
            if (!isGroup) {
                await sock.sendMessage(chatId, { text: 'Groups only!', ...channelInfo }, { quoted: message });
                return;
            }
            await shipCommand(sock, chatId, message);
        },
        
        'groupinfo': async () => {
            if (!isGroup) {
                await sock.sendMessage(chatId, { text: 'Groups only!', ...channelInfo }, { quoted: message });
                return;
            }
            await groupInfoCommand(sock, chatId, message);
        },
        'infogroup': async () => {
            if (!isGroup) {
                await sock.sendMessage(chatId, { text: 'Groups only!', ...channelInfo }, { quoted: message });
                return;
            }
            await groupInfoCommand(sock, chatId, message);
        },
        'infogrupo': async () => {
            if (!isGroup) {
                await sock.sendMessage(chatId, { text: 'Groups only!', ...channelInfo }, { quoted: message });
                return;
            }
            await groupInfoCommand(sock, chatId, message);
        },
        
        'reset': async () => {
            if (!isGroup) {
                await sock.sendMessage(chatId, { text: 'Groups only!', ...channelInfo }, { quoted: message });
                return;
            }
            await resetlinkCommand(sock, chatId, senderId);
        },
        'revoke': async () => {
            if (!isGroup) {
                await sock.sendMessage(chatId, { text: 'Groups only!', ...channelInfo }, { quoted: message });
                return;
            }
            await resetlinkCommand(sock, chatId, senderId);
        },
        
        'admin': async () => {
            if (!isGroup) {
                await sock.sendMessage(chatId, { text: 'Groups only!', ...channelInfo }, { quoted: message });
                return;
            }
            await staffCommand(sock, chatId, message);
        },
        'listadmin': async () => {
            if (!isGroup) {
                await sock.sendMessage(chatId, { text: 'Groups only!', ...channelInfo }, { quoted: message });
                return;
            }
            await staffCommand(sock, chatId, message);
        },
        
        'tourl': async () => await urlCommand(sock, chatId, message),
        'url': async () => await urlCommand(sock, chatId, message),
        
        'emojimix': async () => await emojimixCommand(sock, chatId, message),
        'emix': async () => await emojimixCommand(sock, chatId, message),
        
        'tg': async () => await stickerTelegramCommand(sock, chatId, message),
        'tgsticker': async () => await stickerTelegramCommand(sock, chatId, message),
        
        'left': async () => await leaveGroupCommand(sock, chatId, message),
        'leave': async () => await leaveGroupCommand(sock, chatId, message),
        
        'removeall': async () => await kickAllCommand(sock, chatId, message),
        'killall': async () => await kickAllCommand(sock, chatId, message),
        
        'vv': async () => await viewOnceCommand(sock, chatId, message),
        
        'toaudio': async () => await toAudioCommand(sock, chatId, message),
        'tomp3': async () => await toAudioCommand(sock, chatId, message),
        
        'clearsession': async () => await clearSessionCommand(sock, chatId, message),
        'clearsesi': async () => await clearSessionCommand(sock, chatId, message),
        
        'autostatus': async () => {
            const autoStatusArgs = userMessage.split(' ').slice(1);
            await autoStatusCommand(sock, chatId, message, autoStatusArgs);
        },
        
        // Textmaker commands
        'metallic': async () => await textmakerCommand(sock, chatId, message, userMessage, 'metallic'),
        'ice': async () => await textmakerCommand(sock, chatId, message, userMessage, 'ice'),
        'snow': async () => await textmakerCommand(sock, chatId, message, userMessage, 'snow'),
        'impressive': async () => await textmakerCommand(sock, chatId, message, userMessage, 'impressive'),
        'matrix': async () => await textmakerCommand(sock, chatId, message, userMessage, 'matrix'),
        'light': async () => await textmakerCommand(sock, chatId, message, userMessage, 'light'),
        'neon': async () => await textmakerCommand(sock, chatId, message, userMessage, 'neon'),
        'devil': async () => await textmakerCommand(sock, chatId, message, userMessage, 'devil'),
        'purple': async () => await textmakerCommand(sock, chatId, message, userMessage, 'purple'),
        'thunder': async () => await textmakerCommand(sock, chatId, message, userMessage, 'thunder'),
        'leaves': async () => await textmakerCommand(sock, chatId, message, userMessage, 'leaves'),
        '1917': async () => await textmakerCommand(sock, chatId, message, userMessage, '1917'),
        'arena': async () => await textmakerCommand(sock, chatId, message, userMessage, 'arena'),
        'hacker': async () => await textmakerCommand(sock, chatId, message, userMessage, 'hacker'),
        'sand': async () => await textmakerCommand(sock, chatId, message, userMessage, 'sand'),
        'blackpink': async () => await textmakerCommand(sock, chatId, message, userMessage, 'blackpink'),
        'glitch': async () => await textmakerCommand(sock, chatId, message, userMessage, 'glitch'),
        'fire': async () => await textmakerCommand(sock, chatId, message, userMessage, 'fire'),
        
        'antidelete': async () => {
            const antideleteMatch = userMessage.slice((prefix + 'antidelete').length).trim();
            await handleAntideleteCommand(sock, chatId, message, antideleteMatch);
        },
        
        'surrender': async () => await handleTicTacToeMove(sock, chatId, senderId, 'surrender'),
        
        'cleartemp': async () => await clearTmpCommand(sock, chatId, message),
        
        'setpp': async () => await setProfilePicture(sock, chatId, message),
        
        'setgdesc': async () => {
            const text = rawText.slice((prefix + 'setgdesc').length).trim();
            await setGroupDescription(sock, chatId, senderId, text, message);
        },
        'setgname': async () => {
            const text = rawText.slice((prefix + 'setgname').length).trim();
            await setGroupName(sock, chatId, senderId, text, message);
        },
        'setgpp': async () => await setGroupPhoto(sock, chatId, senderId, message),
        
        // Social media downloads
        'instagram': async () => await instagramCommand(sock, chatId, message),
        'insta': async () => await instagramCommand(sock, chatId, message),
        'ig': async () => await instagramCommand(sock, chatId, message),
        
        'igs': async () => await igsCommand(sock, chatId, message, true),
        
        'fb': async () => await facebookCommand(sock, chatId, message),
        'facebook': async () => await facebookCommand(sock, chatId, message),
        
        // Music commands
        'play': async () => await playCommand(sock, chatId, message),
        'spotify': async () => await spotifyCommand(sock, chatId, message),
        'song': async () => await songCommand(sock, chatId, message),
        'mp3': async () => await songCommand(sock, chatId, message),
        'video': async () => await videoCommand(sock, chatId, message),
        
        'tiktok': async () => await tiktokCommand(sock, chatId, message),
        'tt': async () => await tiktokCommand(sock, chatId, message),
        
        // AI commands
        'gpt': async () => await aiCommand(sock, chatId, message),
        'gemini': async () => await aiCommand(sock, chatId, message),
        
        'translate': async () => {
            const commandLength = (prefix + 'translate').length;
            await handleTranslateCommand(sock, chatId, message, userMessage.slice(commandLength));
        },
        'trt': async () => {
            const commandLength = (prefix + 'trt').length;
            await handleTranslateCommand(sock, chatId, message, userMessage.slice(commandLength));
        },
        
        'ss': async () => {
            const ssCommandLength = (prefix + 'ss').length;
            await handleSsCommand(sock, chatId, message, userMessage.slice(ssCommandLength).trim());
        },
        'ssweb': async () => {
            const ssCommandLength = (prefix + 'ssweb').length;
            await handleSsCommand(sock, chatId, message, userMessage.slice(ssCommandLength).trim());
        },
        'screenshot': async () => {
            const ssCommandLength = (prefix + 'screenshot').length;
            await handleSsCommand(sock, chatId, message, userMessage.slice(ssCommandLength).trim());
        },
        
        'areact': async () => {
            const isOwnerOrSudo = message.key.fromMe || senderIsSudo;
            await handleAreactCommand(sock, chatId, message, isOwnerOrSudo);
        },
        'autoreact': async () => {
            const isOwnerOrSudo = message.key.fromMe || senderIsSudo;
            await handleAreactCommand(sock, chatId, message, isOwnerOrSudo);
        },
        'autoreaction': async () => {
            const isOwnerOrSudo = message.key.fromMe || senderIsSudo;
            await handleAreactCommand(sock, chatId, message, isOwnerOrSudo);
        },
        
        'sudo': async () => await sudoCommand(sock, chatId, message),
        
        'goodnight': async () => await goodnightCommand(sock, chatId, message),
        'lovenight': async () => await goodnightCommand(sock, chatId, message),
        'gn': async () => await goodnightCommand(sock, chatId, message),
        
        'shayari': async () => await shayariCommand(sock, chatId, message),
        'shayri': async () => await shayariCommand(sock, chatId, message),
        
        'roseday': async () => await rosedayCommand(sock, chatId, message),
        
        'imagine': async () => await imagineCommand(sock, chatId, message),
        'flux': async () => await imagineCommand(sock, chatId, message),
        'dalle': async () => await imagineCommand(sock, chatId, message),
        
        'jid': async () => {
            const groupJid = message.key.remoteJid;
            if (!groupJid.endsWith('@g.us')) {
                await sock.sendMessage(chatId, { text: "❌ Groups only" });
                return;
            }
            await sock.sendMessage(chatId, { text: `✅ Group JID: ${groupJid}` }, { quoted: message });
        },
        
        'autotyping': async () => await autotypingCommand(sock, chatId, message),
        'autoread': async () => await autoreadCommand(sock, chatId, message),
        
        'heart': async () => await handleHeart(sock, chatId, message),
        
        'horny': async () => {
            const args = ['horny', ...userMessage.split(' ').slice(1)];
            await miscCommand(sock, chatId, message, args);
        },
        'circle': async () => {
            const args = ['circle', ...userMessage.split(' ').slice(1)];
            await miscCommand(sock, chatId, message, args);
        },
        'lgbtq': async () => {
            const args = ['lgbtq', ...userMessage.split(' ').slice(1)];
            await miscCommand(sock, chatId, message, args);
        },
        'lolice': async () => {
            const args = ['lolice', ...userMessage.split(' ').slice(1)];
            await miscCommand(sock, chatId, message, args);
        },
        'simpcard': async () => {
            const args = ['simpcard', ...userMessage.split(' ').slice(1)];
            await miscCommand(sock, chatId, message, args);
        },
        'misc': async () => {
            const args = ['misc', ...userMessage.split(' ').slice(1)];
            await miscCommand(sock, chatId, message, args);
        },
        'its-so-stupid': async () => {
            const args = ['its-so-stupid', ...userMessage.split(' ').slice(1)];
            await miscCommand(sock, chatId, message, args);
        },
        'namecard': async () => {
            const args = ['namecard', ...userMessage.split(' ').slice(1)];
            await miscCommand(sock, chatId, message, args);
        },
        'oogway2': async () => {
            const args = ['oogway2', ...userMessage.split(' ').slice(1)];
            await miscCommand(sock, chatId, message, args);
        },
        'oogway': async () => {
            const args = ['oogway', ...userMessage.split(' ').slice(1)];
            await miscCommand(sock, chatId, message, args);
        },
        'tweet': async () => {
            const args = ['tweet', ...userMessage.split(' ').slice(1)];
            await miscCommand(sock, chatId, message, args);
        },
        'ytcomment': async () => {
            const args = ['youtube-comment', ...userMessage.split(' ').slice(1)];
            await miscCommand(sock, chatId, message, args);
        },
        
        // Photo effects
        'comrade': async () => {
            const args = ['comrade', ...userMessage.split(' ').slice(1)];
            await miscCommand(sock, chatId, message, args);
        },
        'gay': async () => {
            const args = ['gay', ...userMessage.split(' ').slice(1)];
            await miscCommand(sock, chatId, message, args);
        },
        'glass': async () => {
            const args = ['glass', ...userMessage.split(' ').slice(1)];
            await miscCommand(sock, chatId, message, args);
        },
        'jail': async () => {
            const args = ['jail', ...userMessage.split(' ').slice(1)];
            await miscCommand(sock, chatId, message, args);
        },
        'passed': async () => {
            const args = ['passed', ...userMessage.split(' ').slice(1)];
            await miscCommand(sock, chatId, message, args);
        },
        'triggered': async () => {
            const args = ['triggered', ...userMessage.split(' ').slice(1)];
            await miscCommand(sock, chatId, message, args);
        },
        
        // Anime commands
        'animu': async () => {
            const args = userMessage.split(' ').slice(1);
            await animeCommand(sock, chatId, message, args);
        },
        'nom': async () => await animeCommand(sock, chatId, message, ['nom']),
        'poke': async () => await animeCommand(sock, chatId, message, ['poke']),
        'cry': async () => await animeCommand(sock, chatId, message, ['cry']),
        'hug': async () => await animeCommand(sock, chatId, message, ['hug']),
        'pat': async () => await animeCommand(sock, chatId, message, ['pat']),
        'kiss': async () => await animeCommand(sock, chatId, message, ['kiss']),
        'wink': async () => await animeCommand(sock, chatId, message, ['wink']),
        'facepalm': async () => await animeCommand(sock, chatId, message, ['face-palm']),
        'face-palm': async () => await animeCommand(sock, chatId, message, ['face-palm']),
        'loli': async () => await animeCommand(sock, chatId, message, ['loli']),
        
        'crop': async () => await stickercropCommand(sock, chatId, message),
        
        'pies': async () => {
            const args = rawText.split(' ').slice(1);
            await piesCommand(sock, chatId, message, args);
        },
        
        // Alias commands for pies
        'china': async () => await piesAlias(sock, chatId, message, 'china'),
        'indonesia': async () => await piesAlias(sock, chatId, message, 'indonesia'),
        'japan': async () => await piesAlias(sock, chatId, message, 'japan'),
        'korea': async () => await piesAlias(sock, chatId, message, 'korea'),
        'hijab': async () => await piesAlias(sock, chatId, message, 'hijab'),
        
        'update': async () => {
            const parts = rawText.trim().split(/\s+/);
            const zipArg = parts[1] && parts[1].startsWith('http') ? parts[1] : '';
            await updateCommand(sock, chatId, message, senderIsSudo, zipArg);
        },
        'start': async () => {
            const parts = rawText.trim().split(/\s+/);
            const zipArg = parts[1] && parts[1].startsWith('http') ? parts[1] : '';
            await updateCommand(sock, chatId, message, senderIsSudo, zipArg);
        },
        'restart': async () => {
            const parts = rawText.trim().split(/\s+/);
            const zipArg = parts[1] && parts[1].startsWith('http') ? parts[1] : '';
            await updateCommand(sock, chatId, message, senderIsSudo, zipArg);
        },
        
        'removebg': async () => await removebgCommand.exec(sock, message, userMessage.split(' ').slice(1)),
        'rmbg': async () => await removebgCommand.exec(sock, message, userMessage.split(' ').slice(1)),
        'nobg': async () => await removebgCommand.exec(sock, message, userMessage.split(' ').slice(1)),
        
        'remini': async () => await reminiCommand(sock, chatId, message, userMessage.split(' ').slice(1)),
        'enhance': async () => await reminiCommand(sock, chatId, message, userMessage.split(' ').slice(1)),
        'upscale': async () => await reminiCommand(sock, chatId, message, userMessage.split(' ').slice(1)),
        
        'sora': async () => await soraCommand(sock, chatId, message),
        
        // Default handler for unregistered commands
        'default': async () => {
            if (isGroup && userMessage) {
                await handleChatbotResponse(sock, chatId, message, userMessage, senderId);
            }
        }
    };

    // Execute the command
    const handler = commandRouter[command] || commandRouter['default'];
    await handler();
}

/*━━━━━━━━━━━━━━━━━━━━*/
// Group participant update handler (optimized)
/*━━━━━━━━━━━━━━━━━━━━*/
async function handleGroupParticipantUpdate(sock, update) {
    try {
        const { id, participants, action, author } = update;
        if (!id.endsWith('@g.us')) return;
        
        // Check bot mode asynchronously
        let isPublic = true;
        try {
            const dataStr = await cachedFileRead('./data/messageCount.json');
            const modeData = JSON.parse(dataStr);
            if (typeof modeData.isPublic === 'boolean') isPublic = modeData.isPublic;
        } catch (e) {
            // Default to public on error
        }
        
        // Handle events
        if (action === 'promote' && isPublic) {
            await handlePromotionEvent(sock, id, participants, author);
        } else if (action === 'demote' && isPublic) {
            await handleDemotionEvent(sock, id, participants, author);
        } else if (action === 'add') {
            await handleJoinEvent(sock, id, participants);
        } else if (action === 'remove') {
            await handleLeaveEvent(sock, id, participants);
        }
    } catch (error) {
        console.error('Error in handleGroupParticipantUpdate:', error);
    }
}

// Export handlers
module.exports = {
    handleMessages,
    handleGroupParticipantUpdate,
    handleStatus: async (sock, status) => {
        await handleStatusUpdate(sock, status);
    }
};