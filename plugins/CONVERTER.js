import { 
  ffmpeg,
  cleanup,
  toAudio,
  toHQAudio,
  toPTT,
  toVideo,
  toHQVideo,
  toGIF,
  toWebP,
  toAnimatedWebP,
  extractAudio,
  addWatermark,
  compressVideo,
  changeVideoSpeed,
  resizeVideo,
  videoToAudio,
  convertAudioFormat,
  changeSpeed,
  createThumbnail,
  extractFrames,
  convertImage,
  resizeImage,
  mergeAudioVideo,
  addAudioToImage,
  getMediaInfo   
} from '../lib/converter.js';

import { channelInfo } from '../lib/messageConfig.js';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import fetch from 'node-fetch';
import fs from 'fs';
import { exec } from 'child_process';
import path from 'path';
import settings from '../settings.js';

// Helper function to download media
async function downloadMedia(quotedMsg, mediaType) {
    const stream = await downloadContentFromMessage(quotedMsg, mediaType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }
    return buffer;
}

// Helper function to get quoted media
function getQuotedMedia(message) {
    const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quotedMsg) return null;

    if (quotedMsg.videoMessage) return { msg: quotedMsg.videoMessage, type: 'video', ext: 'mp4' };
    if (quotedMsg.audioMessage) return { msg: quotedMsg.audioMessage, type: 'audio', ext: 'mp3' };
    if (quotedMsg.imageMessage) return { msg: quotedMsg.imageMessage, type: 'image', ext: 'jpg' };
    if (quotedMsg.stickerMessage) return { msg: quotedMsg.stickerMessage, type: 'sticker', ext: 'webp' };
    if (quotedMsg.documentMessage) return { msg: quotedMsg.documentMessage, type: 'document', ext: 'bin' };

    return null;
}

export default [
    {
        name: 'hqaudio',
        aliases: ['hqa'],
        category: 'converter',
        execute: async (sock, message, args, context) => {
            const media = getQuotedMedia(message);
            if (!media || (media.type !== 'video' && media.type !== 'audio')) {
                return context.reply('Reply to a video or audio file');
            }
            try {
                await context.react('🔧');
                const buffer = await downloadMedia(media.msg, media.type);
                const converted = await toHQAudio(buffer, media.ext);
                await context.replyPlain({
                    audio: converted,
                    mimetype: 'audio/mpeg',
                    fileName: 'hq_audio.mp3',
                    ...channelInfo
                }, { quoted: message });
            } catch (error) {
                console.error(error);
                context.reply('Failed to convert to HQ audio');
            }
        }
    },

{
    name: "toaudio",
    aliases: ["extractaudio", "mp3"],
    category: "TOOLS MENU",
    description: "Extract audio from video or convert audio files",
    usage: ".toaudio (reply to video/audio)",

    execute: async (sock, m, args, context) => {
        const { chatId, reply, react } = context;

        try {
            await react('🎵');

            // Get the media message
            const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            let msg = null;
            
            // Check quoted message first
            if (quoted) {
                msg = quoted.videoMessage || quoted.audioMessage || quoted.documentMessage;
            } else {
                // Check direct message
                msg = m.message?.videoMessage || m.message?.audioMessage || m.message?.documentMessage;
            }

            if (!msg) {
                return await reply("Reply to a video or audio file to convert it to audio!");
            }

            // MIME type checking
            const mime = msg.mimetype || '';
            const isVideo = mime.startsWith('video/');
            const isAudio = mime.startsWith('audio/');
            const isDocument = msg.documentMessage && (
                mime.includes('video') || 
                mime.includes('audio') || 
                mime.includes('mp4') || 
                mime.includes('mpeg')
            );

            if (!isVideo && !isAudio && !isDocument) {
                return await reply("Only works on video or audio messages!");
            }

            await reply("Converting to audio...");

            // Create temp directory
            const tempDir = path.join(process.cwd(), 'temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }

            // Temp file paths
            const timestamp = Date.now();
            const random = Math.random().toString(36).substring(7);
            const inputPath = path.join(tempDir, `input_${timestamp}_${random}.tmp`);
            const outputPath = path.join(tempDir, `audio_${timestamp}_${random}.mp3`);

            try {
                // Determine file type for download
                const fileType = isVideo ? 'video' : 'audio';
                
                // Download media
                const stream = await downloadContentFromMessage(msg, fileType);
                
                // Write to file
                const writeStream = fs.createWriteStream(inputPath);
                for await (const chunk of stream) {
                    writeStream.write(chunk);
                }
                writeStream.end();

                await new Promise((resolve, reject) => {
                    writeStream.on('finish', resolve);
                    writeStream.on('error', reject);
                });

                // Verify file
                const stats = fs.statSync(inputPath);
                if (stats.size === 0) {
                    throw new Error('Downloaded file is empty');
                }

                // Convert using ffmpeg
                await new Promise((resolve, reject) => {
                    const ffmpeg = require('fluent-ffmpeg');
                    
                    ffmpeg(inputPath)
                        .toFormat('mp3')
                        .audioCodec('libmp3lame')
                        .audioBitrate('192k')
                        .audioChannels(2)
                        .audioFrequency(44100)
                        .on('start', () => {
                            console.log('[TOAUDIO] Conversion started');
                        })
                        .on('progress', (progress) => {
                            if (progress.percent) {
                                console.log(`[TOAUDIO] Processing: ${Math.round(progress.percent)}%`);
                            }
                        })
                        .on('end', () => {
                            console.log('[TOAUDIO] Conversion completed');
                            resolve();
                        })
                        .on('error', (err) => {
                            console.error('[TOAUDIO] FFmpeg error:', err.message);
                            reject(new Error(`Conversion failed: ${err.message}`));
                        })
                        .save(outputPath);
                });

                // Check output file
                if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size === 0) {
                    throw new Error('Conversion produced empty file');
                }

                // Send audio
                await sock.sendMessage(chatId, { 
                    audio: { url: outputPath },
                    mimetype: 'audio/mpeg',
                    ptt: false,
                    fileName: `audio_${timestamp}.mp3`
                }, { quoted: m });

                await react('✅');

            } catch (conversionError) {
                console.error('[TOAUDIO] Conversion error:', conversionError.message);
                
                if (conversionError.message.includes('ffmpeg') || conversionError.message.includes('FFmpeg')) {
                    throw new Error('FFmpeg is not installed or not in PATH.\nInstall: https://ffmpeg.org/download.html');
                }
                throw conversionError;
                
            } finally {
                // Cleanup temp files
                try {
                    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
                } catch (cleanupError) {
                    console.error('[TOAUDIO] Cleanup error:', cleanupError.message);
                }
            }

        } catch (error) {
            console.error('[TOAUDIO] Command error:', error.message);
            await react('❌');
            
            if (error.message.includes('FFmpeg')) {
                await reply(`FFmpeg error: ${error.message}\n\nMake sure FFmpeg is installed on your system!`);
            } else {
                await reply(`Failed to convert: ${error.message}`);
            }
        }
    }
},
    {
        name: 'audioformat',
        aliases: ['af'],
        category: 'converter',
        execute: async (sock, message, args, context) => {
            const format = args[1]?.toLowerCase() || 'mp3';
            const validFormats = ['mp3', 'wav', 'flac', 'ogg'];

            if (!validFormats.includes(format)) {
                return context.reply(`Available formats: ${validFormats.join(', ')}\nExample: .audioformat mp3`);
            }
            const media = getQuotedMedia(message);
            if (!media || (media.type !== 'video' && media.type !== 'audio')) {
                return context.reply('Reply to a video or audio file');
            }
            try {
                await context.react('🔧');
                const buffer = await downloadMedia(media.msg, media.type);
                const converted = await convertAudioFormat(buffer, media.ext, format);
                await context.replyPlain({
                    document: converted,
                    mimetype: `audio/${format}`,
                    fileName: `converted.${format}`,
                    ...channelInfo
                }, { quoted: message });
            } catch (error) {
                console.error(error);
                context.reply('Failed to convert audio format');
            }
        }
    },
    {
        name: 'extractaudio',
        aliases: ['ea'],
        category: 'converter',
        execute: async (sock, message, args, context) => {
            const media = getQuotedMedia(message);
            if (!media || media.type !== 'video') {
                return context.reply('Reply to a video file');
            }
            try {
                await context.react('🔧');
                const buffer = await downloadMedia(media.msg, media.type);
                const converted = await extractAudio(buffer, media.ext);
                await context.replyPlain({
                    audio: converted,
                    mimetype: 'audio/mpeg',
                    fileName: 'extracted_audio.mp3',
                    ...channelInfo
                }, { quoted: message });
            } catch (error) {
                console.error(error);
                context.reply('Failed to extract audio');
            }
        }
    },
    {
        name: 'hqvideo',
        aliases: ['hqv'],
        category: 'converter',
        execute: async (sock, message, args, context) => {
            const media = getQuotedMedia(message);
            if (!media || media.type !== 'video') {
                return context.reply('Reply to a video file');
            }
            try {
                await context.react('🔧');
                const buffer = await downloadMedia(media.msg, media.type);
                const converted = await toHQVideo(buffer, media.ext);
                await context.replyPlain({
                    video: converted,
                    mimetype: 'video/mp4',
                    caption: 'High Quality Video',
                    ...channelInfo
                }, { quoted: message });
            } catch (error) {
                console.error(error);
                context.reply('Failed to convert to HQ video');
            }
        }
    },
    {
        name: 'compress',
        aliases: ['comp'],
        category: 'converter',
        execute: async (sock, message, args, context) => {
            const quality = parseInt(args[1]) || 28;
            if (quality < 0 || quality > 51) {
                return context.reply('Quality range: 0-51 (lower = better quality)\nExample: .compress 23');
            }
            const media = getQuotedMedia(message);
            if (!media || media.type !== 'video') {
                return context.reply('Reply to a video file');
            }
            try {
                await context.react('🔧');
                const buffer = await downloadMedia(media.msg, media.type);
                const converted = await compressVideo(buffer, media.ext, quality);
                await context.replyPlain({
                    video: converted,
                    mimetype: 'video/mp4',
                    caption: `Compressed (CRF: ${quality})`,
                    ...channelInfo
                }, { quoted: message });
            } catch (error) {
                console.error(error);
                context.reply('Failed to compress video');
            }
        }
    },
    {
        name: 'speed',
        aliases: ['sp'],
        category: 'converter',
        execute: async (sock, message, args, context) => {
            const speed = parseFloat(args[1]) || 1.0;
            if (speed <= 0 || speed > 4) {
                return context.reply('Speed range: 0.1-4.0\nExample: .speed 2.0 (2x faster)\n.speed 0.5 (half speed)');
            }
            const media = getQuotedMedia(message);
            if (!media || media.type !== 'video') {
                return context.reply('Reply to a video file');
            }
            try {
                await context.react('🔧');
                const buffer = await downloadMedia(media.msg, media.type);
                const converted = await changeSpeed(buffer, media.ext, speed);
                await context.replyPlain({
                    video: converted,
                    mimetype: 'video/mp4',
                    caption: `Speed: ${speed}x`,
                    ...channelInfo
                }, { quoted: message });
            } catch (error) {
                console.error(error);
                context.reply('Failed to change video speed');
            }
        }
    },
    {
        name: 'resizevid',
        aliases: ['rv'],
        category: 'converter',
        execute: async (sock, message, args, context) => {
            const width = parseInt(args[1]) || 720;
            const height = parseInt(args[2]) || 720;
            const media = getQuotedMedia(message);
            if (!media || media.type !== 'video') {
                return context.reply('Reply to a video file');
            }
            try {
                await context.react('🔧');
                const buffer = await downloadMedia(media.msg, media.type);
                const converted = await resizeVideo(buffer, media.ext, width, height);
                await context.replyPlain({
                    video: converted,
                    mimetype: 'video/mp4',
                    caption: `Resized: ${width}x${height}`,
                    ...channelInfo
                }, { quoted: message });
            } catch (error) {
                console.error(error);
                context.reply('Failed to resize video');
            }
        }
    },
    {
        name: 'watermark',
        aliases: ['wm'],
        category: 'converter',
        execute: async (sock, message, args, context) => {
            const text = args.slice(1).join(' ') || 'DAVE-MD';
            const position = args[args.length - 1];
            const validPositions = ['topleft', 'topright', 'bottomleft', 'bottomright'];
            const pos = validPositions.includes(position) ? position : 'bottomright';
            const media = getQuotedMedia(message);
            if (!media || media.type !== 'video') {
                return context.reply('Reply to a video file\nExample: .watermark i love DAVE-MD');
            }
            try {
                await context.react('🔧');
                const buffer = await downloadMedia(media.msg, media.type);
                const converted = await addWatermark(buffer, media.ext, text, pos);
                await context.replyPlain({
                    video: converted,
                    mimetype: 'video/mp4',
                    caption: `Watermark: ${text}`,
                    ...channelInfo
                }, { quoted: message });
            } catch (error) {
                console.error(error);
                context.reply('Failed to add watermark');
            }
        }
    },
    {
        name: 'thumbnail',
        aliases: ['thumb'],
        category: 'converter',
        execute: async (sock, message, args, context) => {
            const time = parseInt(args[1]) || 1;
            const media = getQuotedMedia(message);
            if (!media || media.type !== 'video') {
                return context.reply('Reply to a video file\nExample: .thumbnail 5 (5 seconds)');
            }
            try {
                await context.react('🔧');
                const buffer = await downloadMedia(media.msg, media.type);
                const converted = await createThumbnail(buffer, media.ext, time);
                await context.replyPlain({
                    image: converted,
                    caption: `Thumbnail at ${time}s`,
                    ...channelInfo
                }, { quoted: message });
            } catch (error) {
                console.error(error);
                context.reply('Failed to create thumbnail');
            }
        }
    },
    {
        name: 'imgformat',
        aliases: ['if'],
        category: 'converter',
        execute: async (sock, message, args, context) => {
            const format = args[1]?.toLowerCase() || 'jpg';
            const validFormats = ['jpg', 'png', 'webp'];

            if (!validFormats.includes(format)) {
                return context.reply(`Available formats: ${validFormats.join(', ')}\nExample: .imgformat png`);
            }
            const media = getQuotedMedia(message);
            if (!media || media.type !== 'image') {
                return context.reply('Reply to an image');
            }
            try {
                await context.react('🔧');
                const buffer = await downloadMedia(media.msg, media.type);
                const converted = await convertImage(buffer, media.ext, format);
                await context.replyPlain({
                    image: converted,
                    caption: `Converted to ${format.toUpperCase()}`,
                    ...channelInfo
                }, { quoted: message });
            } catch (error) {
                console.error(error);
                context.reply('Failed to convert image format');
            }
        }
    },
    {
        name: 'resizeimg',
        aliases: ['ri'],
        category: 'converter',
        execute: async (sock, message, args, context) => {
            const width = parseInt(args[1]) || 512;
            const height = parseInt(args[2]) || 512;
            const media = getQuotedMedia(message);
            if (!media || media.type !== 'image') {
                return context.reply('Reply to an image\nExample: .resizeimg 512 512');
            }
            try {
                await context.react('🔧');
                const buffer = await downloadMedia(media.msg, media.type);
                const converted = await resizeImage(buffer, media.ext, width, height);
                await context.reply({
                    image: converted,
                    caption: `Resized: ${width}x${height}`,
                    ...channelInfo
                }, { quoted: message });
            } catch (error) {
                console.error(error);
                context.reply('Failed to resize image');
            }
        }
    },
    {
        name: 'sticker',
        aliases: ['s'],
        category: 'converter',
        execute: async (sock, message, args, context) => {
            const media = getQuotedMedia(message);
            if (!media || (media.type !== 'image' && media.type !== 'video')) {
                return context.reply('Reply to an image or video', {quoted: global.sticker});
            }
            try {
                await context.react('🔧');
                const buffer = await downloadMedia(media.msg, media.type);

                let converted;
                if (media.type === 'video') {
                    converted = await toAnimatedWebP(buffer, media.ext);
                } else {
                    converted = await toWebP(buffer, media.ext);
                }
                await context.reply({
                    sticker: converted,
                    ...channelInfo
                }, {quoted: global.sticker});
            } catch (error) {
                console.error(error);
                context.reply('Failed to create sticker');
            }
        }
    },
    {
        name: 'togif',
        aliases: ['gif'],
        category: 'converter',
        execute: async (sock, message, args, context) => {
            const fps = parseInt(args[1]) || 10;
            const scale = args[2] || '320:-1';
            const media = getQuotedMedia(message);
            if (!media || media.type !== 'video') {
                return context.reply('Reply to a video file\nExample: .togif 15 480:-1');
            }
            try {
                await context.react('🔧');
                const buffer = await downloadMedia(media.msg, media.type);
                const converted = await toGIF(buffer, media.ext, fps, scale);
                await sock.sendMessage(context.chatId, {
                    document: converted,
                    mimetype: 'image/gif',
                    fileName: 'converted.gif',
                    ...channelInfo
                }, { quoted: message });
            } catch (error) {
                console.error(error);
                context.reply('Failed to convert to GIF');
            }
        }
    },
    {
        name: 'mediainfo',
        aliases: ['info'],
        category: 'converter',
        execute: async (sock, message, args, context) => {
            const media = getQuotedMedia(message);
            if (!media) {
                return context.reply('Reply to a media file');
            }
            try {
                await context.react('🔍');
                const buffer = await downloadMedia(media.msg, media.type);
                const info = await getMediaInfo(buffer, media.ext);
                let infoText = 'Media Information:\n\n';

                if (info.format) {
                    infoText += `Format: ${info.format.format_name}\n`;
                    infoText += `Duration: ${parseFloat(info.format.duration).toFixed(2)}s\n`;
                    infoText += `Size: ${(parseInt(info.format.size) / 1024 / 1024).toFixed(2)} MB\n`;
                    infoText += `Bitrate: ${Math.round(parseInt(info.format.bit_rate) / 1000)} kbps\n\n`;
                }

                info.streams.forEach((stream, i) => {
                    infoText += `Stream ${i + 1}:\n`;
                    infoText += `Type: ${stream.codec_type}\n`;
                    infoText += `Codec: ${stream.codec_name}\n`;

                    if (stream.codec_type === 'video') {
                        infoText += `Resolution: ${stream.width}x${stream.height}\n`;
                        infoText += `FPS: ${eval(stream.r_frame_rate).toFixed(2)}\n`;
                    }

                    if (stream.codec_type === 'audio') {
                        infoText += `Sample Rate: ${stream.sample_rate} Hz\n`;
                        infoText += `Channels: ${stream.channels}\n`;
                    }

                    infoText += '\n';
                });

                context.reply(infoText, { quoted: global.MediaInfo});
            } catch (error) {
                console.error(error);
                context.reply('Failed to get media info');
            }
        }
    },
    {
        name: 'emojimix',
        aliases: ['mix', 'emojiblend'],
        category: 'converter',
        description: 'Mix two emojis together',
        usage: '.emojimix 😎+🥰',
        execute: async (sock, message, args, context) => {
            const { reply, react } = context;
            if (!args[1]) {
                return await reply('Example: .emojimix 😎+🥰');
            }
            if (!args[1].includes('+')) {
                return await reply('Separate the emoji with a + sign\n\nExample: .emojimix 😎+🥰');
            }
            
            await react('🎨');
            
            try {
                let [emoji1, emoji2] = args[1].split('+').map(e => e.trim());
                const url = `https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}`;
                
                const response = await fetch(url);
                const data = await response.json();
                
                if (!data.results || data.results.length === 0) {
                    return await reply('These emojis cannot be mixed. Try different ones.');
                }

                const imageUrl = data.results[0].url;
                const tmpDir = path.join(process.cwd(), 'tmp');
                
                if (!fs.existsSync(tmpDir)) {
                    fs.mkdirSync(tmpDir, { recursive: true });
                }

                const tempFile = path.join(tmpDir, `temp_${Date.now()}.png`).replace(/\\/g, '/');
                const outputFile = path.join(tmpDir, `sticker_${Date.now()}.webp`).replace(/\\/g, '/');
                
                const imageResponse = await fetch(imageUrl);
                const buffer = await imageResponse.buffer();
                fs.writeFileSync(tempFile, buffer);

                const ffmpegCommand = `ffmpeg -i "${tempFile}" -vf "scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" "${outputFile}"`;

                await new Promise((resolve, reject) => {
                    exec(ffmpegCommand, (error) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve();
                        }
                    });
                });

                if (!fs.existsSync(outputFile)) {
                    throw new Error('Failed to create sticker file');
                }

                const stickerBuffer = fs.readFileSync(outputFile);
                await sock.sendMessage(context.chatId, { 
                    sticker: stickerBuffer 
                }, { quoted: global.emojimix});
                
                await react('✅');

                try {
                    fs.unlinkSync(tempFile);
                    fs.unlinkSync(outputFile);
                } catch (err) {
                    // Silent cleanup
                }

            } catch (error) {
                await react('❌');
                await reply('Failed to mix emojis. Make sure you are using valid emojis.\n\nExample: .emojimix 😎+🥰', { quoted: global.emojimix});
            }
        }
    }
];