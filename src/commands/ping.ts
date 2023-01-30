import discord from 'discord.js';

export const name = 'ping';
export const description = 'Ping!';
export const options: discord.ApplicationCommandOptionData[] = [];
export const defaultMemberPermission = ['SEND_MESSAGES'];

export async function execute(interaction: discord.CommandInteraction, client: discord.Client) {
    if(!interaction.isCommand()) return;
    const embed = new discord.MessageEmbed()
        .setTitle('Pong!')
        .setDescription('Mein Ping ist: ' + interaction.client.ws.ping + 'ms')
        .setColor('GREEN')
        .setTimestamp()
        .setFooter({
            text: interaction.user.tag,
            iconURL: interaction.user.displayAvatarURL()
        });

    await interaction.reply({ embeds: [embed] });
}