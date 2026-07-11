import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName("echo")
        .setDescription("Sends a clean blue embed message (Admin only)")
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
            
            // Replaces typed \n with actual formatting breaks
            const formattedMessage = rawMessage.replace(/\\n/g, '\n');

            // Build the clean blue embed
            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(formattedMessage)
                .setColor("#35865F2"); // Clean Blue border

            // Send a hidden confirmation to the Admin so Discord doesn't error out
            await interaction.reply({ content: "Embed sent successfully!", ephemeral: true });

            // Post the clean blue embed into the channel natively
            await interaction.channel.send({ embeds: [embed] });

        } catch (error) {
            console.error("Error with echo command:", error);
        }
    }
};
