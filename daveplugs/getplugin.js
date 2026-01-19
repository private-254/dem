const fs = require("fs")

let trashplug = async (m, { davetech,trashown, reply, text, example }) => {
if (!trashown) return reply(mess.owner)  
if (!text) return reply("provide a plugin name")
if (!text.endsWith(".js")) return m.reply("file name must end with  .js")
if (!fs.existsSync("./daveplugs/" + text.toLowerCase())) return reply("sucess!")
let res = await fs.readFileSync("./daveplugs/" + text.toLowerCase())
return reply(`${res.toString()}`)
}

trashplug.command = ["getp", "gp", "getplugins", "getplugin"]

module.exports = trashplug