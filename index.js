const { Client, GatewayIntentBits, SlashCommandBuilder, Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { token, clientId, guildId, roleMappings } = require('./config.json');

// Create a new client instance
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Register the slash command
const commands = [
  new SlashCommandBuilder()
    .setName('captain')
    .setDescription('Request a role by providing the correct password.')
    .addStringOption(option =>
      option.setName('password')
      .setDescription('Enter the role password')
      .setRequired(true)),
];

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

// Event listener for slash commands
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'captain') {
    const password = interaction.options.getString('password');
    const roleId = roleMappings[password];

    if (roleId) {
      const role = interaction.guild.roles.cache.get(roleId);
      if (role) {
        await interaction.member.roles.add(role);
        await interaction.reply({ content: `You have been given the ${role.name} role!`, ephemeral: true });
      } else {
        await interaction.reply({ content: 'Role not found.', ephemeral: true });
      }
    } else {
      await interaction.reply({ content: 'Incorrect password!', ephemeral: true });
    }
  }
});

// Login to Discord with your app's token
client.login(token);
