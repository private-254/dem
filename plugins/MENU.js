import { loadDatabase, saveDatabase } from '../lib/database.js';
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import path from "path";
import { getGoodbye, setGoodbye, removeGoodbye, isGoodbyeEnabled } from '../lib/database.js';
import { getWelcome, setWelcome, removeWelcome, isWelcomeEnabled } from '../lib/database.js';
// Function to get all commands and organize by category - UPDATED FOR NEW SYSTEM

const getCommandsList = () => {

    // Use the new file-based categories from commandHandler

    const categories = global.fileCategories || {};

    const sortedCategories = {};

    

    // Sort category names alphabetically

    Object.keys(categories).sort().forEach(key => {

        // Sort commands within each category alphabetically

        sortedCategories[key] = categories[key].sort();

    });

    

    return sortedCategories;

};

// Different menu styles

const menuStyles = {

    1: (botInfo, categories, totalCommands) => {

        let menu = `╭─「 ${botInfo.name} 」\n`;

        menu += `│◦ Owner: ${botInfo.owner}\n`;

        menu += `│◦ Version: ${botInfo.version}\n`;

        menu += `│◦ Prefix: ${botInfo.prefix}\n`;

        menu += `│◦ Commands: ${totalCommands}\n`;

        menu += `│◦ Runtime: ${botInfo.runtime}\n`;

        menu += `╰─────────────────\n`;

        

        for (let [category, cmds] of Object.entries(categories)) {

            menu += `╭─「 ${category} 」\n`; // Already uppercase from commandHandler

            cmds.forEach(cmd => {

                menu += `│◦ ${botInfo.prefix}${cmd}\n`;

            });

            menu += `╰─────────────────\n`;

        }

        

        return menu;

    },

    2: (botInfo, categories, totalCommands) => {

        let menu = `┏▣ ◈ ${botInfo.name} ◈\n`;

        menu += `│➽ Owner: ${botInfo.owner}\n`;

        menu += `│➽ Version: ${botInfo.version}\n`;

        menu += `│➽ Prefix: ${botInfo.prefix}\n`;

        menu += `│➽ Total Commands: ${totalCommands}\n`;

        menu += `│➽ Runtime: ${botInfo.runtime}\n`;

        menu += `┗▣\n`;

        for (let [category, cmds] of Object.entries(categories)) {

            menu += `┏▣ ◈${category}◈\n`;

            cmds.forEach((cmd, index) => {

                const prefix = index === cmds.length - 1 ? '┗▣' : '│➽';

                menu += `${prefix} ${botInfo.prefix}${cmd}\n`;

            });

            menu += `\n`;

        }

        

        return menu;

    },

    3: (botInfo, categories, totalCommands) => {

        let menu = `═══════════════════\n`;

        menu += `║               ${botInfo.name}              ║\n`;

        menu += `═══════════════════\n\n`;

        menu += `╔════════════════▣\n`;

        menu += `┊✺┌──❐BOT-INFO❐ ──⊷\n`;

        menu += `╠✤│•Owner: ${botInfo.owner}\n`;

        menu += `╠✤│•Version: ${botInfo.version}\n`;

        menu += `╠✤│•Prefix: ${botInfo.prefix}\n`;

        menu += `╠✤│•Commands: ${totalCommands}\n`;

        menu += `╠✤│•Runtime: ${botInfo.runtime}\n`;

        menu += `┊✺└────••••────⊷\n`;

        menu += `╚════════════════▣\n\n`;

        

        for (let [category, cmds] of Object.entries(categories)) {

            menu += `┊✺┌──❐${category}❐ ──⊷\n`;

            

            const cmdList = cmds.map(cmd => `╠✤│${botInfo.prefix}${cmd}`).join('\n');          

            menu += `${cmdList}\n\n`;

        }

        

        return menu;

    },

    

    4: (botInfo, categories, totalCommands) => {

        let menu = `╔══════════════════╗\n`;

        menu += `║     ${botInfo.name}                   ║\n`;

        menu += `╚══════════════════╝\n\n`;

        menu += `┌─ Bot Information\n`;

        menu += `├─ Owner: ${botInfo.owner}\n`;

        menu += `├─ Version: ${botInfo.version}\n`;

        menu += `├─ Prefix: ${botInfo.prefix}\n`;

        menu += `├─ Commands: ${totalCommands}\n`;

        menu += `└─ Runtime: ${botInfo.runtime}\n\n`;

        for (let [category, cmds] of Object.entries(categories)) {

            menu += `┌─ ${getEmoji(category)} ${category}\n`;

            cmds.forEach((cmd, index) => {

                const prefix = index === cmds.length - 1 ? '└─' : '├─';

                menu += `${prefix} ${botInfo.prefix}${cmd}\n`;

            });

            menu += `\n`;

        }

        

        return menu;

    },

    

    5: (botInfo, categories, totalCommands) => {

        let menu = `┏▣════════════════▣╗\n`;

        menu += `║         ${botInfo.name}        ║\n`;

        menu += `┗▣════════════════▣╝\n`;

        menu += `▣ Owner: ${botInfo.owner}\n`;

        menu += `▣ Version: ${botInfo.version}\n`;

        menu += `▣ Prefix: ${botInfo.prefix}\n`;

        menu += `▣ Total Commands: ${totalCommands}\n`;

        menu += `▣ Runtime: ${botInfo.runtime}\n\n`;

        for (let [category, cmds] of Object.entries(categories)) {

            menu += `┏▣════════════════▣╗\n`;

            menu += `║         ${category}        \n`;

            menu += `┗▣════════════════▣╝\n`;

            const rows = [];

            for (let i = 0; i < cmds.length; i++) {

                const row = `▣${botInfo.prefix}${cmds[i]}`;

                rows.push(row);

            }

            menu += rows.join('\n') + '\n\n';

        }

        return menu;

    }

};

// Function to get emoji for categories

const getEmoji = (category) => {

    const emojis = {

        'admin menu': '👑',

        'moderation menu': '🛡️',

        'utility menu': '🔧',

        'fun menu': '🎉',

        'music menu': '🎵',

        'download menu': '📥',

        'downloader menu': '📥',

        'search menu': '🔍',

        'settings menu': '⚙️',

        'support menu': '🆘',

        'owner menu': '👨‍💻',

        'group menu': '👥',

        'information menu': 'ℹ️',

        'ai menu': '🤖',

        'anime menu': '🎌',

        'animu menu': '🎌'

    };

    return emojis[category.toLowerCase()] || '📂';

};

// Function to get bot runtime

const getBotRuntime = () => {

    const uptime = process.uptime() * 1000;

    const days = Math.floor(uptime / (1000 * 60 * 60 * 24));

    const hours = Math.floor((uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));

    const seconds = Math.floor((uptime % (1000 * 60)) / 1000);

    

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;

};

export default [

    {

        name: 'menu',

        aliases: ['commands'],

        execute: async (sock, message, args, context) => {

            try {

                const db = loadDatabase();

                const menuStyle = db.settings.menustyle || "1";

                // fallback image list

                const defaultImages = [

"https://files.catbox.moe/60lx1p.jpg",
"https://files.catbox.moe/vx0x2b.jpg",
"https://files.catbox.moe/a6jx24.jpg",
"https://files.catbox.moe/xij87o.jpg"
                ];

                let menuImage = db.settings.menuimage || "";

                // Pick random fallback if not set

                if (!menuImage || menuImage.trim() === "") {

                    menuImage = defaultImages[Math.floor(Math.random() * defaultImages.length)];

                }

                

                // fallback audio list

                const defaultAudios = [                  "https://files.catbox.moe/p9c9kk.mp3",                    "https://files.catbox.moe/9oaifh.mp3",                 "https://files.catbox.moe/vpd20k.mp3",                    "https://files.catbox.moe/tue3uc.mp3" ];

                const menuAudio = db.settings.menuaudio || "off";

                const categories = getCommandsList();

                const totalCommands = Object.values(categories).reduce((total, cmds) => total + cmds.length, 0);
                
const time = global.getCurrentTime('time2');
                

                const botInfo = {

                    name: global.botName || "DAVE-MD",

                    owner: global.botOwner || "DAVE",

                    version: global.version || "2.0.0",

                    prefix: global.prefix || ".",

                    time: time,
                
                    Platform: global.server,

                    runtime: getBotRuntime()

                };

                

                const menuText = menuStyles[menuStyle](botInfo, categories, totalCommands);

                

                // Style 2 should never use image

                if (menuStyle === "2") {

                    await context.replyPlain(menuText,{ quoted:global.menu});

                    return;

                }

                

                if (menuImage && menuImage.trim() !== "") {

                    try {

                        await context.reply({

                            image: { url: menuImage },

                            caption: menuText,

                            ...context.channelInfo

                        },{ quoted:global.menu});

                    } catch (imageError) {

                        await context.replyPlain(menuText + "\nMenu image failed to load",{ quoted:global.menu});

                    }

                } else {

                    await context.replyPlain(menuText,{ quoted:global.menu});

                }

                // Send audio if enabled

                

if (menuAudio === "on") {
    try {
        const randomAudio = defaultAudios[Math.floor(Math.random() * defaultAudios.length)];

        // Temp output path for ogg file
        const outputFile = path.join("./data/temp", `voice_${Date.now()}.ogg`);

        // Ensure temp folder exists
        if (!fs.existsSync("./data/temp")) {
            fs.mkdirSync("./data/temp");
        }

        // Convert to ogg/opus with ffmpeg
        await new Promise((resolve, reject) => {
            ffmpeg(randomAudio)
                .audioCodec("libopus")
                .audioChannels(1)
                .audioFrequency(48000)
                .format("ogg")
                .on("end", resolve)
                .on("error", reject)
                .save(outputFile);
        });

        // Send as voice note
        await context.replyPlain(
            {
                audio: fs.readFileSync(outputFile),
                mimetype: "audio/ogg; codecs=opus",
                ptt: true,
            },
            { quoted: message }
        );

        // Cleanup temp file
        fs.unlinkSync(outputFile);
    } catch (err) {
        console.error("Failed to send menu audio:", err);
    }
}

                 

            } catch (error) {

                console.error('Error in menu command:', error);

                await context.reply('Error generating menu. Please try again.');

            }

        }

    },

    

    {

        name: 'setmenu',

        aliases: ['menustyle'],

        execute: async (sock, message, args, context) => {

            if (!context.senderIsSudo) return context.reply('This command is only available for the owner!');

            

            const styleNumber = args[1];

            

            if (!styleNumber || !['1', '2', '3', '4', '5'].includes(styleNumber)) {

                return context.reply('Please specify a valid menu style (1-5)\nExample: .setmenu 1',{quoted:global.setmenu});

            }

            

            const db = loadDatabase();

            db.settings.menustyle = styleNumber;

            saveDatabase(db);

            

            await context.reply(`Menu style updated to ${styleNumber}! Use .menu to see the new style.`,{quoted:global.setmenu});

        }

    },

        {
    name: 'setmenuimg',
    aliases: ['menuimage', 'setmenuimage'],
    execute: async (sock, message, args, context) => {
        if (!context.senderIsSudo) return context.reply('❌ This command is only available for the owner!',{quoted:global.setmenuimg});
        
        const imageUrl = args.slice(1).join(" ");
        if (!imageUrl) {
            return context.replyPlain(
                `❌ Please provide an image URL.\n\n` +
                `Example: ${global.prefix}setmenuimg https://files.catbox.moe/example.jpg\n\n` +
                `Or use "${global.prefix}setmenuimg off" to disable menu image.\n\n` +
                `📝 Recommended hosts:\n` +
                `• files.catbox.moe\n` +
                `• telegra.ph\n` +
                `• imgur.com (direct links)`
            ,{quoted:global.setmenuimg});
        }
        
        const db = loadDatabase();
        
        if (imageUrl.toLowerCase() === 'off') {
            db.settings.menuimage = "";
            saveDatabase(db);
            await context.reply('✅ Menu image disabled successfully!',{quoted:global.setmenuimg});
            return;
        }

        // Enhanced URL validation
        if (!imageUrl.startsWith('http')) {
            return context.reply('❌ Please provide a valid image URL starting with http or https.',{quoted:global.setmenuimg});
        }

        // Check for problematic hosts
        const problematicHosts = ['i.ibb.co', 'postimg.cc', 'imgbox.com'];
        const urlHost = new URL(imageUrl).hostname;
        
        if (problematicHosts.includes(urlHost)) {
            await context.replyPlain(
                `⚠️ Warning: ${urlHost} may not work reliably with WhatsApp bots.\n\n` +
                `Recommended alternatives:\n` +
                `• Upload to files.catbox.moe\n` +
                `• Use telegra.ph\n` +
                `• Try imgur.com direct links\n\n` +
                `Proceeding anyway...`
            ,{quoted:global.setmenuimg});
        }

        // Test the URL before saving
        try {
            await context.replyPlain('🔄 Testing image URL...',{quoted:global.setmenuimg});
            
            const fetch = require('node-fetch');
            const response = await fetch(imageUrl, {
                method: 'HEAD',
                timeout: 10000,
                headers: {
                    'User-Agent': 'WhatsApp-Bot/1.0'
                }
            });
            
            if (!response.ok) {
                return context.replyPlain(`❌ Image URL is not accessible. Status: ${response.status}\n\nPlease try a different URL.`,{quoted:global.setmenuimg});
            }
            
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.startsWith('image/')) {
                return context.replyPlain(`❌ URL does not point to a valid image.\n\nContent-Type: ${contentType || 'unknown'}`,{quoted:global.setmenuimg});
            }
            
        } catch (error) {
            return context.reply(
                `❌ Failed to verify image URL.\n\n` +
                `Error: ${error.message}\n\n` +
                `Please check the URL and try again.`
            ,{quoted:global.setmenuimg});
        }

        db.settings.menuimage = imageUrl;
        saveDatabase(db);
        
        await context.reply(
            `✅ Menu image set successfully!\n\n` +
            `URL: ${imageUrl}\n\n` +
            `Use ${global.prefix}menu to see the new image.`,{quoted:global.setmenuimg});
    }
},

   
      {

    name: 'maudio',

    aliases: ['menuvoice'],

    category: 'SETTINGS MENU',

    execute: async (sock, message, args, context) => {

        if (!context.senderIsSudo) return context.reply('❌ Only the owner can use this!');

        const db = loadDatabase();

        const choice = args[1]?.toLowerCase();

        if (!choice || !['on','off'].includes(choice)) {

            return context.reply(`❌ Invalid usage.\n\nExample:\n${global.prefix}menuaudio on\n${global.prefix}menuaudio off`,{quoted:global.maudio});

        }

        db.settings.menuaudio = choice;

        saveDatabase(db);

        await context.reply(`✅ Menu audio has been turned ${choice.toUpperCase()}!`,{quoted:global.maudio});

    }

},
    {

    name: 'menuinfo',

    aliases: ['menudetails'],

    description: 'Show menu settings and available styles',

    execute: async (sock, message, args, context) => {

        try {

            const db = loadDatabase() || {};

            // ✅ Handle missing db.settings safely

            const settings = db.settings || {};

            const currentStyle = settings.menustyle || "1";

            const currentImage = settings.menuimage || "Not set";

            // ✅ Use new file-based categories

            const categories = global.fileCategories || {};

            const totalCommands = Object.values(categories).reduce(

                (total, cmds) => total + cmds.length,

                0

            );

            let info = `📋 Menu Configuration\n\n`;

            info += `🎨 Current Style: ${currentStyle}\n`;

            info += `🖼️ Image URL: ${typeof currentImage === "string" && currentImage.length > 50 

                ? currentImage.substring(0, 50) + "..." 

                : currentImage}\n`;

            info += `📊 Total Commands: ${totalCommands}\n`;

            info += `📂 Folders: ${Object.keys(categories).length}\n\n`;

            info += `📑 Available Menu Styles:\n`;

            info += `1️⃣ Classic Box Style\n`;

            info += `2️⃣ Professional Tree Style\n`;

            info += `3️⃣ Emoji Decorated Style\n`;

            info += `4️⃣ Inline Command Style\n`;

            info += `5️⃣ Elegant Border Style\n\n`;

            info += `⚙️ Commands:\n`;

            info += `• ${global.prefix}setmenu <1-5> - Change menu style\n`;

            info += `• ${global.prefix}setmenuimg <url> - Set menu image\n`;

            info += `• ${global.prefix}menu - Show the menu`;

            await context.reply(info,{quoted: global.menuInfo});

        } catch (err) {

            console.error("❌ Error in menuinfo:", err);

            await context.reply("❌ Failed to load menu info. (Check logs for details)");

        }

    }

},
    {

    name: 'welcome',

    aliases: ['wel'],

    category: 'SETTINGS MENU',

    description: 'Manage welcome messages for new members',

    usage: '.welcome on/off/set <message>',

    execute: async (sock, message, args, context) => {

        const { reply, react, chatId, isGroup, isSenderAdmin, isBotAdmin } = context;

        if (!isGroup) {

            return await reply('❌ This command only works in groups!');

        }

        if (!isBotAdmin) {

            return await reply('❌ Please make the bot an admin to use this command.');

        }

        if (!isSenderAdmin && !message.key.fromMe && !context.senderIsSudo) {

            return await reply('❌ Only group admins can use this command!');

        }

        // Import your existing functions

        

        // If no arguments, show current settings

        if (args.length < 2) { // Changed from < 1 to < 2 because args[0] is "welcome"

            const isEnabled = isWelcomeEnabled(chatId);

            const currentMessage = getWelcome(chatId);

            const status = isEnabled ? '✅ Enabled' : '❌ Disabled';

            const customMsg = currentMessage ? `\n\n📝 Current Message:\n${currentMessage}` : '';

            

            return await reply(

                `🎉 Welcome Message Setup\n\n` +

                `Status: ${status}${customMsg}\n\n` +

                `Use the following commands:\n\n` +

                `✅ .welcome on — Enable welcome messages\n` +

                `🛠️ .welcome set Your custom message — Set a custom welcome message\n` +

                `🚫 .welcome off — Disable welcome messages\n\n` +

                `Available Variables:\n` +

                `• {user} - Mentions the new member\n` +

                `• {group} - Shows group name\n` +

                `• {description} - Shows group description`

            );

        }

        const action = args[1].toLowerCase(); // Changed from args[0] to args[1]

        if (action === 'on') {

            await react('✅');

            const defaultMessage = '🎉 Welcome {user} to {group}!\n\nEnjoy your stay and follow the group rules.';

            setWelcome(chatId, defaultMessage);

            return await reply('🎉 Welcome messages enabled! New members will receive a greeting.');

        }

        if (action === 'off') {

            await react('❌');

            removeWelcome(chatId);

            return await reply('🚫 Welcome messages disabled.');

        }

        if (action === 'set') {

            if (args.length < 3) { // Need at least "welcome set message"

                return await reply('❌ Please provide a welcome message.\n\nExample: .welcome set Welcome {user} to {group}!');

            }

            await react('📝');

            const customMessage = args.slice(2).join(' '); // Start from args[2]

            setWelcome(chatId, customMessage);

            return await reply(`✅ Custom welcome message set!\n\n📝 Message: ${customMessage}`);

        }

        return await reply('❌ Invalid option. Use: on, off, or set <message>');

    }

},
{

    name: 'goodbye',

    aliases: ['bye'],

    category: 'SETTINGS MENU',

    description: 'Manage goodbye messages for leaving members',

    usage: '.goodbye on/off/set <message>',

    execute: async (sock, message, args, context) => {

        const { reply, react, chatId, isGroup, isSenderAdmin, isBotAdmin } = context;

        if (!isGroup) {

            return await reply('❌ This command only works in groups!');

        }

        if (!isBotAdmin) {

            return await reply('❌ Please make the bot an admin to use this command.');

        }

        if (!isSenderAdmin && !message.key.fromMe && !context.senderIsSudo) {

            return await reply('❌ Only group admins can use this command!');

        }

        // Import your existing functions

        

        if (args.length < 2) {

            const isEnabled = isGoodbyeEnabled(chatId);

            const currentMessage = getGoodbye(chatId);

            const status = isEnabled ? '✅ Enabled' : '❌ Disabled';

            const customMsg = currentMessage ? `\n\n📝 Current Message:\n${currentMessage}` : '';

            

            return await reply(

                `👋 Goodbye Message Setup\n\n` +

                `Status: ${status}${customMsg}\n\n` +

                `Use the following commands:\n\n` +

                `✅ .goodbye on — Enable goodbye messages\n` +

                `🛠️ .goodbye set Your custom message — Set a custom goodbye message\n` +

                `🚫 .goodbye off — Disable goodbye messages\n\n` +

                `Available Variables:\n` +

                `• {user} - Mentions the leaving member\n` +

                `• {group} - Shows group name\n` +

                `• {description} - Shows group description\n` +

                `• {count} - Total members in group`

            );

        }

        const action = args[1].toLowerCase();

        if (action === 'on') {

            await react('✅');

            const defaultMessage = 'Hey {user}👋\n\nGoodbye from {group}\nWe now have {count} members remaining in this group. 🙂\nThanks for being part of our community:\n{description}\nᴘᴏᴡᴇʀᴇᴅ ʙʏ Isaactech.';

            setGoodbye(chatId, defaultMessage);

            return await reply('👋 Goodbye messages enabled! Leaving members will receive a farewell.');

        }

        if (action === 'off') {

            await react('❌');

            removeGoodbye(chatId);

            return await reply('🚫 Goodbye messages disabled.');

        }

        if (action === 'set') {

            if (args.length < 3) {

                return await reply('❌ Please provide a goodbye message.\n\nExample: .goodbye set Goodbye {user}, thanks for being part of {group}!');

            }

            await react('📝');

            const customMessage = args.slice(2).join(' ');

            setGoodbye(chatId, customMessage);

            return await reply(`✅ Custom goodbye message set!\n\n📝 Message: ${customMessage}`);

        }

        return await reply('❌ Invalid option. Use: on, off, or set <message>');

    }

}  

];
