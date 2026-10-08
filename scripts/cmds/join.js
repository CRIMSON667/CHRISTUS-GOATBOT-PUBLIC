module.exports = {
	config: {
		name: "join",
		aliases: ["rejoindre"],
		version: "2.2.0",
		author: "Brayan Slyde",
		role: 1,
		countDown: 5,
		category: "admin",
		shortDescription: "Gérer les groupes du bot",
		longDescription: "Afficher les groupes du bot, ajouter un utilisateur à un groupe ou à tous les groupes, et faire quitter le bot d'un groupe.",
		guide: {
			fr:
				"{pn} : afficher les groupes\n" +
				"{pn} all : ajouter l'utilisateur à tous les groupes\n" +
				"{pn} del <numéro> : faire quitter le bot d'un groupe"
		}
	},

	onStart: async function ({ api, event, args, message }) {

		const header = "🎀 𝑴𝑨𝑹𝑰𝑵 𝑲ＩＴＡＧＡＷＡ";
		const line = "━━━━━━━━━━━━━━━━━━━━━━";

		// ═════════════════════════════
		// 🗑️ FAIRE QUITTER LE BOT
		// ═════════════════════════════
		if (args[0]?.toLowerCase() === "del") {
			const targetNumber = parseInt(args[1]);

			if (!args[1] || isNaN(targetNumber)) {
				return message.reply(
					`${header}\n${line}\n` +
					`❌ Numéro de groupe invalide.\n\n` +
					`Utilisation : join del <numéro>\n` +
					`Exemple : join del 2\n` +
					`${line}`
				);
			}

			try {
				const inbox = await api.getThreadList(100, null, ["INBOX"]);

				const groupList = inbox.filter(
					group => group.isGroup && group.isSubscribed
				);

				const index = targetNumber - 1;

				if (index < 0 || index >= groupList.length) {
					return message.reply(
						`${header}\n${line}\n` +
						`❌ Le groupe numéro ${targetNumber} n'existe pas.\n` +
						`📊 Groupes disponibles : ${groupList.length}\n` +
						`${line}`
					);
				}

				const selectedGroup = groupList[index];
				const groupName =
					selectedGroup.name || "Groupe sans nom";

				await api.sendMessage(
					`👋 Le bot quitte ce groupe sur ordre de l'administrateur.`,
					selectedGroup.threadID
				);

				await api.removeUserFromGroup(
					api.getCurrentUserID(),
					selectedGroup.threadID
				);

				return message.reply(
					`${header}\n${line}\n` +
					`✅ 𝐆𝐑𝐎𝐔𝐏𝐄 𝐐𝐔𝐈𝐓𝐓𝐄́\n\n` +
					`📌 Groupe : ${groupName}\n` +
					`🔢 Numéro : ${targetNumber}\n` +
					`${line}`
				);

			} catch (error) {
				console.error("[JOIN DEL]", error);

				return message.reply(
					`${header}\n${line}\n` +
					`❌ Impossible de faire quitter ce groupe au bot.\n` +
					`${line}`
				);
			}
		}

		// ═════════════════════════════
		// 🌐 AJOUTER À TOUS LES GROUPES
		// ═════════════════════════════
		if (args[0]?.toLowerCase() === "all") {
			try {
				const inbox = await api.getThreadList(100, null, ["INBOX"]);

				const groupList = inbox.filter(
					group => group.isGroup && group.isSubscribed
				);

				if (groupList.length === 0) {
					return message.reply(
						`${header}\n${line}\n` +
						`❌ Aucun groupe disponible.\n` +
						`${line}`
					);
				}

				let success = 0;
				let failed = 0;

				for (const group of groupList) {
					try {
						await api.addUserToGroup(
							event.senderID,
							group.threadID
						);

						success++;
					} catch (error) {
						failed++;
					}
				}

				return message.reply(
					`${header}\n${line}\n` +
					`🌐 𝐀𝐉𝐎𝐔𝐓 𝐆𝐋𝐎𝐁𝐀𝐋\n\n` +
					`👤 Utilisateur : ${event.senderID}\n` +
					`✅ Ajouts réussis : ${success}\n` +
					`❌ Ajouts refusés : ${failed}\n` +
					`📊 Groupes traités : ${groupList.length}\n` +
					`${line}`
				);

			} catch (error) {
				console.error("[JOIN ALL]", error);

				return message.reply(
					`${header}\n${line}\n` +
					`❌ Impossible de traiter l'ajout global.\n` +
					`${line}`
				);
			}
		}

		// ═════════════════════════════
		// 📋 AFFICHER LES GROUPES
		// ═════════════════════════════
		try {
			const inbox = await api.getThreadList(100, null, ["INBOX"]);

			const groupList = inbox.filter(
				group => group.isGroup && group.isSubscribed
			);

			if (groupList.length === 0) {
				return message.reply(
					`${header}\n${line}\n` +
					`❌ Aucun groupe trouvé.\n` +
					`${line}`
				);
			}

			let msg =
				`${header}\n` +
				`${line}\n` +
				`📋 𝐆𝐑𝐎𝐔𝐏𝐄𝐒 𝐃𝐈𝐒𝐏𝐎𝐍𝐈𝐁𝐋𝐄𝐒\n\n`;

			groupList.forEach((group, index) => {
				const name = group.name || "Groupe sans nom";

				const members = Array.isArray(group.participantIDs)
					? group.participantIDs.length
					: "?";

				msg +=
					`【 ${index + 1} 】 ${name}\n` +
					`     Membres : ${members}\n\n`;
			});

			msg +=
				`${line}\n` +
				`↳ Réponds avec le numéro du groupe pour y être ajouté.\n` +
				`↳ Exemple : 3\n\n` +
				`↳ ${getCommandExample("join all")}\n` +
				`${line}`;

			return message.reply(msg, (err, info) => {
				if (err) {
					console.error("[JOIN REPLY]", err);
					return;
				}

				global.GoatBot.onReply.set(info.messageID, {
					commandName: this.config.name,
					messageID: info.messageID,
					author: event.senderID,
					groupList: groupList.map(group => ({
						threadID: group.threadID,
						name: group.name || "Groupe sans nom"
					}))
				});
			});

		} catch (error) {
			console.error("[JOIN LIST]", error);

			return message.reply(
				`${header}\n${line}\n` +
				`❌ Impossible de récupérer les groupes du bot.\n` +
				`${line}`
			);
		}
	},

	// ═════════════════════════════
	// 💬 GESTION DE LA RÉPONSE
	// ═════════════════════════════
	onReply: async function ({ api, event, Reply, message }) {

		const { author, groupList } = Reply;

		const header = "🎀 𝑴𝑨𝑹𝑰𝑵 𝑲ＩＴＡＧＡＷＡ";
		const line = "━━━━━━━━━━━━━━━━━━━━━━";

		if (event.senderID !== author) {
			return message.reply(
				`${header}\n${line}\n` +
				`❌ Cette sélection ne t'appartient pas.\n` +
				`${line}`
			);
		}

		const choice = parseInt(
			(event.body || "").trim()
		);

		if (
			isNaN(choice) ||
			choice < 1 ||
			choice > groupList.length
		) {
			return message.reply(
				`${header}\n${line}\n` +
				`❌ Choix invalide.\n\n` +
				`Entre un numéro entre 1 et ${groupList.length}.\n` +
				`${line}`
			);
		}

		const targetGroup = groupList[choice - 1];
		const groupName = targetGroup.name || "Groupe sans nom";

		try {
			await api.addUserToGroup(
				event.senderID,
				targetGroup.threadID
			);

			await message.reply(
				`${header}\n${line}\n` +
				`✅ 𝐀𝐉𝐎𝐔𝐓 𝐑𝐄́𝐔𝐒𝐒𝐈\n\n` +
				`👤 Tu as été ajouté au groupe :\n` +
				`「 ${groupName} 」\n\n` +
				`🔢 Groupe : ${choice}\n` +
				`${line}`
			);

		} catch (error) {
			console.error("[JOIN ADD]", error);

			await message.reply(
				`${header}\n${line}\n` +
				`❌ Impossible de t'ajouter au groupe.\n\n` +
				`Causes possibles :\n` +
				`• Tu es déjà dans le groupe\n` +
				`• Facebook bloque l'ajout\n` +
				`• Le groupe n'accepte pas les ajouts directs\n` +
				`• Le bot n'a plus accès au groupe\n` +
				`${line}`
			);
		}

		global.GoatBot.onReply.delete(Reply.messageID);
	}
};

function getCommandExample(command) {
	return `Utilise : ${command}`;
}