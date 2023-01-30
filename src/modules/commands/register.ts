import discord from 'discord.js';
import fs from 'fs';

export function RegisterCommands(client: discord.Client) {
   const commands: discord.ApplicationCommandData[] = [];
   
   const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`../../commands/${file}`);
        const commandData = {
            name: command.name,
            description: command.description,
            options: command.options,
            defaultMemberPermissions: command.defaultMemberPermission
        }

        commands.push(commandData);
    }

    client.guilds.cache.forEach(async guild => {
        guild.commands.set(commands);
    });

    console.log('Registered commands!');

}