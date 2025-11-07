require('dotenv').config()
const config = require('./config');

const fs = require('fs');
const axios = require('axios');
const path = require('path');
const crypto = require("crypto");
const chalk = require("chalk");
const moment = require("moment-timezone");
require("./settings");
const { downloadContentFromMessage, proto, generateWAMessage, getContentType, prepareWAMessageMedia, generateWAMessageFromContent, GroupSettingChange, jidDecode, WAGroupMetadata, emitGroupParticipantsUpdate, emitGroupUpdate, generateMessageID, jidNormalizedUser, generateForwardMessageContent, WAGroupInviteMessageGroupMetadata, GroupMetadata, Headers, delay, WA_DEFAULT_EPHEMERAL, WADefault, getAggregateVotesInPollMessage, generateWAMessageContent, areJidsSameUser, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, makeWaconnet, makeInMemoryStore, MediaType, WAMessageStatus, downloadAndSaveMediaMessage, AuthenticationState, initInMemoryKeyStore, MiscMessageGenerationOptions, useSingleFileAuthState, BufferJSON, WAMessageProto, MessageOptions, WAFlag, WANode, WAMetric, ChatModification, MessageTypeProto, WALocationMessage, ReconnectMode, WAContextInfo, ProxyAgent, waChatKey, MimetypeMap, MediaPathMap, WAContactMessage, WAContactsArrayMessage, WATextMessage, WAMessageContent, WAMessage, BaileysError, WA_MESSAGE_STATUS_TYPE, MediaConnInfo, URL_REGEX, WAUrlInfo, WAMediaUpload, mentionedJid, processTime, Browser, MessageType, Presence, WA_MESSAGE_STUB_TYPES, Mimetype, relayWAMessage, Browsers, DisconnectReason, WAconnet, getStream, WAProto, isBaileys, AnyMessageContent, templateMessage, InteractiveMessage, Header } = require("@whiskeysockets/baileys");
// Import the same functions used in main.js for consistency
const { isSudo } = require('./lib/index');
const { getPrefix } = require('./daveplugins/setprefix');
const { smsg, runtime } = require('./lib/myfunc');

module.exports = async (dave, m, chatUpdate, store) => {
    try {
        // Check private mode first (same as main.js)
        try {
            const data = JSON.parse(fs.readFileSync('./data/messageCount.json'));
            const senderId = m.sender;
            const senderIsSudo = await isSudo(senderId);
            
            // Allow owner/sudo to use bot even in private mode
            if (!data.isPublic && !m.key.fromMe && !senderIsSudo) {
                return; // Silently ignore messages from non-owners when in private mode
            }
        } catch (error) {
            console.error('Error checking access mode:', error);
            // Default to public mode if there's an error reading the file
        }

        // Use same message parsing as main.js
        const body = (
            m.mtype === "conversation" ? m.message.conversation :
            m.mtype === "imageMessage" ? m.message.imageMessage.caption :
            m.mtype === "videoMessage" ? m.message.videoMessage.caption :
            m.mtype === "extendedTextMessage" ? m.message.extendedTextMessage.text :
            m.mtype === "buttonsResponseMessage" ? m.message.buttonsResponseMessage.selectedButtonId :
            m.mtype === "listResponseMessage" ? m.message.listResponseMessage.singleSelectReply.selectedRowId :
            m.mtype === "templateButtonReplyMessage" ? m.message.templateButtonReplyMessage.selectedId :
            m.mtype === "interactiveResponseMessage" ? JSON.parse(m.msg.nativeFlowResponseMessage.paramsJson).id :
            m.mtype === "templateButtonReplyMessage" ? m.msg.selectedId :
            m.mtype === "messageContextInfo" ? m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text : ""
        );

        const sender = m.key.fromMe
            ? dave.user.id.split(":")[0] || dave.user.id
            : m.key.participant || m.key.remoteJid;
        const senderNumber = sender.split('@')[0];
        const budy = (typeof m.text === 'string' ? m.text : '');
        
        // Use dynamic prefix from main.js
        const prefix = getPrefix();
        
        const from = m.key.remoteJid;
        const isGroup = from.endsWith("@g.us");

        // Use same owner/group checks as main.js
        const botNumber = await dave.decodeJid(dave.user.id);
        const isOwner = [botNumber, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);
        const senderIsSudo = await isSudo(sender);
        
        const command = body.slice(1).trim().split(/ +/).shift().toLowerCase();
        const args = body.trim().split(/ +/).slice(1);
        const pushname = m.pushName || "No Name";
        const text = q = args.join(" ");

        // Group metadata - same as main.js
        const groupMetadata = isGroup ? await dave.groupMetadata(m.chat).catch((e) => {}) : "";
        const participants = isGroup ? await groupMetadata.participants : "";
        const groupAdmins = isGroup ? await participants.filter((v) => v.admin !== null).map((v) => v.id) : "";
        const isGroupAdmins = isGroup ? groupAdmins.includes(m.sender) : false;

        // Time
        const time = moment.tz("Africa/Nairobi").format("HH:mm:ss");

        // Console log - same style as main.js
        console.log(chalk.black(chalk.bgWhite(!command ? '[ MESSAGE ]' : '[ COMMAND ]')), chalk.black(chalk.bgGreen(new Date)), chalk.black(chalk.bgBlue(budy || m.mtype)) + '\n' + chalk.magenta('=> From'), chalk.green(pushname), chalk.yellow(m.sender) + '\n' + chalk.blueBright('=> In'), chalk.green(m.isGroup ? pushname : 'Private Chat', m.chat))

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
        // Helper Functions - PRESERVING YOUR STYLES
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

        // Your dkontak reply style
        async function reply(teks) {
            const nedd = {
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterName: global.channelname,
                        newsletterJid: global.idchannel,
                    },
                    externalAdReply: {
                        showAdAttribution: true,
                        title: global.botname,
                        body: global.ownername,
                        previewType: "VIDEO",
                        thumbnailUrl: global.thumbown, 
                        sourceUrl: global.linkyt,  
                    },
                },
                text: teks,
            };
            return dave.sendMessage(m.chat, nedd, {quoted: fkontak});
        }

        // Your channel reply style
        const replygw2 = async (teks) => {
            return dave.sendMessage(m.chat, {text: teks, mentions: [m.sender]}, {quoted: qchannel})
        }

        // Your fkontak style
        const fkontak = {
            key: {
                fromMe: false,
                participant: "13135550002@s.whatsapp.net",
                remoteJid: "status@broadcast"
            },
            message: {
                orderMessage: {
                    orderId: "2009",
                    thumbnail: "https://url.bwmxmd.online/Adams.poh4tuhs.jpg",
                    itemCount: "2010",
                    status: "INQUIRY",
                    surface: "CATALOG",
                    message: `DAVE MD`,
                    token: "AR6xBKbXZn0Xwmu76Ksyd7rnxI+Rx87HfinVlW4lwXa6JA=="
                }
            },
            contextInfo: {
                mentionedJid: ["120363369514105242@s.whatsapp.net"],
                forwardingScore: 999,
                isForwarded: true,
            }
        }

        // Your qchannel style
        const qchannel = {
            key: {
                participant: `0@s.whatsapp.net`,
                ...(botNumber ? {
                    remoteJid: `status@broadcast`
                } : {})
            },
            message: {
                'contactMessage': {
                    'displayName': `By DAVE MD`,
                    'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:XL;ttname,;;;\nFN:ttname\nitem1.TEL;waid=6289506368777:+6289506368777\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
                    sendEphemeral: true
                }
            }
        }

        const reaction = async (jidss, emoji) => {
            dave.sendMessage(jidss, { react: { text: emoji, key: m.key }})
        }

        // Your example function style
        var example = (teks) => {
            return {
                image: { url: "https://url.bwmxmd.online/Adams.poh4tuhs.jpg" },
                caption: `_Example Command :_\n${prefix + command} ${teks}`,
                footer: global.footer,
                buttons: [
                    { buttonId: `${prefix + command} ${teks}`, buttonText: { displayText: "Example" }, type: 1 }
                ],
                headerType: 4
            };
        };

        // Platform detection function for scan command
        function detectPlatform() {
            const env = process.env;
            if (env.RENDER || env.RENDER_EXTERNAL_URL) return 'Render';
            if (env.DYNO || env.HEROKU_APP_DIR || env.HEROKU_SLUG_COMMIT) return 'Heroku';
            if (env.PORTS || env.CYPHERX_HOST_ID) return "CypherXHost"; 
            if (env.VERCEL || env.VERCEL_ENV || env.VERCEL_URL) return 'Vercel';
            if (env.RAILWAY_ENVIRONMENT || env.RAILWAY_PROJECT_ID) return 'Railway';
            if (env.REPL_ID || env.REPL_SLUG) return 'Replit';
            
            const hostname = require('os').hostname().toLowerCase();
            if (!env.CLOUD_PROVIDER && !env.DYNO && !env.VERCEL && !env.RENDER) {
                if (hostname.includes('vps') || hostname.includes('server')) return 'VPS';
                return 'Panel';
            }
            return 'Unknown Host';
        }

        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
        // Command Handling - ALL YOUR REQUESTED COMMANDS
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

        switch (command) {
            case 'calc': {
                if (text.split("+")[0] && text.split("+")[1]) {
                    const nilai_one = Number(text.split("+")[0])
                    const nilai_two = Number(text.split("+")[1])
                    reply(`${nilai_one + nilai_two}`)
                } else if (text.split("-")[0] && text.split("-")[1]) {
                    const nilai_one = Number(text.split("-")[0])
                    const nilai_two = Number(text.split("-")[1])
                    reply(`${nilai_one - nilai_two}`)
                } else if (text.split("×")[0] && text.split("×")[1]) {
                    const nilai_one = Number(text.split("×")[0])
                    const nilai_two = Number(text.split("×")[1])
                    reply(`${nilai_one * nilai_two}`)
                } else if (text.split("÷")[0] && text.split("÷")[1]) {
                    const nilai_one = Number(text.split("÷")[0])
                    const nilai_two = Number(text.split("÷")[1])
                    reply(`${nilai_one / nilai_two}`)
                } else reply(`*Example* : ${prefix + command} 1 + 1`)
                break;
            }

            case 'scan': {
              try {
                const fs = require('fs');
                const os = require('os');
                const process = require('process');
                const path = require('path');

                // --- Users ---
                const usersFile = path.join(__dirname, 'lib', 'users.json');
                if (!fs.existsSync(usersFile)) fs.writeFileSync(usersFile, JSON.stringify([]));
                const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));

                // --- Commands ---
                const caseFile = path.join(__dirname, 'dave.js');
                const caseContent = fs.readFileSync(caseFile, 'utf8');
                const totalCommands = (caseContent.match(/case\s+['"`]/g) || []).length;

                // --- Uptime & RAM ---
                const uptime = process.uptime();
                const uptimeFormatted = new Date(uptime * 1000).toISOString().substr(11, 8);
                const ramUsage = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);

                // --- Menu settings ---
                const menuSettingsPath = path.join(__dirname, 'menuSettings.json');
                let menuSettings = { mode: 'text', imageUrl: 'default', videoUrl: 'default' };
                if (fs.existsSync(menuSettingsPath)) {
                  menuSettings = JSON.parse(fs.readFileSync(menuSettingsPath, 'utf8'));
                }

                const host = detectPlatform();

                const statusText = `
 *BOT SCAN STATUS*

 *Stats*
• Uptime: ${uptimeFormatted}
• RAM Usage: ${ramUsage} MB
• Users: ${users.length}
• Total Commands: ${totalCommands}

 *Menu Settings*
• Mode: ${menuSettings.mode}
• Image URL: ${menuSettings.imageUrl || 'default'}
• Video URL: ${menuSettings.videoUrl || 'default'}

 *System Info*
• Host: ${host}
• Platform: ${os.platform()}
• CPU Cores: ${os.cpus().length}
• Total Memory: ${(os.totalmem() / 1024 / 1024).toFixed(2)} MB
• Free Memory: ${(os.freemem() / 1024 / 1024).toFixed(2)} MB
`;

                await dave.sendMessage(from, { text: statusText.trim() }, { quoted: m });

              } catch (err) {
                console.error('Scan Error:', err);
                reply(' Failed to scan bot status!');
              }
              break;
            }

            case 'imagine': {
                try {
                    if (!text) return reply(" Please provide a prompt for image generation");

                    const axios = require('axios');
                    const url = `https://bk9.fun/ai/magicstudio?prompt=${encodeURIComponent(text)}`;

                    await reply(" Generating AI image...");

                    const response = await axios.get(url, { responseType: 'arraybuffer' });

                    await dave.sendMessage(from, { 
                        image: Buffer.from(response.data, 'binary'),
                        caption: ` *AI Generated Image*\n\nPrompt: ${text}`
                    }, { quoted: m });

                } catch (err) {
                    console.error("Imagine Command Error:", err);
                    await reply(" An error occurred while generating the image.");
                }
                break;
            }

            case 'toaudio':
            case 'tomp3':
            case 'toaud': {
                try {
                    const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
                    const ffmpeg = require('fluent-ffmpeg');
                    const fs = require('fs');
                    const { tmpdir } = require('os');
                    const path = require('path');

                    // Get the quoted media
                    const quotedMsg = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                    const msg = (quotedMsg && (quotedMsg.videoMessage || quotedMsg.audioMessage)) ||
                               m.message?.videoMessage ||
                               m.message?.audioMessage;

                    if (!msg) return reply(" Reply to a *video* or *audio* message to convert to audio.");

                    const mime = msg.mimetype || '';
                    if (!/video|audio/.test(mime)) return reply(" The replied message is not a *video* or *audio*.");

                    reply(" Converting to audio...");

                    // Download media
                    const stream = await downloadContentFromMessage(msg, mime.split('/')[0]);
                    let buffer = Buffer.from([]);
                    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

                    // Temp paths
                    const inputPath = path.join(tmpdir(), `input_${Date.now()}.mp4`);
                    const outputPath = path.join(tmpdir(), `output_${Date.now()}.mp3`);
                    fs.writeFileSync(inputPath, buffer);

                    // Convert to MP3
                    await new Promise((resolve, reject) => {
                        ffmpeg(inputPath)
                            .toFormat('mp3')
                            .on('end', resolve)
                            .on('error', reject)
                            .save(outputPath);
                    });

                    // Send converted audio
                    const audioBuffer = fs.readFileSync(outputPath);
                    await dave.sendMessage(m.chat, { 
                        audio: audioBuffer, 
                        mimetype: 'audio/mpeg',
                        ptt: false 
                    }, { quoted: m });

                    // Cleanup
                    fs.unlinkSync(inputPath);
                    fs.unlinkSync(outputPath);

                } catch (err) {
                    console.error(" toaudio error:", err);
                    reply(" Failed to convert media to audio.");
                }
                break;
            }

            case 'tovn':
            case 'toptt': {
                try {
                    const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
                    const ffmpeg = require('fluent-ffmpeg');
                    const fs = require('fs');
                    const path = require('path');
                    const { tmpdir } = require('os');

                    // Get media message
                    const quotedMsg = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                    const msg = (quotedMsg && (quotedMsg.videoMessage || quotedMsg.audioMessage)) ||
                               m.message?.videoMessage ||
                               m.message?.audioMessage;

                    if (!msg) return reply(" Reply to a *video* or *audio* message to convert to voice note.");

                    const mime = msg.mimetype || '';
                    if (!/video|audio/.test(mime)) return reply(" The replied message is not a *video* or *audio*.");

                    reply(" Converting to voice note...");

                    // Download media
                    const messageType = mime.split("/")[0];
                    const stream = await downloadContentFromMessage(msg, messageType);
                    let buffer = Buffer.from([]);
                    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

                    // Temp files
                    const inputPath = path.join(tmpdir(), `input_${Date.now()}.mp4`);
                    const outputPath = path.join(tmpdir(), `output_${Date.now()}.ogg`);
                    fs.writeFileSync(inputPath, buffer);

                    // Convert to PTT (Opus in OGG)
                    await new Promise((resolve, reject) => {
                        ffmpeg(inputPath)
                            .inputOptions('-t 59') // limit duration
                            .toFormat('opus')
                            .outputOptions(['-c:a libopus', '-b:a 64k'])
                            .on('end', resolve)
                            .on('error', reject)
                            .save(outputPath);
                    });

                    // Send as voice note
                    const audioBuffer = fs.readFileSync(outputPath);
                    await dave.sendMessage(m.chat, { 
                        audio: audioBuffer, 
                        mimetype: 'audio/ogg', 
                        ptt: true 
                    }, { quoted: m });

                    // Cleanup
                    fs.unlinkSync(inputPath);
                    fs.unlinkSync(outputPath);

                } catch (err) {
                    console.error(" tovn error:", err);
                    reply(" Failed to convert media to voice note.");
                }
                break;
            }

            case 'bass':
            case 'blown':
            case 'deep':
            case 'earrape':
            case 'fast':
            case 'fat':
            case 'nightcore':
            case 'reverse':
            case 'robot':
            case 'slow':
            case 'smooth':
            case 'squirrel': {
                try {
                    const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
                    const ffmpeg = require('fluent-ffmpeg');
                    const fs = require('fs');
                    const path = require('path');
                    const { tmpdir } = require('os');

                    // Get audio message
                    const quotedMsg = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                    const msg = (quotedMsg && quotedMsg.audioMessage) || m.message?.audioMessage;

                    if (!msg) return reply(" Reply to an *audio* message to apply effects.");

                    const mime = msg.mimetype || '';
                    if (!/audio/.test(mime)) return reply(" The replied message is not an *audio*.");

                    // Set FFmpeg filters based on command
                    let filter = '';
                    switch (command) {
                        case 'bass': filter = '-af equalizer=f=54:width_type=o:width=2:g=20'; break;
                        case 'blown': filter = '-af acrusher=.1:1:64:0:log'; break;
                        case 'deep': filter = '-af atempo=4/4,asetrate=44500*2/3'; break;
                        case 'earrape': filter = '-af volume=12'; break;
                        case 'fast': filter = '-filter:a "atempo=1.63,asetrate=44100"'; break;
                        case 'fat': filter = '-filter:a "atempo=1.6,asetrate=22100"'; break;
                        case 'nightcore': filter = '-filter:a atempo=1.06,asetrate=44100*1.25'; break;
                        case 'reverse': filter = '-filter_complex "areverse"'; break;
                        case 'robot': filter = '-filter_complex "afftfilt=real=\'hypot(re,im)*sin(0)\':imag=\'hypot(re,im)*cos(0)\':win_size=512:overlap=0.75"'; break;
                        case 'slow': filter = '-filter:a "atempo=0.7,asetrate=44100"'; break;
                        case 'smooth': filter = '-filter:v "minterpolate=\'mi_mode=mci:mc_mode=aobmc:vsbmc=1:fps=120\'"'; break;
                        case 'squirrel': filter = '-filter:a "atempo=0.5,asetrate=65100"'; break;
                    }

                    reply(` Applying ${command} effect...`);

                    // Download audio
                    const stream = await downloadContentFromMessage(msg, 'audio');
                    let buffer = Buffer.from([]);
                    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

                    // Temp paths
                    const inputPath = path.join(tmpdir(), `input_${Date.now()}.mp3`);
                    const outputPath = path.join(tmpdir(), `output_${Date.now()}.mp3`);
                    fs.writeFileSync(inputPath, buffer);

                    // Apply effect
                    await new Promise((resolve, reject) => {
                        ffmpeg(inputPath)
                            .audioFilters(filter)
                            .toFormat('mp3')
                            .on('end', resolve)
                            .on('error', reject)
                            .save(outputPath);
                    });

                    // Send processed audio
                    const audioBuffer = fs.readFileSync(outputPath);
                    await dave.sendMessage(m.chat, { 
                        audio: audioBuffer, 
                        mimetype: 'audio/mpeg',
                        ptt: false 
                    }, { quoted: m });

                    // Cleanup
                    fs.unlinkSync(inputPath);
                    fs.unlinkSync(outputPath);

                    reply(` ${command} effect applied successfully!`);

                } catch (err) {
                    console.error(` ${command} error:`, err);
                    reply(` Failed to apply ${command} effect.`);
                }
                break;
            }

            // ================= LLAMA =================
            case 'llama': {
              try {
                const axios = require('axios');

                if (!text) return reply("Please provide a question or prompt.\n\nExample:\n.llama What is artificial intelligence?");

                const apiUrl = `https://api.nekolabs.web.id/ai/cf/llama-3.3-70b?text=${encodeURIComponent(text)}`;
                const { data } = await axios.get(apiUrl);

                if (!data.success || !data.result) {
                  return reply("Could not get a response from the LLaMA API.");
                }

                const botReply = data.result;

                await dave.sendMessage(from, {
                  text: `*LLaMA 3.3 AI says:*\n\n${botReply}`
                }, { quoted: m });

              } catch (err) {
                console.error("llama error:", err);
                reply(`Error: ${err.message}`);
              }
              break;
            }

            // ================= QWEN-AL =================
            case 'qwen': {
              try {
                const axios = require('axios');

                if (!text) return reply("Please provide a question or prompt.\n\nExample:\n.qwen Write a simple JavaScript function");

                const apiUrl = `https://api.nekolabs.web.id/ai/cf/qwen-2.5-coder-32b?text=${encodeURIComponent(text)}`;

                const { data } = await axios.get(apiUrl);

                if (!data.success || !data.result) {
                  return reply("Could not get a valid response from Qwen API.");
                }

                await dave.sendMessage(from, { text: `*QWEN AI Response:*\n\n${data.result}` }, { quoted: m });

              } catch (err) {
                console.error("qwen error:", err);
                reply(`Error: ${err.message}`);
              }
              break;
            }

            // ================= PINDL =================
            case 'pindl': {
              try {
                const axios = require("axios");
                if (!args[0]) return reply('*Example :* .pindl https://pin.it/57IghwKl0');

                const url = args[0];

                // Function to fetch Pin media
                async function anakbaik(url) {
                  try {
                    const { data } = await axios.get(url, {
                      headers: {
                        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile Safari/604.1"
                      },
                      maxRedirects: 5
                    });

                    const video = data.match(/"contentUrl":"(https:\/\/v1\.pinimg\.com\/videos\/[^\"]+\.mp4)"/);
                    const image = data.match(/"imageSpec_736x":\{"url":"(https:\/\/i\.pinimg\.com\/736x\/[^\"]+\.(?:jpg|jpeg|png|webp))"/) 
                                  || data.match(/"imageSpec_564x":\{"url":"(https:\/\/i\.pinimg\.com\/564x\/[^\"]+\.(?:jpg|jpeg|png|webp))"/);
                    const thumb = data.match(/"thumbnail":"(https:\/\/i\.pinimg\.com\/videos\/thumbnails\/originals\/[^\"]+\.jpg)"/);
                    const title = data.match(/"name":"([^"]+)"/);
                    const author = data.match(/"fullName":"([^"]+)".+?"username":"([^"]+)"/);
                    const date = data.match(/"uploadDate":"([^"]+)"/);
                    const keyword = data.match(/"keywords":"([^"]+)"/);

                    return {
                      type: video ? "video" : "image",
                      title: title ? title[1] : "-",
                      author: author ? author[1] : "-",
                      username: author ? author[2] : "-",
                      media: video ? video[1] : image ? image[1] : "-",
                      thumbnail: thumb ? thumb[1] : "-",
                      uploadDate: date ? date[1] : "-",
                      keywords: keyword ? keyword[1].split(",").map(x => x.trim()) : []
                    };
                  } catch (e) {
                    return { error: e.message };
                  }
                }

                // Fetch the media
                const res = await anakbaik(url);
                if (res.error) return reply(`Error: ${res.error}`);

                // Send video or image
                if (res.type === 'video') {
                  await dave.sendMessage(from, { video: { url: res.media }, caption: `*${res.title}* by ${res.author}` }, { quoted: m });
                } else {
                  await dave.sendMessage(from, { image: { url: res.media }, caption: `*${res.title}* by ${res.author}` }, { quoted: m });
                }

              } catch (err) {
                console.error(err);
                reply(`Error: ${err.message}`);
              }
              break;
            }

            // ================= UPDATE =================
            case 'updatebot': {
              if (!isOwner) return reply("Owner-only command!");
              const { exec } = require('child_process');
              const fs = require('fs');
              const path = require('path');
              const https = require('https');
              const { rmSync } = require('fs');
              const settings = require('./config');

              const run = (cmd) => new Promise((resolve, reject) => {
                exec(cmd, { windowsHide: true }, (err, stdout, stderr) => {
                  if (err) return reject(new Error(stderr || stdout || err.message));
                  resolve(stdout.toString());
                });
              });

              const hasGitRepo = async () => {
                const gitDir = path.join(process.cwd(), '.git');
                if (!fs.existsSync(gitDir)) return false;
                try {
                  await run('git --version');
                  return true;
                } catch {
                  return false;
                }
              };

              const downloadFile = (url, dest, visited = new Set()) => new Promise((resolve, reject) => {
                if (visited.has(url) || visited.size > 5) return reject(new Error('Too many redirects'));
                visited.add(url);
                const client = url.startsWith('https://') ? require('https') : require('http');
                const req = client.get(url, res => {
                  if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
                    const location = res.headers.location;
                    if (!location) return reject(new Error(`Redirect with no Location`));
                    const nextUrl = new URL(location, url).toString();
                    res.resume();
                    return downloadFile(nextUrl, dest, visited).then(resolve).catch(reject);
                  }
                  if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
                  const file = fs.createWriteStream(dest);
                  res.pipe(file);
                  file.on('finish', () => file.close(resolve));
                  file.on('error', err => {
                    fs.unlink(dest, () => reject(err));
                  });
                });
                req.on('error', err => fs.unlink(dest, () => reject(err)));
              });

              const extractZip = async (zipPath, outDir) => {
                try {
                  await run('command -v unzip');
                  await run(`unzip -o '${zipPath}' -d '${outDir}'`);
                } catch {
                  throw new Error("No unzip tool found on system");
                }
              };

              const copyRecursive = (src, dest, ignore = [], relative = '', outList = []) => {
                if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
                for (const entry of fs.readdirSync(src)) {
                  if (ignore.includes(entry)) continue;
                  const s = path.join(src, entry);
                  const d = path.join(dest, entry);
                  const stat = fs.lstatSync(s);
                  if (stat.isDirectory()) {
                    copyRecursive(s, d, ignore, path.join(relative, entry), outList);
                  } else {
                    fs.copyFileSync(s, d);
                    if (outList) outList.push(path.join(relative, entry).replace(/\\/g, '/'));
                  }
                }
              };

              const updateViaGit = async () => {
                const oldRev = (await run('git rev-parse HEAD').catch(() => 'unknown')).trim();
                await run('git fetch --all --prune');
                const newRev = (await run('git rev-parse origin/main')).trim();
                const alreadyUpToDate = oldRev === newRev;
                await run(`git reset --hard ${newRev}`);
                await run('git clean -fd');
                return { oldRev, newRev, alreadyUpToDate };
              };

              const updateViaZip = async () => {
                const zipUrl = (settings.updateZipUrl || process.env.UPDATE_ZIP_URL || '').trim();
                if (!zipUrl) throw new Error('No ZIP URL configured.');
                const tmpDir = path.join(process.cwd(), 'tmp');
                if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
                const zipPath = path.join(tmpDir, 'update.zip');
                await downloadFile(zipUrl, zipPath);
                const extractTo = path.join(tmpDir, 'update_extract');
                if (fs.existsSync(extractTo)) fs.rmSync(extractTo, { recursive: true, force: true });
                await extractZip(zipPath, extractTo);
                const [root] = fs.readdirSync(extractTo).map(n => path.join(extractTo, n));
                const srcRoot = fs.existsSync(root) && fs.lstatSync(root).isDirectory() ? root : extractTo;
                const ignore = ['node_modules', '.git', 'session', 'tmp', 'data'];
                const copied = [];
                copyRecursive(srcRoot, process.cwd(), ignore, '', copied);
                try { fs.rmSync(extractTo, { recursive: true, force: true }); } catch {}
                try { fs.rmSync(zipPath, { force: true }); } catch {}
                return copied;
              };

              const restartProcess = async () => {
                try {
                  const sessionPath = path.join(process.cwd(), 'session');
                  const filesToDelete = [
                    'app-state-sync-version.json',
                    'message-history.json',
                    'sender-key-memory.json',
                    'baileys_store_multi.json',
                    'baileys_store.json'
                  ];
                  if (fs.existsSync(sessionPath)) {
                    for (const file of filesToDelete) {
                      const filePath = path.join(sessionPath, file);
                      if (fs.existsSync(filePath)) rmSync(filePath, { force: true });
                    }
                  }
                  await run('pm2 restart all');
                } catch {
                  process.exit(0);
                }
              };

              try {
                await dave.sendMessage(m.chat, { text: "_Updating bot... please wait_" }, { quoted: m });
                await dave.sendMessage(m.chat, { react: { text: '', key: m.key } });

                if (await hasGitRepo()) {
                  const { oldRev, newRev, alreadyUpToDate } = await updateViaGit();
                  if (alreadyUpToDate) reply("Already up to date!");
                  else reply(`Updated from ${oldRev} → ${newRev}`);
                  await run('npm install --no-audit --no-fund');
                } else {
                  await updateViaZip();
                  reply("ZIP update completed!");
                }

                await dave.sendMessage(m.chat, { text: "_Restarting bot..._" }, { quoted: m });
                await dave.sendMessage(m.chat, { react: { text: '', key: m.key } });
                await restartProcess();

              } catch (err) {
                console.error("UpdateBot Error:", err);
                reply(`Update failed:\n${err.message}`);
              }
              break;
            }

            // ================= PINTEREST =================
            case 'pinterest': {
              try {
                const axios = require('axios');
                const query = args.join(' ');

                if (!query) return reply(' Please provide a search term. Usage: .pinterest <search term>');

                await reply(` Searching Pinterest for "${query}"...`);

                const apiUrl = `https://casper-tech-apis.vercel.app/api/search/pinterest?q=${encodeURIComponent(query)}`;
                const res = await axios.get(apiUrl);

                const data = res.data;

                // Check the correct response structure
                if (!data || !data.success || !data.images || data.images.length === 0) {
                  return reply(' No images found.');
                }

                // Get the first image
                const imageUrl = data.images[0].imageUrl; // adjust to your API response
                const name = data.images[0].name || "Untitled";

                // Send the image
                await dave.sendMessage(from, {
                  image: { url: imageUrl },
                  caption: ` Pinterest Result for "${query}"\n\n ${name}\n Found ${data.totalResults || data.images.length} results`
                }, { quoted: m });

              } catch (err) {
                console.error('Pinterest command error:', err);
                await reply(` Error retrieving Pinterest image: ${err.message}`);
              }
              break;
            }

            // ================= ENC =================
                        // ================= ENC =================
            case 'enc':
            case 'encrypt': {
              try {
                const JsConfuser = require('js-confuser');
                const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
                const fs = require('fs');

                // Ensure we have a quoted message
                const quotedMsg = m.message?.extendedTextMessage?.contextInfo?.quotedMessage || (m.quoted ? m.quoted.message : null);
                if (!quotedMsg) return reply(' Please reply to the .js file you want to encrypt.');

                const doc = quotedMsg.documentMessage;
                if (!doc || !doc.fileName || !doc.fileName.endsWith('.js')) {
                  return reply(' Please reply to a JavaScript (.js) file to encrypt.');
                }

                // Download the file (stream -> buffer)
                const stream = await downloadContentFromMessage(doc, 'document');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

                if (!buffer || buffer.length === 0) return reply(' Failed to download the file. Try again.');

                // Show a reaction while processing
                await dave.sendMessage(m.chat, { react: { text: '', key: m.key } });

                const fileName = doc.fileName;

                // Obfuscate
                const obfuscatedCode = await JsConfuser.obfuscate(buffer.toString('utf8'), {
                  target: "node",
                  preset: "high",
                  compact: true,
                  minify: true,
                  flatten: true,
                  identifierGenerator: function () {
                    const originalString = "素GIFTED晴DAVE晴" + "素GIFTED晴DAVE晴";
                    const removeUnwantedChars = (input) => input.replace(/[^a-zA-Z素GIFTED晴DAVE晴]/g, "");
                    const randomString = (length) => {
                      let result = "";
                      const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
                      for (let i = 0; i < length; i++) {
                        result += characters.charAt(Math.floor(Math.random() * characters.length));
                      }
                      return result;
                    };
                    return removeUnwantedChars(originalString) + randomString(2);
                  },
                  renameVariables: true,
                  renameGlobals: true,
                  stringEncoding: true,
                  stringSplitting: 0.0,
                  stringConcealing: true,
                  stringCompression: true,
                  duplicateLiteralsRemoval: 1.0,
                  shuffle: { hash: 0.0, true: 0.0 },
                  stack: true,
                  controlFlowFlattening: 1.0,
                  opaquePredicates: 0.9,
                  deadCode: 0.0,
                  dispatcher: true,
                  rgf: false,
                  calculator: true,
                  hexadecimalNumbers: true,
                  movedDeclarations: true,
                  objectExtraction: true,
                  globalConcealing: true,
                });

                // Send obfuscated file back
                await dave.sendMessage(m.chat, {
                  document: Buffer.from(obfuscatedCode, 'utf8'),
                  mimetype: 'application/javascript',
                  fileName: `${fileName}`,
                  caption: `• Successful Encrypt\n• Type: Hard Code\n• @gifteddevsmd`
                }, { quoted: m });

              } catch (err) {
                console.error('Error during encryption:', err);
                await reply(` An error occurred: ${err.message || String(err)}`);
              }
              break;
            }

        }

        // Handle eval commands (preserving your style)
        if (budy.startsWith('>')) {
            if (!isOwner) return reply("_This command is for owner only_")
            try {
                let evaled = await eval(budy.slice(2));
                if (typeof evaled !== 'string') evaled = require('util').inspect(evaled);
                await reply(evaled);
            } catch (err) {
                reply(String(err));
            }
        }

        if (budy.startsWith('<')) {
            if (!isOwner) return reply("_This command is for owner only_")
            let kode = budy.trim().split(/ +/)[0]
            let teks
            try {
                teks = await eval(`(async () => { ${kode == ">>" ? "return" : ""} ${q}})()`)
            } catch (e) {
                teks = e
            } finally {
                await reply(require('util').format(teks))
            }
        }

    } catch (err) {
        console.log("Error in dave.js:", require("util").format(err));
    }
};

// Export for index.js compatibility
module.exports.handleCommand = module.exports;

let file = require.resolve(__filename);
require('fs').watchFile(file, () => {
    require('fs').unwatchFile(file);
    console.log('\x1b[0;32m' + __filename + ' \x1b[1;32mupdated!\x1b[0m');
    delete require.cache[file];
    require(file);
});
