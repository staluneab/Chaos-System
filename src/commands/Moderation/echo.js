import {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("echo")
        .setDescription("Send a styled embed (Admin only)")
        .addStringOption(option =>
            option
                .setName("message")
                .setDescription("Message to send inside the embed")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    category: "community",

    async execute(interaction) {
        try {
            const rawMessage = interaction.options.getString("message");
            const formattedMessage = rawMessage.replace(/\\n/g, "\n");

            const embed = new EmbedBuilder()
                .setColor("#5865F2") // Blue left border
                .setDescription(formattedMessage)
                .setTimestamp();

            await interaction.reply({
                content: "✅ Embed sent.",
                ephemeral: true
            });

            await interaction.channel.send({
                embeds: [embed]
            });

        } catch (error) {
            console.error(error);

            if (!interaction.replied) {
                await interaction.reply({
                    content: "❌ An error occurred.",
                    ephemeral: true
                });
            }
        }
    }
};
