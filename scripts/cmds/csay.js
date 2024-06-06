const axios = require("axios");

module.exports = {
  config: {
    name: "csay",
    version: "1.1",
    author: "Otin",
    countDown: 5,
    role: 0,
    longDescription: "voice",
    category: "ai",
    guide: {
      en: "{pn} text or reply to text"
    }
  },

  onStart: async function ({ api, event, args, getLang, message, usersData }) {
    try {
      const text = event.type === 'message_reply' ? event.messageReply.body : args.join(' ');
      if (!text) {
        return message.reply('please type text or reply to text');
      }
      const link = `https://sandipbaruwal.onrender.com/beast?text=${encodeURIComponent(text)}`;

      message.reply({
        body: 'here is your tts',
        attachment: await global.utils.getStreamFromURL(link)
      });
    } catch (error) {
      console.error(error);
    }
  }
};
