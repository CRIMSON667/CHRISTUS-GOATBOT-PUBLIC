const fs = require("fs-extra");
const axios = require("axios");
const { utils } = global;

// Map pour stocker le compteur de spams et le timer par utilisateur
const spamTracker = new Map();

// Liens des images de Marin Kitagawa
const kitagawaImages = [
        "https://i.ibb.co/VYZH1906/a9ca381c46c1.jpg",
        "https://i.ibb.co/WvGq8ypy/b2abc3981a93.jpg",
        "https://i.ibb.co/SX7kYHB2/161887d2f42b.jpg",
        "https://i.ibb.co/Kcw1w2cQ/47cbe3a642dd.jpg"
];

// 1. Demande normale (flirt léger / enthousiaste)
const normalKitagawaReplies = [
        "Coucou beau gosse %1 ! Tu cherches le préfixe ? Le voilà :\n➥ 🌐 Global : %2\n➥ 💬 Ce groupe : %3\nBot actif : %4. ✨",
        "Hé %1... Tu cherches le préfixe ou c'était juste une excuse pour me parler ? 👀\n➥ 🌐 Global : %2\n➥ 💬 Ce groupe : %3\nBot actif : %4.",
        "Tu as du charme quand tu me demandes de l'aide %1 😉 :\n➥ 🌐 Global : %2\n➥ 💬 Ce groupe : %3\nBot actif : %4.",
        "Hop là %1 ! Je te donne ça parce que c'est toi 💕 :\n➥ 🌐 Global : %2\n➥ 💬 Ce groupe : %3\nBot actif : %4."
];

// 2. Niveau SPAM 1 : Compréhensible / Remarque taquine mais douce
const spamLevel1Replies = [
        "Mais %1... Tu as déjà oublié ? Je viens tout juste de te le donner au-dessus ! 😅",
        "Attends %1, tu as des problèmes de vue ou tu voulais réentendre ma voix ? 👀",
        "Haha %1, tu es mignon mais lève un peu les yeux dans le chat, tout est déjà écrit ! 💕",
        "Euuh %1... Ton doigt a glissé ou tu aimes juste appuyer sur les boutons ?"
];

// 3. Niveau SPAM 2 & 3 : Attaque / Méchante & Relou
const spamLevel2Replies = [
        "Dis donc %1, tu devins carrément relou là. Regarde le message plus haut ! 🙄",
        "%1, t'es mignon 2 secondes mais tu me tapes sévèrement sur les nerfs là. Stop !",
        "T'as de l'eau à la place du cerveau %1 ? L'info n'a pas bougé d'un millimètre !",
        "Désolée %1, mais les mecs incapables de lire un écran, ça me calme direct. 💅",
        "Mais tu vas fermer ta gueule et lire le chat %1 ?! 🤬",
        "Tu penses me séduire en faisant le boulet %1 ? Spoiler : c'est loupé."
];

// 4. Niveau SPAM 4+ : Pétage de plomb / Haine totale
const spamLevel4Replies = [
        "STOP %1 ! TU ME GONFLES SÉRIEUSEMENT ! DÉGAGE DE LÀ ET LIS AU-DESSUS !",
        "%1, tu as le QI d'une huître pas fraîche. Je ne te répondrai PLUS JAMAIS. 🖕",
        "C'est la 4ème fois %1... Tu es la définition même du sous-doué. Disparais.",
        "Bloqué moralement %1. Tu fais pitié, arrête d'inonder ce groupe !"
];

function boxify(text, title = "MARIN KITAGAWA") {
        return `╭━━━ ✨ 🎀 ${title} 🎀 ✨ ━━━╮\n┃\n┃ ${text.split('\n').join('\n┃ ')}\n┃\n╰━━━━━━━━━━━━━━━━━━━━╯`;
}

module.exports = {
        config: {
                name: "prefix",
                version: "2.4",
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
                        return message.reply(getLang("reset", global.GoatBot.config.prefix));
                }

                const newPrefix = args[0];
                const formSet = {
                        commandName,
                        author: event.senderID,
                        newPrefix
                };

                if (args[1] === "-g") {
                        if (role < 2) return message.reply(getLang("onlyAdmin"));
                        formSet.setGlobal = true;
                } else {
                        formSet.setGlobal = false;
                }

                return message.reply(args[1] === "-g" ? getLang("confirmGlobal") : getLang("confirmThisThread"), (err, info) => {
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
                        return message.reply(getLang("successGlobal", newPrefix));
                } else {
                        await threadsData.set(event.threadID, newPrefix, "data.prefix");
                        return message.reply(getLang("successThisThread", newPrefix));
                }
        },

        onChat: async function ({ event, message, usersData }) {
                if (event.body && event.body.toLowerCase() === "prefix") {
                        const userId = event.senderID;
                        const key = `${event.threadID}_${userId}`;
                        const userName = await usersData.getName(userId);
                        const realBotName = global.GoatBot.config.nickNameBot || global.GoatBot.config.nameBot || "KITAGAWA BOT";

                        // Gestion de la mémoire de l'utilisateur
                        let userData = spamTracker.get(key) || { count: 0, timer: null };

                        // Réinitialisation du timer d'inactivité à 30 secondes
                        if (userData.timer) clearTimeout(userData.timer);
                        userData.timer = setTimeout(() => spamTracker.delete(key), 30000);

                        userData.count += 1;
                        spamTracker.set(key, userData);

                        const randomImgUrl = kitagawaImages[Math.floor(Math.random() * kitagawaImages.length)];
                        let rawReply = "";

                        // Étape 1 : Première demande (Demande normale)
                        if (userData.count === 1) {
                                const globalPrefix = global.GoatBot.config.prefix || "/";
                                const threadPrefix = utils.getPrefix(event.threadID) || globalPrefix;
                                const template = normalKitagawaReplies[Math.floor(Math.random() * normalKitagawaReplies.length)];

                                rawReply = template
                                        .replace(/%1/g, userName)
                                        .replace(/%2/g, globalPrefix)
                                        .replace(/%3/g, threadPrefix)
                                        .replace(/%4/g, realBotName);

                                return sendResponse(message, boxify(rawReply, "INFO PREFIX"), randomImgUrl);
                        }

                        // Étape 2 : 1er Spam (Compréhensible / Doux)
                        if (userData.count === 2) {
                                const template = spamLevel1Replies[Math.floor(Math.random() * spamLevel1Replies.length)];
                                rawReply = template.replace(/%1/g, userName);
                        } 
                        // Étape 3 : 2ème & 3ème Spam (Attaque / Méchante)
                        else if (userData.count === 3 || userData.count === 4) {
                                const template = spamLevel2Replies[Math.floor(Math.random() * spamLevel2Replies.length)];
                                rawReply = template.replace(/%1/g, userName);
                        } 
                        // Étape 4 : 4ème Spam et plus (Pétage de plomb total)
                        else {
                                const template = spamLevel4Replies[Math.floor(Math.random() * spamLevel4Replies.length)];
                                rawReply = template.replace(/%1/g, userName);
                        }

                        return sendResponse(message, boxify(rawReply, "MARIN KITAGAWA"), randomImgUrl);
                }
        }
};

async function sendResponse(message, text, imgUrl) {
        try {
                const imgStream = (await axios.get(imgUrl, { responseType: "stream" })).data;
                return message.reply({ body: text, attachment: imgStream });
        } catch (e) {
                return message.reply(text);
        }
}
