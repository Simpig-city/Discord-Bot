import discord from 'discord.js';

export const name = 'stop';
export const description = 'Stoppe den Musikbot';
export const options: discord.ApplicationCommandOptionData[] = [];
export const defaultMemberPermission = ['SEND_MESSAGES'];

const voiceHandler = require('../modules/musicbot/voiceHandler');

export async function execute(interaction: discord.CommandInteraction, client: discord.Client) {
    if(!interaction.isCommand()) return;
    
    const embed = new discord.MessageEmbed()
        .setTitle('Musikbot gestoppt')
        .setDescription('Der Musikbot wurde gestoppt')
        .setColor('GREEN')
        .setTimestamp()
        .setFooter({
            text: interaction.user.tag,
            iconURL: interaction.user.displayAvatarURL()
        });

    await interaction.reply({ embeds: [embed] });
    voiceHandler.stop();
}