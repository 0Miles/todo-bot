import type { ArgsOf, Client } from 'discordx';
import { Discord, On } from 'discordx';
import { RconForwardChannel } from '../models/rcon-forward-channel.model.js';
import { Message, TextChannel } from 'discord.js';
import { FAILED_COLOR, SUCCEEDED_COLOR } from '../utils/constant.js';
// @ts-ignore
import Rcon from 'rcon';

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
            for(const channel of connectionMap[connectionName]?.channels ?? []) {
                channel.send({
                    embeds: [{
                        color: SUCCEEDED_COLOR,
                        title: str
                    }]
                });
            }
        }).on('error', (err: Error) => {
            connectionMap[connectionName].channel.send({
                embeds: [{
                    color: FAILED_COLOR,
                    title: err.message
                }]
            });
        }).on('end', () => {
            delete connectionMap[connectionName];
        });

        connectionMap[connectionName].conn.connect();
    }

    if (!connectionMap[connectionName].channels?.find((x: TextChannel) => x.id === message.channel.id)) {
        if (!connectionMap[connectionName].channels) {
            connectionMap[connectionName].channels = [message.channel]
        } else {
            connectionMap[connectionName].channels.push(message.channel)
        }
    }

    if (connectionMap[connectionName].authenticated) {
        connectionMap[connectionName].conn.send(content);
    } else {
        connectionMap[connectionName].queuedCommands.push(content);
    }
}

@Discord()
export class RconForwardChannelEvents {
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