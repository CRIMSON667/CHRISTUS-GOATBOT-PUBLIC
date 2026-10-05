const { getTime } = global.utils;

module.exports = {
	config: {
		name: "logsbot",
		isBot: true,
		version: "2.0",
		author: "CRIMSON 🩵× Kitagawa édition 🌼",
		envConfig: {
			allow: true
		},
		category: "events"
	},

	langs: {
		fr: {
			title: "🎀 𝑴𝒂𝒓𝒊𝒏 𝑲𝒊𝒕𝒂𝒈𝒂𝒘𝒂 — 𝑳𝒐𝒈𝒔 𝑩𝒐𝒕\n━━━━━━━━━━━━━━━━━━━━━━",

			added:
				"\n\n✅ 𝑩𝒐𝒕 𝒂𝒋𝒐𝒖𝒕𝒆́\n" +
				"━━━━━━━━━━━━━━━━━━━━━━\n" +
				"🎀 Événement : le bot vient d'être ajouté à un nouveau groupe\n" +
				"👤 Ajouté par : %1",

			kicked:
				"\n\n❌ 𝑩𝒐𝒕 𝒓𝒆𝒕𝒊𝒓𝒆́\n" +
				"━━━━━━━━━━━━━━━━━━━━━━\n" +
				"🎀 Événement : le bot a été retiré du groupe\n" +
				"👤 Retiré par : %1",

			footer:
				"\n\n━━━━━━━━━━━━━━━━━━━━━━\n" +
				"🆔 User ID : %1\n" +
				"👥 Groupe : %2\n" +
				"🔗 Group ID : %3\n" +
				"🕐 Heure : %4\n" +
				"━━━━━━━━━━━━━━━━━━━━━━"
		},

		en: {
			title: "🎀 𝑴𝒂𝒓𝒊𝒏 𝑲𝒊𝒕𝒂𝒈𝒂𝒘𝒂 — 𝑩𝒐𝒕 𝑳𝒐𝒈𝒔\n━━━━━━━━━━━━━━━━━━━━━━",

			added:
				"\n\n✅ 𝑩𝒐𝒕 𝑨𝒅𝒅𝒆𝒅\n" +
				"━━━━━━━━━━━━━━━━━━━━━━\n" +
				"🎀 Event: bot added to a new group\n" +
				"👤 Added by: %1",

			kicked:
				"\n\n❌ 𝑩𝒐𝒕 𝑹𝒆𝒎𝒐𝒗𝒆𝒅\n" +
				"━━━━━━━━━━━━━━━━━━━━━━\n" +
				"🎀 Event: bot was removed from the group\n" +
				"👤 Removed by: %1",

			footer:
				"\n\n━━━━━━━━━━━━━━━━━━━━━━\n" +
				"🆔 User ID: %1\n" +
				"👥 Group: %2\n" +
				"🔗 Group ID: %3\n" +
				"🕐 Time: %4\n" +
				"━━━━━━━━━━━━━━━━━━━━━━"
		}
	},

	onStart: async ({
		usersData,
		threadsData,
		event,
		api,
		getLang
	}) => {

		if (
			(
				event.logMessageType == "log:subscribe" &&
				event.logMessageData.addedParticipants.some(
					item => item.userFbId == api.getCurrentUserID()
				)
			)
			||
			(
				event.logMessageType == "log:unsubscribe" &&
				event.logMessageData.leftParticipantFbId == api.getCurrentUserID()
			)
		)
			return async function () {

				let msg = getLang("title");

				const {
					author,
					threadID
				} = event;

				if (author == api.getCurrentUserID())
					return;

				let threadName;
				const { config } = global.GoatBot;

				if (event.logMessageType == "log:subscribe") {

					if (
						!event.logMessageData.addedParticipants.some(
							item => item.userFbId == api.getCurrentUserID()
						)
					)
						return;

					threadName = (
						await api.getThreadInfo(threadID)
					).threadName;

					const authorName =
						await usersData.getName(author);

					msg += getLang(
						"added",
						authorName
					);
				}

				else if (event.logMessageType == "log:unsubscribe") {

					if (
						event.logMessageData.leftParticipantFbId !=
						api.getCurrentUserID()
					)
						return;

					const authorName =
						await usersData.getName(author);

					const threadData =
						await threadsData.get(threadID);

					threadName = threadData.threadName;

					msg += getLang(
						"kicked",
						authorName
					);
				}

				const time =
					getTime("DD/MM/YYYY HH:mm:ss");

				msg += getLang(
					"footer",
					author,
					threadName,
					threadID,
					time
				);

				for (const adminID of config.adminBot)
					api.sendMessage(
						msg,
						adminID
					);
			};
	}
};