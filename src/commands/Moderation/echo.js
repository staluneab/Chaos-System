import {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName("echo")
        .setDescription("Open a message editor")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    category: "community",

    async execute(interaction) {

        const modal = new ModalBuilder()
            .setCustomId("echoModal")
            .setTitle("Create Announcement");

        const messageInput = new TextInputBuilder()
            .setCustomId("echoMessage")
            .setLabel("Your Message")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder("Type your announcement here...")
            .setRequired(true)
            .setMaxLength(4000);

        modal.addComponents(
            new ActionRowBuilder().addComponents(messageInput)
        );

        await interaction.showModal(modal);
    }
};
