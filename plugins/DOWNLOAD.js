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
          const filePath = path.join(process.cwd(), `${data.data.fileName}.zip`);
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
  aliases: ["facebook", "fbdl", "ig", "instagram", "igdl"],
  category: "downloader",
  desc: "Download Facebook or Instagram videos/photos",
  usage: ".fb <link> or .ig <link>",

  execute: async (sock, m, args, context) => {
    const { chatId, reply, react } = context;
    const text = args.slice(1).join(' ').trim();

    if (!text) {
      return reply(`Provide a Facebook or Instagram link!\n\nExample: .fb <link> or .ig <link>`);
    }

    try {
      await react("⏳");

      await reply("Fetching media... Please wait!");

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
        return reply(`Error: ${res.error}`);
      }

      await reply("Media found! Downloading now...");

      if (res.type === "video") {
        await sock.sendMessage(chatId, {
          video: { url: res.media },
          caption: `Downloaded video from ${res.platform}!`
        }, { quoted: m });
      } else if (res.type === "image") {
        await sock.sendMessage(chatId, {
          image: { url: res.media },
          caption: `Downloaded photo from ${res.platform}!`
        }, { quoted: m });
      }

      await react("✅");
      await reply("Done!");

    } catch (error) {
      console.error('[FB/IG] Error:', error);
      await react("❌");
      return reply("Failed to get media.");
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