import { findRoleEmoji } from './../models/role-emoji.model.js';
import { MessageReaction, PartialMessageReaction, User } from 'discord.js';
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
    async messageReactionAdd([messageReaction, user]: ArgsOf<'messageReactionAdd'>, client: Client): Promise<void> {
        try {
            if (user.id !== client.user?.id) {
                const role = await getRoldByMessageReaction(messageReaction);
                if (role) {
                    const member = await messageReaction.message.guild?.members.cache.find(x => x.id === user.id);
                    await member?.roles.add(role);
                }
            }
        } catch (ex) {
            console.error(ex);
        }
    }


    @On()
    async messageReactionRemove([messageReaction, user]: ArgsOf<'messageReactionRemove'>, client: Client): Promise<void> {
        try {
            if (user.id !== client.user?.id) {
                const role = await getRoldByMessageReaction(messageReaction);
                if (role) {
                    const member = await messageReaction.message.guild?.members.cache.find(x => x.id === user.id);
                    await member?.roles.remove(role);
                }
            }
            
        } catch (ex) {
            console.error(ex);
        }
    }
}