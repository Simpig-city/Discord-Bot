import discord from 'discord.js';
const { CommandHandler } = require('../modules/commands/handle');

export async function InteractionCreate(interaction: discord.Interaction) {
    if (interaction.isCommand) await CommandHandler(interaction);
}