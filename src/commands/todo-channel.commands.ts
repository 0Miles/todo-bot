import { addTodoChannel, addTodoMessage, removeTodoChannel } from '../db.js';
import { CommandInteraction, Message, TextChannel, MessageType } from 'discord.js';
import { Discord, Slash, SlashGroup } from 'discordx';

@Discord()
@SlashGroup({ description: 'Manage todo list channel', name: 'todo-channel', defaultMemberPermissions: '16' })
@SlashGroup('todo-channel')
export class TodoChannelCommands {

    @Slash({ name: 'watch', description: 'Watch this channel as a todo list' })
    async slashWatchChannel(command: CommandInteraction): Promise<void> {
        await addTodoChannel(command.guildId ?? '', command.channelId);
        await command.reply({ content: 'Watch channel ``' + command.channelId + '``.', flags: 'Ephemeral' });
    }

    @Slash({ name: 'stop-watch', description: 'Stop watching this channel as a todo list' })
    async slashStopWatchChannel(command: CommandInteraction): Promise<void> {
        await removeTodoChannel(command.guildId ?? '', command.channelId);
        await command.reply({ content: 'Stop watching Channel ``' + command.channelId + '``.', flags: 'Ephemeral' });
    }

    @Slash({ name: 'check-cache', description: 'Check the cache for todo messages' })
    async slashCheckCacheMessage(command: CommandInteraction): Promise<void> {
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
        await command.reply({ content: 'Checked.', flags: 'Ephemeral' });
    }
}