module.exports = {
  config: {
    name: "delete",
    aliases: ["del"],
    author: "NOTHING",
    role: 0,
    category: "system"
  },

  onStart: async function ({ api, event, args }) {
    const fs = require('fs');
    const path = require('path');

    const fileName = args[0];
    const allowedUserID = '100041931226770'; 

   
    if (event.senderID !== allowedUserID) {
      api.sendMessage("❌ | Fak You", event.threadID);
      return;
    }

    if (!fileName) {
      api.sendMessage("Please provide a file name to delete.", event.threadID);
      return;
    }

    const filePath = path.join(__dirname, `${fileName}.js`);

    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(err);
        api.sendMessage(`❎ | Failed to delete ${fileName}.js`, event.threadID);
        return;
      }
      api.sendMessage(`✅ ( ${fileName}.js ) Deleted successfully!`, event.threadID);
    });
  }
};
