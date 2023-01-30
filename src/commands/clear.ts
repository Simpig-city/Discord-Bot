import discord from 'discord.js'

export const name = "clear";
export const description = "Leere den Chat";
export const options: discord.ApplicationCommandOptionData[] = [
	{
		name: "amount",
		description: "Menge der Nachrichten, die gelöscht werden sollen",
		type: 'INTEGER',
		required: true
	}
]
export const defaultMemberPermission = ['MANAGE_MESSAGES']

export async function execute(interaction: discord.Interaction, client: discord.Client) {
	if(!interaction.isCommand()) return;
	const amount = interaction.options.getInteger("amount");
	const embed = new discord.MessageEmbed()
		.setTitle("Nachrichten gelöscht")
		.setDescription(`Es wurden ${amount} Nachrichten gelöscht.`)
		.setColor('GREEN')
		.setTimestamp()
		.setFooter({
			text: interaction.user.tag,
			iconURL: interaction.user.displayAvatarURL()
		});
	
	if(amount <= 0) {
		const errEmbed = new discord.MessageEmbed()
			.setTitle("Error")
			.setDescription("Bitte geben mehr als 0 Nachrichten an, die gelöscht werden sollen.")
			.setColor("RED")
			.setTimestamp()
			.setFooter({
				text: interaction.user.tag,
				iconURL: interaction.user.displayAvatarURL()
			});
		return interaction.reply({ embeds: [errEmbed], ephemeral: true })
	}

	if (amount <= 100) {
		await interaction.reply({ embeds: [embed], ephemeral: true });
		const messages = await interaction.channel.messages.fetch({ limit: amount });
		for(const message of messages) {
			await message[1].delete();
		}
	}else {
		await interaction.reply({ embeds: [embed], ephemeral: true });
		for (let i = 0; i < amount; i += 100) {
			const messages = await interaction.channel.messages.fetch({ limit: 100 });
			if(messages.size === 0) break;
			for(const message of messages) {
				await message[1].delete();
			}
		}
	}
}