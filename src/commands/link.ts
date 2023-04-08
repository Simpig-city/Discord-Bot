import discord from 'discord.js'
import mysql from 'mysql2/promise'
import { GetDB } from '../database/connectionhandler'

export const name = "link";
export const description = "Linke deinen Discord Account mit deinem Minecraft Account";
export const options: discord.ApplicationCommandOptionData[] = []
export const defaultMemberPermission = ['SEND_MESSAGES']

export async function execute(interaction: discord.Interaction, client: discord.Client) {
	if(!interaction.isCommand()) return;
	const connection = await GetDB();
    const [rows] = await connection.query(`SELECT * FROM linkedAccounts WHERE discordId = '${interaction.user.id}'`);

    // Check if user is already linked
    // @ts-ignore
    if (rows.length > 0) {
        interaction.reply({ content: 'Du hast deinen Account bereits verknüpft!', ephemeral: true });
        return;
    }

    // check if a code is already generated
    const [rows2] = await connection.query(`SELECT * FROM linkingCodes WHERE discordId = '${interaction.user.id}'`);

    // @ts-ignore
    if (rows2.length > 0) {
        // return the old code
        const embed2 = new discord.MessageEmbed()
            .setTitle('Linking Code')
            // @ts-ignore
            .setDescription(`Dein Linking Code lautet: \`${rows2[0].code}\`\n\nGebe /link <code> in Minecraft ein, um deinen Account zu verknüpfen.`)
            .setColor('BLUE')

        interaction.reply({ embeds: [embed2], ephemeral: true });
        return;
    }

    // Generate random code
    const code = await generateCode();

    // Save code to database
    await connection.query(`INSERT INTO linkingCodes (code, discordName, discordId) VALUES ('${code}', '${interaction.user.username}', '${interaction.user.id}')`);

    // Send code to user
    const embed = new discord.MessageEmbed()
        .setTitle('Linking Code')
        .setDescription(`Dein Linking Code lautet: \`${code}\`\n\nGebe /link <code> in Minecraft ein, um deinen Account zu verknüpfen.`)
        .setColor('BLUE')

    interaction.reply({ embeds: [embed], ephemeral: true });

}

// @ts-ignore
async function generateCode() {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    const connection = await GetDB();
    const [rows] = await connection.query(`SELECT * FROM linkingCodes WHERE code = '${code}'`);

    // @ts-ignore
    if (rows.length > 0) {
        return await generateCode();
    }
    
    return code;
}