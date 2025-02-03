require('dotenv').config();
const { Client, Collection, GatewayIntentBits, REST, Routes, GatewayDispatchEvents } = require('discord.js');
const { Riffy } = require('riffy');
const path = require('path');
const fs = require('fs');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
    ]
});

// Initialize collections
client.commands = new Collection();
client.riffy = null;

// Lavalink node configuration
const nodes = [
    {
        host: "lava-v4.ajieblogs.eu.org",
        password: "https://dsc.gg/ajidevserver",
        port: 443,
        secure: true,
        name: "Main",
    }
];

// Initialize Riffy
client.riffy = new Riffy(client, nodes, {
    send: (payload) => {
        const guild = client.guilds.cache.get(payload.d.guild_id);
        if (guild) guild.shard.send(payload);
    },
    defaultSearchPlatform: "ytmsearch",
    restVersion: "v4"
});

// Command loader
const loadCommands = () => {
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        }
    }
};

// Register slash commands
const registerCommands = async () => {
    const commands = [];
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command) {
            commands.push(command.data.toJSON());
        }
    }

    const rest = new REST().setToken(process.env.TOKEN);

    try {
        console.log('Started refreshing application (/) commands.');
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
};

// Event handler
client.on('ready', () => {
    client.riffy.init(client.user.id);
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction, client);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error executing this command!', ephemeral: true });
    }
});

// Riffy event handlers
client.riffy.on("nodeConnect", (node) => {
    console.log(`Node "${node.name}" connected.`);
});

client.riffy.on("nodeError", (node, error) => {
    console.log(`Node "${node.name}" encountered an error: ${error.message}.`);
});

client.riffy.on("trackStart", async (player, track) => {
    const channel = client.channels.cache.get(player.textChannel);
    channel.send(`Now playing: \`${track.info.title}\` by \`${track.info.author}\`.`);
});

client.riffy.on("queueEnd", async (player) => {
    const channel = client.channels.cache.get(player.textChannel);
    player.destroy();
    channel.send("Queue has ended.");
});

// This will update the voice state of the player.
client.on("raw", (d) => {
    if (![GatewayDispatchEvents.VoiceStateUpdate, GatewayDispatchEvents.VoiceServerUpdate].includes(d.t)) return;
    client.riffy.updateVoiceState(d);
});

// Load commands and start the bot
loadCommands();
registerCommands();
client.login(process.env.TOKEN);
