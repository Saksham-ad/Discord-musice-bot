const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a song')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('The song to play')
                .setRequired(true)),

    async execute(interaction, client) {
        const query = interaction.options.getString('query');
        
        // Check if user is in a voice channel
        if (!interaction.member.voice.channel) {
            return interaction.reply({ content: 'You need to be in a voice channel to use this command!', ephemeral: true });
        }

        await interaction.deferReply();

        try {
            // Get or create player
            const player = client.riffy.createConnection({
                guildId: interaction.guild.id,
                voiceChannel: interaction.member.voice.channel.id,
                textChannel: interaction.channel.id,
                deaf: true,
            });

            // Wait for the player to be ready
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Resolve the track
            const resolve = await client.riffy.resolve({
                query: query,
                requester: interaction.user,
            });

            const { loadType, tracks, playlistInfo } = resolve;

            if (loadType === "playlist") {
                for (const track of resolve.tracks) {
                    track.info.requester = interaction.user;
                    player.queue.add(track);
                }

                await interaction.editReply(
                    `Added: \`${tracks.length} tracks\` from \`${playlistInfo.name}\``
                );

                if (!player.playing && !player.paused) {
                    await player.play();
                }
            } else if (loadType === "search" || loadType === "track") {
                const track = tracks.shift();
                track.info.requester = interaction.user;

                player.queue.add(track);
                await interaction.editReply(`Added: \`${track.info.title}\``);

                if (!player.playing && !player.paused) {
                    await player.play();
                }
            } else {
                return interaction.editReply("No results found.");
            }
        } catch (error) {
            console.error('Error in play command:', error);
            await interaction.editReply('An error occurred while trying to play the song. Please try again.');
        }
    }
};
