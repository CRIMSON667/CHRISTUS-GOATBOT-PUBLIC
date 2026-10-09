module.exports = {
	config: {
		name: "setrole",
		version: "3.0",
		author: "NTKhang / Refactored",
		countDown: 5,
		role: 4, // Exige d'être au moins Admin du Groupe (4)
		description: {
			fr: "⚙️ Modifier le niveau d'accès d'une commande dans le groupe",
			en: "Edit required role level for a command in thread"
		},
		category: "admin",
		guide: {
			fr: "🎀 {pn} <commande> <niveau|default>\n\n"
				+ "➜ 0 : Accessible à tous\n"
				+ "➜ 1 : VIP / Premium\n"
				+ "➜ 2 : Admin du Bot (Global)\n"
				+ "➜ 4 : Admin du Groupe (Messenger)\n"
				+ "➜ 7 : Owner / Créateur Absolu\n"
				+ "➜ default : Réinitialiser\n\n"
				+ "👀 {pn} viewrole : Voir les modifications de rôles dans ce groupe",
			en: "🎀 {pn} <command> <level|default>\n\n"
				+ "➜ 0 : Everyone\n"
				+ "➜ 1 : VIP / Premium\n"
				+ "➜ 2 : Bot Admin\n"
				+ "➜ 4 : Group Admin\n"
				+ "➜ 7 : Owner Only\n"
				+ "➜ default : Reset"
		}
	},

	langs: {
		fr: {
			noEditedCommand: "🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n━━━━━━━━━━━━━━━━━━━━━━\n✅ Aucune commande n'a été modifiée dans ce groupe.",
			editedCommand: "🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n━━━━━━━━━━━━━━━━━━━━━━\n⚙️ Commandes avec un rôle personnalisé :\n\n",
			noPermission: "❌ Permission insuffisante. Vous ne pouvez pas attribuer ou modifier un rôle supérieur à vos propres privilèges.",
			ownerOnly: "❌ Le niveau 7 est strictement réservé au Propriétaire du bot (61594978289028).",
			commandNotFound: "❌ La commande « %1 » n'existe pas.",
			invalidRole: "❌ Niveau invalide. Valeurs acceptées : 0, 1, 2, 4, 7 ou 'default'.",
			noChangeRole: "❌ La commande « %1 » est une commande système verrouillée.",
			resetRole: "🔄 Le rôle de la commande « %1 » a été réinitialisé à sa valeur par défaut.",
			changedRole: "✅ Le rôle de la commande « %1 » est désormais fixé au niveau %2."
		},
		en: {
			noEditedCommand: "🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n━━━━━━━━━━━━━━━━━━━━━━\n✅ No command has been edited in this group.",
			editedCommand: "🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n━━━━━━━━━━━━━━━━━━━━━━\n⚙️ Commands with custom roles:\n\n",
			noPermission: "❌ Insufficient permission.",
			ownerOnly: "❌ Level 7 is strictly reserved for the Bot Owner.",
			commandNotFound: "❌ Command \"%1\" not found.",
			invalidRole: "❌ Invalid level. Allowed values: 0, 1, 2, 4, 7 or 'default'.",
			noChangeRole: "❌ Command \"%1\" is locked and cannot be changed.",
			resetRole: "🔄 Role of \"%1\" has been reset to default.",
			changedRole: "✅ Role of \"%1\" has been changed to level %2."
		}
	},

	onStart: async function ({ message, event, args, role, threadsData, getLang }) {
		const { commands, aliases, config } = global.GoatBot;
		const senderID = String(event.senderID);
		const SUPER_ADMIN_ID = "61594978289028";

		// Calcul dynamique du niveau réel de l'exécutant d'après config.json
		let userEffectiveRole = role; // Valeur transmise par le noyau GoatBot

		const isCreator = (config.creator || []).includes(senderID) || senderID === SUPER_ADMIN_ID;
		const isBotAdmin = (config.adminBot || []).includes(senderID) || (config.developer || []).includes(senderID);

		if (isCreator) {
			userEffectiveRole = 7;
		} else if (isBotAdmin && userEffectiveRole < 2) {
			userEffectiveRole = 2;
		}

		const setRole = await threadsData.get(event.threadID, "data.setRole", {});

		// Commande de consultation
		if (["view", "viewrole", "show"].includes(args[0])) {
			if (!setRole || Object.keys(setRole).length === 0) {
				return message.reply(getLang("noEditedCommand"));
			}

			let msg = getLang("editedCommand");
			for (const cmd in setRole) {
				msg += `🔹 **${cmd}** ➜ Niveau ${setRole[cmd]}\n`;
			}
			msg += "\n━━━━━━━━━━━━━━━━━━━━━━";
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

		// Bloquer la modification si la commande exige nativement un niveau supérieur ou égal à 7
		if (command.config.role >= 7 && !isCreator) {
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

		// Interdictions de privilèges
		if (parsedRole === 7 && !isCreator) {
			return message.reply(getLang("ownerOnly"));
		}

		if (parsedRole > userEffectiveRole && !isCreator) {
			return message.reply(getLang("noPermission"));
		}

		// Persistence dans la base MongoDB/JSON
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
