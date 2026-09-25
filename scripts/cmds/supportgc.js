module.exports = {
  config: {
    name: "supportgc",
    version: "1.4",
    author: "CRIMSON 🪽",
    countDown: 30,
    role: 0,
    shortDescription: {
      en: "Add user to support group"
    },
    longDescription: {
      en: "Adds you directly to the official admin support group!"
    },
    category: "support",
    guide: {
      en: "Type {pref}supportgc to join the group!"
    }
  },

  onStart: async function ({ api, event }) {
    const supportGroupId = "2311426919273668";
    const { threadID, senderID } = event;

    // Structure visuelle
    const borderTop = "╭─── 🩵 𝐒𝐔𝐏𝐏𝐎𝐑𝐓 𝐙𝐎𝐍𝐄 🪽 ───╮\n";
    const borderBottom = "\n╰─────────────────────────────╯";

    // Récupération du nom de l'utilisateur
    let userName = "Ami(e)";
    try {
      const userInfo = await api.getUserInfo(senderID);
      if (userInfo && userInfo[senderID]) {
        userName = userInfo[senderID].name || "Ami(e)";
      }
    } catch (e) {
      console.error("Erreur récuperation nom utilisateur:", e);
    }

    // 5 variations dynamiques incluant le nom ({name})
    const successMessages = [
      `🎉 𝐘𝐀𝐀𝐀𝐒𝐒𝐒 ! Hey ${userName}, tu viens de rejoindre le groupe ! Fonce vérifier tes messages ou tes spams !`,
      `✨ 𝐇𝐘𝐏𝐄 ! L'invitation est envoyée, ${userName} ! Check vite tes requêtes de message !`,
      `🩵 𝐂'𝐄𝐒𝐓 𝐅𝐀𝐈𝐓 ! Je t'ai ajouté au support, ${userName}. Regarde dans tes spams si tu ne le vois pas !`,
      `🚀 𝐄𝐍𝐕𝐎𝐘É ! Bienvenue dans la zone admin, ${userName} ! Va jeter un œil à ta boîte de réception !`,
      `💫 𝐏𝐀𝐑𝐅𝐀𝐈𝐓 ! Tu es officiellement invité(e), ${userName} ! Check tes demandes de messages !`
    ];

    const alreadyInMessages = [
      `🚨 𝐎𝐏𝐏𝐒 ! Mais ${userName}, tu es déjà dans le groupe ! Va checker tes spams si tu ne trouves pas la conv' !`,
      `👀 𝐀𝐓𝐓𝐄𝐍𝐃𝐒... ${userName}, tu fais déjà partie de l'équipe ! Regarde bien dans tes requêtes de message.`,
      `⚠️ 𝐃É𝐉À 𝐋À ! Inutile d'insister ${userName}, tu es déjà dans la liste ! Check tes notifications !`,
      `🔍 𝐇𝐄𝐘 ${userName} ! Tu y es déjà ! Si la boîte n'apparaît pas, inspecte tes spams ou messages filtrés.`,
      `🤍 𝐑𝐄𝐋𝐀𝐗 ! Ton nom est déjà inscrit dans le groupe, ${userName}. Va faire un tour dans tes invits !`
    ];

    const errorMessages = [
      `💔 𝐎𝐎𝐏𝐒... Désolé ${userName}, impossible de t'ajouter ! Ton compte est sûrement privé ou tes réglages bloquent les invits.`,
      `📉 𝐄𝐑𝐑𝐄𝐔𝐑 ! Ça n'a pas marché, ${userName}... Assure-toi de m'ajouter en ami d'abord !`,
      `❌ 𝐁𝐋𝐎𝐐𝐔É ! Désolé ${userName}, soit tes paramètres de confidentialité bloquent, soit ton ID refuse les invits !`,
      `🚧 𝐈𝐌𝐏𝐎𝐒𝐒𝐈𝐁𝐋𝐄 ! Le système rejette l'ajout. ${userName}, ajoute-moi en ami puis réessaye !`,
      `🌧️ 𝐎𝐔𝐏𝐒 ! Un problème s'est produit, ${userName}. Vérifie tes restrictions de compte et retente ta chance !`
    ];

    // Fonction de sélection aléatoire
    const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

    try {
      const threadInfo = await api.getThreadInfo(supportGroupId);
      const participantIDs = threadInfo.participantIDs || [];

      if (participantIDs.includes(senderID)) {
        return api.sendMessage(
          `${borderTop}│ ${getRandom(alreadyInMessages)}${borderBottom}`,
          threadID
        );
      }

      await api.addUserToGroup(senderID, supportGroupId);

      return api.sendMessage(
        `${borderTop}│ ${getRandom(successMessages)}${borderBottom}`,
        threadID
      );

    } catch (error) {
      console.error("SupportGC Command Error:", error);

      return api.sendMessage(
        `${borderTop}│ ${getRandom(errorMessages)}${borderBottom}`,
        threadID
      );
    }
  }
};
