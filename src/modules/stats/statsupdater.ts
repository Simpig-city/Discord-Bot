import discord from 'discord.js';

const { memberCount } = require('./membercount');

const config = require('../../config.json');

export async function statsUpdater(client: discord.Client) {
    memberCount(client, config);
}