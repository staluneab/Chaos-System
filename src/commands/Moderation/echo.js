import {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("echo")
        .setDescription("Send a custom embed (Admin only)")
        .addStringOption(option =>
            option
                .setName("message")
                .setDescription("The message to send")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    category: "community",

    async execute(interaction) {
        try {
            let message = interaction.options.getString("message");

            // Convert \n into real line breaks
            message = message.replace(/\\n/g, "\n");

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

        } catch (error) {
            console.error(error);

            if (!interaction.replied) {
                await interaction.reply({
                    content: "❌ Failed to send the message.",
                    ephemeral: true
                });
            }
        }
    }
};
