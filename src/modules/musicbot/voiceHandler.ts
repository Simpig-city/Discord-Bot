import * as voice from '@discordjs/voice';
import discord, { SystemChannelFlags } from 'discord.js';
import ytdl from 'ytdl-core';
import playdl from 'play-dl';
import { joinVoiceChannel, createAudioPlayer, createAudioResource, VoiceConnectionStatus } from '@discordjs/voice';

const queue = require('./queue');

export let running = false;
export let connection: voice.VoiceConnection;
export let player: voice.AudioPlayer;
export let subscription: voice.PlayerSubscription;

export async function start(interaction: discord.Interaction, client: discord.Client) {
    if (running) return;
    running = true;

    const guild = interaction.guild;
    const guildId = guild.id;
    const member = guild.members.cache.get(interaction.user.id);
    const channelId = member?.voice.channelId;

    connection = joinVoiceChannel({
        channelId: channelId,
        guildId: guildId,
        adapterCreator: guild.voiceAdapterCreator,
    })

    const url = await queue.getNext();

    connection.on(VoiceConnectionStatus.Ready, async () => {
        player = createAudioPlayer();
        subscription = connection.subscribe(player);
        const source = await playdl.stream(url.link);
        const resource = createAudioResource(source.stream, { inputType: source.type });
        player.play(resource);

        player.on('stateChange', async (oldState, newState) => {
            if (newState.status === voice.AudioPlayerStatus.Idle && oldState.status !== voice.AudioPlayerStatus.Idle) {
                const url = await queue.getNext();
                if (url) {
                    const source = await playdl.stream(url.link);
                    const resource = createAudioResource(source.stream, { inputType: source.type });
                    player.play(resource);
                } else {
                    stop();
                }
            }
        });
    });

    connection.on(VoiceConnectionStatus.Disconnected, async () => {
        connection.destroy();
        connection = null;
        player = null;
        subscription = null;
        running = false;
    });

}

export async function stop() {
    if (!running) return;
    //check if connection is destroyed
    if(connection.state.status != 'destroyed') connection.destroy();

    running = false;

    player = null;
    connection = null;
    subscription = null;
}

export async function skip() {
    if (!running) return;
    if(!connection) return;
    if(!player) return;
    if(connection.state.status === 'destroyed') return;
    if(queue.getLength() === 0) return;
    const url = await queue.getNext();
    if (url) {
        const source = await playdl.stream(url.link);
        const resource = createAudioResource(source.stream, { inputType: source.type });
        player.play(resource);
    } else {
        stop();
    }
}
 