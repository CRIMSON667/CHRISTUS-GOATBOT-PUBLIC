const FRAME = "🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n━━━━━━━━━━━━━━━━━━━━━━";

function kitagawa(title, body) {
	return `${FRAME}\n✨ ${title} ✨\n${body}`;
}

function sleep(time) {
	return new Promise((resolve) => setTimeout(resolve, time));
}

const frenchLang = {
	needAdmin: kitagawa(
		"ADMIN REQUIS",
		"Euh attends, mets-moi admin du groupe d'abord ! Sinon je peux virer personne, c'est mort ! 😤💅"
	),
	menu: kitagawa(
		"MENU FILTERUSER",
		"Tu veux faire le grand ménage dans le groupe ? Trop bien, voici comment faire~ ! ✨\n\n" +
			"👻 filteruser <nombre> : vire tous ceux qui ont moins de X messages (ex: filteruser 5)\n" +
			"💀 filteruser die : vire direct tous les comptes morts ou bloqués\n\n" +
			"Pense bien à me laisser admin du groupe sinon je peux rien faire ! 💖"
	),
	confirm: kitagawa(
		"CONFIRMATION DU TRI",
		"Sérieux, tu veux vraiment que je vire tous ceux qui ont moins de %1 message(s) ?! 😱\n\n💖 Réagis à ce message avec n'importe quel emoji pour confirmer le grand ménage !"
	),
	kickByBlock: "💅 Ciao bye-bye~ ! J'ai viré %1 compte(s) mort(s) ou bloqué(s) du groupe ! ✨",
	kickByMsg: "💅 Grand ménage terminé ! J'ai viré %1 fantôme(s) avec moins de %2 message(s) ! ✨",
	kickError: "💥 Oups, impossible de virer %1 membre(s) :\n%2",
	noBlock: kitagawa(
		"GROUPE TOUT PROPRE",
		"Hii~ ! Aucun compte mort ou bloqué ici, tout le monde est bien vivant ! ✨"
	),
	noMsg: kitagawa(
		"PERSONNE À VIRER",
		"Zéro fantôme avec moins de %1 message(s) ! Tout le monde participe trop bien, j'adore~ ! 💖"
	)
};

module.exports = {
	config: {
		name: "filteruser",
		version: "1.6",
		author: "NTKhang",
		countDown: 5,
		role: 1,
		description: {
			fr: "Trie les membres du groupe selon leur nombre de messages ou les comptes bloqués, style Marin Kitagawa !",
			en: "Trie les membres du groupe selon leur nombre de messages ou les comptes bloqués, style Marin Kitagawa !"
		},
		category: "box chat",
		guide: {
			fr: "   {pn} [<nombre de messages> | die]",
			en: "   {pn} [<nombre de messages> | die]"
		}
	},

	langs: {
		fr: frenchLang,
		en: frenchLang
	},

	onStart: async function ({ api, args, threadsData, message, event, commandName, getLang }) {
		if (!args[0])
			return message.reply(getLang("menu"));

		const threadData = await threadsData.get(event.threadID);
		if (!threadData.adminIDs.includes(api.getCurrentUserID()))
			return message.reply(getLang("needAdmin"));

		if (!isNaN(args[0])) {
			message.reply(getLang("confirm", args[0]), (err, info) => {
				global.GoatBot.onReaction.set(info.messageID, {
					author: event.senderID,
					messageID: info.messageID,
					minimum: Number(args[0]),
					commandName
				});
			});
		}
		else if (args[0].toLowerCase() == "die") {
			const threadData = await api.getThreadInfo(event.threadID);
			const membersBlocked = threadData.userInfo.filter(user => user.type !== "User");
			const errors = [];
			const success = [];
			for (const user of membersBlocked) {
				if (user.type !== "User" && !threadData.adminIDs.some(id => id == user.id)) {
					try {
						await api.removeUserFromGroup(user.id, event.threadID);
						success.push(user.id);
					}
					catch (e) {
						errors.push(user.name);
					}
					await sleep(700);
				}
			}

			let msg = "";
			if (success.length > 0)
				msg += `${getLang("kickByBlock", success.length)}\n`;
			if (errors.length > 0)
				msg += `${getLang("kickError", errors.length, errors.join("\n"))}\n`;
			if (msg == "")
				return message.reply(getLang("noBlock"));
			message.reply(kitagawa("RÉSULTAT DU TRI", msg.trim()));
		}
		else
			return message.reply(getLang("menu"));
	},

	onReaction: async function ({ api, Reaction, event, threadsData, message, getLang }) {
		const { minimum = 1, author } = Reaction;
		if (event.userID != author)
			return;
		const threadData = await threadsData.get(event.threadID);
		const botID = api.getCurrentUserID();
		const membersCountLess = threadData.members.filter(member =>
			member.count < minimum
			&& member.inGroup == true
			&& member.userID != botID
			&& !threadData.adminIDs.some(id => id == member.userID)
		);
		const errors = [];
		const success = [];
		for (const member of membersCountLess) {
			try {
				await api.removeUserFromGroup(member.userID, event.threadID);
				success.push(member.userID);
			}
			catch (e) {
				errors.push(member.name);
			}
			await sleep(700);
		}

		let msg = "";
		if (success.length > 0)
			msg += `${getLang("kickByMsg", success.length, minimum)}\n`;
		if (errors.length > 0)
			msg += `${getLang("kickError", errors.length, errors.join("\n"))}\n`;
		if (msg == "")
			return message.reply(getLang("noMsg", minimum));
		message.reply(kitagawa("RÉSULTAT DU TRI", msg.trim()));
	}
};