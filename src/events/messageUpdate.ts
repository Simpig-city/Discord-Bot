import discord from 'discord.js';

const config = require('../config.json');
const logChannelID = config.discord.logChannel;

export async function MessageUpdate(oldMessage: discord.Message, newMessage: discord.Message, client: discord.Client) {
    if(newMessage.author.bot) return;
    const logChannel = client.channels.cache.get(logChannelID) as discord.TextChannel;
    if(!logChannel) return;

    const messageAuthor = newMessage.author;
    const oldContent = oldMessage.content;
    const newContent = newMessage.content;
    const messageChannel = newMessage.channel;
    const messageTimestamp = newMessage.createdAt;

    if (oldContent === newContent) return;

    const embed = new discord.MessageEmbed()
        .setTitle('Nachricht bearbeitet')
        .setDescription(`Nachricht von ${messageAuthor} in ${messageChannel} bearbeitet`)
        .setColor('YELLOW')
        .setTimestamp()
        .setFooter({
            text: messageAuthor.tag,
            iconURL: messageAuthor.displayAvatarURL()
        })
        .addFields([
            {
                name: 'Alte Nachricht',
                value: oldContent
            },
            {
                name: 'Neue Nachricht',
                value: newContent
            },
            {
                name: "Nachrichten ID",
                value: newMessage.id
            },
            {
                name: 'Nachrichten Zeitstempel',
                value: messageTimestamp.toString()
            }

        ]);

    await logChannel.send({ embeds: [embed] });
}