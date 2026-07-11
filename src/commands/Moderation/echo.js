import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName("echo")
        .setDescription("Sends a clean embed message (Admin only)")
        .addStringOption(option =>
            option
                .setName("message")
                .setDescription("The main description text (use \\n for new lines)")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("title")
                .setDescription("Optional: The title at the top of the embed")
                .setRequired(false)
        )
        .addStringOption(option =>
            option
                .setName("color")
                .setDescription("Optional: Border color hex code (e.g., #FF0000 for Red, #0000FF for Blue)")
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        
    category: "community", 

    async execute(interaction, config, client) {
        try {
            // 1. Get arguments and handle line breaks (\n)
            const rawText = interaction.options.getString("message");
            const textToRepeat = rawText.replace(/\\n/g, '\n');
            const embedTitle = interaction.options.getString("title");
            
            // Default to blue/purple if no hex code is provided
            let embedColor = interaction.options.getString("color") || "#5865F2"; 
            if (!embedColor.startsWith('#')) embedColor = `#${embedColor}`;

            // 2. Build the Embed
            const embed = new EmbedBuilder()
                .setDescription(textToRepeat)
                .setColor(embedColor);

            // Only add a title if the admin provided one
            if (embedTitle) {
                embed.setTitle(embedTitle);
            }

            // 3. Send a hidden confirmation to the Admin so Discord doesn't error out
            await interaction.reply({ content: "Embed message sent!", ephemeral: true });

            // 4. Post the gorgeous embed cleanly into the channel
            await interaction.channel.send({ embeds: [embed] });

        } catch (error) {
            console.error("Error in echo embed command:", error);
        }
    }
};
