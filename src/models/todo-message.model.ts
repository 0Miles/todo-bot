import { Message } from 'discord.js';
import { DataTypes } from 'sequelize';
import { sequelize } from './db.js';

export const TodoMessage = sequelize.define('TodoMessage', {
    messageId: DataTypes.STRING,
    channelId: DataTypes.STRING,
    guildId: DataTypes.STRING,
    createdAt: DataTypes.DATE
});

export const addTodoMessage = async (message: Message) => {
    await TodoMessage.findOrCreate({
        where: {
            messageId: message.id,
            channelId: message.channelId,
            guildId: message.guildId,
        },
        defaults: {
            messageId: message.id,
            channelId: message.channelId,
            guildId: message.guildId,
            createdAt: message.createdAt
        }
    });
}

export const removeTodoMessage = async (guildId: string, channelId: string, messageId: string) => {
    await TodoMessage.destroy({
        where: {
            channelId: channelId,
            messageId: messageId,
            guildId: guildId
        },
    });
}

export const getChannelTodoMessages = async (guildId: string, channelId: string) => {
    return await TodoMessage.findAll({
        where: {
            channelId: channelId,
            guildId: guildId
        },
        order: [
            ['createdAt', 'ASC']
        ],
    });
}