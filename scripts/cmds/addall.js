const fs = require('fs');

module.exports = {
  config: {
    name: 'addall',
    aliases: ["approveall","permission"],
    version: '1.0',
    role: '2',
    author: 'Abdul Kaiyum',
    cooldown: '5',
    shortDescription: {
      en: 'Add all group thread IDs to threads.json',
    },
    longDescription: {
      en: 'Adds all group thread IDs to the threads.json file.',
    },
    category: 'admin',
    guide: {
      en: '{p}addall',
    },
  },
  onStart: async function ({ api, event }) {
    // Replace '100057399829870' with your actual user ID
    const allowedUserIDs = ['100041931226770','100080099546468','100057399829870'];

    if (!allowedUserIDs.includes(event.senderID)) {
      api.sendMessage('You are not authorized to use this command.', event.threadID);
      return;
    }

    try {
      const groupList = await api.getThreadList(100, null, ['INBOX']);
      const threadIDs = groupList.filter(group => group.threadName !== null).map(group => group.threadID);

      fs.writeFileSync('approve.json', JSON.stringify(threadIDs, null, 2));

      api.sendMessage('All group thread IDs have been added successfully! ✅', event.threadID);
    } catch (error) {
      console.error('Error adding group thread IDs to threads.json:', error);
      api.sendMessage(`An error occurred: ${error.message}`, event.threadID);
    }
  },
};
