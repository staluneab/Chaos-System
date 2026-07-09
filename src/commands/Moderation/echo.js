import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName("echo")
        .setDescription("Repeats a message (Admin only)")
        .addStringOption(option =>
            option
                .setName("message")
                .setDescription("The text to repeat")
                .setRequired(true)
        )
        // This locks the slash command so ONLY members with Administrator permission can see/use it
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        
    category: "community", 

    async execute(interaction, config, client) {
        try {
            const textToRepeat = interaction.options.getString("message");

            // Send a hidden "success" message to the Admin so the command doesn't error out
            await interaction.reply({ content: "Message sent!", ephemeral: true });

            // Send the actual plain text message to the channel normally
            await interaction.channel.send(textToRepeat);

        } catch (error) {
            console.error("Error in echo command:", error);
        }
    }
};
