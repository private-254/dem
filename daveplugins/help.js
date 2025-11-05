const settings = require('../settings');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { getMenuStyle, getMenuSettings, MENU_STYLES } = require('./menuSettings');
const { generateWAMessageFromContent } = require('@whiskeysockets/baileys');
const { getPrefix, handleSetPrefixCommand } = require('./setprefix');

const { getOwnerName, handleSetOwnerCommand } = require('./setowner');

// Utility Functions
function formatTime(seconds) {
    const days = Math.floor(seconds / (24 * 60 * 60));
    seconds = seconds % (24 * 60 * 60);
    const hours = Math.floor(seconds / (60 * 60));
    seconds = seconds % (60 * 60);
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);

    let time = '';
    if (days > 0) time += `${days}d `;
    if (hours > 0) time += `${hours}h `;
    if (minutes > 0) time += `${minutes}m `;
    if (seconds > 0 || time === '') time += `${seconds}s`;

    return time.trim();
}

function detectHost() {
    const env = process.env;

    if (env.RENDER || env.RENDER_EXTERNAL_URL) return 'Render';
    if (env.DYNO || env.HEROKU_APP_DIR || env.HEROKU_SLUG_COMMIT) return 'Heroku';
    if (env.VERCEL || env.VERCEL_ENV || env.VERCEL_URL) return 'Vercel';
    if (env.PORTS || env.CYPHERX_HOST_ID) return "CypherXHost";
    if (env.RAILWAY_ENVIRONMENT || env.RAILWAY_PROJECT_ID) return 'Railway';
    if (env.REPL_ID || env.REPL_SLUG) return 'Replit';

    const hostname = os.hostname().toLowerCase();
    if (!env.CLOUD_PROVIDER && !env.DYNO && !env.VERCEL && !env.RENDER) {
        if (hostname.includes('vps') || hostname.includes('server')) return 'VPS';
        return 'Panel';
    }

    return 'Unknown Host';
}

// Generate Menu Function
const generateMenu = (pushname, currentMode, hostName, ping, uptimeFormatted, prefix = '.') => {
    const memoryUsage = process.memoryUsage();
    const botUsedMemory = memoryUsage.heapUsed;
    const totalMemory = os.totalmem();
    const systemUsedMemory = totalMemory - os.freemem();
    const prefix2 = getPrefix();
    let newOwner = getOwnerName();
    
    let menu = ` → 𝗗𝗔𝗩𝗘-𝗠𝗗\n`;
    menu += `┃ ✦ BotType  : *plugins+case*\n`;
    menu += `┃ ✦ Version  : *v${settings.version}*\n`;
    menu += `┃ ✦ Uptime   : *${uptimeFormatted}*\n`;
    menu += `┃ ✦ RAM      : *${Math.round(botUsedMemory / 1024 / 1024)} MB*\n`;
    menu += `┃ ✦ User     : *${pushname}*\n`;
    menu += `┃ ✦ Host     : *${hostName}*\n`;
    menu += `┃ ✦ Mode     : *${currentMode}*\n`;
    menu += `┃ ✦ Prefix   : *${prefix2}*\n`;
    menu += `┗➤\n\n`;

    // DAVE-MD CONTROL
    menu += `*𝗗𝗔𝗩𝗘-𝗠𝗗 𝗖𝗢𝗡𝗧𝗥𝗢𝗟*\n`;
    menu += `┣➤ ping\n`;
    menu += `┣➤ public\n`;
    menu += `┣➤ private\n`;
    menu += `┣➤ autoread\n`;
    menu += `┣➤ autotyping\n`;
    menu += `┣➤ antidelete\n`;
    menu += `┣➤ setprefix\n`;
    menu += `┣➤ setmenu\n`;
    menu += `┣➤ updatebot\n`;
    menu += `┣➤ restart\n`;
    menu += `┣➤ block\n`;
    menu += `┣➤ unblock\n`;
    menu += `┣➤ backup\n`;
    menu += `┣➤ clearchat\n`;
    menu += `┣➤ listgc\n`;
    menu += `┣➤ onlygroup\n`;
    menu += `┣➤ onlypc\n`;
    menu += `┣➤ anticall\n`;
    menu += `┣➤ autoreact\n`;
    menu += `┣➤ setpp\n`;
    menu += `┣➤ vv\n`;
    menu += `┗➤ addowner\n\n`;

    // OWNER MANAGEMENT
    menu += `*𝗢𝗪𝗡𝗘𝗥 𝗠𝗔𝗡𝗔𝗚𝗘𝗠𝗘𝗡𝗧*\n`;
    menu += `┣➤ join\n`;
    menu += `┣➤ addowner\n`;
    menu += `┣➤ delowner\n`;
    menu += `┣➤ setnamabot\n`;
    menu += `┣➤ setbiobot\n`;
    menu += `┣➤ setppbot\n`;
    menu += `┣➤ delppbot\n`;
    menu += `┗➤ listowner\n\n`;

    // GROUP MANAGEMENT
    menu += `*𝗚𝗥𝗢𝗨𝗣 𝗠𝗔𝗡𝗔𝗚𝗘𝗠𝗘𝗡𝗧*\n`;
    menu += `┣➤ add\n`;
    menu += `┣➤ kick\n`;
    menu += `┣➤ promote\n`;
    menu += `┣➤ demote\n`;
    menu += `┣➤ setdesc\n`;
    menu += `┣➤ setppgc\n`;
    menu += `┣➤ tagall\n`;
    menu += `┣➤ hidetag\n`;
    menu += `┣➤ group\n`;
    menu += `┣➤ linkgc\n`;
    menu += `┣➤ revoke\n`;
    menu += `┣➤ welcome\n`;
    menu += `┣➤ antilink\n`;
    menu += `┣➤ warning\n`;
    menu += `┣➤ unwarning\n`;
    menu += `┣➤ close\n`;
    menu += `┣➤ open\n`;
    menu += `┗➤ vcf\n\n`;

    // AI & CHATGPT
    menu += `*𝗔𝗜 & 𝗖𝗛𝗔𝗧𝗚𝗣𝗧*\n`;
    menu += `┣➤ ai\n`;
    menu += `┣➤ gpt\n`;
    menu += `┣➤ gemini\n`;
    menu += `┣➤ imagine\n`;
    menu += `┣➤ flux\n`;
    menu += `┣➤ openai\n`;
    menu += `┣➤ dave\n`;
    menu += `┣➤ toanime\n`;
    menu += `┣➤ toreal\n`;
    menu += `┣➤ removebg\n`;
    menu += `┗➤ remini\n\n`;

    // MEDIA DOWNLOAD
    menu += `*𝗠𝗘𝗗𝗜𝗔 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗*\n`;
    menu += `┣➤ tiktok\n`;
    menu += `┣➤ play\n`;
    menu += `┣➤ song\n`;
    menu += `┣➤ igdl\n`;
    menu += `┣➤ fb\n`;
    menu += `┣➤ video\n`;
    menu += `┣➤ ytmp3\n`;
    menu += `┣➤ ytmp4\n`;
    menu += `┣➤ instagram\n`;
    menu += `┣➤ apk\n`;
    menu += `┗➤ mediafire\n\n`;

    // ANALYSIS TOOLS
    menu += `*𝗔𝗡𝗔𝗟𝗬𝗦𝗜𝗦 𝗧𝗢𝗢𝗟𝗦*\n`;
    menu += `┣➤ weather\n`;
    menu += `┣➤ repo\n`;
    menu += `┣➤ fact\n`;
    menu += `┣➤ gitstalk\n`;
    menu += `┣➤ ssweb\n`;
    menu += `┣➤ whois\n`;
    menu += `┣➤ myip\n`;
    menu += `┣➤ trt\n`;
    menu += `┣➤ profile\n`;
    menu += `┗➤ githubstalk\n\n`;

    // SEARCH TOOLS
    menu += `*𝗦𝗘𝗔𝗥𝗖𝗛 𝗧𝗢𝗢𝗟𝗦*\n`;
    menu += `┣➤ pinterest\n`;
    menu += `┣➤ yts\n`;
    menu += `┣➤ lyrics\n`;
    menu += `┣➤ google\n`;
    menu += `┣➤ playstore\n`;
    menu += `┣➤ movie\n`;
    menu += `┣➤ getpp\n`;
    menu += `┗➤ animesearch\n\n`;

    // CONVERSION TOOLS
    menu += `*𝗖𝗢𝗡𝗩𝗘𝗥𝗦𝗜𝗢𝗡 𝗧𝗢𝗢𝗟𝗦*\n`;
    menu += `┣➤ toaudio\n`;
    menu += `┣➤ tovoicenote\n`;
    menu += `┣➤ toimage\n`;
    menu += `┣➤ tovideo\n`;
    menu += `┣➤ tourl\n`;
    menu += `┣➤ take\n`;
    menu += `┣➤ togif\n`;
    menu += `┣➤ emojimix\n`;
    menu += `┣➤ hd\n`;
    menu += `┗➤ readtext\n\n`;

    // STICKER MENU
    menu += `*𝗦𝗧𝗜𝗖𝗞𝗘𝗥 𝗠𝗘𝗡𝗨*\n`;
    menu += `┣➤ sticker\n`;
    menu += `┣➤ tgsticker\n`;
    menu += `┣➤ simage\n`;
    menu += `┣➤ blur\n`;
    menu += `┣➤ meme\n`;
    menu += `┣➤ take\n`;
    menu += `┗➤ emojimix\n\n`;

    // FUN & GAMES
    menu += `*𝗙𝗨𝗡 & 𝗚𝗔𝗠𝗘𝗦*\n`;
    menu += `┣➤ tictactoe\n`;
    menu += `┣➤ hangman\n`;
    menu += `┣➤ trivia\n`;
    menu += `┣➤ truth\n`;
    menu += `┣➤ dare\n`;
    menu += `┣➤ 8ball\n`;
    menu += `┣➤ meme\n`;
    menu += `┣➤ wasted\n`;
    menu += `┣➤ trash\n`;
    menu += `┣➤ trigger\n`;
    menu += `┗➤ wanted\n\n`;

    // ANIME MENU
    menu += `*𝗔𝗡𝗜𝗠𝗘 𝗠𝗘𝗡𝗨*\n`;
    menu += `┣➤ neko\n`;
    menu += `┣➤ waifu\n`;
    menu += `┣➤ loli\n`;
    menu += `┣➤ poke\n`;
    menu += `┣➤ cry\n`;
    menu += `┣➤ kiss\n`;
    menu += `┣➤ pat\n`;
    menu += `┣➤ hug\n`;
    menu += `┣➤ wink\n`;
    menu += `┗➤ facepalm\n\n`;

    // TEXT MAKER
    menu += `*𝗧𝗘𝗫𝗧 𝗠𝗔𝗞𝗘𝗥*\n`;
    menu += `┣➤ metallic\n`;
    menu += `┣➤ ice\n`;
    menu += `┣➤ snow\n`;
    menu += `┣➤ matrix\n`;
    menu += `┣➤ neon\n`;
    menu += `┣➤ devil\n`;
    menu += `┣➤ thunder\n`;
    menu += `┣➤ hacker\n`;
    menu += `┣➤ blackpink\n`;
    menu += `┣➤ glitch\n`;
    menu += `┣➤ fire\n`;
    menu += `┗➤ light\n\n`;

    // IMAGE EDIT
    menu += `*𝗜𝗠𝗔𝗚𝗘 𝗘𝗗𝗜𝗧*\n`;
    menu += `┣➤ heart\n`;
    menu += `┣➤ circle\n`;
    menu += `┣➤ lgbt\n`;
    menu += `┣➤ namecard\n`;
    menu += `┣➤ tweet\n`;
    menu += `┣➤ ytcomment\n`;
    menu += `┣➤ comrade\n`;
    menu += `┣➤ glass\n`;
    menu += `┣➤ jail\n`;
    menu += `┣➤ triggered\n`;
    menu += `┗➤ passed\n\n`;

    // DEVELOPER TOOLS
    menu += `*𝗗𝗘𝗩𝗘𝗟𝗢𝗣𝗘𝗥 𝗧𝗢𝗢𝗟𝗦*\n`;
    menu += `┣➤ eval\n`;
    menu += `┣➤ exec\n`;
    menu += `┣➤ $ \n`;
    menu += `┣➤ update\n`;
    menu += `┣➤ backup\n`;
    menu += `┗➤ restart\n\n`;

    // MAIN MENU
    menu += `*𝗠𝗔𝗜𝗡 𝗠𝗘𝗡𝗨*\n`;
    menu += `┣➤ menu\n`;
    menu += `┣➤ script\n`;
    menu += `┣➤ owner\n`;
    menu += `┣➤ dev\n`;
    menu += `┣➤ donate\n`;
    menu += `┣➤ runtime\n`;
    menu += `┗➤ request\n`;

    return menu;
};

// Helper function to safely load thumbnail
async function loadThumbnail(thumbnailPath) {
    try {
        if (fs.existsSync(thumbnailPath)) {
            return fs.readFileSync(thumbnailPath);
        } else {
            console.log(`Thumbnail not found: ${thumbnailPath}, using fallback`);
            return Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
        }
    } catch (error) {
        console.error('Error loading thumbnail:', error);
        return Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    }
}

// Create fake contact for enhanced replies
function createFakeContact(message) {
    return {
        key: {
            participants: "0@s.whatsapp.net",
            remoteJid: "status@broadcast",
            fromMe: false,
            id: "DAVE-MD-MENU"
        },
        message: {
            contactMessage: {
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:DAVE-MD\nitem1.TEL;waid=${message.key.participant?.split('@')[0] || message.key.remoteJid.split('@')[0]}:${message.key.participant?.split('@')[0] || message.key.remoteJid.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
            }
        },
        participant: "0@s.whatsapp.net"
    };
}

// Send Menu With Style function (keep your existing function)
async function sendMenuWithStyle(sock, chatId, message, menulist, menustyle, thumbnailBuffer, pushname) {
    const fkontak = createFakeContact(message);
    const botname = "_𝗗𝗔𝗩𝗘-𝗠𝗗_";
    const ownername = pushname;
    const tylorkids = thumbnailBuffer;
    const plink = "https://github.com/giftdee";

    if (menustyle === '1') {
        await sock.sendMessage(chatId, {
            document: {
                url: "https://i.ibb.co/2W0H9Jq/avatar-contact.png",
            },
            caption: menulist,
            mimetype: "application/zip",
            fileName: `${botname}`,
            fileLength: "9999999",
            contextInfo: {
                externalAdReply: {
                    showAdAttribution: false,
                    title: "",
                    body: "",
                    thumbnail: tylorkids,
                    sourceUrl: plink,
                    mediaType: 1,
                    renderLargerThumbnail: true,
                },
            },
        }, { quoted: fkontak });
    } else if (menustyle === '2') {
        await sock.sendMessage(chatId, { 
            text: menulist 
        }, { quoted: fkontak });
    } else if (menustyle === '3') {
        await sock.sendMessage(chatId, {
            text: menulist,
            contextInfo: {
                externalAdReply: {
                    showAdAttribution: false,
                    title: botname,
                    body: ownername,
                    thumbnail: tylorkids,
                    sourceUrl: plink,
                    mediaType: 1,
                    renderLargerThumbnail: true,
                },
            },
        }, { quoted: fkontak });
    } else if (menustyle === '4') {
        await sock.sendMessage(chatId, {
            image: tylorkids,
            caption: menulist,
        }, { quoted: fkontak });
    } else if (menustyle === '5') {
        let massage = generateWAMessageFromContent(chatId, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        body: {
                            text: null,            
                        },
                        footer: {
                            text: menulist, 
                        },
                        nativeFlowMessage: {
                            buttons: [{
                                text: null
                            }], 
                        },
                    },
                },
            },
        }, { quoted: fkontak });
        await sock.relayMessage(chatId, massage.message, { messageId: massage.key.id });
    } else if (menustyle === '6') {
        await sock.relayMessage(chatId, {
            requestPaymentMessage: {
                currencyCodeIso4217: 'USD',
                requestFrom: '0@s.whatsapp.net',
                amount1000: '1',
                noteMessage: {
                    extendedTextMessage: {
                        text: menulist,
                        contextInfo: {
                            mentionedJid: [message.key.participant || message.key.remoteJid],
                            externalAdReply: {
                                showAdAttribution: false,
                            },
                        },
                    },
                },
            },
        }, {});
    } else {
        await sock.sendMessage(chatId, { 
            text: menulist 
        }, { quoted: fkontak });
    }
}

// Main help command function
async function helpCommand(sock, chatId, message) {
    const pushname = message.pushName || "Unknown User"; 
    const menuStyle = getMenuStyle();

    console.log('Current menu style:', menuStyle);

    let data = JSON.parse(fs.readFileSync('./data/messageCount.json'));
    
    const fkontak = createFakeContact(message);
    
    const start = Date.now();
    await sock.sendMessage(chatId, { 
        text: '_Wait loading menu..._' 
    }, { quoted: fkontak });
    const end = Date.now();
    const ping = Math.round((end - start) / 2);

    const uptimeInSeconds = process.uptime();
    const uptimeFormatted = formatTime(uptimeInSeconds);
    const currentMode = data.isPublic ? 'public' : 'private';    
    const hostName = detectHost();
    
    const menulist = generateMenu(pushname, currentMode, hostName, ping, uptimeFormatted);

    const thumbnailFiles = [
        'menu1.jpg',
        'menu2.jpg', 
        'menu3.jpg',
        'menu4.jpg',
        'menu5.jpg'
    ];
    const randomThumbFile = thumbnailFiles[Math.floor(Math.random() * thumbnailFiles.length)];
    const thumbnailPath = path.join(__dirname, '../assets', randomThumbFile);

    await sock.sendMessage(chatId, {
        react: { text: '🔥', key: message.key }
    });

    try {
        const thumbnailBuffer = await loadThumbnail(thumbnailPath);
        await sendMenuWithStyle(sock, chatId, message, menulist, menuStyle, thumbnailBuffer, pushname);

        await sock.sendMessage(chatId, {
            react: { text: '🔥', key: message.key }
        });

    } catch (error) {
        console.error('Error in help command:', error);
        try {
            await sock.sendMessage(chatId, { 
                text: menulist 
            }, { quoted: fkontak });
        } catch (fallbackError) {
            console.error('Even fallback failed:', fallbackError);
        }
    }
}

module.exports = helpCommand;