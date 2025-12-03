const fs = require("fs");
const axios = require('axios');
const yts = require('yt-search');
const path = require('path');

async function playCommand(sock, chatId, message) {
    try {
        // Send processing reaction
        await sock.sendMessage(chatId, {
            react: { text: '🎼', key: message.key }
        });

        const tempDir = path.join(__dirname, "temp");
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const parts = text.split(' ');
        const query = parts.slice(1).join(' ').trim();

        if (!query) {
            await sock.sendMessage(chatId, { 
                text: 'Provide a song name!\nExample: .play Not Like Us'
            }, { quoted: message });
            return;
        }

        // Search for video
        const searchResult = await yts(`${query} official`);
        if (!searchResult || !searchResult.videos || searchResult.videos.length === 0) {
            await sock.sendMessage(chatId, { 
                text: "Couldn't find that song. Try another one!"
            }, { quoted: message });
            return;
        }

        const video = searchResult.videos[0];
        
        // Get audio URL
        const apiUrl = `https://api.privatezia.biz.id/api/downloader/ytmp3?url=${encodeURIComponent(video.url)}`;
        const response = await axios.get(apiUrl);
        const apiData = response.data;

        if (!apiData.status || !apiData.result || !apiData.result.downloadUrl) {
            throw new Error("Failed to fetch audio");
        }

        const timestamp = Date.now();
        const fileName = `audio_${timestamp}.mp3`;
        const filePath = path.join(tempDir, fileName);

        // Download MP3 directly
        const audioResponse = await axios({
            method: "get",
            url: apiData.result.downloadUrl,
            responseType: "arraybuffer",
            timeout: 30000
        });

        // Save file
        fs.writeFileSync(filePath, audioResponse.data);

        // Send audio directly
        await sock.sendMessage(chatId, { 
            audio: fs.readFileSync(filePath),
            mimetype: 'audio/mpeg',
            ptt: false
        }, { quoted: message });

        // Cleanup
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

    } catch (error) {
        console.error("Play command error:", error);
        
        // Send error as audio message caption (if we can get the original audio)
        try {
            const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
            const parts = text.split(' ');
            const query = parts.slice(1).join(' ').trim();
            
            // Create error audio
            await sock.sendMessage(chatId, { 
                audio: fs.readFileSync(path.join(__dirname, 'error.mp3')), // You need an error.mp3 file
                mimetype: 'audio/mpeg',
                ptt: false,
                caption: `Error: ${error.message}`
            }, { quoted: message });
        } catch (e) {
            // Fallback to text
            await sock.sendMessage(chatId, { 
                text: `Error: ${error.message}`
            }, { quoted: message });
        }
    }
}

module.exports = playCommand;