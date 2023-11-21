import { Client, Events, GatewayIntentBits, GuildMessageManager, TextChannel } from 'discord.js';
import { token, channelId } from './config.json';
// If you are wondering why its called banana, you can thank js/ts for lacking namespaces
// and overriding my import of "constants" when I try to import my own file named "constants".
import { DISCORD_LINK_REGEX, FILE_TO_WRITE_TO } from './banana';
import fs = require('fs');

// my code doesnt deal with repeated writes to the file, so we wipe the file everytime on start
if (fs.existsSync(FILE_TO_WRITE_TO)) {
	console.warn('Warning, links.txt already exists.');
	console.warn('Since the program has no built in checks for a links.txt thats been written to ' +
		'multiple times, the program will delete this file. Expect this behaviour to change in ' +
		'the future.');
	fs.rmSync(FILE_TO_WRITE_TO);
}

function appendToFile(data: string) {
	if (!fs.existsSync(FILE_TO_WRITE_TO)) {
		console.log('file does not exist, creating new file...');
	}
	fs.appendFileSync(FILE_TO_WRITE_TO, data);
}


const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent] });

client.once(Events.ClientReady, async c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);

	// This is ugly, having to hardcode the channel thats being used.
	// TODO, FIX THIS.
	const channel = client.channels.cache.get(channelId) as TextChannel;
	const messageManager: GuildMessageManager = channel.messages;

	const messageAttachments = [];
	const messageContents = [];
	const textContentUrls = [];
	const attachmentUrls = [];
	const textContentOfMessages = [];

	// Default is 50 messages retrieved btw.
	let messages = await messageManager.fetch({ limit: 100 });
	while (messages.size > 0) {
		const message = messages.first();
		if (!messages.delete(message.id)) {
			throw new Error('Attempted to Delete non-existant message from messages queue.');
		}

		const messageContent = message.content;
		const messageAttachment = message.attachments;

		textContentOfMessages.push(messageContent);

		for (const entry of messageAttachment) {
			const attachment = entry[1];
			const attachmentUrl = attachment.url;
			attachmentUrls.push(attachmentUrl);
		}

		if (messageContent.match(DISCORD_LINK_REGEX)) {
			textContentUrls.push(messageContent);
		}

		messageContents.push(message.content);
		messageAttachments.push(message.attachments);

		if (messages.size <= 0) {
			messages = await messageManager.fetch({ limit: 100, before: message.id });
		}
	}

	appendToFile('\nArchive of Messages Content:\n');
	appendToFile(textContentOfMessages.join('\n'));
	appendToFile('\nAttachment Urls:\n');
	appendToFile(attachmentUrls.join('\n'));
	appendToFile('\nURLs In Text Content:\n');
	appendToFile(textContentUrls.join('\n'));

	console.log('Collecting completed.');
	// We have succeeded in collecting links.
	process.exit(0);
});

// TODO make the channel selectable at runtime! :)
// const logChannel = new SlashCommandBuilder()
// 	.setName('log')
// 	.setDescription('logs messages in a specific channel')
// 	.addChannelOption(option => {
// 		return option
// 			.setName('channel')
// 			.setDescription('The channel to collect the links from.')
// 			.setRequired(true);
// 	});

// Log in to Discord with your client's token
client.login(token);
