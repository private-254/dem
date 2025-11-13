require('./settings')
require('dotenv').config()
const config = require('./config');
const fs = require('fs')
const chalk = require('chalk')
const path = require('path')
const axios = require('axios')
const PhoneNumber = require('awesome-phonenumber')
const os = require('os')
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    jidNormalizedUser,
    makeCacheableSignalKeyStore,
    delay,
    downloadContentFromMessage,
    jidDecode
} = require("@whiskeysockets/baileys")
const NodeCache = require("node-cache")
const pino = require("pino")
const readline = require("readline")
const { rmSync } = require('fs')
const FileType = require('file-type')

// --- Centralized Logging Function ---
function log(message, color = 'white', isError = false) {
    const prefix = chalk.magenta.bold('[ DAVE-MD ]');
    const logFunc = isError ? console.error : console.log;
    const coloredMessage = chalk[color](message);

    if (message.includes('\n') || message.includes('════')) {
        logFunc(prefix, coloredMessage);
    } else {
         logFunc(`${prefix} ${coloredMessage}`);
    }
}

// --- GLOBAL FLAGS ---
global.isBotConnected = false; 
global.connectDebounceTimeout = null;
global.errorRetryCount = 0;

// --- Dependencies to be loaded later ---
let smsg, handleMessages, handleGroupParticipantUpdate, handleStatus, store, handleCommand;

// --- Storage Configuration ---
const MESSAGE_STORE_FILE = path.join(__dirname, 'message_backup.json');
const SESSION_ERROR_FILE = path.join(__dirname, 'sessionErrorCount.json');
global.messageBackup = {};

function loadStoredMessages() {
    try {
        if (fs.existsSync(MESSAGE_STORE_FILE)) {
            const data = fs.readFileSync(MESSAGE_STORE_FILE, 'utf-8');
            return JSON.parse(data);
        }
    } catch (error) {
        log(`Error loading message backup store: ${error.message}`, 'red', true);
    }
    return {};
}

function saveStoredMessages(data) {
    try {
        fs.writeFileSync(MESSAGE_STORE_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        log(`Error saving message backup store: ${error.message}`, 'red', true);
    }
}
global.messageBackup = loadStoredMessages();

function loadErrorCount() {
    try {
        if (fs.existsSync(SESSION_ERROR_FILE)) {
            const data = fs.readFileSync(SESSION_ERROR_FILE, 'utf-8');
            return JSON.parse(data);
        }
    } catch (error) {
        log(`Error loading session error count: ${error.message}`, 'red', true);
    }
    return { count: 0, last_error_timestamp: 0 };
}

function saveErrorCount(data) {
    try {
        fs.writeFileSync(SESSION_ERROR_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        log(`Error saving session error count: ${error.message}`, 'red', true);
    }
}

function deleteErrorCountFile() {
    try {
        if (fs.existsSync(SESSION_ERROR_FILE)) {
            fs.unlinkSync(SESSION_ERROR_FILE);
            log('Deleted sessionErrorCount.json.', 'red');
        }
    } catch (e) {
        log(`Failed to delete sessionErrorCount.json: ${e.message}`, 'red', true);
    }
}

// --- Cleanup Functions ---
function clearSessionFiles() {
    try {
        log('Clearing session folder...', 'blue');
        rmSync(sessionDir, { recursive: true, force: true });
        if (fs.existsSync(loginFile)) fs.unlinkSync(loginFile);
        deleteErrorCountFile();
        global.errorRetryCount = 0;
        log('Session files cleaned successfully.', 'green');
    } catch (e) {
        log(`Failed to clear session files: ${e.message}`, 'red', true);
    }
}

function cleanupOldMessages() {
    let storedMessages = loadStoredMessages();
    let now = Math.floor(Date.now() / 1000);
    const maxMessageAge = 24 * 60 * 60;
    let cleanedMessages = {};
    for (let chatId in storedMessages) {
        let newChatMessages = {};
        for (let messageId in storedMessages[chatId]) {
            let message = storedMessages[chatId][messageId];
            if (now - message.timestamp <= maxMessageAge) {
                newChatMessages[messageId] = message; 
            }
        }
        if (Object.keys(newChatMessages).length > 0) {
            cleanedMessages[chatId] = newChatMessages; 
        }
    }
    saveStoredMessages(cleanedMessages);
    log("Old messages removed from message_backup.json", 'yellow');
}

function cleanupJunkFiles(botSocket) {
    let directoryPath = path.join(); 
    fs.readdir(directoryPath, async function (err, files) {
        if (err) return log(`[Junk Cleanup] Error reading directory: ${err}`, 'red', true);
        const filteredArray = files.filter(item =>
            item.endsWith(".gif") || item.endsWith(".png") || item.endsWith(".mp3") ||
            item.endsWith(".mp4") || item.endsWith(".opus") || item.endsWith(".jpg") ||
            item.endsWith(".webp") || item.endsWith(".webm") || item.endsWith(".zip")
        );
        if (filteredArray.length > 0) {
            let teks = `Detected ${filteredArray.length} junk files,\nJunk files have been deleted`;
            if (botSocket && botSocket.user && botSocket.user.id) {
                botSocket.sendMessage(botSocket.user.id.split(':')[0] + '@s.whatsapp.net', { text: teks });
            }
            filteredArray.forEach(function (file) {
                const filePath = path.join(directoryPath, file);
                try {
                    if(fs.existsSync(filePath)) fs.unlinkSync(filePath);
                } catch(e) {
                    log(`[Junk Cleanup] Failed to delete file ${file}: ${e.message}`, 'red', true);
                }
            });
            log(`[Junk Cleanup] ${filteredArray.length} files deleted.`, 'yellow');
        }
    });
}

// --- DAVE MD Configuration ---
global.botname = "DAVE-MD"
global.themeemoji = "•"
const pairingCode = !!global.phoneNumber || process.argv.includes("--pairing-code")
const useMobile = process.argv.includes("--mobile")

// --- Paths ---
const sessionDir = path.join(__dirname, 'session')
const credsPath = path.join(sessionDir, 'creds.json')
const loginFile = path.join(sessionDir, 'login.json')
const envPath = path.join(__dirname, '.env')

// --- Readline setup ---
const rl = process.stdin.isTTY ? readline.createInterface({ input: process.stdin, output: process.stdout }) : null
const question = (text) => rl ? new Promise(resolve => rl.question(text, resolve)) : Promise.resolve(global.phoneNumber)

// --- Login persistence ---
async function saveLoginMethod(method) {
    await fs.promises.mkdir(sessionDir, { recursive: true });
    await fs.promises.writeFile(loginFile, JSON.stringify({ method }, null, 2));
}

async function getLastLoginMethod() {
    if (fs.existsSync(loginFile)) {
        const data = JSON.parse(fs.readFileSync(loginFile, 'utf-8'));
        return data.method;
    }
    return null;
}

function sessionExists() {
    return fs.existsSync(credsPath);
}

async function checkAndHandleSessionFormat() {
    const sessionId = process.env.SESSION_ID;

    if (sessionId && sessionId.trim() !== '') {
        if (!sessionId.trim().startsWith('DAVE-AI:~')) {
            log('=================================================', 'white');
            log('ERROR: Invalid SESSION_ID in .env', 'white');
            log('The session ID MUST start with "DAVE-MD:~".', 'white');
            log('Cleaning .env and creating new one...', 'white');
            log('=================================================', 'white');

            try {
                let envContent = fs.readFileSync(envPath, 'utf8');
                envContent = envContent.replace(/^SESSION_ID=.*$/m, 'SESSION_ID=');
                fs.writeFileSync(envPath, envContent);
                log('Cleaned SESSION_ID entry in .env file.', 'green');
                log('Please add a proper session ID and restart the bot.', 'yellow');
            } catch (e) {
                log(`Failed to modify .env file. Please check permissions: ${e.message}`, 'red', true);
            }

            log('Bot will wait 30 seconds then restart', 'blue');
            await delay(30000);
            process.exit(1);
        }
    }
}

// --- Get login method ---
async function getLoginMethod() {
    const lastMethod = await getLastLoginMethod();
    if (lastMethod && sessionExists()) {
        log(`Last login method detected: ${lastMethod}. Using it automatically.`, 'yellow');
        return lastMethod;
    }

    if (!sessionExists() && fs.existsSync(loginFile)) {
        log(`Session files missing. Removing old login preference for clean re-login.`, 'yellow');
        fs.unlinkSync(loginFile);
    }

    if (!process.stdin.isTTY) {
        log("No Session ID found in environment variables.", 'red');
        process.exit(1);
    }

    log("Choose login method:", 'yellow');
    log("1) Enter WhatsApp Number (Pairing Code)", 'blue');
    log("2) Paste Session ID", 'blue');

    let choice = await question("Enter option number (1 or 2): ");
    choice = choice.trim();

    if (choice === '1') {
        let phone = await question(`Enter your WhatsApp number (e.g., 254104260236): `);
        phone = phone.replace(/[^0-9]/g, '');
        const pn = require('awesome-phonenumber');
        if (!pn('+' + phone).isValid()) { log('Invalid phone number.', 'red'); return getLoginMethod(); }
        global.phoneNumber = phone;
        await saveLoginMethod('number');
        return 'number';
    } else if (choice === '2') {
        let sessionId = await question(`Paste your Session ID here: `);
        sessionId = sessionId.trim();
        if (!sessionId.includes("DAVE-AI:~")) { 
            log("Invalid Session ID format! Must contain 'DAVE-MD:~'.", 'red'); 
            process.exit(1); 
        }
        global.SESSION_ID = sessionId;
        await saveLoginMethod('session');
        return 'session';
    } else {
        log("Invalid option! Please choose 1 or 2.", 'red');
        return getLoginMethod();
    }
}

// --- Download session ---
async function downloadSessionData() {
    try {
        await fs.promises.mkdir(sessionDir, { recursive: true });
        if (!fs.existsSync(credsPath) && global.SESSION_ID) {
            const base64Data = global.SESSION_ID.includes("DAVE-AI:~") ? global.SESSION_ID.split("DAVE-AI:~")[1] : global.SESSION_ID;
            const sessionData = Buffer.from(base64Data, 'base64');
            await fs.promises.writeFile(credsPath, sessionData);
            log(`Session successfully saved.`, 'green');
        }
    } catch (err) { log(`Error downloading session data: ${err.message}`, 'red', true); }
}

// --- Request pairing code ---
async function requestPairingCode(socket) {
    try {
        log("Waiting 3 seconds for socket stabilization before requesting pairing code...", 'yellow');
        await delay(3000); 

        let code = await socket.requestPairingCode(global.phoneNumber);
        code = code?.match(/.{1,4}/g)?.join("-") || code;
        log(`Your Pairing Code: ${code}`, 'white');
        log(`
Please enter this code in WhatsApp app:
1. Open WhatsApp
2. Go to Settings => Linked Devices
3. Tap "Link a Device"
4. Enter the code shown above
        `, 'green');
        return true; 
    } catch (err) { 
        log(`Failed to get pairing code: ${err.message}`, 'red', true); 
        return false; 
    }
}

// --- Host detection ---
function detectHost() {
    const env = process.env;

    if (env.RENDER || env.RENDER_EXTERNAL_URL) return 'Render';
    if (env.DYNO || env.HEROKU_APP_DIR || env.HEROKU_SLUG_COMMIT) return 'Heroku';
    if (env.PORTS || env.CYPHERX_HOST_ID) return "CypherXHost"; 
    if (env.VERCEL || env.VERCEL_ENV || env.VERCEL_URL) return 'Vercel';
    if (env.RAILWAY_ENVIRONMENT || env.RAILWAY_PROJECT_ID) return 'Railway';
    if (env.REPL_ID || env.REPL_SLUG) return 'Replit';

    const hostname = os.hostname().toLowerCase();
    if (!env.CLOUD_PROVIDER && !env.DYNO && !env.VERCEL && !env.RENDER) {
        if (hostname.includes('vps') || hostname.includes('server')) return 'VPS';
        return 'Panel';
    }

    return 'Unknown Host';
}

// --- Welcome message ---
async function sendWelcomeMessage(dave) {
    // Safety check: Only proceed if the welcome message hasn't been sent yet in this session.
    if (global.isBotConnected) return; 

    try {
        // Newsletter follow IMMEDIATELY after connection (no delay)
        try {
            await dave.newsletterFollow("120363400480173280@newsletter");
            console.log("✅ Auto-followed your WhatsApp channel successfully!");
        } catch (err) {
            console.log(`❌ Failed to auto-follow channel: ${err.message}`);
        }

        await delay(3000);

        // Auto join group
        try {
            await dave.groupAcceptInvite('LfTFxkUQ1H7Eg2D0vR3n6g');
            console.log(chalk.blue(`✅ auto-joined WhatsApp group successfully`));
        } catch (e) {
            console.log(chalk.red(`❌ failed to join WhatsApp group: ${e}`));
        }

        // Wait for full connection stabilization before welcome message
        await delay(7000);

        // Welcome message LAST (always send it - removed the check)
        const { getPrefix } = require('./daveplugins/setprefix');
        if (!dave.user || global.isBotConnected) return;

        global.isBotConnected = true;
        const pNumber = dave.user.id.split(':')[0] + '@s.whatsapp.net';
        let data = JSON.parse(fs.readFileSync('./data/messageCount.json'));
        const currentMode = data.isPublic ? 'public' : 'private';    
        const hostName = detectHost();
        const prefix = getPrefix();

        // Send the message
        await dave.sendMessage(pNumber, {
            text: `
┏━━━━━✧ DAVE-MD CONNECTED ✧━━━━━━━
┃✧ Prefix: [${prefix}]
┃✧ mode: ${currentMode}
┃✧ Platform: ${hostName}
┃✧ Status: online
┃✧ Time: ${new Date().toLocaleString()}
┗━━━━━━━━━━━━━━━━━━━`
        });
        log('Bot successfully connected to Whatsapp.', 'green');

        // NEW: Reset the error counter on successful connection
        deleteErrorCountFile();
        global.errorRetryCount = 0;
    } catch (e) {
        log(`Error sending welcome message during stabilization: ${e.message}`, 'red', true);
        global.isBotConnected = false;
    }
}

// --- 408 Error handler ---
async function handle408Error(statusCode) {
    if (statusCode !== DisconnectReason.connectionTimeout) return false;

    global.errorRetryCount++;
    let errorState = loadErrorCount();
    const MAX_RETRIES = 3;

    errorState.count = global.errorRetryCount;
    errorState.last_error_timestamp = Date.now();
    saveErrorCount(errorState);

    log(`Connection Timeout (408) detected. Retry count: ${global.errorRetryCount}/${MAX_RETRIES}`, 'yellow');

    if (global.errorRetryCount >= MAX_RETRIES) {
        log('=================================================', 'white');
        log(`MAX CONNECTION TIMEOUTS (${MAX_RETRIES}) REACHED IN ACTIVE STATE. `, 'white');
        log('This indicates a persistent network or session issue.', 'white');
        log('Exiting process to stop infinite restart loop.', 'white');
        log('=================================================', 'white');

        deleteErrorCountFile();
        global.errorRetryCount = 0;
        await delay(5000);
        process.exit(1);
    }
    return true;
}

// --- Start bot ---
// --- Start bot (JUNE MD) ---
async function startDave() {
    log('Connecting to WhatsApp...', 'cyan');
    const { version } = await fetchLatestBaileysVersion();

    // Ensure session directory exists before Baileys attempts to use it
    await fs.promises.mkdir(sessionDir, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(`./session`);
    const msgRetryCounterCache = new NodeCache();

    const dave = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false, 
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
        },
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
        syncFullHistory: true,
        getMessage: async (key) => {
            let jid = jidNormalizedUser(key.remoteJid);
            // This now uses the globally available 'store' which is loaded inside tylor()
            let msg = await store.loadMessage(jid, key.id); 
            return msg?.message || "";
        },
        msgRetryCounterCache
    });

    store.bind(dave.ev);

    // ================== AntiCall Handler ==================
    const antiCallNotified = new Set();

    dave.ev.on('call', async (calls) => {
        try {
            const { readState: readAnticallState } = require('./daveplugins/anticall');
            const state = readAnticallState();
            if (!state.enabled) return;
            for (const call of calls) {
                const callerJid = call.from || call.peerJid || call.chatId;
                if (!callerJid) continue;
                try {
                    // First: attempt to reject the call if supported
                    try {
                        if (typeof dave.rejectCall === 'function' && call.id) {
                            await dave.rejectCall(call.id, callerJid);
                        } else if (typeof dave.sendCallOfferAck === 'function' && call.id) {
                            await dave.sendCallOfferAck(call.id, callerJid, 'reject');
                        }
                    } catch {}

                    // Notify the caller only once within a short window
                    if (!antiCallNotified.has(callerJid)) {
                        antiCallNotified.add(callerJid);
                        setTimeout(() => antiCallNotified.delete(callerJid), 60000);
                        await dave.sendMessage(callerJid, { text: '📵 Anticall is enabled. Your call was rejected and you will be blocked.' });
                    }
                } catch {}
                // Then: block after a short delay to ensure rejection and message are processed
                setTimeout(async () => {
                    try { await dave.updateBlockStatus(callerJid, 'block'); } catch {}
                }, 800);
            }
        } catch (e) {
            // ignore
        }
    });

    store.bind(dave.ev);

    // --- MESSAGE HANDLER (BOTH dave.js AND MAIN.JS) ---
    dave.ev.on('messages.upsert', async chatUpdate => {
        for (const msg of chatUpdate.messages) {
            if (!msg.message) continue;
            let chatId = msg.key.remoteJid;
            let messageId = msg.key.id;
            if (!global.messageBackup[chatId]) { global.messageBackup[chatId] = {}; }
            let textMessage = msg.message?.conversation || msg.message?.extendedTextMessage?.text || null;
            if (!textMessage) continue;
            let savedMessage = { sender: msg.key.participant || msg.key.remoteJid, text: textMessage, timestamp: msg.messageTimestamp };
            if (!global.messageBackup[chatId][messageId]) { global.messageBackup[chatId][messageId] = savedMessage; saveStoredMessages(global.messageBackup); }
        }

        const mek = chatUpdate.messages[0];
        if (!mek.message) return;
        mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message;

        if (mek.key.remoteJid === 'status@broadcast') { 
            await handleStatus(dave, chatUpdate); 
            return; 
        }

        try { 
            let m = smsg(dave, mek, store);

            // BOTH HANDLERS WORK TOGETHER
            // First try dave.js commands if available
            if (handleCommand && typeof handleCommand === 'function') {
                try {
                    await handleCommand(dave, m, chatUpdate, store);
                } catch (caseError) {
                    log(`dave.js command error: ${caseError.message}`, 'red', true);
                }
            }

            // Then try main.js plugins handler
            await handleMessages(dave, chatUpdate, true);
        } catch(e) { 
            log(e.message, 'red', true); 
        }
    });

    dave.ev.on('messages.reaction', async (reaction) => {
        try {
            await handleStatus(dave, reaction);
        } catch (error) {
            console.error('Error in messages.reaction handler:', error);
        }
    });

    // Socket utilities
    dave.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {};
            return decode.user && decode.server && decode.user + '@' + decode.server || jid;
        } else return jid;
    }

    dave.ev.on('contacts.update', update => {
        for (let contact of update) {
            let id = dave.decodeJid(contact.id);
            if (store && store.contacts) {
                store.contacts[id] = {
                    id,
                    name: contact.notify
                };
            }
        }
    });

    dave.getName = (jid, withoutContact = false) => {
        let id = dave.decodeJid(jid);
        withoutContact = dave.withoutContact || withoutContact;
        let v;

        if (id.endsWith("@g.us")) {
            return new Promise(async (resolve) => {
                v = store.contacts[id] || {};
                if (!(v.name || v.subject)) v = await dave.groupMetadata(id) || {};
                resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'));
            });
        } else {
            v = id === '0@s.whatsapp.net' ? {
                id,
                name: 'WhatsApp'
            } : id === dave.decodeJid(dave.user.id) ? dave.user : (store.contacts[id] || {});

            return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || 
                   PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international');
        }
    }

    dave.sendContact = async (jid, kon, quoted = '', opts = {}) => {
        let list = [];
        for (let i of kon) {
            list.push({
                displayName: await dave.getName(i),
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await dave.getName(i)}\nFN:${await dave.getName(i)}\nitem1.TEL;waid=${i.split('@')[0]}:${i.split('@')[0]}\nitem1.X-ABLabel:Mobile\nEND:VCARD`
            });
        }
        dave.sendMessage(jid, { 
            contacts: { 
                displayName: `${list.length} Contact`, 
                contacts: list 
            }, 
            ...opts 
        }, { quoted });
    }

    dave.public = true;
    dave.serializeM = (m) => smsg(dave, m, store);

    dave.sendText = (jid, text, quoted = '', options) => dave.sendMessage(jid, {
        text: text,
        ...options
    }, {
        quoted,
        ...options
    });

    // Connection handler
    dave.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (connection === 'close') {
            global.isBotConnected = false; 

            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const permanentLogout = statusCode === DisconnectReason.loggedOut || statusCode === 401;

            if (permanentLogout) {
                log(`WhatsApp Disconnected! Status Code: ${statusCode} (LOGGED OUT / INVALID SESSION).`, 'white');
                log('Deleting session folder and forcing a clean restart...', 'red');
                clearSessionFiles();
                log('Session, login preference, and error count cleaned. Initiating full process restart in 5 seconds...', 'red');
                await delay(5000);
                process.exit(1); 
            } else {
                await handle408Error(statusCode);
            }
        } else if (connection === 'open') { 
            console.log(`© DAVE CONSOLE`);
            console.log(`Connected to => ` + JSON.stringify(dave.user, null, 2));
            log('DAVE-MD connected', 'blue');      
            log(`GITHUB: giftdee`, 'magenta');
            await sendWelcomeMessage(dave);
        }
    });

    dave.ev.on('creds.update', saveCreds);

    // Cleanup intervals
    setInterval(() => {
        try {
            const sessionPath = path.join(sessionDir);  
            if (!fs.existsSync(sessionPath)) return;
            fs.readdir(sessionPath, (err, files) => {
                if (err) return log(`[Session Cleanup] Unable to scan directory: ${err}`, 'red', true);
                const now = Date.now();
                const filteredArray = files.filter((item) => {
                    const filePath = path.join(sessionPath, item);
                    try {
                        const stats = fs.statSync(filePath);
                        return ((item.startsWith("pre-key") || item.startsWith("sender-key") || item.startsWith("session-") || item.startsWith("app-state")) &&
                            item !== 'creds.json' && now - stats.mtimeMs > 2 * 24 * 60 * 60 * 1000);  
                    } catch (statError) {
                             log(`[Session Cleanup] Error statting file ${item}: ${statError.message}`, 'red', true);
                             return false;
                    }
                });
                if (filteredArray.length > 0) {
                    log(`[Session Cleanup] Found ${filteredArray.length} old session files. Clearing...`, 'yellow');
                    filteredArray.forEach((file) => {
                        const filePath = path.join(sessionPath, file);
                        try { fs.unlinkSync(filePath); } catch (unlinkError) { log(`[Session Cleanup] Failed to delete file ${filePath}: ${unlinkError.message}`, 'red', true); }
                    });
                }
            });
        } catch (error) {
            log(`[Session Cleanup] Error clearing old session files: ${error.message}`, 'red', true);
        }
    }, 7200000); 

    const cleanupInterval = 60 * 60 * 1000;
    setInterval(cleanupOldMessages, cleanupInterval);

    const junkInterval = 30_000;
    setInterval(() => cleanupJunkFiles(dave), junkInterval); 

    return dave;
}

// --- Session integrity check ---
async function checkSessionIntegrityAndClean() {
    const isSessionFolderPresent = fs.existsSync(sessionDir);
    const isValidSession = sessionExists(); 

    if (isSessionFolderPresent && !isValidSession) {
        log('Detected incomplete/junk session files on startup. Cleaning up before proceeding...', 'red');
        clearSessionFiles();
        log('Cleanup complete. Waiting 3 seconds for stability...', 'yellow');
        await delay(3000);
    }
}

// --- .env file watcher ---
function checkEnvStatus() {
    try {
        log("══════════════════════════", 'magenta');
        log(".env file watcher", 'green');
        log("══════════════════════════", 'magenta');

        fs.watch(envPath, { persistent: false }, (eventType, filename) => {
            if (filename && eventType === 'change') {
                log('=================================================', 'white');
                log('.env file change detected!', 'white');
                log('Forcing a clean restart to apply new configuration (e.g., SESSION_ID).', 'white');
                log('=================================================', 'white');
                process.exit(1);
            }
        });
    } catch (e) {
        log(`Failed to set up .env file watcher (fs.watch error): ${e.message}`, 'red', true);
    }
}

// --- Main login flow ---
async function tylor() {
    try {
        const settings = require('./settings');
        const mainModules = require('./main');
        handleMessages = mainModules.handleMessages;
        handleGroupParticipantUpdate = mainModules.handleGroupParticipantUpdate;
        handleStatus = mainModules.handleStatus;

        // Load dave.js handler with error handling - skip if dave.js has errors
        let handleCommand = null;
        try {
            const caseModule = require('./dave');
            if (typeof caseModule === 'function') {
                handleCommand = caseModule;
                log("dave.js loaded successfully.", 'green');
            } else if (caseModule && caseModule.handleCommand) {
                handleCommand = caseModule.handleCommand;
                log("dave.js handleCommand loaded successfully.", 'green');
            } else {
                log('dave.js loaded but no command handler function found', 'yellow');
            }
        } catch (daveError) {
            log(`Skipping dave.js - Error loading: ${daveError.message}`, 'yellow');
            handleCommand = null;
        }

        const myfuncModule = require('./lib/myfunc');
        smsg = myfuncModule.smsg;

        store = require('./lib/lightweight_store')
        store.readFromFile()
        setInterval(() => store.writeToFile(), settings.storeWriteInterval || 10000)

        log("Core files loaded successfully.", 'green');
    } catch (e) {
        log(`FATAL: Failed to load core files. ${e.message}`, 'red', true);
        process.exit(1);
    }

    await checkAndHandleSessionFormat();
    global.errorRetryCount = loadErrorCount().count;
    log(`Retrieved initial 408 retry count: ${global.errorRetryCount}`, 'yellow');

    const envSessionID = process.env.SESSION_ID?.trim();

    if (envSessionID && envSessionID.startsWith('DAVE-AI')) { 
        log("PRIORITY MODE: Found new/updated SESSION_ID in .env/environment variables.", 'magenta');
        clearSessionFiles(); 
        global.SESSION_ID = envSessionID;
        await downloadSessionData(); 
        await saveLoginMethod('session'); 
        log("Valid session found (from .env), starting bot directly...", 'green');
        log('Waiting 3 seconds for stable connection...', 'yellow'); 
        await delay(3000);
        await startDave();
        checkEnvStatus();
        return;
    }

    log("No new SESSION_ID found in .env. Falling back to stored session or interactive login.", 'yellow');
    await checkSessionIntegrityAndClean();

    if (sessionExists()) {
        log("Valid session found, starting bot directly...", 'green'); 
        log('Waiting 3 seconds for stable connection...', 'yellow');
        await delay(3000);
        await startDave();
        checkEnvStatus();
        return;
    }

    const loginMethod = await getLoginMethod();
    let dave;

    if (loginMethod === 'session') {
        await downloadSessionData();
        dave = await startDave(); 
    } else if (loginMethod === 'number') {
        dave = await startDave();
        await requestPairingCode(dave); 
    } else {
        log("Failed to get valid login method. Exiting.", 'red');
        return;
    }

    if (loginMethod === 'number' && !sessionExists() && fs.existsSync(sessionDir)) {
        log('Login interrupted/failed. Clearing temporary session files and restarting...', 'red');
        clearSessionFiles();
        process.exit(1);
    }

    checkEnvStatus();
}

// --- Web server ---
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.get("/", (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));

// --- Start bot ---
tylor().catch(err => log(`Fatal error starting bot: ${err.message}`, 'red', true));
process.on('uncaughtException', (err) => log(`Uncaught Exception: ${err.message}`, 'red', true));
process.on('unhandledRejection', (err) => log(`Unhandled Rejection: ${err.message}`, 'red', true));