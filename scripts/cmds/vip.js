const { config } = global.GoatBot;
const { writeFileSync, existsSync, readFileSync } = require("fs-extra");
const path = require("path");

const UNTOUCHABLE_UID = "61594978289028";

const tempVipPath = path.join(__dirname, "cache", "tempVips.json");

if (!existsSync(tempVipPath)) {
	writeFileSync(tempVipPath, JSON.stringify({}), "utf-8");
}

const getTempVips = () => {
	try {
		return JSON.parse(readFileSync(tempVipPath, "utf-8"));
	}
	catch (e) {
		return {};
	}
};

const saveTempVips = data => {
	writeFileSync(
		tempVipPath,
		JSON.stringify(data, null, 2),
		"utf-8"
	);
};

// Analyse des durées : 10s, 30m, 2h, 5d
const parseDuration = str => {
	if (!str)
		return null;

	const match = str.match(/^(\d+)([smhd])$/i);

	if (!match)
		return null;

	const value = parseInt(match[1]);
	const unit = match[2].toLowerCase();

	const multipliers = {
		s: 1000,
		m: 60 * 1000,
		h: 60 * 60 * 1000,
		d: 24 * 60 * 60 * 1000
	};

	return {
		ms: value * multipliers[unit],
		raw: `${value}${unit}`
	};
};

// Nettoyage des VIP expirés
const checkAndCleanExpirations = () => {
	const tempVips = getTempVips();
	const now = Date.now();

	let updated = false;
	let currentVips =
		config.vipUser ||
		config.vipuser ||
		[];

	for (const uid in tempVips) {
		if (now >= tempVips[uid].expireAt) {
			currentVips = currentVips
				.map(String)
				.filter(id => id !== String(uid));

			delete tempVips[uid];
			updated = true;
		}
	}

	if (updated) {
		config.vipUser = currentVips;
		config.vipuser = currentVips;

		saveTempVips(tempVips);

		writeFileSync(
			global.client.dirConfig,
			JSON.stringify(config, null, 2)
		);
	}
};

module.exports = {
	config: {
		name: "vip",
		version: "1.0.0",
		author: "Azadx69x",
		editor: "CRIMSON 🪽",
		countDown: 5,
		role: 2,
		description: {
			fr: "💎 Gérer les utilisateurs VIP avec des durées temporaires",
			en: "Manage VIP users with temporary durations"
		},
		category: "owner",
		guide: {
			fr:
				"🎀 {pn} add <uid|@tag> [durée]\n"
				+ "🎀 {pn} remove <uid|@tag>\n"
				+ "🎀 {pn} list\n\n"
				+ "⏳ Durées : 10s / 30m / 2h / 1d",
			en:
				"{pn} add <uid|@tag> [duration]\n"
				+ "{pn} remove <uid|@tag>\n"
				+ "{pn} list"
		}
	},

	onStart: async function ({
		message,
		args,
		usersData,
		event,
		api
	}) {
		checkAndCleanExpirations();

		if (!config.vipUser)
			config.vipUser = [];

		if (!config.vipuser)
			config.vipuser = config.vipUser;

		const saveConfig = () => {
			config.vipuser = config.vipUser;

			writeFileSync(
				global.client.dirConfig,
				JSON.stringify(config, null, 2)
			);
		};

		const formatLayout = (title, body) =>
			`🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n` +
			`━━━━━━━━━━━━━━━━━━━━━━\n` +
			`💎 𝐕𝐈𝐏 • ${title}\n` +
			`━━━━━━━━━━━━━━━━━━━━━━\n` +
			body +
			`\n━━━━━━━━━━━━━━━━━━━━━━\n` +
			`🪽 𝐂𝐑𝐈𝐌𝐒𝐎𝐍`;

		const getUserInfo = async uid => {
			try {
				try {
					const name = await usersData.getName(uid);

					if (
						name &&
						name !== "Unknown User" &&
						name !== "null"
					) {
						return {
							uid,
							name
						};
					}
				}
				catch {}

				try {
					const info = await api.getUserInfo(uid);

					if (info && info[uid]) {
						return {
							uid,
							name:
								info[uid].name ||
								"Utilisateur inconnu"
						};
					}
				}
				catch {}

				return {
					uid,
					name: `User_${String(uid).slice(0, 8)}`
				};
			}
			catch {
				return {
					uid,
					name: `User_${String(uid).slice(0, 8)}`
				};
			}
		};

		switch (args[0]?.toLowerCase()) {

			// 💎 AJOUT VIP
			case "add":
			case "-a": {
				let uids = [];
				let durationArg = null;

				if (
					Object.keys(event.mentions || {}).length > 0
				) {
					uids = Object.keys(event.mentions);
					durationArg = args[args.length - 1];
				}
				else if (event.messageReply) {
					uids.push(event.messageReply.senderID);
					durationArg = args[1];
				}
				else if (args.length > 1) {
					const possibleDuration =
						args[args.length - 1];

					if (/^\d+[smhd]$/i.test(possibleDuration)) {
						durationArg = possibleDuration;

						uids = args
							.slice(1, -1)
							.filter(arg => !isNaN(arg));
					}
					else {
						uids = args
							.slice(1)
							.filter(arg => !isNaN(arg));
					}
				}
				else if (args.length === 1) {
					uids.push(event.senderID);
				}

				if (uids.length === 0) {
					return message.reply(
						formatLayout(
							"ERREUR",
							"⚠️ Mentionne quelqu'un, réponds à un message ou indique un UID."
						)
					);
				}

				const parsedDuration =
					parseDuration(durationArg);

				const tempVips = getTempVips();
				const added = [];

				for (const uid of uids) {
					const uidStr = String(uid);

					if (
						!config.vipUser
							.map(String)
							.includes(uidStr)
					) {
						config.vipUser.push(uidStr);
					}

					if (parsedDuration) {
						tempVips[uidStr] = {
							addedAt: Date.now(),
							expireAt:
								Date.now() +
								parsedDuration.ms,
							durationRaw:
								parsedDuration.raw
						};
					}
					else {
						delete tempVips[uidStr];
					}

					added.push(uidStr);
				}

				saveConfig();
				saveTempVips(tempVips);

				const details =
					await Promise.all(
						added.map(async uid => {
							const user =
								await getUserInfo(uid);

							const exp =
								tempVips[uid]
									? `⏳ Expire dans : ${tempVips[uid].durationRaw}`
									: "♾️ Permanent";

							return (
								`👤 ${user.name}\n` +
								`🆔 ${uid}\n` +
								`${exp}`
							);
						})
					);

				return message.reply(
					formatLayout(
						"ACCÈS ACCORDÉ 💎",
						`✨ VIP attribué avec succès !\n\n${details.join("\n\n")}`
					)
				);
			}

			// ✂️ RETRAIT VIP
			case "remove":
			case "-r": {
				let uids = [];

				if (
					Object.keys(event.mentions || {}).length > 0
				) {
					uids = Object.keys(event.mentions);
				}
				else if (event.messageReply) {
					uids.push(event.messageReply.senderID);
				}
				else if (args.length > 1) {
					uids = args
						.slice(1)
						.filter(arg => !isNaN(arg));
				}

				if (uids.length === 0) {
					return message.reply(
						formatLayout(
							"ERREUR",
							"⚠️ Mentionne un membre ou indique un UID à retirer."
						)
					);
				}

				// 🛡️ Protection UID absolue
				if (
					uids
						.map(String)
						.includes(UNTOUCHABLE_UID)
				) {
					return message.reply(
						formatLayout(
							"PROTECTION 🛡️",
							`⛔ Action bloquée.\n\n🛡️ UID protégé : ${UNTOUCHABLE_UID}\n\nCet utilisateur ne peut pas être retiré de la liste VIP.`
						)
					);
				}

				const tempVips = getTempVips();
				const removed = [];

				for (const uid of uids) {
					const uidStr = String(uid);

					const idx =
						config.vipUser
							.map(String)
							.indexOf(uidStr);

					if (idx !== -1) {
						config.vipUser.splice(idx, 1);

						delete tempVips[uidStr];

						removed.push(uidStr);
					}
				}

				if (removed.length === 0) {
					return message.reply(
						formatLayout(
							"ERREUR",
							"❌ Ce membre n'est pas dans la liste VIP."
						)
					);
				}

				saveConfig();
				saveTempVips(tempVips);

				const removedNames =
					await Promise.all(
						removed.map(async uid => {
							const user =
								await getUserInfo(uid);

							return (
								`👤 ${user.name}\n` +
								`🆔 ${uid}`
							);
						})
					);

				return message.reply(
					formatLayout(
						"VIP RETIRÉ ✂️",
						`🔻 Accès VIP retiré pour :\n\n${removedNames.join("\n\n")}`
					)
				);
			}

			// 📋 LISTE VIP
			case "list":
			case "-l": {
				const list = config.vipUser;

				if (!list || list.length === 0) {
					return message.reply(
						formatLayout(
							"LISTE VIDE",
							"📭 Aucun membre VIP enregistré."
						)
					);
				}

				const tempVips = getTempVips();
				const now = Date.now();

				const formattedList =
					await Promise.all(
						list.map(async (uid, index) => {
							const user =
								await getUserInfo(uid);

							const uidStr = String(uid);

							let badge =
								"♾️ [Permanent]";

							if (
								uidStr ===
								UNTOUCHABLE_UID
							) {
								badge =
									"🛡️ [Intouchable]";
							}
							else if (
								tempVips[uidStr]
							) {
								const remainingMs =
									tempVips[uidStr]
										.expireAt -
									now;

								const remainingMin =
									Math.max(
										0,
										Math.ceil(
											remainingMs /
												(1000 * 60)
										)
									);

								badge =
									`⏳ [Expire dans ~${remainingMin} min]`;
							}

							return (
								`${index + 1}. 👤 ${user.name}\n` +
								`   🆔 ${uidStr}\n` +
								`   ${badge}`
							);
						})
					);

				return message.reply(
					formatLayout(
						"MEMBRES VIP 💎",
						formattedList.join("\n\n")
					)
				);
			}

			// 📖 AIDE
			default:
				return message.reply(
					formatLayout(
						"UTILISATION",
						"💎 vip add @tag 30m\n" +
						"💎 vip add @tag 2h\n" +
						"💎 vip add @tag 1d\n" +
						"♾️ vip add @tag → VIP permanent\n" +
						"✂️ vip remove @tag → Retirer le VIP\n" +
						"📋 vip list → Voir les VIPs"
					)
				);
		}
	}
};