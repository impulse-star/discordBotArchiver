import fs = require('fs');
import { DISCORD_LINK_REGEX } from './banana';

console.log('Download script.');

const fileString = fs.readFileSync('./links.txt', 'utf8');

interface Attachment {
	url: string;
	filename: string;
}

if (!fs.existsSync('./downloads')) {
	console.log('No download directory present, creating one...');
	fs.mkdirSync('./downloads');
}

let totalFilesDownloaded = 0;
let totalTextUrlsDownloaded = 0;
let startLogging = false;
let startUrlLogging = false;
const downloadQueue: Attachment[] = [];
const textUrlDownloadQueue: Attachment[] = [];

for (const line of fileString.split('\n')) {
	// Get media.discordapp.net links or cdn.discordapp.com links and split on the ?, download the
	// file before that.
	if (line === 'Attachment Urls:') {
		startLogging = true;
		continue;
	}
	if (startLogging) {
		if (startUrlLogging) {
			const url = line.replace('https://media.discordapp.net/attachments/',
				'https://cdn.discordapp.com/attachments/').split('?')[0];
			const filename = fileString.split('/')[6].split('?')[0];
			textUrlDownloadQueue.push({ url, filename });
			totalTextUrlsDownloaded++;
			continue;
		}
		if (line === 'URLs In Text Content:') {
			startUrlLogging = true;
			continue;
		}
		const url = line.replace('https://media.discordapp.net/attachments/',
			'https://cdn.discordapp.com/attachments/').split('?')[0];
		const filename = fileString.split('/')[6].split('?')[0];
		downloadQueue.push({ url, filename });
		totalFilesDownloaded++;
	}
}

console.log(`Found ${totalFilesDownloaded}` +
	`attachment files and ${totalTextUrlsDownloaded} urls sent as links in messages`);

console.log('Downloading Urls');

async function downloadFile({ url, filename }: Attachment, interval: NodeJS.Timeout, listOfUrls: Attachment[]) {
	if (!url.match(DISCORD_LINK_REGEX)) {
		console.error(`Attempted to download invalid url: ${url}`);
	}
	if (listOfUrls.length <= 0) {
		clearInterval(interval);
	}
	else {
		const response = await fetch(url);
		if (response.type === 'error' || !response.ok) {
			console.error(`Something went very wrong trying to download url: ${url}`);
			return;
		}
		const imageData = Buffer.from(await response.arrayBuffer());
		fs.writeFileSync(`./downloads/${filename}`, imageData);
	}
}

const intervalOne = setInterval(() => { downloadFile(downloadQueue.pop(), intervalOne, downloadQueue); });
const intervalTwo = setInterval(() => { downloadFile(textUrlDownloadQueue.pop(), intervalTwo, textUrlDownloadQueue); });

console.log('Program Completed.');

