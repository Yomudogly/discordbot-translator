// ? Require packages
require("dotenv").config();
const Discord = require("discord.js");
const tr = require("googletrans").default;
const textToSpeech = require("@google-cloud/text-to-speech");
const fs = require("fs");
const util = require("util");

//* Create a Discord client
const client = new Discord.Client();

//* Create a Google Text-To-Speech client
const TextToSpeech = new textToSpeech.TextToSpeechClient();

//* Common variables
const prefix = "!";
const token = process.env.DISCORD_TOKEN;
const commands = [
  "info",
  "en",
  "ru",
  "es",
  "tr",
  "fr",
  "it",
  "de",
  "ar",
  "ja",
  "hi",
  "he",
  "ko",
  "pt",
  "zh",
  "uk",
  "speech-en",
];

//* Display a message once the bot has started
client.once("ready", () => {
  client.user
    .setActivity("my master Yomudogly", { type: "LISTENING" })
    .catch(console.error());
  console.info(`Logged in as ${client.user.tag}!`);
});

//* Reconnecting event
client.on("reconnecting", () => {
  console.info(`This bot is trying to reconnect: ${client.user.tag}!`);
});

//* Check messages for a specific command
client.on("message", (msg) => {
  // * Common variables and functions
  let args = msg.content.substring(prefix.length).split(" ");

  let text = args.slice(1).join(" ");

  let translate = (flag) =>
    tr(text, args[0])
      .then((result) => {
        result.hasCorrectedText
          ? console.info(`
      translate query ${result.src}: ${text}
      translate query corrected: ${result.correctedText}
      translate result en: ${result.text}
      `)
          : console.info(`
      translate query ${result.src}: ${text}
      translate result ${args[0]}: ${result.text}
      `);

        msg.channel.send(
          `${msg.guild.member(msg.author.id)} sent message ${flag} "${
            result.text
          }"`
        );
      })
      .catch((err) => {
        console.error(err);
      });

  let speakText = async (text, audioPath, langCode) => {
    const request = {
      input: { text: text },
      // Select the language and SSML voice gender (optional)
      voice: { languageCode: langCode, ssmlGender: "NEUTRAL" },
      // select the type of audio encoding
      audioConfig: { audioEncoding: "MP3" },
    };

    const [response] = await TextToSpeech.synthesizeSpeech(request);
    // Write the binary audio content to a local file
    const writeFile = util.promisify(fs.writeFile);
    await writeFile(audioPath, response.audioContent, "binary");
    console.info(`audio written to file: ${audioPath}`);
  };

  // ! Personal messages prevention
  if (!msg.content.startsWith(prefix) || msg.author.bot) {
    if (!msg.guild && !msg.author.bot) {
      return msg.reply(
        "Personal messages are not permitted :face_with_raised_eyebrow: If you want me to translate something send message in the server :v:"
      );
    } else {
      return;
    }
  } else if (!msg.guild) {
    return msg.reply(
      "Personal messages are not permitted :face_with_raised_eyebrow: If you want me to translate something send message in the server :v:"
    );
  }

  // ! Commands implementation
  switch (args[0].toLowerCase()) {
    //! Info command
    case commands[0]:
      msg.channel.bulkDelete(1);

      const info = new Discord.MessageEmbed()
        .setColor("#db0404")
        .setTitle("Available languages ✌️")
        .setURL("https://github.com/Yomudogly/discordbot-translator")
        .addFields(
          {
            name: ":flag_us:",
            value: "!en + text translate to English",
            inline: true,
          },
          {
            name: ":flag_ru:",
            value: "!ru + text translate to Russian",
            inline: true,
          },
          {
            name: ":flag_es:",
            value: "!es + text translate to Spanish",
            inline: true,
          },
          {
            name: ":flag_tr:",
            value: "!tr + text translate to Turkish",
            inline: true,
          },
          {
            name: ":flag_fr:",
            value: "!fr + text translate to French",
            inline: true,
          },
          {
            name: ":flag_it:",
            value: "!it + text translate to Italian",
            inline: true,
          },
          {
            name: ":flag_de:",
            value: "!de + text translate to German",
            inline: true,
          },
          {
            name: ":flag_sa:",
            value: "!ar + text translate to Arabic",
            inline: true,
          },
          {
            name: ":flag_jp:",
            value: "!ja + text translate to Japanese",
            inline: true,
          },
          {
            name: ":flag_in:",
            value: "!hi + text translate to Hindi",
            inline: true,
          },
          {
            name: ":flag_il:",
            value: "!he + text translate to Hebrew",
            inline: true,
          },
          {
            name: ":flag_kr:",
            value: "!ko + text translate to Korean",
            inline: true,
          },
          {
            name: ":flag_pt:",
            value: "!pt + text translate to Portuguese",
            inline: true,
          },
          {
            name: ":flag_cn:",
            value: "!zh + text translate to Chinese(Simplified)",
            inline: true,
          },
          {
            name: ":flag_ua:",
            value: "!uk + text translate to Ukrainian",
            inline: true,
          },
          {
            name: ":loudspeaker: :flag_us:",
            value: "!speech-en + text to translate and vocalize in English",
            inline: false,
          }
        )
        .attachFiles(["./media/translate.jpg"])
        .setImage("attachment://translate.jpg")
        .setTimestamp()
        .setFooter("This is open source project");

      msg.reply(info).then((msg) => {
        msg.delete({ timeout: 30000 });
      });
      break;
    //! EN
    case commands[1]:
      msg.channel.bulkDelete(1);
      translate(":flag_us:");
      break;
    //! RU
    case commands[2]:
      msg.channel.bulkDelete(1);
      translate(":flag_ru:");
      break;
    //! ES
    case commands[3]:
      msg.channel.bulkDelete(1);
      translate(":flag_es:");
      break;
    //! TR
    case commands[4]:
      msg.channel.bulkDelete(1);
      translate(":flag_tr:");
      break;
    //! FR
    case commands[5]:
      msg.channel.bulkDelete(1);
      translate(":flag_fr:");
      break;
    //! IT
    case commands[6]:
      msg.channel.bulkDelete(1);
      translate(":flag_it:");
      break;
    //! DE
    case commands[7]:
      msg.channel.bulkDelete(1);
      translate(":flag_de:");
      break;
    //! AR
    case commands[8]:
      msg.channel.bulkDelete(1);
      translate(":flag_sa:");
      break;
    //! JA
    case commands[9]:
      msg.channel.bulkDelete(1);
      translate(":flag_jp:");
      break;
    //! HI
    case commands[10]:
      msg.channel.bulkDelete(1);
      translate(":flag_in:");
      break;
    //! HE
    case commands[11]:
      args[0] = "iw";
      msg.channel.bulkDelete(1);
      translate(":flag_il:");
      break;
    //! KO
    case commands[12]:
      msg.channel.bulkDelete(1);
      translate(":flag_kr:");
      break;
    //! PT
    case commands[13]:
      msg.channel.bulkDelete(1);
      translate(":flag_pt:");
      break;
    //! ZH
    case commands[14]:
      msg.channel.bulkDelete(1);
      translate(":flag_cn:");
      break;
    //! UK
    case commands[15]:
      msg.channel.bulkDelete(1);
      translate(":flag_ua:");
      break;
    //! SPEECH-EN
    case commands[16]:
      msg.channel.bulkDelete(1);

      tr(text, "en")
        .then((result) => {
          result.hasCorrectedText
            ? console.info(`
      translate query ${result.src}: ${text}
      translate query corrected: ${result.correctedText}
      translate result en: ${result.text}
      `)
            : console.info(`
      translate query ${result.src}: ${text}
      translate result en: ${result.text}
      `);

          audioPath = `./${result.text
            .substring(0, 10)
            .split(" ")
            .join("_")}.mp3`;

          speakText(result.text, audioPath, "en-US")
            .then(() => {
              msg.channel
                .send(
                  `${msg.guild.member(
                    msg.author.id
                  )} sent message with audio transcription :flag_us: "${
                    result.text
                  }"`,
                  {
                    files: [audioPath],
                  }
                )
                .then(() => {
                  fs.unlink(audioPath, (err) => {
                    if (err) {
                      console.error(err);
                      return;
                    }
                    //file removed
                  });
                  console.info(`file ${audioPath} deleted`);
                });
            })
            .catch((err) => {
              console.error("error:", err);
            });
        })
        .catch((err) => {
          console.error(err);
        });

      break;
    default:
      console.warn(`Out of range command detected !${args[0]}`);
      return;
  }
});

//* Log in the bot with the token
client.login(token);
