import discord from 'discord.js';
import { GetDB } from '../../database/connectionhandler';
import { joinVoiceChannel, VoiceConnectionStatus, createAudioPlayer, createAudioResource } from '@discordjs/voice';

const {playing} = require('../musicbot/voiceHandler');

export async function ConSound(newState: discord.VoiceState, oldState: discord.VoiceState) {
    if(newState.member?.user.bot) return;

    if(playing) return;
    if(oldState.channelId === newState.channelId) return;

    const guild = newState.guild;
    const guildid = guild.id;
    const channel = newState.channel;
    if(!channel) return;
    const channelid = channel.id;
    const voiceAdapterCreator = guild.voiceAdapterCreator;
    const joinedUserID = newState.member?.id;

    const sql = await GetDB();

    const [rows, fields] = await sql.query(`SELECT * FROM consound WHERE id = '${joinedUserID}'`);
    //@ts-ignore
    if(rows.length === 0) return;
    //@ts-ignore
    const soundName = rows[0].name;
    
    const connection = joinVoiceChannel({
        channelId: channelid,
        guildId: guildid,
        // @ts-ignore
        adapterCreator: voiceAdapterCreator,
    })

    connection.on(VoiceConnectionStatus.Ready, () => {
        const player = createAudioPlayer();
        const subscription = connection.subscribe(player);
        const resource = createAudioResource('./modules/consound/sounds/' + soundName);

        player.play(resource);

        //on player end
        player.on('stateChange', (oldState, newState) => {
            if(newState.status === 'idle') {
                player.stop();
                connection.destroy();
            }
        })
    });

}