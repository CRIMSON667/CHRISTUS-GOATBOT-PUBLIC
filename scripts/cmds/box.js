const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

const HEADER =
	"━━━━━━━ 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨 ━━━━━━━";

const FOOTER =
	"━━━━━━━ 𝑴𝑨𝑹𝑰𝑵 𝑬𝑵𝑽 ━━━━━━━";

function marin(text, command = "BOX") {
	return (
		`${HEADER}\n\n` +
		`        [ 𝑪𝑶𝑴𝑴𝑨𝑵𝑫 : ${command.toUpperCase()} ]\n\n` +
		`${text}\n\n` +
		`${FOOTER}`
	);
}

module.exports = {
	config: {
		name: "box",
		aliases: ["thread", "group", "groupe"],
		version: "5.0.0",
		author: "CRIMSON",
		role: 0,
		category: "group",

		description: {
			fr: "Gestion avancée du groupe — Marin Kitagawa Edition",
			en: "Advanced group management — Marin Kitagawa Edition"
		},

		guide: {
			fr: `
{pn}
{pn} help
{pn} info
{pn} name <nom>
{pn} emoji <emoji>
{pn} nick @mention <pseudo>
{pn} theme <id>
{pn} image <lien>
{pn} kick @mention
{pn} admins
{pn} members
{pn} whoami
{pn} me
{pn} search <nom>
			`,

			en: `
{pn}
{pn} help
{pn} info
{pn} name <name>
{pn} emoji <emoji>
{pn} nick @mention <nickname>
{pn} theme <id>
{pn} image <link>
{pn} kick @mention
{pn} admins
{pn} members
{pn} whoami
{pn} me
{pn} search <name>
			`
		}
	},

	langs: {
		fr: {
			noArgs: `✨ 𝑴𝑬𝑵𝑼 𝑴𝑨𝑹𝑰𝑵

📋 info
✏️ name <nom>
😃 emoji <emoji>
👤 nick @membre <pseudo>
🎨 theme <id>
🖼️ image <lien>
🚪 kick @membre
👑 admins
👥 members
💗 whoami / me
🔎 search <nom>

💡 Exemple :
box search Brayan`,

			notAdmin:
				"💢 Désolé %1, seuls les administrateurs du groupe peuvent utiliser cette commande.",

			successName:
				"✨ Le nom du groupe est maintenant : %1",

			successEmoji:
				"💗 L'emoji du groupe est maintenant : %1",

			successNick:
				"👤 Le pseudo de %1 est maintenant : %2",

			successKick:
				"🚪 %1 a été retiré du groupe.",

			successImage:
				"🖼️ La photo du groupe a été mise à jour avec succès !",

			noTarget:
				"💢 Mentionne un membre ou réponds à son message.",

			noImage:
				"🖼️ Envoie une image ou indique un lien d'image.",

			noName:
				"✏️ Indique le nouveau nom du groupe.",

			noEmoji:
				"😃 Indique un emoji.",

			noTheme:
				"🎨 Indique l'ID du thème.",

			noSearch:
				"🔎 Indique le nom à rechercher.",

			userNotFound:
				"❌ Aucun membre trouvé avec ce nom.",

			error:
				"❌ Une erreur est survenue : %1"
		},

		en: {
			noArgs: `✨ 𝑴𝑨𝑹𝑰𝑵 𝑴𝑬𝑵𝑼

📋 info
✏️ name <name>
😃 emoji <emoji>
👤 nick @member <nickname>
🎨 theme <id>
🖼️ image <link>
🚪 kick @member
👑 admins
👥 members
💗 whoami / me
🔎 search <name>

💡 Example:
box search Brayan`,

			notAdmin:
				"💢 Sorry %1, only group administrators can use this command.",

			successName:
				"✨ Group name is now: %1",

			successEmoji:
				"💗 Group emoji is now: %1",

			successNick:
				"👤 Nickname of %1 is now: %2",

			successKick:
				"🚪 %1 has been removed from the group.",

			successImage:
				"🖼️ Group photo successfully updated!",

			noTarget:
				"💢 Mention a member or reply to their message.",

			noImage:
				"🖼️ Send an image or provide an image link.",

			noName:
				"✏️ Provide the new group name.",

			noEmoji:
				"😃 Provide an emoji.",

			noTheme:
				"🎨 Provide the theme ID.",

			noSearch:
				"🔎 Provide the name to search.",

			userNotFound:
				"❌ No member found with that name.",

			error:
				"❌ An error occurred: %1"
		}
	},

	onStart: async function ({
		api,
		event,
		args,
		message,
		getLang,
		role,
		usersData,
		threadsData
	}) {

		const command = args[0]?.toLowerCase();

		try {

			const threadInfo =
				await api.getThreadInfo(event.threadID);

			const isAdmin =
				threadInfo.adminIDs.some(
					admin => admin.id === event.senderID
				);

			const isBotAdmin = role >= 2;

			if (!isAdmin && !isBotAdmin) {

				let name = "Intrus";

				try {
					if (usersData?.getName)
						name = await usersData.getName(
							event.senderID
						);
				} catch {}

				return message.reply(
					marin(
						getLang("notAdmin").replace(
							"%1",
							name
						),
						"ACCESS"
					)
				);
			}

			/*
			==================================================
			HELP
			==================================================
			*/

			if (!command || command === "help") {
				return message.reply(
					marin(
						getLang("noArgs"),
						"HELP"
					)
				);
			}

			/*
			==================================================
			INFO
			==================================================
			*/

			if (command === "info") {

				const text =
					`📌 Nom : ${threadInfo.threadName || "Sans nom"}\n` +
					`🆔 ID : ${event.threadID}\n` +
					`😃 Emoji : ${threadInfo.emoji || "👍"}\n` +
					`👥 Membres : ${threadInfo.participantIDs.length}\n` +
					`👑 Admins : ${threadInfo.adminIDs.length}\n` +
					`💬 Messages : ${threadInfo.messageCount || "N/A"}`;

				return message.reply(
					marin(text, "INFO")
				);
			}

			/*
			==================================================
			NAME
			==================================================
			*/

			if (
				command === "name" ||
				command === "rename"
			) {

				const newName =
					args.slice(1).join(" ");

				if (!newName)
					return message.reply(
						marin(
							getLang("noName"),
							"NAME"
						)
					);

				await api.setTitle(
					newName,
					event.threadID
				);

				return message.reply(
					marin(
						getLang("successName")
							.replace("%1", newName),
						"NAME"
					)
				);
			}

			/*
			==================================================
			EMOJI
			==================================================
			*/

			if (command === "emoji") {

				const emoji = args[1];

				if (!emoji)
					return message.reply(
						marin(
							getLang("noEmoji"),
							"EMOJI"
						)
					);

				await api.changeThreadEmoji(
					emoji,
					event.threadID
				);

				return message.reply(
					marin(
						getLang("successEmoji")
							.replace("%1", emoji),
						"EMOJI"
					)
				);
			}

			/*
			==================================================
			NICK
			==================================================
			*/

			if (
				command === "nick" ||
				command === "nickname" ||
				command === "pseudo"
			) {

				let targetID = null;
				let nickname = "";

				if (event.type === "message_reply") {

					targetID =
						event.messageReply.senderID;

					nickname =
						args.join(" ");

				} else if (
					event.mentions &&
					Object.keys(event.mentions).length
				) {

					targetID =
						Object.keys(event.mentions)[0];

					const mention =
						event.mentions[targetID];

					nickname =
						args
							.join(" ")
							.replace(mention, "")
							.trim();
				}

				if (!targetID)
					return message.reply(
						marin(
							getLang("noTarget"),
							"NICK"
						)
					);

				let targetName = targetID;

				try {
					if (usersData?.getName)
						targetName =
							await usersData.getName(
								targetID
							);
				} catch {}

				await api.changeNickname(
					nickname,
					event.threadID,
					targetID
				);

				return message.reply(
					marin(
						getLang("successNick")
							.replace("%1", targetName)
							.replace(
								"%2",
								nickname || "réinitialisé"
							),
						"NICK"
					)
				);
			}

			/*
			==================================================
			THEME
			==================================================
			*/

			if (command === "theme") {

				const theme = args[1];

				if (!theme)
					return message.reply(
						marin(
							getLang("noTheme"),
							"THEME"
						)
					);

				if (
					typeof api.changeThreadColor !==
					"function"
				) {

					return message.reply(
						marin(
							getLang("error").replace(
								"%1",
								"Cette fonction n'est pas supportée par ton API."
							),
							"THEME"
						)
					);
				}

				await api.changeThreadColor(
					theme,
					event.threadID
				);

				return message.reply(
					marin(
						"🎨 Thème du groupe modifié avec succès !",
						"THEME"
					)
				);
			}

			/*
			==================================================
			IMAGE
			==================================================
			*/

			if (
				command === "image" ||
				command === "avatar"
			) {

				let imageUrl = args[1];

				if (
					event.type === "message_reply" &&
					event.messageReply.attachments?.length
				) {

					imageUrl =
						event.messageReply.attachments[0].url;

				} else if (
					event.attachments?.length
				) {

					imageUrl =
						event.attachments[0].url;
				}

				if (
					!imageUrl ||
					!imageUrl.startsWith("http")
				) {

					return message.reply(
						marin(
							getLang("noImage"),
							"IMAGE"
						)
					);
				}

				const file =
					path.join(
						__dirname,
						`cache_box_${event.threadID}.jpg`
					);

				const response =
					await axios.get(
						imageUrl,
						{
							responseType: "arraybuffer"
						}
					);

				await fs.writeFile(
					file,
					Buffer.from(response.data)
				);

				await api.changeGroupImage(
					fs.createReadStream(file),
					event.threadID
				);

				await fs.unlink(file);

				return message.reply(
					marin(
						getLang("successImage"),
						"IMAGE"
					)
				);
			}

			/*
			==================================================
			KICK
			==================================================
			*/

			if (command === "kick") {

				let targetID = null;

				if (event.type === "message_reply") {

					targetID =
						event.messageReply.senderID;

				} else if (
					event.mentions &&
					Object.keys(event.mentions).length
				) {

					targetID =
						Object.keys(event.mentions)[0];

				} else if (
					args[1] &&
					!isNaN(args[1])
				) {

					targetID = args[1];
				}

				if (!targetID)
					return message.reply(
						marin(
							getLang("noTarget"),
							"KICK"
						)
					);

				let targetName = targetID;

				try {
					if (usersData?.getName)
						targetName =
							await usersData.getName(
								targetID
							);
				} catch {}

				await api.removeUserFromGroup(
					targetID,
					event.threadID
				);

				return message.reply(
					marin(
						getLang("successKick")
							.replace(
								"%1",
								targetName
							),
						"KICK"
					)
				);
			}

			/*
			==================================================
			ADMINS
			==================================================
			*/

			if (command === "admins") {

				let text =
					"👑 𝑨𝑫𝑴𝑰𝑵𝑰𝑺𝑻𝑹𝑨𝑻𝑬𝑼𝑹𝑺\n\n";

				for (
					const admin of threadInfo.adminIDs
				) {

					let name = admin.id;

					try {
						if (usersData?.getName)
							name =
								await usersData.getName(
									admin.id
								);
					} catch {}

					text += `👑 ${name}\n`;
				}

				return message.reply(
					marin(text, "ADMINS")
				);
			}

			/*
			==================================================
			MEMBERS
			==================================================
			*/

			if (command === "members") {

				const members =
					threadInfo.participantIDs;

				let text =
					`👥 𝑴𝑬𝑴𝑩𝑹𝑬𝑺 : ${members.length}\n\n`;

				let count = 0;

				for (const id of members) {

					if (count >= 30) {

						text +=
							`\n... et ${
								members.length - count
							} autres.`;

						break;
					}

					let name = id;

					try {
						if (usersData?.getName)
							name =
								await usersData.getName(id);
					} catch {}

					text += `• ${name}\n`;

					count++;
				}

				return message.reply(
					marin(text, "MEMBERS")
				);
			}

			/*
			==================================================
			WHOAMI / ME
			==================================================
			*/

			if (
				command === "whoami" ||
				command === "me"
			) {

				let name = event.senderID;

				try {
					if (usersData?.getName)
						name =
							await usersData.getName(
								event.senderID
							);
				} catch {}

				const userIsAdmin =
					threadInfo.adminIDs.some(
						admin =>
							admin.id === event.senderID
					);

				let members = [];

				try {
					members =
						await threadsData.get(
							event.threadID,
							"members"
						);
				} catch {}

				if (!Array.isArray(members))
					members = [];

				const usersInGroup =
					threadInfo.participantIDs;

				const arraySort =
					members
						.filter(user =>
							usersInGroup.includes(
								user.userID
							)
						)
						.map(user => ({
							uid: user.userID,
							name:
								user.name ||
								user.userID,
							count:
								Number(user.count) || 0
						}))
						.sort(
							(a, b) =>
								b.count - a.count
						);

				const findUser =
					arraySort.find(
						user =>
							user.uid ==
							event.senderID
					);

				const userMessages =
					findUser
						? findUser.count
						: 0;

				let ranking = "N/A";

				if (findUser) {

					const position =
						arraySort.findIndex(
							user =>
								user.uid ==
								event.senderID
						);

					ranking =
						`#${position + 1} / ${arraySort.length}`;
				}

				const totalMessages =
					arraySort.reduce(
						(total, user) =>
							total + user.count,
						0
					);

				let percentage = "0.0 %";

				if (totalMessages > 0) {

					percentage =
						`${(
							(userMessages /
								totalMessages) *
							100
						).toFixed(1)} %`;
				}

				const text =
					`👤 Nom : ${name}\n` +
					`🆔 ID : ${event.senderID}\n` +
					`👑 Statut : ${
						userIsAdmin
							? "ADMIN"
							: "MEMBRE"
					}\n` +
					`💬 Messages envoyés : ${userMessages}\n` +
					`🏆 Classement : ${ranking}\n` +
					`📊 Part du groupe : ${percentage}\n` +
					`💬 Total messages comptés : ${totalMessages}\n` +
					`👥 Membres comptés : ${arraySort.length}\n` +
					`💬 Groupe : ${
						threadInfo.threadName ||
						"Sans nom"
					}`;

				return message.reply(
					marin(text, "WHOAMI")
				);
			}

			/*
			==================================================
			SEARCH
			==================================================
			*/

			if (command === "search") {

				const searchName =
					args.slice(1).join(" ").trim();

				if (!searchName) {
					return message.reply(
						marin(
							getLang("noSearch"),
							"SEARCH"
						)
					);
				}

				const members =
					threadInfo.participantIDs;

				const query =
					searchName.toLowerCase();

				const found = [];

				for (const id of members) {

					let name = "";

					try {
						if (usersData?.getName) {
							name =
								await usersData.getName(id);
						}
					} catch {}

					if (!name)
						name = id;

					if (
						name
							.toLowerCase()
							.includes(query)
					) {
						found.push({
							id,
							name
						});
					}
				}

				if (!found.length) {
					return message.reply(
						marin(
							getLang("userNotFound"),
							"SEARCH"
						)
					);
				}

				/*
				------------------------------------------
				CHOIX DU PREMIER RÉSULTAT
				------------------------------------------
				*/

				const target =
					found[0];

				let count = 0;
				let ranking = "N/A";

				try {

					const memberData =
						await threadsData.get(
							event.threadID,
							"members"
						);

					if (Array.isArray(memberData)) {

						const sorted =
							memberData
								.filter(user =>
									members.includes(
										user.userID
									)
								)
								.map(user => ({
									uid: user.userID,
									count:
										Number(user.count) ||
										0
								}))
								.sort(
									(a, b) =>
										b.count -
										a.count
								);

						const userStats =
							sorted.find(
								user =>
									user.uid ==
									target.id
							);

						if (userStats) {
							count =
								userStats.count;

							const position =
								sorted.findIndex(
									user =>
										user.uid ==
										target.id
								);

							ranking =
								`#${position + 1} / ${sorted.length}`;
						}
					}

				} catch (err) {

					console.error(
						"[BOX SEARCH COUNT]",
						err
					);
				}

				/*
				------------------------------------------
				GENRE
				------------------------------------------
				*/

				let gender = "Inconnu";

				try {

					const userInfo =
						await api.getUserInfo(
							target.id
						);

					if (
						userInfo &&
						userInfo[target.id]
					) {

						const info =
							userInfo[target.id];

						if (info.gender) {

							if (
								info.gender
									.toLowerCase()
									.includes("male")
							) {
								gender = "Homme";
							}
							else if (
								info.gender
									.toLowerCase()
									.includes("female")
							) {
								gender = "Femme";
							}
							else {
								gender =
									info.gender;
							}
						}
					}

				} catch (err) {

					console.log(
						"[BOX SEARCH GENDER]",
						err.message
					);
				}

				/*
				------------------------------------------
				LINK FACEBOOK
				------------------------------------------
				*/

				const profileLink =
					`https://www.facebook.com/${target.id}`;

				const text =
					`👤 Nom : ${target.name}\n` +
					`🆔 ID : ${target.id}\n` +
					`⚧️ Genre : ${gender}\n` +
					`💬 Messages : ${count}\n` +
					`🏆 Classement : ${ranking}\n` +
					`🔗 Profil : ${profileLink}`;

				return message.reply(
					marin(
						text,
						"SEARCH"
					)
				);
			}

			/*
			==================================================
			COMMANDE INCONNUE
			==================================================
			*/

			return message.reply(
				marin(
					getLang("noArgs"),
					"HELP"
				)
			);

		} catch (err) {

			console.error(
				"[BOX ERROR]",
				err
			);

			return message.reply(
				marin(
					getLang("error").replace(
						"%1",
						err.message ||
						"Erreur inconnue"
					),
					"ERROR"
				)
			);
		}
	}
};
