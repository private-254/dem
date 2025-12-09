import { fetchJson, isUrl } from '../lib/myfunc.js';
import { ttdl } from "ruhend-scraper";
import axios from 'axios';
import { channelInfo } from '../lib/messageConfig.js';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import yts from 'yt-search';
import settings from '../settings.js';

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
    name: "instagram",
    aliases: ["ig", "insta", "igdl"],
    category: "downloader",
    desc: "Download Instagram posts, reels, and videos",

    async execute(sock, msg, args, context) {
        const from = msg.key.remoteJid;
        const messageId = msg.key.id;

        try {
            // Prevent duplicate execution
            if (processedMessages.has(messageId)) return;
            processedMessages.add(messageId);
            setTimeout(() => processedMessages.delete(messageId), 5 * 60 * 1000);

            const text = args.join(" ").trim();
            if (!text) return context.reply("Please provide an Instagram link.");

            // Validate Instagram URL
            const instagramPatterns = [
                /https?:\/\/(?:www\.)?instagram\.com\//,
                /https?:\/\/(?:www\.)?instagr\.am\//,
                /https?:\/\/(?:www\.)?instagram\.com\/p\//,
                /https?:\/\/(?:www\.)?instagram\.com\/reel\//,
                /https?:\/\/(?:www\.)?instagram\.com\/tv\//
            ];
            const isValidUrl = instagramPatterns.some(p => p.test(text));
            if (!isValidUrl) return context.reply("That is not a valid Instagram link.");

            await context.react("🔄");

            const downloadData = await igdl(text);
            if (!downloadData?.data?.length) return context.reply("❌ No media found at the provided link.");

            // Deduplicate media URLs
            const uniqueMedia = [];
            const seenUrls = new Set();
            for (const media of downloadData.data) {
                if (media.url && !seenUrls.has(media.url)) {
                    seenUrls.add(media.url);
                    uniqueMedia.push(media);
                }
            }

            const mediaToDownload = uniqueMedia.slice(0, 20);
            if (!mediaToDownload.length) return context.reply("❌ No valid media to download.");

            // Download and send media
            for (let i = 0; i < mediaToDownload.length; i++) {
                const media = mediaToDownload[i];
                const mediaUrl = media.url;
                const isVideo = /\.(mp4|mov|avi|mkv|webm)$/i.test(mediaUrl) || media.type === "video" || text.includes("/reel/") || text.includes("/tv/");

                try {
                    if (isVideo) {
                        await sock.sendMessage(from, {
                            video: { url: mediaUrl },
                            mimetype: "video/mp4",
                            caption: ""
                        }, { quoted: msg });
                    } else {
                        await sock.sendMessage(from, {
                            image: { url: mediaUrl },
                            caption: ""
                        }, { quoted: msg });
                    }

                    // Small delay between media to prevent rate-limiting
                    if (i < mediaToDownload.length - 1) await new Promise(r => setTimeout(r, 1000));

                } catch (mediaErr) {
                    console.error(`Error sending media #${i + 1}:`, mediaErr);
                    continue;
                }
            }

        } catch (err) {
            console.error("Instagram command error:", err);
            return context.reply("❌ An error occurred while processing the Instagram request.");
        }
    }
}
  {
    name: 'itunes',
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
}

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
            const tempDir = path.join(__dirname, "temp");
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
}

{
    name: "tiktok",
    aliases: ["tt", "tik"],
    category: "downloader",
    desc: "Download TikTok video and audio",

    async execute(sock, msg, args, context) {
        const from = msg.key.remoteJid;
        const messageId = msg.key.id;

        try {
            // Prevent duplicate execution
            if (processedMessages.has(messageId)) return;
            processedMessages.add(messageId);
            setTimeout(() => processedMessages.delete(messageId), 5 * 60 * 1000);

            const text = args.join(" ").trim();
            if (!text) return context.reply("Please provide a TikTok link.");

            const url = args.slice(0).join(" ").trim();
            if (!url) return context.reply("Please provide a TikTok link.");

            // Validate TikTok URL
            const tiktokPatterns = [
                /https?:\/\/(?:www\.)?tiktok\.com\//,
                /https?:\/\/(?:vm\.)?tiktok\.com\//,
                /https?:\/\/(?:vt\.)?tiktok\.com\//,
                /https?:\/\/(?:www\.)?tiktok\.com\/@/,
                /https?:\/\/(?:www\.)?tiktok\.com\/t\//
            ];
            const isValidUrl = tiktokPatterns.some(p => p.test(url));
            if (!isValidUrl) return context.reply("That is not a valid TikTok link.");

            await context.react("🎬");

            // TikTok API fallback list
            const apis = [
                `https://api.princetechn.com/api/download/tiktok?apikey=prince&url=${encodeURIComponent(url)}`,
                `https://api.princetechn.com/api/download/tiktokdlv2?apikey=prince&url=${encodeURIComponent(url)}`,
                `https://api.princetechn.com/api/download/tiktokdlv3?apikey=prince&url=${encodeURIComponent(url)}`,
                `https://api.princetechn.com/api/download/tiktokdlv4?apikey=prince&url=${encodeURIComponent(url)}`,
                `https://api.dreaded.site/api/tiktok?url=${encodeURIComponent(url)}`
            ];

            let videoUrl = null;
            let audioUrl = null;
            let title = null;

            // Try each API until one works
            for (const apiUrl of apis) {
                try {
                    const response = await axios.get(apiUrl, { timeout: 10000 });
                    const data = response.data;

                    if (data?.result?.videoUrl) {
                        videoUrl = data.result.videoUrl;
                        audioUrl = data.result.audioUrl;
                        title = data.result.title;
                        break;
                    } else if (data?.tiktok?.video) {
                        videoUrl = data.tiktok.video;
                        break;
                    } else if (data?.video) {
                        videoUrl = data.video;
                        break;
                    }
                } catch (err) {
                    continue;
                }
            }

            // Fallback to ttdl scraper if no video URL
            if (!videoUrl) {
                const dl = await ttdl(url);
                if (dl?.data?.length > 0) {
                    for (const media of dl.data.slice(0, 20)) {
                        const mediaUrl = media.url;
                        const isVideo = /\.(mp4|mov|avi|mkv|webm)$/i.test(mediaUrl) || media.type === "video";

                        if (isVideo) {
                            await sock.sendMessage(from, {
                                video: { url: mediaUrl },
                                mimetype: "video/mp4",
                                caption: ""
                            }, { quoted: msg });
                        } else {
                            await sock.sendMessage(from, {
                                image: { url: mediaUrl },
                                caption: ""
                            }, { quoted: msg });
                        }
                    }
                    await context.react("✔️");
                    return;
                }
            }

            if (!videoUrl) return context.reply("❌ Failed to download TikTok video. Try another link.");

            // Try direct video download as buffer
            try {
                const videoRes = await axios.get(videoUrl, {
                    responseType: "arraybuffer",
                    timeout: 30000,
                    headers: { "User-Agent": "Mozilla/5.0" }
                });
                const videoBuffer = Buffer.from(videoRes.data);

                await sock.sendMessage(from, {
                    video: videoBuffer,
                    mimetype: "video/mp4",
                    caption: title ? `Title: ${title}` : ""
                }, { quoted: msg });

                await context.react("✔️");

                // If audio URL exists, download audio
                if (audioUrl) {
                    try {
                        const audioRes = await axios.get(audioUrl, {
                            responseType: "arraybuffer",
                            timeout: 30000,
                            headers: { "User-Agent": "Mozilla/5.0" }
                        });
                        const audioBuffer = Buffer.from(audioRes.data);

                        await sock.sendMessage(from, {
                            audio: audioBuffer,
                            mimetype: "audio/mp3",
                            caption: "🎵 Audio from TikTok"
                        }, { quoted: msg });
                    } catch (audioErr) {
                        console.log("Audio download failed:", audioErr.message);
                    }
                }

                return;
            } catch (bufferErr) {
                console.log("Buffer download failed:", bufferErr.message);
            }

            // Fallback: send video URL directly
            await sock.sendMessage(from, {
                video: { url: videoUrl },
                mimetype: "video/mp4",
                caption: title ? `Title: ${title}` : ""
            }, { quoted: msg });

            await context.react("✔️");

        } catch (err) {
            console.error("TikTok command error:", err);
            return context.reply("❌ An error occurred while downloading the TikTok video.");
        }
    }
}
  
];