import { addTodoChannel, addTodoMessage, removeTodoChannel } from './../db.js';
import type { CommandInteraction, Message, TextChannel } from "discord.js";
import { Discord, SimpleCommand, SimpleCommandMessage, Slash } from "discordx";

@Discord()
export class ChannelCommands {
    async watchChannel(command: CommandInteraction | Message): Promise<void> {
        await addTodoChannel(command.guildId ?? '', command.channelId);
        await command.reply('Watch channel ``' + command.channelId + '``.');
    }

    @SimpleCommand("watch-channel")
    simpleWatchChannel(command: SimpleCommandMessage): void {
        this.watchChannel(command.message);
    }

    @Slash("watch-channel")
    slashWatchChannel(command: CommandInteraction): void {
        this.watchChannel(command);
    }

    async stopWatchChannel(command: CommandInteraction | Message): Promise<void> {
        await removeTodoChannel(command.guildId ?? '', command.channelId);
        await command.reply('Stop watching Channel ``' + command.channelId + '``.');
    }

    @SimpleCommand("stop-watch-channel")
    simpleStopWatchChannel(command: SimpleCommandMessage): void {
        this.stopWatchChannel(command.message);
    }

    @Slash("stop-watch-channel")
    slashStopWatchChannel(command: CommandInteraction): void {
        this.stopWatchChannel(command);
    }

    async checkCacheMessage(command: CommandInteraction | Message) {
        const channel = command.client.channels.cache.get(command.channelId) as TextChannel;
        const messages = await channel.messages.fetch({
            limit: 100
        }, {
            force: true
        });
        const filteredMessage = [...messages
            .filter(x =>
                x.reactions.cache.size === 0 &&
                (x.mentions.members?.size ?? 0) > 0 &&
                (!x.mentions.members?.find(x => x.id === command.client.user?.id) || x.type === 'REPLY')
            ).values()
        ].reverse();

        for (const eachMessage of filteredMessage) {
            await addTodoMessage(eachMessage);
        }
        await command.reply('Checked.');
    }

    @SimpleCommand("check-cache")
    simpleCheckCacheMessage(command: SimpleCommandMessage): void {
        this.checkCacheMessage(command.message);
    }

    @Slash("check-cache")
    slashCheckCacheMessage(command: CommandInteraction): void {
        this.checkCacheMessage(command);
    }
}