const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
	config: {
		name: "developer",
		aliases: ["dev"],
		version: "2.0",
		author: "CRIMSON 🩵 & Kitagawa édition 🌼",
		countDown: 5,
		role: 5,

		description: {
			fr: "🎀 Ajouter, retirer ou afficher les développeurs du bot.",
			en: "🎀 Add, remove or list bot developers."
		},

		category: "owner",

		guide: {
			fr:
				"🎀 {pn} [add | -a] <uid | @tag> : Ajouter un développeur" +
				"\n🎀 {pn} [remove | -r] <uid | @tag> : Retirer un développeur" +
				"\n🎀 {pn} [list | -l] : Afficher les développeurs",

			en:
				"🎀 {pn} [add | -a] <uid | @tag> : Add a developer" +
				"\n🎀 {pn} [remove | -r] <uid | @tag> : Remove a developer" +
				"\n🎀 {pn} [list | -l] : List developers"
		}
	},

	langs: {
		fr: {
			added:
				"🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n" +
				"━━━━━━━━━━━━━━━━━━━━━━\n" +
				"✅ Droit développeur ajouté à %1 utilisateur(s) :\n%2",

			alreadyDev:
				"\n\n⚠️ Ces %1 utilisateur(s) sont déjà développeur(s) :\n%2",

			missingIdAdd:
				"🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n" +
				"━━━━━━━━━━━━━━━━━━━━━━\n" +
				"❌ Indique un ID ou mentionne l'utilisateur à ajouter comme développeur.",

			removed:
				"🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n" +
				"━━━━━━━━━━━━━━━━━━━━━━\n" +
				"✅ Droit développeur retiré à %1 utilisateur(s) :\n%2",

			notDev:
				"\n\n⚠️ Ces %1 utilisateur(s) ne sont pas développeur(s) :\n%2",

			missingIdRemove:
				"🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n" +
				"━━━━━━━━━━━━━━━━━━━━━━\n" +
				"❌ Indique un ID ou mentionne l'utilisateur à retirer des développeurs.",

			listDev:
				"🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n" +
				"━━━━━━━━━━━━━━━━━━━━━━\n" +
				"⚙️ 𝑳𝒊𝒔𝒕𝒆 𝒅𝒆𝒔 𝒅𝒆́𝒗𝒆𝒍𝒐𝒑𝒑𝒆𝒖𝒓𝒔\n" +
				"━━━━━━━━━━━━━━━━━━━━━━\n" +
				"%1\n" +
				"━━━━━━━━━━━━━━━━━━━━━━"
		},

		en: {
			added:
				"🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n" +
				"━━━━━━━━━━━━━━━━━━━━━━\n" +
				"✅ Developer role added to %1 user(s):\n%2",

			alreadyDev:
				"\n\n⚠️ These %1 user(s) are already developers:\n%2",

			missingIdAdd:
				"❌ Please provide a user ID or mention a user to add as developer.",

			removed:
				"🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n" +
				"━━━━━━━━━━━━━━━━━━━━━━\n" +
				"✅ Developer role removed from %1 user(s):\n%2",

			notDev:
				"\n\n⚠️ These %1 user(s) are not developers:\n%2",

			missingIdRemove:
				"❌ Please provide a user ID or mention a user to remove as developer.",

			listDev:
				"🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n" +
				"━━━━━━━━━━━━━━━━━━━━━━\n" +
				"⚙️ 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓 𝑳𝒊𝒔𝒕\n" +
				"━━━━━━━━━━━━━━━━━━━━━━\n" +
				"%1\n" +
				"━━━━━━━━━━━━━━━━━━━━━━"
		}
	},

	onStart: async function ({
		message,
		args,
		usersData,
		event,
		getLang
	}) {

		if (!config.devUsers)
			config.devUsers = [];

		switch (args[0]) {

			case "add":
			case "-a": {

				if (args[1]) {

					let uids = [];

					if (Object.keys(event.mentions).length > 0)
						uids = Object.keys(event.mentions);

					else if (event.messageReply)
						uids.push(event.messageReply.senderID);

					else
						uids = args.filter(arg => !isNaN(arg));

					const notDevIds = [];
					const devIds = [];

					for (const uid of uids) {

						if (config.devUsers.includes(uid))
							devIds.push(uid);
						else
							notDevIds.push(uid);
					}

					config.devUsers.push(...notDevIds);

					const getNames = await Promise.all(
						uids.map(uid =>
							usersData
								.getName(uid)
								.then(name => ({
									uid,
									name
								}))
						)
					);

					writeFileSync(
						global.client.dirConfig,
						JSON.stringify(config, null, 2)
					);

					return message.reply(
						(notDevIds.length > 0
							? getLang(
								"added",
								notDevIds.length,
								getNames
									.filter(({ uid }) =>
										notDevIds.includes(uid)
									)
									.map(
										({ uid, name }) =>
											`• ${name} (${uid})`
									)
									.join("\n")
							)
							: "")
						+
						(devIds.length > 0
							? getLang(
								"alreadyDev",
								devIds.length,
								devIds
									.map(uid => `• ${uid}`)
									.join("\n")
							)
							: "")
					);
				}

				return message.reply(
					getLang("missingIdAdd")
				);
			}

			case "remove":
			case "-r": {

				if (args[1]) {

					let uids = [];

					if (Object.keys(event.mentions).length > 0)
						uids = Object.keys(event.mentions);
					else
						uids = args.filter(arg => !isNaN(arg));

					const notDevIds = [];
					const devIds = [];

					for (const uid of uids) {

						if (config.devUsers.includes(uid))
							devIds.push(uid);
						else
							notDevIds.push(uid);
					}

					for (const uid of devIds)
						config.devUsers.splice(
							config.devUsers.indexOf(uid),
							1
						);

					const getNames = await Promise.all(
						devIds.map(uid =>
							usersData
								.getName(uid)
								.then(name => ({
									uid,
									name
								}))
						)
					);

					writeFileSync(
						global.client.dirConfig,
						JSON.stringify(config, null, 2)
					);

					return message.reply(
						(devIds.length > 0
							? getLang(
								"removed",
								devIds.length,
								getNames
									.map(
										({ uid, name }) =>
											`• ${name} (${uid})`
									)
									.join("\n")
							)
							: "")
						+
						(notDevIds.length > 0
							? getLang(
								"notDev",
								notDevIds.length,
								notDevIds
									.map(uid => `• ${uid}`)
									.join("\n")
							)
							: "")
					);
				}

				return message.reply(
					getLang("missingIdRemove")
				);
			}

			case "list":
			case "-l": {

				const getNames = await Promise.all(
					config.devUsers.map(uid =>
						usersData
							.getName(uid)
							.then(name => ({
								uid,
								name
							}))
					)
				);

				return message.reply(
					getLang(
						"listDev",
						getNames
							.map(
								({ uid, name }) =>
									`• ${name} (${uid})`
							)
							.join("\n")
					)
				);
			}

			default:
				return message.SyntaxError();
		}
	}
};