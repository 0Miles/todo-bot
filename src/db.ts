import { Message } from 'discord.js';
import { Sequelize, DataTypes } from 'sequelize';

const sequelize = new Sequelize({
    username: 'root',
    password: 'root',
    storage: 'storage.sqlite',
    host: 'localhost',
    dialect: 'sqlite',
    logging: false
});

export const TodoMessage = sequelize.define('TodoMessage', {
    messageId: DataTypes.STRING,
    channelId: DataTypes.STRING,
    guildId: DataTypes.STRING,
    createdAt: DataTypes.DATE
});

export const TodoChannel = sequelize.define('TodoChannel', {
    channelId: DataTypes.STRING,
    guildId: DataTypes.STRING
});

await sequelize.sync();

export const getTodoChannels = async () => {
    return await TodoChannel.findAll();
}

export const findTodoChannel = async (guildId: string, channelId: string) => {
    return await TodoChannel.findOne({
        where: {
            channelId: channelId,
            guildId: guildId
        }
    });
}

export const addTodoChannel = async (guildId: string, channelId: string) => {
    await TodoChannel.create({
        channelId: channelId,
        guildId: guildId
    });
}

export const removeTodoChannel = async (guildId: string, channelId: string) => {
    await TodoChannel.destroy({
        where: {
            channelId: channelId,
            guildId: guildId
        }
    });
}

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