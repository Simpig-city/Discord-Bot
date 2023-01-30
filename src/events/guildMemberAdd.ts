import discord from 'discord.js';

const { statsUpdater } = require('../modules/stats/statsupdater');

const config = require('../config.json');
const logChannelID = config.discord.logChannel;

export async function GuildMemberAdd(member: discord.GuildMember, client: discord.Client) {
    await statsUpdater(client);

    const role = await member.guild.roles.cache.find(config.discord.autorole);
    await member.roles.add(role);

    const logChannel = client.channels.cache.get(logChannelID) as discord.TextChannel;
    if(!logChannel) return;

    const embed = new discord.MessageEmbed()
        .setTitle('Member joined')
        .setDescription(`${member.user.tag} joined the server`)
        .setColor('GREEN')
        .setTimestamp()
        .setFooter({
            text: member.user.tag,
            iconURL: member.user.displayAvatarURL()
        })

    await logChannel.send({ embeds: [embed] });
}
