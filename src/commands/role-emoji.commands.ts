import { CommandInteraction, ApplicationCommandOptionType, Role } from 'discord.js';
import { Discord, Slash, SlashGroup, SlashOption } from 'discordx';
import { addRoleEmoji, removeRoleEmoji, findRoleEmoji, findGuildAllRoleEmojis } from '../models/role-emoji.model.js';
import { findRoleReceiveMessage, addRoleReceiveMessage, removeRoleReceiveMessage } from '../models/role-receive-message.model.js';

@Discord()
@SlashGroup({ description: 'Manage role emoji', name: 'role-emoji', defaultMemberPermissions: '268435456' })
@SlashGroup('role-emoji')
export class RoleEmojiCommands {
    @Slash({ name: 'add', description: 'Add a new role emoji' })
    async add(
        @SlashOption({
            description: "emoji",
            name: "emoji",
            required: true,
            type: ApplicationCommandOptionType.String,
        }) emoji: string,
        @SlashOption({
            description: "role",
            name: "role",
            required: true,
            type: ApplicationCommandOptionType.Role,
        }) role: Role,
        command: CommandInteraction): Promise<void> {
        try {
            const emojiMatch = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])|^<(a?:[^:>]+:)([^>]+)>$/.exec(emoji);
            if (!emojiMatch) {
                await command.reply({ content: `\`\`${emoji}\`\` is not an emoji.`, flags: 'Ephemeral' });
            } else {
                const recordedRoleEmoji = await findRoleEmoji(command.guildId as string, emojiMatch[1] ?? '', emojiMatch[3] ?? '');
                if (!recordedRoleEmoji) {
                    await addRoleEmoji(command.guildId as string, role.id, emojiMatch[1] ?? '', emojiMatch[2] ?? '', emojiMatch[3] ?? '')
                    await command.reply({ content: `${emoji} = \`\`${role.name}\`\` added.`, flags: 'Ephemeral' });
                } else {
                    const mappedRole = command.guild?.roles.cache.find(x => x.id === recordedRoleEmoji.getDataValue('roleId'));
                    await command.reply({ content: `${emoji} has been mapped by \`\`${mappedRole?.name}\`\`.`, flags: 'Ephemeral' });
                }
            }
        } catch (ex) {
            console.error(ex);
        }
    }

    @Slash({ name: 'remove', description: 'Remove a role emoji' })
    async remove(
        @SlashOption({
            description: "emoji",
            name: "emoji",
            required: true,
            type: ApplicationCommandOptionType.String,
        }) emoji: string,
        command: CommandInteraction): Promise<void> {
        try {
            const emojiMatch = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])|^<(a?:[^:>]+:)([^>]+)>$/.exec(emoji);
            if (!emojiMatch) {
                await command.reply({ content: `\`\`${emoji}\`\` is not an emoji.`, flags: 'Ephemeral' });
            } else {
                const recordedRoleEmoji = await findRoleEmoji(command.guildId as string, emojiMatch[1] ?? '', emojiMatch[3] ?? '');
                if (recordedRoleEmoji) {
                    const mappedRole = command.guild?.roles.cache.find(x => x.id === recordedRoleEmoji.getDataValue('roleId'));
                    await removeRoleEmoji(command.guildId as string, emojiMatch[1] ?? '', emojiMatch[3] ?? '')
                    await command.reply({ content: `${emoji} = \`\`${mappedRole?.name}\`\` removed.`, flags: 'Ephemeral' });
                } else {
                    await command.reply({ content: `No records found for ${emoji}.`, flags: 'Ephemeral' });
                }
            }
        } catch (ex) {
            console.error(ex);
        }
    }

    @Slash({ name: 'list', description: 'List all role emoji' })
    async list(command: CommandInteraction): Promise<void> {
        try {
            const allRoleEmojis = await findGuildAllRoleEmojis(command.guildId as string);
            const result = allRoleEmojis
                .map(x => {
                    const emojiChar = x.getDataValue('emojiChar');
                    const emojiId = x.getDataValue('emojiId');
                    const emojiName = x.getDataValue('emojiName');
                    const mappedRole = command.guild?.roles.cache.find(eachRole => eachRole.id === x.getDataValue('roleId'));
                    if (emojiChar) {
                        return `${emojiChar} = \`\`${mappedRole?.name}\`\``
                    } else {
                        return `<${emojiName}${emojiId}> = \`\`${mappedRole?.name}\`\``
                    }
                })
                .join('\n');
            await command.reply({ content: result ? result : 'No role emoji.', flags: 'Ephemeral' });
        } catch (ex) {
            console.error(ex);
        }
    }

    @Slash({ name: 'watch-message', description: 'Watch a message\'s reactions' })
    async watchMessage(
        @SlashOption({
            description: "Message ID",
            name: "message-id",
            required: true,
            type: ApplicationCommandOptionType.String,
        }) messageId: string,
        command: CommandInteraction): Promise<void> {
        try {
            const message = await command.channel?.messages.fetch({ message: messageId });
            if (message) {
                const recordedRoleReceiveMessage = await findRoleReceiveMessage(command.guildId as string, command.channelId, messageId);
                if (!recordedRoleReceiveMessage) {
                    const allRoleEmojis = await findGuildAllRoleEmojis(command.guildId as string);
                    for (const emojiIdOrChar of allRoleEmojis.map(x => x.getDataValue('emojiChar') ? x.getDataValue('emojiChar') : x.getDataValue('emojiId'))) {
                        const emoji = command.guild?.emojis.resolve(emojiIdOrChar);
                        await message.react(emoji ?? emojiIdOrChar);
                    }
                    await addRoleReceiveMessage(command.guildId as string, command.channelId, messageId);
                    await command.reply({ content: `Message \`\`${messageId}\`\` watched.`, flags: 'Ephemeral' });
                } else {
                    await command.reply({ content: `Message \`\`${messageId}\`\` has been watched.`, flags: 'Ephemeral' });
                }
            } else {
                await command.reply({ content: `Message \`\`${messageId}\`\` does not exist.`, flags: 'Ephemeral' });
            }
        } catch (ex) {
            console.error(ex);
        }
    }

    @Slash({ name: 'stop-watch-message', description: 'Stop watching a message\'s reactions' })
    async stopWatchMessage(
        @SlashOption({
            description: "Message ID",
            name: "message-id",
            required: true,
            type: ApplicationCommandOptionType.String,
        }) messageId: string,
        command: CommandInteraction): Promise<void> {
        try {
            const message = await command.channel?.messages.fetch({ message: messageId });
            if (message) {
                const recordedRoleReceiveMessage = await findRoleReceiveMessage(command.guildId as string, command.channelId, messageId);
                if (recordedRoleReceiveMessage) {
                    await removeRoleReceiveMessage(command.guildId as string, command.channelId, messageId);
                    await command.reply({ content: `Message \`\`${messageId}\`\` has stopped watch.`, flags: 'Ephemeral' });
                } else {
                    await command.reply({ content: `Message \`\`${messageId}\`\` not watched.`, flags: 'Ephemeral' });
                }
            } else {
                await command.reply({ content: `Message \`\`${messageId}\`\` does not exist.`, flags: 'Ephemeral' });
            }
        } catch (ex) {
            console.error(ex);
        }
    }
}