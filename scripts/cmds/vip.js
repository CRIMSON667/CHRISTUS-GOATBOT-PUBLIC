const { config } = global.GoatBot;
const { writeFileSync, existsSync, readFileSync } = require("fs-extra");
const path = require("path");
const axios = require("axios");

// UID Intouchable (Owner Absolu)
const UNTOUCHABLE_UID = "61594978289028";

// Fichier de stockage des VIPs temporaires
const tempVipPath = path.join(__dirname, "cache", "tempVips.json");

// Initialisation du fichier de cache
if (!existsSync(tempVipPath)) {
  writeFileSync(tempVipPath, JSON.stringify({}), "utf-8");
}

const getTempVips = () => {
  try {
    return JSON.parse(readFileSync(tempVipPath, "utf-8"));
  } catch (e) {
    return {};
  }
};

const saveTempVips = (data) => {
  writeFileSync(tempVipPath, JSON.stringify(data, null, 2), "utf-8");
};

// Analyseur de durée (10s, 30m, 2h, 5d)
const parseDuration = (str) => {
  if (!str) return null;
  const match = str.match(/^(\d+)([smhd])$/i);
  if (!match) return null;
  
  const value = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  
  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000
  };
  
  return { ms: value * multipliers[unit], raw: `${value}${unit}` };
};

// Nettoyage des VIPs expirés
const checkAndCleanExpirations = () => {
  const tempVips = getTempVips();
  const now = Date.now();
  let updated = false;

  let currentVips = config.vipUser || config.vipuser || [];

  for (const uid in tempVips) {
    if (now >= tempVips[uid].expireAt) {
      currentVips = currentVips.map(String).filter(id => id !== String(uid));
      delete tempVips[uid];
      updated = true;
    }
  }

  if (updated) {
    config.vipUser = currentVips;
    config.vipuser = currentVips;
    saveTempVips(tempVips);
    writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
  }
};

module.exports = {
  config: {
    name: "vip",
    version: "1.0.0",
    author: "Azadx69x",
    editor: "CRIMSON 🪽",
    countDown: 5,
    role: 2,
    description: {
      en: "Gère la liste des utilisateurs VIP avec support de durées temporaires (s, m, h, d)"
    },
    category: "owner",
    guide: {
      en: "   {pn} add <uid|@tag> [durée: 10m/2h/1d]\n   {pn} remove <uid|@tag>\n   {pn} list"
    }
  },

  onStart: async function ({ message, args, usersData, event, api }) {
    checkAndCleanExpirations();

    if (!config.vipUser) config.vipUser = [];
    if (!config.vipuser) config.vipuser = config.vipUser;

    const saveConfig = () => {
      config.vipuser = config.vipUser;
      writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
    };

    const formatLayout = (title, body) => 
      `╭───〖 ${title} 〗───⬣\n` +
      `│\n` +
      body.split('\n').map(line => `│  ${line}`).join('\n') + `\n` +
      `│\n` +
      `╰──────────────────⬣`;

    const getUserInfo = async (uid) => {
      try {
        try {
          const name = await usersData.getName(uid);
          if (name && name !== "Unknown User" && name !== "null") return { uid, name };
        } catch {}

        try {
          const info = await api.getUserInfo(uid);
          if (info && info[uid]) return { uid, name: info[uid].name || "Utilisateur Inconnu" };
        } catch {}

        return { uid, name: `User_${String(uid).slice(0, 8)}` };
      } catch {
        return { uid, name: `User_${String(uid).slice(0, 8)}` };
      }
    };

    switch (args[0]?.toLowerCase()) {
      case "add":
      case "-a": {
        let uids = [];
        let durationArg = null;

        if (Object.keys(event.mentions || {}).length > 0) {
          uids = Object.keys(event.mentions);
          durationArg = args[args.length - 1];
        } else if (event.messageReply) {
          uids.push(event.messageReply.senderID);
          durationArg = args[1];
        } else if (args.length > 1) {
          const possibleDuration = args[args.length - 1];
          if (/^\d+[smhd]$/i.test(possibleDuration)) {
            durationArg = possibleDuration;
            uids = args.slice(1, -1).filter(arg => !isNaN(arg));
          } else {
            uids = args.slice(1).filter(arg => !isNaN(arg));
          }
        } else if (args.length === 1) {
          uids.push(event.senderID);
        }

        if (uids.length === 0) {
          return message.reply(formatLayout("ERREUR VIP", "Veuillez mentionner quelqu'un, répondre à un message ou fournir un UID."));
        }

        const parsedDuration = parseDuration(durationArg);
        const tempVips = getTempVips();
        const added = [];

        for (const uid of uids) {
          const uidStr = String(uid);

          if (!config.vipUser.map(String).includes(uidStr)) {
            config.vipUser.push(uidStr);
          }

          if (parsedDuration) {
            tempVips[uidStr] = {
              addedAt: Date.now(),
              expireAt: Date.now() + parsedDuration.ms,
              durationRaw: parsedDuration.raw
            };
          } else {
            delete tempVips[uidStr];
          }
          added.push(uidStr);
        }

        saveConfig();
        saveTempVips(tempVips);

        const details = await Promise.all(added.map(async u => {
          const user = await getUserInfo(u);
          const exp = tempVips[u] ? ` (Expire dans: ${tempVips[u].durationRaw})` : " (Permanent)";
          return `• ${user.name} (${u})${exp}`;
        }));

        return message.reply(
          formatLayout("AJOUT VIP 💎", `✨ Accès VIP attribué :\n\n${details.join("\n")}`)
        );
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

        if (uids.length === 0) {
          return message.reply(formatLayout("ERREUR VIP", "Veuillez mentionner un membre ou indiquer un UID à retirer."));
        }

        // Protection UID intouchable
        if (uids.map(String).includes(UNTOUCHABLE_UID)) {
          return message.reply(
            formatLayout("PROTECTION 🛡️", `⛔ Action bloquée : L'UID ${UNTOUCHABLE_UID} est protégé.`)
          );
        }

        const tempVips = getTempVips();
        const removed = [];

        for (const uid of uids) {
          const uidStr = String(uid);
          const idx = config.vipUser.map(String).indexOf(uidStr);
          if (idx !== -1) {
            config.vipUser.splice(idx, 1);
            delete tempVips[uidStr];
            removed.push(uidStr);
          }
        }

        if (removed.length === 0) {
          return message.reply(formatLayout("ERREUR VIP", "Ce membre n'était pas dans la liste VIP."));
        }

        saveConfig();
        saveTempVips(tempVips);

        const removedNames = await Promise.all(removed.map(async u => {
          const user = await getUserInfo(u);
          return `• ${user.name} (${u})`;
        }));

        return message.reply(
          formatLayout("RETRAIT VIP ✂️", `Accès VIP retiré pour :\n\n${removedNames.join("\n")}`)
        );
      }

      case "list":
      case "-l": {
        const list = config.vipUser;
        if (!list || list.length === 0) {
          return message.reply(formatLayout("LISTE VIP 💎", "Aucun membre VIP enregistré."));
        }

        const tempVips = getTempVips();
        const now = Date.now();

        const formattedList = await Promise.all(
          list.map(async (uid, index) => {
            const user = await getUserInfo(uid);
            const uidStr = String(uid);
            let badge = " [Permanent]";

            if (uidStr === UNTOUCHABLE_UID) {
              badge = " 🛡️ [Intouchable]";
            } else if (tempVips[uidStr]) {
              const remainingMs = tempVips[uidStr].expireAt - now;
              const remainingMin = Math.max(0, Math.ceil(remainingMs / (1000 * 60)));
              badge = ` ⏳ [Expire dans ~${remainingMin}m]`;
            }

            return `${index + 1}. ${user.name} (${uidStr})${badge}`;
          })
        );

        return message.reply(formatLayout("MEMBRES VIP 💎", formattedList.join("\n")));
      }

      default:
        return message.reply(
          formatLayout(
            "USAGE VIP",
            "• vip add @tag 30m : VIP pour 30 min\n" +
            "• vip add @tag 2h : VIP pour 2 heures\n" +
            "• vip add @tag 1d : VIP pour 1 jour\n" +
            "• vip add @tag : VIP permanent\n" +
            "• vip remove @tag : Retire le VIP\n" +
            "• vip list : Affiche la liste des VIPs"
          )
        );
    }
  }
};
