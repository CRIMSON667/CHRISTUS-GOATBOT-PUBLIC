module.exports = {
  config: {
    name: "pending",
    version: "0.0.7",
    author: "Azadx69x",
    countDown: 5,
    role: 1,

    shortDescription: {
      vi: "Quản lý nhóm đang chờ phê duyệt",
      en: "Manage pending group approvals",
      fr: "Gérer les groupes en attente d'approbation"
    },

    longDescription: {
      vi: "Lệnh quản trị để xem, chấp nhận hoặc từ chối các nhóm đang chờ tham gia bot",
      en: "Admin command to view, approve or reject groups waiting to add the bot",
      fr:
        "Commande admin permettant de voir, accepter ou refuser les groupes en attente d'approbation.\n\n" +
        "• /pending - Afficher les groupes en attente\n" +
        "• Répondre avec des numéros - Accepter les groupes\n" +
        "• Répondre avec 'c' + numéros - Refuser les groupes"
    },

    category: "Admin",

    guide: {
      vi: {
        body: "{pn}: Xem danh sách nhóm đang chờ\n{pn} [số | c/số]: Phê duyệt/từ chối nhóm"
      },

      en: {
        body: "{pn}: View pending groups list\n{pn} [number | c/number]: Approve/reject groups"
      },

      fr: {
        body:
          "{pn}: Voir la liste des groupes en attente\n" +
          "{pn} [numéro | c/numéro]: Accepter/refuser les groupes"
      }
    }
  },

  langs: {
    fr: {
      header: "🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨",
      line: "━━━━━━━━━━━━━━━━━━━━━━",

      invaildNumber:
        "❌ Le numéro %1 n'est pas valide !",

      cancelSuccess:
        "💔 %1 groupe(s) refusé(s) avec succès !",

      approveSuccess:
        "✅ %1 groupe(s) approuvé(s) avec succès !",

      cantGetPendingList:
        "❌ Impossible de récupérer la liste des groupes en attente !",

      returnListPending:
        "📋 『𝗚𝗥𝗢𝗨𝗣𝗘𝗦 𝗘𝗡 𝗔𝗧𝗧𝗘𝗡𝗧𝗘』\n" +
        "┣✦ Total : %1 groupe(s)\n" +
        "┣✦ Réponds avec les numéros pour accepter\n" +
        "┣✦ Utilise 'c' avant les numéros pour refuser\n" +
        "┗✦ Exemple : 1 2 3 ou c1 c2\n\n" +
        "%2",

      returnListClean:
        "📭 『𝗣𝗘𝗡𝗗𝗜𝗡𝗚』\n\n" +
        "✨ Aucun groupe n'est actuellement en attente !",

      syntaxError:
        "⚠️ 『𝗦𝗬𝗡𝗧𝗔𝗫𝗘 𝗜𝗡𝗖𝗢𝗥𝗥𝗘𝗖𝗧𝗘』\n\n" +
        "• 🔹 Numéros pour accepter : 1 2 3\n" +
        "• 🔸 c + numéros pour refuser : c1 c2",

      noPermission:
        "🚫 Tu n'as pas la permission d'utiliser cette commande !"
    },

    en: {
      header: "🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨",
      line: "━━━━━━━━━━━━━━━━━━━━━━",

      invaildNumber:
        "❌ %1 is not a valid number!",

      cancelSuccess:
        "✅ Successfully refused %1 thread(s)!",

      approveSuccess:
        "✅ Successfully approved %1 thread(s)!",

      cantGetPendingList:
        "❌ Can't get the pending list!",

      returnListPending:
        "📋 『𝗣𝗘𝗡𝗗𝗜𝗡𝗚 𝗟𝗜𝗦𝗧』\n" +
        "┣✦ Total threads: %1\n" +
        "┣✦ Reply with numbers to approve\n" +
        "┣✦ Use 'c' before numbers to cancel\n" +
        "┗✦ Example: 1 2 3 or c1 c2\n\n" +
        "%2",

      returnListClean:
        "📭 『𝗣𝗘𝗡𝗗𝗜𝗡𝗚』\n\n" +
        "✨ There are no pending groups at the moment!",

      syntaxError:
        "⚠️ 『𝗜𝗡𝗩𝗔𝗟𝗜𝗗 𝗦𝗬𝗡𝗧𝗔𝗫』\n\n" +
        "• 🔹 Numbers to approve: 1 2 3\n" +
        "• 🔸 c + numbers to cancel: c1 c2",

      noPermission:
        "🚫 You don't have permission to use this command!"
    },

    vi: {
      header: "🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨",
      line: "━━━━━━━━━━━━━━━━━━━━━━",

      invaildNumber:
        "❌ %1 không phải là số hợp lệ!",

      cancelSuccess:
        "💔 Đã từ chối %1 nhóm!",

      approveSuccess:
        "✅ Đã phê duyệt thành công %1 nhóm!",

      cantGetPendingList:
        "❌ Không thể lấy danh sách đang chờ!",

      returnListPending:
        "📋 『𝗗𝗔𝗡𝗛 𝗦Á𝗖𝗛 𝗖𝗛Ờ』\n" +
        "┣✦ Tổng số nhóm: %1\n" +
        "┣✦ Phản hồi bằng số để chấp nhận\n" +
        "┣✦ Dùng 'c' trước số để từ chối\n" +
        "┗✦ Ví dụ: 1 2 3 hoặc c1 c2\n\n" +
        "%2",

      returnListClean:
        "📭 『𝗗𝗔𝗡𝗛 𝗦Á𝗖𝗛 𝗖𝗛Ờ』\n\n" +
        "✨ Hiện không có nhóm nào đang chờ!",

      syntaxError:
        "⚠️ 『𝗟Ỗ𝗜 𝗖Ú 𝗣𝗛Á𝗣』\n\n" +
        "• 🔹 Số để chấp nhận: 1 2 3\n" +
        "• 🔸 c + số để từ chối: c1 c2",

      noPermission:
        "🚫 Bạn không có quyền sử dụng lệnh này!"
    }
  },

  onReply: async function ({
    api,
    event,
    Reply,
    getLang,
    commandName
  }) {
    if (String(event.senderID) !== String(Reply.author))
      return;

    const { body, threadID, messageID } = event;
    let count = 0;

    if (
      body.toLowerCase() === "help" ||
      body === "?"
    ) {
      return api.sendMessage(
        `${getLang("header")}\n` +
        `${getLang("line")}\n\n` +
        getLang("syntaxError"),
        threadID,
        messageID
      );
    }

    if (
      (isNaN(body) &&
        body.toLowerCase().startsWith("c")) ||
      body.toLowerCase().startsWith("cancel")
    ) {
      let indexStr = body
        .toLowerCase()
        .replace("cancel", "")
        .replace("c", "")
        .trim();

      if (!indexStr) {
        return api.sendMessage(
          getLang("syntaxError"),
          threadID,
          messageID
        );
      }

      const index = indexStr.split(/\s+/);

      for (const i of index) {
        if (
          isNaN(i) ||
          i <= 0 ||
          i > Reply.pending.length
        ) {
          return api.sendMessage(
            getLang("invaildNumber", i),
            threadID,
            messageID
          );
        }

        try {
          await api.removeUserFromGroup(
            api.getCurrentUserID(),
            Reply.pending[i - 1].threadID
          );

          count++;
        } catch (e) {
          console.error(
            "Error removing from group:",
            e
          );
        }
      }

      return api.sendMessage(
        getLang("cancelSuccess", count),
        threadID,
        messageID
      );
    }

    else {
      const index = body.split(/\s+/);

      for (const i of index) {
        if (
          isNaN(i) ||
          i <= 0 ||
          i > Reply.pending.length
        ) {
          return api.sendMessage(
            getLang("invaildNumber", i),
            threadID,
            messageID
          );
        }

        const targetThread =
          Reply.pending[i - 1].threadID;

        try {
          const threadInfo =
            await api.getThreadInfo(targetThread);

          const groupName =
            threadInfo.threadName ||
            "Groupe sans nom";

          const memberCount =
            threadInfo.participantIDs
              ? threadInfo.participantIDs.length
              : 0;

          const time =
            new Date().toLocaleString(
              "fr-FR",
              {
                timeZone: "Africa/Kinshasa"
              }
            );

          await api.sendMessage(
`╔══════════════════════╗
║  🎀 𝗠𝗔𝗥𝗜𝗡 𝗞𝗜𝗧𝗔𝗚𝗔𝗪𝗔
╠══════════════════════╣
║
║ 📁 𝗚𝗥𝗢𝗨𝗣𝗘 : ${groupName}
║ 👥 𝗠𝗘𝗠𝗕𝗥𝗘𝗦 : ${memberCount}
║ ⚡ 𝗔𝗣𝗣𝗥𝗢𝗕𝗔𝗧𝗜𝗢𝗡 : ${threadInfo.approvalMode ? "𝗢𝗡" : "𝗢𝗙𝗙"}
║ 😀 𝗘𝗠𝗢𝗝𝗜 : ${threadInfo.emoji || "𝗔𝗨𝗖𝗨𝗡"}
║ 🕐 𝗝𝗢𝗜𝗡𝗧 : ${time}
║
╚══════════════════════╝

🎀 𝗕𝗢𝗧 𝗔𝗖𝗧𝗜𝗩𝗘́ !

✨ Merci de m'avoir ajoutée dans ce groupe.
💖 Amusez-vous bien avec les commandes !`,
            targetThread
          );

          count++;

        } catch (error) {
          console.error(
            "Error approving group:",
            error
          );
        }
      }

      return api.sendMessage(
        getLang("approveSuccess", count),
        threadID,
        messageID
      );
    }
  },

  onStart: async function ({
    api,
    event,
    getLang,
    commandName
  }) {
    const {
      threadID,
      messageID,
      senderID
    } = event;

    const botID =
      api.getCurrentUserID();

    if (senderID !== botID) {
      try {
        const threadInfo =
          await api.getThreadInfo(threadID);

        const isAdmin =
          threadInfo.adminIDs &&
          threadInfo.adminIDs.some(
            admin =>
              admin.id === senderID
          );

        if (!isAdmin) {
          return api.sendMessage(
            getLang("noPermission"),
            threadID,
            messageID
          );
        }

      } catch (e) {
        console.error(
          "Error checking admin:",
          e
        );

        return api.sendMessage(
          getLang("noPermission"),
          threadID,
          messageID
        );
      }
    }

    let msg = "";
    let index = 1;

    try {
      const spam =
        await api.getThreadList(
          100,
          null,
          ["OTHER"]
        ) || [];

      const pending =
        await api.getThreadList(
          100,
          null,
          ["PENDING"]
        ) || [];

      const list = [
        ...spam,
        ...pending
      ].filter(
        group =>
          group.isSubscribed &&
          group.isGroup
      );

      if (list.length === 0) {
        return api.sendMessage(
          getLang("returnListClean"),
          threadID,
          messageID
        );
      }

      for (const item of list) {
        const groupName =
          item.name ||
          "Groupe sans nom";

        msg +=
          `┣ ${index++}. ${groupName}\n` +
          `┃ ┗ 🆔 ${item.threadID}\n`;
      }

      const responseMsg =
        `${getLang("header")}\n` +
        `${getLang("line")}\n\n` +
        getLang(
          "returnListPending",
          list.length,
          msg
        );

      return api.sendMessage(
        responseMsg,
        threadID,
        (err, info) => {
          if (err)
            return console.error(err);

          global.GoatBot.onReply.set(
            info.messageID,
            {
              commandName,
              messageID: info.messageID,
              author: event.senderID,
              pending: list
            }
          );
        },
        messageID
      );

    } catch (e) {
      console.error(
        "Error pending command:",
        e
      );

      return api.sendMessage(
        getLang("cantGetPendingList"),
        threadID,
        messageID
      );
    }
  }
};