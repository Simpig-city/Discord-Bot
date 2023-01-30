import discord from 'discord.js';
import fs from 'fs';

export async function CommandHandler(interaction: discord.Interaction, client: discord.Client) {
    if (!interaction.isCommand()) return;
    
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(`../../commands/${file}`);
        if (command.name === interaction.commandName) {
            command.execute(interaction, client);
            return
        }
    }
}