const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Adjust the music volume')
        .addIntegerOption(option =>
            option.setName('level')
                .setDescription('Volume level between 0-100')
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(100)),

    async execute(interaction, client) {
        if (!interaction.member.voice.channel) {
            return interaction.reply({ content: 'You need to be in a voice channel to use this command!', ephemeral: true });
        }

        const player = client.riffy.players.get(interaction.guild.id);
        
        if (!player) {
            return interaction.reply({ content: 'There is no music playing!', ephemeral: true });
        }

        const volume = interaction.options.getInteger('level');

        try {
            player.setVolume(volume);
            return interaction.reply(`🔊 Volume set to: ${volume}%`);
        } catch (error) {
            console.error('Error in volume command:', error);
            return interaction.reply({ content: 'An error occurred while trying to adjust the volume.', ephemeral: true });
        }
    }
};
