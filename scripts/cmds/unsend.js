module.exports = {
  config: {
    name: "unsend",
    version: "1.0.3",
    author: "Brayan",
    aliases: ["u", "r", "ef"],
    countDown: 2,
    role: 0,
    shortDescription: {
      fr: "Supprime un message du bot"
    },
    longDescription: {
      fr: "Réponds au message du bot que tu souhaites supprimer avec cette commande."
    },
    category: "system",
    guide: {
      fr: " [Répondre au message du bot avec : !unsend, !u, !r ou !ef]"
    }
  },

  onStart: async function ({ api, event, message }) {
    // 1. Vérifie si l'utilisateur a bien répondu à un message
    if (!event.messageReply) {
      return message.reply("❌ Tu dois répondre (reply) au message du bot que tu veux supprimer !");
    }

    // 2. Vérifie si le message ciblé appartient bien au bot
    if (event.messageReply.senderID !== api.getCurrentUserID()) {
      return message.reply("⚠️ Je ne peux supprimer que mes propres messages !");
    }

    // 3. Exécute la suppression du message
    return api.unsendMessage(event.messageReply.messageID, (err) => {
      if (err) {
        return message.reply("❌ Impossible de supprimer ce message (il est peut-être trop ancien).");
      }
    });
  }
};
