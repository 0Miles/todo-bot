import { findRoleEmoji } from './../models/role-emoji.model.js';
import { MessageReaction, PartialMessageReaction } from 'discord.js';
import type { ArgsOf, Client } from 'discordx';
import { Discord, On } from 'discordx';
import { findRoleReceiveMessage } from '../models/role-receive-message.model.js';


async function getRoldByMessageReaction(messageReaction: MessageReaction | PartialMessageReaction) {
    if (await findRoleReceiveMessage(messageReaction.message.guildId as string, messageReaction.message.channelId, messageReaction.message.id)) {
        const roleEmoji = await findRoleEmoji(messageReaction.message.guildId as string, messageReaction.emoji.id ? '' : messageReaction.emoji.name ?? '', messageReaction.emoji.id ?? '');
        const role = messageReaction.message.guild?.roles.cache.find(x => x.id === roleEmoji?.getDataValue('roleId'));
        return role;
    }
    return null;
}

@Discord()
export class RoleEmojiEvents {


    @On()
    async messageReactionAdd([messageReaction]: ArgsOf<'messageReactionAdd'>, client: Client): Promise<void> {
        try {
            const role = await getRoldByMessageReaction(messageReaction);
            if (role) {
                const fullMessage = await messageReaction.message.channel?.messages.fetch({ message: messageReaction.message.id });
                await fullMessage.member?.roles.add(role);
            }
        } catch (ex) {
            console.error(ex);
        }
    }


    @On()
    async messageReactionRemove([messageReaction]: ArgsOf<'messageReactionRemove'>, client: Client): Promise<void> {
        try {
            const role = await getRoldByMessageReaction(messageReaction);
            if (role) {
                const fullMessage = await messageReaction.message.channel?.messages.fetch({ message: messageReaction.message.id });
                await fullMessage.member?.roles.remove(role);
            }
        } catch (ex) {
            console.error(ex);
        }
    }
}