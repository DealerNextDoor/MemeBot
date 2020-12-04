const fs = require('fs');
const Discord = require('discord.js');
const { prefix, token } = require('./config.json');

// Create discord.js objects
const client = new Discord.Client();
client.commands = new Discord.Collection(); // store commands instead of writing if statement for each command

// Load in commands dynamically
const commandFiles = fs.readdirSync('./commands');

// Adds each command in the `./commands` folder to the bot
for (const file of commandFiles) {
	if (file.toLowerCase().endsWith('.js')) {
		const cmd = require(`./commands/${file}`);
		client.commands.set(cmd.name, cmd);
	}
}

// Basically the 'onStart' method - this runs when it successfully connects to discord and initiates itself
client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}.`);
});

// onMessage - Runs every time someone sends a message
// quick reference `msg`: https://discord.js.org/#/docs/main/stable/class/Message
client.on('message', msg => {
	if (!msg.content.startsWith(prefix) || msg.author.bot) return; // if message doesn't start with command prefix or is from bot, ignore

	// Split command into an array (ex: "!ping hello world" => ['!ping', 'hello', 'world'])
	const args = msg.content.slice(prefix.length).split(/ +/);
	const cmd = args.shift().toLowerCase();

	// The only built in command - !cmds / !commands. Lists all registered commands w/ a description
	if (cmd === "commands" || cmd === "cmds") {
		var cmds = client.commands.values();
		var bot_reply = "\n";
		for (var command of cmds) {
			bot_reply += "`" + prefix + command.name + "` - " + command.description + "\n";
		}
		msg.reply(bot_reply);
		return;
	}

	// Ignores if they try to run a command bot doesn't have
	if (!client.commands.has(cmd)) return;

	// Command was found, so run it and report any errors.
	try {
		client.commands.get(cmd).execute(msg, args);
	} catch(err) {
		console.error(err);
		msg.reply('There was an error trying to run this command. Please repeatedly spam the mods until they notice it. Thank you.');
		msg.reply(`\`\`\`\n${err}\`\`\``);
	}
});

// Starts the bot
client.login(token);
