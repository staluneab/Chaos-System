import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName("echo")
        .setDescription("Sends a clean yellow embed message directly (Admin only)")
        .addStringOption(option =>
            option
                .setName("title")
                .setDescription("The title at the top of the embed")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("message")
                .setDescription("The main description text (supports **bold** and \\n)")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        
    category: "community", 

    async execute(interaction, config, client) {
        try {
            const title = interaction.options.getString("title");
            const rawMessage = interaction.options.getString("message");
            
            // Replaces typed \n with actual formatting line breaks
            const formattedMessage = rawMessage.replace(/\\n/g, '\n');

            // Build the clean yellow/gold embed structure
            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(formattedMessage)
                .setColor("#FEE75C"); // Bright Yellow/Gold border

            // 1. Reply secretly first to handle Discord's system requirement
            await interaction.reply({ content: "Processing...", ephemeral: true });

            // 2. Instantly delete the system reply so it disappears completely
            await interaction.deleteReply();

            // 3. Send the clean, gorgeous embed natively to the channel
            await interaction.channel.send({ embeds: [embed] });

        } catch (error) {
            console.error("Error with echo command:", error);
        }
    }
};
