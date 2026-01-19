/*
> Recode script give credits to›
Gifted davetech(davetech)

📝 | Created By davetech
🖥️ | Base Ori By davetech 
📌 |Credits Putrazy Xd
📱 |Chat wa:254104260236
👑 |Github: davetechx-254 
✉️ |Email: gifteddavetechservices@gmail.com
*/

const fs = require('fs');
const pino = require('pino');
const readline = require('readline');
const path = require('path');
const chalk = require('chalk');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  makeCacheableSignalKeyStore,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  downloadContentFromMessage,
  jidDecode
} = require('@whiskeysockets/baileys');

const handleCommand = require('./case');
const config = require('./config');
const { loadSettings } = require('./settingsManager');
global.settings = loadSettings();

// 🌈 Console helpers
const log = {
  info: (msg) => console.log(chalk.cyanBright(`[INFO] ${msg}`)),
  success: (msg) => console.log(chalk.greenBright(`[SUCCESS] ${msg}`)),
  error: (msg) => console.log(chalk.redBright(`[ERROR] ${msg}`)),
  warn: (msg) => console.log(chalk.yellowBright(`[WARN] ${msg}`))
};

// 🧠 Readline setup
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
function question(query) {
  return new Promise(resolve => rl.question(query, ans => resolve(ans.trim())));
}

const sessionDir = path.join(__dirname, 'session');
const credsPath = path.join(sessionDir, 'creds.json');

// helper to save SESSION_ID (base64) to session/creds.json
async function saveSessionFromConfig() {
  try {
    if (!config.SESSION_ID) return false;
    if (!config.SESSION_ID.includes('davetech~')) return false;

    const base64Data = config.SESSION_ID.split("davetech~")[1];
    if (!base64Data) return false;

    const sessionData = Buffer.from(base64Data, 'base64');
    await fs.promises.mkdir(sessionDir, { recursive: true });
    await fs.promises.writeFile(credsPath, sessionData);
    console.log(chalk.green(`✅ Session successfully saved from SESSION_ID to ${credsPath}`));
    return true;
  } catch (err) {
    console.error("❌ Failed to save session from config:", err);
    return false;
  }
}

// ================== WhatsApp socket ==================
async function startdavetech() {
  const store = makeInMemoryStore({ logger: pino().child({ level: 'silent' }) });
  const { state, saveCreds } = await useMultiFileAuthState('./session');
  const { version } = await fetchLatestBaileysVersion();

  const davetech = makeWASocket({
  version, 
  keepAliveIntervalMs: 10000,
  printQRInTerminal: false,
  logger: pino({ level: 'silent' }),
  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(
      state.keys,
      pino({ level: 'silent' }).child({ level: 'silent' })
    )
  },
  browser: ["Ubuntu", "Chrome", "20.0.00"],
  syncFullHistory: true 
});

  davetech.ev.on('creds.update', saveCreds);

  // Pairing code if not registered
  if (!davetech.authState.creds.registered && (!config.SESSION_ID || config.SESSION_ID === "")) {
    try {
      const phoneNumber = await question(chalk.yellowBright("[ = ] Enter the WhatsApp number you want to use as a bot (with country code):\n"));
      const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
      console.clear();

      const pairCode = await davetech.requestPairingCode(cleanNumber);
      log.info(`Enter this code on your phone to pair: ${chalk.green(pairCode)}`);
      log.info("⏳ Wait a few seconds and approve the pairing on your phone...");
    } catch (err) {
      console.error("❌ Pairing prompt failed:", err);
    }
  }

  // Media download helper
  davetech.downloadMediaMessage = async (message) => {
    let mime = (message.msg || message).mimetype || '';
    let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
    const stream = await downloadContentFromMessage(message, messageType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
    return buffer;
  };

  // Connection handling
  davetech.ev.on('connection.update', ({ connection, lastDisconnect }) => {
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 401;
      log.error('Connection closed.');
      if (shouldReconnect) setTimeout(() => startdavetech(), 5000);
    } else if (connection === 'open') {
      const botNumber = davetech.user.id.split("@")[0];
      log.success(`Bot connected as ${chalk.green(botNumber)}`);
      try { rl.close(); } catch (e) {}

      // ✅ Send DM to paired number after successful pairing
setTimeout(async () => {
  try {
    const ownerJid = `${botNumber}@s.whatsapp.net`; // Create full JID

    const message = `
╭─『 F.SOCIETY V1 』
┃➥ Connected: ✅
┃➥ Developer: davetech
┃➥ Version: Ultra
┃➥ Number: ${botNumber}
╰───────────────
`;

    await davetech.sendMessage(ownerJid, { text: message });
  } catch (error) {
    console.error("❌ Failed to send DM:", error);
  }
}, 2000);
                 try {
     davetech.groupAcceptInvite('EJ2Nb1A5CUF5P3DfDEoNBM');
    console.log(chalk.green('✅ Auto-joined WhatsApp group successfully'));
} catch (e) {
    console.log(chalk.red(`❌ Failed to join WhatsApp group: ${e.message || e}`));
}
                

      davetech.isPublic = true;
    }
  });

const initAntiDelete = require('./antiDelete');
davetech.ev.on('connection.update', async (update) => {
  const { connection } = update;
  if (connection === 'open') {
    const botNumber = davetech.user.id.split(':')[0] + '@s.whatsapp.net';

    initAntiDelete(davetech, {
      botNumber, // Automatically detected
      dbPath: './library/antidelete.json',
      enabled: true
    });

    console.log(`✅ AntiDelete active and sending deleted messages to ${botNumber}`);
  }
});
  // ================== Auto read/typing/record ==================
  async function autoReadPrivate(m) {
    const from = m.key.remoteJid;
    if (!global.settings?.autoread?.enabled || from.endsWith("@g.us")) return;
    await davetech.readMessages([m.key]).catch(console.error);
  }

  async function autoRecordPrivate(m) {
    const from = m.key.remoteJid;
    if (!global.settings?.autorecord?.enabled || from.endsWith("@g.us")) return;
    await davetech.sendPresenceUpdate("recording", from).catch(console.error);
  }

  async function autoTypingPrivate(m) {
    const from = m.key.remoteJid;
    if (!global.settings?.autotyping?.enabled || from.endsWith("@g.us")) return;
    await davetech.sendPresenceUpdate("composing", from).catch(console.error);
  }

  davetech.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0];
    if (!m.message) return;

    await autoReadPrivate(m);
    await autoRecordPrivate(m);
    await autoTypingPrivate(m);


davetech.ev.on('messages.upsert', async chatUpdate => {
        	if (config.STATUS_VIEW){
          let  mek = chatUpdate.messages[0]
            if (mek.key && mek.key.remoteJid === 'status@broadcast') {
            	await davetech.readMessages([mek.key]) }
            }
    })
    

          
davetech.getName = async (jid) => {
  try {
    if (!jid) return 'Unknown';
    // prefer cached contacts (safe)
    const contact = (davetech.contacts && davetech.contacts[jid]) || (davetech.store && davetech.store.contacts && davetech.store.contacts[jid]);
    if (contact) return contact.vname || contact.name || contact.notify || jid.split('@')[0];

    // try onWhatsApp which returns [{jid, exists, notify}]
    if (typeof davetech.onWhatsApp === 'function') {
      const info = await davetech.onWhatsApp(jid).catch(()=>null);
      if (Array.isArray(info) && info[0] && info[0].notify) return info[0].notify;
    }

    // fallback: phone part of jid
    return jid.split('@')[0];
  } catch (e) {
    return jid.split('@')[0];
  }
};

const statsPath = path.join(__dirname, "library/groupStats.json");

// ✅ Ensure the file exists
if (!fs.existsSync(statsPath)) {
  fs.writeFileSync(statsPath, JSON.stringify({}, null, 2));
}

let groupStats = {};
try {
  const data = fs.readFileSync(statsPath, "utf8");
  groupStats = JSON.parse(data || "{}");
} catch (err) {
  console.error("❌ Failed to read groupStats.json:", err);
  groupStats = {};
}

// 🧠 Debounce file writes (avoid writing too often)
let saveTimeout;
function saveStats() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      fs.writeFileSync(statsPath, JSON.stringify(groupStats, null, 2));
    } catch (err) {
      console.error("❌ Failed to save group stats:", err);
    }
  }, 5000);
}

davetech.ev.on("messages.upsert", async ({ messages }) => {
  const m = messages[0];
  if (!m?.message) return; // skip empty/system messages
  if (m.key.fromMe) return; // skip bot messages

  m.chat = m.key.remoteJid;
  const isGroup = m.chat.endsWith("@g.us");
  const chatType = isGroup ? "Group" : "Private";
  const senderId = m.key.participant || m.sender || m.chat;
  const pushname = m.pushName || "Unknown";

  // ✅ Use local fallback for name (no metadata fetch)
  const chatName = isGroup ? m.chat.split("@")[0] : pushname;

  // ✅ Only handle group messages
  if (!isGroup) return;

  // Initialize group if not exist
  if (!groupStats[m.chat]) {
    groupStats[m.chat] = {
      groupName: chatName,
      totalMessages: 0,
      members: {}
    };
  }

  const groupData = groupStats[m.chat];

  // Update name if it changes (optional)
  if (groupData.groupName !== chatName) {
    groupData.groupName = chatName;
  }

  // Initialize user if not exist
  if (!groupData.members[senderId]) {
    groupData.members[senderId] = {
      name: pushname,
      messages: 0,
      lastMessage: null
    };
  }

  // Increment counters
  groupData.totalMessages++;
  groupData.members[senderId].messages++;
  groupData.members[senderId].lastMessage = new Date().toISOString();

  saveStats();
});

davetech.ev.on('group-participants.update', async (update) => {
  try {
    const fs = require('fs');
    const path = './library/welcome.json';
    const { id, participants, action } = update;

    const groupMetadata = await davetech.groupMetadata(id);
    const groupName = groupMetadata.subject;

    // Load toggle data
    let toggleData = {};
    if (fs.existsSync(path)) toggleData = JSON.parse(fs.readFileSync(path));
    if (!toggleData[id]) return; // Skip if welcome off

    for (const user of participants) {
      if (action === 'add') {
        const ppUrl = await davetech
          .profilePictureUrl(user, 'image')
          .catch(() => 'https://files.catbox.moe/xr70w7.jpg'); // default image

        const name =
          (await davetech.onWhatsApp(user))[0]?.notify ||
          user.split('@')[0];

        await davetech.sendMessage(id, {
          image: { url: ppUrl },
          caption: `👋 *Welcome @${user.split('@')[0]}!*\n🎉 Glad to have you in *${groupName}*!`,
          contextInfo: { mentionedJid: [user] }
        });
      }
    }
  } catch (err) {
    console.error('💥 Welcome Error:', err);
  }
});

davetech.ev.on('group-participants.update', async (update) => {
  try {
    const fs = require('fs');
    const path = './library/goodbye.json';
    const { id, participants, action } = update;

    const groupMetadata = await davetech.groupMetadata(id);
    const groupName = groupMetadata.subject;
    let toggleData = {};
    if (fs.existsSync(path)) toggleData = JSON.parse(fs.readFileSync(path));
    if (!toggleData[id]) return;

    for (const user of participants) {
      if (action === 'remove') {
        const ppUrl = await davetech
          .profilePictureUrl(user, 'image')
          .catch(() => 'https://files.catbox.moe/xr70w7.jpg'); // default image

        const name =
          (await davetech.onWhatsApp(user))[0]?.notify ||
          user.split('@')[0];

        await davetech.sendMessage(id, {
          image: { url: ppUrl },
          caption: `😔 *${name}* (@${user.split('@')[0]}) has left *${groupName}*.\n💐 We’ll miss you!`,
          contextInfo: { mentionedJid: [user] }
        });
      }
    }
  } catch (err) {
    console.error('💥 Goodbye Error:', err);
  }
});

davetech.ev.on('group-participants.update', async (update) => {
  try {
    const { id, participants, action } = update;
    const chatId = id;
    const botNumber = davetech.user.id.split(":")[0] + "@s.whatsapp.net";

    // Load Settings
    const settings = loadSettings();

    // 🧩 Handle AntiPromote
    if (action === 'promote' && settings.antipromote?.[chatId]?.enabled) {
      const groupSettings = settings.antipromote[chatId];

      for (const user of participants) {
        if (user !== botNumber) {
          await davetech.sendMessage(chatId, {
            text: `🚫 *Promotion Blocked!*\nUser: @${user.split('@')[0]}\nMode: ${groupSettings.mode.toUpperCase()}`,
            mentions: [user],
          });

          if (groupSettings.mode === "revert") {
            await davetech.groupParticipantsUpdate(chatId, [user], "davetechote");
          } else if (groupSettings.mode === "kick") {
            await davetech.groupParticipantsUpdate(chatId, [user], "remove");
          }
        }
      }
    }

    // 🧩 Handle Antidavetechote
    if (action === 'davetechote' && settings.antidavetechote?.[chatId]?.enabled) {
      const groupSettings = settings.antidavetechote[chatId];

      for (const user of participants) {
        if (user !== botNumber) {
          await davetech.sendMessage(chatId, {
            text: `🚫 *davetechotion Blocked!*\nUser: @${user.split('@')[0]}\nMode: ${groupSettings.mode.toUpperCase()}`,
            mentions: [user],
          });

          if (groupSettings.mode === "revert") {
            await davetech.groupParticipantsUpdate(chatId, [user], "promote");
          } else if (groupSettings.mode === "kick") {
            await davetech.groupParticipantsUpdate(chatId, [user], "remove");
          }
        }
      }
    }

  } catch (err) {
    console.error("AntiPromote/Antidavetechote error:", err);
  }
});

    // Pass to command handler
const prefixSettingsPath = './library/prefixSettings.json';

// Load prefix dynamically
let prefixSettings = fs.existsSync(prefixSettingsPath)
  ? JSON.parse(fs.readFileSync(prefixSettingsPath, 'utf8'))
  : { prefix: '.', defaultPrefix: '.' };

let prefix = prefixSettings.prefix || ''; // fallback to '' if no prefix

const from = m.key.remoteJid;
const sender = m.key.participant || from;
const isGroup = from.endsWith('@g.us');
const botNumber = davetech.user.id.split(":")[0] + "@s.whatsapp.net";

// Extract message body
let body =
  m.message?.conversation ||
  m.message?.extendedTextMessage?.text ||
  m.message?.imageMessage?.caption ||
  m.message?.videoMessage?.caption ||
  m.message?.documentMessage?.caption ||
  m.message?.buttonsResponseMessage?.selectedButtonId ||
  m.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
  '';

body = body.trim();
if (!body) return;

// Skip if prefix is required and message doesn't start with it
if (prefix !== '' && !body.startsWith(prefix)) return;

// Remove prefix if present
const bodyWithoutPrefix = prefix === '' ? body : body.slice(prefix.length);

// Split command and arguments
const args = bodyWithoutPrefix.trim().split(/ +/);
const command = args.shift().toLowerCase();
    const groupMeta = isGroup ? await davetech.groupMetadata(from).catch(() => null) : null;
    const groupAdmins = groupMeta ? groupMeta.participants.filter(p => p.admin).map(p => p.id) : [];
    const isAdmin = isGroup ? groupAdmins.includes(sender) : false;

    const wrappedMsg = {
      ...m,
      chat: from,
      sender,
      isGroup,
      body,
      type: Object.keys(m.message)[0],
      quoted: m.message?.extendedTextMessage?.contextInfo?.quotedMessage || null,
      reply: (text) => davetech.sendMessage(from, { text }, { quoted: m })
    };

    await handleCommand(davetech, wrappedMsg, command, args, isGroup, isAdmin, groupAdmins, groupMeta, jidDecode, config);
  });

  return davetech;
}

// ================== Startup orchestration ==================
async function tylor() {
  try {
    await fs.promises.mkdir(sessionDir, { recursive: true });

    if (fs.existsSync(credsPath)) {
      console.log(chalk.yellowBright("✅ Existing session found. Starting bot without pairing..."));
      await startdavetech();
      return;
    }

    if (config.SESSION_ID && config.SESSION_ID.includes("davetech~")) {
      const ok = await saveSessionFromConfig();
      if (ok) {
        console.log(chalk.greenBright("✅ Session ID loaded and saved successfully. Starting bot..."));
        await startdavetech();
        return;
      } else {
        console.log(chalk.redBright("⚠️ SESSION_ID found but failed to save it. Falling back to pairing..."));
      }
    }

    console.log(chalk.redBright("⚠️ No valid session found! You’ll need to pair a new number."));
    await startdavetech();

  } catch (error) {
    console.error(chalk.red("❌ Error initializing session:"), error);
  }
}

tylor();