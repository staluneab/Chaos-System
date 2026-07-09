import { 
  SlashCommandBuilder, 
  PermissionFlagsBits, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle 
} from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('setup-voice-dashboard')
    .setDescription('Creates a voice channel control dashboard in the current channel.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
  
  category: 'Moderation',

  async execute(interaction, guildConfig, client) {
    // 1. Acknowledge command entry immediately 
    await interaction.deferReply({ ephemeral: true });

    // 2. Build the descriptive dashboard instructions embed
    const dashboardEmbed = new EmbedBuilder()
      .setTitle('🔊 Voice Channel Controller')
      .setDescription(
        'Click the buttons below to customize your temporary voice channel\'s privacy settings.\n\n' +
        '**Available Controls:**\n' +
        '🔒 **Lock:** Prevent any new members from connecting.\n' +
        '🔓 **Unlock:** Allow anyone to connect to your room.\n' +
        '👻 **Hide:** Invisible to members who are not inside.\n' +
        '👁️ **Reveal:** Visible to everyone on the server sidebar.'
      )
      .setColor('#2b2d31')
      .setFooter({ text: 'Note: These buttons only work if you are the owner of the channel!' });

    // 3. Create the buttons using dynamic customIds that match your interactionCreate logic
    // We use a dummy identifier or "creator" variable format if needed, 
    // or parse the executor from the channel details.
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`jtc_lock_${interaction.user.id}`) // Target checks will compare creator inside the event handler
        .setLabel('Lock')
        .setEmoji('🔒')
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId(`jtc_unlock_${interaction.user.id}`)
        .setLabel('Unlock')
        .setEmoji('🔓')
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId(`jtc_hide_${interaction.user.id}`)
        .setLabel('Hide')
        .setEmoji('👻')
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId(`jtc_reveal_${interaction.user.id}`)
        .setLabel('Reveal')
        .setEmoji('👁️')
        .setStyle(ButtonStyle.Primary)
    );

    // 4. Send the persistent dashboard panel straight to the active text channel
    await interaction.channel.send({
      embeds: [dashboardEmbed],
      components: [row]
    });

    // 5. Notify the admin that it was successfully initialized
    return interaction.editReply({ content: '✅ Voice control dashboard panel deployed successfully here!' });
  },
};
