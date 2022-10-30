import { addTodoChannel, addTodoMessage, removeTodoChannel } from './../db.js';
import { CommandInteraction, Message, TextChannel, MessageType } from "discord.js";
import { Discord, SimpleCommand, SimpleCommandMessage, Slash } from "discordx";

@Discord()
export class ChannelCommands {
    async watchChannel(command: CommandInteraction | Message): Promise<void> {
        await addTodoChannel(command.guildId ?? '', command.channelId);
        await command.reply('Watch channel ``' + command.channelId + '``.');
    }

    @Slash({ name: 'watch-channel', description: 'watch-channel', defaultMemberPermissions: '16' })
    slashWatchChannel(command: CommandInteraction): void {
        this.watchChannel(command);
    }

    async stopWatchChannel(command: CommandInteraction | Message): Promise<void> {
        await removeTodoChannel(command.guildId ?? '', command.channelId);
        await command.reply('Stop watching Channel ``' + command.channelId + '``.');
    }

    @Slash({ name: 'stop-watch-channel', description: 'stop-watch-channel', defaultMemberPermissions: '16' })
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

    @Slash({ name: 'check-cache', description: 'check-cache', defaultMemberPermissions: '16' })
    slashCheckCacheMessage(command: CommandInteraction): void {
        this.checkCacheMessage(command);
    }
}