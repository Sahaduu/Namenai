const fs = require('fs');
const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "approval",
    version: "1.0",
    author: "Ohio03 | @tu33rtle.xy",
    category: "events"
  },
  onStart: async function ({ api, event, threadsData, message }) {
    const uid = "100041931226770";
    const groupId = event.threadID;
    const threadData = await threadsData.get(groupId);
    const name = threadData.threadName;
    const { getPrefix } = global.utils;
    const p = getPrefix(event.threadID);    

    let threads = [];
    try {
      threads = JSON.parse(fs.readFileSync('threadsData.json'));
    } catch (err) {
      console.error('', err);
    }

    if (!threads.includes(groupId) && event.logMessageType === "log:subscribe") {
      await message.send({
        body: `❎ | Meaw You Added The CaT Ara Without Permission !!\n\n✧Take Permission From Admin's to Use CaT Ara In Your Group !!\n✧Join CaT Ara Support Zone to Contact With Admin's !!\n\n✧Type (${p}supportgc) within 60 seconds\n\n✧Type (${p}request) within 60 seconds for get your Group approval and permissions to use CaT Ara in your Group!`,
        attachment: await getStreamFromURL("https://tinyurl.com/2bpwst5m")
      });
    }

    if (!threads.includes(groupId) && event.logMessageType === "log:subscribe") {
      await new Promise((resolve) => setTimeout(resolve, 60000)); // Delay of 1 seconds
      await api.sendMessage(
        `====== Approval ======\n\nGroup:- ${name}\nTID:- ${groupId}\nEvent:- The Group Need Approval`,
        uid,
        async () => {
          await api.removeUserFromGroup(api.getCurrentUserID(), groupId);
        }
      );
    }
  }
};
