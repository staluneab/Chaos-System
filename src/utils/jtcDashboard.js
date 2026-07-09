import { 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    EmbedBuilder, 
    ComponentType,
    PermissionFlagsBits
} from 'discord.js';
import { getColor } from '../config/bot.js';
import { logger } from './logger.js';
import { TitanBotError, ErrorTypes, replyUserError } from './errorHandler.js';
import { getJoinToCreateConfig, updateJoinToCreateConfig } from './database.js';

/**
 * Generates and sends the JTC control dashboard into the temporary text/voice channel
 * @param {VoiceChannel} voiceChannel The newly created temporary voice room
 * @param {GuildMember} owner The member who created the room
 */
export async function sendJtcDashboard(voiceChannel, owner) {
    const embed = new EmbedBuilder()
        .setTitle('🎙️ Voice Channel Control Panel')
        .setDescription(`Welcome to your temporary voice channel, ${owner}!\nUse the buttons below to manage your room settings dynamically.`)
        .addFields(
            { name: '👤 Owner', value: `${owner}`, inline: true },
            { name: '🔒 Status', value: '🔓 Unlocked / 👁️ Visible', inline: true }
        )
        .setColor(getColor('info') || '#5865F2')
        .setFooter({ text: 'Only the channel owner can use these controls.' })
        .setTimestamp();

    const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('jtc_lock').setLabel('Lock').setStyle(ButtonStyle.Danger).setEmoji('🔒'),
        new ButtonBuilder().setCustomId('jtc_unlock').setLabel('Unlock').setStyle(ButtonStyle.Success).setEmoji('🔓'),
        new ButtonBuilder().setCustomId('jtc_hide').setLabel('Hide').setStyle(ButtonStyle.Secondary).setEmoji('👻'),
        new ButtonBuilder().setCustomId('jtc_reveal').setLabel('Reveal').setStyle(ButtonStyle.Secondary).setEmoji('👁️')
    );

    const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('jtc_rename').setLabel('Rename').setStyle(ButtonStyle.Primary).setEmoji('✏️'),
        new ButtonBuilder().setCustomId('jtc_limit').setLabel('Set Limit').setStyle(ButtonStyle.Primary).setEmoji('👥'),
        new ButtonBuilder().setCustomId('jtc_kick').setLabel('Disconnect User').setStyle(ButtonStyle.Danger).setEmoji('❌')
    );

    // If your bot creates a text channel paired with the voice channel, or supports text-in-voice:
    await voiceChannel.send({
        content: `${owner}`,
        embeds: [embed],
        components: [row1, row2]
    }).catch(err => logger.error('Failed to send JTC Dashboard panel:', err));
}

/**
 * Global button interaction listener routing for the JTC dashboard components
 */
export async function handleJtcDashboardInteraction(interaction, client) {
    if (!interaction.isButton() || !interaction.customId.startsWith('jtc_')) return;

    const { member, guild, customId, channel } = interaction;
    
    // 1. Verify the interaction is happening within a temporary voice context
    if (!channel || channel.type !== 2) { // 2 = GuildVoiceChannel
        return interaction.reply({ content: 'This control panel can only be used inside your voice room chat context.', flags: 64 });
    }

    try {
        await interaction.deferReply({ ephemeral: true });

        // 2. Fetch config to trace ownership
        const currentConfig = await getJoinToCreateConfig(client, guild.id);
        const savedChannelData = currentConfig.temporaryChannels?.[channel.id];

        // Fallback safety check: If DB isn't tracking, look at who has permission or check stored creator ID
        const ownerId = savedChannelData?.ownerId || savedChannelData || null; 

        if (!ownerId) {
            throw new TitanBotError('Room metadata missing', ErrorTypes.VALIDATION, 'Could not determine the owner of this voice channel.');
        }

        if (member.id !== ownerId && !member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return interaction.editReply({ content: '❌ Only the room creator (owner) or an administrator can modify this channel.' });
        }

        // 3. Route specific button functionalities
        switch (customId) {
            case 'jtc_lock': {
                await channel.permissionOverwrites.edit(guild.roles.everyone, { Connect: false });
                await interaction.editReply({ content: '🔒 Your channel has been **locked**. New users can no longer join.' });
                break;
            }
            case 'jtc_unlock': {
                await channel.permissionOverwrites.edit(guild.roles.everyone, { Connect: null });
                await interaction.editReply({ content: '🔓 Your channel is now **unlocked**. Anyone can join.' });
                break;
            }
            case 'jtc_hide': {
                await channel.permissionOverwrites.edit(guild.roles.everyone, { ViewChannel: false });
                await interaction.editReply({ content: '👻 Your channel is now **hidden** from the channel list.' });
                break;
            }
            case 'jtc_reveal': {
                await channel.permissionOverwrites.edit(guild.roles.everyone, { ViewChannel: null });
                await interaction.editReply({ content: '👁️ Your channel is now **visible** to everyone.' });
                break;
            }
            case 'jtc_rename': {
                // Modals cannot be received via deferred replies. 
                // Note: For a clean modal renaming interface, drop deferReply() at the beginning 
                // of this function block and directly trigger standard Discord Modal fields.
                await interaction.editReply({ content: '💡 Please use standard command string updates or check modal setup blocks.' });
                break;
            }
            case 'jtc_limit': {
                // Example hardcoded adjust or message collector placeholder
                await interaction.editReply({ content: '👥 Feature ready. Implement a message collector or select menu here for custom numerical parameters.' });
                break;
            }
            case 'jtc_kick': {
                const targets = channel.members.filter(m => m.id !== ownerId && !m.permissions.has(PermissionFlagsBits.ManageChannels));
                if (targets.size === 0) {
                    return interaction.editReply({ content: 'There are no other non-staff users in the room to disconnect.' });
                }
                // Disconnect first non-owner active member as example
                await targets.first().voice.disconnect('Kicked by channel owner');
                await interaction.editReply({ content: `❌ Disconnected **${targets.first().displayName}** from your room.` });
                break;
            }
        }

    } catch (error) {
        logger.error('JTC Dashboard execution error:', error);
        const msg = error instanceof TitanBotError ? error.userMessage : 'Failed to execute room modification action.';
        await interaction.editReply({ content: `❌ ${msg}` }).catch(() => {});
    }
}
