import { addTodoChannel, addTodoMessage, removeTodoChannel } from '../db.js';
import { CommandInteraction, Message, TextChannel, MessageType } from 'discord.js';
import { Discord, Slash, SlashGroup } from 'discordx';

@Discord()
@SlashGroup({ description: 'Manage todo list channel', name: 'todo-channel', defaultMemberPermissions: '16' })
@SlashGroup('todo-channel')
export class TodoChannelCommands {
    async watchChannel(command: CommandInteraction | Message): Promise<void> {
        await addTodoChannel(command.guildId ?? '', command.channelId);
        await command.reply('Watch channel ``' + command.channelId + '``.');
    }

    @Slash({ name: 'watch', description: 'Watch this channel as a todo list' })
    slashWatchChannel(command: CommandInteraction): void {
        this.watchChannel(command);
    }

    async stopWatchChannel(command: CommandInteraction | Message): Promise<void> {
        await removeTodoChannel(command.guildId ?? '', command.channelId);
        await command.reply('Stop watching Channel ``' + command.channelId + '``.');
    }

    @Slash({ name: 'stop-watch', description: 'Stop watching this channel as a todo list' })
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

    @Slash({ name: 'check-cache', description: 'Check the cache for todo messages' })
    slashCheckCacheMessage(command: CommandInteraction): void {
        this.checkCacheMessage(command);
    }
}