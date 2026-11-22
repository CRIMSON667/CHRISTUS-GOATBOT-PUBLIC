const FRAME = "🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n━━━━━━━━━━━━━━━━━━━━━━";

const MARIN_HELP_QUOTES = [
  "Waku waku ! Trouve la commande parfaite pour tes sessions ! ✨",
  "Dis donc, notre bot a un catalogue aussi incroyable que mes cosplays de Shizuku-tan ! 💖",
  "Mission exploration ! Navigue à travers toutes nos fonctionnalités avec le sourire ! 🌸",
  "C'est trop génial ! Regarde un peu toutes ces options de folie prêtes à l'emploi ! 🎀",
  "Kyaa ! Tout est super bien rangé et ultra rapide, on adore ! ✨",
  "Besoin d'un coup de main ? Je suis là pour guider chaque étape avec style ! 🌟",
  "L'organisation, c'est la clé du succès, exactement comme pour les essayages ! 🎨"
];

const CATEGORY_ICONS = {
  utilitaires: "🛠️",
  utility: "🛠️",
  system: "⚙️",
  système: "⚙️",
  admin: "🛡️",
  administration: "🛡️",
  "box chat": "🏠",
  owner: "👑",
  économie: "💰",
  economy: "💰",
  anime: "🌸",
  fun: "🎮",
  game: "🎮",
  ia: "🧠",
  ai: "🧠",
  media: "🎵",
  musique: "🎵",
  info: "ℹ️",
  image: "🖼️"
};

const ROLE_LABELS = {
  0: "Tous les membres",
  1: "Admins du groupe",
  2: "Admin / Owner du bot"
};

function getRandomQuote() {
  return MARIN_HELP_QUOTES[Math.floor(Math.random() * MARIN_HELP_QUOTES.length)];
}

function getCategoryIcon(cat) {
  const key = (cat || "").toLowerCase();
  for (const [k, icon] of Object.entries(CATEGORY_ICONS)) {
    if (key.includes(k)) return icon;
  }
  return "✨";
}

function getLangText(obj, fallback = "Aucune description disponible.") {
  if (!obj) return fallback;
  if (typeof obj === "string") return obj;
  return obj.fr || obj.en || obj.vi || Object.values(obj)[0] || fallback;
}

function getPrefix(threadID) {
  try {
    return global.utils.getPrefix(threadID);
  } catch (_) {
    return (global.GoatBot && global.GoatBot.config && global.GoatBot.config.prefix) || "/";
  }
}

function getSortedCategories(userRole) {
  const allCommands = Array.from((global.GoatBot && global.GoatBot.commands && global.GoatBot.commands.values()) || []);
  const accessibleCommands = allCommands.filter(cmd => {
    const cmdRole = cmd?.config?.role ?? 0;
    return cmdRole <= userRole && cmd?.config?.name;
  });

  const categories = new Map();
  for (const cmd of accessibleCommands) {
    const catName = (cmd.config.category || "Autres").trim();
    const catKey = catName.toLowerCase();
    if (!categories.has(catKey)) {
      categories.set(catKey, { label: catName, commands: [] });
    }
    categories.get(catKey).commands.push(cmd);
  }

  for (const cat of categories.values()) {
    cat.commands.sort((a, b) => a.config.name.localeCompare(b.config.name));
  }

  const sortedCats = Array.from(categories.values()).sort((a, b) => a.label.localeCompare(b.label));
  return { sortedCats, accessibleCommands, categories };
}

function buildMainMenu(sortedCats, totalCount, prefix) {
  let body = "";
  sortedCats.forEach((cat, index) => {
    const icon = getCategoryIcon(cat.label);
    const names = cat.commands.map(c => c.config.name).join(", ");
    body += `[${index + 1}] ${icon} ${cat.label.toUpperCase()} (${cat.commands.length})\n     └ ${names}\n\n`;
  });

  return (
    `${FRAME}\n` +
    `✨ CENTRE DE COMMANDES ✨\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `Préfixe : ${prefix} | Total : ${totalCount} commandes\n\n` +
    `${body.trim()}\n\n` +
    `🔢 Réponds à ce message avec le numéro d'une catégorie (ex: 1) pour l'ouvrir !\n` +
    `💡 Ou tape : ${prefix}help <commande>\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `💬 « ${getRandomQuote()} »`
  );
}

function buildCategoryMenu(cat, prefix) {
  const icon = getCategoryIcon(cat.label);
  const list = cat.commands
    .map((cmd, idx) => {
      const desc = getLangText(cmd.config.description, "Pas de description");
      return `[${idx + 1}] ${prefix}${cmd.config.name} — ${desc}`;
    })
    .join("\n");

  return (
    `${FRAME}\n` +
    `✨ CATÉGORIE : ${cat.label.toUpperCase()} ✨\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `${icon} ${cat.commands.length} commande(s) disponible(s) :\n\n` +
    `${list}\n\n` +
    `🔢 Réponds avec le numéro d'une commande pour voir son guide (ou 0 pour revenir au menu).\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `💬 « ${getRandomQuote()} »`
  );
}

function buildCommandCard(cmd, prefix) {
  const cfg = cmd.config;
  const desc = getLangText(cfg.description);
  const rawGuide = getLangText(cfg.guide, `${prefix}${cfg.name}`);
  const formattedGuide = rawGuide
    .replace(/\{pn\}/g, `${prefix}${cfg.name}`)
    .replace(/\{p\}/g, prefix);
  const aliases = Array.isArray(cfg.aliases) && cfg.aliases.length ? cfg.aliases.join(", ") : "Aucun";
  const perm = ROLE_LABELS[cfg.role ?? 0] || `Niveau ${cfg.role}`;

  return (
    `${FRAME}\n` +
    `✨ FICHE COMMANDE : ${cfg.name.toUpperCase()} ✨\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `📌 Nom : ${prefix}${cfg.name}\n` +
    `🏷️ Alias : ${aliases}\n` +
    `📂 Catégorie : ${cfg.category || "Autres"}\n` +
    `🔐 Permission : ${perm}\n` +
    `⏱️ Cooldown : ${cfg.countDown || 0}s\n` +
    `👤 Auteur : ${cfg.author || "Inconnu"}\n\n` +
    `📖 Description :\n${desc}\n\n` +
    `💡 Utilisation :\n${formattedGuide}\n\n` +
    `🔢 Réponds 0 pour revenir au menu principal.\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `💬 « ${getRandomQuote()} »`
  );
}

module.exports = {
  config: {
    name: "help",
    aliases: ["menu", "aide", "marinhelp", "commandes"],
    version: "5.0.0",
    author: "CRIMSON 💙🪽",
    countDown: 5,
    role: 0,
    description: {
      fr: "Menu d'aide interactif Marin Kitagawa avec navigation par numéros 🎀",
      en: "Menu d'aide interactif Marin Kitagawa avec navigation par numéros 🎀"
    },
    category: "utilitaires",
    guide: {
      fr: "{pn} [nom_commande | catégorie]",
      en: "{pn} [nom_commande | catégorie]"
    }
  },

  onStart: async function ({ message, event, args, role, commandName }) {
    try {
      await message.reaction("⏳", event.messageID);

      const prefix = getPrefix(event.threadID);
      const userRole = typeof role === "number" ? role : 0;
      const query = (args[0] || "").trim().toLowerCase();
      const { sortedCats, accessibleCommands, categories } = getSortedCategories(userRole);

      if (query) {
        // Recherche par catégorie
        let matchedCat = categories.get(query);
        if (!matchedCat) {
          for (const [k, v] of categories.entries()) {
            if (k.includes(query)) {
              matchedCat = v;
              break;
            }
          }
        }

        if (matchedCat) {
          await message.reaction("✅", event.messageID);
          return message.reply(buildCategoryMenu(matchedCat, prefix), (err, info) => {
            if (!err && info) {
              global.GoatBot.onReply.set(info.messageID, {
                commandName,
                messageID: info.messageID,
                author: event.senderID,
                step: "category",
                category: matchedCat,
                userRole
              });
            }
          });
        }

        // Recherche par commande ou alias
        const foundCmd = accessibleCommands.find(cmd => {
          const nameMatch = cmd.config.name.toLowerCase() === query;
          const aliasMatch = Array.isArray(cmd.config.aliases) && cmd.config.aliases.some(a => a.toLowerCase() === query);
          return nameMatch || aliasMatch;
        });

        if (foundCmd) {
          await message.reaction("✅", event.messageID);
          return message.reply(buildCommandCard(foundCmd, prefix), (err, info) => {
            if (!err && info) {
              global.GoatBot.onReply.set(info.messageID, {
                commandName,
                messageID: info.messageID,
                author: event.senderID,
                step: "command",
                userRole
              });
            }
          });
        }

        await message.reaction("❌", event.messageID);
        return message.reply(
          `${FRAME}\n` +
          `✨ COMMANDE INTROUVABLE ✨\n` +
          `━━━━━━━━━━━━━━━━━━━━━━\n` +
          `Oups ! Aucune commande ni catégorie « ${query} » trouvée (ou permission insuffisante).\n\n` +
          `Tape ${prefix}help pour ouvrir le menu interactif ! ✨`
        );
      }

      // Affichage du menu principal numéroté
      await message.reaction("✅", event.messageID);
      return message.reply(buildMainMenu(sortedCats, accessibleCommands.length, prefix), (err, info) => {
        if (!err && info) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName,
            messageID: info.messageID,
            author: event.senderID,
            step: "main",
            sortedCats,
            userRole
          });
        }
      });
    } catch (err) {
      console.error("[help]", err);
      try {
        await message.reaction("❌", event.messageID);
      } catch (_) {}
      return message.reply(`❌ Oups, gros bug sur help : ${err.message}`);
    }
  },

  onReply: async function ({ message, event, Reply, commandName }) {
    try {
      if (event.senderID !== Reply.author) return;

      const input = (event.body || "").trim();
      const choice = parseInt(input, 10);
      if (isNaN(choice)) return;

      const prefix = getPrefix(event.threadID);
      const { userRole } = Reply;

      // Retour au menu principal avec 0
      if (choice === 0 && Reply.step !== "main") {
        const { sortedCats, accessibleCommands } = getSortedCategories(userRole);
        return message.reply(buildMainMenu(sortedCats, accessibleCommands.length, prefix), (err, info) => {
          if (!err && info) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName,
              messageID: info.messageID,
              author: event.senderID,
              step: "main",
              sortedCats,
              userRole
            });
          }
        });
      }

      // Étape 1 : Choix d'une catégorie depuis le menu principal
      if (Reply.step === "main") {
        const selectedCat = Reply.sortedCats[choice - 1];
        if (!selectedCat) {
          return message.reply(`⚠️ Numéro invalide ! Choisis entre 1 et ${Reply.sortedCats.length}.`);
        }

        return message.reply(buildCategoryMenu(selectedCat, prefix), (err, info) => {
          if (!err && info) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName,
              messageID: info.messageID,
              author: event.senderID,
              step: "category",
              category: selectedCat,
              userRole
            });
          }
        });
      }

      // Étape 2 : Choix d'une commande depuis une catégorie
      if (Reply.step === "category") {
        const selectedCmd = Reply.category.commands[choice - 1];
        if (!selectedCmd) {
          return message.reply(`⚠️ Numéro invalide ! Choisis entre 1 et ${Reply.category.commands.length} (ou 0 pour revenir).`);
        }

        return message.reply(buildCommandCard(selectedCmd, prefix), (err, info) => {
          if (!err && info) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName,
              messageID: info.messageID,
              author: event.senderID,
              step: "command",
              userRole
            });
          }
        });
      }
    } catch (err) {
      console.error("[help onReply]", err);
    }
  }
};