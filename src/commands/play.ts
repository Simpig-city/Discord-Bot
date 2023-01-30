import discord from 'discord.js';
import ytdl from 'ytdl-core';
const yts = require('yt-search');
const queue = require('../modules/musicbot/queue');
const voiceHandler = require('../modules/musicbot/voiceHandler');

type Queue = {
    link: string,
    title: string,
    artist: string,
    requester: string,
    requestChannel: string,
}

export const name = 'play';
export const description = 'Spiele einen Song ab!';
export const options = [
    {
        name: 'song',
        description: 'Der Song, den du abspielen möchtest',
        type: 'STRING',
        required: true
    }
];
export const defaultMemberPermission = ['SEND_MESSAGES'];

export async function execute(interaction: discord.Interaction, client: discord.Client) {
    if(!interaction.isCommand()) return;
    const song = interaction.options.getString('song');
    const member: discord.GuildMember = interaction.guild.members.cache.get(interaction.user.id);
    const voiceChannel = member.voice.channel;
    const notInChannel = new discord.MessageEmbed()
        .setTitle('Du bist in keinem Sprachkanal!')
        .setDescription('Du musst in einem Sprachkanal sein, um diesen Befehl auszuführen!')
        .setColor('RED')
        .setTimestamp()
        .setFooter({
            text: interaction.user.tag,
            iconURL: interaction.user.displayAvatarURL()
        });
    if(!voiceChannel) return interaction.reply({ embeds: [notInChannel], ephemeral: true });

    

    const embed = new discord.MessageEmbed()
        .setTitle('Song wird gesucht...')
        .setDescription(`Bitte warte einen Moment, während ich nach dem Song \`${song}\` suche!`)
        .setColor('BLUE')
        .setTimestamp()
        .setFooter({
            text: interaction.user.tag,
            iconURL: interaction.user.displayAvatarURL()
        });
    await interaction.reply({ embeds: [embed] });

    let songInfo;
    let video = ytdl.validateURL(song);
    if(!video) {
        const search = await yts(song);
	
	const errorEmbed = new discord.MessageEmbed()
		.setTitle("Es wurde kein Song gefunden!")
		.setColor("RED")
		.setTimestamp()
		.setFooter({
			text: interaction.user.tag,
			iconURL: interaction.user.displayAvatarURL()
		});

	if(search.videos.length === 0) return interaction.editReply({ embeds: [errorEmbed] })

        songInfo = await ytdl.getInfo(search.videos[0].url);
    } else {
        songInfo = await ytdl.getInfo(song);
    }

    let json: Queue = {
        link: songInfo.videoDetails.video_url,
        title: songInfo.videoDetails.title,
        artist: songInfo.videoDetails.author.name,
        requester: interaction.user.id,
        requestChannel: interaction.channelId
    }

    const botChannel = interaction.guild.me.voice;
    //check if they are in the same channel
    if(voiceChannel.id === botChannel.channelId) {
        if(queue.getLength() > 0) {
            await queue.add(json.link, json.title, json.artist, json.requester);
            voiceHandler.start(interaction, client);
            const embed = new discord.MessageEmbed()
                .setTitle('Song wurde zur Warteschlange hinzugefügt!')
                .setDescription(`Der Song \`${json.title}\` wurde zur Warteschlange hinzugefügt!`)
                .setColor('YELLOW')
                .setTimestamp()
                .setFooter({
                    text: interaction.user.tag,
                    iconURL: interaction.user.displayAvatarURL()
                });
            await interaction.editReply({ embeds: [embed] });
            return;
        }else {
            await queue.add(json.link, json.title, json.artist, json.requester, json.requestChannel);
            voiceHandler.start(interaction, client);
            const embed = new discord.MessageEmbed()
                .setTitle('Song wird abgespielt!')
                .setDescription(`Der Song \`${json.title}\` wird abgespielt!`)
                .setColor('GREEN')
                .setTimestamp()
                .setFooter({
                    text: interaction.user.tag,
                    iconURL: interaction.user.displayAvatarURL()
                });
            await interaction.editReply({ embeds: [embed] });
            return;
        }
    }else {
        await queue.clear();
        await voiceHandler.stop();
        await queue.add(json.link, json.title, json.artist, json.requester);
        voiceHandler.start(interaction, client);
        const embed = new discord.MessageEmbed()
            .setTitle('Song wird abgespielt!')
            .setDescription(`Der Song \`${json.title}\` wird abgespielt!`)
            .setColor('GREEN')
            .setTimestamp()
            .setFooter({
                text: interaction.user.tag,
                iconURL: interaction.user.displayAvatarURL()
            });
        await interaction.editReply({ embeds: [embed] });
        return;
    }

}

