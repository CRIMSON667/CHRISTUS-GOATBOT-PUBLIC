const os = require("os");

module.exports = {

  config: {
    name: "uptime",
    aliases: ["up", "upt"],
    version: "6.1",
    author: "Crimson",
    countDown: 5,
    role: 0,

    shortDescription: {
      fr: "Affiche les statistiques complètes du bot"
    },

    category: "info"
  },


  onStart: async function ({ message }) {

    const adminName = "Crimson Administration";

    // 🌸 Images Marin
    const images = [
      "https://i.ibb.co/FqxFFdsN/724445663-994099853547199-5777702525822511869-n-jpg-stp-dst-jpg-s480x480-tt6-nc-cat-110-ccb-1-7-nc.jpg",
      "https://i.ibb.co/xqDXzMfF/728490763-1429022605913776-7295616967194994570-n-jpg-stp-dst-jpg-p480x480-tt6-nc-cat-107-ccb-1-7-n.jpg",
      "https://i.ibb.co/jZgyKGGn/541586638-1960318068060545-1824596428901731723-n-jpg-stp-dst-jpg-s480x480-tt6-nc-cat-102-ccb-1-7-n.jpg"
    ];

    const uptime = process.uptime();

    const d = Math.floor(uptime / 86400);
    const h = Math.floor((uptime % 86400) / 3600);
    const m = Math.floor((uptime % 3600) / 60);
    const s = Math.floor(uptime % 60);


    // ⚡ Mémoire
    const memory = process.memoryUsage();

    const ram = Math.round(
      memory.rss / 1024 / 1024
    );

    const heapUsed = Math.round(
      memory.heapUsed / 1024 / 1024
    );

    const heapTotal = Math.round(
      memory.heapTotal / 1024 / 1024
    );


    // 📦 Commandes
    const commands =
      global.GoatBot?.commands?.size || 0;


    // 🖥️ Informations système
    const platform = os.platform();
    const arch = os.arch();
    const node = process.version;


    // ⚡ Ping interne
    const start = Date.now();

    // Petit traitement pour mesurer le temps local
    await Promise.resolve();

    const ping = Date.now() - start;


    const body = `
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
        🌸 𝐌𝐀𝐑𝐈𝐍 𝐊𝐈𝐓𝐀𝐆𝐀𝐖𝐀 🌸
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

        ✨ 𝐁𝐎𝐓 𝐒𝐘𝐒𝐓𝐄𝐌 ✨

╭─「 🤖 𝐒𝐓𝐀𝐓𝐔𝐒 」
│
│ 🟢 𝐄́𝐭𝐚𝐭       : En ligne
│ ⚡ 𝐏𝐢𝐧𝐠       : ${ping} ms
│ ⏱️ 𝐔𝐩𝐭𝐢𝐦𝐞     : ${d}j ${h}h ${m}m ${s}s
│
╰─────────────────────────────╯

╭─「 📦 𝐁𝐎𝐓 」
│
│ 📚 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐞𝐬 : ${commands}
│ 👑 𝐀𝐝𝐦𝐢𝐧      : ${adminName}
│ 🌸 𝐌𝐨𝐝𝐞       : Marin Kitagawa AI
│
╰─────────────────────────────╯

╭─「 💾 𝐑𝐄𝐒𝐒𝐎𝐔𝐑𝐂𝐄𝐒 」
│
│ 🧠 𝐑𝐀𝐌        : ${ram} MB
│ 📊 𝐇𝐞𝐚𝐩       : ${heapUsed}/${heapTotal} MB
│
╰─────────────────────────────╯

╭─「 🖥️ 𝐒𝐘𝐒𝐓𝐄̀𝐌𝐄 」
│
│ 💻 𝐏𝐥𝐚𝐭𝐟𝐨𝐫𝐦   : ${platform}
│ ⚙️ 𝐀𝐫𝐜𝐡𝐢𝐭𝐞𝐜𝐭𝐮𝐫𝐞 : ${arch}
│ 🟢 𝐍𝐨𝐝𝐞       : ${node}
│
╰─────────────────────────────╯

╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
       💗 𝐌𝐀𝐑𝐈𝐍 𝐈𝐒 𝐀𝐋𝐈𝐕𝐄 ✨
       「 Crimson Administration 」
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
`;


    // 🌸 Essaye une image, mais ne bloque JAMAIS la commande
    try {

      const img =
        images[Math.floor(Math.random() * images.length)];

      const attachment =
        await global.utils.getStreamFromURL(img);

      return message.reply({
        body,
        attachment
      });

    } catch (error) {

      // Si l'image échoue, le texte est quand même envoyé
      console.log(
        "[UPTIME] Impossible de charger l'image :",
        error.message
      );

      return message.reply({
        body
      });
    }

  }
};
