const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shuffle')
        .setDescription('Shuffle the current queue'),

    async execute(interaction, client) {
        if (!interaction.member.voice.channel) {
            return interaction.reply({ content: 'You need to be in a voice channel to use this command!', ephemeral: true });
        }

        const player = client.riffy.players.get(interaction.guild.id);
        
        if (!player) {
            return interaction.reply({ content: 'There is no music playing!', ephemeral: true });
        }

        try {
            if (player.queue.size < 2) {
                return interaction.reply({ content: 'Need at least 2 songs in the queue to shuffle!', ephemeral: true });
            }

            player.queue.shuffle();
            return interaction.reply('🔀 Shuffled the queue!');
        } catch (error) {
            console.error('Error in shuffle command:', error);
            return interaction.reply({ content: 'An error occurred while trying to shuffle the queue.', ephemeral: true });
        }
    }
};
