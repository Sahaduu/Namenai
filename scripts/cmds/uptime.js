const moment = require('moment-timezone');
const fs = require('fs');
const path = require('path');

const banStatusFilePath = path.resolve(__dirname, 'mediaBanStatus.json');

// Function to read the current ban status from a file
function readBanStatus() {
  if (fs.existsSync(banStatusFilePath)) {
    const data = fs.readFileSync(banStatusFilePath, 'utf8');
    return JSON.parse(data).banStatus;
  }
  return false;
}

// Function to write the ban status to a file
function writeBanStatus(isBanned) {
  fs.writeFileSync(banStatusFilePath, JSON.stringify({ banStatus: isBanned }));
}

module.exports = {
  config: {
    name: "uptime",
    aliases: ["up","upt"],
    version: "2.0",
    author: "Sahadat",
    role: 0,
    shortDescription: { en: "" },
    longDescription: { en: "" },
    category: "system",
    guide: { en: "" },
  },
  onStart: async function ({ api, event, usersData, threadsData, args }) {
    try {
      // Check for ban toggle commands
      if (args[0] === "ban" && (args[1] === "on" || args[1] === "off")) {
        const newBanStatus = args[1] === "on";
        writeBanStatus(newBanStatus);
        return api.sendMessage(`Media ban has been turned ${newBanStatus ? "on" : "off"}.`, event.threadID);
      }

      const totalUsers = await usersData.getAll();
      const allThreads = await threadsData.getAll();
      const uptime = process.uptime();
      const serverTimeBD = moment().tz("Asia/Dhaka").format("LLLL");
      const uptimeDuration = moment.duration(uptime, 'seconds');
      const days = Math.floor(uptimeDuration.asDays());
      const hours = uptimeDuration.hours();
      const minutes = uptimeDuration.minutes();
      const seconds = uptimeDuration.seconds();
      const totalUsersLength = totalUsers.length;
      const totalThreadsLength = allThreads.length;
      const mediaBanStatus = readBanStatus();
      const pingStart = Date.now();
      const sentMessage = await api.sendMessage(this.thin("🟢 Processing..."), event.threadID);
      const pingEnd = Date.now() - pingStart;
      let pingStatus = "Good ✅";
      if (pingEnd > 500) {
        pingStatus = "Medium❗";
      }
      if (pingEnd > 1000) {
        pingStatus = "Bad ❎";
      }
      const mediaBanText = mediaBanStatus ? "- Media Banned: YES 🚫" : "- Media Banned: NO ✅";
      const statusMessage = `
🟢 Bot Has Been Working For
- ${days} Dy(s) ${hours} Hr(s) ${minutes} Min(s) ${seconds} sec(s)
- Total Users: ${totalUsersLength}
- Total Threads: ${totalThreadsLength}
- D/T: ${serverTimeBD}
- Speed: ${pingEnd}ms
- Speed Status: ${pingStatus}
${mediaBanText}
      `;
      return api.editMessage(this.thin(statusMessage), sentMessage.messageID);
    } catch (err) {
      console.error(err);
      return api.editMessage("❌ An error occurred while fetching system statistics.", sentMessage.messageID);
    }
  },
  thin: (str) => str.replace(/(?!^)(?=(?:\S{3})+$)/g,""),
};
