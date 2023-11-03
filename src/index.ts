import { Client, Events, GatewayIntentBits, GuildMessageManager, Message, SlashCommandBuilder, TextChannel } from 'discord.js';
import { token, channelId } from './config.json';
import fs = require('fs');


const DISCORD_LINK_REGEX = /(https:\/\/cdn\.discordapp\.com\/attachments\/\d+)|(https:\/\/media\.discordapp\.net\/attachments\/\d+)/g;
const FILE_TO_WRITE_TO = './links.txt';


function appendToFile(data: string) {
	if (!fs.existsSync(FILE_TO_WRITE_TO)) {
		console.log("WARNING! FILE DOES NOT EXIST, CREATING NEW FILE...");
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
		let message = messages.first();
		if (!messages.delete(message.id)) {
			throw new Error("Attempted to Delete non-existant message from messages queue.");
		}

		let messageContent = message.content;
		let messageAttachment = message.attachments;

		textContentOfMessages.push(messageContent);

		for (let entry of messageAttachment) {
			let attachment = entry[1];
			let attachmentUrl = attachment.url;
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

	appendToFile("\nArchive of Messages Content:\n");
	appendToFile(textContentOfMessages.join('\n'));
	appendToFile("\nAttachment Urls:\n");
	appendToFile(attachmentUrls.join('\n'));
	appendToFile("\nURLs In Text Content:\n");
	appendToFile(textContentUrls.join('\n'));

	console.log("Collecting completed.");
});

// TODO make the channel selectable at runtime! :)
const logChannel = new SlashCommandBuilder()
	.setName('log')
	.setDescription('logs messages in a specific channel')
	.addChannelOption(option => {
		return option
			.setName('channel')
			.setDescription('The channel to collect the links from.')
			.setRequired(true);
	});

// Log in to Discord with your client's token
client.login(token);
