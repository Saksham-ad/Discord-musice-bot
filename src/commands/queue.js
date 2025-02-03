const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Show the current music queue'),

    async execute(interaction, client) {
        const player = client.riffy.players.get(interaction.guild.id);
        
        if (!player) {
            return interaction.reply('There is no music playing!');
        }

        const queue = player.queue;
        const currentTrack = player.current;

        if (!currentTrack) {
            return interaction.reply('There is no music playing!');
        }

        const embed = new EmbedBuilder()
            .setTitle('Music Queue')
            .setColor('#FF0000');

        // Add current track
        embed.addFields({
            name: 'Now Playing',
            value: `${currentTrack.info.title} - ${currentTrack.info.author}`
        });

        // Add queue
        if (queue.size > 0) {
            const tracks = queue.map((track, index) => 
                `${index + 1}. ${track.info.title} - ${track.info.author}`
            ).slice(0, 10);

            embed.addFields({
                name: 'Up Next',
                value: tracks.join('\n')
            });

            if (queue.size > 10) {
                embed.setFooter({ text: `And ${queue.size - 10} more songs...` });
            }
        }

        return interaction.reply({ embeds: [embed] });
    }
};
