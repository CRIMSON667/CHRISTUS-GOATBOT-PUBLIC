const { config } = global.GoatBot;
const { writeFileSync, existsSync, readFileSync } = require("fs-extra");
const path = require("path");

// UID Intouchable (Owner Absolu)
const UNTOUCHABLE_UID = "61594127422186";

// Fichier de stockage des admins temporaires
const tempAdminPath = path.join(__dirname, "cache", "tempAdmins.json");

// Chargement / Initialisation du stockage temporaire
if (!existsSync(tempAdminPath)) {
  writeFileSync(tempAdminPath, JSON.stringify({}), "utf-8");
}

const getTempAdmins = () => {
  try {
    return JSON.parse(readFileSync(tempAdminPath, "utf-8"));
  } catch (e) {
    return {};
  }
};

const saveTempAdmins = (data) => {
  writeFileSync(tempAdminPath, JSON.stringify(data, null, 2), "utf-8");
};

// Convertisseur de durée (1s, 10m, 2h, 5d) en millisecondes
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
  
  return value * multipliers[unit];
};

// Purge des admins dont le temps a expiré
const checkAndCleanExpirations = () => {
  const tempAdmins = getTempAdmins();
  const now = Date.now();
  let updated = false;

  for (const uid in tempAdmins) {
    if (now >= tempAdmins[uid].expireAt) {
      // Retrait de la config si présent
      const idx = config.adminBot.map(String).indexOf(String(uid));
      if (idx !== -1) {
        config.adminBot.splice(idx, 1);
      }
      delete tempAdmins[uid];
      updated = true;
    }
  }

  if (updated) {
    saveTempAdmins(tempAdmins);
    writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
  }
};

module.exports = {
  config: {
    name: "admin",
    version: "3.0",
    author: "CRIMSON 🔗🩵🪽",
    editor: "CRIMSON 🪽",
    countDown: 5,
    role: 4,
    description: {
      en: "Gère les administrateurs du bot (Add avec durée, Remove, List)"
    },
    category: "owner",
    guide: {
      en: "   {pn} add <uid|@tag> [durée: 10m/2h/5d]\n   {pn} remove <uid|@tag>\n   {pn} list"
    }
  },

  onStart: async function ({ message, args, usersData, event }) {
    checkAndCleanExpirations();

    if (!config.adminBot) config.adminBot = [];
    const saveConfig = () => writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

    const formatLayout = (title, body) => 
      `╭───〖 ${title} 〗───⬣\n` +
      `│\n` +
      body.split('\n').map(line => `│  ${line}`).join('\n') + `\n` +
      `│\n` +
      `╰──────────────────⬣`;

    // Vérification de permission (Owner / Untouchable)
    const isOwner = config.adminBot.map(String).includes(String(event.senderID)) || 
                    (config.NDH && config.NDH.map(String).includes(String(event.senderID))) ||
                    String(event.senderID) === UNTOUCHABLE_UID;
    
    if (!isOwner) {
      return message.reply(formatLayout("ACCÈS REFUSÉ", "🚫 Permission insuffisante pour exécuter cette commande."));
    }

    switch (args[0]?.toLowerCase()) {
      case "add":
      case "-a": {
        let uids = [];
        let durationArg = null;

        if (Object.keys(event.mentions || {}).length > 0) {
          uids = Object.keys(event.mentions);
          durationArg = args[args.length - 1]; // Récupère le dernier argument après la mention
        } else if (event.messageReply) {
          uids.push(event.messageReply.senderID);
          durationArg = args[1];
        } else if (args.length > 1) {
          // Si le dernier argument est une durée (ex: 30m), on l'isole des UIDs
          const possibleDuration = args[args.length - 1];
          if (/^\d+[smhd]$/i.test(possibleDuration)) {
            durationArg = possibleDuration;
            uids = args.slice(1, -1).filter(arg => !isNaN(arg));
          } else {
            uids = args.slice(1).filter(arg => !isNaN(arg));
          }
        }

        if (uids.length === 0) {
          return message.reply(formatLayout("ERREUR", "Veuillez mentionner quelqu'un, répondre à un message ou donner un UID."));
        }

        const durationMs = parseDuration(durationArg);
        const tempAdmins = getTempAdmins();
        const added = [];

        for (const uid of uids) {
          const uidStr = String(uid);
          
          if (!config.adminBot.map(String).includes(uidStr)) {
            config.adminBot.push(uidStr);
          }

          if (durationMs) {
            tempAdmins[uidStr] = {
              addedAt: Date.now(),
              expireAt: Date.now() + durationMs,
              durationRaw: durationArg
            };
          } else {
            // Si pas de durée spécifiée, devient un admin permanent
            delete tempAdmins[uidStr];
          }
          added.push(uidStr);
        }

        saveConfig();
        saveTempAdmins(tempAdmins);

        const details = await Promise.all(added.map(async u => {
          const name = await usersData.getName(u);
          const exp = tempAdmins[u] ? ` (Expire dans: ${tempAdmins[u].durationRaw})` : " (Permanent)";
          return `• ${name} (${u})${exp}`;
        }));

        return message.reply(
          formatLayout("AJOUT ADMIN", `👑 Administrateur(s) mis à jour :\n\n${details.join("\n")}`)
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
          return message.reply(formatLayout("ERREUR", "Veuillez mentionner un utilisateur ou indiquer un UID à retirer."));
        }

        if (uids.map(String).includes(UNTOUCHABLE_UID)) {
          return message.reply(
            formatLayout("PROTECTION", `🛡️ Action bloquée : L'UID ${UNTOUCHABLE_UID} ne peut pas être supprimé.`)
          );
        }

        const tempAdmins = getTempAdmins();
        const removed = [];

        for (const uid of uids) {
          const uidStr = String(uid);
          const idx = config.adminBot.map(String).indexOf(uidStr);
          if (idx !== -1) {
            config.adminBot.splice(idx, 1);
            delete tempAdmins[uidStr];
            removed.push(uidStr);
          }
        }

        if (removed.length === 0) {
          return message.reply(formatLayout("ERREUR", "Aucun membre trouvé dans la liste des administrateurs."));
        }

        saveConfig();
        saveTempAdmins(tempAdmins);

        const removedNames = await Promise.all(removed.map(async u => `• ${await usersData.getName(u)} (${u})`));

        return message.reply(
          formatLayout("RETRAIT ADMIN", `Droits d'administration retirés pour :\n\n${removedNames.join("\n")}`)
        );
      }

      case "list":
      case "-l": {
        const list = config.adminBot;
        if (list.length === 0) return message.reply(formatLayout("ADMINS", "Aucun administrateur enregistré."));

        const tempAdmins = getTempAdmins();
        const now = Date.now();

        const formattedList = await Promise.all(
          list.map(async (uid, index) => {
            const name = await usersData.getName(uid);
            const uidStr = String(uid);
            let badge = " [Permanent]";

            if (uidStr === UNTOUCHABLE_UID) {
              badge = " 🛡️ [Intouchable]";
            } else if (tempAdmins[uidStr]) {
              const remainingMs = tempAdmins[uidStr].expireAt - now;
              const remainingMin = Math.max(0, Math.ceil(remainingMs / (1000 * 60)));
              badge = ` ⏳ [Expire dans ~${remainingMin}m]`;
            }

            return `${index + 1}. ${name} (${uidStr})${badge}`;
          })
        );

        return message.reply(formatLayout("LISTE DES ADMINS", formattedList.join("\n")));
      }

      default:
        return message.reply(
          formatLayout(
            "USAGE COMMANDES",
            "• admin add @tag 30m : Ajoute un admin pour 30 min\n" +
            "• admin add @tag 2h : Ajoute un admin pour 2 heures\n" +
            "• admin add @tag 1d : Ajoute un admin pour 1 jour\n" +
            "• admin add @tag : Ajoute un admin permanent\n" +
            "• admin remove @tag : Retire un admin\n" +
            "• admin list : Affiche la liste des admins"
          )
        );
    }
  }
};