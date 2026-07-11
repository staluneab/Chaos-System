import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName("echo")
        .setDescription("Sends a clean yellow embed message (Admin only)")
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
                .setColor("#FEE75C"); // Bright Yellow/Gold border matching your theme

            // 1. First, send a hidden confirmation response so the command successfully closes
            await interaction.reply({ content: "✅ Embed posted successfully below!", ephemeral: true });

            // 2. Send the actual public embed directly into the channel for everyone to see
            await interaction.channel.send({ embeds: [embed] });

        } catch (error) {
            console.error("Error with echo command:", error);
        }
    }
};
