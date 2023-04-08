import discord from 'discord.js'
import { GetDB } from '../database/connectionhandler';
import { send } from '../modules/websocket/websocket';
const config = require('../config.json');

export const name = "whitelist";
export const description = "Whiteliste einen Spieler";
export const options: discord.ApplicationCommandOptionData[] = [
	{
		name: "spieler",
        description: "Spieler, der gewhitelisted werden soll",
        type: 'USER',
        required: true
	},
    {
        name: "server",
        description: "Server, auf dem der Spieler gewhitelisted werden soll",
        type: 'STRING',
        required: true,
    }
]
export const defaultMemberPermission = ['ADMINISTRATOR']

export async function execute(interaction: discord.Interaction, client: discord.Client) {
	if(!interaction.isCommand()) return;
    const connection = await GetDB();
	
    const player = interaction.options.getUser("spieler");
    const playerID = player.id;

    const servers = config.minecraft.servers;
    const server = interaction.options.getString("server");
    if(!servers.includes(server)) {
        const embed = new discord.MessageEmbed()
            .setTitle('Fehler')
            .setDescription('Der angegebene Server existiert nicht!')
            .setColor('RED')
        interaction.reply({ embeds: [embed], ephemeral: true });
        return;
    }

    // check if the user is in the linked accounts database
    const [rows] = await connection.query(`SELECT * FROM linkedAccounts WHERE discordId = '${playerID}'`);
    // @ts-ignore
    if (rows.length < 1) {
        const embed = new discord.MessageEmbed()
            .setTitle('Fehler')
            .setDescription('Der Spieler ist nicht mit einem Minecraft Account verknüpft!')
            .setColor('RED')
        interaction.reply({ embeds: [embed], ephemeral: true });
        return;
    }
    
    const resEmbed = new discord.MessageEmbed()
        .setTitle('Erfolgreich hinzugefügt')
        .setDescription(`Die Folgenden Accounts der Person wurden hinzugefügt:\n\n`)
        .setColor('GREEN')

    // for every entry in the database
    // @ts-ignore
    for (const row of rows) {
        // @ts-ignore
        const mcName = row.minecraftName;
        const uuid = row.uuid;

        const jsonObj = {
            "type": "whitelistAdd",
            "uuid": uuid,
            "name": mcName,
            "server": server
        }

        const success = await send(JSON.stringify(jsonObj));

        if (success) {
            resEmbed.addField(mcName, "Erfolgreich Gewhitelisted");
        }else {
            resEmbed.addField(mcName, "Fehler beim Whitelisten - Es besteht keine Verbindung zum Server");
        }

        await interaction.reply({ embeds: [resEmbed] });

    }

}