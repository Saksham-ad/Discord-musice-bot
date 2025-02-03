const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Show information about the currently playing song'),

    async execute(interaction, client) {
        const player = client.riffy.players.get(interaction.guild.id);
        
        if (!player || !player.current) {
            return interaction.reply({ content: 'There is no music playing!', ephemeral: true });
        }

        try {
            const track = player.current;
            const position = player.position;
            const duration = track.info.length;

            // Create a progress bar
            const progressBar = createProgressBar(position, duration);

            const embed = new EmbedBuilder()
                .setTitle('Now Playing')
                .setColor('#FF0000')
                .addFields(
                    { name: 'Title', value: track.info.title },
                    { name: 'Author', value: track.info.author },
                    { name: 'Progress', value: progressBar },
                    { name: 'Requested By', value: track.info.requester.username }
                )
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error in nowplaying command:', error);
            return interaction.reply({ content: 'An error occurred while trying to show the current song.', ephemeral: true });
        }
    }
};

function createProgressBar(current, total) {
    const length = 20;
    const percentage = current / total;
    const progress = Math.round(length * percentage);
    const emptyProgress = length - progress;

    const progressText = '▬'.repeat(progress);
    const emptyProgressText = '─'.repeat(emptyProgress);
    const percentageText = Math.round(percentage * 100);

    const bar = `${progressText}🔘${emptyProgressText} (${percentageText}%)`;
    return bar;
}
