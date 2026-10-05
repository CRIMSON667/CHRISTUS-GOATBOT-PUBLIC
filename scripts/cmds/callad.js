const { getStreamsFromAttachment, log } = global.utils;

const mediaTypes = ["photo", "png", "animated_image", "video", "audio"];

module.exports = {
	config: {
		name: "callad",
		version: "2.0",
		author: "Crimson × Kitagawa édition",
		countDown: 5,
		role: 0,

		description: {
			fr: "🎀 Contacter les administrateurs du bot : signalement, suggestion, bug ou message.",
			en: "🎀 Send a report, suggestion, bug or message to the bot administrators."
		},

		category: "contacts admin",

		guide: {
			fr: "🎀 {pn} <ton message>",
			en: "🎀 {pn} <your message>"
		}
	},

	langs: {
		fr: {
			missingMessage:
				"🎀 𝑴𝒂𝒓𝒊𝒏 𝑲𝒊𝒕𝒂𝒈𝒂𝒘𝒂\n" +
				"━━━━━━━━━━━━━━━━━━━━━━\n" +
				"❌ Tu dois écrire un message à envoyer aux admins !",

			sendByGroup:
				"\n🏠 Groupe : %1\n🆔 Thread ID : %2",

			sendByUser:
				"\n👤 Message envoyé en privé",

			content:
				"\n\n💌 𝑴𝒆𝒔𝒔𝒂𝒈𝒆\n" +
				"━━━━━━━━━━━━━━━━━━━━━━\n" +
				"%1\n" +
				"━━━━━━━━━━━━━━━━━━━━━━\n" +
				"↩️ Réponds à ce message pour répondre à l'utilisateur.",

			success:
				"🎀 𝑴𝒂𝒓𝒊𝒏 𝑲𝒊𝒕𝒂𝒈𝒂𝒘𝒂\n" +
				"━━━━━━━━━━━━━━━━━━━━━━\n" +
				"✅ Ton message a été envoyé à %1 admin(s) !\n\n" +
				"%2",

			failed:
				"🎀 𝑴𝒂𝒓𝒊𝒏 𝑲𝒊𝒕𝒂𝒈𝒂𝒘𝒂\n" +
				"━━━━━━━━━━━━━━━━━━━━━━\n" +
				"❌ Impossible d'envoyer le message à %1 admin(s).\n\n" +
				"%2\n\n" +
				"⚠️ Consulte la console pour plus de détails.",

			reply:
				"📍 𝑹𝒆́𝒑𝒐𝒏𝒔𝒆 𝒅𝒆 𝒍'𝒂𝒅𝒎𝒊𝒏 %1\n" +
				"━━━━━━━━━━━━━━━━━━━━━━\n" +
				"%2\n" +
				"━━━━━━━━━━━━━━━━━━━━━━\n" +
				"↩️ Réponds à ce message pour continuer la conversation.",

			replySuccess:
				"🎀 Réponse envoyée à l'utilisateur avec succès ! ✨",

			feedback:
				"📝 𝑹𝒆𝒕𝒐𝒖𝒓 𝒅𝒆 𝒍'𝒖𝒕𝒊𝒍𝒊𝒔𝒂𝒕𝒆𝒖𝒓 %1\n" +
				"🆔 User ID : %2%3\n\n" +
				"💌 𝑴𝒆𝒔𝒔𝒂𝒈𝒆\n" +
				"━━━━━━━━━━━━━━━━━━━━━━\n" +
				"%4\n" +
				"━━━━━━━━━━━━━━━━━━━━━━\n" +
				"↩️ Réponds à ce message pour envoyer une réponse à l'utilisateur.",

			replyUserSuccess:
				"🎀 Ta réponse a été envoyée à l'admin avec succès ! ✨",

			noAdmin:
				"🎀 Oups... Aucun administrateur n'est actuellement configuré pour le bot."
		},

		en: {
			missingMessage: "Please enter the message you want to send to admin.",
			sendByGroup: "\n🏠 Group: %1\n🆔 Thread ID: %2",
			sendByUser: "\n👤 Sent privately",
			content:
				"\n\n💌 Message\n━━━━━━━━━━━━━━━━━━━━━━\n%1\n━━━━━━━━━━━━━━━━━━━━━━\n↩️ Reply to this message to respond to the user.",
			success:
				"🎀 𝑴𝒂𝒓𝒊𝒏 𝑲𝒊𝒕𝒂𝒈𝒂𝒘𝒂\n━━━━━━━━━━━━━━━━━━━━━━\n✅ Your message was sent to %1 admin(s)!\n\n%2",
			failed:
				"❌ Failed to send your message to %1 admin(s).\n\n%2",
			reply:
				"📍 Reply from admin %1\n━━━━━━━━━━━━━━━━━━━━━━\n%2\n━━━━━━━━━━━━━━━━━━━━━━",
			replySuccess: "🎀 Reply sent successfully!",
			feedback:
				"📝 User feedback from %1\n🆔 User ID: %2%3\n\n💌 Message\n━━━━━━━━━━━━━━━━━━━━━━\n%4\n━━━━━━━━━━━━━━━━━━━━━━",
			replyUserSuccess: "🎀 Your reply was sent successfully!",
			noAdmin: "🎀 No bot administrator is currently configured."
		}
	},

	onStart: async function ({
		args,
		message,
		event,
		usersData,
		threadsData,
		api,
		commandName,
		getLang
	}) {
		const { config } = global.GoatBot;

		if (!args[0])
			return message.reply(getLang("missingMessage"));

		const { senderID, threadID, isGroup } = event;

		if (!config.adminBot || config.adminBot.length === 0)
			return message.reply(getLang("noAdmin"));

		const senderName = await usersData.getName(senderID);

		const msg =
			"🎀 𝑴𝒂𝒓𝒊𝒏 𝑲𝒊𝒕𝒂𝒈𝒂𝒘𝒂\n" +
			"━━━━━━━━━━━━━━━━━━━━━━" +
			`\n👤 Utilisateur : ${senderName}` +
			`\n🆔 User ID : ${senderID}` +
			(
				isGroup
					? getLang(
						"sendByGroup",
						(await threadsData.get(threadID)).threadName,
						threadID
					)
					: getLang("sendByUser")
			);

		const formMessage = {
			body: msg + getLang("content", args.join(" ")),
			mentions: [{
				id: senderID,
				tag: senderName
			}],
			attachment: await getStreamsFromAttachment(
				[
					...event.attachments,
					...(event.messageReply?.attachments || [])
				].filter(item => mediaTypes.includes(item.type))
			)
		};

		const successIDs = [];
		const failedIDs = [];

		const adminNames = await Promise.all(
			config.adminBot.map(async item => ({
				id: item,
				name: await usersData.getName(item)
			}))
		);

		for (const uid of config.adminBot) {
			try {
				const messageSend = await api.sendMessage(
					formMessage,
					uid
				);

				successIDs.push(uid);

				global.GoatBot.onReply.set(messageSend.messageID, {
					commandName,
					messageID: messageSend.messageID,
					threadID,
					messageIDSender: event.messageID,
					type: "userCallAdmin"
				});
			}
			catch (err) {
				failedIDs.push({
					adminID: uid,
					error: err
				});
			}
		}

		let msg2 = "";

		if (successIDs.length > 0) {
			msg2 += getLang(
				"success",
				successIDs.length,
				adminNames
					.filter(item => successIDs.includes(item.id))
					.map(item => `👤 ${item.name} (<@${item.id}>)`)
					.join("\n")
			);
		}

		if (failedIDs.length > 0) {
			msg2 += getLang(
				"failed",
				failedIDs.length,
				failedIDs
					.map(item =>
						`👤 <@${item.adminID}> (${adminNames.find(
							item2 => item2.id == item.adminID
						)?.name || item.adminID})`
					)
					.join("\n")
			);

			log.err("CALL ADMIN", failedIDs);
		}

		return message.reply({
			body: msg2,
			mentions: adminNames.map(item => ({
				id: item.id,
				tag: item.name
			}))
		});
	},

	onReply: async function ({
		args,
		event,
		api,
		message,
		Reply,
		usersData,
		commandName,
		getLang
	}) {
		const {
			type,
			threadID,
			messageIDSender
		} = Reply;

		const senderName = await usersData.getName(event.senderID);
		const { isGroup } = event;

		switch (type) {

			case "userCallAdmin": {
				const formMessage = {
					body: getLang(
						"reply",
						senderName,
						args.join(" ")
					),

					mentions: [{
						id: event.senderID,
						tag: senderName
					}],

					attachment: await getStreamsFromAttachment(
						event.attachments.filter(
							item => mediaTypes.includes(item.type)
						)
					)
				};

				api.sendMessage(
					formMessage,
					threadID,
					(err, info) => {
						if (err)
							return message.err(err);

						message.reply(
							getLang("replyUserSuccess")
						);

						global.GoatBot.onReply.set(
							info.messageID,
							{
								commandName,
								messageID: info.messageID,
								messageIDSender: event.messageID,
								threadID: event.threadID,
								type: "adminReply"
							}
						);
					},
					messageIDSender
				);

				break;
			}

			case "adminReply": {
				let sendByGroup = "";

				if (isGroup) {
					const {
						threadName
					} = await api.getThreadInfo(
						event.threadID
					);

					sendByGroup = getLang(
						"sendByGroup",
						threadName,
						event.threadID
					);
				}

				const formMessage = {
					body: getLang(
						"feedback",
						senderName,
						event.senderID,
						sendByGroup,
						args.join(" ")
					),

					mentions: [{
						id: event.senderID,
						tag: senderName
					}],

					attachment: await getStreamsFromAttachment(
						event.attachments.filter(
							item => mediaTypes.includes(item.type)
						)
					)
				};

				api.sendMessage(
					formMessage,
					threadID,
					(err, info) => {
						if (err)
							return message.err(err);

						message.reply(
							getLang("replySuccess")
						);

						global.GoatBot.onReply.set(
							info.messageID,
							{
								commandName,
								messageID: info.messageID,
								messageIDSender: event.messageID,
								threadID: event.threadID,
								type: "userCallAdmin"
							}
						);
					},
					messageIDSender
				);

				break;
			}

			default:
				break;
		}
	}
};