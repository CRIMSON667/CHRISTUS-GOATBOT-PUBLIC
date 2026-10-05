const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

let fonts;

try {
  fonts = require("../../func/font.js");
} catch (error) {
  fonts = {
    bold: (t) => t,
    sansSerif: (t) => t,
    monospace: (t) => t,
    fancy: (t) => t
  };
}

function toTitleCase(str) {
  if (!str) return "";
  return str.replace(
    /\w\S*/g,
    txt =>
      txt.charAt(0).toUpperCase() +
      txt.substr(1).toLowerCase()
  );
}

module.exports = {
  config: {
    name: "help",
    aliases: [],
    version: "3.1.1",
    author: "Christus",
    countDown: 5,
    role: 0,

    description: {
      fr: "🧰 Affiche la liste des commandes disponibles et leurs détails",
      en: "🧰 Display available commands and their details"
    },

    category: "info",

    guide: {
      fr:
        "{pn} : menu principal\n" +
        "{pn} <commande> : informations sur une commande\n" +
        "{pn} basics : commandes de base\n" +
        "{pn} search <mot> : rechercher une commande",

      en:
        "{pn} : main menu\n" +
        "{pn} <command> : command information\n" +
        "{pn} basics : basic commands\n" +
        "{pn} search <word> : search for a command"
    }
  },

  onStart: async function ({
    message,
    args,
    event,
    role
  }) {
    const prefix =
      getPrefix(event.threadID);

    const arg =
      args[0]?.toLowerCase();

    const allCommands = [];
    const seen = new Set();

    for (const [name, cmd] of commands) {
      if (cmd.config.role > role)
        continue;

      if (!seen.has(name)) {
        seen.add(name);
        allCommands.push(cmd);
      }
    }

    allCommands.sort(
      (a, b) =>
        a.config.name.localeCompare(
          b.config.name
        )
    );

    // ═══════════════════════════════
    // MENU PRINCIPAL
    // ═══════════════════════════════

    if (!arg) {
      const categorized = {};

      for (const cmd of allCommands) {
        const cat =
          cmd.config.category || "other";

        if (!categorized[cat])
          categorized[cat] = [];

        categorized[cat].push(
          cmd.config.name
        );
      }

      const sortedCats =
        Object.keys(categorized).sort();

      let msg =
        `🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

      msg +=
        `${fonts.bold(
          `🔍 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗘𝗦 𝗗𝗜𝗦𝗣𝗢𝗡𝗜𝗕𝗟𝗘𝗦`
        )} 🧰 (${allCommands.length})\n\n`;

      for (const cat of sortedCats) {
        msg +=
          `${fonts.bold(
            `🌸 ${toTitleCase(cat)}`
          )} (${categorized[cat].length})\n`;

        const cmds =
          categorized[cat].sort();

        for (
          let i = 0;
          i < cmds.length;
          i += 3
        ) {
          const line =
            cmds
              .slice(i, i + 3)
              .map(
                c =>
                  `🎀 ${fonts.sansSerif(c)}`
              )
              .join("   ");

          msg += line + "\n";
        }

        msg += "\n";
      }

      msg +=
        `\n${fonts.bold(
          "➜ 📖 Détails :"
        )} ${prefix}help <commande>\n`;

      msg +=
        `${fonts.bold(
          "➜ 🌺 Commandes de base :"
        )} ${prefix}help basics\n`;

      msg +=
        `${fonts.bold(
          "➜ 🔎 Recherche :"
        )} ${prefix}help search <mot>\n\n`;

      msg +=
        `💖 𝗠𝗮𝗿𝗶𝗻 𝗶𝗰𝗶 — 𝗽𝗿𝗲̂𝘁𝗲 𝗮̀ 𝘁'𝗮𝗶𝗱𝗲𝗿 ! 🎀`;

      return message.reply(msg);
    }

    // ═══════════════════════════════
    // COMMANDES DE BASE
    // ═══════════════════════════════

    if (arg === "basics") {
      const basicCmdList = [
        "register",
        "items",
        "gift",
        "bal",
        "bank",
        "active",
        "streak",
        "vault",
        "bag",
        "rank",
        "ratings",
        "report",
        "trade",
        "uid",
        "pet",
        "rosashop",
        "garden",
        "arena",
        "mtls"
      ];

      const validCommands = [];

      for (const cmdName of basicCmdList) {
        const cmd =
          commands.get(cmdName);

        if (
          cmd &&
          cmd.config.role <= role
        ) {
          validCommands.push(cmd);
        }
      }

      if (validCommands.length === 0) {
        return message.reply(
          `🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n` +
          `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
          fonts.bold(
            "❌ Aucune commande de base disponible pour ton rôle."
          )
        );
      }

      let msg =
        `🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

      msg +=
        `${fonts.bold(
          "🌺 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗘𝗦 𝗗𝗘 𝗕𝗔𝗦𝗘"
        )}\n\n`;

      for (const cmd of validCommands) {
        const cfg = cmd.config;

        const desc =
          cfg.description?.fr ||
          "Aucune description";

        msg +=
          `📁 ${prefix}${cfg.name} ` +
          `${fonts.bold("➜")} ${desc}\n`;
      }

      msg +=
        `\n${fonts.bold(
          "➜ ✨ Explore encore plus de commandes !"
        )}\n`;

      msg +=
        `${fonts.bold(
          "➜ 📚 Tout afficher :"
        )} ${prefix}help all\n\n`;

      msg +=
        `🎀 𝗠𝗼𝗱𝗲 𝗞𝗶𝘁𝗮𝗴𝗮𝘄𝗮 𝗮𝗰𝘁𝗶𝘃𝗲́ !`;

      return message.reply(msg);
    }

    // ═══════════════════════════════
    // RECHERCHE
    // ═══════════════════════════════

    if (
      arg === "search" ||
      arg === "find"
    ) {
      const searchStr = args[1];

      if (!searchStr) {
        return message.reply(
          `🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n` +
          `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
          `🔎 Entre un mot-clé pour rechercher une commande.\n\n` +
          `${fonts.bold(
            "EXEMPLE :"
          )} ${prefix}help search shop`
        );
      }

      const results = [];
      const searchLower =
        searchStr.toLowerCase();

      for (const [name, cmd] of commands) {
        if (cmd.config.role > role)
          continue;

        const cfg = cmd.config;

        const searchableText =
          `${cfg.name} ` +
          `${cfg.category || ""} ` +
          `${(cfg.aliases || []).join(" ")} ` +
          `${cfg.description?.fr || ""}`
            .toLowerCase();

        if (
          searchableText.includes(
            searchLower
          )
        ) {
          results.push(cmd);
        }
      }

      if (results.length === 0) {
        return message.reply(
          `🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n` +
          `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
          `🔎 𝗥𝗘𝗖𝗛𝗘𝗥𝗖𝗛𝗘 (0)\n\n` +
          `❌ Aucun résultat trouvé pour "${searchStr}".`
        );
      }

      const topResults =
        results.slice(0, 5);

      let msg =
        `🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

      msg +=
        `${fonts.bold(
          `🔎 𝗥𝗘𝗖𝗛𝗘𝗥𝗖𝗛𝗘 (${topResults.length})`
        )}\n\n`;

      for (const cmd of topResults) {
        const cfg = cmd.config;

        const aliasesList =
          cfg.aliases &&
          cfg.aliases.length > 0
            ? `\n🔗 Alias : ${cfg.aliases.join(", ")}`
            : "";

        msg +=
          `📁 ${prefix}${fonts.bold(
            cfg.name
          )}${aliasesList}\n`;

        msg +=
          `${fonts.bold(
            "➜"
          )} ${cfg.description?.fr || "Aucune description"}\n\n`;
      }

      msg +=
        `💖 Recherche terminée par Marin ! 🎀`;

      return message.reply(msg);
    }

    // ═══════════════════════════════
    // DÉTAILS D'UNE COMMANDE
    // ═══════════════════════════════

    const cmdName = args[0];

    let cmd =
      commands.get(cmdName);

    if (!cmd) {
      const alias =
        aliases.get(cmdName);

      if (alias)
        cmd =
          commands.get(alias);
    }

    if (!cmd) {
      return message.reply(
        `🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        fonts.bold(
          `❌ La commande "${cmdName}" n'existe pas.`
        )
      );
    }

    const cfg = cmd.config;

    let usage =
      cfg.guide?.fr ||
      "Aucun guide disponible";

    usage =
      usage
        .replace(
          /{p}/g,
          prefix
        )
        .replace(
          /{n}/g,
          cfg.name
        );

    const roleText =
      cfg.role == 0
        ? "👤 Tous les utilisateurs"
        : cfg.role == 1
          ? "👑 Administrateurs du groupe"
          : cfg.role == 2
            ? "🛡️ Administrateur du bot"
            : "❓ Inconnu";

    const detail =
      `🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n` +
      `━━━━━━━━━━━━━━━━━━━━━━\n\n` +

      fonts.bold(
        `╭─── 🌸 ${toTitleCase(
          cfg.name
        )} ───`
      ) +

      `\n│ 🎀 Nom : ${fonts.sansSerif(
        cfg.name
      )}` +

      `\n│ 👤 Auteur : ${
        cfg.author || "Inconnu"
      }` +

      `\n│ 📝 Description : ${
        cfg.description?.fr ||
        "Aucune"
      }` +

      `\n│ 📖 Utilisation : ${
        fonts.monospace(usage)
      }` +

      `\n│ 📂 Catégorie : ${
        cfg.category || "other"
      }` +

      `\n│ ⏱️ Cooldown : ${
        cfg.countDown || 1
      }s` +

      `\n│ 🛡️ Rôle : ${roleText}` +

      `\n│ 🔗 Alias : ${
        cfg.aliases?.length
          ? cfg.aliases.join(", ")
          : "Aucun"
      }` +

      `\n${fonts.bold(
        "╰────────────────────"
      )}`;

    return message.reply(detail);
  }
};