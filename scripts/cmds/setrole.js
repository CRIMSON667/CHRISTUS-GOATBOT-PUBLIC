module.exports = {
	config: {
		name: "setrole",
		version: "1.4",
		author: "NTKhang",
		countDown: 5,
		role: 1,
		description: {
			fr: "⚙️ Modifier le rôle d'une commande",
			en: "Edit role of command"
		},
		category: "info",
		guide: {
			fr: "🎀 {pn} <commande> <rôle>\n\n"
				+ "➜ 0 : accessible à tous\n"
				+ "➜ 1 : réservé aux administrateurs\n"
				+ "➜ default : remettre le rôle par défaut\n\n"
				+ "📌 Exemples :\n"
				+ "• {pn} rank 1\n"
				+ "• {pn} rank 0\n"
				+ "• {pn} rank default\n\n"
				+ "👀 {pn} viewrole : voir les commandes modifiées",
			en: "🎀 {pn} <command> <role>\n\n"
				+ "➜ 0 : available to everyone\n"
				+ "➜ 1 : admins only\n"
				+ "➜ default : reset default role\n\n"
				+ "👀 {pn} viewrole : view edited commands"
		}
	},

	langs: {
		fr: {
			noEditedCommand:
				"🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n━━━━━━━━━━━━━━━━━━━━━━\n✅ Aucune commande n'a été modifiée dans ce groupe.",

			editedCommand:
				"🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n━━━━━━━━━━━━━━━━━━━━━━\n⚙️ Commandes avec un rôle personnalisé :\n\n",

			noPermission:
				"❌ Seuls les administrateurs du groupe peuvent utiliser cette commande.",

			commandNotFound:
				"❌ La commande « %1 » n'existe pas.",

			noChangeRole:
				"❌ Le rôle de la commande « %1 » ne peut pas être modifié.",

			resetRole:
				"🔄 Le rôle de « %1 » a été remis à sa valeur par défaut.",

			changedRole:
				"✅ Le rôle de « %1 » est maintenant défini sur %2."
		},

		en: {
			noEditedCommand:
				"🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n━━━━━━━━━━━━━━━━━━━━━━\n✅ No command has been edited in this group.",

			editedCommand:
				"🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n━━━━━━━━━━━━━━━━━━━━━━\n⚙️ Commands with custom roles:\n\n",

			noPermission:
				"❌ Only group administrators can use this command.",

			commandNotFound:
				"❌ Command \"%1\" not found.",

			noChangeRole:
				"❌ The role of command \"%1\" cannot be changed.",

			resetRole:
				"🔄 Role of \"%1\" has been reset to default.",

			changedRole:
				"✅ Role of \"%1\" has been changed to %2."
		}
	},

	onStart: async function ({
		message,
		event,
		args,
		role,
		threadsData,
		getLang
	}) {
		const { commands, aliases } = global.GoatBot;

		const setRole = await threadsData.get(
			event.threadID,
			"data.setRole",
			{}
		);

		// 👀 Voir les rôles personnalisés
		if (["view", "viewrole", "show"].includes(args[0])) {
			if (!setRole || Object.keys(setRole).length === 0)
				return message.reply(getLang("noEditedCommand"));

			let msg = getLang("editedCommand");

			for (const cmd in setRole) {
				msg += `🔹 ${cmd} ➜ Role ${setRole[cmd]}\n`;
			}

			msg += "\n━━━━━━━━━━━━━━━━━━━━━━";

			return message.reply(msg);
		}

		let commandName = (args[0] || "").toLowerCase();
		let newRole = args[1];

		if (
			!commandName ||
			(isNaN(newRole) && newRole !== "default")
		) {
			return message.SyntaxError();
		}

		// 🔐 Vérification administrateur
		if (role < 1)
			return message.reply(getLang("noPermission"));

		const command =
			commands.get(commandName) ||
			commands.get(aliases.get(commandName));

		if (!command)
			return message.reply(
				getLang("commandNotFound", commandName)
			);

		commandName = command.config.name;

		// Les commandes role 2+ ne peuvent pas être modifiées
		if (command.config.role > 1)
			return message.reply(
				getLang("noChangeRole", commandName)
			);

		let Default = false;

		// 🔄 Reset du rôle
		if (
			newRole === "default" ||
			newRole == command.config.role
		) {
			Default = true;
			newRole = command.config.role;
		}
		else {
			newRole = parseInt(newRole);
		}

		// 💾 Sauvegarde
		setRole[commandName] = newRole;

		if (Default)
			delete setRole[commandName];

		await threadsData.set(
			event.threadID,
			setRole,
			"data.setRole"
		);

		return message.reply(
			Default === true
				? getLang("resetRole", commandName)
				: getLang("changedRole", commandName, newRole)
		);
	}
};