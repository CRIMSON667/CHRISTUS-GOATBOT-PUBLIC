const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { utils } = global;

const spamTracker = new Map();

const kitagawaImages = [
  "https://i.imgur.com/lj3Phks.jpeg",
  "https://i.imgur.com/qJpfEfP.jpeg",
  "https://i.imgur.com/hchNs1B.jpeg",
  "https://i.imgur.com/fcDUOfn.jpeg",
  "https://i.imgur.com/173PLKF.jpeg",
  "https://i.imgur.com/lEgrRm3.jpeg",
  "https://i.imgur.com/h2wa0jP.jpeg",
  "https://i.imgur.com/EjkOXUt.jpeg",
  "https://i.imgur.com/0BL3ZPY.jpeg",
  "https://i.imgur.com/yFKOVh9.jpeg",
  "https://i.imgur.com/sR1QiJL.jpeg",
  "https://i.imgur.com/yDB0P1R.jpeg"
];

// 50 phrases uniques pour le préfixe
const normalKitagawaReplies = [
  "Coucou beau gosse %1 ! Tu cherches le préfixe ? Le voilà :\n➥ 🌐 Global : %2\n➥ 💬 Ce groupe : %3\nBot actif : %4. ✨",
  "Hé %1... Tu cherches le préfixe ou c'était juste une excuse pour me parler ? 👀\n➥ 🌐 Global : %2\n➥ 💬 Ce groupe : %3\nBot actif : %4.",
  "Tu as du charme quand tu me demandes de l'aide %1 😉 :\n➥ 🌐 Global : %2\n➥ 💬 Ce groupe : %3\nBot actif : %4.",
  "Hop là %1 ! Je te donne ça parce que c'est toi 💕 :\n➥ 🌐 Global : %2\n➥ 💬 Ce groupe : %3\nBot actif : %4.",
  "Oh %1 ! Besoins des commandes ? Voici le préfixe :\n➥ 🌐 Global : %2\n➥ 💬 Ce groupe : %3\nBot actif : %4. 🎀",
  "Salut %1 ! Pas de panique, le préfixe est juste ici :\n➥ 🌐 Global : %2\n➥ 💬 Ce groupe : %3\nBot actif : %4.",
  "Heyy %1 ! Toujours là pour t'aider 💕 :\n➥ 🌐 Global : %2\n➥ 💬 Ce groupe : %3\nBot actif : %4.",
  "Dis-moi %1, tu préparais un cosplay de quelqu'un de perdu ? Haha ! Voilà la commande :\n➥ 🌐 Global : %2\n➥ 💬 Ce groupe : %3\nBot actif : %4.",
  "Konnichiwa %1 ! Voilà les infos sur le préfixe :\n➥ 🌐 Global : %2\n➥ 💬 Ce groupe : %3\nBot actif : %4. ✨",
  "Ouh là %1, ne cherche plus partout ! Regarde par ici :\n➥ 🌐 Global : %2\n➥ 💬 Ce groupe : %3\nBot actif : %4.",
  "Tu as de la chance que je sois de bonne humeur %1 ! 💖\n➥ 🌐 Global : %2\n➥ 💬 Ce groupe : %3\nBot actif : %4.",
  "Tadaa ! Voilà le préfixe magique pour toi %1 :\n➥ 🌐 Global : %2\n➥ 💬 Ce groupe : %3\nBot actif : %4.",
  "Toujours au top %1 ! Voici ce qu'il te faut :\n➥ 🌐 Global : %2\n➥ 💬 Ce groupe : %3\nBot actif : %4.",
  "Besoin d'un coup de main %1 ? Marin est là ! 🛍️\n➥ 🌐 Global : %2\n➥ 💬 Ce groupe : %3\nBot actif : %4.",
  "Regarde bien %1, c'est super simple :\n➥ 🌐 Global : %2\n➥ 💬 Ce groupe : %3\nBot actif : %4.",
  "Oooh %1, tu es si mignon quand tu demandes gentiment ! 💕\n➥ 🌐 Global : %2\n➥ 💬 Ce groupe : %3\nBot actif : %4.",
  "Pour toi %1, je réponds en un éclair ⚡ :\n➥ 🌐 Global : %2\n➥ 💬 Ce groupe : %3\nBot actif : %4.",
  "Ne t'inquiète pas %1, je garde tout sous contrôle :\n➥ 🌐 Global : %2\n➥ 💬 Ce groupe : %3\nBot actif : %4.",
  "Hey %1 ! Prêt à lancer une commande ? 🚀\n➥ 🌐 Global : %2\n➥ 💬 Ce groupe : %3\nBot actif : %4.",
  "Tu voulais me voir %1 ? Avoue-le ! 👀\n➥ 🌐 Global : %2\n➥ 💬 Ce groupe : %3\nBot actif : %4.",
  "Installe-toi bien %1, voici le préfixe en question :\n➥ 🌐 Global : %2\n➥ 💬 Ce groupe : %3\nBot actif : %4.",
  "Coucou %1 ! Je te note ça direct :\n➥ 🌐 Global : %2\n➥ 💬 Ce groupe : %3\nBot actif : %4. ✨",
  "Un problème de préfixe %1 ? Plus maintenant ! 😊\n➥ 🌐 Global : %2\n➥ 💬 Ce groupe : %3\nBot actif : %4.",
  "C'est parti %1 ! Voici tout ce qu'il faut savoir :\n➥ 🌐 Global : %2\n➥ 💬 Ce groupe : %3\nBot actif : %4.",
  "Oh, %1 ! Tu as de l'œil, voici le préfixe :\n➥ 🌐 Global : %2\n➥ 💬 Ce groupe : %3\nBot actif : %4.",
  "Rien que pour tes beaux yeux %1 😉 :\n➥ 🌐 Global : %2\n➥ 💬 Ce groupe : %3\nBot actif : %4.",
  "Salut %1 ! Laisse-moi te rafraîchir la mémoire :\n➥ 🌐 Global : %2\n➥ 💬 Ce groupe : %3\nBot actif : %4.",
  "Trop facile %1 ! Voici le préfixe actuel :\n➥ 🌐 Global : %2\n➥ 💬 Ce groupe : %3\nBot actif : %4.",
  "Et voilà %1 ! Ne le perds plus cette fois 😜 :\n➥ 🌐 Global : %2\n➥ 💬 Ce groupe : %3\nBot actif : %4.",
  "Hop hop %1, voilà l'accès au bot :\n➥ 🌐 Global : %2\n➥ 💬 Ce groupe : %3\nBot actif : %4.",
  "Tu as besoin de moi %1 ? Quel honneur ! ❤️\n➥ 🌐 Global : %2\n➥ 💬 Ce groupe : %3\nBot actif : %4.",
  "En direct pour toi %1, voici les préfixes :\n➥ 🌐 Global : %2\n➥ 💬 Ce groupe : %3\nBot actif : %4.",
  "Yo %1 ! Voici le sésame pour utiliser les commandes :\n➥ 🌐 Global : %2\n➥ 💬 Ce groupe : %3\nBot actif : %4.",
  "Ne cherche plus %1, tout est noté ici :\n➥ 🌐 Global : %2\n➥ 💬 Ce groupe : %3\nBot actif : %4. 🎀",
  "C'est toujours un plaisir de t'aider %1 💕 :\n➥ 🌐 Global : %2\n➥ 💬 Ce groupe : %3\nBot actif : %4.",
  "Ah %1, qu'est-ce que tu ferais sans moi ? 🤭\n➥ 🌐 Global : %2\n➥ 💬 Ce groupe : %3\nBot actif : %4.",
  "Garde ça bien en tête %1 :\n➥ 🌐 Global : %2\n➥ 💬 Ce groupe : %3\nBot actif : %4.",
  "Coucou %1 ! Tu veux lancer une commande ? Voilà la clé :\n➥ 🌐 Global : %2\n➥ 💬 Ce groupe : %3\nBot actif : %4.",
  "Attention les yeux %1, voilà le préfixe ✨ :\n➥ 🌐 Global : %2\n➥ 💬 Ce groupe : %3\nBot actif : %4.",
  "Hey %1, toujours fidèle au poste ! Voici l'info :\n➥ 🌐 Global : %2\n➥ 💬 Ce groupe : %3\nBot actif : %4.",
  "Tu as frappé à la bonne porte %1 😉 :\n➥ 🌐 Global : %2\n➥ 💬 Ce groupe : %3\nBot actif : %4.",
  "Voilà ton préfixe %1, amuse-toi bien ! 💖\n➥ 🌐 Global : %2\n➥ 💬 Ce groupe : %3\nBot actif : %4.",
  "C'est note pour toi %1 ! Regarde ci-dessous :\n➥ 🌐 Global : %2\n➥ 💬 Ce groupe : %3\nBot actif : %4.",
  "Un petit rappel ne fait jamais de mal %1 :\n➥ 🌐 Global : %2\n➥ 💬 Ce groupe : %3\nBot actif : %4.",
  "Coucou %1 ! Le préfixe est prêt pour toi :\n➥ 🌐 Global : %2\n➥ 💬 Ce groupe : %3\nBot actif : %4.",
  "Tu m'as appelée %1 ? Voici ce dont tu as besoin :\n➥ 🌐 Global : %2\n➥ 💬 Ce groupe : %3\nBot actif : %4.",
  "Et voici les détails %1, simple et rapide :\n➥ 🌐 Global : %2\n➥ 💬 Ce groupe : %3\nBot actif : %4.",
  "Toujours à ton service %1 ✨ :\n➥ 🌐 Global : %2\n➥ 💬 Ce groupe : %3\nBot actif : %4.",
  "Bingo %1 ! Voici les infos sur le bot :\n➥ 🌐 Global : %2\n➥ 💬 Ce groupe : %3\nBot actif : %4.",
  "Voilà pour toi %1 ! À plus tard pour de nouvelles aventures 💕 :\n➥ 🌐 Global : %2\n➥ 💬 Ce groupe : %3\nBot actif : %4."
];

const spamLevel1Replies = [
  "Mais %1... Tu as déjà oublié ? Je viens tout juste de te le donner au-dessus ! 😅",
  "Attends %1, tu as des problèmes de vue ou tu voulais réentendre ma voix ? 👀",
  "Haha %1, tu es mignon mais lève un peu les yeux dans le chat, tout est déjà écrit ! 💕",
  "Euuh %1... Ton doigt a glissé ou tu aimes juste appuyer sur les boutons ?"
];

const spamLevel2Replies = [
  "Dis donc %1, tu devins carrément relou là. Regarde le message plus haut ! 🙄",
  "%1, t'es mignon 2 secondes mais tu me tapes sévèrement sur les nerfs là. Stop !",
  "T'as de l'eau à la place du cerveau %1 ? L'info n'a pas bougé d'un millimètre !",
  "Désolée %1, mais les mecs incapables de lire un écran, ça me calme direct. 💅",
  "Mais tu vas fermer ta gueule et lire le chat %1 ?! 🤬",
  "Tu penses me séduire en faisant le boulet %1 ? Spoiler : c'est loupé."
];

const spamLevel4Replies = [
  "STOP %1 ! TU ME GONFLES SÉRIEUSEMENT ! DÉGAGE DE LÀ ET LIS AU-DESSUS !",
  "%1, tu as le QI d'une huître pas fraîche. Je ne te répondrai PLUS JAMAIS. 🖕",
  "C'est la 4ème fois %1... Tu es la définition même du sous-doué. Disparais.",
  "Bloqué moralement %1. Tu fais pitié, arrête d'inonder ce groupe !"
];

function formatLayout(title, body) {
  return (
    `╭───〖 ${title} 〗───⬣\n` +
    `│\n` +
    body.split('\n').map(line => `│  ${line}`).join('\n') + `\n` +
    `│\n` +
    `╰──────────────────⬣`
  );
}

module.exports = {
  config: {
    name: "prefix",
    version: "2.8",
    author: "CRIMSON 🩵🪽 (Marin Mode)",
    countDown: 5,
    role: 0,
    description: "Changer le préfixe de commande du bot dans votre groupe ou dans tout le système",
    category: "config",
    guide: {
      fr: "   {pn} <nouveau préfixe> : change le préfixe dans votre groupe\n"
        + "   {pn} <nouveau préfixe> -g : change le préfixe dans tout le système (admin bot)\n"
        + "   {pn} reset : réinitialise le préfixe du groupe"
    }
  },

  langs: {
    vi: {
      reset: "Đã reset prefix của bạn về mặc định: %1",
      onlyAdmin: "Chỉ admin mới có thể thay đổi prefix hệ thống bot",
      confirmGlobal: "Vui lòng thả cảm xúc bất kỳ vào tin nhắn này để xác nhận thay đổi prefix của toàn bộ hệ thống bot",
      confirmThisThread: "Vui lòng thả cảm xúc bất kỳ vào tin nhắn này để xác nhận thay đổi prefix trong nhóm chat của bạn",
      successGlobal: "Đã thay đổi prefix hệ thống bot thành: %1",
      successThisThread: "Đã thay đổi prefix trong nhóm chat của bạn thành: %1"
    },
    en: {
      reset: "Your prefix reset to default: %1",
      onlyAdmin: "Only admin can change prefix of system bot",
      confirmGlobal: "Please react to this message to confirm change prefix of system bot",
      confirmThisThread: "Please react to this message to confirm change prefix in your box chat",
      successGlobal: "Changed prefix of system bot to: %1",
      successThisThread: "Changed prefix in your box chat to: %1"
    },
    fr: {
      reset: "Préfixe réinitialisé : %1",
      onlyAdmin: "Seul un admin bot peut changer le préfixe du système.",
      confirmGlobal: "Réagissez à ce message pour confirmer le changement global.",
      confirmThisThread: "Réagissez à ce message pour confirmer le changement dans ce groupe.",
      successGlobal: "Préfixe système changé en : %1",
      successThisThread: "Préfixe du groupe changé en : %1"
    }
  },

  onStart: async function ({ message, role, args, commandName, event, threadsData, getLang }) {
    if (!args[0])
      return message.SyntaxError();

    if (args[0] === 'reset') {
      await threadsData.set(event.threadID, null, "data.prefix");
      return message.reply(formatLayout("RÉINITIALISATION", getLang("reset", global.GoatBot.config.prefix)));
    }

    const newPrefix = args[0];
    const formSet = {
      commandName,
      author: event.senderID,
      newPrefix
    };

    if (args[1] === "-g") {
      if (role < 2) return message.reply(formatLayout("ACCÈS REFUSÉ", getLang("onlyAdmin")));
      formSet.setGlobal = true;
    } else {
      formSet.setGlobal = false;
    }

    const confirmText = args[1] === "-g" ? getLang("confirmGlobal") : getLang("confirmThisThread");
    return message.reply(formatLayout("CONFIRMATION", confirmText), (err, info) => {
      formSet.messageID = info.messageID;
      global.GoatBot.onReaction.set(info.messageID, formSet);
    });
  },

  onReaction: async function ({ message, threadsData, event, Reaction, getLang }) {
    const { author, newPrefix, setGlobal } = Reaction;
    if (event.userID !== author) return;

    if (setGlobal) {
      global.GoatBot.config.prefix = newPrefix;
      fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
      return message.reply(formatLayout("SUCCÈS GLOBAL", getLang("successGlobal", newPrefix)));
    } else {
      await threadsData.set(event.threadID, newPrefix, "data.prefix");
      return message.reply(formatLayout("SUCCÈS GROUPE", getLang("successThisThread", newPrefix)));
    }
  },

  onChat: async function ({ event, message, usersData }) {
    if (event.body && event.body.toLowerCase() === "prefix") {
      const userId = event.senderID;
      const key = `${event.threadID}_${userId}`;
      const userName = await usersData.getName(userId);
      const realBotName = global.GoatBot.config.nickNameBot || global.GoatBot.config.nameBot || "KITAGAWA BOT";

      let userData = spamTracker.get(key) || { count: 0, timer: null };

      if (userData.timer) clearTimeout(userData.timer);
      userData.timer = setTimeout(() => spamTracker.delete(key), 30000);

      userData.count += 1;
      spamTracker.set(key, userData);

      let rawReply = "";
      let title = "MARIN KITAGAWA";

      // Premier appel : Envoi avec image
      if (userData.count === 1) {
        const randomImgUrl = kitagawaImages[Math.floor(Math.random() * kitagawaImages.length)];
        const globalPrefix = global.GoatBot.config.prefix || "/";
        const threadPrefix = utils.getPrefix(event.threadID) || globalPrefix;
        const template = normalKitagawaReplies[Math.floor(Math.random() * normalKitagawaReplies.length)];

        rawReply = template
          .replace(/%1/g, userName)
          .replace(/%2/g, globalPrefix)
          .replace(/%3/g, threadPrefix)
          .replace(/%4/g, realBotName);

        title = "INFO PREFIX ✨";
        return sendResponse(message, formatLayout(title, rawReply), randomImgUrl);
      }

      // En cas de spam (count > 1) : Envoi de texte uniquement sans image
      if (userData.count === 2) {
        const template = spamLevel1Replies[Math.floor(Math.random() * spamLevel1Replies.length)];
        rawReply = template.replace(/%1/g, userName);
        title = "ATTENTION 😅";
      } 
      else if (userData.count === 3 || userData.count === 4) {
        const template = spamLevel2Replies[Math.floor(Math.random() * spamLevel2Replies.length)];
        rawReply = template.replace(/%1/g, userName);
        title = "STOP SPAM 🙄";
      } 
      else {
        const template = spamLevel4Replies[Math.floor(Math.random() * spamLevel4Replies.length)];
        rawReply = template.replace(/%1/g, userName);
        title = "PÉTAGE DE PLOMB 🤬";
      }

      return message.reply(formatLayout(title, rawReply));
    }
  }
};

async function sendResponse(message, text, imgUrl) {
  const cachePath = path.join(__dirname, "cache", `prefix_${Date.now()}.jpg`);
  try {
    await fs.ensureDir(path.join(__dirname, "cache"));

    const response = await axios({
      method: "GET",
      url: imgUrl,
      responseType: "stream",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
      }
    });

    const writer = fs.createWriteStream(cachePath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    const sentMessage = await message.reply({
      body: text,
      attachment: fs.createReadStream(cachePath)
    });

    if (fs.existsSync(cachePath)) {
      fs.unlinkSync(cachePath);
    }

    return sentMessage;
  } catch (e) {
    if (fs.existsSync(cachePath)) {
      fs.unlinkSync(cachePath);
    }
    console.error("Erreur envoi image:", e.message);
    return message.reply(text);
  }
}
