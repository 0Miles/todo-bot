import type { ArgsOf, Client } from 'discordx';
import { Discord, On } from 'discordx';
import { RconForwardChannel } from '../models/rcon-forward-channel.model.js';
import Rcon from 'rcon';
import { Message } from 'discord.js';

const connectionMap: any = {};

const send = (message: Message, host: string, port: number, password: string, content: string) => {
    const connectionName = `${host}:${port}`;
    if (!connectionMap[connectionName]) {
        connectionMap[connectionName] = {
            conn: new Rcon(host, port, password),
            channel: message.channel,
            authenticated: false,
            queuedCommands: []
        };
        connectionMap[connectionName].conn.on('auth', () => {
            connectionMap[connectionName].authenticated = true;
            for (const command of connectionMap[connectionName].queuedCommands) {
                connectionMap[connectionName].conn.send(command);
            }
            connectionMap[connectionName].queuedCommands = [];
        }).on('response', (str: string) => {
            connectionMap[connectionName].channel.send({
                embeds: [{
                    color: 0x00FFFF,
                    title: str
                }]
            });
        }).on('error', (err: Error) => {
            connectionMap[connectionName].channel.send({
                embeds: [{
                    color: 0xFF0000,
                    title: err.message
                }]
            });
        }).on('end', () => {
            delete connectionMap[connectionName];
        });

        connectionMap[connectionName].conn.connect();
    }

    if (connectionMap[connectionName].authenticated) {
        connectionMap[connectionName].conn.send(content);
    } else {
        connectionMap[connectionName].queuedCommands.push(content);
    }
}

@Discord()
export class TodoChannelEvents {
    @On()
    async messageCreate([message]: ArgsOf<'messageCreate'>, client: Client): Promise<void> {
        try {
            const existingRecord = await await RconForwardChannel.findOne({
                where: {
                    channelId: message.channelId,
                    guildId: message.guildId
                }
            });

            if (existingRecord) {
                const triggerPrefix: string = existingRecord.getDataValue('triggerPrefix');
                const commandPrefix: string = existingRecord.getDataValue('commandPrefix');
                if (message.content.startsWith(triggerPrefix)) {
                    const command = commandPrefix + message.content.substring(triggerPrefix.length);
                    send(message, existingRecord.getDataValue('host'), existingRecord.getDataValue('port'), existingRecord.getDataValue('password'), command);
                }
            }
        } catch (ex) {
            console.error(ex);
        }
    }
}