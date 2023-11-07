import fs = require('fs');
import { DISCORD_LINK_REGEX } from './banana';

console.log('Downloading links...');

const fileString = fs.readFileSync('../links.txt', 'utf8');

const totalFilesDownloaded = 0;
let startLogging = false;

for (const line of fileString.split('\n')) {
	// Get media.discordapp.net links or cdn.discordapp.com links and split on the ?, download the
	// file before that.
	if (line === 'Attachment Urls:\n') {
		startLogging = true;
	}
	if (startLogging) {
		// pass
	}
}

console.log('Program Completed.');

