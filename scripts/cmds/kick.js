module.exports = {
	config: {
		name: "kick",
		version: "1.4",
		author: "CRIMSON & KITAGAWA ÉDITION",
		countDown: 5,
		role: 1,
		description: {
			fr: "👢 Expulse un membre du groupe",
			vi: "Kick thành viên khỏi box chat",
			en: "Kick member out of chat box"
		},
		category: "box chat",
		guide: {
			fr: "{pn} @tags : expulse les personnes mentionnées\n{pn} en réponse à un message : expulse son auteur",
			vi: "   {pn} @tags: dùng để kick những người được tag",
			en: "   {pn} @tags: use to kick members who are tagged"
		}
	},

	langs: {
		fr: {
			needAdmin: "❌ Le bot doit être administrateur du groupe pour utiliser cette commande.",
			success: "🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n━━━━━━━━━━━━━━━━━━━━━━\n👢 %1 a été supprimé(e) du groupe.",
			successMultiple: "🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n━━━━━━━━━━━━━━━━━━━━━━\n👢 Membres supprimés :\n%1"
		},
		vi: {
			needAdmin: "Vui lòng thêm quản trị viên cho bot trước khi sử dụng tính năng này"
		},
		en: {
			needAdmin: "Please add admin for bot before using this feature"
		}
	},

	onStart: async function ({ message, event, args, threadsData, api, getLang, usersData }) {
		const adminIDs = await threadsData.get(event.threadID, "adminIDs");

		if (!adminIDs.includes(api.getCurrentUserID()))
			return message.reply(getLang("needAdmin"));

		async function kickAndCheckError(uid) {
			try {
				await api.removeUserFromGroup(uid, event.threadID);
				return true;
			}
			catch (e) {
				await message.reply(getLang("needAdmin"));
				return false;
			}
		}

		// kick sans argument = personne à qui on répond
		if (!args[0]) {
			if (!event.messageReply)
				return message.SyntaxError();

			const uid = event.messageReply.senderID;
			const name = await usersData.getName(uid);

			if (await kickAndCheckError(uid)) {
				return message.reply(getLang("success", name));
			}
		}

		// kick avec mentions
		const uids = Object.keys(event.mentions);

		if (uids.length === 0)
			return message.SyntaxError();

		const removedNames = [];

		for (const uid of uids) {
			const name = await usersData.getName(uid);

			if (await kickAndCheckError(uid)) {
				removedNames.push(`👤 ${name}`);
			}
		}

		if (removedNames.length > 0) {
			return message.reply(
				getLang("successMultiple", removedNames.join("\n"))
			);
		}
	}
};