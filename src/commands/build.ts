import discord from 'discord.js'
import { GetDB } from '../database/connectionhandler';
import { send } from '../modules/websocket/websocket';
const config = require('../config.json');

export const name = "build";
export const description = "Stelle einen Bauantrag";
export const options: discord.ApplicationCommandOptionData[] = [
	{
        name: "gebaeude",
        description: "Namne des Gebäude, welches du bauen möchtest",
        type: 'STRING',
        required: true
    },
    {
        name: "beschreibung",
        description: "Beschreibung des Gebäudes",
        type: 'STRING',
        required: true
    },
    {
        name: "wunschort",
        description: "Koordinaten des Wunschorts",
        type: 'STRING',
        required: false
    },
]
export const defaultMemberPermission = ['SEND_MESSAGES']

export async function execute(interaction: discord.Interaction, client: discord.Client) {
	if(!interaction.isCommand()) return;
    const connection = await GetDB();
	
    const id = interaction.user.id;

    const gebaeude = interaction.options.getString("gebaeude");
    const beschreibung = interaction.options.getString("beschreibung");
    const wunschort = interaction.options.getString("wunschort");

    const [rows] = await connection.query(`SELECT * FROM linkedAccounts WHERE discordId = '${id}'`);
    // @ts-ignore
    if (rows.length < 1) {
        const embed = new discord.MessageEmbed()
            .setTitle('Fehler')
            .setDescription('Du bist nicht mit einem Minecraft Account verknüpft!\n\nVerknüpfe deinen Account mit dem Befehl `/link`')
            .setColor('RED')
        interaction.reply({ embeds: [embed], ephemeral: true });
        return;
    }

    let buildChannel = await interaction.client.channels.cache.get(config.discord.bauchannel) as discord.TextChannel;

    const embed = new discord.MessageEmbed()
        .setTitle('Bauantrag')
        .setDescription(`**User**: ${interaction.user.username}\n\n**Gebäude:** ${gebaeude}\n\n**Beschreibung:** ${beschreibung}\n\n**Wunschort:** ${wunschort}`)
        .setColor('GREEN')
    
    const message = await buildChannel.send({ embeds: [embed] });

    // create a private thread with the user with the message
    const thread = await message.startThread({
        name: 'Bauantrag von ' + interaction.user.username,
        autoArchiveDuration: 60,
        reason: 'Bauantrag',
    });


    // add the user to the thread
    thread.members.add(interaction.user.id);

    interaction.reply({ content: 'Dein Bauantrag wurde erfolgreich erstellt!', ephemeral: true });


}