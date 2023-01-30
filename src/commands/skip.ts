import discord from 'discord.js';

export const name = 'skip';
export const description = 'Skippe den aktuellen Song';
export const options: discord.ApplicationCommandOptionData[] = [];
export const defaultMemberPermission = ['SEND_MESSAGES'];

const voiceHandler = require('../modules/musicbot/voiceHandler');
const queue = require('../modules/musicbot/queue');

export async function execute(interaction: discord.CommandInteraction, client: discord.Client) {
    if(!interaction.isCommand()) return;
    const notRunning = new discord.MessageEmbed()
        .setTitle('Musikbot nicht gestartet')
        .setDescription('Der Musikbot ist nicht gestartet')
        .setColor('RED')
        .setTimestamp()
        .setFooter({
            text: interaction.user.tag,
            iconURL: interaction.user.displayAvatarURL()
        });
    if(!voiceHandler.running) return interaction.reply({ embeds: [notRunning], ephemeral: true });
    const queueEmpty = new discord.MessageEmbed()
        .setTitle('Warteschlange leer')
        .setDescription('Die Warteschlange ist leer')
        .setColor('RED')
        .setTimestamp()
        .setFooter({
            text: interaction.user.tag,
            iconURL: interaction.user.displayAvatarURL()
        });
    if(queue.getLength() === 0) return interaction.reply({ embeds: [queueEmpty], ephemeral: true });
    if(!voiceHandler.connection || !voiceHandler.player) return interaction.reply({ embeds: [notRunning], ephemeral: true });

    const embed = new discord.MessageEmbed()
        .setTitle('Song übersprungen')
        .setDescription('Der Song wurde übersprungen')
        .setColor('GREEN')
        .setTimestamp()
        .setFooter({
            text: interaction.user.tag,
            iconURL: interaction.user.displayAvatarURL()
        });

    await interaction.reply({ embeds: [embed] });
    voiceHandler.skip();

}