module.exports = {
  config: {
    name: "supportgc",
    version: "1.5",
    author: "CRIMSON 🪽",
    countDown: 10,
    role: 0,
    shortDescription: { en: "Add user to support group" },
    longDescription: { en: "Adds you directly to the official admin support group!" },
    category: "support",
    guide: { en: "Type {pref}supportgc to join the group!" }
  },

  onStart: async function ({ api, event }) {
    const supportGroupId = "2311426919273668";
    const { threadID, senderID } = event;

    const borderTop = "╭─── 🩵 𝐒𝐔𝐏𝐏𝐎𝐑𝐓 𝐙𝐎𝐍𝐄 🪽 ───╮\n";
    const borderBottom = "\n╰─────────────────────────────╯";

    const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

    let userName = "Ami(e)";
    try {
      const userInfo = await api.getUserInfo(senderID);
      if (userInfo && userInfo[senderID]) {
        userName = userInfo[senderID].name || "Ami(e)";
      }
    } catch (e) {
      console.error("[SupportGC] Warning: Impossible de récupérer le nom.", e.message);
    }

    const successMessages = [
      `🎉 𝐘𝐀𝐀𝐀𝐒𝐒𝐒 ! Hey ${userName}, tu viens de rejoindre le groupe ! Check tes messages ou spams !`,
      `✨ 𝐇𝐘𝐏𝐄 ! L'invitation est envoyée, ${userName} ! Check vite tes requêtes !`
    ];

    const alreadyInMessages = [
      `🚨 𝐎𝐏𝐏𝐒 ! ${userName}, tu es déjà dans le groupe ! Va checker tes spams si tu ne le vois pas.`
    ];

    const errorMessages = [
      `💔 𝐎𝐎𝐏𝐒... Impossible de t'ajouter ${userName}. Ton compte est privé ou tes réglages bloquent les invits.`
    ];

    try {
      // 1. Vérification de présence dans le groupe
      const threadInfo = await api.getThreadInfo(supportGroupId);
      const participantIDs = (threadInfo.participantIDs || []).map(id => String(id));

      if (participantIDs.includes(String(senderID))) {
        return api.sendMessage(
          `${borderTop}│ ${getRandom(alreadyInMessages)}${borderBottom}`,
          threadID
        );
      }

      // 2. Tentative d'ajout (Format sécurisé string / tableau selon wrapper)
      await api.addUserToGroup(String(senderID), String(supportGroupId));

      return api.sendMessage(
        `${borderTop}│ ${getRandom(successMessages)}${borderBottom}`,
        threadID
      );

    } catch (error) {
      console.error("[SupportGC Error]:", error);

      return api.sendMessage(
        `${borderTop}│ ${getRandom(errorMessages)}${borderBottom}`,
        threadID
      );
    }
  }
};
