import { addTodoChannel, addTodoMessage, removeTodoChannel } from './../db.js';
import { CommandInteraction, Message, TextChannel, MessageType } from "discord.js";
import { Discord, SimpleCommand, SimpleCommandMessage, Slash } from "discordx";

@Discord()
export class ChannelCommands {
    async watchChannel(command: CommandInteraction | Message): Promise<void> {
        await addTodoChannel(command.guildId ?? '', command.channelId);
        await command.reply('Watch channel ``' + command.channelId + '``.');
    }

    @SimpleCommand({ name: 'watch-channel' })
    simpleWatchChannel(command: SimpleCommandMessage): void {
        this.watchChannel(command.message);
    }

    @Slash({ name: 'watch-channel', description: 'watch-channel' })
    slashWatchChannel(command: CommandInteraction): void {
        this.watchChannel(command);
    }

    async stopWatchChannel(command: CommandInteraction | Message): Promise<void> {
        await removeTodoChannel(command.guildId ?? '', command.channelId);
        await command.reply('Stop watching Channel ``' + command.channelId + '``.');
    }

    @SimpleCommand({ name: 'stop-watch-channel' })
    simpleStopWatchChannel(command: SimpleCommandMessage): void {
        this.stopWatchChannel(command.message);
    }

    @Slash({ name: 'stop-watch-channel', description: 'stop-watch-channel' })
    slashStopWatchChannel(command: CommandInteraction): void {
        this.stopWatchChannel(command);
    }

    async checkCacheMessage(command: CommandInteraction | Message) {
        const channel = command.client.channels.cache.get(command.channelId) as TextChannel;
        const messages = await channel.messages.fetch({
            limit: 100,
            cache: false
        });
        const filteredMessage = [...messages
            .filter(x =>
                x.reactions.cache.size === 0 &&
                (x.mentions.members?.size ?? 0) > 0 &&
                (!x.mentions.members?.find(x => x.id === command.client.user?.id) || x.type === MessageType.Reply)
            ).values()
        ].reverse();

        for (const eachMessage of filteredMessage) {
            await addTodoMessage(eachMessage);
        }
        await command.reply('Checked.');
    }

    @SimpleCommand({ name: 'check-cache' })
    simpleCheckCacheMessage(command: SimpleCommandMessage): void {
        this.checkCacheMessage(command.message);
    }

    @Slash({ name: 'check-cache', description: 'check-cache' })
    slashCheckCacheMessage(command: CommandInteraction): void {
        this.checkCacheMessage(command);
    }
}