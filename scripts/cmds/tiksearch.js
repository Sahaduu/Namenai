const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const sendVideosOneByOne = async (message, searchQuery, videoUrls) => {
  const downloadFolder = "download";
  await fs.ensureDir(downloadFolder);

  for (let i = 0; i < videoUrls.length; i++) {
    try {
      const videoUrl = videoUrls[i];
      const videoFileName = `video_${i + 1}.mp4`;
      const videoPath = path.join(downloadFolder, videoFileName);
      const videoResponse = await axios.get(videoUrl, { responseType: "arraybuffer" });
      await fs.writeFile(videoPath, videoResponse.data);
      await message.reply({
        body: `Check out this TikTok vid for (${searchQuery}) ✅`,
        attachment: fs.createReadStream(videoPath),
      });
    } catch (error) {
      console.error(error);
      await message.reply("Oops, couldn't send the vid ⚠");
    }
  }
};

const downloadTikTok = async (message, tikTokUrl) => {
  try {
    const response = await axios.get(`https://apis-samir.onrender.com/tiktok?url=${encodeURIComponent(tikTokUrl)}`);
    const { hdplay, user, url} = response.data;

    if (!hdplay) {
      message.reply("Couldn't find or download the vid. ⚠");
      return;
    }

    const videoFileName = `tiktok.mp4`;
    const videoPath = path.join("download", videoFileName);
    const videoResponse = await axios.get(url, { responseType: "arraybuffer" });
    await fs.writeFile(videoPath, videoResponse.data);
    await message.reply({
      body: `TikTok vid from @${user.unique_id} downloaded. ✅`,
      attachment: fs.createReadStream(videoPath),
    });
  } catch (error) {
    console.error(error);
    message.reply("Error downloading TikTok vid. ⚠");
  }
};

module.exports = {
  config: {
    name: 'tiksearch',
    aliases: ["tiksc"],
    version: '1.0',
    author: 'softrils',
    role: 0,
    category: 'Entertainment',
    description: {
      en: 'Download and send TikTok vids.',
    },
    guide: {
      en: 'To use this command, provide a TikTok vid URL or a search query. You can also specify how many vids to fetch (default is 1). Example usage:\n\n{pn} https://vt.tiktok.com/ZSFojHeuo/ \n{pn} izan ibanez | 2\n{pn} gata only letra | 4',
    }
  },
  onStart: async function ({ api, message, args, event }) {
    const [query, numVideos = 1] = args.join(" ").split("|").map((item) => item.trim());
    const searchQuery = query.trim();
    const numRequestedVideos = parseInt(numVideos);

    if (!searchQuery) {
      message.send("You gotta give me a search query to find the videos! ⚠");
      return;
    }

    if (isNaN(numRequestedVideos) || numRequestedVideos <= 0 || numRequestedVideos > 4) {
      message.send("Only between 1 to 4 vids can be requested! ⚠");
      return;
    }

    try {
      message.reaction("⏳", event.messageID);
      if (searchQuery.startsWith("https://")) {
        await downloadTikTok(message, searchQuery);
      } else {
        const response = await axios.get(`https://apis-samir.onrender.com/tiktok/search/${encodeURIComponent(searchQuery)}`);
        const { videos } = response.data;

        if (videos && videos.length > 0) {
          const videoUrls = videos.slice(0, numRequestedVideos);
          await sendVideosOneByOne(message, searchQuery, videoUrls);
        } else {
          message.reply("No vids found for that query ⚠");
        }
      }
    } catch (error) {
      console.error(error);
      message.reply("Error searching for TikTok vids ⚠ ");
    }
  }
};
