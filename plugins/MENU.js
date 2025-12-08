import fs from "fs";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import { loadDatabase, saveDatabase } from '../lib/database.js';
import { 
    getGoodbye, setGoodbye, removeGoodbye, isGoodbyeEnabled, 
    getWelcome, setWelcome, removeWelcome, isWelcomeEnabled 
} from '../lib/database.js';

// ------------------------
// Commands Listing Utility
// ------------------------
const getCommandsList = () => {
    const categories = global.fileCategories || {};
    const sortedCategories = {};
    Object.keys(categories).sort().forEach(key => {
        sortedCategories[key] = categories[key].sort();
    });
    return sortedCategories;
};

// ------------------------
// Menu Styles
// ------------------------
const menuStyles = {
    1: (botInfo, categories, totalCommands) => {
        let menu = `╭─────────────────╮\n`;
        menu += `│   ${botInfo.name}   │\n`;
        menu += `╰─────────────────╯\n`;
        menu += `│ Owner: ${botInfo.owner}\n`;
        menu += `│ Version: ${botInfo.version}\n`;
        menu += `│ Prefix: ${botInfo.prefix}\n`;
        menu += `│ Commands: ${totalCommands}\n`;
        menu += `│ Runtime: ${botInfo.runtime}\n`;
        menu += `├─────────────────┤\n`;

        for (let [category, cmds] of Object.entries(categories)) {
            menu += `│ ${category}\n`;
            menu += `├─────────────────┤\n`;
            cmds.forEach(cmd => menu += `│➤ ${botInfo.prefix}${cmd}\n`);
            menu += `├─────────────────┤\n`;
        }
        menu += `╰─────────────────╯\n`;
        return menu;
    },

    2: (botInfo, categories, totalCommands) => {
        let menu = `┌─────────────────┐\n`;
        menu += `│   ${botInfo.name}   │\n`;
        menu += `└─────────────────┘\n`;
        menu += `┌─ BOT INFORMATION\n`;
        menu += `│➤ Owner: ${botInfo.owner}\n`;
        menu += `│➤ Version: ${botInfo.version}\n`;
        menu += `│➤ Prefix: ${botInfo.prefix}\n`;
        menu += `│➤ Total Commands: ${totalCommands}\n`;
        menu += `│➤ Runtime: ${botInfo.runtime}\n`;
        menu += `└─────────────────┘\n\n`;

        for (let [category, cmds] of Object.entries(categories)) {
            menu += `┌─ ${category}\n`;
            cmds.forEach(cmd => menu += `│➤ ${botInfo.prefix}${cmd}\n`);
            menu += `└─────────────────┘\n\n`;
        }
        return menu;
    },

    3: (botInfo, categories, totalCommands) => {
        let menu = `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n    ${botInfo.name}\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n\n`;
        menu += `│➤ Owner: ${botInfo.owner}\n│➤ Version: ${botInfo.version}\n│➤ Prefix: ${botInfo.prefix}\n│➤ Commands: ${totalCommands}\n│➤ Runtime: ${botInfo.runtime}\n│──────────────────\n\n`;

        for (let [category, cmds] of Object.entries(categories)) {
            menu += `▬ ${category} ▬\n`;
            cmds.forEach(cmd => menu += `│➤ ${botInfo.prefix}${cmd}\n`);
            menu += `│──────────────────\n\n`;
        }
        return menu;
    },

    4: (botInfo, categories, totalCommands) => {
        let menu = `╔══════════════════╗\n║   ${botInfo.name}   ║\n╚══════════════════╝\n\n`;
        menu += `╔══════════════════╗\n║ BOT INFORMATION  ║\n╠══════════════════╣\n`;
        menu += `║➤ Owner: ${botInfo.owner}\n║➤ Version: ${botInfo.version}\n║➤ Prefix: ${botInfo.prefix}\n║➤ Commands: ${totalCommands}\n║➤ Runtime: ${botInfo.runtime}\n╚══════════════════╝\n\n`;

        for (let [category, cmds] of Object.entries(categories)) {
            menu += `╔══════════════════╗\n║ ${category}\n╠══════════════════╣\n`;
            cmds.forEach(cmd => menu += `║➤ ${botInfo.prefix}${cmd}\n`);
            menu += `╚══════════════════╝\n\n`;
        }
        return menu;
    },

    5: (botInfo, categories, totalCommands) => {
        let menu = `┌──────────────────┐\n│   ${botInfo.name}   │\n└──────────────────┘\n├── BOT INFO ──┤\n`;
        menu += `│➤ Owner: ${botInfo.owner}\n│➤ Version: ${botInfo.version}\n│➤ Prefix: ${botInfo.prefix}\n│➤ Total Commands: ${totalCommands}\n│➤ Runtime: ${botInfo.runtime}\n└──────────────┘\n\n`;

        for (let [category, cmds] of Object.entries(categories)) {
            menu += `├── ${category} ──┤\n`;
            cmds.forEach(cmd => menu += `│➤ ${botInfo.prefix}${cmd}\n`);
            menu += `└──────────────┘\n\n`;
        }
        return menu;
    }
};

// ------------------------
// Runtime Utility
// ------------------------
const getBotRuntime = () => {
    const uptime = process.uptime() * 1000;
    const days = Math.floor(uptime / 86400000);
    const hours = Math.floor((uptime % 86400000) / 3600000);
    const minutes = Math.floor((uptime % 3600000) / 60000);
    const seconds = Math.floor((uptime % 60000) / 1000);
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
};

// ------------------------
// Export Commands
// ------------------------
export default [
    {
        name: 'menu',
        aliases: ['commands'],
        execute: async (sock, message, args, context) => {
            try {
                const db = loadDatabase();
                const menuStyle = db.settings.menustyle || "1";

                const defaultImages = [
                    "https://files.catbox.moe/adthi3.jpg",
                    "https://files.catbox.moe/vyfdib.jpg",
                    "https://files.catbox.moe/b921ez.jpg",
                    "https://files.catbox.moe/fl4buk.jpg"
                ];
                let menuImage = db.settings.menuimage || "";
                
                // Only use default image if style is not 2 and no custom image is set
                if (!menuImage && menuStyle !== "2") {
                    menuImage = defaultImages[Math.floor(Math.random() * defaultImages.length)];
                }

                const menuAudio = db.settings.menuaudio || "off";

                const categories = getCommandsList();
                const totalCommands = Object.values(categories).reduce((total, cmds) => total + cmds.length, 0);
                const botInfo = {
                    name: global.botName || "DAVE-MD",
                    owner: global.botOwner || "DAVE",
                    version: global.version || "2.0.0",
                    prefix: global.prefix || ".",
                    runtime: getBotRuntime()
                };

                const menuText = menuStyles[menuStyle](botInfo, categories, totalCommands);

                // DECIDE WHICH TYPE OF MENU TO SEND (ONLY ONE!)
                let menuSent = false;
                
                if (menuStyle === "2") {
                    // Style 2: Always send as plain text (no image)
                    await context.replyPlain(menuText, { quoted: global.menu });
                    menuSent = true;
                } else if (menuImage && menuImage.trim() !== "") {
                    // Try to send with image (styles 1, 3, 4, 5)
                    try {
                        await context.reply({ 
                            image: { url: menuImage }, 
                            caption: menuText 
                        }, { quoted: global.menu });
                        menuSent = true;
                    } catch (error) {
                        console.error("Failed to send menu with image, falling back to plain text:", error);
                        // Fallback to plain text if image fails
                        await context.replyPlain(menuText + "\n\n⚠️ Image failed to load", { quoted: global.menu });
                        menuSent = true;
                    }
                }
                
                // If no menu was sent yet (no image and not style 2)
                if (!menuSent) {
                    await context.replyPlain(menuText, { quoted: global.menu });
                }

                // Send audio if enabled (separate message)
                if (menuAudio === "on") {
                    try {
                        const defaultAudios = [
                            "https://files.catbox.moe/p9c9kk.mp3",
                            "https://files.catbox.moe/9oaifh.mp3",
                            "https://files.catbox.moe/vpd20k.mp3",
                            "https://files.catbox.moe/tue3uc.mp3"
                        ];
                        const randomAudio = defaultAudios[Math.floor(Math.random() * defaultAudios.length)];
                        const outputFile = path.join("./data/temp", `voice_${Date.now()}.ogg`);
                        if (!fs.existsSync("./data/temp")) fs.mkdirSync("./data/temp", { recursive: true });

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

                        // Send audio as separate message (not quoted)
                        await sock.sendMessage(context.chatId, {
                            audio: fs.readFileSync(outputFile),
                            mimetype: "audio/ogg; codecs=opus",
                            ptt: true
                        });
                        fs.unlinkSync(outputFile);
                    } catch (err) { 
                        console.error("Failed to send menu audio:", err); 
                    }
                }
            } catch (err) {
                console.error("Error in menu command:", err);
                await context.reply("Error generating menu. Please try again.");
            }
        }
    },
    {
        name: 'setmenu',
        aliases: ['menustyle'],
        execute: async (sock, message, args, context) => {
            if (!context.senderIsSudo) return context.reply('This command is only available for the owner.');
            const styleNumber = args[1];
            if (!styleNumber || !['1','2','3','4','5'].includes(styleNumber)) {
                return context.reply('Please specify a valid menu style (1-5)\nExample: .setmenu 1');
            }
            const db = loadDatabase();
            db.settings.menustyle = styleNumber;
            saveDatabase(db);
            await context.reply(`Menu style updated to ${styleNumber}. Use .menu to see the new style.`);
        }
    },
    {
        name: 'setmenuimg',
        aliases: ['menuimage', 'setmenuimage'],
        execute: async (sock, message, args, context) => {
            if (!context.senderIsSudo) return context.reply('This command is only available for the owner.');

            const imageUrl = args.slice(1).join(" ");
            if (!imageUrl) return context.reply('Provide an image URL or "off" to disable.');

            const db = loadDatabase();
            if (imageUrl.toLowerCase() === 'off') {
                db.settings.menuimage = "";
                saveDatabase(db);
                return await context.reply('Menu image disabled.');
            }

            if (!imageUrl.startsWith('http')) return context.reply('Provide a valid image URL starting with http or https.');

            // Test URL
            try {
                const fetch = await import('node-fetch').then(m => m.default);
                const res = await fetch(imageUrl, { method: 'HEAD', timeout: 10000 });
                if (!res.ok) return context.reply(`Image URL not accessible. Status: ${res.status}`);
                const contentType = res.headers.get('content-type');
                if (!contentType.startsWith('image/')) return context.reply(`URL is not an image. Content-Type: ${contentType}`);
            } catch (err) {
                return context.reply(`Failed to verify image URL. ${err.message}`);
            }

            db.settings.menuimage = imageUrl;
            saveDatabase(db);
            await context.reply(`Menu image set.\nURL: ${imageUrl}`);
        }
    },
    {
        name: 'maudio',
        aliases: ['menuvoice'],
        category: 'SETTINGS MENU',
        execute: async (sock, message, args, context) => {
            if (!context.senderIsSudo) return context.reply('Only the owner can use this.');
            const choice = args[1]?.toLowerCase();
            if (!choice || !['on','off'].includes(choice)) return context.reply(`Invalid usage.\nExample: .menuaudio on/off`);
            const db = loadDatabase();
            db.settings.menuaudio = choice;
            saveDatabase(db);
            await context.reply(`Menu audio has been turned ${choice.toUpperCase()}.`);
        }
    },
    {
        name: 'menuinfo',
        aliases: ['menudetails'],
        execute: async (sock, message, args, context) => {
            try {
                const db = loadDatabase();
                const settings = db.settings || {};
                const currentStyle = settings.menustyle || "1";
                const currentImage = settings.menuimage || "Not set";
                const currentAudio = settings.menuaudio || "off";
                const categories = global.fileCategories || {};
                const totalCommands = Object.values(categories).reduce((total, cmds) => total + cmds.length, 0);

                let info = `Menu Configuration\n\n`;
                info += `Current Style: ${currentStyle}\n`;
                info += `Image URL: ${currentImage.length > 50 ? currentImage.substring(0,50)+'...' : currentImage}\n`;
                info += `Audio: ${currentAudio}\n`;
                info += `Total Commands: ${totalCommands}\n`;
                info += `Folders: ${Object.keys(categories).length}\n\n`;
                info += `Available Menu Styles:\n1. Box\n2. Tree\n3. Minimal\n4. Box\n5. Clean\n\n`;
                info += `Commands:\n.setmenu <1-5>\n.setmenuimg <url>\n.maudio on/off\n.menu`;
                await context.reply(info);
            } catch (err) {
                console.error(err);
                await context.reply("Failed to load menu info.");
            }
        }
    },
    {
        name: 'welcome',
        aliases: ['wel'],
        category: 'SETTINGS MENU',
        execute: async (sock, message, args, context) => {
            const { reply, chatId, isGroup, isSenderAdmin, isBotAdmin } = context;
            if (!isGroup) return reply('This command only works in groups.');
            if (!isBotAdmin) return reply('Bot must be admin.');
            if (!isSenderAdmin && !context.senderIsSudo) return reply('Only admins can use this command.');

            if (args.length < 2) {
                const isEnabled = isWelcomeEnabled(chatId);
                const msg = getWelcome(chatId) || '';
                return reply(`Welcome Message\nStatus: ${isEnabled ? 'Enabled' : 'Disabled'}\nCurrent Message:\n${msg}`);
            }

            const action = args[1].toLowerCase();
            if (action === 'on') { setWelcome(chatId, 'Welcome {user} to {group}!'); return reply('Welcome enabled.'); }
            if (action === 'off') { removeWelcome(chatId); return reply('Welcome disabled.'); }
            if (action === 'set') { setWelcome(chatId, args.slice(2).join(' ')); return reply('Custom welcome message set.'); }

            return reply('Invalid option. Use: on, off, set <message>');
        }
    },
    {
        name: 'goodbye',
        aliases: ['bye'],
        category: 'SETTINGS MENU',
        execute: async (sock, message, args, context) => {
            const { reply, chatId, isGroup, isSenderAdmin, isBotAdmin } = context;
            if (!isGroup) return reply('This command only works in groups.');
            if (!isBotAdmin) return reply('Bot must be admin.');
            if (!isSenderAdmin && !context.senderIsSudo) return reply('Only admins can use this command.');

            if (args.length < 2) {
                const isEnabled = isGoodbyeEnabled(chatId);
                const msg = getGoodbye(chatId) || '';
                return reply(`Goodbye Message\nStatus: ${isEnabled ? 'Enabled' : 'Disabled'}\nCurrent Message:\n${msg}`);
            }

            const action = args[1].toLowerCase();
            if (action === 'on') { setGoodbye(chatId, 'Goodbye {user} from {group}.'); return reply('Goodbye enabled.'); }
            if (action === 'off') { removeGoodbye(chatId); return reply('Goodbye disabled.'); }
            if (action === 'set') { setGoodbye(chatId, args.slice(2).join(' ')); return reply('Custom goodbye message set.'); }

            return reply('Invalid option. Use: on, off, set <message>');
        }
    }
];