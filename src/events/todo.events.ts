import { Message, TextChannel } from "discord.js";
import type { ArgsOf, Client } from "discordx";
import { Discord, On } from "discordx";
import { findTodoChannel, getTodoChannels, addTodoMessage, removeTodoMessage, getChannelTodoMessages } from "../db.js";

@Discord()
export class TodoEvents {

    async loadTodoMessage(message: Message) {
        const todoMessageIds = await getChannelTodoMessages(message.guildId ?? '', message.channelId);
        const messages: Message[] = [];
        await Promise.allSettled(todoMessageIds.map(x => {
            return new Promise<void>(async (resolve, rejects) => {
                message.channel.messages.fetch(x.getDataValue('messageId'))
                    .then(result => {
                        messages.push(result);
                        resolve();
                    })
                    .catch(_ => {
                        removeTodoMessage(x.getDataValue('guildId'), x.getDataValue('channelId'), x.getDataValue('messageId'))
                            .finally(() => {
                                rejects();
                            });
                    });
            })
        }));
        return messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    }

    @On("messageCreate")
    async onMessage([message]: ArgsOf<"messageCreate">, client: Client): Promise<void> {
        try {
            const channel = await findTodoChannel(message.guildId ?? '', message.channelId);
            if (channel && !message.author.bot) {
                if (message.mentions.members?.find(x => x.id === client.user?.id)) {
                    const todoMessages = await this.loadTodoMessage(message);

                    for (const eachMessage of todoMessages) {
                        try {
                            if (eachMessage.reactions.cache.size !== 0 || (eachMessage.mentions.members?.size ?? 0) === 0) {
                                await removeTodoMessage(eachMessage.guildId ?? '', eachMessage.channelId, eachMessage.id);
                            } else if (eachMessage.author.id === client.user?.id && eachMessage.type === 'REPLY') {
                                await eachMessage.delete();
                                await removeTodoMessage(eachMessage.guildId ?? '', eachMessage.channelId, eachMessage.id);
                            } else if (eachMessage.hasThread) {
                                const newMessage = await eachMessage.reply(eachMessage.content);
                                await addTodoMessage(newMessage);
                            } else {
                                const newMessage = await message.channel.send(eachMessage.content);
                                await addTodoMessage(newMessage);
                                await eachMessage.delete();
                                await removeTodoMessage(eachMessage.guildId ?? '', eachMessage.channelId, eachMessage.id);
                            }
                        } catch (ex) {
                            console.error(ex);
                        }
                    }
                    await message.delete();
                } else {
                    await addTodoMessage(message);
                }
            }
        } catch (ex) {
            console.error(ex);
        }
    }

    @On("messageReactionAdd")
    async onMessageReactionAdd([message]: ArgsOf<"messageReactionAdd">, client: Client): Promise<void> {
        try {
            const channel = await findTodoChannel(message.message.guildId ?? '', message.message.channelId);
            if (channel && (message.count ?? 0) > 0) {
                if (message.message.type === 'REPLY') {
                    const refMessage = await message.message.channel.messages.fetch(message.message.reference?.messageId ?? '');
                    if (refMessage) {
                        await refMessage.react('👍');
                    }
                }
                removeTodoMessage(message.message.guildId ?? '', message.message.channelId, message.message.id);
            }
        } catch (ex) {
            console.error(ex);
        }
    }

    @On("messageReactionRemove")
    async onmessageReactionRemove([message]: ArgsOf<"messageReactionRemove">, client: Client): Promise<void> {
        try {
            const channel = await findTodoChannel(message.message.guildId ?? '', message.message.channelId);
            if (channel && message.count === 0) {
                if (message.message.type === 'REPLY') {
                    const refMessage = await message.message.channel.messages.fetch(message.message.reference?.messageId ?? '');
                    if (refMessage) {
                        await refMessage?.reactions?.resolve('👍')?.remove();
                    }
                }
                addTodoMessage(message.message as Message);
            }

        } catch (ex) {
            console.error(ex);
        }
    }

}