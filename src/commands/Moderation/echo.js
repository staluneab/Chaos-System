import {
    SlashCommandBuilder,
    EmbedBuilder
} from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("echo")
        .setDescription("Test embed"),

    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setTitle("EMBED TEST")
            .setDescription("If you can read this inside a Discord embed, the command is working.")
            .setColor(0x5865F2);

        await interaction.reply({
            embeds: [embed]
        });
    }
};
