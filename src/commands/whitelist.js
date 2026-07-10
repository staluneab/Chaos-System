const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const mysql = require('mysql2/promise');

// ⚠️ Put your actual database details here
const dbConfig = {
    host: 'localhost', 
    user: 'root',
    password: 'your_database_password',
    database: 'mnc_roleplay' 
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('whitelist')
        .setDescription('Add a player to the MNC Roleplay whitelist')
        .addStringOption(option => 
            option.setName('serial')
                .setDescription('The player\'s MTA Serial (32 characters)')
                .setRequired(true))
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The Discord user being whitelisted')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // Admin only

    async execute(interaction) {
        const serial = interaction.options.getString('serial').toUpperCase().trim();
        const targetUser = interaction.options.getUser('user');
        
        // Quick validation check
        if (serial.length !== 32) {
            return interaction.reply({ content: '❌ Invalid MTA Serial. It must be exactly 32 characters long.', ephemeral: true });
        }

        try {
            const connection = await mysql.createConnection(dbConfig);
            
            // Check if this serial is already in the database
            const [rows] = await connection.execute('SELECT * FROM whitelist WHERE mta_serial = ?', [serial]);
            if (rows.length > 0) {
                await connection.end();
                return interaction.reply({ content: `⚠️ This serial is already whitelisted!`, ephemeral: true });
            }

            // Save the data to your database
            await connection.execute(
                'INSERT INTO whitelist (discord_id, mta_serial, added_by) VALUES (?, ?, ?)',
                [targetUser.id, serial, interaction.user.tag]
            );
            await connection.end();

            // Nice response message
            const embed = new EmbedBuilder()
                .setColor('#FFD700') // Gold Theme for MNC
                .setTitle('✅ Player Whitelisted')
                .setDescription(`Successfully granted access to **MNC Roleplay**`)
                .addFields(
                    { name: 'Discord User', value: `${targetUser}`, inline: true },
                    { name: 'MTA Serial', value: `\`${serial}\``, inline: true },
                    { name: 'Authorized By', value: `${interaction.user.tag}`, inline: true }
                )
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            return interaction.reply({ content: '❌ Could not connect to the database. Make sure your MySQL details are correct.', ephemeral: true });
        }
    }
};
