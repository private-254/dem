const axios = require('axios');
let trashplug = async (m, { trashown,text,davetech,reply,isAdmins }) => {
				if (!m.isGroup) return reply(mess.OnlyGrup);
				if (!isAdmins && !trashown) return reply(mess.admin);
			
				await davetech.groupRevokeInvite(m.chat)
					.then(res => {
						reply(mess.succes)
					}).catch(() => reply(mess.error))
				};
trashplug.help = ['restrict']
trashplug.tags = ['reset']
trashplug.command = ['revoke']


module.exports = trashplug;	