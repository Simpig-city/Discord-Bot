import discord from 'discord.js';

export async function memberCount(client: discord.Client, config: any) {
    const memberCountChannelID = config.discord.membercount;
    const memberCountText = config.discord.membercounttext;

    const memberCountChannel = client.channels.cache.get(memberCountChannelID) as discord.VoiceChannel;
    if(!memberCountChannel) return;
    const memberCount = memberCountChannel.guild.members.cache.size;

    await memberCountChannel.setName(memberCountText + memberCount.toString());
}