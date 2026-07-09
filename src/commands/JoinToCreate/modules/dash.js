import { getColor } from '../../../config/bot.js';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    PermissionFlagsBits
} from 'discord.js';
import { InteractionHelper } from '../../../utils/interactionHelper.js';
import { logger } from '../../../utils/logger.js';
import { TitanBotError, ErrorTypes, replyUserError } from '../../../utils/errorHandler.js';

export default {
    name: 'setupdashboard',
    description: 'Envoie le panneau de contrôle dans le salon textuel de la room actuelle.',
    defaultMemberPermissions: PermissionFlagsBits.ManageChannels, // Accessible aux admins / modérateurs

    async execute(interaction, config, client) {
        try {
            // 1. Vérifier si l'admin est dans un salon vocal
            const voiceChannel = interaction.member.voice.channel;
            if (!voiceChannel) {
                return replyUserError(interaction, {
                    type: ErrorTypes.VALIDATION,
                    message: '❌ Tu dois être connecté dans la room vocale où tu veux afficher le dashboard.'
                });
            }

            // 2. Création du Dashboard
            const embed = new EmbedBuilder()
                .setTitle('🔊 Voice Room Control Dashboard')
                .setDescription(
                    'Cliquez sur les boutons ci-dessous pour gérer cette room vocale !\n' +
                    '*Note : Seul le propriétaire de la room (ou un admin) peut utiliser ces contrôles.*'
                )
                .addFields(
                    { name: '🔒 Lock / Unlock', value: 'Bloquer ou ouvrir l\'accès à la room.', inline: true },
                    { name: '📝 Change Name', value: 'Renommer la room instantanément.', inline: true },
                    { name: '🥾 Kick Member', value: 'Exclure un membre de la room.', inline: true }
                )
                .setColor(getColor('info') || '#5865F2')
                .setFooter({ text: 'TitanBot Room Management' })
                .setTimestamp();

            const row1 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('dashboard_room_lock').setLabel('Lock Room').setEmoji('🔒').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('dashboard_room_unlock').setLabel('Unlock Room').setEmoji('🔓').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('dashboard_room_rename').setLabel('Change Name').setEmoji('📝').setStyle(ButtonStyle.Primary)
            );

            const row2 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('dashboard_room_kick').setLabel('Kick Member').setEmoji('🥾').setStyle(ButtonStyle.Secondary)
            );

            // 3. Envoyer le message directement dans le salon textuel intégré de la room vocale
            await voiceChannel.send({
                embeds: [embed],
                components: [row1, row2]
            });

            // Confirmation éphémère (cachée) pour l'admin qui a tapé la commande
            await interaction.reply({
                content: `✅ Le dashboard a été envoyé dans le salon textuel de **${voiceChannel.name}** !`,
                flags: 64 // MessageFlags.Ephemeral
            });

        } catch (error) {
            logger.error('Erreur lors du setup du dashboard en room:', error);
            await replyUserError(interaction, {
                type: ErrorTypes.UNKNOWN,
                message: 'Impossible d\'envoyer le dashboard dans cette room.'
            }).catch(() => {});
        }
    }
};
