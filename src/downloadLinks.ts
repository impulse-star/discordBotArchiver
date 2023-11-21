import fs = require('fs');
import { DISCORD_LINK_REGEX, GetRandomInt } from './banana';
import { GetSha256Hash } from './banana';

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
let totalDuplicates = 0;
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
			const filename = url.split('/')[6];
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
		const filename = url.split('/')[6];
		downloadQueue.push({ url, filename });
		totalFilesDownloaded++;
	}
}

console.log(`Found ${totalFilesDownloaded} ` +
	`attachment files and ${totalTextUrlsDownloaded} urls sent as links in messages`);

console.log('Downloading Urls');

const alreadyDownloadedImages: Set<string> = new Set();

async function downloadFile(interval: NodeJS.Timeout, listOfUrls: Attachment[]) {
	if (listOfUrls.length <= 0) {
		console.log('Finished downloading a List of Url\'s');
		console.log(`Total duplicates found = ${totalDuplicates}`);
		console.log(`Total files from attachments: ${totalFilesDownloaded}`);
		console.log(`Total files from hyperlinks in text: ${totalTextUrlsDownloaded}`);
		console.warn('Please make sure to verify that all images have been downloaded by using' +
			'discord\'s built in search tool!');
		clearInterval(interval);
		return;
	}
	const { url, filename } = listOfUrls.pop();
	console.log(`Downloading url: ${url} with filename: ${filename}`);
	if (!url.match(DISCORD_LINK_REGEX)) {
		console.error(`Attempted to download invalid url: ${url}`);
		return;
	}
	else {
		const response = await fetch(url);
		if (response.type === 'error' || !response.ok) {
			console.error(`Something went very wrong trying to download url: ${url}`);
			return;
		}
		const imageData = Buffer.from(await response.arrayBuffer());
		const imageHash = GetSha256Hash(imageData);
		if (alreadyDownloadedImages.has(imageHash)) {
			console.log(`Already have downloaded file: ${filename}` +
				`from url: ${url} (Matching Hash: ${imageHash})`);
			totalDuplicates++;
		}
		else {
			alreadyDownloadedImages.add(imageHash);
			const originalFilename = `./downloads/${filename}`;
			let randomFileName = originalFilename;
			while (fs.existsSync(randomFileName)) {
				randomFileName = `./downloads/${GetRandomInt(1000000)}_${filename}`;
			}
			fs.writeFileSync(randomFileName, imageData);
		}
	}
}

const allUrlsPossibly = downloadQueue.concat(textUrlDownloadQueue);

const intervalOne = setInterval(() => { downloadFile(intervalOne, allUrlsPossibly); }, 5000);
// const intervalTwo = setInterval(() => { downloadFile(intervalTwo, textUrlDownloadQueue); }, 5000);

console.log('Download Loops began.');

