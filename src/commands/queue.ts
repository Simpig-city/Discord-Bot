import discord from 'discord.js';
import * as queue from '../modules/musicbot/queue';
import ytdl from 'ytdl-core';
const yts = require('yt-search');

type Queue = {
    link: string,
    title: string,
    artist: string,
    requester: string,
    requestChannel: string,
}


export const name = 'queue';
export const description = 'Interagiere mit der Wateschlange';
export const options = [
    {
        name: 'add',
        description: 'Füge einen Song zur Warteschlange hinzu',
        type: 'SUB_COMMAND',
        options: [
            {
                name: 'song',
                description: 'Der Song, den du hinzufügen möchtest',
                type: 'STRING',
                required: true
            }
        ]
    },
    {
        name: 'remove',
        description: 'Entferne einen Song aus der Warteschlange',
        type: 'SUB_COMMAND',
        options: [
            {
                name: 'song',
                description: 'Der Song, den du entfernen möchtest',
                type: 'INTEGER',
                required: true
            }
        ]
    },
    {
        name: 'clear',
        description: 'Entferne alle Songs aus der Warteschlange',
        type: 'SUB_COMMAND'
    },
    {
        name: 'list',
        description: 'Liste alle Songs in der Warteschlange auf',
        type: 'SUB_COMMAND'
    }
];
export const defaultMemberPermission = ['SEND_MESSAGES'];

export async function execute(interaction: discord.Interaction, client: discord.Client) {
    if(!interaction.isCommand()) return;
    const subcommand = interaction.options.getSubcommand();

    switch(subcommand) {
        case 'add': {
            const voiceHandler = require('../modules/musicbot/voiceHandler');
            const notRunning = new discord.MessageEmbed()
                .setTitle('Es läuft zurzeit kein Song!')
                .setDescription('Du kannst keine Songs hinzufügen, wenn kein Song läuft! Bitte bneutze den Befehl `/play` um einen Song abzuspielen!')
                .setColor('RED')
                .setTimestamp()
                .setFooter({
                    text: interaction.user.tag,
                    iconURL: interaction.user.displayAvatarURL()
                });
            if(!voiceHandler.running) return interaction.reply({ embeds: [notRunning], ephemeral: true });
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
                songInfo = await ytdl.getInfo(search.videos[0].url);

		const errorEmbed = new discord.MessageEmbed()
			.setTitle("Es wurde kein Song gefunden!")
			.setColor("RED")
			.setTimestamp()
			.setFooter({
				text: interaction.user.tag,
				iconURL: interaction.user.displayAvatarURL()
			})

		if(search.videos.length === 0) return interaction.editReply({ embeds: [errorEmbed] })
            } else {
                songInfo = await ytdl.getInfo(song);
            }

            let songJson: Queue = {
                link: songInfo.videoDetails.video_url,
                title: songInfo.videoDetails.title,
                artist: songInfo.videoDetails.author.name,
                requester: interaction.user.id,
                requestChannel: interaction.channelId
            }

            const queueEmbed = new discord.MessageEmbed()
                .setTitle('Song wurde zur Warteschlange hinzugefügt!')
                .setDescription(`Der Song \`${songJson.title}\` wurde zur Warteschlange hinzugefügt!`)
                .setColor('GREEN')
                .setTimestamp()
                .setFooter({
                    text: interaction.user.tag,
                    iconURL: interaction.user.displayAvatarURL()
                });

            queue.add(songJson.link, songJson.title, songJson.artist, songJson.requester, songJson.requestChannel);

            interaction.editReply({ embeds: [queueEmbed] });
            break;
        }
        case 'remove': {
            let index = interaction.options.getInteger('song');
            console.log(index);
            index = index - 1;
            const length = queue.getLength();
            const notInQueue = new discord.MessageEmbed()
                .setTitle('Song nicht in der Warteschlange!')
                .setDescription(`Der Song mit dem Index \`${index + 1}\` ist nicht in der Warteschlange!`)
                .setColor('RED')
                .setTimestamp()
                .setFooter({
                    text: interaction.user.tag,
                    iconURL: interaction.user.displayAvatarURL()
                });
            if(index > length - 1 || index < 0) return interaction.reply({ embeds: [notInQueue], ephemeral: true });
            const queue2 = queue.get();
            const song = queue2[index];
            const queueEmbed = new discord.MessageEmbed()
                .setTitle('Song wurde aus der Warteschlange entfernt!')
                .setDescription(`Der Song \`${song.title}\` wurde aus der Warteschlange entfernt!`)
                .setColor('GREEN')
                .setTimestamp()
                .setFooter({
                    text: interaction.user.tag,
                    iconURL: interaction.user.displayAvatarURL()
                });
            queue.remove(index);
            interaction.reply({ embeds: [queueEmbed] });
            break;
        }
        case 'clear': {
            const queueEmbed = new discord.MessageEmbed()
                .setTitle('Warteschlange wurde geleert!')
                .setDescription('Die Warteschlange wurde geleert!')
                .setColor('GREEN')
                .setTimestamp()
                .setFooter({
                    text: interaction.user.tag,
                    iconURL: interaction.user.displayAvatarURL()
                });
            queue.clear();
            interaction.reply({ embeds: [queueEmbed] });
            break;
        }
        case 'list': {
            const queue2 = queue.get();
            const noSongs = new discord.MessageEmbed()
                .setTitle('Keine Songs in der Warteschlange!')
                .setDescription('Es sind keine Songs in der Warteschlange!')
                .setColor('RED')
                .setTimestamp()
                .setFooter({
                    text: interaction.user.tag,
                    iconURL: interaction.user.displayAvatarURL()
                });
            if(queue2.length === 0) return interaction.reply({ embeds: [noSongs], ephemeral: true });
            const queueEmbed = new discord.MessageEmbed()
                .setTitle('Warteschlange')
                .setDescription(`Es sind \`${queue.getLength()}\` Songs in der Warteschlange!`)
                .setColor('BLUE')
                .setTimestamp()
                .setFooter({
                    text: interaction.user.tag,
                    iconURL: interaction.user.displayAvatarURL()
                });
            for(let i = 0; i < queue2.length; i++) {
                if (i > 9) break;
                const song = queue2[i];
                console.log(song);
                queueEmbed.addField(`Song ${i + 1}`, `**Titel:** ${song.title}\n**Künstler:** ${song.artist}\n**Link:** ${song.link}\n**Angefragt von:** <@${song.requester}>`);
            }
            interaction.reply({ embeds: [queueEmbed] });
            break;
        }
    }
}
