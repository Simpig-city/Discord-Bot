import discord from 'discord.js';
import fs from 'fs';
import https from 'https';
const mp3Duration = require('mp3-duration');
const { GetDB } = require('../database/connectionhandler');

export const name = 'setjoinsound';
export const description = 'Setzt den Sound, der abgespielt wird, wenn du einen Voicechannel beitrittst';
export const options: discord.ApplicationCommandOptionData[] = [
    {
        name: 'soundfile',
        description: 'Der Sound, der abgespielt werden soll',
        type: 'ATTACHMENT',
        required: true
    }
];
export const defaultMemberPermission = ['SEND_MESSAGES'];

export async function execute(interaction: discord.CommandInteraction) {
    if(!interaction.isCommand()) return;
    const attachment = interaction.options.get('soundfile')?.attachment;
    if(!attachment) return;
    if(!attachment.name) return;
    if(!attachment.name.endsWith('.mp3')) {
        const embed = new discord.MessageEmbed()
            .setTitle('Fehler!')
            .setDescription('Du musst eine .mp3 Datei hochladen!')
            .setColor('RED')
            .setTimestamp()
            .setFooter({
                text: interaction.user.tag,
                iconURL: interaction.user.displayAvatarURL()
            });
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
    }

    
    const file = await fs.createWriteStream(`./modules/consound/sounds/${attachment.id}.mp3`);
    const request = await https.get(attachment.proxyURL, function(response) {
        response.pipe(file);

        file.on("finish", async () => {
            file.close();
            
    
            const buffer = await fs.readFileSync(`./modules/consound/sounds/${attachment.id}.mp3`);
            const duration = await mp3Duration(buffer);

            if(duration > 300) {
                const embed = new discord.MessageEmbed()
                    .setTitle('Fehler!')
                    .setDescription('Die Länge des Sounds darf nicht über 300 Sekunden sein!')
                    .setColor('RED')
                    .setTimestamp()
                    .setFooter({
                        text: interaction.user.tag,
                        iconURL: interaction.user.displayAvatarURL()
                    });
                await interaction.reply({ embeds: [embed], ephemeral: true });
                fs.unlinkSync(`./modules/consound/sounds/${attachment.id}.mp3`);
                return;
            }

            const db = await GetDB();
            const userID = interaction.user.id;
            const soundName = attachment.id + '.mp3';

            const [rows, fields] = await db.execute(`SELECT * FROM consound WHERE id = '${userID}'`);
            if(rows.length == 0) {
                await db.execute(`INSERT INTO consound (id, name) VALUES ('${userID}', '${soundName}')`);
            } else {
                await db.execute(`UPDATE consound SET name = '${soundName}' WHERE id = '${userID}'`);
            }

            const embed = new discord.MessageEmbed()
                .setTitle('Erfolgreich!')
                .setDescription('Der Sound wurde erfolgreich gesetzt!')
                .setColor('GREEN')
                .setTimestamp()
                .setFooter({
                    text: interaction.user.tag,
                    iconURL: interaction.user.displayAvatarURL()
                });
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        
        });
    });
}