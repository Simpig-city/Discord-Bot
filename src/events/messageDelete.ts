import discord from 'discord.js';

const config = require('../config.json');
const logChannelID = config.discord.logChannel;

const {GetDB} = require('../database/connectionhandler');

export async function MessageDelete(message: discord.Message, client: discord.Client) {
    if(message.author.bot) return;

    const logChannel = client.channels.cache.get(logChannelID) as discord.TextChannel;
    if(!logChannel) return;
    let messageAuthor = message.author;
    let messageContent = message.content;
    let messageChannel = message.channel;
    let messageTimestamp = message.createdAt;
    let messageID = message.id;

    if(!messageContent) messageContent = "Error";
    if(!messageID) messageID = "Error";

    const embed = new discord.MessageEmbed()
        .setTitle('Nachricht gelöscht')
        .setDescription(`Nachricht von ${messageAuthor} in ${messageChannel} gelöscht`)
        .setColor('RED')
        .setTimestamp()
        .setFooter({
            text: messageAuthor.tag,
            iconURL: messageAuthor.displayAvatarURL()
        })
        .addFields([
            {
                name: 'Nachricht',
                value: messageContent
            },
            {
                name: 'Nachrichten ID',
                value: messageID
            },
            {
                name: 'Nachrichten Zeitstempel',
                value: messageTimestamp.toString()
            }
        ]);
    
    await logChannel.send({ embeds: [embed] });

    const connection = await GetDB();

    await connection.query(`INSERT INTO message_log (id, user, content, channel, time) VALUES ('${messageID}', '${messageAuthor.id}', '${messageContent}', '${messageChannel.id}', '${messageTimestamp}')`);
}
