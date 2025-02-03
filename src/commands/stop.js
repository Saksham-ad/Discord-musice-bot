const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop the music and clear the queue'),

    async execute(interaction, client) {
        if (!interaction.member.voice.channel) {
            return interaction.reply({ content: 'You need to be in a voice channel to use this command!', ephemeral: true });
        }

        const player = client.riffy.players.get(interaction.guild.id);
        
        if (!player) {
            return interaction.reply({ content: 'There is no music playing!', ephemeral: true });
        }

        try {
            player.queue.clear(); // Clear the queue
            player.stop(); // Stop the current song
            player.destroy(); // Destroy the player and leave the voice channel
            return interaction.reply('⏹️ Stopped the music and cleared the queue!');
        } catch (error) {
            console.error('Error in stop command:', error);
            return interaction.reply({ content: 'An error occurred while trying to stop the music.', ephemeral: true });
        }
    }
};
