import { fetchJson, isUrl } from '../lib/myfunc.js';
import { ttdl } from "ruhend-scraper";
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
    name: 'instagram',
    aliases: ['igdl'],
    category: 'downloader',
    execute: async (sock, message, args, context) => {
      const text = args.slice(1).join(' ');
      if (!text) return context.reply('*Please provide an Instagram URL!*');
      const apiUrl = `https://api.siputzx.my.id/api/d/igdl?url=${encodeURIComponent(text)}`;

      try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        if (!data || data.url.length === 0) return context.reply('*Failed to retrieve the video!*');
        const videoUrl = data.url;
        const title = `Instagram Video`;
        await sock.sendMessage(context.chatId, {
          video: { url: videoUrl },
          mimetype: 'video/mp4',
          fileName: `${title}.mp4`
        }, { quoted: message });
      } catch (error) {
        console.error('Download command failed:', error);
        context.reply("❌ Error downloading Instagram video. Please try again later.");
      }
    }
  },
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
    name: "play",
    aliases: ["song"],
    category: "downloader",
    desc: "Download and send audio from YouTube",

    async execute(sock, msg, args, context) {
        await context.react('🎵');

        const from = msg.key.remoteJid;
        const text = args.slice(1).join(" ");

        if (!text) {
            return await context.reply("Please provide a song name.\n\nExample: .play spectre");
        }

        try {
            const { videos } = await yts(text);
            if (!videos || videos.length === 0) {
                return await context.reply("No songs found.");
            }

            await context.replyPlain("Processing your request...");

            const video = videos[0];
            const urlYt = video.url;

            const apiUrl = `https://api.privatezia.biz.id/api/downloader/ytmp3?url=${encodeURIComponent(urlYt)}`;
            const response = await axios.get(apiUrl, {
                timeout: 45000,
                headers: { 'User-Agent': 'WhatsApp-Bot/1.0' }
            });

            const data = response.data;

            if (!data.status || !data.result || !data.result.data) {
                return await context.replyPlain("Failed to fetch song data.");
            }

            const song = data.result.data;

            if (!song.downloadUrl) {
                return await context.replyPlain("Download URL not found.");
            }

            const formatDuration = (seconds) => {
                const mins = Math.floor(seconds / 60);
                const secs = seconds % 60;
                return `${mins}:${secs.toString().padStart(2, '0')}`;
            };

            const formatViews = (views) => {
                return views ? views.toLocaleString() : 'Unknown';
            };

            const title = song.title || video.title;
            const duration = formatDuration(video.duration.seconds || song.duration);
            const views = formatViews(video.views);
            const author = video.author?.name || 'Unknown Artist';
            const thumbnail = song.thumbnail || video.thumbnail;

            await context.replyPlain({
                image: { url: thumbnail },
                caption: `Title: ${title}\nDuration: ${duration}\nArtist: ${author}\nViews: ${views}\nURL: ${urlYt}\n\nSelect format:\nA - Audio\nD - Document`
            }, { quoted: msg });

            global.playQueue = global.playQueue || {};
            global.playQueue[from] = {
                audioUrl: song.downloadUrl,
                title: title,
                urlYt: urlYt,
                audioSent: false,
                documentSent: false
            };

        } catch (error) {
            console.error('Error in play command:', error);

            let errorMessage = "Failed to download song.";

            if (error.code === 'ENOTFOUND') {
                errorMessage = "Network error.";
            } else if (error.response?.status === 429) {
                errorMessage = "Too many requests.";
            } else if (error.message.includes('timeout')) {
                errorMessage = "Request timeout.";
            }

            await context.reply(errorMessage);
        }
    }
  },
  {
    name: 'tiktok',
    aliases: ['tt', 'tiktokdl', 'tiktokvideo'],
    category: 'downloader',
    description: 'Download TikTok videos',
    usage: 'tiktok <tiktok_url>',

    async execute(sock, message, args, context) {
        try {
            const { chatId, reply, react } = context;

            if (processedMessages.has(message.key.id)) {
                return;
            }

            processedMessages.add(message.key.id);

            setTimeout(() => {
                processedMessages.delete(message.key.id);
            }, 5 * 60 * 1000);

            const url = args.slice(1).join(' ').trim();

            if (!url) {
                return await reply("Please provide a TikTok URL.\n\nUsage: .tiktok <url>");
            }

            const tiktokPatterns = [
                /https?:\/\/(?:www\.)?tiktok\.com\//,
                /https?:\/\/(?:vm\.)?tiktok\.com\//,
                /https?:\/\/(?:vt\.)?tiktok\.com\//,
                /https?:\/\/(?:www\.)?tiktok\.com\/@/,
                /https?:\/\/(?:www\.)?tiktok\.com\/t\//
            ];
            const isValidUrl = tiktokPatterns.some(pattern => pattern.test(url));

            if (!isValidUrl) {
                return await reply("Invalid TikTok URL.");
            }

            await react('🔄');

            try {
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

                for (const apiUrl of apis) {
                    try {
                        const response = await axios.get(apiUrl, { timeout: 10000 });

                        if (response.data) {
                            if (response.data.result && response.data.result.videoUrl) {
                                videoUrl = response.data.result.videoUrl;
                                audioUrl = response.data.result.audioUrl;
                                title = response.data.result.title;
                                break;
                            } else if (response.data.tiktok && response.data.tiktok.video) {
                                videoUrl = response.data.tiktok.video;
                                break;
                            } else if (response.data.video) {
                                videoUrl = response.data.video;
                                break;
                            }
                        }
                    } catch (apiError) {
                        continue;
                    }
                }

                if (!videoUrl) {
                    return await reply("Failed to download video.");
                }

                try {
                    const videoResponse = await axios.get(videoUrl, {
                        responseType: 'arraybuffer',
                        timeout: 30000,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                        }
                    });

                    const videoBuffer = Buffer.from(videoResponse.data);

                    const caption = title ?
                        `TikTok Video\nTitle: ${title}\nDownloaded by DAVE-MD` :
                        "TikTok Video\nDownloaded by DAVE-MD";

                    await reply({
                        video: videoBuffer,
                        mimetype: "video/mp4",
                        caption: caption
                    });

                    if (audioUrl) {
                        try {
                            const audioResponse = await axios.get(audioUrl, {
                                responseType: 'arraybuffer',
                                timeout: 30000,
                                headers: {
                                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                                }
                            });

                            const audioBuffer = Buffer.from(audioResponse.data);

                            await reply({
                                audio: audioBuffer,
                                mimetype: "audio/mp3",
                                caption: "TikTok Audio\nDownloaded by DAVE-MD"
                            });
                        } catch (audioError) {
                            console.error(`Failed to download audio: ${audioError.message}`);
                        }
                    }

                    await react('✅');
                    return;

                } catch (downloadError) {
                    console.error(`Failed to download video: ${downloadError.message}`);

                    try {
                        const caption = title ?
                            `TikTok Video\nTitle: ${title}\nDownloaded by DAVE-MD` :
                            "TikTok Video\nDownloaded by DAVE-MD";

                        await reply({
                            video: { url: videoUrl },
                            mimetype: "video/mp4",
                            caption: caption
                        });

                        await react('✅');
                        return;

                    } catch (urlError) {
                        console.error(`URL method failed: ${urlError.message}`);
                    }
                }

                await react('❌');
                return await reply("Download failed.");

            } catch (error) {
                console.error('TikTok download error:', error);
                await react('❌');
                await reply("Download error.");
            }

        } catch (error) {
            console.error('TikTok command error:', error);
            await context.react('❌');
            await context.reply("Command error.");
        }
    }
  }
];