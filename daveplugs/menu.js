const axios = require('axios');
let trashplug = async (m, {davetech,replymenu,menu}) => {
replymenu(`${menu}
`)
    await davetech.sendMessage(m.chat, { 
           audio: { url: 'https://files.catbox.moe/189cve.mp3' },
           mimetype: 'audio/mp4', 
           ptt: false 
       },{ quoted: m }
     );
};
trashplug.help = ['davetech']
trashplug.tags = ['menu']
trashplug.command = ['menu']


module.exports = trashplug;