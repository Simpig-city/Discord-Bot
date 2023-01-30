import discord from 'discord.js';

const { statsUpdater } = require('../modules/stats/statsupdater');

const config = require('../config.json');
const logChannelID = config.discord.logChannel;

export async function GuildMemberRemove(member: discord.GuildMember, client: discord.Client) {
    await statsUpdater(client);

    const logChannel = client.channels.cache.get(logChannelID) as discord.TextChannel;
    if(!logChannel) return;
    const embed = new discord.MessageEmbed()
        .setTitle('Member left')
        .setDescription(`${member.user.tag} left the server`)
        .setColor('RED')
        .setTimestamp()
        .setFooter({
            text: member.user.tag,
            iconURL: member.user.displayAvatarURL()
        })
        
    await logChannel.send({ embeds: [embed] });

}