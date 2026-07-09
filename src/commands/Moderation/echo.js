import { SlashCommandBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName("echo")
        .setDescription("Repeats the message you provide.")
        .addStringOption(option =>
            option
                .setName("message")
                .setDescription("The text you want the bot to repeat")
                .setRequired(true)
        ),
    category: "community", // Change this to match the folder name (e.g., "fun", "core")

    async execute(interaction, config, client) {
        try {
            // 1. Get the text that the user typed
            const textToRepeat = interaction.options.getString("message");

            // 2. Reply back with that exact message
            await interaction.reply(textToRepeat);
            
        } catch (error) {
            console.error("Error running echo command:", error);
            // Optional: If you want to use your custom error handling:
            // handleInteractionError(interaction, error);
        }
    }
};
