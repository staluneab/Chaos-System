import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName("echo")
        .setDescription("Envoie un embed style bulle iMessage iPhone (Admin uniquement)")
        .addStringOption(option =>
            option
                .setName("message")
                .setDescription("Le contenu de la bulle de message textuelle")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        
    category: "community", 

    async execute(interaction, config, client) {
        try {
            const rawMessage = interaction.options.getString("message");
            const formattedMessage = rawMessage.replace(/\\n/g, '\n');

            // Création de l'embed au format épuré "iOS style"
            const iOSMessageEmbed = new EmbedBuilder()
                .setDescription(formattedMessage)
                .setColor("#007AFF"); // Bleu iMessage officiel d'Apple

            // 1. Envoi d'une notification invisible de confirmation
            await interaction.reply({ content: "📲 Bulle iPhone envoyée !", ephemeral: true });

            // 2. Envoi direct de l'embed iMessage dans le salon
            await interaction.channel.send({ embeds: [iOSMessageEmbed] });

        } catch (error) {
            console.error("Erreur lors de l'envoi du message style iPhone :", error);
        }
    }
};
