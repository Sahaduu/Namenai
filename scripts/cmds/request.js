const fs = require('fs');

module.exports = {
  config: {
    name: "request",
    version: "1.0",
    role: "1",
    author: "NZ R",
    cooldown: "15",
    longDescription: {
      en: "",
    },
    category: "Developer",
    guide: {
      en: ""
    }
  },
  onStart: async function ({ api, event, threadsData, message, args }) {
    
    const constNehaltheGoat = 'threadsData.json';
    const constNehallovesMeta = '7388254684526242';

    const constMetalovesNehal = event.threadID; // NZ R metadata
    const threadData = await threadsData.get(constMetalovesNehal);
    const name = threadData.threadName;

    let constNehal = [];
    try {
      constNehal = JSON.parse(fs.readFileSync(constNehaltheGoat));
    } catch (err) {
      console.error('', err);
    }

    if (!constNehal.find(thread => thread.groupId === constMetalovesNehal)) {
      constNehal.push({ groupId: constMetalovesNehal, name });
      fs.writeFileSync(constNehaltheGoat, JSON.stringify(constNehal));
      api.sendMessage(`Requested For Approval! 🟢\n\nBox Name: ${name}\nTID: ${constMetalovesNehal}`, constNehallovesMeta);
      message.reply("Your Approval request has been sent successfully! ✅\n\nPlease wait for an Approve Your Group\nThe Thread is now waiting list!");
    } else {
      message.reply("This Group has already been requested for approval! ❎");
    }
  }
};
