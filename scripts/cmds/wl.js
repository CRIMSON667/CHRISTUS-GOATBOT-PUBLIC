const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

if (!global.whitelistTimers) {
  global.whitelistTimers = new Map();
}

/**
 * Parse une durée avec ou sans espace (ex: "2 s", "2m", "1 h", "3d")
 */
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

/**
 * Formate le temps restant en d, h, m, s
 */
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
    name: "whitelist",
    aliases: ["wl"],
    version: "3.6",
    author: "CRIMSON 🪽",
    countDown: 5,
    role: 2,
    description: {
      en: "Gère la whitelist avec compte à rebours (s, m, h, d)"
    },
    category: "owner",
    guide: {
      en: "📋 WHITELIST USAGE:\n" +
        "   {pn} user add <uid | @tag> <durée> (ex: 2 s, 2 m, 1 h, 3 d)\n" +
        "   {pn} user remove <uid | @tag>\n" +
        "   {pn} user list"
    }
  },

  onStart: async function ({ message, args, usersData, threadsData, event, role }) {
    if (!config.whiteListMode) config.whiteListMode = { enable: false, whiteListIds: [] };
    if (!config.whiteListModeThread) config.whiteListModeThread = { enable: false, whiteListThreadIds: [] };

    const saveConfig = () => writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

    const subCommand = args[0]?.toLowerCase();
    const action = args[1]?.toLowerCase();

    switch (subCommand) {
      case "user":
      case "u": {
        switch (action) {
          case "add":
          case "-a": {
            if (role < 3) return message.reply("🚫 Seuls les administrateurs suprêmes peuvent exécuter cette commande !");

            let uids = [];
            const parsed = parseDuration(args);

            if (Object.keys(event.mentions).length > 0) {
              uids = Object.keys(event.mentions);
            } else if (event.messageReply) {
              uids.push(event.messageReply.senderID);
            } else {
              const sliceEnd = parsed ? args.length - parsed.consumedArgs : args.length;
              uids = args.slice(2, sliceEnd).filter(arg => !isNaN(arg));
            }

            if (uids.length === 0) {
              return message.reply("😳 Mentionne quelqu'un ou indique un UID valide !");
            }

            const added = [];
            const alreadyExists = [];

            for (const uid of uids) {
              const uidStr = String(uid);
              if (config.whiteListMode.whiteListIds.map(String).includes(uidStr)) {
                alreadyExists.push(uidStr);
              } else {
                config.whiteListMode.whiteListIds.push(uidStr);
                added.push(uidStr);

                if (parsed) {
                  const expireAt = Date.now() + parsed.ms;

                  if (global.whitelistTimers.has(uidStr)) {
                    clearTimeout(global.whitelistTimers.get(uidStr).timer);
                  }

                  const timer = setTimeout(async () => {
                    const idx = config.whiteListMode.whiteListIds.map(String).indexOf(uidStr);
                    if (idx !== -1) {
                      config.whiteListMode.whiteListIds.splice(idx, 1);
                      saveConfig();
                      global.whitelistTimers.delete(uidStr);

                      try {
                        const userName = await usersData.getName(uidStr);
                        message.reply(
                          `★━━━━━━━━━━━━━━━━━━━━━━━━★\n` +
                          `🚨 𝗘𝗫𝗣𝗜𝗥𝗔𝗧𝗜𝗢𝗡 𝗩𝗜𝗣\n\n` +
                          `⏱️ Le temps est écoulé pour ${userName} (${uidStr}) !\n` +
                          `Accès VIP coupé.\n` +
                          `★━━━━━━━━━━━━━━━━━━━━━━━━★`
                        );
                      } catch (e) {}
                    }
                  }, parsed.ms);

                  global.whitelistTimers.set(uidStr, { timer, expireAt });
                }
              }
            }

            saveConfig();

            const addedNames = await Promise.all(added.map(async u => `• ${await usersData.getName(u)} (${u})`));
            const alreadyNames = await Promise.all(alreadyExists.map(async u => `• ${await usersData.getName(u)} (${u})`));

            let msg = "";
            if (added.length > 0) {
              if (parsed) {
                msg += `★━━━━━━━━━━━━━━━━━━━━━━━━★\n` +
                       `👑 𝗔𝗖𝗖𝗘̀𝗦 𝗩𝗜𝗣 𝗧𝗘𝗠𝗣𝗢𝗥𝗔𝗜𝗥𝗘\n\n` +
                       `🎉 ${added.length} membre(s) ont obtenu le Pass VIP !\n` +
                       `⏳ Durée : ${parsed.str}\n\n` +
                       `👤 𝗠𝖾𝗆𝖻𝗋𝖾(𝗌) :\n${addedNames.join("\n")}\n\n` +
                       `⚠️️ L'accès coupera automatiquement à la fin du chrono !\n` +
                       `★━━━━━━━━━━━━━━━━━━━━━━━━★`;
              } else {
                msg += `★━━━━━━━━━━━━━━━━━━━━━━━━★\n` +
                       `👑 𝗔𝗖𝗖𝗘̀𝗦 𝗩𝗜𝗣 𝗜𝗟𝗟𝗜𝗠𝗜𝗧𝗘́\n\n` +
                       `🎉 ${added.length} membre(s) ajoutés définitivement :\n${addedNames.join("\n")}\n` +
                       `★━━━━━━━━━━━━━━━━━━━━━━━━★`;
              }
            }

            if (alreadyExists.length > 0) {
              msg += `\n\n🙄 Déjà VIP :\n${alreadyNames.join("\n")}`;
            }

            return message.reply(msg);
          }

          case "remove":
          case "-r": {
            if (role < 3) return message.reply("🚫 Permission refusée !");

            let uids = Object.keys(event.mentions).length > 0 
              ? Object.keys(event.mentions) 
              : event.messageReply 
              ? [event.messageReply.senderID] 
              : args.slice(2).filter(arg => !isNaN(arg));

            if (uids.length === 0) return message.reply("😳 Donne un UID ou mentionne quelqu'un.");

            const removed = [];
            for (const uid of uids) {
              const uidStr = String(uid);
              const idx = config.whiteListMode.whiteListIds.map(String).indexOf(uidStr);
              if (idx !== -1) {
                config.whiteListMode.whiteListIds.splice(idx, 1);
                removed.push(uidStr);

                if (global.whitelistTimers.has(uidStr)) {
                  clearTimeout(global.whitelistTimers.get(uidStr).timer);
                  global.whitelistTimers.delete(uidStr);
                }
              }
            }

            saveConfig();
            const removedNames = await Promise.all(removed.map(async u => `• ${await usersData.getName(u)} (${u})`));

            return message.reply(
              `★━━━━━━━━━━━━━━━━━━━━━━━━★\n` +
              `✂️ 𝗥𝗘𝗧𝗥𝗔𝗜𝗧 𝗩𝗜𝗣\n\n` +
              `Membre(s) retiré(s) :\n${removedNames.join("\n")}\n` +
              `★━━━━━━━━━━━━━━━━━━━━━━━━★`
            );
          }

          case "list":
          case "-l": {
            const list = config.whiteListMode.whiteListIds;
            if (list.length === 0) return message.reply("💔 Aucun membre n'est actuellement whitelisted.");

            const formattedList = await Promise.all(
              list.map(async (uid, index) => {
                const name = await usersData.getName(uid);
                const timerData = global.whitelistTimers.get(String(uid));

                if (timerData) {
                  const remainingStr = formatRemainingTime(timerData.expireAt);
                  return ` ${index + 1}. ${name} (${uid})\n    └─ ⏱️ Temps restant : ${remainingStr}`;
                }
                return ` ${index + 1}. ${name} (${uid}) — [𝗜𝗅𝗅𝗂𝗆𝗂𝗍é]`;
              })
            );

            return message.reply(
              `★━━━━━━━━━━━━━━━━━━━━━━━━★\n` +
              `📋 𝗟𝗜𝗦𝗧𝗘 𝗗𝗘𝗦 𝗠𝗘𝗠𝗕𝗥𝗘𝗦 𝗩𝗜𝗣 (${list.length})\n\n` +
              `${formattedList.join("\n")}\n` +
              `★━━━━━━━━━━━━━━━━━━━━━━━━★`
            );
          }

          case "on":
            config.whiteListMode.enable = true;
            saveConfig();
            return message.reply("🔥 Mode Whitelist Utilisateur ACTIVÉ !");

          case "off":
            config.whiteListMode.enable = false;
            saveConfig();
            return message.reply("🔓 Mode Whitelist Utilisateur DÉSACTIVÉ !");

          default:
            return message.reply("⚠️ Sous-commande invalide (add, remove, list, on, off).");
        }
      }

      default:
        return message.reply("⚠️ Commande invalide. Utilise : `wl user`");
    }
  }
};