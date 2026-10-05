const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
	config: {
		name: "premium",
		aliases: ["prem"],
		version: "1.1",
		author: "NeoKEX • fixed by Christus",
		countDown: 5,
		role: 2,

		description: {
			vi: "Thêm, xóa quyền premium user với thời gian",
			en: "Add, remove premium user role with time duration",
			fr: "Ajouter, retirer et gérer le statut Premium avec une durée"
		},

		category: "owner",

		guide: {
			vi:
				"   {pn} [add | -a] <uid | @tag> [time]: Thêm quyền premium cho người dùng" +
				"\n   Time: số ngày (1d), giờ (2h), phút (30m) hoặc permanent" +
				"\n   Ví dụ: {pn} add @user 7d (7 ngày)" +
				"\n   {pn} [remove | -r] <uid | @tag>: Xóa quyền premium của người dùng" +
				"\n   {pn} [list | -l]: Liệt kê danh sách premium users" +
				"\n   {pn} [check | -c] <uid | @tag>: Kiểm tra thời gian premium còn lại",

			en:
				"   {pn} [add | -a] <uid | @tag> [time]: Add premium role for user" +
				"\n   Time: days (1d), hours (2h), minutes (30m) or permanent" +
				"\n   Example: {pn} add @user 7d (7 days)" +
				"\n   {pn} [remove | -r] <uid | @tag>: Remove premium role of user" +
				"\n   {pn} [list | -l]: List all premium users" +
				"\n   {pn} [check | -c] <uid | @tag>: Check remaining premium time",

			fr:
				"   {pn} [add | -a] <uid | @tag> [durée] : Ajouter le Premium" +
				"\n   Durée : jours (7d), heures (2h), minutes (30m) ou permanent" +
				"\n   Exemple : {pn} add @user 7d" +
				"\n   {pn} [remove | -r] <uid | @tag> : Retirer le Premium" +
				"\n   {pn} [list | -l] : Afficher les utilisateurs Premium" +
				"\n   {pn} [check | -c] <uid | @tag> : Vérifier le Premium"
		}
	},

	langs: {
		fr: {
			header: "🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨",
			line: "━━━━━━━━━━━━━━━━━━━━━━",

			added:
				"✨ %1 utilisateur(s) ont reçu le statut Premium :\n\n%2",

			alreadyPremium:
				"\n\n🌸 %1 utilisateur(s) possèdent déjà le Premium :\n%2",

			missingIdAdd:
				"⚠️ Mentionne un utilisateur, réponds à son message ou indique son UID !",

			removed:
				"✂️ %1 utilisateur(s) ont perdu leur statut Premium :\n\n%2",

			notPremium:
				"\n\n💬 %1 utilisateur(s) n'ont pas le Premium :\n%2",

			missingIdRemove:
				"⚠️ Mentionne ou indique l'UID de l'utilisateur à retirer !",

			listPremium:
				"👑 『𝗟𝗜𝗦𝗧𝗘 𝗣𝗥𝗘𝗠𝗜𝗨𝗠』\n\n%1",

			premiumInfo:
				"🔎 『𝗜𝗡𝗙𝗢 𝗣𝗥𝗘𝗠𝗜𝗨𝗠』\n\n" +
				"👤 Utilisateur : %1\n" +
				"✨ Statut : %2\n" +
				"⏳ Temps restant : %3",

			invalidTime:
				"⚠️ Format de durée invalide !\n\n" +
				"Utilise par exemple :\n" +
				"• 7d → 7 jours\n" +
				"• 2h → 2 heures\n" +
				"• 30m → 30 minutes\n" +
				"• permanent → illimité",

			permanent:
				"♾️ Permanent",

			expires:
				"⏳ %1 restant",

			expired:
				"❌ Expiré"
		},

		en: {
			header: "🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨",
			line: "━━━━━━━━━━━━━━━━━━━━━━",

			added:
				"✨ Added Premium to %1 user(s):\n\n%2",

			alreadyPremium:
				"\n\n🌸 %1 user(s) already have Premium:\n%2",

			missingIdAdd:
				"⚠️ Mention a user, reply to their message or provide their UID!",

			removed:
				"✂️ Removed Premium from %1 user(s):\n\n%2",

			notPremium:
				"\n\n💬 %1 user(s) don't have Premium:\n%2",

			missingIdRemove:
				"⚠️ Mention or provide the UID of the user to remove!",

			listPremium:
				"👑 『𝗣𝗥𝗘𝗠𝗜𝗨𝗠 𝗟𝗜𝗦𝗧』\n\n%1",

			premiumInfo:
				"🔎 『𝗣𝗥𝗘𝗠𝗜𝗨𝗠 𝗜𝗡𝗙𝗢』\n\n" +
				"👤 User: %1\n" +
				"✨ Status: %2\n" +
				"⏳ Remaining: %3",

			invalidTime:
				"⚠️ Invalid time format!\n\n" +
				"Use:\n" +
				"• 7d → 7 days\n" +
				"• 2h → 2 hours\n" +
				"• 30m → 30 minutes\n" +
				"• permanent → unlimited",

			permanent:
				"♾️ Permanent",

			expires:
				"⏳ %1 remaining",

			expired:
				"❌ Expired"
		}
	},

	onStart: async function ({
		message,
		args,
		usersData,
		event,
		getLang
	}) {
		if (!config.premium)
			config.premium = [];

		const formatLayout = (title, body) =>
			`${getLang("header")}\n` +
			`${getLang("line")}\n\n` +
			`${title}\n\n` +
			`${body}`;

		const parseTime = (timeStr) => {
			if (!timeStr || timeStr === "permanent")
				return null;

			const match =
				timeStr.match(/^(\d+)([dhm])$/);

			if (!match)
				return false;

			const value = parseInt(match[1]);
			const unit = match[2];

			const multipliers = {
				m: 60000,
				h: 3600000,
				d: 86400000
			};

			return Date.now() +
				(value * multipliers[unit]);
		};

		const getTimeRemaining = (expireTime) => {
			if (!expireTime)
				return getLang("permanent");

			const remaining =
				expireTime - Date.now();

			if (remaining <= 0)
				return getLang("expired");

			const days =
				Math.floor(remaining / 86400000);

			const hours =
				Math.floor(
					(remaining % 86400000) / 3600000
				);

			const minutes =
				Math.floor(
					(remaining % 3600000) / 60000
				);

			if (days > 0)
				return getLang(
					"expires",
					`${days}j ${hours}h`
				);

			if (hours > 0)
				return getLang(
					"expires",
					`${hours}h ${minutes}min`
				);

			return getLang(
				"expires",
				`${minutes}min`
			);
		};

		switch (args[0]) {

			// ═══════════════════════
			// ADD PREMIUM
			// ═══════════════════════

			case "add":
			case "-a": {

				if (!args[1])
					return message.reply(
						formatLayout(
							"⚠️ 𝗔𝗝𝗢𝗨𝗧 𝗣𝗥𝗘𝗠𝗜𝗨𝗠",
							getLang("missingIdAdd")
						)
					);

				let uids = [];
				let timeArg = null;

				if (
					Object.keys(
						event.mentions || {}
					).length > 0
				) {
					uids =
						Object.keys(event.mentions);

					const lastArg =
						args[args.length - 1];

					if (
						!Object.keys(
							event.mentions
						).includes(lastArg) &&
						lastArg.match(
							/^(\d+)([dhm])$/
						)
					) {
						timeArg = lastArg;
					}
				}

				else if (event.messageReply) {
					uids.push(
						event.messageReply.senderID
					);

					timeArg = args[1];
				}

				else {
					uids =
						args.filter(
							arg => !isNaN(arg)
						);

					const lastArg =
						args[args.length - 1];

					if (
						!uids.includes(lastArg) &&
						lastArg.match(
							/^(\d+)([dhm])$/
						)
					) {
						timeArg = lastArg;
					}
				}

				if (
					!timeArg ||
					timeArg === "permanent"
				) {
					timeArg = "permanent";
				}

				const expireTime =
					parseTime(timeArg);

				if (expireTime === false) {
					return message.reply(
						formatLayout(
							"⚠️ 𝗗𝗨𝗥𝗘́𝗘 𝗜𝗡𝗩𝗔𝗟𝗜𝗗𝗘",
							getLang("invalidTime")
						)
					);
				}

				const notPremiumIds = [];
				const premiumIds = [];

				for (const uid of uids) {
					if (
						config.premium.includes(uid)
					)
						premiumIds.push(uid);
					else
						notPremiumIds.push(uid);
				}

				config.premium.push(
					...notPremiumIds
				);

				for (
					const uid of notPremiumIds
				) {
					await usersData.set(
						uid,
						expireTime,
						"data.premiumExpireTime"
					);
				}

				const getNames =
					await Promise.all(
						notPremiumIds.map(
							uid =>
								usersData
									.getName(uid)
									.then(
										name => ({
											uid,
											name
										})
									)
						)
					);

				writeFileSync(
					global.client.dirConfig,
					JSON.stringify(
						config,
						null,
						2
					)
				);

				const timeInfo =
					expireTime
						? getTimeRemaining(
							expireTime
						)
						: getLang("permanent");

				return message.reply(
					formatLayout(
						"✨ 𝗣𝗥𝗘𝗠𝗜𝗨𝗠 𝗔𝗖𝗧𝗜𝗩𝗘́",
						(notPremiumIds.length > 0
							? getLang(
								"added",
								notPremiumIds.length,
								getNames
									.map(
										({ uid, name }) =>
											`• ${name} (${uid}) - ${timeInfo}`
									)
									.join("\n")
							)
							: "")
						+
						(premiumIds.length > 0
							? getLang(
								"alreadyPremium",
								premiumIds.length,
								premiumIds
									.map(
										uid =>
											`• ${uid}`
									)
									.join("\n")
							)
							: "")
					)
				);
			}

			// ═══════════════════════
			// REMOVE PREMIUM
			// ═══════════════════════

			case "remove":
			case "-r": {

				if (!args[1])
					return message.reply(
						formatLayout(
							"⚠️ 𝗥𝗘𝗧𝗥𝗔𝗜𝗧 𝗣𝗥𝗘𝗠𝗜𝗨𝗠",
							getLang("missingIdRemove")
						)
					);

				let uids = [];

				if (
					Object.keys(
						event.mentions || {}
					).length > 0
				)
					uids =
						Object.keys(event.mentions);

				else if (event.messageReply)
					uids.push(
						event.messageReply.senderID
					);

				else
					uids =
						args.filter(
							arg => !isNaN(arg)
						);

				const notPremiumIds = [];
				const premiumIds = [];

				for (const uid of uids) {
					if (
						config.premium.includes(uid)
					)
						premiumIds.push(uid);
					else
						notPremiumIds.push(uid);
				}

				for (
					const uid of premiumIds
				) {
					config.premium.splice(
						config.premium.indexOf(uid),
						1
					);

					await usersData.set(
						uid,
						null,
						"data.premiumExpireTime"
					);
				}

				const getNames =
					await Promise.all(
						premiumIds.map(
							uid =>
								usersData
									.getName(uid)
									.then(
										name => ({
											uid,
											name
										})
									)
						)
					);

				writeFileSync(
					global.client.dirConfig,
					JSON.stringify(
						config,
						null,
						2
					)
				);

				return message.reply(
					formatLayout(
						"✂️ 𝗣𝗥𝗘𝗠𝗜𝗨𝗠 𝗥𝗘𝗧𝗜𝗥𝗘́",
						(premiumIds.length > 0
							? getLang(
								"removed",
								premiumIds.length,
								getNames
									.map(
										({ uid, name }) =>
											`• ${name} (${uid})`
									)
									.join("\n")
							)
							: "")
						+
						(notPremiumIds.length > 0
							? getLang(
								"notPremium",
								notPremiumIds.length,
								notPremiumIds
									.map(
										uid =>
											`• ${uid}`
									)
									.join("\n")
							)
							: "")
					)
				);
			}

			// ═══════════════════════
			// LIST PREMIUM
			// ═══════════════════════

			case "list":
			case "-l": {

				const premiumList =
					await Promise.all(
						config.premium.map(
							async uid => {
								const name =
									await usersData
										.getName(uid);

								const expireTime =
									await usersData.get(
										uid,
										"data.premiumExpireTime"
									);

								const timeInfo =
									getTimeRemaining(
										expireTime
									);

								return (
									`• ${name} (${uid})\n` +
									`  └─ ⏳ ${timeInfo}`
								);
							}
						)
					);

				return message.reply(
					formatLayout(
						"👑 𝗟𝗜𝗦𝗧𝗘 𝗣𝗥𝗘𝗠𝗜𝗨𝗠",
						premiumList.length > 0
							? premiumList.join("\n\n")
							: "📭 Aucun utilisateur Premium."
					)
				);
			}

			// ═══════════════════════
			// CHECK PREMIUM
			// ═══════════════════════

			case "check":
			case "-c": {

				let uid;

				if (
					Object.keys(
						event.mentions || {}
					).length > 0
				)
					uid =
						Object.keys(
							event.mentions
						)[0];

				else if (event.messageReply)
					uid =
						event.messageReply.senderID;

				else if (
					args[1] &&
					!isNaN(args[1])
				)
					uid = args[1];

				else
					uid = event.senderID;

				const name =
					await usersData.getName(uid);

				const isPremium =
					config.premium.includes(uid);

				const expireTime =
					await usersData.get(
						uid,
						"data.premiumExpireTime"
					);

				const status =
					isPremium
						? "💎 Premium"
						: "❌ Non-Premium";

				const timeInfo =
					isPremium
						? getTimeRemaining(
							expireTime
						)
						: "N/A";

				return message.reply(
					formatLayout(
						"🔎 𝗩𝗘́𝗥𝗜𝗙𝗜𝗖𝗔𝗧𝗜𝗢𝗡 𝗣𝗥𝗘𝗠𝗜𝗨𝗠",
						getLang(
							"premiumInfo",
							name,
							status,
							timeInfo
						)
					)
				);
			}

			default:
				return message.SyntaxError();
		}
	}
};