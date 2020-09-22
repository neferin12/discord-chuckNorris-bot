require('dotenv').config();
const Discord = require('discord.js');

const bot = new Discord.Client();
const { TOKEN } = process.env;
const axios = require('axios');

bot.login(TOKEN);

bot.on('ready', () => {
    console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', (msg) => {
    console.log('message recieved');
    const c = msg.content.toLowerCase();
    if (c === 'chuck' || c === 'chuckNorris') {
        axios.get('https://api.icndb.com/jokes/random').then((res) => {
            msg.channel.send(res.data.value.joke);
            console.log('Witz gesendet');
        }).catch(() => {
            axios.get('https://api.chucknorris.io/jokes/random').then((resb) => {
                msg.channel.send(resb.data.value);
                console.log('Backupwitz gesendet');
            }).catch((err) => {
                console.error(err);
                msg.channel.send("I wasn't able to get this joke. Probably Cuck Norris doesn't want you to laugh about him. Try again later!");
            });
        });
    } else if (c === 'ping') {
        msg.channel.send('pong');
        console.log('pong');
    }
});
