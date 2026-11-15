const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "update",
    aliases: ["up", "maj"],
    version: "1.0.0",
    author: "Delfa Frost",
    countDown: 10,
    role: 2,
    description: {
      fr: "Met à jour ou télécharge une commande depuis le dépôt GitHub officiel."
    },
    category: "admin",
    guide: {
      fr: "{pn} <nom_de_commande>"
    }
  },

  onStart: async function ({ message, event, args, api }) {
    try {
      if (!args[0]) {
        message.reaction("❌", event.messageID);
        return message.reply("❌ Oups ! Précise le nom de la commande à mettre à jour. Ex: `!update ping`");
      }

      const cmdName = args[0].toLowerCase();
      message.reaction("⏳", event.messageID);

      const githubUrl = `[https://raw.githubusercontent.com/fnc-devs/goatbot-store-api/main/$](https://raw.githubusercontent.com/fnc-devs/goatbot-store-api/main/$){cmdName}.js`;

      const res = await axios.get(githubUrl);
      if (!res || !res.data) {
        throw new Error("Impossible de récupérer le code source depuis GitHub.");
      }

      const filePath = path.join(__dirname, `${cmdName}.js`);
      fs.writeFileSync(filePath, res.data, "utf8");

      message.reaction("✅", event.messageID);
      return message.reply(`✨ La commande **${cmdName}** a été mise à jour avec succès depuis le dépôt GitHub ! Recharge le bot pour l'appliquer.`);
    } catch (err) {
      message.reaction("❌", event.messageID);
      return message.reply(`❌ Erreur lors de la mise à jour : ${err.message}`);
    }
  }
};