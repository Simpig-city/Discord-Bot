import { Client, TextChannel, MessageEmbed } from 'discord.js';

const { Connect } = require('../database/connectionhandler');
const { Init } = require('../database/initilize');
const { RegisterCommands } = require('../modules/commands/register');
const { statsUpdater } = require('../modules/stats/statsupdater');
const { WSConnect } = require('../modules/websocket/websocket');

const config = require('../config.json');
const logChannelID = config.discord.logChannel;

export async function Ready(client: Client) {
    if(!client.user) return console.log('Client user is undefined!');
    console.log(`Logged in as ${client.user.tag}!`);

    if(client.guilds.cache.size > 1) {
        console.error('WARNING: BOT DETECTED ON MULTIPLE GUILDS!')
    }

    await Connect();
    await Init();
    await RegisterCommands(client);
    await statsUpdater(client);
    await WSConnect(client);

    const logChannel = client.channels.cache.get(logChannelID) as TextChannel;
    if(!logChannel) return;
    const embed = new MessageEmbed()
        .setTitle('Bot gestartet')
        .setDescription('Der Bot wurde gestartet')
        .setColor('GREEN')
        .setTimestamp()
        .setFooter({
            text: client.user.tag,
            iconURL: client.user.displayAvatarURL()
        });

    await logChannel.send({ embeds: [embed] });
}