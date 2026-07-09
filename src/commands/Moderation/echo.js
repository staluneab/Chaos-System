import { PermissionFlagsBits } from 'discord.js';

export default {
    name: "echo",
    description: "Repeats a message (Admin only)",
    category: "community", // Change to match your folder name

    async execute(message, args, client) {
        try {
            // 1. Check if the user has Administrator permissions
            if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return message.reply("❌ You do not have permission to use this command.");
            }

            // 2. Get the text after the command
            const textToRepeat = args.join(' ');

            // 3. Make sure they actually typed something to repeat
            if (!textToRepeat) {
                return message.reply("Please provide a message for me to repeat.");
            }

            // 4. Delete the original message so only the bot's message shows
            await message.delete().catch(() => null);

            // 5. Send the repeated text
            await message.channel.send(textToRepeat);

        } catch (error) {
            console.error("Error in echo command:", error);
        }
    }
};
