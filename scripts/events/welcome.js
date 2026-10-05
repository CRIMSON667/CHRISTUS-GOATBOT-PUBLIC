const { getTime, drive } = global.utils;

if (!global.temp.welcomeEvent)
	global.temp.welcomeEvent = {};

module.exports = {
	config: {
		name: "welcome",
		version: "2.0",
		author: "CRIMSON 🩵 × Kitagawa édition 🌼",
		category: "events"
	},

	langs: {
		fr: {
			session1: "matin",
			session2: "midi",
			session3: "après-midi",
			session4: "soir",

			welcomeMessage:
				"🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n" +
				"━━━━━━━━━━━━━━━━━━━━━━\n" +
				"✨ Merci de m'avoir ajoutée au groupe !\n\n" +
				"⚡ Préfixe du bot : %1\n" +
				"📚 Pour voir les commandes : %1help\n" +
				"━━━━━━━━━━━━━━━━━━━━━━",

			multiple1: "toi",
			multiple2: "vous",

			defaultWelcomeMessage:
				"🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n" +
				"━━━━━━━━━━━━━━━━━━━━━━\n" +
				"👋 Salut {userName} !\n" +
				"💖 Bienvenue {multiple} dans {boxName} !\n\n" +
				"✨ Passez un agréable {session} !\n" +
				"━━━━━━━━━━━━━━━━━━━━━━"
		},

		en: {
			session1: "morning",
			session2: "noon",
			session3: "afternoon",
			session4: "evening",

			welcomeMessage:
				"🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n" +
				"━━━━━━━━━━━━━━━━━━━━━━\n" +
				"✨ Thanks for inviting me to the group!\n\n" +
				"⚡ Bot prefix: %1\n" +
				"📚 To see the commands: %1help\n" +
				"━━━━━━━━━━━━━━━━━━━━━━",

			multiple1: "you",
			multiple2: "you guys",

			defaultWelcomeMessage:
				"🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n" +
				"━━━━━━━━━━━━━━━━━━━━━━\n" +
				"👋 Hello {userName}!\n" +
				"💖 Welcome {multiple} to {boxName}!\n\n" +
				"✨ Have a nice {session}!\n" +
				"━━━━━━━━━━━━━━━━━━━━━━"
		}
	},

	onStart: async ({
		threadsData,
		message,
		event,
		api,
		getLang
	}) => {

		if (event.logMessageType == "log:subscribe")
			return async function () {

				const hours = getTime("HH");
				const { threadID } = event;
				const { nickNameBot } = global.GoatBot.config;
				const prefix = global.utils.getPrefix(threadID);

				const dataAddedParticipants =
					event.logMessageData.addedParticipants;

				// Si le bot lui-même vient d'être ajouté
				if (
					dataAddedParticipants.some(
						item => item.userFbId == api.getCurrentUserID()
					)
				) {

					if (nickNameBot)
						api.changeNickname(
							nickNameBot,
							threadID,
							api.getCurrentUserID()
						);

					return message.send(
						getLang("welcomeMessage", prefix)
					);
				}

				// Si de nouveaux membres rejoignent le groupe
				if (!global.temp.welcomeEvent[threadID]) {
					global.temp.welcomeEvent[threadID] = {
						joinTimeout: null,
						dataAddedParticipants: []
					};
				}

				global.temp.welcomeEvent[
					threadID
				].dataAddedParticipants.push(
					...dataAddedParticipants
				);

				clearTimeout(
					global.temp.welcomeEvent[threadID].joinTimeout
				);

				global.temp.welcomeEvent[
					threadID
				].joinTimeout = setTimeout(async function () {

					const threadData =
						await threadsData.get(threadID);

					if (
						threadData.settings.sendWelcomeMessage == false
					)
						return;

					const dataAddedParticipants =
						global.temp.welcomeEvent[
							threadID
						].dataAddedParticipants;

					const dataBanned =
						threadData.data.banned_ban || [];

					const threadName =
						threadData.threadName;

					const userName = [];
					const mentions = [];

					const multiple =
						dataAddedParticipants.length > 1;

					for (
						const user of dataAddedParticipants
					) {

						if (
							dataBanned.some(
								item =>
									item.id == user.userFbId
							)
						)
							continue;

						userName.push(user.fullName);

						mentions.push({
							tag: user.fullName,
							id: user.userFbId
						});
					}

					if (userName.length == 0)
						return;

					let {
						welcomeMessage =
							getLang(
								"defaultWelcomeMessage"
							)
					} = threadData.data;

					const form = {
						mentions:
							welcomeMessage.match(
								/\{userNameTag\}/g
							)
								? mentions
								: null
					};

					welcomeMessage = welcomeMessage

						.replace(
							/\{userName\}|\{userNameTag\}/g,
							userName.join(", ")
						)

						.replace(
							/\{boxName\}|\{threadName\}/g,
							threadName
						)

						.replace(
							/\{multiple\}/g,
							multiple
								? getLang("multiple2")
								: getLang("multiple1")
						)

						.replace(
							/\{session\}/g,
							hours <= 10
								? getLang("session1")
								: hours <= 12
									? getLang("session2")
									: hours <= 18
										? getLang("session3")
										: getLang("session4")
						);

					form.body = welcomeMessage;

					// Pièce jointe de bienvenue
					if (threadData.data.welcomeAttachment) {

						const files =
							threadData.data.welcomeAttachment;

						const attachments =
							files.reduce(
								(acc, file) => {
									acc.push(
										drive.getFile(
											file,
											"stream"
										)
									);

									return acc;
								},
								[]
							);

						form.attachment =
							(
								await Promise.allSettled(
									attachments
								)
							)
								.filter(
									({ status }) =>
										status == "fulfilled"
								)
								.map(
									({ value }) =>
										value
								);
					}

					message.send(form);

					delete global.temp.welcomeEvent[
						threadID
					];

				}, 1500);
			};
	}
};