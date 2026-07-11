import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName("echo")
        .setDescription("Sends a clean blue embed message (Admin only)")
        .addStringOption(option =>
            option
                .setName("message")
                .setDescription("The text to put inside the blue border box")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        
    category: "community", 

    async execute(interaction, config, client) {
        try {
            const rawMessage = interaction.options.getString("message");
            const formattedMessage = rawMessage.replace(/\\n/g, '\n');

            // The perfect clean blue embed box
            const embed = new EmbedBuilder()
                .setDescription(formattedMessage)
                .setColor("#5865F2"); // Clean Blue Border

            // 1. Reply invisibly so the command successfully closes
            await interaction.reply({ content: "Sending...", ephemeral: true });
            await interaction.deleteReply();

            // 2. Publicly drop the clean blue embed into the channel
            await interaction.channel.send({ embeds: [embed] });

        } catch (error) {
            console.error("Error with echo command:", error);
        }
    }
};
