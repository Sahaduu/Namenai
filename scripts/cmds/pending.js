module.exports = {
  config: {
    name: "pending",
    version: "2.0",
    author: "NZ R",
    countDown: 5,
    role: 2,
    shortDescription: {
      vi: "",
      en: ""
    },
    longDescription: {
      vi: "",
      en: ""
    },
    category: "owner"
  },
  langs: {
    en: {
      invalidNumber: "%1 is not a valid number",
      cancelSuccess: "Successfully canceled %1 items!",
      approveSuccess: "Successfully approved %1 items!",
      cantGetPendingList: "Unable to retrieve the pending list!",
      returnListPending: "» Pending Approvals «\nTotal items to approve: %1\n\n%2",
      returnListClean: "No pending items found"
    }
  },
  onReply: async function({ api, event, Reply, getLang, commandName, prefix }) {
    if (String(event.senderID) !== String(Reply.author)) return;
    const { body, threadID, messageID } = event;
    let count = 0;

    if (isNaN(body) && (body.indexOf("c") === 0 || body.indexOf("cancel") === 0)) {
      const indices = body.slice(1).trim().split(/\s+/);
      for (const singleIndex of indices) {
        if (isNaN(singleIndex) || singleIndex <= 0 || singleIndex > Reply.pending.length) {
          return api.sendMessage(getLang("invalidNumber", singleIndex), threadID, messageID);
        }
        const pendingItem = Reply.pending[singleIndex - 1];
        if (pendingItem.isGroup) {
          api.removeUserFromGroup(api.getCurrentUserID(), pendingItem.threadID);
        } else {
          api.removeUserFromGroup(pendingItem.threadID, pendingItem.userID);
        }
        count++;
      }
      return api.sendMessage(getLang("cancelSuccess", count), threadID, messageID);
    } else {
      const indices = body.trim().split(/\s+/);
      for (const singleIndex of indices) {
        if (isNaN(singleIndex) || singleIndex <= 0 || singleIndex > Reply.pending.length) {
          return api.sendMessage(getLang("invalidNumber", singleIndex), threadID, messageID);
        }
        const pendingItem = Reply.pending[singleIndex - 1];
        if (pendingItem.isGroup) {
          api.sendMessage("• Your GROUP has been approved by the admin.", pendingItem.threadID);
        } else {
          api.sendMessage("• You are now connected to use the bot in your INBOX!", pendingItem.threadID);
        }
        count++;
      }
      return api.sendMessage(getLang("approveSuccess", count), threadID, messageID);
    }
  },
  onStart: async function({ api, event, getLang, commandName }) {
    const { threadID, messageID } = event;
    let msg = "", index = 1;

    try {
      var spam = await api.getThreadList(100, null, ["OTHER"]) || [];
      var pending = await api.getThreadList(100, null, ["PENDING"]) || [];
    } catch (e) {
      return api.sendMessage(getLang("cantGetPendingList"), threadID, messageID);
    }

    const list = [...spam, ...pending].filter(item => item.isSubscribed);
    for (const item of list) {
      let name;
      if (item.isGroup) {
        name = item.name;
      } else {
        try {
          const userInfo = await api.getUserInfo(item.threadID);
          name = userInfo[item.threadID].name;
        } catch (e) {
          name = "Unknown User";
        }
      }
      msg += `${index++}. ${name} (${item.threadID})\nType: ${item.isGroup ? "[GROUP]" : "[INBOX]"}\n\n`;
    }

    if (list.length !== 0) {
      return api.sendMessage(getLang("returnListPending", list.length, msg), threadID, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          messageID: info.messageID,
          author: event.senderID,
          pending: list
        });
      }, messageID);
    } else {
      return api.sendMessage(getLang("returnListClean"), threadID, messageID);
    }
  }
};
