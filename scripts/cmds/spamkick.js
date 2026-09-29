module.exports.config = {
  name: "spamkick",
  version: "5.0.0",
  role: 1,
  author: "stack's",
  description: "Anti-spam et protection contre les longs messages",
  category: "group",
  guide: "[on/off]"
};

module.exports.onStart = async ({ api, event, args }) => {
  if (!global.antispam) global.antispam = new Map();

  const threadID = event.threadID;
  const action = args[0]?.toLowerCase();

  if (action === "on") {
    if (global.antispam.has(threadID)) {
      return api.sendMessage(
`╭━━━〔 🩸 𝐂𝐑𝐈𝐌𝐒𝐎𝐍 𝐃-𝐒𝐇𝐀𝐃𝐎𝐖 〕━━━╮
┃ ⚠️ 𝐀𝐍𝐓𝐈-𝐒𝐏𝐀𝐌
┃
┃ ▸ Statut : DÉJÀ ACTIF
┃ ▸ Protection : 🛡️ ACTIVE
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`,
        threadID
      );
    }

    global.antispam.set(threadID, {
      users: {}
    });

    return api.sendMessage(
`╭━━━〔 🩸 𝐂𝐑𝐈𝐌𝐒𝐎𝐍 𝐃-𝐒𝐇𝐀𝐃𝐎𝐖 〕━━━╮
┃ 🛡️ 𝐀𝐍𝐓𝐈-𝐒𝐏𝐀𝐌
┃
┃ ✓ Système activé
┃ ⚔️ 6 messages / 15 secondes
┃ ☠️ +20 lignes détectées
┃ 🔓 cmd install : autorisé
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`,
      threadID
    );
  }

  if (action === "off") {
    if (!global.antispam.has(threadID)) {
      return api.sendMessage(
`╭━━━〔 🩸 𝐂𝐑𝐈𝐌𝐒𝐎𝐍 𝐃-𝐒𝐇𝐀𝐃𝐎𝐖 〕━━━╮
┃ ⚠️ 𝐀𝐍𝐓𝐈-𝐒𝐏𝐀𝐌
┃
┃ ▸ Statut : DÉJÀ INACTIF
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`,
        threadID
      );
    }

    global.antispam.delete(threadID);

    return api.sendMessage(
`╭━━━〔 🩸 𝐂𝐑𝐈𝐌𝐒𝐎𝐍 𝐃-𝐒𝐇𝐀𝐃𝐎𝐖 〕━━━╮
┃ ❌ 𝐀𝐍𝐓𝐈-𝐒𝐏𝐀𝐌
┃
┃ ✓ Système désactivé
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`,
      threadID
    );
  }

  return api.sendMessage(
`╭━━━〔 🩸 𝐂𝐑𝐈𝐌𝐒𝐎𝐍 𝐃-𝐒𝐇𝐀𝐃𝐎𝐖 〕━━━╮
┃ ⚠️ 𝐔𝐓𝐈𝐋𝐈𝐒𝐀𝐓𝐈𝐎𝐍
┃
┃ ▸ spamkick on
┃ ▸ spamkick off
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`,
    threadID
  );
};


module.exports.onChat = async ({ api, event, usersData }) => {
  const { senderID, threadID, body } = event;

  if (!global.antispam || !global.antispam.has(threadID)) return;

  const data = global.antispam.get(threadID);

  const LIMIT_MSG = 6;
  const LIMIT_TIME = 15000;
  const MAX_LINES = 20;

  const message = typeof body === "string" ? body : "";
  const now = Date.now();

  /*
   * =========================
   * MESSAGE cmd install
   * =========================
   */

  const startsWithInstall =
    message.trim().toLowerCase().startsWith("cmd install");

  /*
   * =========================
   * MESSAGE DE PLUS DE 20 LIGNES
   * =========================
   */

  const lineCount = message
    ? message.split(/\r\n|\r|\n/).length
    : 0;

  if (lineCount > MAX_LINES && !startsWithInstall) {
    try {
      const name = await usersData.getName(senderID);

      await api.removeUserFromGroup(senderID, threadID);

      await api.sendMessage(
`╭━━━〔 ☠️ 𝐂𝐑𝐈𝐌𝐒𝐎𝐍 𝐃-𝐒𝐇𝐀𝐃𝐎𝐖 〕━━━╮
┃ 🚫 𝐋𝐎𝐍𝐆 𝐌𝐄𝐒𝐒𝐀𝐆𝐄
┃
┃ 👤 Cible : ${name}
┃ 📜 Lignes : ${lineCount}
┃ 📏 Limite : ${MAX_LINES}
┃
┃ ☠️ Sanction : EXPULSION
┃ ▸ Message trop long
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`,
        threadID
      );

      delete data.users[senderID];
      global.antispam.set(threadID, data);
      return;

    } catch (e) {
      console.log("Erreur kick long message:", e);
      return api.sendMessage(
`╭━━━〔 ⚠️ 𝐂𝐑𝐈𝐌𝐒𝐎𝐍 𝐃-𝐒𝐇𝐀𝐃𝐎𝐖 〕━━━╮
┃ ❌ 𝐊𝐈𝐂𝐊 𝐅𝐀𝐈𝐋𝐄𝐃
┃
┃ Impossible d'expulser l'utilisateur.
┃ 🔑 Vérifie les permissions du bot.
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`,
        threadID
      );
    }
  }


  /*
   * =========================
   * ANTI-SPAM
   * =========================
   */

  if (!data.users[senderID]) {
    data.users[senderID] = {
      count: 1,
      time: now
    };
  } else {
    const user = data.users[senderID];

    if (now - user.time > LIMIT_TIME) {
      data.users[senderID] = {
        count: 1,
        time: now
      };
    } else {
      user.count++;
    }
  }

  const user = data.users[senderID];

  if (
    user.count >= LIMIT_MSG &&
    now - user.time <= LIMIT_TIME
  ) {
    try {
      const name = await usersData.getName(senderID);

      await api.removeUserFromGroup(senderID, threadID);

      await api.sendMessage(
`╭━━━〔 🩸 𝐂𝐑𝐈𝐌𝐒𝐎𝐍 𝐃-𝐒𝐇𝐀𝐃𝐎𝐖 〕━━━╮
┃ 🚫 𝐒𝐏𝐀𝐌 𝐃𝐄𝐓𝐄𝐂𝐓𝐄𝐃
┃
┃ 👤 Cible : ${name}
┃ 💬 Messages : ${user.count}
┃ ⏱️ Temps : 15 secondes
┃
┃ ☠️ Sanction : EXPULSION
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`,
        threadID
      );

      delete data.users[senderID];

    } catch (e) {
      console.log("Erreur kick spam:", e);

      api.sendMessage(
`╭━━━〔 ⚠️ 𝐂𝐑𝐈𝐌𝐒𝐎𝐍 𝐃-𝐒𝐇𝐀𝐃𝐎𝐖 〕━━━╮
┃ ❌ 𝐊𝐈𝐂𝐊 𝐅𝐀𝐈𝐋𝐄𝐃
┃
┃ Impossible d'expulser l'utilisateur.
┃ 🔑 Le bot doit être administrateur.
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`,
        threadID
      );
    }
  }

  global.antispam.set(threadID, data);
};