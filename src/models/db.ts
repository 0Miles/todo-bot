import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize({
    username: 'root',
    password: 'root',
    storage: 'storage.sqlite',
    host: 'localhost',
    dialect: 'sqlite',
    logging: false
});

