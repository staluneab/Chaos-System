import {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("echo")
        .setDescription("Send an embed")
        .addStringOption(option =>
            option
                .setName("message")
                .setDescription("Message to send")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    category: "community",

    async execute(interaction) {
        try {
            const message = interaction.options
                .getString("message")
                .replace(/\\n/g, "\n");

            const embed = new EmbedBuilder()
                .setColor(0x5865F2)
                .setDescription(message);

            await interaction.reply({
                content: "✅ Sent!",
                ephemeral: true
            });

            await interaction.channel.send({
                embeds: [embed]
            });

        } catch (err) {
            console.error(err);

            if (!interaction.replied) {
                await interaction.reply({
                    content: "❌ Error sending embed.",
                    ephemeral: true
                });
            }
        }
    }
};
