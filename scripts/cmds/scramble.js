const fs = require('fs');

module.exports = {
    config: {
        name: "scramble",
	aliases: ["wordgame"],
        version: "1.0",
        author: "Sahadat",
        role: 0,
        countDown: 10,
        reward: Math.floor(Math.random() * (100 - 50 + 1) + 50),
        category: "games",
        shortDescription: {
            en: "Unscramble the given word within a time limit"
        },
        longDescription: {
            en: ""
        },
        guide: {
            en: ""
        }
    },

    onStart: async function ({ message, event, commandName }) {
        const words = JSON.parse(fs.readFileSync('words.json'));
        const randomWord = words[Math.floor(Math.random() * words.length)];

        const shuffledWord = shuffleWord(randomWord);

        message.reply(`😺 Meaoww!! Here's the scrambled word. You have only 30 seconds to guess it:\n\n\n${shuffledWord} `, (err, info) => {
            global.GoatBot.onReply.set(info.messageID, {
                commandName,
                messageID: info.messageID,
                author: event.senderID,
                answer: randomWord
            });
            setTimeout(() => {
                message.unsend(info.messageID);
            }, 30000);
        });
    },

    onReply: async ({ message, Reply, event, usersData, envCommands, commandName }) => {
        const { author, messageID, answer } = Reply;

        const userAnswer = formatText(event.body);
        const correctAnswer = formatText(answer);

        // Check if the reply is from the same user who started the game
        if (event.senderID !== author) {
            return message.reply("Sorry, only the user who started the game can interact with it!!");
        }

        if (userAnswer === correctAnswer) {
            global.GoatBot.onReply.delete(messageID);
            message.unsend(event.messageReply.messageID);
      
            const money = Math.floor(Math.random() * (100 - 50 + 1) + 50);
            await usersData.addMoney(event.senderID, money);
      
            const exp = Math.floor(Math.random() * (20 - 10 + 1) + 10);
            await usersData.set(event.senderID, {
                money: usersData.money,
                exp: exp,
                data: usersData.data
            });

            message.reply(`Correct Answer! ✅\nYou win ${money}$ and ${exp} experience points!`);
        } else {
            message.reply(`Sorry! that was incorrect answer please try again in 30 seconds!!`);
        }
    }
};

function shuffleWord(word) {
    const shuffled = word.split('').sort(() => 0.5 - Math.random()).join('');
    if (shuffled === word) {
        return shuffleWord(word);
    }
    return shuffled;
}

function formatText(text) {
    return text.normalize("NFD").toLowerCase();
}
