module.exports = {
  config: {
    name: "unsend",
    aliases: ["Ef", "R", "U"],
    version: "1.4",
    author: "CRIMSON 🩵🪽",
    countDown: 2,
    role: 0,
    shortDescription: {
      en: "Unsend bot's message"
    },
    longDescription: {
      en: "Reply to any message sent by the bot to unsend it!"
    },
    category: "box chat",
    guide: {
      en: "Reply to the bot's message and type {pref}unsend, {pref}Ef, {pref}R, or {pref}U"
    }
  },

  onStart: async function ({ message, event, api }) {
    const { senderID, messageReply } = event;
    const botID = api.getCurrentUserID();

    // En-tête et pied de page décoratifs
    const borderTop = "╭─── 🩵 𝐔𝐍𝐒𝐄𝐍𝐃 𝐙𝐎𝐍𝐄 ───╮\n";
    const borderBottom = "\n╰─────────────────────────────╯";

    // Récupération du nom de l'utilisateur
    let userName = "Ami(e)";
    try {
      const userInfo = await api.getUserInfo(senderID);
      if (userInfo && userInfo[senderID]) {
        userName = userInfo[senderID].name || "Ami(e)";
      }
    } catch (e) {
      console.error("Erreur récupération nom:", e);
    }

    // Fonction de sélection aléatoire
    const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

    // 20 variations pour les erreurs (quand l'utilisateur ne répond pas à un message du bot)
    const syntaxErrorMessages = [
      `🚨 𝐎𝐏𝐏𝐒 ! Voyons ${userName}, tu dois REPONDRE à un de mes messages pour que je le supprime !`,
      `👀 𝐇𝐄𝐘 ${userName} ! Réponds directement au message que tu veux me faire effacer !`,
      `❌ 𝐌𝐈𝐒𝐒𝐈𝐎𝐍 𝐅𝐀𝐈𝐋𝐄𝐃 ! ${userName}, je ne peux supprimer que MES propres messages. Réponds-moi !`,
      `🔍 𝐀𝐓𝐓𝐄𝐍𝐃𝐒... ${userName}, tu n'as sélectionné aucun message de moi à geler !`,
      `⚠️ 𝐌𝐎𝐃𝐄 𝐌𝐀𝐍𝐔𝐄𝐋 ! Fais un 'reply' sur le message du bot que tu veux retirer, ${userName} !`,
      `🛑 𝐒𝐓𝐎𝐏 ${userName} ! Je ne devine pas les messages, réponds au bon message d'abord !`,
      `💭 𝐄𝐔𝐇... ${userName}, tu me parles dans le vide ! Cible un de mes messages à supprimer !`,
      `📢 𝐀𝐓𝐓𝐄𝐍𝐓𝐈𝐎𝐍 ${userName} ! Sélectionne le message du bot en répondant dessus !`,
      `🙅‍♂️ 𝐍𝐎𝐏𝐄 ${userName} ! Impossible de supprimer si tu ne réponds pas à un de mes textes !`,
      `🤷‍♂️ 𝐁𝐀𝐒𝐈𝐐𝐔𝐄 ! ${userName}, fais 'Répondre' sur le message ciblé et relance la commande !`,
      `🤦‍♂️ 𝐎𝐔𝐏𝐒 ! Tu as oublié de cibler mon message, ${userName} ! Réessaye en répondant dessus !`,
      `🔒 𝐈𝐌𝐏𝐎𝐒𝐒𝐈𝐁𝐋𝐄 ! ${userName}, je ne touche pas aux messages des autres membres !`,
      `💥 𝐄𝐑𝐑𝐄𝐔𝐑 ! ${userName}, il faut que ce soit un de MES messages que tu vises !`,
      `❌ 𝐑𝐄𝐅𝐔𝐒É ! Réponds d'abord à la bulle de texte du bot, ${userName} !`,
      `🧐 𝐎Ù  Ça ? ${userName}, réponds précisément au message à faire disparaître !`,
      `🏷️ 𝐂𝐈𝐁𝐋𝐄 𝐌𝐀𝐍𝐐𝐔𝐀𝐍𝐓𝐄 ! ${userName}, utilise la fonction réponse sur mon message !`,
      `🚫 𝐏𝐀𝐒 𝐂𝐎𝐌𝐌𝐄  Ça ! ${userName}, tu dois pointer sur un message envoyé par moi !`,
      `⚠️ 𝐑𝐄𝐏𝐋𝐘 𝐑𝐄𝐐𝐔𝐈𝐒 ! Cible mon message d'abord, ${userName} !`,
      `🔴 𝐀𝐋𝐄𝐑𝐓𝐄 ! ${userName}, tu as lancé la commande sans répondre à mon message !`,
      `⚡ 𝐑𝐄𝐓𝐄𝐍𝐓𝐄 ! Fais glisser le message du bot pour y répondre, ${userName} !`
    ];

    // Vérification : Réponse valide à un message du bot
    if (!messageReply || messageReply.senderID !== botID) {
      return message.reply(
        `${borderTop}│ ${getRandom(syntaxErrorMessages)}${borderBottom}`
      );
    }

    // 20 variations pour le succès d'effacement
    const successMessages = [
      `✨ 𝐏𝐎𝐎𝐅 ! Hop là ${userName}, message disparu ni vu ni connu ! 🪄`,
      `💫 𝐇𝐎𝐔𝐏𝐒 ! Message effacé avec succès pour toi, ${userName} !`,
      `💨 𝚫𝐏𝐏𝐀𝐑𝐈𝐓𝐈𝐎𝐍... Et voilà ! Message nettoyé, ${userName} !`,
      `🤍 𝐂'𝐄𝐒𝐓 𝐅𝐀𝐈𝐓 ! Le message a été supprimé comme tu l'as demandé, ${userName} !`,
      `🚀 𝐙𝐀𝐏 ! C'est bon ${userName}, trace effacée ! 🩵`,
      `🧹 𝐍𝐄𝐓𝐓𝐎𝐘𝐀𝐆𝐄 ! Message supprimé du chat, ${userName} !`,
      `🗑️ 𝐏𝐎𝐔𝐁𝐄𝐋𝐋𝐄 ! C'est parti à la trappe, ${userName} !`,
      `⚡ 𝐄𝐗𝐏𝐑𝐄𝐒𝐒 ! Effacement terminé en un éclair, ${userName} !`,
      `🪄 𝐌𝐀𝐆𝐈𝐄 ! Il n'y a plus rien à voir ici, ${userName} !`,
      `🩵 𝐎𝐊 ! C'est réglé, message retiré, ${userName} !`,
      `🥷 𝐍𝐈𝐍𝐉𝐀 ! Supprimé en toute discrétion pour toi, ${userName} !`,
      `☁️ 𝐄𝐕𝐀𝐏𝐎𝐑É ! Le message s'est envolé, ${userName} !`,
      `🫧 𝐁𝐔𝐁𝐁𝐋𝐄 ! Et paf, message éclaté, ${userName} !`,
      `🎯 𝐓𝐀𝐑𝐆𝐄𝐓 𝐂𝐋𝐄𝐀𝐑 ! Message supprimé avec succès, ${userName} !`,
      `🔥 𝐂𝐑𝐀𝐌É ! Plus aucune trace de ce message, ${userName} !`,
      `🕊️ 𝐄𝐍𝐕𝐎𝐋É ! C'est bon ${userName}, le texte est parti !`,
      `👑 𝐎𝐑𝐃𝐑𝐄 𝐄𝐗É𝐂𝐔𝐓É ! J'ai retiré mon message, ${userName} !`,
      `💎 𝐍𝐈𝐂𝐄 ! Opération suppression réussie, ${userName} !`,
      `🪽 𝐅𝐋𝐘 ! Message effacé sans laisser de traces, ${userName} !`,
      `🖤 𝐃𝐎𝐍𝐄 ! Le message est hors de vue, ${userName} !`
    ];

    try {
      await api.unsendMessage(messageReply.messageID);

      return message.reply(
        `${borderTop}│ ${getRandom(successMessages)}${borderBottom}`
      );
    } catch (error) {
      console.error("Unsend Command Error:", error);
      return message.reply(
        `${borderTop}│ 💔 𝐎𝐎𝐏𝐒 ${userName}... Impossible de supprimer ce message. Il est peut-être trop vieux !${borderBottom}`
      );
    }
  }
};
