module.exports = {
	config: {
		name: "setrole",
		version: "2.6",
		author: "NTKhang / Refactored",
		countDown: 5,
		role: 4, // Selon ta logique : Accessible aux Admins de groupe (4) et plus
		description: {
			fr: "⚙️ Modifier le niveau d'accès d'une commande selon ton échelle custom",
			en: "Edit required role level for a command"
		},
		category: "admin",
		guide: {
			fr: "🎀 {pn} <commande> <niveau|default>\n\n"
				+ "➜ 0 : Accessible à tous\n"
				+ "➜ 1 : VIP / Premium\n"
				+ "➜ 2 : Admin du Bot (Global)\n"
				+ "➜ 4 : Admin du Groupe (Local Messenger)\n"
				+ "➜ 7 : Owner Absolu (61594978289028)\n"
				+ "➜ default : Réinitialiser le rôle d'origine\n\n"
				+ "👀 {pn} viewrole : Voir les rôles modifiés dans ce groupe",
			en: "🎀 {pn} <command> <level|default>\n\n"
				+ "➜ 0 : Everyone\n"
				+ "➜ 1 : VIP / Premium\n"
				+ "➜ 2 : Bot Admin\n"
				+ "➜ 4 : Group Admin\n"
				+ "➜ 7 : Owner Only\n"
				+ "➜ default : Reset to default"
		}
	},

	langs: {
		fr: {
			noEditedCommand: "✅ Aucune commande n'a été modifiée dans ce groupe.",
			editedCommand: "⚙️ **Commandes avec rôle personnalisé :**\n\n",
			noPermission: "❌ Permission insuffisante pour appliquer ou modifier ce rôle.",
			ownerOnly: "❌ Le niveau 7 est strictement réservé au Propriétaire Absolu (61594978289028).",
			commandNotFound: "❌ La commande « %1 » n'existe pas.",
			invalidRole: "❌ Niveau invalide. Valeurs autorisées : 0, 1, 2, 4, 7 ou 'default'.",
			noChangeRole: "❌ La commande « %1 » est une commande système verrouillée.",
			resetRole: "🔄 Le rôle de « %1 » a été remis à sa valeur par défaut.",
			changedRole: "✅ La commande « %1 » requiert désormais le niveau %2."
		},
		en: {
			noEditedCommand: "✅ No customized commands in this group.",
			editedCommand: "⚙️ **Custom role commands:**\n\n",
			noPermission: "❌ You lack the required permission level.",
			ownerOnly: "❌ Level 7 is strictly reserved for the Bot Owner.",
			commandNotFound: "❌ Command \"%1\" not found.",
			invalidRole: "❌ Invalid level. Allowed values: 0, 1, 2, 4, 7 or 'default'.",
			noChangeRole: "❌ Command \"%1\" is a locked system command.",
			resetRole: "🔄 Role of \"%1\" has been reset to default.",
			changedRole: "✅ Command \"%1\" now requires level %2."
		}
	},

	onStart: async function ({ message, event, args, role, threadsData, getLang }) {
		const { commands, aliases } = global.GoatBot;
		const SUPER_ADMIN_ID = "61594978289028";
		const senderID = event.senderID;

		// Résolution du rôle exact de l'expéditeur
		let userEffectiveRole = role;
		if (senderID === SUPER_ADMIN_ID) {
			userEffectiveRole = 7;
		}

		const setRole = await threadsData.get(event.threadID, "data.setRole", {});

		// Affichage des rôles modifiés
		if (["view", "viewrole", "show"].includes(args[0])) {
			if (!setRole || Object.keys(setRole).length === 0) {
				return message.reply(getLang("noEditedCommand"));
			}

			let msg = getLang("editedCommand");
			for (const cmd in setRole) {
				msg += `🔹 **${cmd}** ➜ Niveau ${setRole[cmd]}\n`;
			}
			return message.reply(msg);
		}

		let commandName = (args[0] || "").toLowerCase();
		let targetRoleInput = args[1];

		if (!commandName || targetRoleInput === undefined) {
			return message.SyntaxError();
		}

		const command = commands.get(commandName) || commands.get(aliases.get(commandName));
		if (!command) {
			return message.reply(getLang("commandNotFound", commandName));
		}

		commandName = command.config.name;

		// Interdit la modification des commandes nativess réservées aux Devs/Owner
		if (command.config.role >= 7 && senderID !== SUPER_ADMIN_ID) {
			return message.reply(getLang("noChangeRole", commandName));
		}

		let isDefault = false;
		let parsedRole;

		if (targetRoleInput.toLowerCase() === "default") {
			isDefault = true;
			parsedRole = command.config.role;
		} else {
			parsedRole = parseInt(targetRoleInput);
			if (isNaN(parsedRole) || ![0, 1, 2, 4, 7].includes(parsedRole)) {
				return message.reply(getLang("invalidRole"));
			}
		}

		// Contrôles de sécurité stricts
		if (parsedRole === 7 && senderID !== SUPER_ADMIN_ID) {
			return message.reply(getLang("ownerOnly"));
		}

		// Vérification que l'utilisateur ne donne pas un rôle supérieur à ce qu'il possède
		if (userEffectiveRole !== 7 && parsedRole === 7) {
			return message.reply(getLang("noPermission"));
		}

		// Sauvegarde dans la DB du groupe
		if (isDefault || parsedRole === command.config.role) {
			delete setRole[commandName];
			isDefault = true;
		} else {
			setRole[commandName] = parsedRole;
		}

		await threadsData.set(event.threadID, setRole, "data.setRole");

		return message.reply(
			isDefault
				? getLang("resetRole", commandName)
				: getLang("changedRole", commandName, parsedRole)
		);
	}
};
