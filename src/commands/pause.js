const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pause or resume the current song'),

    async execute(interaction, client) {
        if (!interaction.member.voice.channel) {
            return interaction.reply({ content: 'You need to be in a voice channel to use this command!', ephemeral: true });
        }

        const player = client.riffy.players.get(interaction.guild.id);
        
        if (!player) {
            return interaction.reply({ content: 'There is no music playing!', ephemeral: true });
        }

        try {
            if (player.paused) {
                player.resume();
                return interaction.reply('▶️ Resumed the music!');
            } else {
                player.pause();
                return interaction.reply('⏸️ Paused the music!');
            }
        } catch (error) {
            console.error('Error in pause command:', error);
            return interaction.reply({ content: 'An error occurred while trying to pause/resume the music.', ephemeral: true });
        }
    }
};
