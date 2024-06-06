const EventEmitter = require('events');
const fs = require("fs-extra");
const ytdl = require("ytdl-core");
const yts = require("yt-search");
const { getStreamFromURL } = global.utils;

const eventEmitter = new EventEmitter();

module.exports = {
    config: {
        name: "sing",
        version: "3.0",
        author: "NZ R",
        category: "music",
        dependencies: {
            "fs-extra": "",
            "ytdl-core": "",
            "yt-search": ""
        }
    },
    onStart: async ({ api, event, args, usersData, message, commandName }) => {
        try {
            const input = event.body;
            const query = input.substring(6).trim();
            
            if (!query) {
                api.setMessageReaction("❌", event.messageID, () => {}, true);
                return message.reply(
                    "Hey..! 🎤 You need to provide a song title so I can find it and sing it for you!\n\n" +
                    "💡 Tip: Just type the song title after the command.\n" +
                    "Example: -sing Happy Nation"
                );
            }

            const searchResults = await yts(query);

            if (!searchResults.videos.length) {
                api.setMessageReaction("❌", event.messageID, () => {}, true);
                return message.reply("Hmm, I couldn't find any relevant results for that song title. Maybe try another one.?");
            }

            const results = searchResults.videos.slice(0, 12);
            let msg = "";
            const thumbnails = [];

            for (let i = 0; i < results.length; i++) {
                const music = results[i];
                thumbnails.push(getStreamFromURL(music.thumbnail));
                msg += `${i + 1}. ${music.title}\nDuration: ${music.duration.timestamp}\nChannel: ${music.author.name}\n\n`;
            }

            message.reply({
                body: `🎵 Here are the top results for your query. Reply with the number of the song you want me to sing:\n\n${msg}`,
                attachment: await Promise.all(thumbnails)
            }, (err, info) => {
                if (err) return console.error(err);
                global.GoatBot.onReply.set(info.messageID, {
                    commandName,
                    messageID: info.messageID,
                    author: event.senderID,
                    results
                });
            });

        } catch (error) {
            console.error('[ERROR]', error);
            api.setMessageReaction("❌", event.messageID, () => {}, true);
            return message.reply("Oops! Something went wrong while processing your request. Please try again later.");
        }
    },
    onReply: async ({ event, api, Reply, message, usersData }) => {
        const { results } = Reply;
        const choice = parseInt(event.body, 10);

        if (!isNaN(choice) && choice >= 1 && choice <= results.length) {
            const music = results[choice - 1];
            const user = event.senderID;
            const userName = await usersData.getName(user);

            try {
                const stream = ytdl(music.url, { filter: "audioonly" });
                const fileName = `${Date.now()}_${music.title.replace(/\s+/g, '_')}.mp3`;
                const filePath = `${__dirname}/cache/${fileName}`;

                stream.pipe(fs.createWriteStream(filePath));

                stream.on('end', () => {
                    const responseMessage = {
                        body: `🎵 Here's your song, ${userName}..! Enjoy! 🎤\n\n` +
                              `Title: ${music.title}\n` +
                              `Duration: ${music.duration.timestamp}\n` +
                              `Views: ${music.views.toLocaleString()}\n` +
                              `Uploaded by: ${music.author.name}\n` +
                              `YouTube Link: ${music.url}\n\n` +
                              `🎶 Happy listening! 🎶`,
                        attachment: fs.createReadStream(filePath)
                    };

                    message.reply(responseMessage, () => {
                        fs.unlinkSync(filePath);
                        api.setMessageReaction("✅", Reply.messageID, () => {}, true);
                        api.unsendMessage(Reply.messageID);
                    });
                });
            } catch (error) {
                console.error('[STREAM ERROR]', error);
                api.setMessageReaction("❌", Reply.messageID, () => {}, true);
                return message.reply("There was an issue retrieving the audio stream. Please ensure the `ytdl-core` library is up-to-date.");
            }
        } else {
            api.setMessageReaction("❌", Reply.messageID, () => {}, true);
            api.unsendMessage(Reply.messageID);
        }
    },
    eventEmitter: eventEmitter
};
