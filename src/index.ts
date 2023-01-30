import discord from 'discord.js';

const { Ready } = require('./events/ready');
const { ConSound } = require('./modules/consound/consound');
const { InteractionCreate } = require('./events/interactionCreate');
const { MessageDelete } = require('./events/messageDelete');
const { MessageUpdate } = require('./events/messageUpdate');
const { GuildMemberAdd } = require('./events/guildMemberAdd');
const { GuildMemberRemove } = require('./events/guildMemberRemove');

export const config = require('./config.json');

export const client = new discord.Client({
    intents: [
        discord.Intents.FLAGS.GUILDS,
        discord.Intents.FLAGS.GUILD_MESSAGES,
        discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        discord.Intents.FLAGS.GUILD_MEMBERS,
        discord.Intents.FLAGS.GUILD_PRESENCES,
        discord.Intents.FLAGS.GUILD_VOICE_STATES,
        discord.Intents.FLAGS.GUILD_MESSAGE_TYPING,
        discord.Intents.FLAGS.DIRECT_MESSAGES,
        discord.Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
        discord.Intents.FLAGS.DIRECT_MESSAGE_TYPING,
        discord.Intents.FLAGS.GUILD_INVITES,
        discord.Intents.FLAGS.GUILD_BANS,
        discord.Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
        discord.Intents.FLAGS.GUILD_INTEGRATIONS,
        discord.Intents.FLAGS.GUILD_WEBHOOKS,
    ]
})

client.login(config.discord.token);

client.on('ready', () => Ready(client));
client.on('voiceStateUpdate', (oldState, newState) => ConSound(newState, oldState));
client.on('interactionCreate', (interaction) => InteractionCreate(interaction, client));
client.on('messageDelete', (message) => MessageDelete(message, client));
client.on('messageUpdate', (oldMessage, newMessage) => MessageUpdate(oldMessage, newMessage, client));
client.on('guildMemberAdd', (member) => GuildMemberAdd(member, client));
client.on('guildMemberRemove', (member) => GuildMemberRemove(member, client));