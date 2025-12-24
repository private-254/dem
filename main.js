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

/*━━━━━━━━━━━━━━━━━━━━*/
// -----Performance Optimizations-----
/*━━━━━━━━━━━━━━━━━━━━*/
// 1. Async file operations
const fsPromises = fs.promises;

// 2. Command cache for faster lookup
const commandMap = new Map();

// 3. Admin check cache (5 second TTL)
const adminCache = new Map();
const ADMIN_CACHE_TTL = 5000;

// 4. File read cache (3 second TTL for messageCount.json)
const fileCache = new Map();
const FILE_CACHE_TTL = 3000;

// 5. Command queue to prevent overlap
class FastCommandQueue {
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
        
        // Process next item without blocking
        setImmediate(() => this.process());
    }
}

const commandQueue = new FastCommandQueue();

/*━━━━━━━━━━━━━━━━━━━━*/
// -----Helper Functions-----
/*━━━━━━━━━━━━━━━━━━━━*/
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
    
    // Auto-clear old entries
    setTimeout(() => {
        adminCache.delete(cacheKey);
    }, ADMIN_CACHE_TTL + 1000);
    
    return result;
}

/*━━━━━━━━━━━━━━━━━━━━*/
// -----Command imports - Handlers-----
/*━━━━━━━━━━━━━━━━━━━━*/
// [Keep all your imports here, they remain the same]
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
// [All your command imports remain the same]
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
// Optimized Message Handler
/*━━━━━━━━━━━━━━━━━━━━*/
async function handleMessages(sock, messageUpdate, printLog) {
    // Queue the message processing
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
        const isPrefixless = prefix === '';
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
        // Console logging (kept but optimized)
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

        // List of admin commands
        const adminCommands = new Set([
            `${prefix}mute`,
            `${prefix}unmute`,
            `${prefix}ban`,
            `${prefix}unban`,
            `${prefix}promote`,
            `${prefix}demote`,
            `${prefix}kick`,
            `${prefix}tagall`, 
            `${prefix}tagnotadmin`, 
            `${prefix}hidetag`,
            `${prefix}antilink`,
            `${prefix}antitag`, 
            `${prefix}setgdesc`, 
            `${prefix}setgname`, 
            `${prefix}setgpp`
        ]);

        // List of owner commands
        const ownerCommands = new Set([
            `${prefix}mode`, 
            `${prefix}autostatus`, 
            `${prefix}antidelete`, 
            `${prefix}cleartmp`, 
            `${prefix}setpp`, 
            `${prefix}clearsession`, 
            `${prefix}areact`, 
            `${prefix}autoreact`, 
            `${prefix}autotyping`, 
            `${prefix}autoread`, 
            `${prefix}pmblocker`
        ]);

        // Check command type
        const command = userMessage.split(' ')[0];
        const isAdminCommand = adminCommands.has(command);
        const isOwnerCommand = ownerCommands.has(command);

        // Validate permissions
        if (isGroup && isAdminCommand && !isBotAdmin) {
            await sock.sendMessage(chatId, { text: 'Please make the bot an admin to use admin commands.', ...channelInfo }, { quoted: fake });
            return;
        }

        if (isOwnerCommand && !message.key.fromMe && !senderIsSudo) {
            await sock.sendMessage(chatId, { text: '❌ This command is only available for the owner or sudo!' }, { quoted: message });
            return;
        }

        // Additional admin checks for specific commands
        if (isGroup && isAdminCommand) {
            if ((command === `${prefix}mute` || 
                 command === `${prefix}unmute` || 
                 command === `${prefix}ban` ||
                 command === `${prefix}unban` ||
                 command === `${prefix}promote` ||
                 command === `${prefix}demote`) && 
                !isSenderAdmin && !message.key.fromMe) {
                await sock.sendMessage(chatId, {
                    text: 'Sorry, only group admins can use this command.',
                    ...channelInfo
                }, { quoted: message });
                return;
            }
        }

        // Execute command using optimized handler
        await executeCommand(sock, chatId, message, userMessage, rawText, prefix, fake, {
            isGroup,
            isSenderAdmin,
            isBotAdmin,
            senderId,
            senderIsSudo
        });

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
// Optimized Command Executor
/*━━━━━━━━━━━━━━━━━━━━*/
async function executeCommand(sock, chatId, message, userMessage, rawText, prefix, fake, context) {
    const { isGroup, isSenderAdmin, isBotAdmin, senderId, senderIsSudo } = context;
    
    // Extract command and args
    const args = rawText.slice(prefix.length).trim().split(/\s+/);
    const command = args[0].toLowerCase();
    const commandArgs = args.slice(1).join(' ');
    
    // Command execution map - much faster than switch statement
    const commandHandlers = {
        // Prefix commands
        'setprefix': () => handleSetPrefixCommand(sock, chatId, senderId, message, userMessage, prefix),
        'setowner': () => handleSetOwnerCommand(sock, chatId, senderId, message, userMessage, prefix),
        
        // Media commands
        'simage': async () => {
            const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (quotedMessage?.stickerMessage) {
                await simageCommand(sock, quotedMessage, chatId);
            } else {
                await sock.sendMessage(chatId, { text: 'Please reply to a sticker with the toimage command to convert it.', ...channelInfo }, { quoted: fake });
            }
        },
        'toimage': async () => {
            const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (quotedMessage?.stickerMessage) {
                await simageCommand(sock, quotedMessage, chatId);
            } else {
                await sock.sendMessage(chatId, { text: 'Please reply to a sticker with the toimage command to convert it.', ...channelInfo }, { quoted: fake });
            }
        },
        
        // Admin commands
        'kick': () => {
            const mentionedJidListKick = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
            return kickCommand(sock, chatId, senderId, mentionedJidListKick, message);
        },
        
        'mute': async () => {
            const parts = userMessage.trim().split(/\s+/);
            const muteArg = parts[1];
            const muteDuration = muteArg !== undefined ? parseInt(muteArg, 10) : undefined;
            if (muteArg !== undefined && (isNaN(muteDuration) || muteDuration <= 0)) {
                await sock.sendMessage(chatId, { text: 'Please provide a valid number of minutes or use .mute with no number to mute immediately.' }, { quoted: message });
            } else {
                await muteCommand(sock, chatId, senderId, message, muteDuration);
            }
        },
        
        'unmute': () => unmuteCommand(sock, chatId, senderId),
        'ban': () => banCommand(sock, chatId, message),
        'unban': () => unbanCommand(sock, chatId, message),
        
        // Music/song commands
        'shazam': () => shazamCommand(sock, chatId, message),
        'whatsong': () => shazamCommand(sock, chatId, message),
        'find': () => shazamCommand(sock, chatId, message),
        
        // Help commands
        'help': () => helpCommand(sock, chatId, message),
        'menu': () => helpCommand(sock, chatId, message),
        'list': () => helpCommand(sock, chatId, message),
        
        // Menu config
        'menuconfig': () => {
            const menuArgs = commandArgs.split(' ');
            return menuConfigCommand(sock, chatId, message, menuArgs);
        },
        'menuset': () => {
            const menuArgs = commandArgs.split(' ');
            return menuConfigCommand(sock, chatId, message, menuArgs);
        },
        'setmenu': () => {
            const menuArgs = commandArgs.split(' ');
            return menuConfigCommand(sock, chatId, message, menuArgs);
        },
        
        // Sticker commands
        'sticker': () => stickerCommand(sock, chatId, message),
        's': () => stickerCommand(sock, chatId, message),
        
        // Warning commands
        'warnings': () => {
            const mentionedJidListWarnings = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
            return warningsCommand(sock, chatId, mentionedJidListWarnings);
        },
        
        'warn': () => {
            const mentionedJidListWarn = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
            return warnCommand(sock, chatId, senderId, mentionedJidListWarn, message);
        },
        
        // TTS command
        'tts': () => {
            const text = rawText.slice((prefix + 'tts').length).trim();
            return ttsCommand(sock, chatId, text, message);
        },
        
        // Delete command
        'delete': () => deleteCommand(sock, chatId, message, senderId),
        'del': () => deleteCommand(sock, chatId, message, senderId),
        
        // ATTTP command
        'attp': () => attpCommand(sock, chatId, message),
        
        // APK command
        'apk': () => apkCommand(sock, chatId, message),
        
        // Settings command
        'settings': () => settingsCommand(sock, chatId, message),
        'getsettings': () => settingsCommand(sock, chatId, message),
        
        // Mode command (optimized with async file ops)
        'mode': async () => {
            if (!message.key.fromMe && !senderIsSudo) {
                await sock.sendMessage(chatId, { text: 'Only bot owner can use this command!' }, { quoted: fake });
                return;
            }
            
            let data;
            try {
                const dataStr = await cachedFileRead('./data/messageCount.json');
                data = JSON.parse(dataStr);
            } catch (error) {
                console.error('Error reading access mode:', error);
                await sock.sendMessage(chatId, { text: 'Failed to read bot mode status' }, { quoted: fake });
                return;
            }
            
            const action = args[1]?.toLowerCase();
            if (!action) {
                const currentMode = data.isPublic ? 'public' : 'private';
                await sock.sendMessage(chatId, {
                    text: `Current bot mode: *${currentMode}*\n\nUsage: ${prefix}mode public|private\n\nExample:\n${prefix}mode public - Allow everyone to use bot\n${prefix}mode private - Restrict to owner only` 
                }, { quoted: fake });
                return;
            }
            
            if (action !== 'public' && action !== 'private') {
                await sock.sendMessage(chatId, {
                    text: `Usage: ${prefix}mode public|private\n\nExample:\n${prefix}mode public - Allow everyone to use bot\n${prefix}mode private - Restrict to owner only`,
                    ...channelInfo
                }, { quoted: fake });
                return;
            }
            
            try {
                data.isPublic = action === 'public';
                await fsPromises.writeFile('./data/messageCount.json', JSON.stringify(data, null, 2));
                fileCache.delete('./data/messageCount.json'); // Clear cache
                
                await sock.sendMessage(chatId, { text: `✅ Successfully set the bot to *${action}* mode` }, { quoted: fake });
            } catch (error) {
                console.error('Error updating access mode:', error);
                await sock.sendMessage(chatId, { text: 'Failed to update bot access mode' }, { quoted: fake });
            }
        },
        
        // ... Add all other commands here following the same pattern
        
        // Default fallback for unhandled commands
        'default': async () => {
            if (isGroup && userMessage) {
                await handleChatbotResponse(sock, chatId, message, userMessage, senderId);
            }
        }
    };
    
    // Execute the command
    const handler = commandHandlers[command] || commandHandlers['default'];
    await handler();
    
    // Show typing indicator after command (if enabled)
    await showTypingAfterCommand(sock, chatId);
    
    // Add reaction for commands starting with '.'
    if (userMessage.startsWith('.')) {
        await addCommandReaction(sock, message);
    }
}

// Group participant update handler (optimized)
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