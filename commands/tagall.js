const isAdmin = require('../lib/isAdmin');

async function tagAllCommand(sock, chatId, senderId) {
    try {
        const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);

        if (!isSenderAdmin && !isBotAdmin) {
            await sock.sendMessage(chatId, {
                text: '⚠️ *Access Restricted*\nOnly group administrators can use this command.'
            });
            return;
        }

        // Get group metadata
        const groupMetadata = await sock.groupMetadata(chatId);
        const participants = groupMetadata.participants;

        if (!participants || participants.length === 0) {
            await sock.sendMessage(chatId, { 
                text: '❌ No group members found to mention.' 
            });
            return;
        }

        // Get group profile picture
        let profilePictureUrl = null;
        try {
            const ppUrl = await sock.profilePictureUrl(chatId, 'image');
            profilePictureUrl = ppUrl;
        } catch (error) {
            console.log('Could not fetch group profile picture:', error.message);
            // Continue without profile picture
        }

        // Prepare the message with group info - ONLY CHANGED THE OUTPUT TEXT HERE
        let message = `📢 *GROUP MENTION ALERT* 📢\n\n`;
        message += `*Community:* ${groupMetadata.subject}\n`;
        message += `👥 *Total Participants:* ${participants.length}\n`;
        message += `*Created On:* ${new Date(groupMetadata.creation * 1000).toLocaleDateString()}\n\n`;
        message += `*Members List:*\n\n`;

        // Add participants with numbering - KEPT SAME FUNCTIONALITY
        participants.forEach((participant, index) => {
            const number = (index + 1).toString().padStart(2, '0');
            const username = participant.id.split('@')[0];
            const displayName = participant.name || participant.notify || username;

            // Add admin indicator - slight change in emoji only
            const adminIndicator = participant.admin ? ' 👑' : '';

            message += `${number}. @${username}${adminIndicator}\n`;
        });

        // Prepare message options
        const messageOptions = {
            text: message,
            mentions: participants.map(p => p.id)
        };

        // Add profile picture if available - SAME FUNCTIONALITY
        if (profilePictureUrl) {
            try {
                // Send image with caption
                await sock.sendMessage(chatId, {
                    image: { url: profilePictureUrl },
                    caption: message,
                    mentions: participants.map(p => p.id)
                });
                return;
            } catch (imageError) {
                console.log('Failed to send with image, sending text only:', imageError.message);
                // Fall back to text message if image fails
                await sock.sendMessage(chatId, messageOptions);
            }
        } else {
            // Send text message without image
            await sock.sendMessage(chatId, messageOptions);
        }

    } catch (error) {
        console.error('Error in tagall command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Failed to mention all members. Please try again.' 
        });
    }
}

module.exports = tagAllCommand;