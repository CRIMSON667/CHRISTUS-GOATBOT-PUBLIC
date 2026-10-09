const { getStreamFromURL, uploadImgbb } = global.utils;

module.exports = {
	config: {
		name: "antichangeinfobox",
		version: "2.0",
		author: "CRIMSON 🩵🪽",
		countDown: 5,
		role: 0,
		description: "Active ou désactive la protection des informations du groupe.",
		category: "box chat",
		guide: {
			fr: "{pn} avt [on/off] : protéger l'avatar du groupe"
				+ "\n{pn} name [on/off] : protéger le nom du groupe"
				+ "\n{pn} nickname [on/off] : protéger les surnoms"
				+ "\n{pn} theme [on/off] : protéger le thème"
				+ "\n{pn} emoji [on/off] : protéger l'emoji du groupe"
		}
	},

	langs: {
		fr: {
			header: "🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n━━━━━━━━━━━━━━━━━━",
			antiChangeAvatarOn: "✅ Protection de l'avatar activée !",
			antiChangeAvatarOff: "🔓 Protection de l'avatar désactivée !",
			missingAvt: "❌ Aucun avatar n'est défini pour ce groupe.",
			antiChangeNameOn: "✅ Protection du nom activée !",
			antiChangeNameOff: "🔓 Protection du nom désactivée !",
			antiChangeNicknameOn: "✅ Protection des surnoms activée !",
			antiChangeNicknameOff: "🔓 Protection des surnoms désactivée !",
			antiChangeThemeOn: "✅ Protection du thème activée !",
			antiChangeThemeOff: "🔓 Protection du thème désactivée !",
			antiChangeEmojiOn: "✅ Protection de l'emoji activée !",
			antiChangeEmojiOff: "🔓 Protection de l'emoji désactivée !",
			antiChangeAvatarAlreadyOn: "⚠️ L'avatar du groupe a été modifié ! Restauration en cours...",
			antiChangeAvatarAlreadyOnButMissingAvt: "⚠️ Impossible de restaurer l'avatar : aucun avatar de référence n'est disponible.",
			antiChangeNameAlreadyOn: "⚠️ Le nom du groupe a été modifié ! Restauration en cours...",
			antiChangeNicknameAlreadyOn: "⚠️ Un surnom a été modifié ! Restauration en cours...",
			antiChangeThemeAlreadyOn: "⚠️ Le thème du groupe a été modifié ! Restauration en cours...",
			antiChangeEmojiAlreadyOn: "⚠️ L'emoji du groupe a été modifié ! Restauration en cours...",
			invalidType: "❌ Type invalide. Utilise : avt, name, nickname, theme ou emoji.",
			invalidState: "❌ État invalide. Utilise on ou off."
		}
	},

	onStart: async function ({ message, event, args, threadsData, getLang }) {
		const { threadID } = event;
		const type = (args[0] || "").toLowerCase();
		const state = (args[1] || "").toLowerCase();

		if (!["on", "off"].includes(state))
			return message.reply(`${getLang("header")}\n${getLang("invalidState")}`);

		const keyMap = {
			avt: "avatar",
			avatar: "avatar",
			image: "avatar",
			name: "name",
			nickname: "nickname",
			theme: "theme",
			emoji: "emoji"
		};

		const key = keyMap[type];
		if (!key)
			return message.reply(`${getLang("header")}\n${getLang("invalidType")}`);

		const data = await threadsData.get(threadID, "data.antiChangeInfoBox", {});

		if (state === "off") {
			delete data[key];
			await threadsData.set(threadID, data, "data.antiChangeInfoBox");
			return message.reply(`${getLang("header")}\n${getLang(`antiChange${key[0].toUpperCase()}${key.slice(1)}Off`)}`);
		}

		let savedValue;

		switch (key) {
			case "avatar": {
				const { imageSrc } = await threadsData.get(threadID);
				if (!imageSrc)
					return message.reply(`${getLang("header")}\n${getLang("missingAvt")}`);

				const uploaded = await uploadImgbb(imageSrc);
				savedValue = uploaded.image.url;
				break;
			}
			case "name": {
				const { threadName } = await threadsData.get(threadID);
				savedValue = threadName;
				break;
			}
			case "nickname": {
				const { members } = await threadsData.get(threadID);
				savedValue = Object.fromEntries(
					members.map(user => [user.userID, user.nickname])
				);
				break;
			}
			case "theme": {
				const { threadThemeID } = await threadsData.get(threadID);
				savedValue = threadThemeID;
				break;
			}
			case "emoji": {
				const { emoji } = await threadsData.get(threadID);
				savedValue = emoji;
				break;
			}
		}

		data[key] = savedValue;
		await threadsData.set(threadID, data, "data.antiChangeInfoBox");

		return message.reply(
			`${getLang("header")}\n${getLang(`antiChange${key[0].toUpperCase()}${key.slice(1)}On`)}`
		);
	},

	onEvent: async function ({ message, event, threadsData, role, api, getLang }) {
		const { threadID, logMessageType, logMessageData, author } = event;

		const eventMap = {
			"log:thread-image": "avatar",
			"log:thread-name": "name",
			"log:user-nickname": "nickname",
			"log:thread-color": "theme",
			"log:thread-icon": "emoji"
		};

		const key = eventMap[logMessageType];
		if (!key)
			return;

		const data = await threadsData.get(threadID, "data.antiChangeInfoBox", {});
		if (!Object.prototype.hasOwnProperty.call(data, key))
			return;

		return async function () {
			const botID = api.getCurrentUserID();

			// Les administrateurs et le bot peuvent modifier les informations.
			if (role >= 1 || author === botID) {
				switch (key) {
					case "avatar": {
						const imageSrc = logMessageData.url;
						if (!imageSrc) {
							await threadsData.set(threadID, "REMOVE", "data.antiChangeInfoBox.avatar");
							return;
						}
						const uploaded = await uploadImgbb(imageSrc);
						await threadsData.set(threadID, uploaded.image.url, "data.antiChangeInfoBox.avatar");
						break;
					}
					case "name":
						await threadsData.set(threadID, logMessageData.name, "data.antiChangeInfoBox.name");
						break;
					case "nickname":
						await threadsData.set(threadID, logMessageData.nickname, `data.antiChangeInfoBox.nickname.${logMessageData.participant_id}`);
						break;
					case "theme":
						await threadsData.set(threadID, logMessageData.theme_id, "data.antiChangeInfoBox.theme");
						break;
					case "emoji":
						await threadsData.set(threadID, logMessageData.thread_icon, "data.antiChangeInfoBox.emoji");
						break;
				}
				return;
			}

			message.reply(`${getLang("header")}\n${getLang(`antiChange${key[0].toUpperCase()}${key.slice(1)}AlreadyOn`)}`);

			try {
				switch (key) {
					case "avatar":
						if (data.avatar === "REMOVE")
							return message.reply(getLang("antiChangeAvatarAlreadyOnButMissingAvt"));
						await api.changeGroupImage(await getStreamFromURL(data.avatar), threadID);
						break;
					case "name":
						await api.setTitle(data.name, threadID);
						break;
					case "nickname": {
						const id = logMessageData.participant_id;
						const nickname = data.nickname[id];
						if (nickname !== undefined)
							await api.changeNickname(nickname, threadID, id);
						break;
					}
					case "theme":
						await api.changeThreadColor(data.theme || "196241301102133", threadID);
						break;
					case "emoji":
						await api.changeThreadEmoji(data.emoji, threadID);
						break;
				}
			}
			catch (error) {
				console.error("[antichangeinfobox] Erreur de restauration :", error);
			}
		};
	}
};