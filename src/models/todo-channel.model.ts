import { DataTypes } from 'sequelize';
import { sequelize } from './db.js';

export const TodoChannel = sequelize.define('TodoChannel', {
    channelId: DataTypes.STRING,
    guildId: DataTypes.STRING
});

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