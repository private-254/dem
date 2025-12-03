const yts = require('yt-search');
const axios = require('axios');

async function songCommand(sock, chatId, message) {
    try {
        // Start reaction
        await sock.sendMessage(chatId, {
            react: { text: "🎵", key: message.key }
        });

        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const searchQuery = text.split(' ').slice(1).join(' ').trim();

        if (!searchQuery) {
            await sock.sendMessage(chatId, { 
                text: "What song do you want to download?"
            }, { quoted: message });
            return;
        }

        // Search for the song
        const { videos } = await yts(searchQuery);
        if (!videos || videos.length === 0) {
            await sock.sendMessage(chatId, { 
                text: "No songs found!"
            }, { quoted: message });
            return;
        }

        // Get the first video result
        const video = videos[0];
        const urlYt = video.url;

        // Fetch audio data from API
        const response = await axios.get(`https://api.privatezia.biz.id/api/downloader/ytmp3?url=${urlYt}`);
        const apiData = response.data;

        if (!apiData?.status || !apiData.result?.downloadUrl) {
            await sock.sendMessage(chatId, { 
                text: "Failed to fetch audio"
            }, { quoted: message });
            return;
        }

        const title = apiData.result.title || video.title;
        
        // Send audio directly with all metadata
        await sock.sendMessage(chatId, {
            audio: { url: apiData.result.downloadUrl },
            mimetype: "audio/mpeg",
            fileName: `${title}.mp3`,
            caption: title
        }, { quoted: message });

        // Success reaction
        await sock.sendMessage(chatId, {
            react: { text: '✅', key: message.key }
        });

    } catch (error) {
        console.error('Song command error:', error.message);
        
        // Error reaction
        await sock.sendMessage(chatId, {
            react: { text: '❌', key: message.key }
        });
        
        // Send error message
        await sock.sendMessage(chatId, { 
            text: `Error: ${error.message}`
        }, { quoted: message });
    }
}

module.exports = songCommand;