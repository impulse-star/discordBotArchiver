# discBotArchiver
Archives Files From Discord

## Run instructions:

If you want to run the bot, create a config.json file in the src directory before building. This file should be a json object with two keys, one named <code>token</code> whos value will be the token of your discord bot, and another key named <code>channelId</code> whos value will be the id of the channel you want your bot to log. Follow the steps on the discord developer portal to find out how to get your bot's token. Additionally, to find the id of the channel, you just right click on a channel while in discord's developer mode. An option should pop up to "Copy Channel ID".

Once you've completed the configuration, make sure you add the bot to your server. Run <code>npm install</code>, then <code>npm start</code>. The bot will log all discord media links it finds into a file named links.txt located in the root directory of the project. The bot will then download all of the links it recognizes in the file. It's highly encouraged to verify that the amount of images the bot has downloaded matches the amount of links found in a channel using discord's built in search feature.

DO NOTE: the bot will log all messages that it encounters into the links.txt file. This is done in case something happens with the bot, so the original message can be found in the file rather than having to search through the discord channel.

If you just want to download these links, run <code>npm run downloadLinks</code> which will parse the links.txt and download any discord links it recognizes.

If you just want to collect the messages and attachments, run <code>npm run collectLinks</code>, which will scan the given discord channel for all messages and attachments and log them into links.txt.

## Build Instructions:

If you just want to build the files for the project but not run it, run <code>npm install</code> and <code>npx tsc</code> in the root directory. This will build the js files for the project.