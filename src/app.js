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

  let synthesizeParams = {
    text: "",
    accept: "audio/wav",
    voice: "en-US_AllisonV3Voice",
  };

  let speakText = (synthesizeParams) =>
    textToSpeech
      .synthesize(synthesizeParams)
      .then((response) => {
        return textToSpeech.repairWavHeaderStream(response.result);
      })
      .then((buffer) => {
        fs.writeFileSync(`./${args[0]}_${args[1]}_${args[2]}.wav`, buffer);
        console.log(`file ${args[0]}_${args[1]}_${args[2]}.wav created`);
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

      detectLanguage()
        .then((lang) => {
          if (lang == args[0].toLowerCase()) {
            msg
              .reply(
                ":flag_ru: => :flag_ru: = :see_no_evil: :hear_no_evil: :speak_no_evil:"
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
                        )} sent message :flag_ru: "${text}"`
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
                              )} sent message :flag_ru: "${res}"`
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
      break;
    //! ES
    case commands[3]:
      msg.channel.bulkDelete(1);

      detectLanguage()
        .then((lang) => {
          if (lang == args[0].toLowerCase()) {
            msg
              .reply(
                ":flag_es: => :flag_es: = :see_no_evil: :hear_no_evil: :speak_no_evil:"
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
                        )} sent message :flag_es: "${text}"`
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
                              )} sent message :flag_es: "${res}"`
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
      break;
    //! TR
    case commands[4]:
      msg.channel.bulkDelete(1);

      detectLanguage()
        .then((lang) => {
          if (lang == args[0].toLowerCase()) {
            msg
              .reply(
                ":flag_tr: => :flag_tr: = :see_no_evil: :hear_no_evil: :speak_no_evil:"
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
                        )} sent message :flag_tr: "${text}"`
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
                              )} sent message :flag_tr: "${res}"`
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
      break;
    //! FR
    case commands[5]:
      msg.channel.bulkDelete(1);

      detectLanguage()
        .then((lang) => {
          if (lang == args[0].toLowerCase()) {
            msg
              .reply(
                ":flag_fr: => :flag_fr: = :see_no_evil: :hear_no_evil: :speak_no_evil:"
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
                        )} sent message :flag_fr: "${text}"`
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
                              )} sent message :flag_fr: "${res}"`
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
      break;
    //! IT
    case commands[6]:
      msg.channel.bulkDelete(1);

      detectLanguage()
        .then((lang) => {
          if (lang == args[0].toLowerCase()) {
            msg
              .reply(
                ":flag_it: => :flag_it: = :see_no_evil: :hear_no_evil: :speak_no_evil:"
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
                        )} sent message :flag_it: "${text}"`
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
                              )} sent message :flag_it: "${res}"`
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
      break;
    //! DE
    case commands[7]:
      msg.channel.bulkDelete(1);

      detectLanguage()
        .then((lang) => {
          if (lang == args[0].toLowerCase()) {
            msg
              .reply(
                ":flag_de: => :flag_de: = :see_no_evil: :hear_no_evil: :speak_no_evil:"
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
                        )} sent message :flag_de: "${text}"`
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
                              )} sent message :flag_de: "${res}"`
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
      break;
    //! AR
    case commands[8]:
      msg.channel.bulkDelete(1);

      detectLanguage()
        .then((lang) => {
          if (lang == args[0].toLowerCase()) {
            msg
              .reply(
                ":flag_sa: => :flag_sa: = :see_no_evil: :hear_no_evil: :speak_no_evil:"
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
                        )} sent message :flag_sa: "${text}"`
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
                              )} sent message :flag_sa: "${res}"`
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
      break;
    //! JA
    case commands[9]:
      msg.channel.bulkDelete(1);

      detectLanguage()
        .then((lang) => {
          if (lang == args[0].toLowerCase()) {
            msg
              .reply(
                ":flag_jp: => :flag_jp: = :see_no_evil: :hear_no_evil: :speak_no_evil:"
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
                        )} sent message :flag_jp: "${text}"`
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
                              )} sent message :flag_jp: "${res}"`
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
      break;
    //! HI
    case commands[10]:
      msg.channel.bulkDelete(1);

      detectLanguage()
        .then((lang) => {
          if (lang == args[0].toLowerCase()) {
            msg
              .reply(
                ":flag_in: => :flag_in: = :see_no_evil: :hear_no_evil: :speak_no_evil:"
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
                        )} sent message :flag_in: "${text}"`
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
                              )} sent message :flag_in: "${res}"`
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
      break;
    //! SPEECH-EN
    case commands[11]:
      msg.channel.bulkDelete(1);

      detectLanguage()
        .then((lang) => {
          if (lang == args[0].toLowerCase()) {
            synthesizeParams.text = args.slice(1).join(" ");

            speakText(synthesizeParams)
              .then(() => {
                msg.channel
                  .send(
                    `${msg.guild.member(
                      msg.author.id
                    )} sent this voice message:`,
                    {
                      files: [`./${args[0]}_${args[1]}_${args[2]}.wav`],
                    }
                  )
                  .then(() => {
                    fs.unlink(
                      `./${args[0]}_${args[1]}_${args[2]}.wav`,
                      (err) => {
                        if (err) {
                          console.error(err);
                          return;
                        }
                        //file removed
                      }
                    );
                    console.log(
                      `file ${args[0]}_${args[1]}_${args[2]}.wav deleted`
                    );
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

                speakText(synthesizeParams)
                  .then(() => {
                    msg.channel
                      .send(
                        `${msg.guild.member(
                          msg.author.id
                        )} sent message with audio transcription :flag_us: "${text}"`,
                        {
                          files: [`./${args[0]}_${args[1]}_${args[2]}.wav`],
                        }
                      )
                      .then(() => {
                        fs.unlink(
                          `./${args[0]}_${args[1]}_${args[2]}.wav`,
                          (err) => {
                            if (err) {
                              console.error(err);
                              return;
                            }
                            //file removed
                          }
                        );
                        console.log(
                          `file ${args[0]}_${args[1]}_${args[2]}.wav deleted`
                        );
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
      msg.channel.bulkDelete(1);
      msg
        .reply(
          `Type error or command !${args[0]} doesn't exist :face_with_monocle:`
        )
        .then((msg) => {
          msg.delete({ timeout: 7000 });
        });
  }
});

//* Log in the bot with the token
client.login(token);
