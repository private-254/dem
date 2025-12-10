import settings from '../settings.js';
import isAdmin from '../lib/isAdmin.js';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import fs from 'fs';
import path from 'path';
export default [ 
{
    name: "remove",
    aliases: ["kick", "removemember"],
    description: "Remove members from group",
    category: "GROUP MENU",
    usage: ".remove [@user] or .remove 1234567890,0987654321 or reply to message",

    execute: async (sock, m, args, context) => {
        const { chatId, reply, react, senderIsSudo, isGroup, isSenderAdmin, isBotAdmin } = context;

        if (!isGroup) {
            return await reply("This command is for groups only!");
        }

        if (!isBotAdmin) {
            return await reply("Bot must be admin to remove members!");
        }

        if (!isSenderAdmin && !senderIsSudo) {
            return await reply("Only group admins can remove members!");
        }

        await react("🐀");

        try {
            let targetsToRemove = [];

            // 1. If replying to a user
            if (m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
                const quotedUser = m.message.extendedTextMessage.contextInfo.participant;
                if (quotedUser) targetsToRemove.push(quotedUser);
            }
            // 2. If mentioning users
            else if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
                targetsToRemove = m.message.extendedTextMessage.contextInfo.mentionedJid;
            }
            // 3. If phone numbers provided
            else if (args[0]) {
                const numbers = args.join(" ").split(",").map(num => num.trim());
                for (const number of numbers) {
                    const cleanNumber = number.replace(/[^\d]/g, "");
                    if (cleanNumber.length >= 10) {
                        targetsToRemove.push(cleanNumber + "@s.whatsapp.net");
                    }
                }
            }

           /** if (targetsToRemove.length === 0) {
                return await reply(
                    `📜 Remove Members Usage\n\n` +
                    `Method 1: Reply to a message → .remove\n` +
                    `Method 2: Mention users → .remove @user1 @user2\n` +
                    `Method 3: Use numbers → .remove 234123456789,234987654321\n\n` +
                    `⚠️ Notes:\n` +
                    `• Separate numbers with commas\n` +
                    `• Use international format (with country code)\n` +
                    `• Bot must be admin to remove members\n` +
                    `• Cannot remove other admins`
                );
            }*/

            // Collect results
            let successCount = 0;
            let failCount = 0;
            let results = [];

            // Fetch group metadata to check admins & members
            const groupMetadata = await sock.groupMetadata(chatId);
            const groupAdmins = groupMetadata.participants
                .filter(p => p.admin === "admin" || p.admin === "superadmin")
                .map(p => p.id);

            for (const targetJid of targetsToRemove) {
                try {
                    const targetNumber = targetJid.split("@")[0];

                    // 1. Prevent removing admins
                    if (groupAdmins.includes(targetJid)) {
                        results.push(`⚠️ ${targetNumber} - Cannot remove admin`);
                        failCount++;
                        continue;
                    }

                    // 2. Prevent removing the bot
                    if (sock.user && targetJid === sock.user.id) {
                        results.push(`😅 ${targetNumber} - Cannot remove myself!`);
                        failCount++;
                        continue;
                    }

                    // 3. Check if user is in group
                    const isInGroup = groupMetadata.participants.some(p => p.id === targetJid);
                    if (!isInGroup) {
                        results.push(`❌ ${targetNumber} - Not in this group`);
                        failCount++;
                        continue;
                    }

                    // 4. Try to remove
                    const response = await sock.groupParticipantsUpdate(chatId, [targetJid], "remove");

                    if (response[0]?.status === "200") {
                        results.push(`😅 ${targetNumber} - Removed successfully`);
                        successCount++;
                    } else {
                        results.push(`❌ ${targetNumber} - ${response[0]?.status || "Failed to remove"}`);
                        failCount++;
                    }

                } catch (error) {
                    const targetNumber = targetJid.split("@")[0];
                    results.push(`❌ ${targetNumber} - ${error.message}`);
                    failCount++;
                }

                // Delay to avoid spam
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            /**const resultText =
                `👥 Remove Members Results\n\n` +
                `📊 Summary:\n✅ Removed: ${successCount}\n❌ Failed: ${failCount}\n\n` +
                `📜 Details:\n${results.join("\n")}\n\n` +
                `Members removed by GIFT-MD BOT 🤖`;

            await reply(resultText);*/

        } catch (error) {
            await reply(`❌ Error removing members: ${error.message}\n\n⚠️ Make sure bot is admin!`);
        }
    }
}, 



{
    name: "hidetag",
    aliases: ["h", "hidemsg", "invisibletag", "hiddentag"],
    description: "Send a hidden tag message (mentions all without showing tag)",
    category: "GROUP MENU",
    usage: ".hidetag [message] or reply to a message",
    
    execute: async (sock, m, args, context) => {
        const { chatId, reply, react, senderIsSudo, isGroup, rawText } = context;
        
        if (!isGroup) {
            return await reply("This command can only be used in groups!");
        }
        
        // Only bot owner/sudo can use this
        if (!senderIsSudo) {
            return await reply("Only bot owner can use this command!");
        }
        
        try {
            await react("👻");
            
            // Get group metadata and participants
            const groupMetadata = await sock.groupMetadata(chatId);
            const participants = groupMetadata.participants || [];
            
            if (participants.length === 0) {
                return await reply("No participants found in this group.");
            }
            
            // Check if message is quoted/replied
            const isQuoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            
            if (isQuoted) {
                // Forward the quoted message with hidden mentions
                const quotedMsg = m.message.extendedTextMessage.contextInfo;
                
                await sock.sendMessage(chatId, {
                    forward: {
                        key: {
                            remoteJid: quotedMsg.participant,
                            id: quotedMsg.stanzaId,
                            fromMe: false
                        },
                        message: quotedMsg.quotedMessage
                    },
                    mentions: participants.map(p => p.id)
                });
                
            } else {
                // Send text message with hidden mentions
                const messageText = rawText.split(' ').slice(1).join(' ').trim();
                
                if (!messageText) {
                    return await reply("Please provide a message!\n\nUsage: .hidetag [message] or reply to a message");
                }
                
                await sock.sendMessage(chatId, {
                    text: messageText,
                    mentions: participants.map(p => p.id)
                }, { quoted: m });
            }
            
            await react("✅");
            
        } catch (error) {
            console.error('[HIDETAG] Error:', error);
            await reply(`❌ Failed to send hidden tag: ${error.message}`);
        }
    }
}


{
    name: "listgc",
    aliases: ["grouplist", "groups", "allgroups"],
    description: "List all groups the bot is in",
    category: "GROUP MENU",
    usage: ".listgc",
    
    execute: async (sock, m, args, context) => {
        const { reply, react, senderIsSudo } = context;
        
        // Only bot owner/sudo can use this
        if (!senderIsSudo) {
            return await reply("Only bot owner can use this command!");
        }
        
        try {
            await react("📋");
            
            // Fetch all groups the bot participates in
            const getGroups = await sock.groupFetchAllParticipating();
            const groups = Object.values(getGroups);
            
            if (!groups || groups.length === 0) {
                return await reply("❌ The bot is not in any groups.");
            }
            
            // Create the list message
            let text = `⬣ *GROUP LIST DAVE-MD*\n`;
            text += `📊 Total Groups: ${groups.length}\n\n`;
            
            groups.forEach((g, i) => {
                const groupId = g.id;
                const groupName = g.subject || "Unnamed Group";
                const memberCount = g.participants?.length || 0;
                const isAnnouncement = g.announce === true ? "🔒 Locked" : "🔓 Open";
                const adminsCount = g.participants?.filter(p => p.admin).length || 0;
                
                // Format creation date (if available)
                let createdDate = "Unknown";
                if (g.creation) {
                    try {
                        // Using basic date formatting without moment.js
                        const date = new Date(g.creation * 1000);
                        createdDate = date.toLocaleDateString('en-US', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                        });
                    } catch (e) {
                        createdDate = "Unknown";
                    }
                }
                
                text += `*${i + 1}. ${groupName}*\n`;
                text += `🆔 ID: ${groupId}\n`;
                text += `👥 Members: ${memberCount}\n`;
                text += `👑 Admins: ${adminsCount}\n`;
                text += `🔐 Status: ${isAnnouncement}\n`;
                text += `📅 Created: ${createdDate}\n\n`;
            });
            
            // Add footer
            text += `📝 Total: ${groups.length} groups`;
            
            await reply(text);
            
        } catch (error) {
            console.error('[LISTGC] Error:', error);
            await reply(`❌ Failed to fetch group data: ${error.message}`);
        }
    }
}

{
    name: "disp-90",
    aliases: ["disappear90", "ephemeral90"],
    description: "Set disappearing messages for 90 days",
    category: "GROUP MENU",
    usage: ".disp-90",
    
    execute: async (sock, m, args, context) => {
        const { chatId, reply, react, isSenderAdmin, isBotAdmin, isGroup } = context;
        
        if (!isGroup) {
            return await reply("This command is for groups only!");
        }
        
        if (!isSenderAdmin) {
            return await reply("Only group admins can set disappearing messages!");
        }
        
        if (!isBotAdmin) {
            return await reply("Bot must be admin to set disappearing messages!");
        }
        
        try {
            await react("⏳");
            await sock.groupToggleEphemeral(chatId, 90 * 24 * 3600);
            await reply("Disappearing messages successfully turned on for 90 days!");
        } catch (error) {
            await reply(`❌ Error: ${error.message}`);
        }
    }
},
{
    name: "disp-off",
    aliases: ["disappear-off", "ephemeral-off"],
    description: "Turn off disappearing messages",
    category: "GROUP MENU",
    usage: ".disp-off",
    
    execute: async (sock, m, args, context) => {
        const { chatId, reply, react, isSenderAdmin, isBotAdmin, isGroup } = context;
        
        if (!isGroup) {
            return await reply("This command is for groups only!");
        }
        
        if (!isSenderAdmin) {
            return await reply("Only group admins can change disappearing messages!");
        }
        
        if (!isBotAdmin) {
            return await reply("Bot must be admin to change disappearing messages!");
        }
        
        try {
            await react("🚫");
            await sock.groupToggleEphemeral(chatId, 0);
            await reply("Disappearing messages successfully turned off!");
        } catch (error) {
            await reply(`❌ Error: ${error.message}`);
        }
    }
},
{
    name: "disp-1",
    aliases: ["disappear24", "ephemeral24"],
    description: "Set disappearing messages for 24 hours",
    category: "GROUP MENU",
    usage: ".disp-1",
    
    execute: async (sock, m, args, context) => {
        const { chatId, reply, react, isSenderAdmin, isBotAdmin, isGroup } = context;
        
        if (!isGroup) {
            return await reply("This command is for groups only!");
        }
        
        if (!isSenderAdmin) {
            return await reply("Only group admins can set disappearing messages!");
        }
        
        if (!isBotAdmin) {
            return await reply("Bot must be admin to set disappearing messages!");
        }
        
        try {
            await react("⏳");
            await sock.groupToggleEphemeral(chatId, 24 * 3600);
            await reply("Disappearing messages successfully turned on for 24 hours!");
        } catch (error) {
            await reply(`❌ Error: ${error.message}`);
        }
    }
},
{
    name: "disp-7",
    aliases: ["disappear7", "ephemeral7"],
    description: "Set disappearing messages for 7 days",
    category: "GROUP MENU",
    usage: ".disp-7",
    
    execute: async (sock, m, args, context) => {
        const { chatId, reply, react, isSenderAdmin, isBotAdmin, isGroup } = context;
        
        if (!isGroup) {
            return await reply("This command is for groups only!");
        }
        
        if (!isSenderAdmin) {
            return await reply("Only group admins can set disappearing messages!");
        }
        
        if (!isBotAdmin) {
            return await reply("Bot must be admin to set disappearing messages!");
        }
        
        try {
            await react("⏳");
            await sock.groupToggleEphemeral(chatId, 7 * 24 * 3600);
            await reply("Disappearing messages successfully turned on for 7 days!");
        } catch (error) {
            await reply(`❌ Error: ${error.message}`);
        }
    }
},
{
    name: "joingc",
    aliases: ["join", "join-group"],
    description: "Join a WhatsApp group using invite link",
    category: "GROUP MENU",
    usage: ".joingc <invite-link>",
    
    execute: async (sock, m, args, context) => {
        const { reply, react, senderIsSudo, rawText } = context;
        
        // Only bot owner/sudo can use this
        if (!senderIsSudo) {
            return await reply("Only bot owner can use this command!");
        }
        
        if (!rawText || rawText.split(' ').length < 2) {
            return await reply("Where's the group link?\n\nUsage: .joingc https://chat.whatsapp.com/INVITE_CODE");
        }
        
        const text = rawText.split(' ').slice(1).join(' ');
        
        if (!text.includes("chat.whatsapp.com")) {
            return await reply("Invalid WhatsApp group link!");
        }
        
        try {
            await react("👥");
            const inviteCode = text.split('https://chat.whatsapp.com/')[1];
            
            if (!inviteCode) {
                return await reply("Invalid invite code format!");
            }
            
            const groupId = await sock.groupAcceptInvite(inviteCode);
            await reply(`✅ Successfully joined group!\n\nGroup ID: ${groupId}`);
        } catch (error) {
            await reply(`❌ Failed to join group: ${error.message}`);
        }
    }
},
{
    name: "leavegc",
    aliases: ["leave", "leave-group", "out"],
    description: "Leave current group",
    category: "GROUP MENU",
    usage: ".leavegc",
    
    execute: async (sock, m, args, context) => {
        const { chatId, reply, react, senderIsSudo, isGroup } = context;
        
        if (!isGroup) {
            return await reply("This command is for groups only!");
        }
        
        // Only bot owner/sudo can use this
        if (!senderIsSudo) {
            return await reply("Only bot owner can use this command!");
        }
        
        try {
            await react("👋");
            await sock.groupLeave(chatId);
            // This message may not send since bot leaves group immediately
            await reply("Leaving group... Goodbye!");
        } catch (error) {
            await reply(`❌ Failed to leave group: ${error.message}`);
        }
    }
}
 
    {

    name: "add",

    aliases: ["addmember", "invite"],

    description: "Add members to group using phone numbers",

    category: "GROUP MENU",

    usage: ".add 254104260263,079787654321,555666777",



    execute: async (sock, message, args, context) => {

        const { chatId, reply, react, senderIsSudo, isGroup, isSenderAdmin, isBotAdmin } = context;



        if (!isGroup) {

            return await reply("This command is for groups only!");

        }

        /**if (!args || args.length === 0) {

            return await reply(

                `📝 Add Members Usage\n\n` +

                `Format: .add number1,number2,number3\n\n` +

                `Example: .add 2341234567890,2340987654321\n\n` +

                `⚠️ Notes:\n` +

                `• Separate numbers with commas\n` +

                `• Use international format (with country code)\n` +

                `• No spaces or special characters\n` +

                `• Bot must be admin to add members`

            );

        }*/

        // Check if bot has admin permissions

        if (!isBotAdmin) {

            return await reply("The Bot must be admin to add members!");

        }

        // Check if sender has admin permissions

        if (!isSenderAdmin && !senderIsSudo) {

            return await reply("Only group admins can add members!");

        }

        await react('🌚');

        try {

            // Parse phone numbers

            const numbers = args.join(' ').split(',').map(num => num.trim());



            if (numbers.length === 0) {

                return await reply("❌ No valid phone numbers provided!");

            }

            let successCount = 0;

            let failCount = 0;

            let results = [];

            for (const number of numbers) {

                try {

                    // Clean the number

                    const cleanNumber = number.replace(/[^\d]/g, '');



                    if (cleanNumber.length < 10) {

                        results.push(`❌ ${number} - Invalid number format`);

                        failCount++;

                        continue;

                    }

                    const jid = cleanNumber + '@s.whatsapp.net';



                    // Check if user exists on WhatsApp

                    const [exists] = await sock.onWhatsApp(jid);

                    if (!exists) {

                        results.push(`❌ ${cleanNumber} - Not on WhatsApp`);

                        failCount++;

                        continue;

                    }

                    // Try to add the user

                    const response = await sock.groupParticipantsUpdate(chatId, [jid], 'add');



                    if (response[0]?.status === '200') {

                        results.push(`✅ ${cleanNumber} - Added successfully`);

                        successCount++;

                    } else {

                        results.push(`⚠️ ${cleanNumber} - ${response[0]?.status || 'Failed to add'}`);

                        failCount++;

                    }

                } catch (error) {

                    results.push(`❌ ${number} - ${error.message}`);

                    failCount++;

                }

                // Small delay to prevent spam

                await new Promise(resolve => setTimeout(resolve, 1000));

            }

           /** const resultText = `
Add Members Results\n\n📊 Summary:\n✅ Successfully added: ${successCount}\n❌ Failed: ${failCount}\n\n📝 Details:\n${results.join('\n')}\n\Members added by GIFT-MD BOT 🤖`;

            await reply(resultText);*/

        } catch (error) {

            await reply(`❌ Error adding members: ${error.message}\n\n⚠️ Make sure bot is admin!`);

        }

    }

},
 {

    name: "close",

    aliases: ["closetime"],

    description: "Close group (only admins can send messages)",

    category: "GROUP MENU",

    usage: ".close",



    async execute(sock, m, args, context) {

        const from = m.key.remoteJid;

        const isGroup = from.endsWith("@g.us");

        await context.react('☺️')

        if (!isGroup) {

            return await context.reply(

                { text: "This command is for groups only!" } 



            );

        }

        try {

            const groupMetadata = await sock.groupMetadata(from);

            const groupAdmins = groupMetadata.participants

                .filter(p => p.admin === 'admin' || p.admin === 'superadmin')

                .map(p => p.id);



            const sender = m.key.participant || m.key.remoteJid;

            const isOwner = m.key.fromMe || sender.split('@')[0] === settings.ownerNumber;

            const isAdmin = groupAdmins.includes(sender);



            if (!isOwner && !isAdmin) {

                return await context.reply( 

                    { text: "❌ Only group admins can close the group!" }, 

                    { quoted: m }

                );

            }

            await sock.groupSettingUpdate(from, 'announcement');



            await context.reply({

                text: `Group Closed!\n\n` +

                      `Only admins can send messages now\n` +

                      `Regular members cannot chat\n\n` +

                      `Group closed by Admin`

            }, { quoted: m });

        } catch (error) {

            await context.reply( {

                text: `Failed to close group: ${error.message}\n\n😆 Make sure bot is admin!`

            }, { quoted: m });

        }

    }

},
    {

    name: "open",

    aliases: ["opentime"],

    description: "Open group (allow all members to send messages)",

    category: "GROUP MENU",

    usage: ".open",



    async execute(sock, m, args, context) {

        const from = m.key.remoteJid;

        const isGroup = from.endsWith("@g.us");

    await context.react('⭐')

        if (!isGroup) {

            return await context.reply( 

                { text: "This command is for groups only!" }, 

                { quoted: m }

            );

        }

        try {

            const groupMetadata = await sock.groupMetadata(from);

            const groupAdmins = groupMetadata.participants

                .filter(p => p.admin === 'admin' || p.admin === 'superadmin')

                .map(p => p.id);



            const sender = m.key.participant || m.key.remoteJid;

            const isOwner = m.key.fromMe || sender.split('@')[0] === settings.ownerNumber;

            const isAdmin = groupAdmins.includes(sender);



            if (!isOwner && !isAdmin) {

                return await context.reply(

                    { text: "Only group admins can open the group!" }, 

                    { quoted: m }

                );

            }

            await sock.groupSettingUpdate(from, 'not_announcement');



            await context.reply( {

                text: `Group Opened!\n\n` +

                      `All members are allowed messages\n` +

                      `Everyone can participate in the chat\n\n` +

                      `Group opened by Admin`

            }, { quoted: m });

        } catch (error) {

            await context.reply(from, {

                text: `Failed to open group: ${error.message}\n\n😕 Make sure bot is admin!`

            }, { quoted: m });

        }

    }

},
   {

    name: 'kick',

    aliases: ['remove'],

    category: 'GROUP MENU',

    description: 'Remove users from the group',

    usage: '.kick @user or reply to message',

    execute: async (sock, message, args, context) => {

        const { reply, react, mentions, hasQuotedMessage, isSenderAdmin, isBotAdmin, chatId } = context;

        const isOwner = message.key.fromMe;

        if (!isOwner) {

            if (!isBotAdmin) {

                return await reply('Please make the bot an admin first.');

            }

            if (!isSenderAdmin) {

                return await reply('Only group admins can use the kick command.');

            }

        }

        let usersToKick = [];



        if (mentions.length > 0) {

            usersToKick = mentions;

        } else if (hasQuotedMessage && message.message?.extendedTextMessage?.contextInfo?.participant) {

            usersToKick = [message.message.extendedTextMessage.contextInfo.participant];

        }



        if (usersToKick.length === 0) {

            return await reply('Please mention the user or reply to their message to kick!');

        }

        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';

        if (usersToKick.includes(botId)) {

            return await reply("I can't kick myself bitch! 😂");

        }

        await react('🫴');

        try {

            await sock.groupParticipantsUpdate(chatId, usersToKick, "remove");



            const usernames = await Promise.all(usersToKick.map(async jid => {

                return `@${jid.split('@')[0]}`;

            }));



            await sock.sendMessage(chatId, { 

                text: `${usernames.join(', ')} has been kicked successfully!`,

                mentions: usersToKick

            });

        } catch (error) {

            await reply('Failed to kick user(s)!');

        }

    }

},
   {

    name: "link",

    aliases: ["grouplink", "invite"],

    description: "Get group invite link",

    category: "GROUP MENU",

    usage: ".link",



    async execute(sock, m, args, context) {

        const from = m.key.remoteJid;

        const isGroup = from.endsWith("@g.us");

     await context.react('🖇️')

        if (!isGroup) {

            return await context.reply( 

                { text: "This command is for groups only!" }, 

                { quoted: m }

            );

        }

        try {

            const groupMetadata = await sock.groupMetadata(from);

            const groupAdmins = groupMetadata.participants

                .filter(p => p.admin === 'admin' || p.admin === 'superadmin')

                .map(p => p.id);



            const sender = m.key.participant || m.key.remoteJid;

            const isOwner = m.key.fromMe || sender.split('@')[0] === settings.ownerNumber;

            const isAdmin = groupAdmins.includes(sender);



            if (!isOwner && !isAdmin) {

                return await context.reply(

                    { text: "❌ Only group admins can get the invite link!" }, 

                    { quoted: m }

                );

            }

            const inviteCode = await sock.groupInviteCode(from);

            const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;



            await context.reply( {

                                text: `Group Invite Link\n\nGroup: ${groupMetadata.subject}\nMembers: ${groupMetadata.participants.length}\nLink: ${inviteLink}\n\nNote: Anyone with this link can join.\nDAVE-MD`

            }, { quoted: m });

        } catch (error) {

            await context.reply( {

                text: `❌ Failed to get group link: ${error.message}\n\n⚠️ Make sure bot is admin!`

            }, { quoted: m });

        }

    }

},
      {
    name: "groupinfo",
    description: "Get information about the current group",
    category: "GROUP MENU",
    usage: ".groupinfo",

    async execute(sock, m, args, context) {
        try {
            const chatId = m.key.remoteJid;
            await context.react('ℹ️')
            if (!chatId.endsWith('@g.us')) {
                return await context.reply( {
                    text: '❌ This command can only be used in groups.'
                }, { quoted: m });
            }

            const groupMetadata = await sock.groupMetadata(chatId);
            const groupAdmins = groupMetadata.participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin');
            const totalMembers = groupMetadata.participants.length;

                        let groupInfo = `Group Information\n\n`;
            groupInfo += `Name: ${groupMetadata.subject}\n`;
            groupInfo += `ID: ${groupMetadata.id}\n`;
            groupInfo += `Members: ${totalMembers}\n`;
            groupInfo += `Admins: ${groupAdmins.length}\n`;
            groupInfo += `Created: ${new Date(groupMetadata.creation * 1000).toLocaleDateString()}\n`;

            if (groupMetadata.desc) {
                groupInfo += `Description: ${groupMetadata.desc}\n`;
            }

                        groupInfo += `\nGroup Admins:\n`;
            groupAdmins.forEach((admin, index) => {
                const adminName = admin.id.split('@')[0];
                groupInfo += `${index + 1}. @${adminName}\n`;
            });

            await context.reply( {
                text: groupInfo,
                mentions: groupAdmins.map(admin => admin.id)
            }, { quoted: m });

        } catch (error) {
            console.error('❌ GroupInfo Command Error:', error);
            await context.reply( {
                text: '❌ Failed to get group information. Please try again.'
            }, { quoted: m });
     }
     }
     },
           {
    name: "demote",
    description: "Demote a group admin to member",
    category: "GROUP MENU",
    usage: ".demote @user",

    execute: async (sock, m, args, context) => {
        try {
const { reply, react, mentions, hasQuotedMessage, isSenderAdmin, isBotAdmin, chatId } = context;
            await react('✅');
            if (!chatId.endsWith('@g.us')) {
                return await reply (
                    'This command can only be used in groups.'
                );
            }

            const groupMetadata = await sock.groupMetadata(chatId);
            const groupAdmins = groupMetadata.participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin').map(p => p.id);
            const senderNumber = m.key.participant || m.key.remoteJid;

            if (!groupAdmins.includes(senderNumber)) {
                return await context.reply(
                    'Only group admins can use this command.'
                );
            }

            let targetUser;
            if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
                targetUser = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
            } else if (m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
                targetUser = m.message.extendedTextMessage.contextInfo.participant;
            } else {
                return await reply ( 
'Please mention or reply to the user you want to demote.\n\nExample: .demote @user'
                );
            }

            if (!groupAdmins.includes(targetUser)) {
                return await reply(
                    'User is not an admin.'
                );
            }

            try {
                await sock.groupParticipantsUpdate(chatId, [targetUser], 'demote');

                const userName = targetUser.split('@')[0];
                const groupName = groupMetadata.subject || 'Unknown Group';
                const currentTime = new Date().toLocaleString();

                                const demoteMessage = `User Demoted\n\nGroup: ${groupName}\nUser: @${userName}\nRole: Member\nTime: ${currentTime}\n\nDAVE-MD`;

                await context.reply(demoteMessage, {
    mentions: [targetUser]
});

            } catch (demoteError) {
                let errorMsg = 'Failed to demote user.';

                if (demoteError.message.includes('forbidden')) {
                    errorMsg = 'I don\'t have permission to demote users in this group.';
                } else if (demoteError.message.includes('not-authorized')) {
                    errorMsg = 'I need admin privileges to demote users.';
                }

                await context.reply( {
                    text: errorMsg + '\n\nDave Md'
                }, { quoted: m });
            }

        } catch (error) {
            console.error('❌ Demote Command Error:', error);
            await context.reply( {
                text: 'Failed to demote user. Please try again.\n\nDave Md'
            });
        }
    }
},
   {

    name: 'promote',

    aliases: ['pmt'],

    category: 'GROUP MENU',

    description: 'Promote users to admin',

    usage: '.promote @user or reply to message',

    execute: async (sock, message, args, context) => {

        const { reply, react, mentions, hasQuotedMessage, isSenderAdmin, isBotAdmin, chatId } = context;

        if (!chatId.endsWith('@g.us')) {
                return await reply(
                   'This command can only be used in groups.'
                );
            }

        if (!isBotAdmin) {

            return await reply('Please make the bot an admin first.');

        }

        if (!isSenderAdmin) {

            return await reply('Only group admins can use the promote command.');

        }

        let userToPromote = [];



        if (mentions.length > 0) {

            userToPromote = mentions;

        } else if (hasQuotedMessage && message.message?.extendedTextMessage?.contextInfo?.participant) {

            userToPromote = [message.message.extendedTextMessage.contextInfo.participant];

        }



        if (userToPromote.length === 0) {

            return await reply('Please mention the user or reply to their message to promote!');

        }

        await react('👑');

        try {

            await sock.groupParticipantsUpdate(chatId, userToPromote, "promote");



            // Get group metadata for group name

            const groupMetadata = await sock.groupMetadata(chatId);

            const groupName = groupMetadata.subject || 'Unknown Group';

            const currentTime = new Date().toLocaleString();



            // Handle multiple users (but use the fancy format for each)

            for (const user of userToPromote) {

                const userName = user.split('@')[0];



                                const promotionMessage = `User Promoted\n\nGroup: ${groupName}\nUser: @${userName}\nRole: Admin\nTime: ${currentTime}\n\nDAVE-MD`;

                await sock.sendMessage(chatId, { 

                    text: promotionMessage,

                    mentions: [user]

                });

            }

        } catch (error) {

            await reply('Failed to promote user(s)!');
        }
    }
},
    {

    name: "gjid",

    aliases: ["groupjid", "groupid"],

    description: "Get group JID/ID",

    category: "GROUP MENU",

    usage: ".gjid",



    async execute(sock, m, args, context) {

        const from = m.key.remoteJid;

        const isGroup = from.endsWith("@g.us");



        if (!isGroup) {

            return await context.reply( 

                { text: "This command is for groups only!" }, 

                { quoted: m }

            );

        }

        try {

            const groupMetadata = await sock.groupMetadata(from);



                        await context.reply({
                text: `Group Information\n\nName: ${groupMetadata.subject}\nJID: ${from}\nMembers: ${groupMetadata.participants.length}\nCreated: ${new Date(groupMetadata.creation * 1000).toLocaleDateString()}\n\nDAVE-MD`

            }, { quoted: m });

        } catch (error) {

            await context.reply( {

                text: `❌ Error getting group info: ${error.message}`

            }, { quoted: m });

        }

    }

},
{

    name: 'mute',

    aliases: ['silence'],

    category: 'GROUP MENU',

    description: 'Mute the group for specified minutes',

    usage: '.mute <minutes>',

    execute: async (sock, message, args, context) => {

        const { reply, react, isSenderAdmin, isBotAdmin, chatId } = context;

        if (!isBotAdmin) {

            return await reply('Please make the bot an admin first.');

        }

        if (!isSenderAdmin) {

            return await reply('Only group admins can use the mute command.');

        }

        const durationInMinutes = parseInt(args[1]) || 5;

        await react('🐀');

        const durationInMilliseconds = durationInMinutes * 60 * 1000;



        try {

            await sock.groupSettingUpdate(chatId, 'announcement');

            await reply(`The group has been muted for ${durationInMinutes} minutes.`);

            setTimeout(async () => {

                await sock.groupSettingUpdate(chatId, 'not_announcement');

                await sock.sendMessage(chatId, { text: 'The group has been unmuted.' });

            }, durationInMilliseconds);

        } catch (error) {

            await reply('An error occurred while muting/unmuting the group. Please try again.');

        }

    }

}, 
  {
    name: 'unmute',
    aliases: ['unsilence'],
    category: 'GROUP MENU',
    description: 'Unmute the group',
    usage: '.unmute',
    execute: async (sock, message, args, context) => {
        const { chatId, reply, react, isSenderAdmin, isBotAdmin } = context;

        if (!isBotAdmin) {
            return await reply('Please make the bot an admin first.');
        }

        if (!isSenderAdmin) {
            return await reply('Only group admins can use the unmute command.');
        }

        try {
            await react('🔊');
            await sock.groupSettingUpdate(chatId, 'not_announcement');
            await reply('The group has been unmuted.');
        } catch (error) {
            await reply('An error occurred while unmuting the group. Please try again.');
        }
    }
},
    {
    name: "admins",
    aliases: ["admin", "adminlist"],
    description: "List or tag all group admins",
    category: "GROUP MENU",
    usage: ".admins [tag/list]",

    async execute(sock, m, args, context) {
        const { reply } = context;
        const from = m.key.remoteJid;
        const isGroup = from.endsWith("@g.us");

        if (!isGroup) {
            return await reply('This command is for groups only!');
        }

        try {
            const groupMetadata = await sock.groupMetadata(from);

            // Get group creator/owner
            const groupOwner = groupMetadata.owner;

            // Get all participants with admin privileges INCLUDING the creator
            const allAdmins = groupMetadata.participants
                .filter(p => p.admin === 'admin' || p.admin === 'superadmin' || p.id === groupOwner);

            // Remove duplicates (in case creator is also listed as admin)
            const uniqueAdmins = allAdmins.filter((admin, index, self) =>
                index === self.findIndex(a => a.id === admin.id)
            );

            if (uniqueAdmins.length === 0) {
                return await reply("No admins found in this group");
            }

            const action = args[0]?.toLowerCase();
            const mentions = uniqueAdmins.map(admin => admin.id);

            // Helper function to get display name or phone number
            const getDisplayName = (participant) => {
                // Check if there's a saved name/contact name
                if (participant.notify && participant.notify.trim() !== '') {
                    return participant.notify;
                }
                // Check if there's a display name in the group
                if (participant.displayName && participant.displayName.trim() !== '') {
                    return participant.displayName;
                }
                // Fall back to clean phone number
                const phoneNumber = participant.id.split('@')[0];
                return phoneNumber;
            };

            if (action === 'tag') {
                // Tag all admins with their names/numbers
                const adminTags = uniqueAdmins.map(admin => {
                    const displayName = getDisplayName(admin);
                    return `@${displayName}`;
                }).join(' ');

                await reply(
                    `👑 Group Admins (${uniqueAdmins.length})\n\n${adminTags}\n${global.watermark}`,
                    { mentions }
                );

            } else {
                // List admins with proper roles and names/numbers
                let adminList = `👑 Group Admins (${uniqueAdmins.length})\n\n`;

                uniqueAdmins.forEach((admin, index) => {
                    const displayName = getDisplayName(admin);
                    let role;

                    if (admin.id === groupOwner) {
                        role = '👑 Creator';
                    } else {
                        role = '⭐ Admin';
                    }

                    adminList += `${index + 1}.${role}: @${displayName}\n`;
                });

                adminList += `\nUse .admins tag to mention all admins\n${global.watermark}`;

                await reply(adminList, { mentions });
            }

        } catch (error) {
            await reply(`Error fetching admin list: ${error.message}`);
        }
    }
},
    {
    name: 'tagall',
    aliases: ['everyone', 'all'],
    category: 'GROUP MENU',
    description: 'Tag all group members',
    usage: '.tagall [message]',
    execute: async (sock, message, args, context) => {
        const { chatId, reply, react, senderIsSudo, isSenderAdmin, isBotAdmin, rawText } = context;

        if (!chatId.endsWith('@g.us')) {
            return await reply('This command can only be used in groups.');
        }

        if (!isSenderAdmin && !isBotAdmin) {
            return await reply('Only admins can use the .tagall command.');
        }
        if (!senderIsSudo){
            return await reply('Only owner can use the .tagall command.');
    }

        try {
            await react('💰');

            const groupMetadata = await sock.groupMetadata(chatId);
            const participants = groupMetadata.participants;

            if (!participants || participants.length === 0) {
                return await reply('No participants found in the group.');
            }

            const customMessage = rawText.split(' ').slice(1).join(' ').trim();

            let message = customMessage ? `📢 Announcement:\n${customMessage}` : '🔊 Group Members:\n';

            participants.forEach(participant => {
                message += `@${participant.id.split('@')[0]}\n`;
            });

            await sock.sendMessage(chatId, {
                text: message,
                mentions: participants.map(p => p.id),
                ...context.channelInfo
            });

        } catch (error) {
            await reply('Failed to tag all members.');
        }
    }
    },
     {
    name: 'tagnotadmin',
    aliases: [],
    category: 'GROUP',
    description: 'Tag all non-admin members in the group',
    usage: '.tagnotadmin',
    execute: async (sock, message, args, context) => {
        const { reply, react, isSenderAdmin, isBotAdmin,isGroup, chatId,senderId } = context;
        try {
            if (!isGroup) {
                return await reply('This command can only be used in groups!');
            }

            if (!isBotAdmin) {
                await react('❌');
                return await reply('Please make the bot an admin first.');
            }

            if (!isSenderAdmin) {
                await react('🙂');
                return await reply('Only admins can use this command.');
            }

            await react('⭐');

            const groupMetadata = await sock.groupMetadata(chatId);
            const participants = groupMetadata.participants || [];

            const nonAdmins = participants.filter(p => !p.admin).map(p => p.id);

            if (nonAdmins.length === 0) {
                await react('👾');
                return await reply('No non-admin members to tag.');
            }

            let text = 'Tagging All Members:\n\n';
            nonAdmins.forEach(jid => {
                text += `@${jid.split('@')[0]}\n`;
            });

            await sock.sendMessage(chatId, { 
                text, 
                mentions: nonAdmins 
            }, { quoted: message });

            await react('✅');

        } catch (error) {
            console.error('[TAGNOTADMIN] Error:', error.message);
            await react('❌');
            await reply('⚠️ Failed to tag non-admin members.');
        }
    }
},
 {
    name: 'tagadmin',
    aliases: [],
    category: 'GROUP',
    description: 'Tag all admin members in the group',
    usage: '.tagadmin',
    execute: async (sock, message, args, context) => {
        const { reply, react, senderId, isSenderAdmin, isGroup, isBotAdmin, chatId } = context;

        try {
            if (!isGroup) {
                return await reply('This command can only be used in groups!');
            }

            if (!isBotAdmin) {
                await react('⭐');
                return await reply('Please make the bot an admin first.');
            }

            if (!isSenderAdmin) {
                await react('⭐');
                return await reply('Only admins can use this command.');
            }

            await react('⭐');

            const groupMetadata = await sock.groupMetadata(chatId);
            const participants = groupMetadata.participants || [];

            // ✅ Filter admins
            const admins = participants.filter(p => p.admin);

            if (admins.length === 0) {
                await react('⭐');
                return await reply('No admin members to tag.');
            }

            // ✅ Build mention text
            let text = '🔊 Tagging All Admins:\n\n';
            admins.forEach(p => {
                text += `@${p.id.split('@')[0]}\n`;
            });

            // ✅ Send message with mentions
            await sock.sendMessage(
                chatId,
                {
                    text,
                    mentions: admins.map(a => a.id)
                },
                { quoted: message }
            );

            await react('⭐');

        } catch (error) {
            console.error('[TAGADMIN] Error:', error.message);
            await react('❌');
            await reply('Failed to tag admin members.');
        }
    }
},  // <-- ADDED THIS COMMA (was missing)
{
    name: 'setgpp',
    aliases: ['setgphoto'],
    category: 'GROUP',
    description: 'Change group profile picture (Admin only)',
    usage: 'Reply to an image with .setgpp',
    execute: async (sock, message, args, context) => {
        const { isSenderAdmin, isBotAdmin, chatId, senderId, reply, react, isGroup } = context;

        if (!isGroup) {
            return await reply('❌ This command can only be used in groups.');
        }

        if (!isBotAdmin) {
            await react('⭐');
            return await reply('Please make the bot an admin first.');
        }

        if (!isSenderAdmin) {
            await react('⭐');
            return await reply('Only group admins can use this command.');
        }

        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const imageMessage = quoted?.imageMessage || quoted?.stickerMessage;

        if (!imageMessage) {
            return await reply('Reply to an image or sticker with .setgpp');
        }

        try {
            await react('⭐');

            const tmpDir = path.join(process.cwd(), 'tmp');
            if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

            const stream = await downloadContentFromMessage(imageMessage, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

            const imgPath = path.join(tmpDir, `gpp_${Date.now()}.jpg`);
            fs.writeFileSync(imgPath, buffer);

            await sock.updateProfilePicture(chatId, { url: imgPath });

            try { fs.unlinkSync(imgPath); } catch (_) {}

            await react('✅');
            await reply('Group profile photo updated successfully!');
        } catch (e) {
            console.error('[SETGPP] Error:', e.message);
            await react('❌');
            await reply('Failed to update group profile photo.');
        }
    }
},
{
    name: 'setgname',
    aliases: [],
    category: 'GROUP',
    description: 'Change group name (Admin only)',
    usage: '.setgname <new name>',
    execute: async (sock, message, args, context) => {
const { isSenderAdmin, isBotAdmin, chatId, senderId, reply, react, isGroup } = context;

        if (!isGroup) {
            return await reply('This command can only be used in groups.');
        }

        if (!isBotAdmin) {
            await react('❌');
            return await reply('Please make the bot an admin first.');
        }

        if (!isSenderAdmin) {
            await react('⭐');
            return await reply('Only group admins can use this command.');
        }

        const name = args.slice(1).join(' ').trim();

        if (!name) {
            return await reply('Usage: .setgname <new name>\n\nExample: .setgname Cool Squad 2025');
        }

        try {
            await react('⭐');
            await sock.groupUpdateSubject(chatId, name);
            await react('✅');
            await reply(`Group name updated to: *${name}*`);
        } catch (e) {
            console.error('[SETGNAME] Error:', e.message);
            await react('❌');
            await reply('❌ Failed to update group name.');
        }
    }
},
 {
    name: 'setgdesc',
    aliases: ['setdesc', 'gdesc'],
    category: 'GROUP',
    description: 'Change group description (Admin only)',
    usage: '.setgdesc <new description>',
    execute: async (sock, message, args, context) => {
        const { isSenderAdmin, isBotAdmin, chatId, senderId, reply, react, isGroup } = context;

        if (!isGroup) {
            return await reply('This command can only be used in groups.');
        }

        if (!isBotAdmin) {
            await react('⭐');
            return await reply('Please make the bot an admin first.');
        }

        if (!isSenderAdmin) {
            await react('⭐');
            return await reply('Only group admins can use this command.');
        }

        const desc = args.slice(1).join(' ').trim();

        if (!desc) {
            return await reply('Usage: .setgdesc <description>\n\nExample: .setgdesc Welcome to our amazing group!');
        }

        try {
            await react('⭐');
            await sock.groupUpdateDescription(chatId, desc);
            await react('✅');
            await reply('Group description updated successfully!');
        } catch (e) {
            console.error('[SETGDESC] Error:', e.message);
            await react('❌');
            await reply('❌ Failed to update group description.');
        }
    }
},
 {
    name: 'resetlink',
    aliases: ['revoke', 'newlink'],
    category: 'GROUP',
    description: 'Reset group invite link (Admin only)',
    usage: '.resetlink',
    execute: async (sock, message, args, context) => {
        const { chatId, senderId, reply, isSenderAdmin, isBotAdmin,react, isGroup } = context;

        if (!isGroup) {
            return await reply('This command can only be used in groups.');
        }

        if (!isBotAdmin) {
            await react('⭐');
            return await reply('Please make the bot an admin first.');
        }

        if (!isSenderAdmin) {
            await react('⭐');
            return await reply('Only group admins can use this command.');
        }

        try {
            await react('⭐');
            await sock.groupRevokeInvite(chatId);
            const code = await sock.groupInviteCode(chatId);
            await react('✅');
            await reply(`🔗 *The New group invite link:*\n\nhttps://chat.whatsapp.com/${code}\n\n_Previous link has been revoked!_`);
        } catch (e) {
            console.error('[RESETLINK] Error:', e.message);
            await react('❌');
            await reply('Failed to reset group link.');
        }
    }
},
{
    name: 'poll',
    aliases: ['createpoll', 'vote'],
    category: 'GROUP',
    description: 'Create a poll in the group (Admin only)',
    usage: '.poll "Question?" | Option1, Option2, Option3',
    execute: async (sock, message, args, context) => {
        const { chatId, senderId, reply, react,isSenderAdmin, isBotAdmin, isGroup } = context;

        if (!isGroup) {
            return await reply('This command can only be used in groups.');
        }

        if (!isBotAdmin) {
            await react('⭐');
            return await reply('Please make the bot an admin first.');
        }

        if (!isSenderAdmin) {
            await react('⭐');
            return await reply('Only group admins can use this command.');
        }

        const text = args.slice(1).join(' ').trim();

        if (!text) {
            return await reply('Usage: .poll "Question?" | Option1, Option2, Option3\n\nExample: .poll "Favorite color?" | Red, Blue, Green');
        }

        const [questionPart, optionsPart] = text.split('|').map(t => t.trim());

        if (!questionPart || !optionsPart) {
            return await reply('Invalid format.\n\n📊 Example: .poll "Favorite color?" | Red, Blue, Green');
        }

        const options = optionsPart.split(',').map(opt => opt.trim()).filter(opt => opt.length);

        if (options.length < 2) {
            return await reply('Please provide at least 2 options.');
        }

        try {
            await react('⭐');
            await sock.sendMessage(chatId, {
                poll: {
                    name: questionPart,
                    values: options
                }
            });
            await react('✅');
            await reply('✅ Poll created successfully!');
        } catch (e) {
            console.error('[POLL] Error:', e.message);
            await react('❌');
            await reply('Failed to create poll.');
        }
    }
}
    ];