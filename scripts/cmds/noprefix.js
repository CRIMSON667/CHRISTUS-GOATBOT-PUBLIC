const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

if (!global.noprefixTimers) {
  global.noprefixTimers = new Map();
}

function parseDuration(args) {
  if (!args || args.length === 0) return null;

  const lastTwo = args.slice(-2).join(" ").toLowerCase();
  const matchTwo = lastTwo.match(/^(\d+)\s*([s|m|h|d])$/i);

  if (matchTwo) {
    const val = parseInt(matchTwo[1]);
    const unit = matchTwo[2];
    const ms = unit === "s" ? val * 1000 : unit === "m" ? val * 60000 : unit === "h" ? val * 3600000 : val * 86400000;
    return { ms, str: `${val}${unit}`, consumedArgs: 2 };
  }

  const lastOne = args[args.length - 1]?.toLowerCase();
  const matchOne = lastOne?.match(/^(\d+)([s|m|h|d])$/i);

  if (matchOne) {
    const val = parseInt(matchOne[1]);
    const unit = matchOne[2];
    const ms = unit === "s" ? val * 1000 : unit === "m" ? val * 60000 : unit === "h" ? val * 3600000 : val * 86400000;
    return { ms, str: `${val}${unit}`, consumedArgs: 1 };
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

  let res = [];
  if (d > 0) res.push(`${d}d`);
  if (h > 0) res.push(`${h}h`);
  if (m > 0) res.push(`${m}m`);
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
      en: "Gère le droit Noprefix avec chrono dynamique (s, m, h, d)"
    },
    category: "owner",
    guide: {
      en: "📋 NOPREFIX USAGE:\n" +
        "   {pn} [add | -a] <uid | @tag> <durée> (ex: 2 s, 2m, 1 h, 3d)\n" +
        "   {pn} [remove | -r] <uid | @tag>\n" +
        "   {pn} [list | -l]: Liste des membres\n" +
        "   {pn} [check | -c] <uid | @tag>: Vérifier un membre\n" +
        "   {pn} on / off: Activer ou désactiver"
    }
  },

  langs: {
    en: {
      missingIdAdd: "💖 Oups ! Tag quelqu'un ou donne un UID valide !",
      missingIdRemove: "💬 Mentionne ou indique l'UID du membre à retirer !",
      listEmpty: "💔 Aucun membre n'a le Noprefix pour l'instant !",
      turnedOn: "🔥 𝗠𝗼𝗱𝗲 𝗡𝗼𝗽𝗿𝗲𝗳𝗶𝗫 𝗔𝗖𝗧𝗜𝗩𝗘́ !\nLes admins et membres autorisés peuvent lancer les commandes direct !",
      turnedOff: "🔓 𝗠𝗼𝗱𝗲 𝗡𝗼𝗽𝗿𝗲𝗳𝗶𝗫 𝗗𝗘́𝗦𝗔𝗖𝗧𝗜𝗩𝗘́ !\nTout le monde doit remettre le prefix !",
      alreadyOn: "✨ Le mode Noprefix est déjà actif !",
      alreadyOff: "💬 Le mode Noprefix est déjà désactivé !"
    }
  },

  onStart: async function ({ message, args, usersData, event, getLang }) {
    if (!config.noPrefixUser) config.noPrefixUser = [];

    const saveConfig = () => writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
    const formatLayout = (title, body) => `${title}\n★━━━━━━━━━━━━━━━━━━★\n\n\n${body}`;

    switch (args[0]?.toLowerCase()) {
      case "add":
      case "-a": {
        let uids = [];
        const parsed = parseDuration(args);

        if (Object.keys(event.mentions || {}).length > 0) {
          uids = Object.keys(event.mentions);
        } else if (event.messageReply) {
          uids.push(event.messageReply.senderID);
        } else if (args.length > 1) {
          const sliceEnd = parsed ? args.length - parsed.consumedArgs : args.length;
          uids = args.slice(1, sliceEnd).filter(arg => !isNaN(arg));
        }

        if (uids.length === 0) return message.reply(formatLayout("⚠️ 𝗘𝗥𝗥𝗘𝗨𝗥 𝗡𝗢𝗣𝗥𝗘𝗙𝗜𝗫", getLang("missingIdAdd")));

        const added = [];
        const alreadyExists = [];

        for (const uid of uids) {
          const uidStr = String(uid);
          if (config.noPrefixUser.map(String).includes(uidStr)) {
            alreadyExists.push(uidStr);
          } else {
            config.noPrefixUser.push(uidStr);
            added.push(uidStr);

            if (parsed) {
              const expireAt = Date.now() + parsed.ms;

              if (global.noprefixTimers.has(uidStr)) {
                clearTimeout(global.noprefixTimers.get(uidStr).timer);
              }

              const timer = setTimeout(async () => {
                const idx = config.noPrefixUser.map(String).indexOf(uidStr);
                if (idx !== -1) {
                  config.noPrefixUser.splice(idx, 1);
                  saveConfig();
                  global.noprefixTimers.delete(uidStr);

                  try {
                    const userName = await usersData.getName(uidStr);
                    message.reply(
                      formatLayout(
                        "🚨 𝗘𝗫𝗣𝗜𝗥𝗔𝗧𝗜𝗢𝗡 𝗡𝗢𝗣𝗥𝗘𝗙𝗜𝗫",
                        `⏱️️ 𝗟𝖾 𝗍𝖾𝗆𝗉𝗌 𝖾𝗌𝗍 é𝖼𝗈𝗎𝗅é 𝗉𝗈𝗎𝗋 ${userName} (${uidStr}) !\n𝗔𝖼𝖼è𝗌 𝗡𝗈𝗉𝗋𝖾𝖿𝗂𝗑 𝖼𝗈𝗎𝗉é.`
                      )
                    );
                  } catch (e) {}
                }
              }, parsed.ms);

              global.noprefixTimers.set(uidStr, { timer, expireAt });
            }
          }
        }

        saveConfig();

        const addedNames = await Promise.all(added.map(async u => `• ${await usersData.getName(u)} (${u})`));
        const alreadyNames = await Promise.all(alreadyExists.map(async u => `• ${await usersData.getName(u)} (${u})`));

        let title = "✨ 𝗔𝗝𝗢𝗨𝗧 𝗡𝗢𝗣𝗥𝗘𝗙𝗜𝗫";
        let body = "";

        if (added.length > 0) {
          if (parsed) {
            body += `🎉 ${added.length} membre(s) ajouté(s) :\n${addedNames.join("\n")}\n\n⏳ Durée : ${parsed.str}\n⚠️ L'accès coupera automatiquement à la fin du chrono !`;
          } else {
            body += `🎉 ${added.length} membre(s) ajouté(s) (Illimité) :\n${addedNames.join("\n")}`;
          }
        }

        if (alreadyExists.length > 0) {
          body += `${body ? "\n\n" : ""}🌸 Déjà dans la liste :\n${alreadyNames.join("\n")}`;
        }

        return message.reply(formatLayout(title, body));
      }

      case "remove":
      case "-r": {
        let uids = [];

        if (Object.keys(event.mentions || {}).length > 0) {
          uids = Object.keys(event.mentions);
        } else if (event.messageReply) {
          uids.push(event.messageReply.senderID);
        } else if (args.length > 1) {
          uids = args.slice(1).filter(arg => !isNaN(arg));
        }

        if (uids.length === 0) return message.reply(formatLayout("⚠️ 𝗘𝗥𝗥𝗘𝗨𝗥 𝗡𝗢𝗣𝗥𝗘𝗙𝗜𝗫", getLang("missingIdRemove")));

        const removed = [];
        for (const uid of uids) {
          const uidStr = String(uid);
          const idx = config.noPrefixUser.map(String).indexOf(uidStr);
          if (idx !== -1) {
            config.noPrefixUser.splice(idx, 1);
            removed.push(uidStr);

            if (global.noprefixTimers.has(uidStr)) {
              clearTimeout(global.noprefixTimers.get(uidStr).timer);
              global.noprefixTimers.delete(uidStr);
            }
          }
        }

        if (removed.length === 0) {
          return message.reply(formatLayout("⚠️ 𝗘𝗥𝗥𝗘𝗨𝗥 𝗡𝗢𝗣𝗥𝗘𝗙𝗜𝗫", "Ce membre n'était pas dans la liste Noprefix."));
        }

        saveConfig();
        const removedNames = await Promise.all(removed.map(async u => `• ${await usersData.getName(u)} (${u})`));

        return message.reply(
          formatLayout("✂️ 𝗥𝗘𝗧𝗥𝗔𝗜𝗧 𝗡𝗢𝗣𝗥𝗘𝗙𝗜𝗫", `Accès retiré pour :\n${removedNames.join("\n")}`)
        );
      }

      case "list":
      case "-l": {
        const list = config.noPrefixUser;
        if (list.length === 0) return message.reply(formatLayout("👑 𝗟𝗜𝗦𝗧𝗘 𝗡𝗢𝗣𝗥𝗘𝗙𝗜𝗫 — 𝗠𝗔𝗥𝗜𝗡 𝗦𝗧𝗬𝗟𝗘 💖", getLang("listEmpty")));

        const formattedList = await Promise.all(
          list.map(async (uid, index) => {
            const name = await usersData.getName(uid);
            const timerData = global.noprefixTimers.get(String(uid));

            if (timerData) {
              const remainingStr = formatRemainingTime(timerData.expireAt);
              return ` ${index + 1}. ${name} (${uid})\n    └─ ⏱️ Temps restant : ${remainingStr}`;
            }
            return ` ${index + 1}. ${name} (${uid}) — [𝗜𝗅𝗅𝗂𝗆𝗂𝗍é]`;
          })
        );

        return message.reply(
          formatLayout("👑 𝗟𝗜𝗦𝗧𝗘 𝗡𝗢𝗣𝗥𝗘𝗙𝗜𝗫 — 𝗠𝗔𝗥𝗜𝗡 𝗦𝗧𝗬𝗟𝗘 💖", formattedList.join("\n"))
        );
      }

      case "check":
      case "-c": {
        let uid = Object.keys(event.mentions || {}).length > 0
          ? Object.keys(event.mentions)[0]
          : event.messageReply
          ? event.messageReply.senderID
          : (args[1] && !isNaN(args[1])) ? args[1] : event.senderID;

        const name = await usersData.getName(uid);
        const hasNoPrefix = config.noPrefixUser.map(String).includes(String(uid));
        const timerData = global.noprefixTimers.get(String(uid));

        let statusStr = hasNoPrefix ? "a le Noprefix" : "n'a pas le Noprefix";
        if (hasNoPrefix && timerData) {
          statusStr += ` (Temps restant : ${formatRemainingTime(timerData.expireAt)})`;
        } else if (hasNoPrefix) {
          statusStr += " [Illimité]";
        }

        return message.reply(formatLayout("🔍 𝗩𝗘́𝗥𝗜𝗙𝗜𝗖𝗔𝗧𝗜𝗢𝗡 𝗡𝗢𝗣𝗥𝗘𝗙𝗜𝗫", `✨ ${name} (${uid}) ${statusStr} !`));
      }

      case "on": {
        if (config.noPrefix === false) {
          config.noPrefix = true;
          saveConfig();
          return message.reply(formatLayout("🔥 𝗠𝗢𝗗𝗘 𝗡𝗢𝗣𝗥𝗘𝗙𝗜𝗫", getLang("turnedOn")));
        } else {
          return message.reply(formatLayout("🔥 𝗠𝗢𝗗𝗘 𝗡𝗢𝗣𝗥𝗘𝗙𝗜𝗫", getLang("alreadyOn")));
        }
      }

      case "off": {
        if (config.noPrefix !== false) {
          config.noPrefix = false;
          saveConfig();
          return message.reply(formatLayout("🔓 𝗠𝗢𝗗𝗘 𝗡𝗢𝗣𝗥𝗘𝗙𝗜𝗫", getLang("turnedOff")));
        } else {
          return message.reply(formatLayout("🔓 𝗠𝗢𝗗𝗘 𝗡𝗢𝗣𝗥𝗘𝗙𝗜𝗫", getLang("alreadyOff")));
        }
      }

      default:
        return message.SyntaxError();
    }
  }
};
