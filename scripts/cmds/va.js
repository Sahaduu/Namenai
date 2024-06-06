const axios = require("axios");
const fs = require("fs-extra");
const ytdl = require("ytdl-core");
const yts = require("yt-search");

module.exports = {
  config: {
    name: "va",
    aliases: ["vs"],
    version: "1.6",
    author: "NZ R",
    category: "music",
    dependencies: {
      "fs-extra": "",
      "axios": "",
      "ytdl-core": "",
      "yt-search": ""
    }
  },

  onStart: async ({ api, event }) => {
    const input = event.body;
    const data = input.split(" ");
    const command = data[1];
    data.splice(0, 2);

    if (data.length < 1) {
      return api.sendMessage("Please provide a title for the search.", event.threadID);
    }

    const query = data.join(" ");

    try {
      if (command === "-a" || command === "-s") {
        await handleMedia(api, event, query, "audioonly", ".mp3");
      } else if (command === "-v" || command === "-video") {
        await handleMedia(api, event, query, "audioandvideo", ".mp4");
      } else {
        return api.sendMessage("Unknown command. Use -s for audio or -v for video.", event.threadID);
      }
    } catch (error) {
      console.error('[ERROR]', error);
      api.sendMessage('An error occurred while processing your request.', event.threadID);
    }
  }
};

async function handleMedia(api, event, query, filter, extension) {
  api.setMessageReaction("⏳", event.messageID, event.messageID, api);

  const searchMessage = await api.sendMessage(`🔍 | Searching for ${filter === "audioonly" ? "audio" : "video"}...`, event.threadID);

  const searchResults = await yts(query);
  if (!searchResults.videos.length) {
    api.unsendMessage(searchMessage.messageID);
    return api.sendMessage("No results found for your query.", event.threadID);
  }

  const media = searchResults.videos[0];
  const mediaUrl = media.url;

  const stream = ytdl(mediaUrl, { filter });

  const fileName = `${event.senderID}${extension}`;
  const filePath = __dirname + `/cache/${fileName}`;

  stream.pipe(fs.createWriteStream(filePath));

  stream.on('response', () => {
    console.info('[DOWNLOADER]', 'Starting download...');
  });

  stream.on('info', (info) => {
    console.info('[DOWNLOADER]', `Downloading ${filter === "audioonly" ? "audio" : "video"}: ${info.videoDetails.title}`);
  });

  stream.on('end', async () => {
    console.info('[DOWNLOADER] Download finished.');

    if (fs.statSync(filePath).size > 26214400) {
      fs.unlinkSync(filePath);
      api.unsendMessage(searchMessage.messageID);
      return api.sendMessage('The file is larger than 25MB and cannot be sent.', event.threadID);
    }

    const message = {
      body: `Here is your requested ${filter === "audioonly" ? "music" : "video"}.\n\nTitle: ${media.title}\nDuration: ${media.duration.timestamp}`,
      attachment: fs.createReadStream(filePath)
    };

    api.unsendMessage(searchMessage.messageID);

    api.setMessageReaction("✅", event.messageID, event.messageID, api);

    api.sendMessage(message, event.threadID, () => {
      fs.unlinkSync(filePath);
    });
  });
}
