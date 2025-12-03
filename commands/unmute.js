/**
 * Unmute a WhatsApp group by updating its settings
 * @param {object} sock - WhatsApp socket instance
 * @param {string} chatId - Group chat ID
 * @returns {Promise<object>} - Result object with status and message
 */
async function unmuteCommand(sock, chatId) {
    try {
        // Update group settings to allow normal conversation
        await sock.groupSettingUpdate(chatId, 'not_announcement');

        // Fetch group metadata for a nicer confirmation message
        const metadata = await sock.groupMetadata(chatId);
        const groupName = metadata?.subject || 'this group';

        // Send confirmation message
        await sock.sendMessage(chatId, { 
            text: `🔊 *Group Unmuted*\n\n• *${groupName}* is now active!\n• Members can chat freely\n• Messages are no longer restricted\n\n🤖 *Powered by DAVE-MD*` 
        });

        // Return success status
        return { success: true, message: `${groupName} unmuted successfully` };

    } catch (error) {
        console.error('Error unmuting group:', error);

        // Send error message to group
        await sock.sendMessage(chatId, { 
            text: `❌ *Unmute Failed*\n\nUnable to update group settings.\n\n_Error: ${error.message || 'Unknown error'}_\n\nPlease try again or check permissions.` 
        });

        // Return failure status
        return { success: false, message: 'Failed to unmute group', error };
    }
}

module.exports = unmuteCommand;