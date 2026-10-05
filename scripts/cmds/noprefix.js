const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

if (!global.noprefixTimers) {
  global.noprefixTimers = new Map();
}

function parseDuration(args) {
  if (!args || args.length === 0) return null;

  const lastTwo = args.slice(-2).join(" ").toLowerCase();
  const matchTwo = lastTwo.match(/^(\d+)\s*([smhd])$/i);

  if (matchTwo) {
    const val = parseInt(matchTwo[1]);
    const unit = matchTwo[2];

    const ms =
      unit === "s" ? val * 1000 :
      unit === "m" ? val * 60000 :
      unit === "h" ? val * 3600000 :
      val * 86400000;

    return {
      ms,
      str: `${val}${unit}`,
      consumedArgs: 2
    };
  }

  const lastOne = args[args.length - 1]?.toLowerCase();
  const matchOne = lastOne?.match(/^(\d+)([smhd])$/i);

  if (matchOne) {
    const val = parseInt(matchOne[1]);
    const unit = matchOne[2];

    const ms =
      unit === "s" ? val * 1000 :
      unit === "m" ? val * 60000 :
      unit === "h" ? val * 3600000 :
      val * 86400000;

    return {
      ms,
      str: `${val}${unit}`,
      consumedArgs: 1
    };
  }

  return null;
}

function formatRemainingTime(expireTimestamp) {
  const remaining = expireTimestamp - Date.now();

  if (remaining <= 0) return "Expiré";

  const s = Math.floor((remaining / 1000) % 60);
  const m = Math.floor((remaining / (1000 * 60)) % 60);
  const h = Math.floor((remaining / (1000 * 60 * 60)) % 24);
  const d = Math.floor(remaining / (1000 * 60 * 60 * 24));

  const res = [];

  if (d > 0) res.push(`${d}j`);
  if (h > 0) res.push(`${h}h`);
  if (m > 0) res.push(`${m}min`);
  if (s > 0 || res.length === 0) res.push(`${s}s`);

  return res.join(" ");
}

module.exports = {
  config: {
    name: "noprefix",
    aliases: ["nopx", "npx"],
    version: "2.3",
    author: "Christus",
    editor: "CRIMSON 🪽",
    countDown: 5,
    role: 2,

    description: {
      en: "Gère le droit Noprefix avec chrono dynamique (s, m, h, d)",
      fr: "Gère les accès Noprefix avec une durée personnalisable"
    },

    category: "owner",

    guide: {
      en:
        "📋 NOPREFIX USAGE:\n" +
        "   {pn} [add | -a] <uid | @tag> <durée> (ex: 2s, 2m, 1h, 3d)\n" +
        "   {pn} [remove | -r] <uid | @tag>\n" +
        "   {pn} [list | -l]: Liste des membres\n" +
        "   {pn} [check | -c] <uid | @tag>: Vérifier un membre\n" +
        "   {pn} on / off: Activer ou désactiver",

      fr:
        "📋 UTILISATION NOPREFIX :\n" +
        "   {pn} [add | -a] <uid | @tag> <durée> (ex: 2s, 2m, 1h, 3d)\n" +
        "   {pn} [remove | -r] <uid | @tag>\n" +
        "   {pn} [list | -l] : Liste des membres\n" +
        "   {pn} [check | -c] <uid | @tag> : Vérifier un membre\n" +
        "   {pn} on / off : Activer ou désactiver"
    }
  },

  langs: {
    fr: {
      header: "🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨",
      line: "━━━━━━━━━━━━━━━━━━━━━━",

      missingIdAdd:
        "💖 Oups ! Mentionne quelqu'un, réponds à son message ou indique un UID valide !",

      missingIdRemove:
        "💬 Mentionne ou indique l'UID du membre à retirer !",

      listEmpty:
        "💔 Aucun membre ne possède actuellement le Noprefix !",

      turnedOn:
        "🔥 𝗠𝗼𝗱𝗲 𝗡𝗼𝗽𝗿𝗲𝗳𝗶𝘅 𝗔𝗖𝗧𝗜𝗩𝗘́ !\n\nLes admins et membres autorisés peuvent maintenant utiliser les commandes sans préfixe.",

      turnedOff:
        "🔓 𝗠𝗼𝗱𝗲 𝗡𝗼𝗽𝗿𝗲𝗳𝗶𝘅 𝗗𝗘́𝗦𝗔𝗖𝗧𝗜𝗩𝗘́ !\n\nTout le monde doit maintenant utiliser le préfixe.",

      alreadyOn:
        "✨ Le mode Noprefix est déjà actif !",

      alreadyOff:
        "💬 Le mode Noprefix est déjà désactivé !"
    },

    en: {
      header: "🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨",
      line: "━━━━━━━━━━━━━━━━━━━━━━",

      missingIdAdd:
        "💖 Oops! Tag someone, reply to their message or provide a valid UID!",

      missingIdRemove:
        "💬 Mention or provide the UID of the member to remove!",

      listEmpty:
        "💔 No member currently has Noprefix!",

      turnedOn:
        "🔥 𝗡𝗼𝗽𝗿𝗲𝗳𝗶𝘅 𝗠𝗼𝗱𝗲 𝗔𝗖𝗧𝗜𝗩𝗔𝗧𝗘𝗗 !\n\nAdmins and authorized members can now use commands without a prefix.",

      turnedOff:
        "🔓 𝗡𝗼𝗽𝗿𝗲𝗳𝗶𝘅 𝗠𝗼𝗱𝗲 𝗗𝗜𝗦𝗔𝗕𝗟𝗘𝗗 !\n\nEveryone must now use the prefix.",

      alreadyOn:
        "✨ Noprefix mode is already active!",

      alreadyOff:
        "💬 Noprefix mode is already disabled!"
    }
  },

  onStart: async function ({
    message,
    args,
    usersData,
    event,
    getLang
  }) {
    if (!config.noPrefixUser) {
      config.noPrefixUser = [];
    }

    const saveConfig = () =>
      writeFileSync(
        global.client.dirConfig,
        JSON.stringify(config, null, 2)
      );

    const formatLayout = (title, body) =>
      `${getLang("header")}\n${getLang("line")}\n\n${title}\n\n${body}`;

    switch (args[0]?.toLowerCase()) {

      // ═══════════════════════════════
      // ADD
      // ═══════════════════════════════

      case "add":
      case "-a": {
        let uids = [];
        const parsed = parseDuration(args);

        if (Object.keys(event.mentions || {}).length > 0) {
          uids = Object.keys(event.mentions);
        }

        else if (event.messageReply) {
          uids.push(event.messageReply.senderID);
        }

        else if (args.length > 1) {
          const sliceEnd = parsed
            ? args.length - parsed.consumedArgs
            : args.length;

          uids = args
            .slice(1, sliceEnd)
            .filter(arg => !isNaN(arg));
        }

        if (uids.length === 0) {
          return message.reply(
            formatLayout(
              "⚠️ 𝗘𝗥𝗥𝗘𝗨𝗥 𝗡𝗢𝗣𝗥𝗘𝗙𝗜𝗫",
              getLang("missingIdAdd")
            )
          );
        }

        const added = [];
        const alreadyExists = [];

        for (const uid of uids) {
          const uidStr = String(uid);

          if (config.noPrefixUser.map(String).includes(uidStr)) {
            alreadyExists.push(uidStr);
          }

          else {
            config.noPrefixUser.push(uidStr);
            added.push(uidStr);

            if (parsed) {
              const expireAt = Date.now() + parsed.ms;

              if (global.noprefixTimers.has(uidStr)) {
                clearTimeout(
                  global.noprefixTimers.get(uidStr).timer
                );
              }

              const timer = setTimeout(async () => {
                const idx = config.noPrefixUser
                  .map(String)
                  .indexOf(uidStr);

                if (idx !== -1) {
                  config.noPrefixUser.splice(idx, 1);
                  saveConfig();

                  global.noprefixTimers.delete(uidStr);

                  try {
                    const userName =
                      await usersData.getName(uidStr);

                    message.reply(
                      formatLayout(
                        "🚨 𝗘𝗫𝗣𝗜𝗥𝗔𝗧𝗜𝗢𝗡 𝗡𝗢𝗣𝗥𝗘𝗙𝗜𝗫",

                        `⏱️ Le temps est écoulé pour **${userName}** (${uidStr}) !\n\n` +
                        `💔 L'accès Noprefix vient d'être retiré.`
                      )
                    );
                  }

                  catch (e) {}
                }
              }, parsed.ms);

              global.noprefixTimers.set(
                uidStr,
                {
                  timer,
                  expireAt
                }
              );
            }
          }
        }

        saveConfig();

        const addedNames = await Promise.all(
          added.map(
            async u =>
              `• ${await usersData.getName(u)} (${u})`
          )
        );

        const alreadyNames = await Promise.all(
          alreadyExists.map(
            async u =>
              `• ${await usersData.getName(u)} (${u})`
          )
        );

        let body = "";

        if (added.length > 0) {
          if (parsed) {
            body +=
              `🎉 ${added.length} membre(s) ajouté(s) !\n\n` +
              `${addedNames.join("\n")}\n\n` +
              `⏳ Durée : ${parsed.str}\n` +
              `⚠️ L'accès sera automatiquement retiré à la fin du chrono.`;
          }

          else {
            body +=
              `🎉 ${added.length} membre(s) ajouté(s) !\n\n` +
              `${addedNames.join("\n")}\n\n` +
              `♾️ Durée : Illimitée`;
          }
        }

        if (alreadyExists.length > 0) {
          body +=
            `${body ? "\n\n" : ""}` +
            `🌸 Déjà présent(s) :\n` +
            `${alreadyNames.join("\n")}`;
        }

        return message.reply(
          formatLayout(
            "✨ 𝗔𝗝𝗢𝗨𝗧 𝗡𝗢𝗣𝗥𝗘𝗙𝗜𝗫",
            body
          )
        );
      }

      // ═══════════════════════════════
      // REMOVE
      // ═══════════════════════════════

      case "remove":
      case "-r": {
        let uids = [];

        if (Object.keys(event.mentions || {}).length > 0) {
          uids = Object.keys(event.mentions);
        }

        else if (event.messageReply) {
          uids.push(event.messageReply.senderID);
        }

        else if (args.length > 1) {
          uids = args
            .slice(1)
            .filter(arg => !isNaN(arg));
        }

        if (uids.length === 0) {
          return message.reply(
            formatLayout(
              "⚠️ 𝗘𝗥𝗥𝗘𝗨𝗥 𝗡𝗢𝗣𝗥𝗘𝗙𝗜𝗫",
              getLang("missingIdRemove")
            )
          );
        }

        const removed = [];

        for (const uid of uids) {
          const uidStr = String(uid);

          const idx = config.noPrefixUser
            .map(String)
            .indexOf(uidStr);

          if (idx !== -1) {
            config.noPrefixUser.splice(idx, 1);
            removed.push(uidStr);

            if (global.noprefixTimers.has(uidStr)) {
              clearTimeout(
                global.noprefixTimers.get(uidStr).timer
              );

              global.noprefixTimers.delete(uidStr);
            }
          }
        }

        if (removed.length === 0) {
          return message.reply(
            formatLayout(
              "⚠️ 𝗘𝗥𝗥𝗘𝗨𝗥 𝗡𝗢𝗣𝗥𝗘𝗙𝗜𝗫",
              "❌ Ce membre n'est pas dans la liste Noprefix."
            )
          );
        }

        saveConfig();

        const removedNames = await Promise.all(
          removed.map(
            async u =>
              `• ${await usersData.getName(u)} (${u})`
          )
        );

        return message.reply(
          formatLayout(
            "✂️ 𝗥𝗘𝗧𝗥𝗔𝗜𝗧 𝗡𝗢𝗣𝗥𝗘𝗙𝗜𝗫",
            `💬 Accès retiré pour :\n\n${removedNames.join("\n")}`
          )
        );
      }

      // ═══════════════════════════════
      // LIST
      // ═══════════════════════════════

      case "list":
      case "-l": {
        const list = config.noPrefixUser;

        if (list.length === 0) {
          return message.reply(
            formatLayout(
              "👑 𝗟𝗜𝗦𝗧𝗘 𝗡𝗢𝗣𝗥𝗘𝗙𝗜𝗫",
              getLang("listEmpty")
            )
          );
        }

        const formattedList = await Promise.all(
          list.map(async (uid, index) => {
            const name =
              await usersData.getName(uid);

            const timerData =
              global.noprefixTimers.get(String(uid));

            if (timerData) {
              const remainingStr =
                formatRemainingTime(
                  timerData.expireAt
                );

              return (
                ` ${index + 1}. ${name} (${uid})\n` +
                `    └─ ⏱️ Temps restant : ${remainingStr}`
              );
            }

            return (
              ` ${index + 1}. ${name} (${uid})\n` +
              `    └─ ♾️ Accès illimité`
            );
          })
        );

        return message.reply(
          formatLayout(
            "👑 𝗟𝗜𝗦𝗧𝗘 𝗡𝗢𝗣𝗥𝗘𝗙𝗜𝗫 — 𝗠𝗔𝗥𝗜𝗡 𝗦𝗧𝗬𝗟𝗘 🎀",
            formattedList.join("\n\n")
          )
        );
      }

      // ═══════════════════════════════
      // CHECK
      // ═══════════════════════════════

      case "check":
      case "-c": {
        const uid =
          Object.keys(event.mentions || {}).length > 0
            ? Object.keys(event.mentions)[0]
            : event.messageReply
              ? event.messageReply.senderID
              : (args[1] && !isNaN(args[1]))
                ? args[1]
                : event.senderID;

        const name =
          await usersData.getName(uid);

        const hasNoPrefix =
          config.noPrefixUser
            .map(String)
            .includes(String(uid));

        const timerData =
          global.noprefixTimers.get(String(uid));

        let statusStr;

        if (hasNoPrefix && timerData) {
          statusStr =
            `✅ possède le Noprefix\n` +
            `⏱️ Temps restant : ${formatRemainingTime(timerData.expireAt)}`;
        }

        else if (hasNoPrefix) {
          statusStr =
            `✅ possède le Noprefix\n` +
            `♾️ Accès illimité`;
        }

        else {
          statusStr =
            `❌ ne possède pas le Noprefix`;
        }

        return message.reply(
          formatLayout(
            "🔍 𝗩𝗘́𝗥𝗜𝗙𝗜𝗖𝗔𝗧𝗜𝗢𝗡 𝗡𝗢𝗣𝗥𝗘𝗙𝗜𝗫",
            `🎀 ${name} (${uid})\n\n${statusStr}`
          )
        );
      }

      // ═══════════════════════════════
      // ON
      // ═══════════════════════════════

      case "on": {
        if (config.noPrefix === false) {
          config.noPrefix = true;
          saveConfig();

          return message.reply(
            formatLayout(
              "🔥 𝗠𝗢𝗗𝗘 𝗡𝗢𝗣𝗥𝗘𝗙𝗜𝗫",
              getLang("turnedOn")
            )
          );
        }

        return message.reply(
          formatLayout(
            "🔥 𝗠𝗢𝗗𝗘 𝗡𝗢𝗣𝗥𝗘𝗙𝗜𝗫",
            getLang("alreadyOn")
          )
        );
      }

      // ═══════════════════════════════
      // OFF
      // ═══════════════════════════════

      case "off": {
        if (config.noPrefix !== false) {
          config.noPrefix = false;
          saveConfig();

          return message.reply(
            formatLayout(
              "🔓 𝗠𝗢𝗗𝗘 𝗡𝗢𝗣𝗥𝗘𝗙𝗜𝗫",
              getLang("turnedOff")
            )
          );
        }

        return message.reply(
          formatLayout(
            "🔓 𝗠𝗢𝗗𝗘 𝗡𝗢𝗣𝗥𝗘𝗙𝗜𝗫",
            getLang("alreadyOff")
          )
        );
      }

      default:
        return message.SyntaxError();
    }
  }
};