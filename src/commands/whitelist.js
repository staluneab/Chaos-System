const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const mysql = require('mysql2/promise');

// ⚠️ CHANGE THESE TO MATCH YOUR ACTUAL DATABASE CREDENTIALS
const dbConfig = {
    host: 'localhost', // Put your VPS/Server IP if hosted remotely
    user: 'root',
    password: 'your_database_password',
    database: 'mnc_roleplay' 
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('whitelist')
        .setDescription('Whitelist a player on the MTA:SA server')
        .addStringOption(option => 
            option.setName('serial')
                .setDescription('The player\'s MTA Serial (Use /serial in-game)')
                .setRequired(true))
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The Discord user being whitelisted')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // Only Admins can see/use this

    async execute(interaction) {
        const serial = interaction.options.getString('serial').toUpperCase().trim();
        const targetUser = interaction.options.getUser('user');
        
        if (serial.length !== 32) {
            return interaction.reply({ content: '❌ Invalid MTA Serial. It must be exactly 32 characters long.', ephemeral: true });
        }

        try {
            const connection = await mysql.createConnection(dbConfig);
            
            // Check if already exists
            const [rows] = await connection.execute('SELECT * FROM whitelist WHERE mta_serial = ?', [serial]);
            if (rows.length > 0) {
                await connection.end();
                return interaction.reply({ content: `⚠️ This serial is already whitelisted.`, ephemeral: true });
            }

            // Insert data
            await connection.execute(
                'INSERT INTO whitelist (discord_id, mta_serial, added_by) VALUES (?, ?, ?)',
                [targetUser.id, serial, interaction.user.tag]
            );
            await connection.end();

            const embed = new EmbedBuilder()
                .setColor('#FFD700') // Gold color
                .setTitle('✅ Player Whitelisted')
                .setDescription(`Successfully added to **MNC Roleplay**`)
                .addFields(
                    { name: 'Discord User', value: `${targetUser}`, inline: true },
                    { name: 'MTA Serial', value: `\`${serial}\``, inline: true },
                    { name: 'Authorized By', value: `${interaction.user.tag}`, inline: true }
                )
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            return interaction.reply({ content: '❌ A database error occurred.', ephemeral: true });
        }
    }
};
