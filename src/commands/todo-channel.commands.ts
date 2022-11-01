import { addTodoMessage } from '../models/todo-message.model.js';
import { addTodoChannel, findTodoChannel, removeTodoChannel } from '../models/todo-channel.model.js';
import { CommandInteraction, TextChannel, MessageType } from 'discord.js';
import { Discord, Slash, SlashGroup } from 'discordx';

@Discord()
@SlashGroup({ description: 'Manage todo list channel', name: 'todo-channel', defaultMemberPermissions: '16' })
@SlashGroup('todo-channel')
export class TodoChannelCommands {

    @Slash({ name: 'watch', description: 'Watch this channel as a todo list' })
    async watchChannel(command: CommandInteraction): Promise<void> {
        const recordedTodoChannel = await findTodoChannel(command.guildId as string, command.channelId);
        if (!recordedTodoChannel) {
            await addTodoChannel(command.guildId as string, command.channelId);
            await command.reply({ content: `Channel \`\`${command.channelId}\`\` watched.`, flags: 'Ephemeral' });
        } else {
            await command.reply({ content: `Channel \`\`${command.channelId}\`\` has been watched.`, flags: 'Ephemeral' });
        }        
    }

    @Slash({ name: 'stop-watch', description: 'Stop watching this channel as a todo list' })
    async stopWatchChannel(command: CommandInteraction): Promise<void> {
        const recordedTodoChannel = await findTodoChannel(command.guildId as string, command.channelId);
        if (recordedTodoChannel) {
            await removeTodoChannel(command.guildId as string, command.channelId);
            await command.reply({ content: `Channel \`\`${command.channelId}\`\` has stopped watch.`, flags: 'Ephemeral' });
        } else {
            await command.reply({ content: `Channel \`\`${command.channelId}\`\` not watched.`, flags: 'Ephemeral' });
        }
    }

    @Slash({ name: 'check-cache', description: 'Check the cache for todo messages' })
    async checkCacheMessage(command: CommandInteraction): Promise<void> {
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