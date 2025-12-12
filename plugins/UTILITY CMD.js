import fetch from 'node-fetch';
import { writeExifImg } from '../lib/exif.js';  
import { WAVersion, sleep, runtime, processTime, isUrl, getSizeMedia, bytesToSize, getTime, formatDate, tanggal, jam, unixTimestampSeconds } from '../lib/myfunc.js';
import { handleMediaUpload } from '../lib/catbox.js';
import { buildContext } from '../lib/context.js';
import { updateSetting, getSetting, getAvailableFontStyles, applyFontStyle } from '../lib/database.js';
import settings from '../settings.js';
import os from 'os';
import fs from 'fs';
import path from 'path';
import moment from 'moment';
import { downloadMediaMessage } from '@whiskeysockets/baileys';
import webp from 'node-webpmux';
import crypto from 'crypto';

export default [
    {
        name: 'runtime',
        aliases: ['botruntime'],
        category: 'UTILITY MENU',
        execute: async (sock, message, args, context) => {
            try {
                const uptime = process.uptime();
                const runtimeText = runtime(uptime);

                await context.reply(`Dave-md Runtime\n\nUptime: ${runtimeText}\nStarted: ${formatDate(Date.now() - (uptime * 1000))}`, {quoted: global.RTM});

            } catch (error) {
                console.error('Error in runtime command:', error);
                await context.reply('Error getting runtime information.', {quoted: global.RTM});
            }
        }
    },
    {
        name: 'checkurl',
        aliases: ['validateurl', 'urlcheck'],
        category: 'UTILITY MENU',
        execute: async (sock, message, args, context) => {
            try {
                const url = args.slice(1).join(' ');
                if (!url) {
                    return await context.reply('Please provide a URL to check.\n\nExample: .checkurl https://google.com');
                }

                const isValidUrl = isUrl(url);

                if (isValidUrl) {
                    await context.reply(`Valid URL\n\nURL: ${url}\nStatus: Valid URL format`);
                } else {
                    await context.reply(`Invalid URL\n\nInput: ${url}\nStatus: Invalid URL format`);
                }

            } catch (error) {
                console.error('Error in checkurl command:', error);
                await context.reply('Error checking URL.');
            }
        }
    },

{
    name: "telegram",
    aliases: ["tg", "tgsticker", "telegramsticker"],
    category: "UTILITY MENU",
    description: "Download Telegram sticker packs",
    usage: ".telegram <telegram-sticker-url>",

    execute: async (sock, m, args, context) => {
        const { chatId, reply, react } = context;

        try {
            await react('📦');

            const text = args.slice(1).join(' ').trim();
            
            if (!text) {
                return await reply('Please enter the Telegram sticker URL!\n\nExample: .telegram https://t.me/addstickers/Porcientoreal');
            }

            if (!text.match(/(https:\/\/t.me\/addstickers\/)/gi)) {
                return await reply('Invalid URL! Use a valid Telegram sticker pack link.');
            }

            const packName = text.replace("https://t.me/addstickers/", "");
            const botToken = settings.telegram_token || '7801479976:AAGuPL0a7kXXBYz6XUSR_ll2SR5V_W6oHl4';

            // Fetch sticker pack metadata
            const response = await fetch(
                `https://api.telegram.org/bot${botToken}/getStickerSet?name=${encodeURIComponent(packName)}`
            );

            const stickerSet = await response.json();
            if (!stickerSet.ok) {
                throw new Error("Invalid Telegram sticker pack");
            }

            const stickerCount = stickerSet.result.stickers.length;
            await reply(`Found ${stickerCount} stickers\nStarting download...`);

            const tmpDir = path.join(process.cwd(), 'tmp');
            if (!fs.existsSync(tmpDir)) {
                fs.mkdirSync(tmpDir, { recursive: true });
            }

            let successCount = 0;

            for (let i = 0; i < stickerCount; i++) {
                try {
                    const sticker = stickerSet.result.stickers[i];

                    // Get file info
                    const fileInfo = await fetch(
                        `https://api.telegram.org/bot${botToken}/getFile?file_id=${sticker.file_id}`
                    );
                    const fileData = await fileInfo.json();
                    if (!fileData.ok) continue;

                    // Download sticker
                    const fileUrl = `https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`;
                    const imageResponse = await fetch(fileUrl);
                    const imageBuffer = await imageResponse.arrayBuffer();

                    const tempInput = path.join(tmpDir, `temp_${Date.now()}_${i}`);
                    const tempOutput = path.join(tmpDir, `sticker_${Date.now()}_${i}.webp`);
                    
                    fs.writeFileSync(tempInput, Buffer.from(imageBuffer));

                    const isAnimated = sticker.is_animated || sticker.is_video;

                    // Convert to WhatsApp sticker format
                    const ffmpegCommand = isAnimated
                        ? `ffmpeg -i "${tempInput}" -vf "scale=512:-1:force_original_aspect_ratio=decrease,fps=15,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -lossless 0 -q:v 60 "${tempOutput}"`
                        : `ffmpeg -i "${tempInput}" -vf "scale=512:-1:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -vcodec libwebp -lossless 0 -q:v 75 "${tempOutput}"`;

                    await new Promise((resolve, reject) => {
                        exec(ffmpegCommand, (err) => err ? reject(err) : resolve());
                    });

                    const webpBuffer = fs.readFileSync(tempOutput);

                    // Create EXIF metadata for WhatsApp
                    const webp = await import('node-webpmux');
                    const img = new webp.Image();
                    await img.load(webpBuffer);

                    const crypto = await import('crypto');
                    const metadata = {
                        "sticker-pack-id": crypto.randomBytes(32).toString("hex"),
                        "sticker-pack-name": packName,
                        "sticker-pack-publisher": "Dave Md Bot",
                        "emojis": sticker.emoji ? [sticker.emoji] : ["🤖"]
                    };

                    const exifAttr = Buffer.from([
                        0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00,
                        0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00,
                        0x00, 0x00, 0x16, 0x00, 0x00, 0x00
                    ]);

                    const jsonBuffer = Buffer.from(JSON.stringify(metadata), "utf8");
                    const exif = Buffer.concat([exifAttr, jsonBuffer]);
                    exif.writeUIntLE(jsonBuffer.length, 14, 4);

                    img.exif = exif;
                    const finalBuffer = await img.save(null);

                    // Send sticker
                    await sock.sendMessage(chatId, { sticker: finalBuffer });
                    successCount++;

                    // Delay to avoid rate limiting
                    await new Promise(resolve => setTimeout(resolve, 800));

                    // Cleanup temp files
                    try {
                        if (fs.existsSync(tempInput)) fs.unlinkSync(tempInput);
                        if (fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput);
                    } catch (cleanupError) {
                        console.error('[TELEGRAM] Cleanup error:', cleanupError.message);
                    }

                } catch (err) {
                    console.error(`[TELEGRAM] Sticker ${i} error:`, err.message);
                    continue;
                }
            }

            await reply(`Successfully downloaded ${successCount}/${stickerCount} stickers!`);
            await react('✅');

        } catch (error) {
            console.error('[TELEGRAM] Command error:', error.message);
            await react('❌');
            
            if (error.message.includes('FFmpeg')) {
                await reply('FFmpeg is required for this command!');
            } else {
                await reply('Failed to download Telegram stickers. Check the link and try again.');
            }
        }
    }
},
    {
        name: 'getsize',
        aliases: ['filesize', 'mediasize'],
        category: 'UTILITY MENU',
        execute: async (sock, message, args, context) => {
            try {
                const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

                if (quotedMessage) {
                    const hasMedia = quotedMessage.imageMessage || quotedMessage.videoMessage || quotedMessage.audioMessage || quotedMessage.documentMessage;

                    if (hasMedia) {
                        const mediaMessage = quotedMessage.imageMessage || quotedMessage.videoMessage || quotedMessage.audioMessage || quotedMessage.documentMessage;
                        const mediaUrl = mediaMessage.url;

                        if (mediaUrl) {
                            const size = await getSizeMedia(mediaUrl);
                            const mediaType = quotedMessage.imageMessage ? 'Image' : quotedMessage.videoMessage ? 'Video' : quotedMessage.audioMessage ? 'Audio' : 'Document';

                            await context.reply(`Media Size Information\n\nType: ${mediaType}\nSize: ${size}`);
                        } else {
                            await context.reply('Could not get media URL from quoted message.');
                        }
                    } else {
                        await context.reply('Quoted message does not contain media.');
                    }
                } else {
                    const url = args.slice(1).join(' ');
                    if (!url) {
                        return await context.reply('Please reply to a media message or provide a URL.\n\nExample: .getsize https://example.com/image.jpg');
                    }

                    const size = await getSizeMedia(url);
                    await context.reply(`File Size Information\n\nURL: ${url}\nSize: ${size}`);
                }

            } catch (error) {
                console.error('Error in getsize command:', error);
                await context.reply('Error getting file size.');
            }
        }
    },
    {
        name: 'bytesto',
        aliases: ['convertbytes', 'formatbytes'],
        category: 'UTILITY MENU',
        execute: async (sock, message, args, context) => {
            try {
                const bytes = args[1];
                if (!bytes || isNaN(bytes)) {
                    return await context.reply('Please provide a valid number of bytes.\n\nExample: .bytesto 1048576');
                }

                const formattedSize = bytesToSize(parseInt(bytes));

                await context.reply(`Bytes Conversion\n\nInput: ${bytes} bytes\nFormatted: ${formattedSize}`);

            } catch (error) {
                console.error('Error in bytesto command:', error);
                await context.reply('Error converting bytes.');
            }
        }
    },
    {
        name: 'date',
        aliases: ['currentdate', 'today'],
        category: 'UTILITY MENU',
        execute: async (sock, message, args, context) => {
            try {
                const currentDate = global.getCurrentTime('full');
                const tanggalDate = global.getCurrentTimezone;

                await context.reply(`Current Date\n\nFull Date: ${currentDate}\nTime Zone: ${tanggalDate}`, {quoted: global.Daté});

            } catch (error) {
                console.error('Error in date command:', error);
                await context.reply('Error getting current date.', {quoted: global.Daté});
            }
        }
    },
    {
        name: 'timestamp',
        aliases: ['unix', 'unixtime'],
        category: 'UTILITY MENU',
        execute: async (sock, message, args, context) => {
            try {
                const inputDate = args.slice(1).join(' ');

                if (inputDate) {
                    const date = new Date(inputDate);
                    if (isNaN(date.getTime())) {
                        return await context.reply('Invalid date format.\n\nExample: .timestamp 2024-01-01 or just .timestamp for current time');
                    }
                    const timestamp = unixTimestampSeconds(date);
                    await context.reply(`Timestamp Conversion\n\nDate: ${date.toISOString()}\nUnix Timestamp: ${timestamp}`);
                } else {
                    const currentTimestamp = unixTimestampSeconds();
                    const currentDate = new Date();
                    await context.reply(`Current Timestamp\n\nDate: ${currentDate.toISOString()}\nUnix Timestamp: ${currentTimestamp}`);
                }

            } catch (error) {
                console.error('Error in timestamp command:', error);
                await context.reply('Error generating timestamp.');
            }
        }
    },
    {
        name: 'waversion',
        aliases: ['whatsappversion', 'waupdate'],
        category: 'UTILITY MENU',
        execute: async (sock, message, args, context) => {
            try {
                await context.reply('Checking WhatsApp Web version...');

                const version = await WAVersion();

                await context.reply(`WhatsApp Web Version\n\nCurrent Version: ${version[0]}\nLast Updated: ${new Date().toLocaleDateString()}\nStatus: Up to date`);

            } catch (error) {
                console.error('Error in waversion command:', error);
                await context.reply('Error checking WhatsApp version.');
            }
        }
    },
    {
        name: 'sleep',
        aliases: ['delay', 'wait'],
        category: 'UTILITY MENU',
        execute: async (sock, message, args, context) => {
            try {
                if (!context.senderIsSudo) {
                    return await context.reply('This command is only available for the owner.');
                }

                const ms = parseInt(args[1]) || 1000;

                if (ms > 30000) {
                    return await context.reply('Maximum delay is 30 seconds (30000ms).');
                }

                await context.reply(`Sleeping for ${ms}ms...`);

                await sleep(ms);

                await context.reply(`Woke up after ${ms}ms delay.`);

            } catch (error) {
                console.error('Error in sleep command:', error);
                await context.reply('Error in sleep command.');
            }
        }
    },
    {
        name: 'setfont',
        aliases: [],
        category: 'owner',
        description: 'Change bot text output formatting style',
        usage: '.setfont <style> or .setfont list',
        execute: async (sock, message, args, context) => {
            const { reply, senderIsSudo } = context; 
            const cleanArgs = args[0] === 'setfont' ? args.slice(1) : args;

            if (!senderIsSudo) {
                return await reply('Only owner can change font styles.', {quoted: global.setfot});
            }

            if (cleanArgs.length < 1) {
                const currentStyle = getSetting('fontstyle', 'normal');
                return await reply(
                    `Font Style Manager\n\nCurrent style: ${currentStyle}\n\nUsage:\n.setfont list - Show all styles\n.setfont <style> - Set font style\n.setfont current - Show current style`, {quoted: global.setfot});
            }

            const action = cleanArgs[0].toLowerCase();

            if (action === 'list') {
                const styles = getAvailableFontStyles();
                const currentStyle = getSetting('fontstyle', 'normal');

                let styleList = 'Available Font Styles:\n\n';
                styles.forEach((style, index) => {
                    const marker = style === currentStyle ? '>' : '-';
                    styleList += `${marker} ${style}\n`;
                });

                styleList += `\nCurrent: ${currentStyle}\n`;
                styleList += `\nUsage: .setfont <style_name>`;

                return await reply(styleList, {quoted: global.setfot});
            }

            if (action === 'current') {
                const currentStyle = getSetting('fontstyle', 'normal');
                const sampleText = applyFontStyle('This is how your bot text will look');

                return await reply(
                    `Current Font Style\n\n` +
                    `Style: ${currentStyle}\n` +
                    `Preview: ${sampleText}`, {quoted: global.setfot});
            }

            const availableStyles = getAvailableFontStyles();
            const newStyle = action;

            if (!availableStyles.includes(newStyle)) {
                return await reply(
                    `Invalid font style: ${newStyle}\n\n` +
                    `Available styles:\n${availableStyles.map(s => `- ${s}`).join('\n')}\n\n` +
                    `Use .setfont list to see all options.`, {quoted: global.setfot});
            }

            const success = updateSetting('fontstyle', newStyle);

            if (success) {
                const sampleText = applyFontStyle('This is how your bot will respond now');
                await reply(
                    `Font style updated.\n\n` +
                    `New style: ${newStyle}\n` +
                    `Preview: ${sampleText}\n\n` +
                    `All bot responses will now use this formatting.`, {quoted: global.setfot});
            } else {
                await reply('Failed to update font style. Please try again.', {quoted: global.setfot});
            }
        }
    },
    {
        name: "userinfo",
        description: "Show info about the user you replied to",
        category: "UTILITY MENU",
        usage: ".userinfo (reply to user message)",
        execute: async (sock, msg, args, context) => {
            const { reply, chatId, channelInfo } = context;

            try {
                if (!msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
                    return await reply('Please reply to a user message to get their info.');
                }

                const quoted = msg.message.extendedTextMessage.contextInfo;
                const userJid = quoted.participant || quoted.remoteJid;
                const contact = sock.store?.contacts?.get(userJid) || {};
                const name = contact.notify || contact.vname || userJid.split('@')[0];
                const number = userJid.split('@')[0];
                const description = contact.status || contact.shortAbout || contact.about || "No description";

                let profilePicUrl = null;
                try {
                    profilePicUrl = await sock.profilePictureUrl(userJid, 'image');
                } catch {
                    profilePicUrl = null;
                }

                let status = "No status";
                try {
                    const presence = sock.store?.presences?.get(userJid);
                    if (presence && presence.status) status = presence.status;
                } catch {}

                const infoText = `User Info by Dave-md\nName: ${name}\nNumber: +${number}\nDescription: ${description}\nStatus: ${status}`;

                if (profilePicUrl) {
                    try {
                        await context.reply({
                            image: { url: profilePicUrl },
                            caption: infoText,
                            ...channelInfo
                        }, { quoted: msg });
                    } catch (error) {
                        console.error('Error with image:', error);
                        await context.reply({
                            image: { url: profilePicUrl },
                            caption: infoText
                        }, { quoted: msg });
                    }
                } else {
                    await reply(infoText);
                }
            } catch (err) {
                console.error(err);
                await reply("Failed to fetch user info.");
            }
        }
    },
    {
        name: "botinfo",
        description: "Displays information about the bot",
        category: "UTILITY MENU",
        async execute(sock, message, args, context) {
            try {
                const uptime = process.uptime();
                const uptimeString = moment.duration(uptime, 'seconds').humanize();
                const total = global.commands.size;

                const info = `
Dave-md Bot Information
Name: ${global.botName}
Version: ${global.version}
Owner: ${global.botOwner}
Uptime: ${uptimeString}
Total Commands: ${total}
Platform: ${os.type()} (${os.arch()})`;

                await context.reply(info.trim(), {quoted: global.btf});
            } catch (err) {
                console.error("Error in .botinfo:", err);
                await context.reply("Failed to fetch bot info.");
            }
        }
    },
    {
        name: "uptime",
        description: "Show how long the bot has been running",
        category: "UTILITY MENU",
        usage: ".uptime",
        async execute(sock, msg, args, context) {
            try {
                let totalSeconds = process.uptime();
                let days = Math.floor(totalSeconds / (3600 * 24));
                let hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
                let minutes = Math.floor((totalSeconds % 3600) / 60);
                let seconds = Math.floor(totalSeconds % 60);
                let uptimeStr = `${days}d ${hours}h ${minutes}m ${seconds}s`;

                await context.reply(`Dave-md Active Time: ${uptimeStr}`, { quoted: global.upt });
            } catch (e) {
                console.error(e);
                await context.reply('Error getting uptime.');
            }
        }
    },
    {
        name: "memory",
        description: "Show bot system status",
        category: "UTILITY MENU",
        usage: ".memory",
        async execute(sock, msg, args, context) {
            try {
                const os = require('os');
                const fs = require('fs');

                let totalSeconds = process.uptime();
                let days = Math.floor(totalSeconds / (3600 * 24));
                let hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
                let minutes = Math.floor((totalSeconds % 3600) / 60);
                let seconds = Math.floor(totalSeconds % 60);
                let uptimeStr = `${days}d ${hours}h ${minutes}m ${seconds}s`;

                const cpuLoad = os.loadavg()[0].toFixed(2);
                const cpuCount = os.cpus().length;

                const totalMem = os.totalmem();
                const freeMem = os.freemem();
                const usedMem = totalMem - freeMem;
                const usedMemMB = (usedMem / (1024 * 1024)).toFixed(2);
                const totalMemMB = (totalMem / (1024 * 1024)).toFixed(2);
                const memoryPercent = ((usedMem / totalMem) * 100).toFixed(1);

                const sysInfo = `Dave-md System Status

Uptime: ${uptimeStr}
CPU: ${cpuLoad}% (${cpuCount} cores)
Memory: ${usedMemMB} MB / ${totalMemMB} MB (${memoryPercent}%)
Platform: ${os.platform()} ${os.arch()}
Node: ${process.version}`;

                await context.reply(sysInfo, { quoted: global.mmr });
            } catch (err) {
                console.error(err);
                await context.reply("Error fetching system info.");
            }
        }
    },
    {
    name: "ping",
    aliases: ["p"],
    description: "Check bot speed",
    category: "UTILITY MENU",
    
    execute: async (sock, m, args, context) => {
        const { chatId, reply } = context;

        try {
            const start = Date.now();
            
            // Send initial message
            const sentMsg = await sock.sendMessage(chatId, {
                text: "⚡ Calculating speed..."
            }, { quoted: global.ping });

            const end = Date.now();
            const speed = end - start;

            // Generate precise ping (inline function)
            const generatePrecisePing = (ping) => {
                const performance = global.performance || {};
                const microTime = typeof performance.now === 'function' ? performance.now() : ping;
                const microOffset = (microTime % 1).toFixed(6);
                const calculatedOffset = parseFloat(microOffset) * 0.999;
                return (ping + calculatedOffset).toFixed(3);
            };
            
            const precisePing = generatePrecisePing(speed);
            
            // Edit the original message
            await sock.sendMessage(chatId, {
                text: `Dave-MD Speed: ${precisePing} ms`,
                edit: sentMsg.key
            });

        } catch (error) {
            console.error('[PING] Error:', error.message);
            await reply('Failed to measure speed.');
        }
    }
},
    {
        name: "alive",
        aliases: ["alv"],
        description: "Check if bot is alive",
        category: "UTILITY MENU",
        execute: async (sock, message, args, context) => {
            const { reply } = context;

            const uptime = process.uptime();
            const hours = Math.floor(uptime / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const seconds = Math.floor(uptime % 60);

            const aliveText = `Dave-md Status: Active

Uptime: ${hours}h ${minutes}m ${seconds}s
Version: ${global.version || "1.0.0"}

The bot is running smoothly`;

            await reply(aliveText, { 
                quoted: global.alive 
            });
        }
    },
    {
        name: "jid",
        aliases: ["getjid", "userid"],
        description: "Get user's JID/ID",
        category: "UTILITY MENU",
        usage: ".jid [@user] or .jid (reply to message)",
        async execute(sock, m, args, context) {
            const from = m.key.remoteJid;
            let targetUser;

            if (m.message.extendedTextMessage?.contextInfo?.quotedMessage) {
                targetUser = m.message.extendedTextMessage.contextInfo.participant;
            } else if (m.message.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
                targetUser = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
            } else {
                targetUser = m.key.participant || m.key.remoteJid;
            }

            if (!targetUser) {
                return await context.reply("No user found. Reply to a message or mention someone.\n\nUsage: .jid [@user] or reply to message", { quoted: m });
            }

            const userNumber = targetUser.split('@')[0];

            await context.reply(`Number: ${userNumber}\nJID: ${targetUser}\nUser ID retrieved by Dave-md`, { quoted: m });
        }
    },
    {
        name: 'tourl',
        aliases: ['url'],
        description: 'Upload media to get a link',
        category: 'utility',
        async execute(sock, m, args, context) {
            const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quoted) return context.reply('Reply to an image/video/document/audio to use this command.');

            let messageType = Object.keys(quoted)[0];
            try {
                const url = await handleMediaUpload(quoted, sock, messageType);
                await context.reply(`Uploaded Successfully\n\n${url}`, {quoted: global.url});
            } catch (e) {
                await context.reply(`Failed to upload media: ${e.message}`);
            }
        }
    },
    {
        name: 'take',
        aliases: ['takesticker'],
        category: 'sticker',
        description: 'Change sticker pack name',
        usage: '.take <packname> (reply to sticker)',
        execute: async (sock, message, args, context) => {
            const { chatId, reply, hasQuotedMessage } = context;

            if (!hasQuotedMessage) {
                return await reply('Reply to a sticker with .take <packname>');
            }

            const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quotedMessage?.stickerMessage) {
                return await reply('Reply to a sticker with .take <packname>');
            }

            const packname = args.slice(1).join(' ') || 'DAVE-MD';

            try {
                const stickerBuffer = await downloadMediaMessage(
                    {
                        key: message.message.extendedTextMessage.contextInfo.stanzaId,
                        message: quotedMessage,
                        messageType: 'stickerMessage'
                    },
                    'buffer',
                    {},
                    {
                        logger: undefined,
                        reuploadRequest: sock.updateMediaMessage
                    }
                );

                if (!stickerBuffer) {
                    return await reply('Failed to download sticker');
                }

                const img = new webp.Image();
                await img.load(stickerBuffer);

                const json = {
                    'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
                    'sticker-pack-name': packname,
                    'emojis': ['']
                };

                const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
                const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
                const exif = Buffer.concat([exifAttr, jsonBuffer]);
                exif.writeUIntLE(jsonBuffer.length, 14, 4);

                img.exif = exif;
                const finalBuffer = await img.save(null);

                await sock.sendMessage(chatId, {
                    sticker: finalBuffer
                }, {
                    quoted: global.takeStk
                });

            } catch (error) {
                await reply('Error processing sticker');
            }
        }
    }
];