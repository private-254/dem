const moment = require('moment-timezone');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

async function githubCommand(sock, chatId, message) {
/*━━━━━━━━━━━━━━━━━━━━*/
// fake kontak 
/*━━━━━━━━━━━━━━━━━━━━*/
   
   function createFakeContact(message) {
    return {
        key: {
            participants: "0@s.whatsapp.net",
            remoteJid: "status@broadcast",
            fromMe: false,
            id: "ᴅᴀᴠᴇ-ᴍᴅ"
        },
        message: {
            contactMessage: {
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:ᴅᴀᴠᴇ-ᴍᴅ\nitem1.TEL;waid=${message.key.participant?.split('@')[0] || message.key.remoteJid.split('@')[0]}:${message.key.participant?.split('@')[0] || message.key.remoteJid.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
            }
        },
        participant: "0@s.whatsapp.net"
    };
}

  try {
  
  const fkontak = createFakeContact(message);
    
const pushname = message.pushName || "Unknown User";
    const res = await fetch('https://api.github.com/repos/vinpink2/ᴅᴀᴠᴇ-ᴍᴅ');
    if (!res.ok) throw new Error('Error fetching repository data');
    const json = await res.json();

    let txt = 
           `🔹  \`𝙹𝚄𝙽𝙴  𝚁𝙴𝙿𝙾 𝙸𝙽𝙵𝙾.\` \n\n`;
    txt += `🔸  *Name* : ${json.name}\n`;
    txt += `🔸  *Watchers* : ${json.watchers_count}\n`;
    txt += `🔸  *Size* : ${(json.size / 1024).toFixed(2)} MB\n`;
    txt += `🔸  *Last Updated* : ${moment(json.updated_at).format('DD/MM/YY - HH:mm:ss')}\n`;
    txt += `🔸  *REPO* : ${json.html_url}\n\n`;    
    txt += `🔹  *Forks* : ${json.forks_count}\n`;
    txt += `🔹  *Stars* : ${json.stargazers_count}\n`;
    txt += `🔹  *Desc* : ${json.description || 'None'}\n\n`;
    txt += `Hey👋 ${pushname} _Thank you for choosing June, Fork-Star the repository_`;

    // Use the local asset image
    const imgPath = path.join(__dirname, '../assets/menu2.jpg');
    const imgBuffer = fs.readFileSync(imgPath);

    /*await sock.sendMessage(chatId, { image: imgBuffer, caption: txt }, { quoted: message });*/
               await sock.sendMessage(chatId, {
                image: imgBuffer,
                caption: txt,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: false,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '@newsletter',
                        newsletterName: 'June Official',
                        serverMessageId: -1
                    }
                }
            },{ quoted: fkontak });   
      
      
      
//arect sucess💉
    await sock.sendMessage(chatId, {
            react: { text: '✔️', key: message.key }
        });
    
  } catch (error) {
    await sock.sendMessage(chatId, { text: '❌ Error fetching repository information.' }, { quoted: message });
  }
}

module.exports = githubCommand; 
