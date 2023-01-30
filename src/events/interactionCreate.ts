import discord from 'discord.js';
const { CommandHandler } = require('../modules/commands/handle');

export async function InteractionCreate(interaction: discord.Interaction) {
    await CommandHandler(interaction);
}