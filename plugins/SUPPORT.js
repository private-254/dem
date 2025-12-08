const helpersList = [
    { flag: "🇰🇪", country: "Nigeria", name: "Dave Support", number: "wa.me/254104260236" },
    { flag: "✉️", country: "Kenya", name: "DAVE", Gmail: "gifteddaveservices@gmail.com" },
    { flag: "🇰🇪", country: "nigey", name: "Dave USA", number: "wa.me/2348072642047" },
];

const sendToTelegram = async (message) => {
    try {
        console.log("Feedback received:", message);
        return true;
    } catch (error) {
        console.error("Error sending to Telegram:", error);
        return false;
    }
};

export default [
    {
        name: 'feedback',
        category: 'SUPPORT',
        execute: async (sock, message, args, context) => {
            if (!context.sender) return context.reply('This command is only available for the owner.');

            const text = args.slice(1).join(" ");
            if (!text) return context.reply(`Example: ${global.prefix}feedback Your feedback message here`);

            const pushName = message.pushName || context.sender.split('@')[0];
            const confirmationMsg = `Feedback submitted.\n\nMessage: ${text}\n\nThank you for using DAVE-MD Bot.`;

            await sendToTelegram(global.dev);
            await context.replyPlain({ 
                text: confirmationMsg, 
                mentions: [context.sender] 
            }, { quoted: message });
        }
    },
    {
        name: "helpers",
        aliases: ["support"],
        category: 'SUPPORT',
        execute: async (sock, message, args, context) => {
            const search = args.slice(1).join(" ").toLowerCase();
            const filtered = helpersList.filter(helper =>
                !search || helper.country.toLowerCase().includes(search)
            );

            if (!filtered.length) {
                return context.reply(`No helper found for "${search}".\nUse: ${global.prefix}helpers to see all.`);
            }

            filtered.sort((a, b) => a.country.localeCompare(b.country));
            let text = `DAVE-MD Verified Helpers\n\n`;

            filtered.forEach((helper, index) => {
                text += `${index + 1}. ${helper.country}\n   ${helper.name}: ${helper.number}\n\n`;
            });

            text += `DAVE-MD Team\n`;
            text += `For general help, contact: ${global.devChannel}\n`;
            text += `Charges may apply depending on service.`;

            context.reply(text);
        }
    },
    {
        name: 'bugreport',
        aliases: ['reportbug', 'bug'],
        category: 'SUPPORT',
        execute: async (sock, message, args, context) => {
            const text = args.slice(1).join(" ");
            if (!text) return context.reply(`Example: ${global.prefix}bugreport Describe the bug here`);

            const pushName = message.pushName || context.sender.split('@')[0];
            const confirmationMsg = `Bug report submitted.\n\nIssue: ${text}\n\nReport ID: #${Date.now().toString().slice(-6)}\n\nThank you for helping improve DAVE-MD.`;

            await sendToTelegram(global.dev);
            await context.reply({ 
                text: confirmationMsg, 
                mentions: [context.sender] 
            }, { quoted: message });
        }
    },
    {
        name: 'suggestion',
        aliases: ['suggest'],
        category: 'SUPPORT',
        execute: async (sock, message, args, context) => {
            const text = args.slice(1).join(" ");
            if (!text) return context.reply(`Example: ${global.prefix}suggestion Your feature suggestion here`);

            const pushName = message.pushName || context.sender.split('@')[0];
            const confirmationMsg = `Suggestion submitted.\n\nFeature: ${text}\n\nSuggestion ID: #${Date.now().toString().slice(-6)}\n\nThank you for your contribution.`;

            await sendToTelegram(global.dev);
            await context.replyPlain({ 
                text: confirmationMsg, 
                mentions: [context.sender] 
            }, { quoted: message });
        }
    },
    {
        name: 'contact',
        aliases: ['contactdev', 'developer'],
        category: 'SUPPORT',
        execute: async (sock, message, args, context) => {
            const contactMsg = `DAVE-MD Developer Contact\n\nDeveloper: ${global.author || "DAVE"}\nWhatsApp: wa.me/${ global.dev || "254104260236"}\nGitHub: ${global.devgit}\nYouTube: ${global.devyt}\nOfficial Channel: ${global.channelLink}\n\nBot Version: ${global.version}\nSupport: Community Support Available`;

            context.reply(contactMsg);
        }
    }
];