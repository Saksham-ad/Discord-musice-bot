const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Change the loop mode')
        .addStringOption(option =>
            option.setName('mode')
                .setDescription('The loop mode to set')
                .setRequired(true)
                .addChoices(
                    { name: 'Off', value: 'off' },
                    { name: 'Track', value: 'track' },
                    { name: 'Queue', value: 'queue' }
                )),

    async execute(interaction, client) {
        if (!interaction.member.voice.channel) {
            return interaction.reply({ content: 'You need to be in a voice channel to use this command!', ephemeral: true });
        }

        const player = client.riffy.players.get(interaction.guild.id);
        
        if (!player) {
            return interaction.reply({ content: 'There is no music playing!', ephemeral: true });
        }

        const mode = interaction.options.getString('mode');

        try {
            switch (mode) {
                case 'off':
                    player.setLoop('none');
                    return interaction.reply('🔁 Loop mode: Off');
                case 'track':
                    player.setLoop('track');
                    return interaction.reply('🔂 Loop mode: Current Track');
                case 'queue':
                    player.setLoop('queue');
                    return interaction.reply('🔁 Loop mode: Queue');
                default:
                    return interaction.reply({ content: 'Invalid loop mode!', ephemeral: true });
            }
        } catch (error) {
            console.error('Error in loop command:', error);
            return interaction.reply({ content: 'An error occurred while trying to change the loop mode.', ephemeral: true });
        }
    }
};
