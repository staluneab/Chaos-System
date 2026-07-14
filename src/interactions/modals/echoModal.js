import { EmbedBuilder } from "discord.js";

export default {
    name: "echoModal",

    async execute(interaction) {
        try {
            const message = interaction.fields
                .getTextInputValue("echoMessage")
                .replace(/\\n/g, "\n");

            const embed = new EmbedBuilder()
                .setColor("#5865F2")
                .setDescription(message)
                .setTimestamp();

            await interaction.reply({
                content: "✅ Message sent.",
                ephemeral: true
            });

            await interaction.channel.send({
                embeds: [embed]
            });

        } catch (err) {
            console.error(err);

            if (!interaction.replied) {
                await interaction.reply({
                    content: "❌ Failed to send the message.",
                    ephemeral: true
                });
            }
        }
    }
};
