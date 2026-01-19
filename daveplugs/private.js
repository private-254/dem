const axios = require("axios");
 
let trashplug = async (m, { trashown,reply,davetech }) => {
                if (!trashown) return reply(mess.owner)
                davetech.public = false
                reply('*Successful in Changing To Self Usage*')
            };
            
trashplug.help = ['self']
trashplug.tags = ['private']
trashplug.command = ['private']
 
module.exports = trashplug;