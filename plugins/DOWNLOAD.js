import { fetchJson, isUrl } from '../lib/myfunc.js';
import { ttdl, igdl } from "ruhend-scraper";
import axios from 'axios';
import { channelInfo } from '../lib/messageConfig.js';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import yts from 'yt-search';
import settings from '../settings.js';
import cheerio from 'cheerio';

// Prevent repeated TikTok executions
const processedMessages = new Set();

export default [
  {
    name: 'apk',
    aliases: ['apkdl'],
    category: 'SETTINGS MENU',
    execute: async (sock, message, args, context) => {
      const text = args.slice(1).join(' ');
      if (!text) return context.reply("Which apk do you want to download?",{ quoted: global.apk});

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
          },{ quoted: global.apk}
        );
      } catch (error) {
        context.reply("❌ Error downloading APK. Please try again later.",{ quoted: global.apk});
      }
    }
  },

{
  name: "shazam",
  aliases: ["identifysong", "whatsong"],
  category: "SEARCH MENU",
  desc: "Identify songs from audio or voice messages",

  async execute(sock, msg, args, context) {
    const { reply, react } = context;
    const from = msg.key.remoteJid;
    
    try {
      // Check if quoted message is audio/voice
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const audioMsg = quotedMsg?.audioMessage || quotedMsg?.voiceMessage || 
                       msg.message?.audioMessage || msg.message?.voiceMessage;

      if (!audioMsg) {
        return reply("🎧 Please reply to an *audio* or *voice* message to identify the song!");
      }

      await react('🔍');

      // Download the audio
      const stream = await sock.downloadMediaMessage(msg);
      if (!stream) {
        return reply("❌ Could not download the audio message.");
      }

      // Convert to base64 for the API
      const audioBase64 = stream.toString('base64');
      
      // Try multiple Shazam APIs
      const apis = [
        `https://apiskeith.vercel.app/ai/shazam?audio=${encodeURIComponent(audioBase64)}`,
        `https://api.akuari.my.id/downloader/sha`,
        `https://api.neoxr.eu.org/api/shazam`
      ];

      let result = null;
      let apiUsed = '';

      for (const apiUrl of apis) {
        try {
          let res;
          
          if (apiUrl.includes('apiskeith')) {
            // Keith API - send base64 in URL
            res = await axios.get(apiUrl, { timeout: 10000 });
          } else if (apiUrl.includes('akuari')) {
            // Akuari API - different format
            const formData = new FormData();
            const audioBlob = new Blob([stream], { type: 'audio/mpeg' });
            formData.append('audio', audioBlob, 'audio.mp3');
            
            res = await axios.post(apiUrl, formData, {
              headers: formData.getHeaders(),
              timeout: 10000
            });
          } else {
            // Neoxr API
            res = await axios.post(apiUrl, {
              audio: audioBase64
            }, { timeout: 10000 });
          }

          if (res.data && res.data.result) {
            result = res.data.result;
            apiUsed = apiUrl;
            break;
          }
        } catch (apiError) {
          console.log(`API ${apiUrl} failed:`, apiError.message);
          continue;
        }
      }

      if (!result) {
        await react('❌');
        return reply("❌ Could not recognize the song. Please try with a clearer audio clip.");
      }

      // Format response
      let text = `🎶 *Song Recognized!*\n\n`;
      text += `*Title:* ${result.title || result.song || "Unknown"}\n`;
      text += `*Artist:* ${result.artist || result.singer || "Unknown"}\n`;
      
      if (result.album) text += `*Album:* ${result.album}\n`;
      if (result.releaseDate) text += `*Released:* ${result.releaseDate}\n`;
      if (result.genre) text += `*Genre:* ${result.genre}\n`;
      if (result.duration) text += `*Duration:* ${result.duration}\n`;
      if (result.lyrics) text += `\n*Lyrics Preview:*\n${result.lyrics.substring(0, 200)}...\n`;
      
      // Add streaming links if available
      if (result.spotifyUrl) text += `\n*Spotify:* ${result.spotifyUrl}\n`;
      if (result.youtubeUrl) text += `*YouTube:* ${result.youtubeUrl}\n`;
      if (result.appleMusicUrl) text += `*Apple Music:* ${result.appleMusicUrl}\n`;
      
      // Add Shazam link
      if (result.title && result.artist) {
        const searchQuery = encodeURIComponent(`${result.title} ${result.artist}`);
        text += `\n*Shazam Search:* https://www.shazam.com/search?term=${searchQuery}\n`;
      }

      text += `\n✅ Identified using ${apiUsed.split('/')[2]}`;

      await reply(text);
      await react('✅');

    } catch (err) {
      console.error("❌ Shazam Error:", err);
      await react('❌');
      
      if (err.message.includes('timeout')) {
        return reply("⏱️ Request timeout. The audio might be too long or the API is busy.");
      } else if (err.message.includes('network') || err.message.includes('ENOTFOUND')) {
        return reply("🌐 Network error. Please check your connection.");
      }
      
      reply("❌ Failed to identify the song. Please try again with a different audio clip.");
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
          return reply(`❌ Provide a song name!\n\nExample: .playdoc Not Like Us`);
        }

        // Use process.cwd() to avoid __dirname issues
        const tempDir = path.join(process.cwd(), "temp");
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

        if (text.length > 100) {
          return reply('❌ Song name too long! Maximum 100 characters.');
        }

        await reply("🎵 Searching for the track...");

        const searchResult = (await yts(`${text} official`)).videos[0];
        if (!searchResult) {
          return reply("❌ Couldn't find that song. Try another one!");
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

        await reply(`✅ Downloaded: ${songTitle}`);

        await sock.sendMessage(
          from,
          {
            document: { url: filePath },
            mimetype: "audio/mpeg",
            fileName: `${songTitle.substring(0, 100).replace(/[^\w\s.-]/gi, '')}.mp3`
          },
          { quoted: msg }
        );

        // Clean up temp file
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }

        await react('✅');

      } catch (error) {
        console.error("Playdoc command error:", error);
        await react('❌');

        let errorMessage = '❌ Download failed!';
        if (error.message.includes('timeout')) {
          errorMessage = '❌ Request timeout. Try again.';
        } else if (error.message.includes('ENOTFOUND')) {
          errorMessage = '❌ Network error. Check connection.';
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

        let teks = `*YouTube Search*\n\n*Results for:* ${text}\n\n`;
        let no = 1;

        for (let i of search.all.slice(0, 10)) { // Limit to 10 results
          teks += `❤️ *No:* ${no++}\n`;
          teks += `❤️ *Type:* ${i.type}\n`;
          teks += `❤️ *Title:* ${i.title}\n`;
          teks += `❤️ *Views:* ${i.views}\n`;
          teks += `❤️ *Duration:* ${i.timestamp}\n`;
          teks += `❤️ *Uploaded:* ${i.ago}\n`;
          teks += `❤️ *URL:* ${i.url}\n`;
          teks += `─────────────────\n\n`;
        }

        await sock.sendMessage(msg.key.remoteJid, {
          image: { url: search.all[0].thumbnail },
          caption: teks
        }, { quoted: msg });

      } catch (error) {
        console.error('YouTube search error:', error);
        reply('❌ Error searching YouTube videos.');
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
        return reply('❌ Please provide a URL to shorten.\n\nExample: .shorturl https://example.com');
      }

      try {
        // Validate URL
        if (!text.startsWith('http://') && !text.startsWith('https://')) {
          return reply('❌ Please provide a valid URL starting with http:// or https://');
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
          return reply('❌ Failed to create short URL. Please try again.');
        }

        await reply(`🔗 *Short URL Created*\n\n*Original:* ${text}\n*Shortened:* ${result.data.shorturl}\n\n✅ URL shortened successfully!`);

      } catch (error) {
        console.error('[SHORTURL] Error:', error);
        reply(`❌ Error: ${error.message || 'Failed to shorten URL'}`);
      }
    }
  },

  {
    name: "video",
    aliases: ["ytvideo", "ytvid"],
    category: "downloader",
    desc: "Download YouTube videos in MP4 format",

    async execute(sock, msg, args, context) {
      const { reply, react } = context;
      const from = msg.key.remoteJid;
      const text = args.slice(1).join(" ").trim();

      try {
        if (!text) return reply('❌ What video do you want to download?\n\nExample: .video <search term or YouTube URL>');

        await react('🎬');

        let videoUrl = '';
        let videoTitle = '';
        let videoThumbnail = '';

        // Check if input is a URL or search term
        if (text.startsWith('http://') || text.startsWith('https://')) {
          videoUrl = text;
        } else {
          // Search for video
          const { videos } = await yts(text);
          if (!videos || videos.length === 0) return reply('❌ No videos found!');

          videoUrl = videos[0].url;
          videoTitle = videos[0].title;
          videoThumbnail = videos[0].thumbnail;
        }

        // Validate YouTube URL
        const youtubeRegex = /(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch\?v=|v\/|embed\/|shorts\/|playlist\?list=)?)([a-zA-Z0-9_-]{11})/gi;
        const urls = videoUrl.match(youtubeRegex);
        if (!urls) return reply('❌ This is not a valid YouTube link!');

        // API configurations
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

        // Retry function
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

        // Izumi API
        const getIzumiVideoByUrl = async (youtubeUrl) => {
          const apiUrl = `${izumi.baseURL}/downloader/youtube?url=${encodeURIComponent(youtubeUrl)}&format=720`;
          const res = await tryRequest(() => axios.get(apiUrl, AXIOS_DEFAULTS));
          if (res?.data?.result?.download) return res.data.result;
          throw new Error('Izumi video API returned no download');
        };

        // Okatsu API (fallback)
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

        // Get video ID for thumbnail
        const ytId = (videoUrl.match(/(?:youtu\.be\/|v=)([a-zA-Z0-9_-]{11})/) || [])[1];
        const thumb = videoThumbnail || (ytId ? `https://i.ytimg.com/vi/${ytId}/sddefault.jpg` : undefined);
        const captionTitle = videoTitle || text;

        // Send thumbnail with loading message
        if (thumb) {
          await sock.sendMessage(from, {
            image: { url: thumb },
            caption: `*${captionTitle}*\n\n🎬 Searching video data...`
          }, { quoted: msg });
        }

        // Try downloading video
        let videoData;
        try {
          videoData = await getIzumiVideoByUrl(videoUrl);
        } catch (e1) {
          console.warn('[VIDEO] Izumi failed, trying Okatsu:', e1?.message || e1);
          videoData = await getOkatsuVideoByUrl(videoUrl);
        }

        // Send the video
        await sock.sendMessage(from, {
          video: { url: videoData.download },
          mimetype: 'video/mp4',
          fileName: `${videoData.title || videoTitle || 'video'}.mp4`.replace(/[^\w\s.-]/gi, ''),
          caption: `📹 *${videoData.title || videoTitle || 'Video'}*\n\n✅ Downloaded successfully!`
        }, { quoted: msg });

        await react('✅');

      } catch (error) {
        console.error('[VIDEO] Command Error:', error?.message || error);
        await react('❌');
        reply('❌ Download failed: ' + (error?.message || 'Unknown error'));
      }
    }
  },

  {
    name: 'download',
    category: 'downloader',
    execute: async (sock, message, args, context) => {
      const text = args.slice(1).join(' ');
      if (!text) return context.reply('Enter download URL',{ quoted: global.download});

      try {
        let res = await fetch(text, { method: 'GET', redirect: 'follow' });
        let contentType = res.headers.get('content-type');
        let buffer = await res.buffer();
        let extension = contentType.split('/')[1]; 
        let filename = res.headers.get('content-disposition')?.match(/filename="(.*)"/)?.[1] || `download-${Math.random().toString(36).slice(2, 10)}.${extension}`;
        let mimeType;
        switch (contentType) {
          case 'audio/mpeg':
            mimeType = 'audio/mpeg';
            break;
          case 'image/png':
            mimeType = 'image/png';
            break;
          case 'image/jpeg':
            mimeType = 'image/jpeg';
            break;
          case 'application/pdf':
            mimeType = 'application/pdf';
            break;
          case 'application/zip':
            mimeType = 'application/zip';
            break;
          case 'video/mp4':
            mimeType = 'video/mp4';
            break;
          case 'video/webm':
            mimeType = 'video/webm';
            break;
          case 'application/vnd.android.package-archive':
            mimeType = 'application/vnd.android.package-archive';
            break;
          default:
            mimeType = 'application/octet-stream';
        }
        sock.sendMessage(context.chatId, { document: buffer, mimetype: mimeType, fileName: filename },{ quoted: global.download});
      } catch (error) {
        context.reply(`Error downloading file: ${error.message}`);
      }
    }
  },
  {
    name: 'gdrive',
    category: 'downloader',
    execute: async (sock, message, args, context) => {
      const text = args.slice(1).join(' ');
      if (!text) return context.reply("Please provide a Google Drive file URL",{ quoted: global.gdrive});
      try {
        let response = await fetch(`https://api.siputzx.my.id/api/d/gdrive?url=${encodeURIComponent(text)}`);
        let data = await response.json();
        if (response.status !== 200 || !data.status || !data.data) {
          return context.reply("Please try again later or try another command!",{quoted: global.gdrive});
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
            },{quoted: global.gdrive});
            fs.unlinkSync(filePath);
          });
          writer.on('error', (err) => {
            console.error('Error downloading the file:', err);
            context.reply("An error occurred while downloading the file.",{quoted: global.gdrive});
          });
        }
      } catch (error) {
        console.error('Error fetching Google Drive file details:', error);
        context.reply("❌ Error downloading Google Drive file. Please try again later.");
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
        context.reply("❌ Error cloning repository. Please try again later.");
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
          return context.reply("*No images found or API error. Please try again later or try another query!*");
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
        context.reply("❌ Error fetching images. Please try again later.");
      }
    }
  },
  {
    name: "itunes",
    category: 'downloader',
    execute: async (sock, message, args, context) => {
      const text = args.slice(1).join(' ');
      if (!text) return context.reply("*Please provide a song name*");

      try {
        let res = await fetch(`https://api.popcat.xyz/itunes?q=${encodeURIComponent(text)}`);
        if (!res.ok) {
          throw new Error(`*API request failed with status ${res.status}*`);
        }
        let json = await res.json();
        let songInfo = `*Song Information:*\n\n • *Name:* ${json.name}\n\n • *Artist:* ${json.artist}\n\n • *Album:* ${json.album}\n\n • *Release Date:* ${json.release_date}\n\n • *Price:* ${json.price}\n\n • *Length:* ${json.length}\n\n • *Genre:* ${json.genre}\n\n • *URL:* ${json.url}`;

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
        context.reply("❌ Error fetching iTunes info. Please try again later.");
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
        context.reply("❌ Error downloading MediaFire file. Please try again later.");
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
        // Use plain text reaction instead of emoji
        await context.react("Playing audio...");

        const from = msg.key.remoteJid;
        const text = args.join(" ").trim();

        if (!text) {
            return context.reply("Provide a song name.\nExample: .play Not Like Us");
        }

        try {
            // Change from __dirname to process.cwd() to avoid the error
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

  // NEW: Facebook/Instagram Downloader
  {
    name: "fb",
    aliases: ["facebook", "fbdl", "ig", "instagram", "igdl"],
    category: "downloader",
    desc: "Download Facebook or Instagram videos/photos",
    usage: ".fb <link> or .ig <link>",
    
    execute: async (sock, m, args, context) => {
      const { chatId, reply, react } = context;
      const text = args.slice(1).join(' ').trim();
      
      if (!text) {
        return reply(`🔗 Provide a Facebook or Instagram link!\n\nExample: .fb <link> or .ig <link>`);
      }
      
      try {
        await react("⏳");
        
        // Send initial processing message
        await reply("⏳ Fetching media... Please wait!");
        
        async function fetchMedia(url) {
          try {
            const form = new URLSearchParams();
            form.append("q", url);
            form.append("vt", "home");
            
            const { data } = await axios.post('https://yt5s.io/api/ajaxSearch', form, {
              headers: {
                "Accept": "application/json",
                "X-Requested-With": "XMLHttpRequest",
                "Content-Type": "application/x-www-form-urlencoded",
              },
            });
            
            if (data.status !== "ok") throw new Error("Provide a valid link.");
            const $ = cheerio.load(data.data);
            
            // Facebook detection
            if (/^(https?:\/\/)?(www\.)?(facebook\.com|fb\.watch)\/.+/i.test(url)) {
              const thumb = $('img').attr("src");
              let links = [];
              
              $('table tbody tr').each((_, el) => {
                const quality = $(el).find('.video-quality').text().trim();
                const link = $(el).find('a.download-link-fb').attr("href");
                if (quality && link) links.push({ quality, link });
              });
              
              if (links.length > 0) return { 
                platform: "Facebook", 
                type: "video", 
                thumb, 
                media: links[0].link 
              };
              
              if (thumb) return { 
                platform: "Facebook", 
                type: "image", 
                media: thumb 
              };
              
              throw new Error("Media is invalid.");
              
            // Instagram detection
            } else if (/^(https?:\/\/)?(www\.)?(instagram\.com\/(p|reel)\/).+/i.test(url)) {
              const video = $('a[title="Download Video"]').attr("href");
              const image = $('img').attr("src");
              
              if (video) return { 
                platform: "Instagram", 
                type: "video", 
                media: video 
              };
              
              if (image) return { 
                platform: "Instagram", 
                type: "image", 
                media: image 
              };
              
              throw new Error("Media invalid.");
            } else {
              throw new Error("Provide a valid Facebook or Instagram URL.");
            }
          } catch (err) {
            return { error: err.message };
          }
        }
        
        const res = await fetchMedia(text);
        
        if (res.error) {
          await react("❌");
          return reply(`⚠️ Error: ${res.error}`);
        }
        
        await reply("⏳ Media found! Downloading now...");
        
        if (res.type === "video") {
          await sock.sendMessage(chatId, { 
            video: { url: res.media }, 
            caption: `✅ Downloaded video from ${res.platform}!` 
          }, { quoted: m });
        } else if (res.type === "image") {
          await sock.sendMessage(chatId, { 
            image: { url: res.media }, 
            caption: `✅ Downloaded photo from ${res.platform}!` 
          }, { quoted: m });
        }
        
        await react("✅");
        await reply("✅ Done!");
        
      } catch (error) {
        console.error('[FB/IG] Error:', error);
        await react("❌");
        return reply("❌ Failed to get media.");
      }
    }
  },

  // NEW: TikTok Downloader
  {
    name: "tiktok",
    aliases: ["tt", "tik"],
    category: "downloader",
    desc: "Download TikTok videos with audio",
    usage: ".tiktok <link>",
    
    execute: async (sock, m, args, context) => {
      const { chatId, reply, react } = context;
      const text = args.slice(1).join(' ').trim();
      
      if (!text) {
        return reply(`⚠️ Provide a TikTok link.`);
      }
      
      try {
        await react("⏳");
        await reply("⏳ Fetching TikTok data...");
        
        // TikTok API endpoint
        const apiUrl = `https://api.princetechn.com/api/download/tiktok?apikey=prince&url=${encodeURIComponent(text)}`;
        const response = await axios.get(apiUrl);
        const data = response.data;
        
        if (!data.result) {
          throw new Error("Invalid TikTok link or API error");
        }
        
        const json = data.result;
        
        // Create caption
        let caption = `🎵 [TIKTOK DOWNLOAD]\n\n`;
        caption += `◦ Id: ${json.id || 'N/A'}\n`;
        caption += `◦ Username: ${json.author?.nickname || 'N/A'}\n`;
        caption += `◦ Title: ${json.title || 'N/A'}\n`;
        caption += `◦ Likes: ${json.digg_count || 0}\n`;
        caption += `◦ Comments: ${json.comment_count || 0}\n`;
        caption += `◦ Shares: ${json.share_count || 0}\n`;
        caption += `◦ Plays: ${json.play_count || 0}\n`;
        caption += `◦ Created: ${json.create_time || 'N/A'}\n`;
        caption += `◦ Size: ${json.size || 'N/A'}\n`;
        caption += `◦ Duration: ${json.duration || 'N/A'}`;
        
        // Handle multiple images (slideshow)
        if (json.images && json.images.length > 0) {
          for (const imgUrl of json.images) {
            await sock.sendMessage(chatId, { 
              image: { url: imgUrl },
              caption: json.images.length > 1 ? `Part ${json.images.indexOf(imgUrl) + 1}/${json.images.length}` : caption
            }, { quoted: m });
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } else {
          // Send video
          await sock.sendMessage(chatId, { 
            video: { url: json.play }, 
            mimetype: 'video/mp4', 
            caption: caption 
          }, { quoted: m });
          
          // Send audio separately after delay
          if (json.music) {
            setTimeout(async () => {
              await sock.sendMessage(chatId, { 
                audio: { url: json.music }, 
                mimetype: 'audio/mpeg',
                fileName: 'tiktok_audio.mp3'
              }, { quoted: m });
            }, 3000);
          }
        }
        
        await react("✅");
        
      } catch (error) {
        console.error('[TIKTOK] Error:', error);
        await react("❌");
        return reply("❌ Failed to fetch TikTok data. Make sure the link is valid.");
      }
    }
  }
];