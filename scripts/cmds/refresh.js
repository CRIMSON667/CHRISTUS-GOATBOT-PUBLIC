module.exports = {
	config: {
		name: "refresh",
		version: "1.2",
		author: "NTKhang",
		countDown: 60,
		role: 0,
		description: {
			fr: "🔄 Actualise les informations d'un groupe ou d'un utilisateur",
			en: "Refresh information of group chat or user"
		},
		category: "box chat",
		guide: {
			fr: "   {pn} group : actualiser les informations du groupe"
				+ "\n   {pn} group <threadID> : actualiser un groupe avec son ID"
				+ "\n\n   {pn} user : actualiser tes informations"
				+ "\n   {pn} user <userID> : actualiser les informations d'un utilisateur"
				+ "\n   {pn} user @tag : actualiser les informations d'une personne",
			en: "   {pn} group : refresh group information"
				+ "\n   {pn} group <threadID> : refresh group by ID"
				+ "\n\n   {pn} user : refresh your user information"
				+ "\n   {pn} user <userID> : refresh user by ID"
				+ "\n   {pn} user @tag : refresh tagged user"
		}
	},

	langs: {
		fr: {
			refreshMyThreadSuccess:
				"🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n━━━━━━━━━━━━━━━━━━━━━━\n🔄 Les informations du groupe ont été actualisées avec succès !\n━━━━━━━━━━━━━━━━━━━━━━",
			
			refreshThreadTargetSuccess:
				"🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n━━━━━━━━━━━━━━━━━━━━━━\n🔄 Le groupe %1 a été actualisé avec succès !\n━━━━━━━━━━━━━━━━━━━━━━",

			errorRefreshMyThread:
				"❌ Impossible d'actualiser les informations de ton groupe.",

			errorRefreshThreadTarget:
				"❌ Impossible d'actualiser les informations du groupe %1.",

			refreshMyUserSuccess:
				"🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n━━━━━━━━━━━━━━━━━━━━━━\n👤 Tes informations ont été actualisées avec succès !\n━━━━━━━━━━━━━━━━━━━━━━",

			refreshUserTargetSuccess:
				"🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n━━━━━━━━━━━━━━━━━━━━━━\n👤 Les informations de %1 ont été actualisées avec succès !\n━━━━━━━━━━━━━━━━━━━━━━",

			errorRefreshMyUser:
				"❌ Impossible d'actualiser tes informations.",

			errorRefreshUserTarget:
				"❌ Impossible d'actualiser les informations de %1."
		},

		en: {
			refreshMyThreadSuccess:
				"🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n━━━━━━━━━━━━━━━━━━━━━━\n🔄 Group information refreshed successfully!\n━━━━━━━━━━━━━━━━━━━━━━",

			refreshThreadTargetSuccess:
				"🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n━━━━━━━━━━━━━━━━━━━━━━\n🔄 Group %1 refreshed successfully!\n━━━━━━━━━━━━━━━━━━━━━━",

			errorRefreshMyThread:
				"❌ Unable to refresh your group information.",

			errorRefreshThreadTarget:
				"❌ Unable to refresh group information %1.",

			refreshMyUserSuccess:
				"🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n━━━━━━━━━━━━━━━━━━━━━━\n👤 Your user information was refreshed successfully!\n━━━━━━━━━━━━━━━━━━━━━━",

			refreshUserTargetSuccess:
				"🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n━━━━━━━━━━━━━━━━━━━━━━\n👤 User %1 information was refreshed successfully!\n━━━━━━━━━━━━━━━━━━━━━━",

			errorRefreshMyUser:
				"❌ Unable to refresh your user information.",

			errorRefreshUserTarget:
				"❌ Unable to refresh user information %1."
		}
	},

	onStart: async function ({
		args,
		threadsData,
		message,
		event,
		usersData,
		getLang
	}) {

		// 🔄 Actualiser un groupe
		if (args[0] == "group" || args[0] == "thread") {
			const targetID = args[1] || event.threadID;

			try {
				await threadsData.refreshInfo(targetID);

				return message.reply(
					targetID == event.threadID
						? getLang("refreshMyThreadSuccess")
						: getLang("refreshThreadTargetSuccess", targetID)
				);
			}
			catch (error) {
				return message.reply(
					targetID == event.threadID
						? getLang("errorRefreshMyThread")
						: getLang("errorRefreshThreadTarget", targetID)
				);
			}
		}

		// 👤 Actualiser un utilisateur
		else if (args[0] == "user") {
			let targetID = event.senderID;

			if (args[1]) {
				if (Object.keys(event.mentions).length)
					targetID = Object.keys(event.mentions)[0];
				else
					targetID = args[1];
			}

			try {
				await usersData.refreshInfo(targetID);

				return message.reply(
					targetID == event.senderID
						? getLang("refreshMyUserSuccess")
						: getLang("refreshUserTargetSuccess", targetID)
				);
			}
			catch (error) {
				return message.reply(
					targetID == event.senderID
						? getLang("errorRefreshMyUser")
						: getLang("errorRefreshUserTarget", targetID)
				);
			}
		}

		else {
			return message.SyntaxError();
		}
	}
};