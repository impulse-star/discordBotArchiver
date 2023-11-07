import fs = require('fs');

console.log("Downloading links...");

const fileString = fs.readFileSync('../links.txt', 'utf8');

let totalFilesDownloaded = 0;

for (let line of fileString.split('\n')) {
    // Get media.discordapp.net links or cdn.discordapp.com links and split on the ?, download the
    // file before that.
}

console.log("Program Completed.");

