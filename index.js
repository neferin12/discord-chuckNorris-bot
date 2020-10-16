require('dotenv')
    .config();
const Discord = require('discord.js');

const bot = new Discord.Client();
const { TOKEN } = process.env;
const axios = require('axios');
const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const util = require('util');
// Creates a client
const client = new textToSpeech.TextToSpeechClient();

const PREFIX = '$';
const ALLOW_NO_PREFIX = true;

bot.login(TOKEN);

bot.on('ready', () => {
    console.info(`Logged in as ${bot.user.tag}!`);
});

function answer(c, msg) {
    if (c === 'chuck' || c === 'chuckNorris') {
        axios.get('https://api.icndb.com/jokes/random')
            .then((res) => {
                msg.channel.send(res.data.value.joke);
                console.log('Witz gesendet');
            })
            .catch(() => {
                axios.get('https://api.chucknorris.io/jokes/random')
                    .then((resb) => {
                        msg.channel.send(resb.data.value);
                        console.log('Backupwitz gesendet');
                    })
                    .catch((err) => {
                        console.error(err);
                        msg.channel.send('I wasn\'t able to get this joke. Probably Cuck Norris doesn\'t want you to laugh about him. Try again later!');
                    });
            });
    } else if (c === 'ping') {
        msg.channel.send('pong');
        console.log('pong');
    }
}

async function speak(s, msg) {
    if (msg.member?.voice?.channel) {
        const request = {
            input: { text: s },
            // Select the language and SSML voice gender (optional)
            voice: {
                languageCode: 'en-US',
                name: 'en-US-Wavenet-A',
            },
            // select the type of audio encoding
            audioConfig: { audioEncoding: 'MP3' },
        };
        console.log('Getting audio');
        const [response] = await client.synthesizeSpeech(request);
        // Write the binary audio content to a local file
        const writeFile = util.promisify(fs.writeFile);
        await writeFile('output.mp3', response.audioContent, 'binary');
        const connection = await msg.member.voice.channel.join();
        const dispatcher = connection.play('output.mp3');
        console.log('play');
        dispatcher.on('finish', () => {
            console.log('Played Joke');
            dispatcher.destroy();
            connection.disconnect();
        });
    } else {
        msg.reply('You need to join a voice channel first!');
    }
}

async function tell(c, msg) {
    if (c === 'tell') {
        axios.get('https://api.icndb.com/jokes/random')
            .then((res) => {
                speak(res.data.value.joke, msg);
            })
            .catch(() => {
                axios.get('https://api.chucknorris.io/jokes/random')
                    .then((resb) => {
                        speak(resb.data.value, msg);
                    })
                    .catch((err) => {
                        console.error(err);
                        speak('I wasn\'t able to get this joke. Probably Cuck Norris doesn\'t want you to laugh about him. Try again later!', msg);
                    });
            });
    }
}

bot.on('message', (msg) => {
    console.log('message recieved');
    const c = msg.content.toLowerCase();
    if (ALLOW_NO_PREFIX) answer(c, msg);
    if (c[0] === PREFIX) {
        const substring = c.substring(1, c.length);
        answer(substring, msg);
        tell(substring, msg);
    }
});
