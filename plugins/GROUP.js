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
    usage: ".remove [@user] or .remove 254123456789,254987654321 or reply to message",

    execute: async (sock, m, args, context) => {
        const { chatId, reply, react, senderIsSudo, isGroup, isSenderAdmin, isBotAdmin } = context;

        if (!isGroup) {
            return await reply("This command is for groups only.");
        }

        if (!isBotAdmin) {
            return await reply("Bot must be admin to remove members.");
        }

        if (!isSenderAdmin && !senderIsSudo) {
            return await reply("Only group admins can remove members.");
        }

        await react("⏳");

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
                        results.push(`${targetNumber} - Cannot remove admin`);
                        failCount++;
                        continue;
                    }

                    // 2. Prevent removing the bot
                    if (sock.user && targetJid === sock.user.id) {
                        results.push(`${targetNumber} - Cannot remove bot`);
                        failCount++;
                        continue;
                    }

                    // 3. Check if user is in group
                    const isInGroup = groupMetadata.participants.some(p => p.id === targetJid);
                    if (!isInGroup) {
                        results.push(`${targetNumber} - Not in this group`);
                        failCount++;
                        continue;
                    }

                    // 4. Try to remove
                    const response = await sock.groupParticipantsUpdate(chatId, [targetJid], "remove");

                    if (response[0]?.status === "200") {
                        results.push(`${targetNumber} - Removed`);
                        successCount++;
                    } else {
                        results.push(`${targetNumber} - ${response[0]?.status || "Failed"}`);
                        failCount++;
                    }

                } catch (error) {
                    const targetNumber = targetJid.split("@")[0];
                    results.push(`${targetNumber} - Error`);
                    failCount++;
                }

                // Delay to avoid spam
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

        } catch (error) {
            await reply(`Error removing members: ${error.message}`);
        }
    }
},  
    {
    name: "add",
    aliases: ["addmember", "invite"],
    description: "Add members to group using phone numbers",
    category: "GROUP MENU",
    usage: ".add 254123456789,254987654321,254555666777",

    execute: async (sock, message, args, context) => {
        const { chatId, reply, react, senderIsSudo, isGroup, isSenderAdmin, isBotAdmin } = context;

        if (!isGroup) {
            return await reply("This command is for groups only.");
        }

        // Check if bot has admin permissions
        if (!isBotAdmin) {
            return await reply("Bot must be admin to add members.");
        }

        // Check if sender has admin permissions
        if (!isSenderAdmin && !senderIsSudo) {
            return await reply("Only group admins can add members.");
        }

        await react('👥');

        try {
            // Parse phone numbers
            const numbers = args.join(' ').split(',').map(num => num.trim());

            if (numbers.length === 0) {
                return await reply("No phone numbers provided.");
            }

            let successCount = 0;
            let failCount = 0;
            let results = [];

            for (const number of numbers) {
                try {
                    // Clean the number
                    const cleanNumber = number.replace(/[^\d]/g, '');

                    if (cleanNumber.length < 10) {
                        results.push(`${number} - Invalid number`);
                        failCount++;
                        continue;
                    }

                    const jid = cleanNumber + '@s.whatsapp.net';

                    // Check if user exists on WhatsApp
                    const [exists] = await sock.onWhatsApp(jid);
                    if (!exists) {
                        results.push(`${cleanNumber} - Not on WhatsApp`);
                        failCount++;
                        continue;
                    }

                    // Try to add the user
                    const response = await sock.groupParticipantsUpdate(chatId, [jid], 'add');

                    if (response[0]?.status === '200') {
                        results.push(`${cleanNumber} - Added`);
                        successCount++;
                    } else {
                        results.push(`${cleanNumber} - ${response[0]?.status || 'Failed'}`);
                        failCount++;
                    }
                } catch (error) {
                    results.push(`${number} - Error`);
                    failCount++;
                }

                // Small delay to prevent spam
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

        } catch (error) {
            await reply(`Error adding members: ${error.message}`);
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
        await context.react('🔒')

        if (!isGroup) {
            return await context.reply("This command is for groups only.");
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
                return await context.reply("Only group admins can close the group.");
            }

            await sock.groupSettingUpdate(from, 'announcement');

            await context.reply({
                text: `Group Closed.\n\nOnly admins can send messages.\n\nGroup closed by DAVE-MD`
            }, { quoted: m });

        } catch (error) {
            await context.reply({
                text: `Failed to close group: ${error.message}`
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
        await context.react('🔓')

        if (!isGroup) {
            return await context.reply("This command is for groups only.");
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
                return await context.reply("Only group admins can open the group.");
            }

            await sock.groupSettingUpdate(from, 'not_announcement');

            await context.reply({
                text: `Group Opened.\n\nAll members can now send messages.\n\nGroup opened by DAVE-MD`
            }, { quoted: m });

        } catch (error) {
            await context.reply({
                text: `Failed to open group: ${error.message}`
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
                return await reply('Bot must be admin first.');
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
            return await reply('Mention user or reply to their message to kick.');
        }

        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        if (usersToKick.includes(botId)) {
            return await reply("Cannot kick the bot.");
        }

        await react('👢');

        try {
            await sock.groupParticipantsUpdate(chatId, usersToKick, "remove");

            const usernames = await Promise.all(usersToKick.map(async jid => {
                return `@${jid.split('@')[0]}`;
            }));

            await sock.sendMessage(chatId, { 
                text: `${usernames.join(', ')} removed from group.`,
                mentions: usersToKick
            });

        } catch (error) {
            await reply('Failed to remove user.');
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
        await context.react('🔗')

        if (!isGroup) {
            return await context.reply("This command is for groups only.");
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
                return await context.reply("Only group admins can get the invite link.");
            }

            const inviteCode = await sock.groupInviteCode(from);
            const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;

            await context.reply({
                text: `Group Invite Link\n\nGroup: ${groupMetadata.subject}\nMembers: ${groupMetadata.participants.length}\nLink: ${inviteLink}\n\nNote: Anyone with this link can join.\nDAVE-MD`
            }, { quoted: m });

        } catch (error) {
            await context.reply({
                text: `Failed to get group link: ${error.message}`
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
                return await context.reply('This command can only be used in groups.');
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

            await context.reply({
                text: groupInfo,
                mentions: groupAdmins.map(admin => admin.id)
            }, { quoted: m });

        } catch (error) {
            console.error('GroupInfo Error:', error);
            await context.reply('Failed to get group information.');
        }
    }
},
           {
    name: "demote",
    description: "Demote a group admin to member",
    category: "GROUP MENU",
    usage: ".demote @user",

    execute: async (sock, m, args, context) {
        try {
            const { reply, react, mentions, hasQuotedMessage, isSenderAdmin, isBotAdmin, chatId } = context;
            await react('⬇️');
            
            if (!chatId.endsWith('@g.us')) {
                return await reply('This command can only be used in groups.');
            }

            const groupMetadata = await sock.groupMetadata(chatId);
            const groupAdmins = groupMetadata.participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin').map(p => p.id);
            const senderNumber = m.key.participant || m.key.remoteJid;

            if (!groupAdmins.includes(senderNumber)) {
                return await context.reply('Only group admins can use this command.');
            }

            let targetUser;
            if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
                targetUser = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
            } else if (m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
                targetUser = m.message.extendedTextMessage.contextInfo.participant;
            } else {
                return await reply('Mention or reply to user to demote.');
            }

            if (!groupAdmins.includes(targetUser)) {
                return await reply('User is not an admin.');
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
                    errorMsg = 'No permission to demote users.';
                } else if (demoteError.message.includes('not-authorized')) {
                    errorMsg = 'Need admin privileges to demote users.';
                }

                await context.reply(errorMsg, { quoted: m });
            }

        } catch (error) {
            console.error('Demote Error:', error);
            await context.reply('Failed to demote user.');
        }
    }
},
   {
    name: 'promote',
    aliases: ['pmt'],
    category: 'GROUP MENU',
    description: 'Promote users to admin',
    usage: '.promote @user or reply to message',

    execute: async (sock, message, args, context) {
        const { reply, react, mentions, hasQuotedMessage, isSenderAdmin, isBotAdmin, chatId } = context;
        
        if (!chatId.endsWith('@g.us')) {
            return await reply('This command can only be used in groups.');
        }

        if (!isBotAdmin) {
            return await reply('Bot must be admin first.');
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
            return await reply('Mention user or reply to their message to promote.');
        }

        await react('⬆️');

        try {
            await sock.groupParticipantsUpdate(chatId, userToPromote, "promote");

            const groupMetadata = await sock.groupMetadata(chatId);
            const groupName = groupMetadata.subject || 'Unknown Group';
            const currentTime = new Date().toLocaleString();

            for (const user of userToPromote) {
                const userName = user.split('@')[0];

                const promotionMessage = `User Promoted\n\nGroup: ${groupName}\nUser: @${userName}\nRole: Admin\nTime: ${currentTime}\n\nDAVE-MD`;

                await sock.sendMessage(chatId, { 
                    text: promotionMessage,
                    mentions: [user]
                });
            }

        } catch (error) {
            await reply('Failed to promote user.');
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
            return await context.reply("This command is for groups only.");
        }

        try {
            const groupMetadata = await sock.groupMetadata(from);

            await context.reply({
                text: `Group Information\n\nName: ${groupMetadata.subject}\nJID: ${from}\nMembers: ${groupMetadata.participants.length}\nCreated: ${new Date(groupMetadata.creation * 1000).toLocaleDateString()}\n\nDAVE-MD`
            }, { quoted: m });

        } catch (error) {
            await context.reply(`Error getting group info: ${error.message}`, { quoted: m });
        }
    }
},
{
    name: 'mute',
    aliases: ['silence'],
    category: 'GROUP MENU',
    description: 'Mute the group for specified minutes',
    usage: '.mute <minutes>',
    execute: async (sock, message, args, context) {
        const { reply, react, isSenderAdmin, isBotAdmin, chatId } = context;
        
        if (!isBotAdmin) {
            return await reply('Bot must be admin first.');
        }

        if (!isSenderAdmin) {
            return await reply('Only group admins can use the mute command.');
        }

        const durationInMinutes = parseInt(args[1]) || 5;
        await react('🔇');
        const durationInMilliseconds = durationInMinutes * 60 * 1000;

        try {
            await sock.groupSettingUpdate(chatId, 'announcement');
            await reply(`Group muted for ${durationInMinutes} minutes.`);
            
            setTimeout(async () => {
                await sock.groupSettingUpdate(chatId, 'not_announcement');
                await sock.sendMessage(chatId, { text: 'Group unmuted.' });
            }, durationInMilliseconds);

        } catch (error) {
            await reply('Error muting group.');
        }
    }
}, 
  {
    name: 'unmute',
    aliases: ['unsilence'],
    category: 'GROUP MENU',
    description: 'Unmute the group',
    usage: '.unmute',
    execute: async (sock, message, args, context) {
        const { chatId, reply, react, isSenderAdmin, isBotAdmin } = context;

        if (!isBotAdmin) {
            return await reply('Bot must be admin first.');
        }

        if (!isSenderAdmin) {
            return await reply('Only group admins can use the unmute command.');
        }

        try {
            await react('🔊');
            await sock.groupSettingUpdate(chatId, 'not_announcement');
            await reply('Group unmuted.');
        } catch (error) {
            await reply('Error unmuting group.');
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
            return await reply('This command is for groups only.');
        }

        try {
            const groupMetadata = await sock.groupMetadata(from);
            const groupOwner = groupMetadata.owner;

            const allAdmins = groupMetadata.participants
                .filter(p => p.admin === 'admin' || p.admin === 'superadmin' || p.id === groupOwner);

            const uniqueAdmins = allAdmins.filter((admin, index, self) =>
                index === self.findIndex(a => a.id === admin.id)
            );

            if (uniqueAdmins.length === 0) {
                return await reply("No admins found.");
            }

            const action = args[0]?.toLowerCase();
            const mentions = uniqueAdmins.map(admin => admin.id);

            const getDisplayName = (participant) => {
                if (participant.notify && participant.notify.trim() !== '') {
                    return participant.notify;
                }
                if (participant.displayName && participant.displayName.trim() !== '') {
                    return participant.displayName;
                }
                const phoneNumber = participant.id.split('@')[0];
                return phoneNumber;
            };

            if (action === 'tag') {
                const adminTags = uniqueAdmins.map(admin => {
                    const displayName = getDisplayName(admin);
                    return `@${displayName}`;
                }).join(' ');

                await reply(`Group Admins (${uniqueAdmins.length})\n\n${adminTags}`, { mentions });

            } else {
                let adminList = `Group Admins (${uniqueAdmins.length})\n\n`;

                uniqueAdmins.forEach((admin, index) => {
                    const displayName = getDisplayName(admin);
                    let role;

                    if (admin.id === groupOwner) {
                        role = 'Creator';
                    } else {
                        role = 'Admin';
                    }

                    adminList += `${index + 1}. ${role}: @${displayName}\n`;
                });

                adminList += `\nUse .admins tag to mention all admins`;

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
    execute: async (sock, message, args, context) {
        const { chatId, reply, react, senderIsSudo, isSenderAdmin, isBotAdmin, rawText } = context;

        if (!chatId.endsWith('@g.us')) {
            return await reply('This command can only be used in groups.');
        }

        if (!isSenderAdmin && !isBotAdmin) {
            return await reply('Only admins can use the tagall command.');
        }
        if (!senderIsSudo){
            return await reply('Only owner can use the tagall command.');
        }

        try {
            await react('📢');

            const groupMetadata = await sock.groupMetadata(chatId);
            const participants = groupMetadata.participants;

            if (!participants || participants.length === 0) {
                return await reply('No participants found.');
            }

            const customMessage = rawText.split(' ').slice(1).join(' ').trim();

            let message = customMessage ? `Announcement:\n${customMessage}` : 'Group Members:\n';

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
    execute: async (sock, message, args, context) {
        const { reply, react, isSenderAdmin, isBotAdmin,isGroup, chatId,senderId } = context;
        try {
            if (!isGroup) {
                return await reply('This command can only be used in groups.');
            }

            if (!isBotAdmin) {
                await react('❌');
                return await reply('Bot must be admin first.');
            }

            if (!isSenderAdmin) {
                await react('🚫');
                return await reply('Only admins can use this command.');
            }

            await react('⏳');

            const groupMetadata = await sock.groupMetadata(chatId);
            const participants = groupMetadata.participants || [];

            const nonAdmins = participants.filter(p => !p.admin).map(p => p.id);

            if (nonAdmins.length === 0) {
                await react('ℹ️');
                return await reply('No non-admin members to tag.');
            }

            let text = 'Tagging Members:\n\n';
            nonAdmins.forEach(jid => {
                text += `@${jid.split('@')[0]}\n`;
            });

            await sock.sendMessage(chatId, { 
                text, 
                mentions: nonAdmins 
            }, { quoted: message });

            await react('✅');

        } catch (error) {
            console.error('TagNotAdmin Error:', error.message);
            await react('❌');
            await reply('Failed to tag non-admin members.');
        }
    }
},
 {
    name: 'tagadmin',
    aliases: [],
    category: 'GROUP',
    description: 'Tag all admin members in the group',
    usage: '.tagadmin',
    execute: async (sock, message, args, context) {
        const { reply, react, senderId, isSenderAdmin, isGroup, isBotAdmin, chatId } = context;

        try {
            if (!isGroup) {
                return await reply('This command can only be used in groups.');
            }

            if (!isBotAdmin) {
                await react('❌');
                return await reply('Bot must be admin first.');
            }

            if (!isSenderAdmin) {
                await react('🚫');
                return await reply('Only admins can use this command.');
            }

            await react('⏳');

            const groupMetadata = await sock.groupMetadata(chatId);
            const participants = groupMetadata.participants || [];

            const admins = participants.filter(p => p.admin);

            if (admins.length === 0) {
                await react('ℹ️');
                return await reply('No admin members to tag.');
            }

            let text = 'Tagging Admins:\n\n';
            admins.forEach(p => {
                text += `@${p.id.split('@')[0]}\n`;
            });

            await sock.sendMessage(chatId, { text, mentions: admins.map(a => a.id) }, { quoted: message });
            await react('✅');

        } catch (error) {
            console.error('TagAdmin Error:', error.message);
            await react('❌');
            await reply('Failed to tag admin members.');
        }
    }
},
{
    name: 'setgpp',
    aliases: ['setgphoto'],
    category: 'GROUP',
    description: 'Change group profile picture',
    usage: 'Reply to an image with .setgpp',
    execute: async (sock, message, args, context) {
        const { isSenderAdmin, isBotAdmin, chatId, senderId, reply, react, isGroup } = context;

        if (!isGroup) {
            return await reply('This command can only be used in groups.');
        }

        if (!isBotAdmin) {
            await react('❌');
            return await reply('Bot must be admin first.');
        }

        if (!isSenderAdmin) {
            await react('🚫');
            return await reply('Only group admins can use this command.');
        }

        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const imageMessage = quoted?.imageMessage || quoted?.stickerMessage;

        if (!imageMessage) {
            return await reply('Reply to an image or sticker with .setgpp');
        }

        try {
            await react('⏳');

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
            await reply('Group profile photo updated.');
        } catch (e) {
            console.error('SetGPP Error:', e.message);
            await react('❌');
            await reply('Failed to update group profile photo.');
        }
    }
},
{
    name: 'setgname',
    aliases: [],
    category: 'GROUP',
    description: 'Change group name',
    usage: '.setgname <new name>',
    execute: async (sock, message, args, context) {
        const { isSenderAdmin, isBotAdmin, chatId, senderId, reply, react, isGroup } = context;

        if (!isGroup) {
            return await reply('This command can only be used in groups.');
        }

        if (!isBotAdmin) {
            await react('❌');
            return await reply('Bot must be admin first.');
        }

        if (!isSenderAdmin) {
            await react('🚫');
            return await reply('Only group admins can use this command.');
        }

        const name = args.slice(1).join(' ').trim();

        if (!name) {
            return await reply('Usage: .setgname <new name>');
        }

        try {
            await react('⏳');
            await sock.groupUpdateSubject(chatId, name);
            await react('✅');
            await reply(`Group name updated to: ${name}`);
        } catch (e) {
            console.error('SetGName Error:', e.message);
            await react('❌');
            await reply('Failed to update group name.');
        }
    }
},
 {
    name: 'setgdesc',
    aliases: ['setdesc', 'gdesc'],
    category: 'GROUP',
    description: 'Change group description',
    usage: '.setgdesc <new description>',
    execute: async (sock, message, args, context) {
        const { isSenderAdmin, isBotAdmin, chatId, senderId, reply, react, isGroup } = context;

        if (!isGroup) {
            return await reply('This command can only be used in groups.');
        }

        if (!isBotAdmin) {
            await react('❌');
            return await reply('Bot must be admin first.');
        }

        if (!isSenderAdmin) {
            await react('🚫');
            return await reply('Only group admins can use this command.');
        }

        const desc = args.slice(1).join(' ').trim();

        if (!desc) {
            return await reply('Usage: .setgdesc <description>');
        }

        try {
            await react('⏳');
            await sock.groupUpdateDescription(chatId, desc);
            await react('✅');
            await reply('Group description updated.');
        } catch (e) {
            console.error('SetGDesc Error:', e.message);
            await react('❌');
            await reply('Failed to update group description.');
        }
    }
},
 {
    name: 'resetlink',
    aliases: ['revoke', 'newlink'],
    category: 'GROUP',
    description: 'Reset group invite link',
    usage: '.resetlink',
    execute: async (sock, message, args, context) {
        const { chatId, senderId, reply, isSenderAdmin, isBotAdmin,react, isGroup } = context;

        if (!isGroup) {
            return await reply('This command can only be used in groups.');
        }

        if (!isBotAdmin) {
            await react('❌');
            return await reply('Bot must be admin first.');
        }

        if (!isSenderAdmin) {
            await react('🚫');
            return await reply('Only group admins can use this command.');
        }

        try {
            await react('⏳');
            await sock.groupRevokeInvite(chatId);
            const code = await sock.groupInviteCode(chatId);
            await react('✅');
            await reply(`New group link:\n\nhttps://chat.whatsapp.com/${code}\n\nPrevious link revoked.`);
        } catch (e) {
            console.error('ResetLink Error:', e.message);
            await react('❌');
            await reply('Failed to reset group link.');
        }
    }
},
{
    name: 'poll',
    aliases: ['createpoll', 'vote'],
    category: 'GROUP',
    description: 'Create a poll in the group',
    usage: '.poll "Question?" | Option1, Option2, Option3',
    execute: async (sock, message, args, context) {
        const { chatId, senderId, reply, react,isSenderAdmin, isBotAdmin, isGroup } = context;

        if (!isGroup) {
            return await reply('This command can only be used in groups.');
        }

        if (!isBotAdmin) {
            await react('❌');
            return await reply('Bot must be admin first.');
        }

        if (!isSenderAdmin) {
            await react('🚫');
            return await reply('Only group admins can use this command.');
        }

        const text = args.slice(1).join(' ').trim();

        if (!text) {
            return await reply('Usage: .poll "Question?" | Option1, Option2, Option3');
        }

        const [questionPart, optionsPart] = text.split('|').map(t => t.trim());

        if (!questionPart || !optionsPart) {
            return await reply('Invalid format.\nExample: .poll "Favorite color?" | Red, Blue, Green');
        }

        const options = optionsPart.split(',').map(opt => opt.trim()).filter(opt => opt.length);

        if (options.length < 2) {
            return await reply('At least 2 options required.');
        }

        try {
            await react('⏳');
            await sock.sendMessage(chatId, {
                poll: {
                    name: questionPart,
                    values: options
                }
            });
            await react('✅');
            await reply('Poll created.');
        } catch (e) {
            console.error('Poll Error:', e.message);
            await react('❌');
            await reply('Failed to create poll.');
        }
    }
}
];