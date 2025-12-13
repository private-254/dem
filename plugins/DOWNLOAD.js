import { fetchJson, isUrl } from '../lib/myfunc.js';
import { ttdl, igdl } from "ruhend-scraper";
import axios from 'axios';
import { channelInfo } from '../lib/messageConfig.js';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import yts from 'yt-search';
import settings from '../settings.js';
const processedMessages = new Set();
export default [
  {
    name: 'apk',
    aliases: ['apkdl'],
    category: 'SETTINGS MENU',
    execute: async (sock, message, args, context) => {
      const text = args.slice(1).join(' ');
      if (!text) return context.reply("Which apk do you want to download?", { quoted: global.apk });

      try {
        let apiUrl = await fetchJson(`https://api.bk9.dev/search/apk?q=${text}`);
        let tylor = await fetchJson(`https://api.bk9.dev/download/apk?id=${apiUrl.BK9[0].id}`);
        await sock.sendMessage(
          context.chatId,
          {
            document: { url: tylor.BK9.dllink },
            fileName: tylor.BK9.name,
            mimetype: "application/vnd.android.package-archive",
            contextInfo: {
              externalAdReply: {
                title: global.botName || "Knight Bot",
                body: `${tylor.BK9.name}`,
                thumbnailUrl: `${tylor.BK9.icon}`,
                sourceUrl: `${tylor.BK9.dllink}`,
                mediaType: 2,
                showAdAttribution: true,
                renderLargerThumbnail: false
              }
            }
          }, { quoted: global.apk }
        );
      } catch (error) {
        context.reply("Error downloading APK. Please try again later.", { quoted: global.apk });
      }
    }
  },

{
name: "spotify",
aliases: ["spotifydl", "sp"],
category: "downloader",
desc: "Download songs from Spotify",
usage: ".spotify <song/artist> or .spotify <spotify-url>",

execute: async (sock, m, args, context) => {  
    const { chatId, reply, react } = context;  
    const text = args.slice(1).join(' ').trim();  

    try {  
        if (!text) {  
            return await reply('Usage: .spotify <song/artist/keywords or Spotify URL>\n\nExample: .spotify Faded\nExample: .spotify https://open.spotify.com/track/...');  
        }  

        // Check if input is a Spotify URL  
        const isSpotifyUrl = text.includes('open.spotify.com/track/');  

        let audioUrl, trackInfo;  

        if (isSpotifyUrl) {  
            // Direct Spotify URL  
            await react('🎼');  
            const apiUrl = `https://casper-tech-apis.vercel.app/api/downloader/sportify?url=${encodeURIComponent(text)}`;  
            const { data } = await axios.get(apiUrl, {   
                timeout: 20000,   
                headers: { 'user-agent': 'Mozilla/5.0' }   
            });  

            if (!data?.success || !data?.track) {  
                throw new Error('No result from Spotify downloader');  
            }  

            const track = data.track;  
            audioUrl = track.audio?.url;  
            trackInfo = {  
                title: track.title || 'Unknown Title',  
                artist: track.artist || 'Unknown Artist',  
                duration: track.duration || '',  
                thumbnail: track.thumbnail || track.album?.cover,  
                spotifyUrl: track.spotify_url || text  
            };  

        } else {  
            // Search query  
            await react('🔍');  
            const apiUrl = `https://casper-tech-apis.vercel.app/api/play/sportify?q=${encodeURIComponent(text)}`;  
            const { data } = await axios.get(apiUrl, {   
                timeout: 20000,   
                headers: { 'user-agent': 'Mozilla/5.0' }   
            });  

            if (!data?.success || !data?.results || data.results.length === 0) {  
                throw new Error('No results found');  
            }  

            // Get first result  
            const result = data.results[0];  
            audioUrl = result.download_url;  
            trackInfo = {  
                title: result.title || result.name || 'Unknown Title',  
                artist: result.artists?.join(', ') || result.artist || 'Unknown Artist',  
                duration: result.duration?.formatted || '',  
                thumbnail: result.thumbnail || result.album?.cover,  
                spotifyUrl: result.spotify_url,  
                album: result.album?.name,  
                popularity: result.popularity  
            };  
        }  

        if (!audioUrl) {  
            await react('❌');  
            return await reply('No downloadable audio found.');  
        }  

        // Build caption  
        let caption = `Spotify Download\n\n`;  
        caption += `Title: ${trackInfo.title}\n`;  
        caption += `Artist: ${trackInfo.artist}\n`;  
        if (trackInfo.album) caption += `Album: ${trackInfo.album}\n`;  
        if (trackInfo.duration) caption += `Duration: ${trackInfo.duration}\n`;  
        if (trackInfo.popularity) caption += `Popularity: ${trackInfo.popularity}%\n`;  
        if (trackInfo.spotifyUrl) caption += `\nLink: ${trackInfo.spotifyUrl}`;  

        // Send thumbnail with caption  
        if (trackInfo.thumbnail) {  
            await sock.sendMessage(chatId, {   
                image: { url: trackInfo.thumbnail },   
                caption: caption  
            }, { quoted: m });  
        } else {  
            await reply(caption);  
        }  

        // Send audio file  
        const cleanTitle = (trackInfo.title || 'song').replace(/[\\/:*?"<>|]/g, '');  
        await sock.sendMessage(chatId, {  
            audio: { url: audioUrl },  
            mimetype: 'audio/mpeg',  
            fileName: `${cleanTitle.substring(0, 50)}.mp3`  
        }, { quoted: m });  

        await react('🪩');  

    } catch (error) {  
        console.error('[SPOTIFY] error:', error.message);  
        await react('❌');  

        if (error.message.includes('timeout')) {  
            await reply('Request timeout. Try again or use a different search.');  
        } else if (error.message.includes('No results')) {  
            await reply('No results found. Try different keywords or a direct Spotify URL.');  
        } else {  
            await reply(`Failed to fetch Spotify: ${error.message}`);  
        }  
    }  
}

},

{
name: "shazam",
aliases: ["identify", "whatsong", "findsong"],
category: "SEARCH MENU",
desc: "Identify songs from audio/video messages",
usage: ".shazam (reply to audio/video)",

execute: async (sock, m, args, context) => {  
    const { chatId, reply, react } = context;  

    try {  
        await react('🔍');  

        // Helper function to get media from message  
        async function getMediaBuffer(msg, type) {  
            try {  
                let messageType, downloadType;  

                switch (type) {  
                    case 'audio':  
                        if (msg.audioMessage) {  
                            messageType = msg.audioMessage;  
                            downloadType = 'audio';  
                        } else if (msg.voiceMessage) {  
                            messageType = msg.voiceMessage;  
                            downloadType = 'audio';  
                        }  
                        break;  
                    case 'video':  
                        if (msg.videoMessage) {  
                            messageType = msg.videoMessage;  
                            downloadType = 'video';  
                        }  
                        break;  
                    case 'image':  
                        if (msg.imageMessage) {  
                            messageType = msg.imageMessage;  
                            downloadType = 'image';  
                        }  
                        break;  
                }  

                if (messageType) {  
                    const stream = await downloadContentFromMessage(messageType, downloadType);  
                    let buffer = Buffer.from([]);  
                    for await (const chunk of stream) {  
                        buffer = Buffer.concat([buffer, chunk]);  
                    }  
                    return { buffer, type };  
                }  
                return null;  
            } catch (error) {  
                console.error(`[SHAZAM] ${type} error:`, error.message);  
                return null;  
            }  
        }  

        // Check current message  
        let media = null;  

        // Check current message first  
        if (m.message?.audioMessage || m.message?.voiceMessage) {  
            media = await getMediaBuffer(m.message, 'audio');  
        } else if (m.message?.videoMessage) {  
            media = await getMediaBuffer(m.message, 'video');  
        } else if (m.message?.imageMessage) {  
            media = await getMediaBuffer(m.message, 'image');  
        }  

        // Check quoted message if no media found  
        if (!media) {  
            const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;  
            if (quoted) {  
                if (quoted.audioMessage || quoted.voiceMessage) {  
                    media = await getMediaBuffer(quoted, 'audio');  
                } else if (quoted.videoMessage) {  
                    media = await getMediaBuffer(quoted, 'video');  
                } else if (quoted.imageMessage) {  
                    media = await getMediaBuffer(quoted, 'image');  
                }  
            }  
        }  

        if (!media) {  
            return await reply('Reply to an audio, video, or voice message to identify the song!');  
        }  

        await reply('Processing audio...');  

        // Create temp file  
        const tempDir = path.join(process.cwd(), 'temp');  
        if (!fs.existsSync(tempDir)) {  
            fs.mkdirSync(tempDir, { recursive: true });  
        }  

        const tempPath = path.join(tempDir, `shazam_${Date.now()}.${media.type === 'audio' ? 'mp3' : 'mp4'}`);  
        fs.writeFileSync(tempPath, media.buffer);  

        try {  
            // Try multiple Shazam APIs  
            const apis = [  
                `https://apiskeith.vercel.app/ai/shazam?audio=${encodeURIComponent(media.buffer.toString('base64'))}`,  
                `https://api.akuari.my.id/downloader/sha`,  
                `https://api.neoxr.eu.org/api/shazam`  
            ];  

            let songData = null;  
            let apiUsed = '';  

            for (const apiUrl of apis) {  
                try {  
                    let response;  

                    if (apiUrl.includes('apiskeith')) {  
                        response = await axios.get(apiUrl, { timeout: 15000 });  
                    } else {  
                        const form = new FormData();  
                        const blob = new Blob([media.buffer], { type: media.type === 'audio' ? 'audio/mpeg' : 'video/mp4' });  
                        form.append('audio', blob, 'audio.mp3');  

                        response = await axios.post(apiUrl, form, {  
                            headers: form.getHeaders(),  
                            timeout: 15000  
                        });  
                    }  

                    if (response.data && response.data.result) {  
                        songData = response.data.result;  
                        apiUsed = new URL(apiUrl).hostname;  
                        break;  
                    }  
                } catch (apiError) {  
                    console.log(`[SHAZAM] API failed: ${apiUrl}`, apiError.message);  
                    continue;  
                }  
            }  

            if (!songData) {  
                throw new Error('Could not identify song');  
            }  

            // Build result message  
            let result = `🎶 Song Identified\n\n`;  
            result += `Title: ${songData.title || songData.song || 'Unknown'}\n`;  
            result += `Artist: ${songData.artist || songData.singer || 'Unknown'}\n`;  

            if (songData.album) result += `Album: ${songData.album}\n`;  
            if (songData.releaseDate) result += `Released: ${songData.releaseDate}\n`;  
            if (songData.genre) result += `Genre: ${songData.genre}\n`;  
            if (songData.duration) result += `Duration: ${songData.duration}\n`;  

            if (songData.lyrics) {  
                result += `\nLyrics Preview:\n${songData.lyrics.substring(0, 200)}...\n`;  
            }  

            if (songData.spotifyUrl) result += `\nSpotify: ${songData.spotifyUrl}\n`;  
            if (songData.youtubeUrl) result += `YouTube: ${songData.youtubeUrl}\n`;  
            if (songData.appleMusicUrl) result += `Apple Music: ${songData.appleMusicUrl}\n`;  

            result += `\nIdentified using: ${apiUsed}`;  

            await reply(result);  
            await react('✅');  

        } catch (error) {  
            console.error('[SHAZAM] Identification error:', error.message);  
            await react('❌');  

            if (error.message.includes('timeout')) {  
                await reply('Request timeout. Audio might be too long.');  
            } else if (error.message.includes('Could not identify')) {  
                await reply('Could not recognize the song. Try with clearer audio.');  
            } else {  
                await reply('Failed to identify song. Please try again.');  
            }  
        } finally {  
            // Cleanup temp file  
            try {  
                if (fs.existsSync(tempPath)) {  
                    fs.unlinkSync(tempPath);  
                }  
            } catch (cleanupError) {  
                console.error('[SHAZAM] Cleanup error:', cleanupError.message);  
            }  
        }  

    } catch (error) {  
        console.error('[SHAZAM] Command error:', error.message);  
        await react('❌');  
        await reply('Failed to process song identification.');  
    }  
}

},

  {
    name: "playdoc",
    aliases: ["pdoc", "songdoc"],
    category: "downloader",
    desc: "Download and send YouTube audio as document",

    async execute(sock, msg, args, context) {
      const { reply, react } = context;
      const from = msg.key.remoteJid;
      const text = args.slice(1).join(" ").trim();

      try {
        await react('📄');

        if (!text) {
          return reply(`Provide a song name!\n\nExample: .playdoc Not Like Us`);
        }

        const tempDir = path.join(process.cwd(), "temp");
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

        if (text.length > 100) {
          return reply('Song name too long! Maximum 100 characters.');
        }

        await reply("Searching for the track...");

        const searchResult = (await yts(`${text} official`)).videos[0];
        if (!searchResult) {
          return reply("Couldn't find that song. Try another one!");
        }

        const video = searchResult;
        const apiUrl = `https://api.privatezia.biz.id/api/downloader/ytmp3?url=${encodeURIComponent(video.url)}`;
        const response = await axios.get(apiUrl);
        const apiData = response.data;

        if (!apiData.status || !apiData.result || !apiData.result.downloadUrl) {
          throw new Error("API failed to fetch track!");
        }

        const timestamp = Date.now();
        const fileName = `audio_${timestamp}.mp3`;
        const filePath = path.join(tempDir, fileName);

        const audioResponse = await axios({
          method: "get",
          url: apiData.result.downloadUrl,
          responseType: "stream",
          timeout: 600000
        });

        const writer = fs.createWriteStream(filePath);
        audioResponse.data.pipe(writer);

        await new Promise((resolve, reject) => {
          writer.on("finish", resolve);
          writer.on("error", reject);
        });

        if (!fs.existsSync(filePath) || fs.statSync(filePath).size === 0) {
          throw new Error("Download failed or empty file!");
        }

        const songTitle = apiData.result.title || video.title;

        await reply(`Downloaded: ${songTitle}`);

        await sock.sendMessage(
          from,
          {
            document: { url: filePath },
            mimetype: "audio/mpeg",
            fileName: `${songTitle.substring(0, 100).replace(/[^\w\s.-]/gi, '')}.mp3`
          },
          { quoted: msg }
        );

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }

        await react('✅');

      } catch (error) {
        console.error("Playdoc command error:", error);
        await react('❌');

        let errorMessage = 'Download failed!';
        if (error.message.includes('timeout')) {
          errorMessage = 'Request timeout. Try again.';
        } else if (error.message.includes('ENOTFOUND')) {
          errorMessage = 'Network error. Check connection.';
        }

        return reply(`${errorMessage}\nError: ${error.message}`);
      }
    }
  },

  {
    name: "yts",
    aliases: ["ytsearch"],
    category: "SEARCH MENU",
    desc: "Search YouTube videos",

    async execute(sock, msg, args, context) {
      const { reply } = context;
      const text = args.slice(1).join(" ").trim();

      if (!text) {
        return reply(`Example : .yts faded`);
      }

      try {
        const yts = require("yt-search");
        const search = await yts(text);

        if (!search.all || search.all.length === 0) {
          return reply(`No results found for "${text}"`);
        }

        let teks = `YouTube Search\n\nResults for: ${text}\n\n`;
        let no = 1;

        for (let i of search.all.slice(0, 10)) {
          teks += `No: ${no++}\n`;
          teks += `Type: ${i.type}\n`;
          teks += `Title: ${i.title}\n`;
          teks += `Views: ${i.views}\n`;
          teks += `Duration: ${i.timestamp}\n`;
          teks += `Uploaded: ${i.ago}\n`;
          teks += `URL: ${i.url}\n`;
          teks += `─────────────────\n\n`;
        }

        await sock.sendMessage(msg.key.remoteJid, {
          image: { url: search.all[0].thumbnail },
          caption: teks
        }, { quoted: msg });

      } catch (error) {
        console.error('YouTube search error:', error);
        reply('Error searching YouTube videos.');
      }
    }
  },

  {
    name: "shorturl",
    aliases: ["shorten", "urlshort"],
    category: "TOOLS MENU",
    desc: "Shorten long URLs",

    async execute(sock, msg, args, context) {
      const { reply } = context;
      const text = args.slice(1).join(" ").trim();

      if (!text) {
        return reply('Please provide a URL to shorten.\n\nExample: .shorturl https://example.com');
      }

      try {
        if (!text.startsWith('http://') && !text.startsWith('https://')) {
          return reply('Please provide a valid URL starting with http:// or https://');
        }

        const zlib = require('zlib');
        const qs = require('querystring');

        const kualatshort = async (url) => {
          const res = await axios.post(
            'https://kua.lat/shorten',
            qs.stringify({ url }),
            {
              responseType: 'arraybuffer',
              headers: {
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'id-ID,id;q=0.9,en-AU;q=0.8,en;q=0.7,en-US;q=0.6',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Origin': 'https://kua.lat',
                'Referer': 'https://kua.lat/',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
                'X-Requested-With': 'XMLHttpRequest'
              }
            }
          );

          let decoded;
          const encoding = res.headers['content-encoding'];

          if (encoding === 'br') {
            decoded = zlib.brotliDecompressSync(res.data);
          } else if (encoding === 'gzip') {
            decoded = zlib.gunzipSync(res.data);
          } else if (encoding === 'deflate') {
            decoded = zlib.inflateSync(res.data);
          } else {
            decoded = res.data;
          }

          return JSON.parse(decoded.toString());
        };

        const result = await kualatshort(text);

        if (!result?.data?.shorturl) {
          return reply('Failed to create short URL. Please try again.');
        }

        await reply(`Short URL Created\n\nOriginal: ${text}\nShortened: ${result.data.shorturl}\n\nURL shortened successfully!`);

      } catch (error) {
        console.error('[SHORTURL] Error:', error);
        reply(`Error: ${error.message || 'Failed to shorten URL'}`);
      }
    }
  },

  {
name: "video",
aliases: ["ytvideo", "ytvid"],
category: "downloader",
desc: "Download YouTube videos in MP4 format",
usage: ".video <search term or YouTube URL>",

execute: async (sock, m, args, context) => {  
    const { chatId, reply, react, rawText } = context;  

    try {  
        if (!rawText.split(' ').slice(1).join(' ').trim()) {  
            return await reply('What video do you want to download?\n\nExample: .video <search term or YouTube URL>');  
        }  

        await react('🎬');  

        const searchQuery = rawText.split(' ').slice(1).join(' ').trim();  

        // Izumi API configuration  
        const izumi = {  
            baseURL: "https://izumiiiiiiii.dpdns.org"  
        };  

        const AXIOS_DEFAULTS = {  
            timeout: 60000,  
            headers: {  
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',  
                'Accept': 'application/json, text/plain, */*'  
            }  
        };  

        const tryRequest = async (getter, attempts = 3) => {  
            let lastError;  
            for (let attempt = 1; attempt <= attempts; attempt++) {  
                try {  
                    return await getter();  
                } catch (err) {  
                    lastError = err;  
                    if (attempt < attempts) {  
                        await new Promise(r => setTimeout(r, 1000 * attempt));  
                    }  
                }  
            }  
            throw lastError;  
        };  

        const getIzumiVideoByUrl = async (youtubeUrl) => {  
            const apiUrl = `${izumi.baseURL}/downloader/youtube?url=${encodeURIComponent(youtubeUrl)}&format=720`;  
            const res = await tryRequest(() => axios.get(apiUrl, AXIOS_DEFAULTS));  
            if (res?.data?.result?.download) return res.data.result;  
            throw new Error('Izumi video API returned no download');  
        };  

        const getOkatsuVideoByUrl = async (youtubeUrl) => {  
            const apiUrl = `https://okatsu-rolezapiiz.vercel.app/downloader/ytmp4?url=${encodeURIComponent(youtubeUrl)}`;  
            const res = await tryRequest(() => axios.get(apiUrl, AXIOS_DEFAULTS));  
            if (res?.data?.result?.mp4) {  
                return {  
                    download: res.data.result.mp4,  
                    title: res.data.result.title  
                };  
            }  
            throw new Error('Okatsu API returned no mp4');  
        };  

        let videoUrl = '';  
        let videoTitle = '';  
        let videoThumbnail = '';  

        if (searchQuery.startsWith('http://') || searchQuery.startsWith('https://')) {  
            videoUrl = searchQuery;  
        } else {  
            const { videos } = await yts(searchQuery);  
            if (!videos || videos.length === 0) {  
                return await reply('No videos found!');  
            }  

            videoUrl = videos[0].url;  
            videoTitle = videos[0].title;  
            videoThumbnail = videos[0].thumbnail;  
        }  

        const youtubeRegex = /(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch\?v=|v\/|embed\/|shorts\/|playlist\?list=)?)([a-zA-Z0-9_-]{11})/gi;  
        const urls = videoUrl.match(youtubeRegex);  
        if (!urls) {  
            return await reply('This is not a valid YouTube link!');  
        }  

        const ytId = (videoUrl.match(/(?:youtu\.be\/|v=)([a-zA-Z0-9_-]{11})/) || [])[1];  
        const thumb = videoThumbnail || (ytId ? `https://i.ytimg.com/vi/${ytId}/sddefault.jpg` : undefined);  
        const captionTitle = videoTitle || searchQuery;  

        if (thumb) {  
            await sock.sendMessage(chatId, {  
                image: { url: thumb },  
                caption: `${captionTitle}\n\nSearching video data...`  
            }, { quoted: m });  
        }  

        let videoData;  
        try {  
            videoData = await getIzumiVideoByUrl(videoUrl);  
        } catch (e1) {  
            console.warn('[VIDEO] Izumi failed, trying Okatsu:', e1?.message || e1);  
            videoData = await getOkatsuVideoByUrl(videoUrl);  
        }  

        await sock.sendMessage(chatId, {  
            video: { url: videoData.download },  
            mimetype: 'video/mp4',  
            fileName: `${videoData.title || videoTitle || 'video'}.mp4`.replace(/[^\w\s.-]/gi, ''),  
            caption: `${videoData.title || videoTitle || 'Video'}\n\n⬇️ DOWNLOAD BY DAVE MD`  
        }, { quoted: m });  

        await react('✅');  

    } catch (error) {  
        console.error('[VIDEO] Command Error:', error?.message || error);  
        await react('❌');  
        await reply('Download failed: ' + (error?.message || 'Unknown error'));  
    }  
}

},


  {
    name: 'gdrive',
    category: 'downloader',
    execute: async (sock, message, args, context) => {
      const text = args.slice(1).join(' ');
      if (!text) return context.reply("Please provide a Google Drive file URL", { quoted: global.gdrive });
      try {
        let response = await fetch(`https://api.siputzx.my.id/api/d/gdrive?url=${encodeURIComponent(text)}`);
        let data = await response.json();
        if (response.status !== 200 || !data.status || !data.data) {
          return context.reply("Please try again later or try another command!", { quoted: global.gdrive });
        } else {
          const downloadUrl = data.data.download;
          const filePath = path.join(__dirname, `${data.data.name}`);
          const writer = fs.createWriteStream(filePath);
          const fileResponse = await axios({
            url: downloadUrl,
            method: 'GET',
            responseType: 'stream'
          });
          fileResponse.data.pipe(writer);
          writer.on('finish', async () => {
            await sock.sendMessage(context.chatId, {
              document: { url: filePath },
              fileName: data.data.name,
              mimetype: fileResponse.headers['content-type']
            }, { quoted: global.gdrive });
            fs.unlinkSync(filePath);
          });
          writer.on('error', (err) => {
            console.error('Error downloading the file:', err);
            context.reply("An error occurred while downloading the file.", { quoted: global.gdrive });
          });
        }
      } catch (error) {
        console.error('Error fetching Google Drive file details:', error);
        context.reply("Error downloading Google Drive file. Please try again later.");
      }
    }
  },

  {
    name: 'gitclone',
    category: 'downloader',
    execute: async (sock, message, args, context) => {
      const text = args.slice(1).join(' ');
      if (!text)
        return context.reply(`GitHub link to clone?\nExample :\n${global.prefix}gitclone https://github.com/Dark-Xploit/CypherX`, { quoted: global.gitclone });

      if (!isUrl(text))
        return context.reply("Link invalid! Please provide a valid URL.");
      const regex1 = /(?:https|git)(?::\/\/|@)(www\.)?github\.com[\/:]([^\/:]+)\/(.+)/i;
      const [, , user, repo] = text.match(regex1) || [];

      if (!repo) {
        return context.reply("Invalid GitHub link format. Please double-check the provided link.");
      }

      const repoName = repo.replace(/.git$/, "");
      const url = `https://api.github.com/repos/${user}/${repoName}/zipball`;

      try {
        const response = await fetch(url, { method: "HEAD" });
        const filename = response.headers
          .get("content-disposition")
          .match(/attachment; filename=(.*)/)[1];

        await sock.sendMessage(
          context.chatId,
          {
            document: { url: url },
            fileName: filename + ".zip",
            mimetype: "application/zip",
          }, { quoted: global.gitclone }
        );
      } catch (err) {
        console.error(err);
        context.reply("Error cloning repository. Please try again later.");
      }
    }
  },

  {
    name: 'image',
    aliases: ['img', 'pinterest'],
    category: 'downloader',
    execute: async (sock, message, args, context) => {
      const text = args.slice(1).join(' ');
      if (!text) return context.reply("Please provide a search query");
      try {
        let response = await fetch(`https://api.vreden.my.id/api/pinterest?query=${encodeURIComponent(text)}`);
        let data = await response.json();
        if (response.status !== 200 || !data.result || data.result.length === 0) {
          return context.reply("No images found or API error. Please try again later or try another query!");
        } else {
          const images = data.result.slice(0, 5);
          for (const imageUrl of images) {
            await sock.sendMessage(context.chatId, {
              image: { url: imageUrl },
              caption: `Search: ${text}`,
            });
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      } catch (error) {
        console.error('Error fetching images:', error);
        context.reply("Error fetching images. Please try again later.");
      }
    }
  },

  {
    name: "itunes",
    category: 'downloader',
    execute: async (sock, message, args, context) => {
      const text = args.slice(1).join(' ');
      if (!text) return context.reply("Please provide a song name");

      try {
        let res = await fetch(`https://api.popcat.xyz/itunes?q=${encodeURIComponent(text)}`);
        if (!res.ok) {
          throw new Error(`API request failed with status ${res.status}`);
        }
        let json = await res.json();
        let songInfo = `Song Information:\n\n Name: ${json.name}\n\n Artist: ${json.artist}\n\n Album: ${json.album}\n\n Release Date: ${json.release_date}\n\n Price: ${json.price}\n\n Length: ${json.length}\n\n Genre: ${json.genre}\n\n URL: ${json.url}`;

        if (json.thumbnail) {
          await sock.sendMessage(
            context.chatId,
            { image: { url: json.thumbnail }, caption: songInfo },
            { quoted: message }
          );
        } else {
          context.reply(songInfo);
        }
      } catch (error) {
        console.error(error);
        context.reply("Error fetching iTunes info. Please try again later.");
      }
    }
  },

  {
    name: 'mediafire',
    category: 'downloader',
    execute: async (sock, message, args, context) => {
      const text = args.slice(1).join(' ');
      if (!text) return context.reply("Please provide a MediaFire file URL");
      try {
        let response = await fetch(`https://api.siputzx.my.id/api/d/mediafire?url=${encodeURIComponent(text)}`);
        let data = await response.json();
        if (response.status !== 200 || !data.status || !data.data) {
          return context.reply("Please try again later or try another command!");
        } else {
          const downloadUrl = data.data.downloadLink;
          const filePath = path.join(__dirname, `${data.data.fileName}.zip`);
          const writer = fs.createWriteStream(filePath);
          const fileResponse = await axios({
            url: downloadUrl,
            method: 'GET',
            responseType: 'stream'
          });
          fileResponse.data.pipe(writer);
          writer.on('finish', async () => {
            await sock.sendMessage(context.chatId, {
              document: { url: filePath },
              fileName: data.data.fileName,
              mimetype: 'application/zip'
            });
            fs.unlinkSync(filePath);
          });
          writer.on('error', (err) => {
            console.error('Error downloading the file:', err);
            context.reply("An error occurred while downloading the file.");
          });
        }
      } catch (error) {
        console.error('Error fetching MediaFire file details:', error);
        context.reply("Error downloading MediaFire file. Please try again later.");
      }
    }
  },

  {
    name: "song",
    aliases: ["mp3"],
    category: "downloader",
    desc: "Download audio using link or name",

    async execute(sock, msg, args, context) {
      await context.react("🎵");

      const text = args.join(" ");
      if (!text) return context.reply("Provide a song name or YouTube link.");

      try {
        let videoUrl = text;

        if (!text.startsWith("http")) {
          const searchResult = await yts(text);
          if (!searchResult.videos.length) return context.reply("No results found.");
          videoUrl = searchResult.videos[0].url;
        }

        const apiUrl = `https://apiskeith.vercel.app/download/audio?url=${encodeURIComponent(videoUrl)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.status || !data.result)
          return context.reply("Failed to get download URL.");

        const audioUrl = data.result;

        await sock.sendMessage(
          msg.key.remoteJid,
          {
            audio: { url: audioUrl },
            mimetype: "audio/mpeg",
            fileName: "song.mp3"
          },
          { quoted: msg }
        );

      } catch (error) {
        console.error(error);
        context.reply("Error downloading audio.");
      }
    }
  },

  {
    name: "play",
    aliases: ["p"],
    category: "downloader",
    desc: "Download and send audio from YouTube",

    async execute(sock, msg, args, context) {
      await context.react("🎵");

      const from = msg.key.remoteJid;
      const text = args.join(" ").trim();

      if (!text) {
        return context.reply("Provide a song name.\nExample: .play Not Like Us");
      }

      try {
        const tempDir = path.join(process.cwd(), "temp");
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

        if (text.length > 100) return context.reply("Song name too long. Maximum 100 characters.");

        await context.reply("Searching for the track...");

        const searchResult = (await yts(`${text} official`)).videos[0];
        if (!searchResult) return context.reply("Couldn't find that song.");

        const video = searchResult;
        const apiUrl = "https://api.privatezia.biz.id/api/downloader/ytmp3?url=" + encodeURIComponent(video.url);
        const response = await axios.get(apiUrl);
        const apiData = response.data;

        if (!apiData.status || !apiData.result || !apiData.result.downloadUrl)
          throw new Error("API failed to fetch track.");

        const timestamp = Date.now();
        const fileName = "audio_" + timestamp + ".mp3";
        const filePath = path.join(tempDir, fileName);

        const audioResponse = await axios({
          method: "get",
          url: apiData.result.downloadUrl,
          responseType: "stream",
          timeout: 600000
        });

        const writer = fs.createWriteStream(filePath);
        audioResponse.data.pipe(writer);

        await new Promise((resolve, reject) => {
          writer.on("finish", resolve);
          writer.on("error", reject);
        });

        if (!fs.existsSync(filePath) || fs.statSync(filePath).size === 0)
          throw new Error("Download failed or empty file.");

        await context.reply("Playing " + (apiData.result.title || video.title) + " ...");

        await sock.sendMessage(
          from,
          {
            audio: { url: filePath },
            mimetype: "audio/mpeg",
            fileName: (apiData.result.title || video.title).substring(0, 100) + ".mp3"
          },
          { quoted: msg }
        );

        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

      } catch (error) {
        console.error("Play command error:", error);
        return context.reply("Error: " + error.message);
      }
    }
  },

   {
    name: "fb",
    aliases: ["facebook", "fbdl"],
    category: "downloader",
    desc: "Download Facebook videos",
    usage: ".fb <facebook-video-link>",

    execute: async (sock, m, args, context) => {
      const { chatId, reply, react, rawText } = context;
      const text = rawText.split(' ').slice(1).join(' ').trim();
      let tempFile = null;

      try {
        if (!text) {
          return await reply("Please provide a Facebook video URL!\n\nExample: .fb https://www.facebook.com/...\nExample: .fb https://fb.watch/...");
        }

        // Validate Facebook URL patterns
        const facebookPatterns = [
          'facebook.com',
          'fb.watch',
          'fb.com',
          'facebook.com/watch/',
          'facebook.com/reel/',
          'facebook.com/story.php'
        ];
        
        const isFacebookUrl = facebookPatterns.some(pattern => text.includes(pattern));
        if (!isFacebookUrl) {
          return await reply("❌ That is not a valid Facebook video URL.\n\nSupported formats:\n• facebook.com/.../videos/...\n• fb.watch/...\n• facebook.com/reel/...\n• facebook.com/watch/...");
        }

        await react("⬇️");

        // Resolve URL (handle redirects)
        let resolvedUrl = text;
        try {
          const res = await axios.get(text, { 
            timeout: 15000, 
            maxRedirects: 10, 
            headers: { 
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
            },
            validateStatus: (status) => status >= 200 && status < 400
          });
          resolvedUrl = res.request?.res?.responseUrl || text;
        } catch (error) {
          console.log('URL resolution failed, using original URL');
        }

        await reply("🔍 Fetching Facebook video...");

        // Helper functions
        function checkForVideoData(data) {
          if (!data) return false;
          const checks = [
            data.status === true,
            data.result?.media?.video_hd,
            data.result?.media?.video_sd,
            data.result?.url,
            data.data?.url,
            data.url,
            data.download,
            data.video,
            Array.isArray(data.data) && data.data.length > 0,
            typeof data.result === 'string' && data.result.startsWith('http')
          ];
          return checks.some(check => check === true);
        }

        function extractVideoUrl(data) {
          if (!data) return null;
          
          const extractionAttempts = [
            () => data.result?.media?.video_hd || data.result?.media?.video_sd || data.result?.media?.video,
            () => data.result?.url,
            () => data.data?.url,
            () => data.url || data.download,
            () => (typeof data.video === 'string' ? data.video : data.video?.url),
            () => {
              if (Array.isArray(data.data)) {
                const hd = data.data.find(item => item.quality === 'HD' || item.quality === 'high');
                const sd = data.data.find(item => item.quality === 'SD' || item.quality === 'low');
                return (hd || sd || data.data[0])?.url;
              }
              return null;
            },
            () => (typeof data.result === 'string' && data.result.startsWith('http') ? data.result : null),
            () => data.result?.download || data.data?.download
          ];

          for (const attempt of extractionAttempts) {
            try {
              const videoUrl = attempt();
              if (videoUrl && typeof videoUrl === 'string' && videoUrl.startsWith('http')) {
                return videoUrl;
              }
            } catch (error) {
              continue;
            }
          }
          return null;
        }

        function extractTitle(data) {
          const titleSources = [
            data.result?.info?.title,
            data.result?.title,
            data.title,
            data.result?.caption,
            data.data?.title,
            data.video?.title
          ];
          return titleSources.find(title => title && typeof title === 'string') || "Facebook Video";
        }

        // Try multiple Facebook APIs
        const facebookApis = [
          `https://api.hanggts.xyz/download/facebook?url=${encodeURIComponent(resolvedUrl)}`,
          `https://api.drivex.cc/api/fbdl?url=${encodeURIComponent(resolvedUrl)}`,
          `https://api.siputzx.my.id/api/downloader/facebook?url=${encodeURIComponent(resolvedUrl)}`,
          `https://api.ryzendesu.my.id/api/downloader/fbdl?url=${encodeURIComponent(resolvedUrl)}`
        ];
        
        let mediaData = null;
        let apiName = 'Facebook API';
        
        for (const api of facebookApis) {
          try {
            const response = await axios.get(api, {
              timeout: 25000,
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json'
              }
            });
            
            if (checkForVideoData(response.data)) {
              mediaData = response.data;
              apiName = new URL(api).hostname;
              break;
            }
          } catch (error) {
            continue;
          }
        }

        // Fallback to original URL if resolved URL failed
        if (!mediaData) {
          for (const api of facebookApis.map(api => api.replace(encodeURIComponent(resolvedUrl), encodeURIComponent(text)))) {
            try {
              const response = await axios.get(api, {
                timeout: 25000,
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                  'Accept': 'application/json'
                }
              });
              
              if (checkForVideoData(response.data)) {
                mediaData = response.data;
                apiName = new URL(api).hostname;
                break;
              }
            } catch (error) {
              continue;
            }
          }
        }

        if (!mediaData) {
          await react('❌');
          return await reply('❌ Failed to download Facebook video.\n\nPossible reasons:\n• Video is private or deleted\n• Link is invalid or not a video\n• Video is age-restricted\n• API is temporarily unavailable\n\nPlease try a different Facebook video link.');
        }

        const videoUrl = extractVideoUrl(mediaData);
        const title = extractTitle(mediaData);

        if (!videoUrl) {
          await react('❌');
          return await reply('Could not extract video URL. The content might be private or unavailable.');
        }

        // Try URL method first (most efficient)
        try {
          const caption = `🎬 *Facebook Video*\n\n📝 Title: ${title}\n🔧 Source: ${apiName}\n⬇️ Downloaded successfully!`;
          
          await sock.sendMessage(chatId, {
            video: { url: videoUrl },
            mimetype: "video/mp4",
            caption: caption
          }, { quoted: m });
          
          await react('✅');
          return;
          
        } catch (urlError) {
          console.log('URL method failed, trying buffer method...');
          
          // Fallback to buffer method
          const tempDir = path.join(process.cwd(), 'temp');
          if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
          
          tempFile = path.join(tempDir, `fb_${Date.now()}.mp4`);
          
          const videoResponse = await axios({
            method: 'GET',
            url: videoUrl,
            responseType: 'stream',
            timeout: 120000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'video/mp4,video/*;q=0.9,*/*;q=0.8',
              'Referer': 'https://www.facebook.com/'
            }
          });

          const writer = fs.createWriteStream(tempFile);
          videoResponse.data.pipe(writer);

          await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
            setTimeout(() => reject(new Error('Download timeout')), 120000);
          });

          // Verify download
          if (!fs.existsSync(tempFile) || fs.statSync(tempFile).size === 0) {
            throw new Error('Download failed or empty file');
          }

          const caption = `🎬 *Facebook Video*\n\n📝 Title: ${title}\n🔧 Source: ${apiName}\n⬇️ Downloaded successfully!`;
          
          await sock.sendMessage(chatId, {
            video: fs.readFileSync(tempFile),
            mimetype: "video/mp4",
            caption: caption
          }, { quoted: m });

          await react('✅');
        }

      } catch (error) {
        console.error('[FB] Error:', error.message);
        await react('❌');
        
        let errorMessage = "❌ Failed to download Facebook video. ";
        if (error.message.includes('timeout')) {
          errorMessage += "The request timed out. Please try again.";
        } else if (error.message.includes('Network Error')) {
          errorMessage += "Network error. Please check your connection.";
        } else if (error.message.includes('404') || error.message.includes('Not Found')) {
          errorMessage += "Video not found. The link may be invalid or the video was removed.";
        } else if (error.message.includes('private') || error.message.includes('unavailable')) {
          errorMessage += "Video is private, deleted, or unavailable.";
        } else {
          errorMessage += error.message;
        }
        
        await reply(errorMessage);
      } finally {
        // Clean up temp file
        if (tempFile && fs.existsSync(tempFile)) {
          try {
            fs.unlinkSync(tempFile);
            console.log('Temp file cleaned up');
          } catch (cleanupError) {
            console.error('Cleanup error:', cleanupError.message);
          }
        }
      }
    }
  },
    {
    name: "tiktok",
    aliases: ["tt", "tik"],
    category: "downloader",
    desc: "Download TikTok videos",
    usage: ".tiktok <link>",

    execute: async (sock, m, args, context) => {
        const { chatId, reply, react } = context;

        // Check if message was already processed
        if (processedMessages.has(m.key.id)) return;
        processedMessages.add(m.key.id);

        // Clean up after 5 minutes
        setTimeout(() => {
            processedMessages.delete(m.key.id);
        }, 5 * 60 * 1000);

        try {
            const text = args.slice(1).join(' ').trim();

            if (!text) {
                return await reply("Please provide a TikTok link!");
            }

            // Check for TikTok URL patterns
            const tiktokPatterns = [
                /https?:\/\/(?:www\.)?tiktok\.com\//,
                /https?:\/\/(?:vm\.)?tiktok\.com\//,
                /https?:\/\/(?:vt\.)?tiktok\.com\//,
                /https?:\/\/(?:www\.)?tiktok\.com\/@/,
                /https?:\/\/(?:www\.)?tiktok\.com\/t\//
            ];

            const isValidUrl = tiktokPatterns.some(pattern => pattern.test(text));

            if (!isValidUrl) {
                return await reply("That is not a valid TikTok link!");
            }

            await react('🕹️');

            // Try multiple APIs
            const apis = [
                `https://api.princetechn.com/api/download/tiktok?apikey=prince&url=${encodeURIComponent(text)}`,
                `https://api.princetechn.com/api/download/tiktokdlv2?apikey=prince&url=${encodeURIComponent(text)}`,
                `https://api.princetechn.com/api/download/tiktokdlv3?apikey=prince&url=${encodeURIComponent(text)}`,
                `https://api.princetechn.com/api/download/tiktokdlv4?apikey=prince&url=${encodeURIComponent(text)}`,
                `https://api.dreaded.site/api/tiktok?url=${encodeURIComponent(text)}`
            ];

            let videoUrl = null;
            let audioUrl = null;
            let title = null;

            // Try each API
            for (const apiUrl of apis) {
                try {
                    const response = await axios.get(apiUrl, { timeout: 10000 });

                    if (response.data) {
                        // PrinceTech API format
                        if (response.data.result && response.data.result.videoUrl) {
                            videoUrl = response.data.result.videoUrl;
                            audioUrl = response.data.result.audioUrl;
                            title = response.data.result.title;
                            break;
                        }
                        // Dreaded API format
                        else if (response.data.tiktok && response.data.tiktok.video) {
                            videoUrl = response.data.tiktok.video;
                            break;
                        }
                        // Alternative format
                        else if (response.data.video) {
                            videoUrl = response.data.video;
                            break;
                        }
                    }
                } catch (apiError) {
                    console.log(`[TIKTOK] API ${apiUrl} failed:`, apiError.message);
                    continue;
                }
            }

            // Fallback to ttdl if APIs fail
            if (!videoUrl) {
                try {
                    const downloadData = await ttdl(text);
                    if (downloadData && downloadData.data && downloadData.data.length > 0) {
                        const mediaData = downloadData.data;
                        for (let i = 0; i < Math.min(20, mediaData.length); i++) {
                            const media = mediaData[i];
                            const mediaUrl = media.url;
                            const isVideo = /\.(mp4|mov|avi|mkv|webm)$/i.test(mediaUrl) || media.type === 'video';

                            if (isVideo) {
                                await sock.sendMessage(chatId, {
                                    video: { url: mediaUrl },
                                    mimetype: "video/mp4",
                                    caption: ""
                                }, { quoted: m });
                            } else {
                                await sock.sendMessage(chatId, {
                                    image: { url: mediaUrl },
                                    caption: ""
                                }, { quoted: m });
                            }
                        }
                        await react('✅');
                        return;
                    }
                } catch (ttdlError) {
                    console.error('[TIKTOK] ttdl failed:', ttdlError.message);
                }
            }

            // Send video if we have URL
            if (videoUrl) {
                try {
                    // Try to send as URL first (more efficient)
                    const caption = title ? `TikTok Download\n\nTitle: ${title}` : "TikTok Video";

                    await sock.sendMessage(chatId, {
                        video: { url: videoUrl },
                        mimetype: "video/mp4",
                        caption: caption
                    }, { quoted: m });

                    // Send audio separately if available
                    if (audioUrl) {
                        setTimeout(async () => {
                            try {
                                await sock.sendMessage(chatId, {
                                    audio: { url: audioUrl },
                                    mimetype: "audio/mpeg",
                                    fileName: "tiktok_audio.mp3"
                                }, { quoted: m });
                            } catch (audioError) {
                                console.error('[TIKTOK] Audio failed:', audioError.message);
                            }
                        }, 2000);
                    }

                    await react('✅');

                } catch (sendError) {
                    console.error('[TIKTOK] Send failed:', sendError.message);
                    await react('❌');
                    await reply("Failed to send video. The link might be invalid.");
                }
            } else {
                await react('❌');
                await reply("Failed to download TikTok. All methods failed.");
            }

        } catch (error) {
            console.error('[TIKTOK] Command error:', error.message);
            await react('❌');
            await reply("Failed to process TikTok download.");
        }
    }
},
];

