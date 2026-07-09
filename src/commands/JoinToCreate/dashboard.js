import { 
    getJoinToCreateConfig, 
    updateJoinToCreateConfig 
} from '../utils/database.js'; // Adjust relative pathing accordingly
import { 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ComponentType,
    MessageFlags,
    PermissionFlagsBits
} from 'discord.js';
import { replyUserError, ErrorTypes } from '../utils/errorHandler.js';

// Place this handler inside your interactionCreate event execution loop
async function handleDashboardInteractions(interaction, client) {
    if (!interaction.isButton() && !interaction.isModalSubmit() && !interaction.isStringSelectMenu()) return;

    const customId = interaction.customId;
    if (!customId.startsWith('dashboard_room_')) return;

    const guildId = interaction.guild.id;
    const member = interaction.member;
    const voiceChannel = member.voice.channel;

    // 1. Validation Checks
    if (!voiceChannel) {
        return replyUserError(interaction, {
            type: ErrorTypes.VALIDATION,
            message: '❌ You must be connected to your temporary voice room to use this dashboard.'
        });
    }

    const currentConfig = await getJoinToCreateConfig(client, guildId);
    const activeRooms = currentConfig.temporaryChannels || {}; 
    
    // Check if current channel is registered as a generated temporary room
    if (!activeRooms[voiceChannel.id]) {
        return replyUserError(interaction, {
            type: ErrorTypes.VALIDATION,
            message: '❌ This voice channel is not handled by the custom temporary room system.'
        });
    }

    // Check ownership validation (Assumes database stores the owner ID string value)
    const roomOwnerId = activeRooms[voiceChannel.id].ownerId || activeRooms[voiceChannel.id];
    if (roomOwnerId !== member.id && !member.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return replyUserError(interaction, {
            type: ErrorTypes.VALIDATION,
            message: '❌ Only the creator of this room can modify these settings.'
        });
    }

    // 2. Action Executions
    try {
        // --- LOCK ROOM ---
        if (customId === 'dashboard_room_lock') {
            await voiceChannel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                Connect: false
            });
            await interaction.reply({ content: '🔒 Room successfully locked! New members can no longer join.', flags: MessageFlags.Ephemeral });
        }

        // --- UNLOCK ROOM ---
        if (customId === 'dashboard_room_unlock') {
            await voiceChannel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                Connect: null // Resets to default inherited category permission string
            });
            await interaction.reply({ content: '🔓 Room successfully unlocked to server members.', flags: MessageFlags.Ephemeral });
        }

        // --- RENAME MODAL POPUP ---
        if (customId === 'dashboard_room_rename') {
            const modal = new ModalBuilder()
                .setCustomId('dashboard_room_modal_rename')
                .setTitle('Rename Voice Room');

            const nameInput = new TextInputBuilder()
                .setCustomId('new_room_name')
                .setLabel('Enter New Channel Name Layout')
                .setStyle(TextInputStyle.Short)
                .setMinLength(2)
                .setMaxLength(32)
                .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(nameInput));
            await interaction.showModal(modal);
        }

        // --- SUBMIT RENAME MODAL ---
        if (customId === 'dashboard_room_modal_rename') {
            const newName = interaction.fields.getTextInputValue('new_room_name');
            await voiceChannel.setName(newName);
            await interaction.reply({ content: `✅ Room name changed to: \`${newName}\``, flags: MessageFlags.Ephemeral });
        }

        // --- KICK MEMBER DROPDOWN SELECT MENU ---
        if (customId === 'dashboard_room_kick') {
            const currentOccupants = voiceChannel.members.filter(m => m.id !== member.id);

            if (currentOccupants.size === 0) {
                return interaction.reply({ content: 'There are no other members inside your room to kick.', flags: MessageFlags.Ephemeral });
            }

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('dashboard_room_select_kick')
                .setPlaceholder('Select a user to disconnect from your channel');

            currentOccupants.forEach(occ => {
                selectMenu.addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel(occ.displayName)
                        .setValue(occ.id)
                        .setDescription(`@${occ.user.username}`)
                );
            });

            const row = new ActionRowBuilder().addComponents(selectMenu);
            await interaction.reply({ content: 'Choose a target user to kick:', components: [row], flags: MessageFlags.Ephemeral });
        }

        // --- PROCESS CHOSEN KICK ACTION ---
        if (customId === 'dashboard_room_select_kick') {
            const targetId = interaction.values[0];
            const targetMember = await interaction.guild.members.fetch(targetId).catch(() => null);

            if (targetMember && targetMember.voice.channelId === voiceChannel.id) {
                await targetMember.voice.disconnect('Kicked from temporary channel by room owner.');
                await interaction.update({ content: `🥾 **${targetMember.displayName}** has been disconnected from your channel.`, components: [] });
            } else {
                await interaction.update({ content: '❌ Target member is no longer in your channel workspace.', components: [] });
            }
        }

    } catch (err) {
        logger.error('Error handling voice control dashboard interaction request:', err);
        await replyUserError(interaction, {
            type: ErrorTypes.UNKNOWN,
            message: 'An internal error occurred while updating structural voice channels properties.'
        }).catch(() => {});
    }
}
