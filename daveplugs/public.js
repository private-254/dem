const axios = require("axios");
 
let trashplug = async (m, { trashown,reply,davetech }) => {
                if (!trashown) return reply(mess.owner)
                davetech.private = false
                reply('*Successful in Changing To public Usage*')
            };
            
trashplug.help = ['public']
trashplug.tags = ['public']
trashplug.command = ['public']
 
module.exports = trashplug;
