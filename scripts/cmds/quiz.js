const fs = require('fs');

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

module.exports = {
    config: {
        name: "quiz",
        aliases: ["qz"],
        version: "1.0",
        author: "NZ R",
        countDown: 20, 
        role: 0,
        category: "games",
        shortDescription: {
            en: ""
        },
        longDescription: {
            en: ""
        },
        guide: {
            en: ""
        }
    },

    onStart: async function ({ message, event, commandName }) {
        const quizData = JSON.parse(fs.readFileSync('quiz.json'));

        // Shuffle the quiz data (questions)
        const shuffledQuizData = shuffle(quizData);
        const randomQuestion = shuffledQuizData[0]; 
      
        let options = '';
        Object.entries(randomQuestion.options).forEach(([key, value]) => {
            options += `${key}. ${value}\n`;
        });

        message.reply(`Question: ${randomQuestion.question}\n\nOptions:\n${options}\n\nReply to the message with correct word (A, B, C or D) within 60 secounds. \n\n(Not everyone can participate)`, (err, info) => {
            global.GoatBot.onReply.set(info.messageID, {
                commandName,
                messageID: info.messageID,
                author: event.senderID,
                correctAnswer: randomQuestion.answer,
                startTime: Date.now()
            });
            setTimeout(() => {
                if (global.GoatBot.onReply.has(info.messageID)) {
                    global.GoatBot.onReply.delete(info.messageID);
                    message.unsend(info.messageID);
                }
            }, 40000); 
        });
    },

    onReply: async function ({ message, Reply, event, usersData }) {
        const { author, messageID, correctAnswer, startTime } = Reply;
        const userChoice = event.body.toUpperCase();

        if (event.senderID !== author) {
            return message.reply("🚫 Sorry, only the user who started the game can interact with it.");
        }

        const elapsedTime = Date.now() - startTime;
        if (elapsedTime > 40000) { 
            global.GoatBot.onReply.delete(messageID);
            return message.reply("⏰ Sorry, time's up! You took too long to answer.");
        }

        if (userChoice === correctAnswer) {
            global.GoatBot.onReply.delete(messageID);

            const money = Math.floor(Math.random() * (100 - 50 + 1) + 50);
            await usersData.addMoney(event.senderID, money);

            const exp = Math.floor(Math.random() * (20 - 10 + 1) + 10);
            await usersData.set(event.senderID, {
                money: usersData.money,
                exp: exp,
                data: usersData.data
            });

            message.unsend(event.messageReply.messageID);
            message.reply(`🎉 Correct Answer! You win ${money}$ and ${exp} experience points! 🌟`);
        } else {
            setTimeout(async () => {
                await message.unsend(event.messageReply.messageID);
            }, 1000); 
          
            message.reply(`⭕ Sorry, that's incorrect!
Try again in another question `);
        }
    }
};
