import { Client, Intents, Message } from "discord.js";

export const bot = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_VOICE_STATES,
    ]
});

bot.once("ready", async () => {
    await bot.guilds.fetch();
    console.log("Bot started");
});

const enabledChannel = [
    '981422936307146793',
    '927432745012047972'
];

bot.on("messageCreate", async (message: Message) => {
    try {
        if (enabledChannel.includes(message.channel.id) && !message.author.bot) {
            if (message.mentions.members?.find(x => x.id === bot.user?.id)) {
                const messages = await message.channel.messages.fetch({
                    limit: 100
                });
                const filteredMessage = [...messages
                    .filter(x =>
                        x.reactions.cache.size === 0 &&
                        (x.mentions.members?.size ?? 0) > 0 &&
                        (!x.mentions.members?.find(x => x.id === bot.user?.id) || x.type === 'REPLY')
                    ).values()
                ].reverse();
                for (const eachMessage of filteredMessage) {
                    try {
                        if (eachMessage.author.id === bot.user?.id && eachMessage.type === 'REPLY') {
                            await eachMessage.delete();
                        } else if (eachMessage.hasThread) {
                            await eachMessage.reply(eachMessage.content);
                        } else {
                            await message.channel.send(eachMessage.content);
                            await eachMessage.delete();
                        }
                    } catch (ex) {
                        console.error(ex);
                    }
                }
                await message.delete();
            }
        }
    } catch (ex) {
        console.error(ex);
    }
    
});

async function run() {
    await bot.login(process.env.BOT_TOKEN);
}

run();
