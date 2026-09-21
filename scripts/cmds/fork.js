const HEADER = "🔱 𝗖𝗵𝗿𝗶𝘀𝘁𝘂𝘀 𝗙𝗼𝗿𝗸\n━━━━━━━━━\n\n";

module.exports = {
  config: {
    name: "fork",
    aliases: ["repo", "source"],
    version: "2.0",
    author: "Christus",
    countDown: 3,
    role: 0,
    longDescription: { fr: "Renvoie le lien du dépôt officiel du bot." },
    category: "system",
    guide: { fr: "{pn}" }
  },

  onStart: async function ({ message }) {
    const text =
      `${HEADER}✅ Voici le dépôt officiel :\n\n` +
      `\n\n` +
      `Continue à nous soutenir ^_^`;

    message.reply(text);
  }
};
