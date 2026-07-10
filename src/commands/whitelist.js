import mysql from 'mysql2/promise';
import { EmbedBuilder } from 'discord.js';

// ⚠️ CHANGE THESE TO MATCH YOUR ACTUAL DATABASE CREDENTIALS
const mtaDbConfig = {
    host: 'localhost', 
    user: 'root',
    password: 'your_database_password',
    database: 'mnc_roleplay' 
};

// Listen for standard text messages instead of slash commands
client.on('messageCreate', async (message) => {
    // Prevent bot from replying to itself or other bots
    if (message.author.bot) return;

    // Command structure: !whitelist <MTA_SERIAL> <@User>
    if (message.content.startsWith('!whitelist')) {
        
        // Check if the person using the command is an Administrator
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('❌ You do not have permission to use this command.');
        }

        const args = message.content.split(' ');
        const serial = args[1]?.toUpperCase().trim();
        const targetUser = message.mentions.users.first();

        // Check if they provided both the serial and the user mention
        if (!serial || serial.length !== 32 || !targetUser) {
            return message.reply('⚠️ **Usage:** `!whitelist <32_char_serial> @User`');
        }

        try {
            const connection = await mysql.createConnection(mtaDbConfig);
            
            // Check if already whitelisted
            const [rows] = await connection.execute('SELECT * FROM whitelist WHERE mta_serial = ?', [serial]);
            if (rows.length > 0) {
                await connection.end();
                return message.reply('⚠️ This MTA serial is already whitelisted.');
            }

            // Insert into the database table
            await connection.execute(
                'INSERT INTO whitelist (discord_id, mta_serial, added_by) VALUES (?, ?, ?)',
                [targetUser.id, serial, message.author.tag]
            );
            await connection.end();

            // Send success confirmation
            const embed = new EmbedBuilder()
                .setColor('#FFD700') 
                .setTitle('✅ Player Whitelisted')
                .setDescription(`Successfully granted access to **MNC Roleplay**`)
                .addFields(
                    { name: 'Discord User', value: `${targetUser}`, inline: true },
                    { name: 'MTA Serial', value: `\`${serial}\``, inline: true },
                    { name: 'Authorized By', value: `${message.author.tag}`, inline: true }
                )
                .setTimestamp();

            return message.reply({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            return message.reply('❌ A database connection error occurred. Check your database credentials.');
        }
    }
});
