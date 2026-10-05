const { getTime } = global.utils;

module.exports = {
	config: {
		name: "thread",
		version: "1.5",
		author: "NTKhang",
		countDown: 5,
		role: 0,
		description: {
			fr: "🎀 Gérer les groupes du système du bot",
			en: "Manage group chat in bot system"
		},
		category: "owner",
		guide: {
			fr:
				"🎀 {pn} [find | -f | search | -s] <nom> : rechercher un groupe dans les données du bot"
				+ "\n🎀 {pn} [find | -f | search | -s] [-j | -join] <nom> : rechercher uniquement les groupes où le bot est encore présent"
				+ "\n\n🔨 {pn} [ban | -b] [<tid> | vide] <raison> : bannir un groupe"
				+ "\n📌 Exemple :"
				+ "\n   {pn} ban 3950898668362484 spam bot"
				+ "\n   {pn} ban spam"
				+ "\n\n🔓 {pn} unban [<tid> | vide] : débannir un groupe"
				+ "\n📌 Exemple :"
				+ "\n   {pn} unban 3950898668362484"
				+ "\n   {pn} unban"
				+ "\n\nℹ️ {pn} info [<tid>] : afficher les informations d'un groupe",
			en:
				"🎀 {pn} [find | -f | search | -s] <name> : search group in bot data"
				+ "\n🎀 {pn} [find | -f | search | -s] [-j | -join] <name> : search groups where bot is still present"
				+ "\n\n🔨 {pn} [ban | -b] [<tid> | blank] <reason> : ban a group"
				+ "\n\n🔓 {pn} unban [<tid> | blank] : unban a group"
				+ "\n\nℹ️ {pn} info [<tid>] : show group information"
		}
	},

	langs: {
		fr: {
			noPermission:
				"❌ Tu n'as pas la permission d'utiliser cette fonction.",

			found:
				"🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n━━━━━━━━━━━━━━━━━━━━━━\n🔎 %1 groupe(s) trouvé(s) pour : « %2 »\n\n%3\n━━━━━━━━━━━━━━━━━━━━━━",

			notFound:
				"🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n━━━━━━━━━━━━━━━━━━━━━━\n❌ Aucun groupe ne correspond à : « %1 ».\n━━━━━━━━━━━━━━━━━━━━━━",

			hasBanned:
				"🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n━━━━━━━━━━━━━━━━━━━━━━\n🚫 Ce groupe est déjà banni.\n\n🆔 ID : %1\n👥 Nom : %2\n📝 Raison : %3\n🕒 Date : %4\n━━━━━━━━━━━━━━━━━━━━━━",

			banned:
				"🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n━━━━━━━━━━━━━━━━━━━━━━\n🔨 Groupe banni avec succès.\n\n🆔 ID : %1\n👥 Nom : %2\n📝 Raison : %3\n🕒 Date : %4\n━━━━━━━━━━━━━━━━━━━━━━",

			notBanned:
				"🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n━━━━━━━━━━━━━━━━━━━━━━\n🟢 Le groupe n'est actuellement pas banni.\n\n🆔 ID : %1\n👥 Nom : %2\n━━━━━━━━━━━━━━━━━━━━━━",

			unbanned:
				"🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n━━━━━━━━━━━━━━━━━━━━━━\n🔓 Groupe débanni avec succès.\n\n🆔 ID : %1\n👥 Nom : %2\n━━━━━━━━━━━━━━━━━━━━━━",

			missingReason:
				"❌ La raison du bannissement ne peut pas être vide.",

			info:
				"🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n━━━━━━━━━━━━━━━━━━━━━━\n"
				+ "📊 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐓𝐈𝐎𝐍𝐒 𝐃𝐔 𝐆𝐑𝐎𝐔𝐏𝐄\n\n"
				+ "🆔 ID : %1\n"
				+ "👥 Nom : %2\n"
				+ "📅 Créé le : %3\n"
				+ "👤 Membres : %4\n"
				+ "♂️ Hommes : %5\n"
				+ "♀️ Femmes : %6\n"
				+ "💬 Messages : %7%8\n"
				+ "━━━━━━━━━━━━━━━━━━━━━━"
		},

		en: {
			noPermission:
				"You don't have permission to use this feature",

			found:
				"🔎 Found %1 group(s) matching \"%2\":\n%3",

			notFound:
				"❌ No group found matching: \"%1\"",

			hasBanned:
				"🚫 This group has already been banned.\n\nID: %1\nName: %2\nReason: %3\nTime: %4",

			banned:
				"🔨 Group banned successfully.\n\nID: %1\nName: %2\nReason: %3\nTime: %4",

			notBanned:
				"🟢 This group is not currently banned.\n\nID: %1\nName: %2",

			unbanned:
				"🔓 Group unbanned successfully.\n\nID: %1\nName: %2",

			missingReason:
				"❌ Ban reason cannot be empty.",

			info:
				"🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n━━━━━━━━━━━━━━━━━━━━━━\n"
				+ "📊 𝐆𝐑𝐎𝐔𝐏 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐓𝐈𝐎𝐍\n\n"
				+ "🆔 ID: %1\n"
				+ "👥 Name: %2\n"
				+ "📅 Created: %3\n"
				+ "👤 Members: %4\n"
				+ "♂️ Male: %5\n"
				+ "♀️ Female: %6\n"
				+ "💬 Messages: %7%8\n"
				+ "━━━━━━━━━━━━━━━━━━━━━━"
		}
	},

	onStart: async function ({
		args,
		threadsData,
		message,
		role,
		event,
		getLang
	}) {
		const type = args[0];

		switch (type) {

			// 🔎 Rechercher un groupe
			case "find":
			case "search":
			case "-f":
			case "-s": {
				if (role < 2)
					return message.reply(getLang("noPermission"));

				let allThread = await threadsData.getAll();
				let keyword = args.slice(1).join(" ");

				if (["-j", "-join", "joined"].includes(args[1])) {
					allThread = allThread.filter(thread =>
						thread.members.some(
							member =>
								member.userID == global.GoatBot.botID &&
								member.inGroup
						)
					);

					keyword = args.slice(2).join(" ");
				}

				const result = allThread.filter(
					item =>
						item.threadID.length > 15 &&
						(item.threadName || "")
							.toLowerCase()
							.includes(keyword.toLowerCase())
				);

				const resultText = result.reduce(
					(i, thread) =>
						i +=
							`\n╭─ 👥 ${thread.threadName}` +
							`\n╰─ 🆔 ${thread.threadID}`,
					""
				);

				let msg = "";

				if (result.length > 0)
					msg += getLang(
						"found",
						result.length,
						keyword,
						resultText
					);
				else
					msg += getLang("notFound", keyword);

				return message.reply(msg);
			}

			// 🔨 Bannir un groupe
			case "ban":
			case "-b": {
				if (role < 2)
					return message.reply(getLang("noPermission"));

				let tid;
				let reason;

				if (!isNaN(args[1])) {
					tid = args[1];
					reason = args.slice(2).join(" ");
				}
				else {
					tid = event.threadID;
					reason = args.slice(1).join(" ");
				}

				if (!tid)
					return message.SyntaxError();

				if (!reason)
					return message.reply(getLang("missingReason"));

				reason = reason.replace(/\s+/g, " ");

				const threadData = await threadsData.get(tid);
				const name = threadData.threadName;
				const status = threadData.banned.status;

				if (status)
					return message.reply(
						getLang(
							"hasBanned",
							tid,
							name,
							threadData.banned.reason,
							threadData.banned.date
						)
					);

				const time = getTime("DD/MM/YYYY HH:mm:ss");

				await threadsData.set(tid, {
					banned: {
						status: true,
						reason,
						date: time
					}
				});

				return message.reply(
					getLang(
						"banned",
						tid,
						name,
						reason,
						time
					)
				);
			}

			// 🔓 Débannir un groupe
			case "unban":
			case "-u": {
				if (role < 2)
					return message.reply(getLang("noPermission"));

				let tid;

				if (!isNaN(args[1]))
					tid = args[1];
				else
					tid = event.threadID;

				if (!tid)
					return message.SyntaxError();

				const threadData = await threadsData.get(tid);
				const name = threadData.threadName;
				const status = threadData.banned.status;

				if (!status)
					return message.reply(
						getLang("notBanned", tid, name)
					);

				await threadsData.set(tid, {
					banned: {}
				});

				return message.reply(
					getLang("unbanned", tid, name)
				);
			}

			// ℹ️ Informations du groupe
			case "info":
			case "-i": {
				let tid;

				if (!isNaN(args[1]))
					tid = args[1];
				else
					tid = event.threadID;

				if (!tid)
					return message.SyntaxError();

				const threadData = await threadsData.get(tid);

				const createdDate = getTime(
					threadData.createdAt,
					"DD/MM/YYYY HH:mm:ss"
				);

				const valuesMember = Object.values(
					threadData.members
				).filter(item => item.inGroup);

				const totalBoy = valuesMember.filter(
					item => item.gender == "MALE"
				).length;

				const totalGirl = valuesMember.filter(
					item => item.gender == "FEMALE"
				).length;

				const totalMessage = valuesMember.reduce(
					(i, item) => i += item.count,
					0
				);

				const infoBanned = threadData.banned.status
					? `\n\n🚫 Banned : ${threadData.banned.status}`
						+ `\n📝 Raison : ${threadData.banned.reason}`
						+ `\n🕒 Date : ${threadData.banned.date}`
					: "";

				const msg = getLang(
					"info",
					threadData.threadID,
					threadData.threadName,
					createdDate,
					valuesMember.length,
					totalBoy,
					totalGirl,
					totalMessage,
					infoBanned
				);

				return message.reply(msg);
			}

			default:
				return message.SyntaxError();
		}
	}
};