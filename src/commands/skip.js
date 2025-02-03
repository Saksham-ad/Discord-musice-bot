const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skip the current song'),

    async execute(interaction, client) {
        if (!interaction.member.voice.channel) {
            return interaction.reply('You need to be in a voice channel to use this command!');
        }

        const player = client.riffy.players.get(interaction.guild.id);
        
        if (!player) {
            return interaction.reply('There is no music playing!');
        }

        if (player.queue.size === 0) {
            player.destroy();
            return interaction.reply('Queue ended, leaving voice channel.');
        }

        player.skip();
        return interaction.reply('Skipped the current song!');
    }
};
