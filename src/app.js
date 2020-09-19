// ? Require packages
require("dotenv").config();
const Discord = require("discord.js");
const fs = require("fs");

//* Create a new client using the new keyword
const client = new Discord.Client();

//* Register IBM Translator API and Text-To-Speech API
const LanguageTranslatorV3 = require("ibm-watson/language-translator/v3");
const TextToSpeechV1 = require("ibm-watson/text-to-speech/v1");
const { IamAuthenticator } = require("ibm-watson/auth");

const languageTranslator = new LanguageTranslatorV3({
  version: "2020-09-06",
  authenticator: new IamAuthenticator({
    apikey: process.env.APIKEY,
  }),
  serviceUrl: process.env.URL,
  disableSslVerification: true,
});

const textToSpeech = new TextToSpeechV1({
  authenticator: new IamAuthenticator({
    apikey: process.env.SPEECHKEY,
  }),
  serviceUrl: process.env.SPEECHURL,
  disableSslVerification: true,
});

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
  console.log(`Logged in as ${client.user.tag}!`);
});

//* Reconnecting event
client.on("reconnecting", () => {
  console.log(`This bot is trying to reconnect: ${client.user.tag}!`);
});

//* Check messages for a specific command
client.on("message", (msg) => {
  let args = msg.content.substring(prefix.length).split(" ");

  let translateParams = {
    text: args.slice(1).join(" "),
    modelId: "",
  };

  let identifyParams = {
    text: args.slice(1).join(" "),
  };

  let detectLanguage = () =>
    languageTranslator
      .identify(identifyParams)
      .then((identifiedLanguages) => {
        return identifiedLanguages.result.languages[0].language;
      })
      .catch((err) => {
        console.log("error:", err);
        return;
      });

  let detectModel = () =>
    languageTranslator
      .listModels()
      .then((translationModels) => {
        return translationModels.result.models;
      })
      .catch((err) => {
        console.log("error:", err);
      });

  let translateText = (translateParams) =>
    languageTranslator
      .translate(translateParams)
      .then((translationResult) => {
        return translationResult.result.translations[0].translation;
      })
      .catch((err) => {
        console.log("error:", err);
        return;
      });

  const notTranslated = () =>
    msg
      .reply("I'm sorry, I can't translate your message :pleading_face:")
      .then((msg) => {
        msg.delete({ timeout: 7000 });
      });

  let masterTranslator = (flag) =>
    detectLanguage()
      .then((lang) => {
        if (lang == args[0].toLowerCase()) {
          msg
            .reply(
              ` ${flag} => ${flag} = :see_no_evil: :hear_no_evil: :speak_no_evil:`
            )
            .then((msg) => {
              msg.delete({ timeout: 7000 });
            });
          return;
        }
        detectModel()
          .then((models) => {
            translateParams.modelId = `${lang}-${args[0].toLowerCase()}`;

            let modelId = models.filter((model) => {
              return model.model_id == translateParams.modelId;
            });

            if (modelId.length > 0) {
              translateText(translateParams)
                .then((text) => {
                  if (text == args.slice(1).join(" ")) {
                    console.log(`
          translate query ${lang}: ${args.slice(1).join(" ")}
          translate result ${args[0].toLowerCase()}: ${text}
          `);
                    notTranslated();
                  } else {
                    console.log(`
          translate query ${lang}: ${args.slice(1).join(" ")}
          translate result ${args[0].toLowerCase()}: ${text}
          `);
                    msg.channel.send(
                      `${msg.guild.member(
                        msg.author.id
                      )} sent message ${flag} "${text}"`
                    );
                  }
                })
                .catch((err) => {
                  console.log("error:", err);
                  notTranslated();
                });
            } else {
              translateParams.modelId = `${lang}-en`;

              translateText(translateParams)
                .then((text) => {
                  if (text == args.slice(1).join(" ")) {
                    console.log(`
          translate query ${lang}: ${args.slice(1).join(" ")}
          translate result en: ${text}
          `);
                    notTranslated();
                  } else {
                    console.log(`
          I iteration translate query ${lang}: ${args.slice(1).join(" ")}
          I iteration translate result en: ${text}
          `);

                    translateParams.modelId = `en-${args[0].toLowerCase()}`;
                    translateParams.text = text;

                    translateText(translateParams)
                      .then((res) => {
                        if (res == text) {
                          console.log(`
          II iteration translate query en: ${text}
          II iteration translate result ${args[0].toLowerCase()}: ${res}
          `);
                          notTranslated();
                        } else {
                          console.log(`
          II iteration translate query en: ${text}
          II iteration translate result ${args[0].toLowerCase()}: ${res}
          `);
                          msg.channel.send(
                            `${msg.guild.member(
                              msg.author.id
                            )} sent message ${flag} "${res}"`
                          );
                        }
                      })
                      .catch((err) => {
                        console.log("error:", err);
                        notTranslated();
                      });
                  }
                })
                .catch((err) => {
                  console.log("error:", err);
                  notTranslated();
                });
            }
          })
          .catch((err) => {
            console.log("error:", err);
            notTranslated();
          });
      })
      .catch((err) => {
        console.log("error:", err);
        notTranslated();
      });

  let synthesizeParams = {
    text: "",
    accept: "audio/wav",
    voice: "en-US_AllisonV3Voice",
  };

  let audioPath = "";

  let speakText = (synthesizeParams, audioPath) =>
    textToSpeech
      .synthesize(synthesizeParams)
      .then((response) => {
        return textToSpeech.repairWavHeaderStream(response.result);
      })
      .then((buffer) => {
        fs.writeFileSync(audioPath, buffer);
        console.log(`file ${audioPath} created`);
        return;
      })
      .catch((err) => {
        console.log("error:", err);
        return;
      });

  if (!msg.content.startsWith(prefix) || msg.author.bot) {
    if (!msg.guild && !msg.author.bot) {
      return msg.reply(
        "Personal messages not permitted :face_with_raised_eyebrow: If you want me to translate something send message in the server :v:"
      );
    } else {
      return;
    }
  } else if (!msg.guild) {
    return msg.reply(
      "Personal messages not permitted :face_with_raised_eyebrow: If you want me to translate something send message in the server :v:"
    );
  }
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
            value: "!uk + text translate to Chinese(Simplified)",
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

      detectLanguage()
        .then((lang) => {
          if (lang == args[0].toLowerCase()) {
            msg
              .reply(
                ":flag_us: => :flag_us: = :see_no_evil: :hear_no_evil: :speak_no_evil:"
              )
              .then((msg) => {
                msg.delete({ timeout: 7000 });
              });
            return;
          }
          translateParams.modelId = `${lang}-${args[0].toLowerCase()}`;

          translateText(translateParams)
            .then((text) => {
              if (text == args.slice(1).join(" ")) {
                console.log(`
            translate query ${lang}: ${args.slice(1).join(" ")}
            translate result ${args[0].toLowerCase()}: ${text}
            `);
                notTranslated();
              } else {
                console.log(`
            translate query ${lang}: ${args.slice(1).join(" ")}
            translate result ${args[0].toLowerCase()}: ${text}
            `);
                msg.channel.send(
                  `${msg.guild.member(
                    msg.author.id
                  )} sent message :flag_us: "${text}"`
                );
              }
            })
            .catch((err) => {
              console.log("error:", err);
              notTranslated();
            });
        })
        .catch((err) => {
          console.log("error:", err);
          notTranslated();
        });
      break;
    //! RU
    case commands[2]:
      msg.channel.bulkDelete(1);
      masterTranslator(":flag_ru:");

      break;
    //! ES
    case commands[3]:
      msg.channel.bulkDelete(1);
      masterTranslator(":flag_es:");

      break;
    //! TR
    case commands[4]:
      msg.channel.bulkDelete(1);
      masterTranslator(":flag_tr:");

      break;
    //! FR
    case commands[5]:
      msg.channel.bulkDelete(1);
      masterTranslator(":flag_fr:");

      break;
    //! IT
    case commands[6]:
      msg.channel.bulkDelete(1);
      masterTranslator(":flag_it:");

      break;
    //! DE
    case commands[7]:
      msg.channel.bulkDelete(1);
      masterTranslator(":flag_de:");

      break;
    //! AR
    case commands[8]:
      msg.channel.bulkDelete(1);
      masterTranslator(":flag_sa:");

      break;
    //! JA
    case commands[9]:
      msg.channel.bulkDelete(1);
      masterTranslator(":flag_jp:");

      break;
    //! HI
    case commands[10]:
      msg.channel.bulkDelete(1);
      masterTranslator(":flag_in:");

      break;
    //! HE
    case commands[11]:
      msg.channel.bulkDelete(1);
      masterTranslator(":flag_il:");

      break;
    //! KO
    case commands[12]:
      msg.channel.bulkDelete(1);
      masterTranslator(":flag_kr:");

      break;
    //! PT
    case commands[13]:
      msg.channel.bulkDelete(1);
      masterTranslator(":flag_pt:");

      break;
    //! ZH
    case commands[14]:
      msg.channel.bulkDelete(1);
      masterTranslator(":flag_cn:");

      break;
    //! UK
    case commands[15]:
      msg.channel.bulkDelete(1);
      masterTranslator(":flag_ua:");

      break;
    //! SPEECH-EN
    case commands[16]:
      msg.channel.bulkDelete(1);

      detectLanguage()
        .then((lang) => {
          if (lang == "en") {
            synthesizeParams.text = args.slice(1).join(" ");
            audioPath = `./${synthesizeParams.text
              .substring(0, 10)
              .split(" ")
              .join("_")}.wav`;
            speakText(synthesizeParams, audioPath)
              .then(() => {
                msg.channel
                  .send(
                    `${msg.guild.member(
                      msg.author.id
                    )} sent this voice message:`,
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
                    console.log(`file ${audioPath} deleted`);
                  });
              })
              .catch((err) => {
                console.log("error:", err);
              });
            return;
          }
          translateParams.modelId = `${lang}-en`;

          translateText(translateParams)
            .then((text) => {
              if (text == args.slice(1).join(" ")) {
                console.log(`
            translate query ${lang}: ${args.slice(1).join(" ")}
            translate result en: ${text}
            `);
                notTranslated();
              } else {
                console.log(`
            translate query ${lang}: ${args.slice(1).join(" ")}
            translate result en: ${text}
            `);

                synthesizeParams.text = text;
                audioPath = `./${synthesizeParams.text
                  .substring(0, 10)
                  .split(" ")
                  .join("_")}.wav`;
                speakText(synthesizeParams, audioPath)
                  .then(() => {
                    msg.channel
                      .send(
                        `${msg.guild.member(
                          msg.author.id
                        )} sent message with audio transcription :flag_us: "${text}"`,
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
                        console.log(`file ${audioPath} deleted`);
                      });
                  })
                  .catch((err) => {
                    console.log("error:", err);
                    notVoice();
                  });
              }
            })
            .catch((err) => {
              console.log("error:", err);
              notTranslated();
            });
        })
        .catch((err) => {
          console.log("error:", err);
          notTranslated();
        });
      break;
    default:
      // msg.channel.bulkDelete(1);
      // msg
      //   .reply(
      //     `Type error or command !${args[0]} doesn't exist :face_with_monocle:`
      //   )
      //   .then((msg) => {
      //     msg.delete({ timeout: 7000 });
      //   });
      return;
  }
});

//* Log in the bot with the token
client.login(token);
