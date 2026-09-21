module.exports = {
  config: {
    name: "join",
    aliases: ["rejoindre"],
    version: "2.0.0",
    author: "Brayan Slyde",
    role: 2, // Admin uniquement
    category: "admin",
    shortDescription: "Affiche les groupes et permet de les rejoindre ou d'en faire quitter le bot",
    guide: "{pn} | {pn} del <nombre>"
  },

  onStart: async function ({ api, event, args, message }) {
    // CAS 1 : SUPPRESSION / SORTIE DE GROUPES (ex: "join del 3")
    if (args[0] === "del") {
      const targetGroup = args[1];
      
      if (!targetGroup || isNaN(targetGroup)) {
        return message.reply("Erreur : Spécifie le numéro du groupe à quitter.\nExemple : join del 2");
      }

      try {
        const inbox = await api.getThreadList(100, null, ["INBOX"]);
        const groupList = inbox.filter(group => group.isGroup && group.isSubscribed);
        const index = parseInt(targetGroup) - 1;

        if (index < 0 || index >= groupList.length) {
          return message.reply(`Erreur : Le numéro ${targetGroup} n'existe pas dans la liste.`);
        }

        const selectedGroup = groupList[index];
        await api.sendMessage("Le bot quitte ce groupe sur ordre de l'administrateur.", selectedGroup.threadID);
        await api.removeUserFromGroup(api.getCurrentUserID(), selectedGroup.threadID);

        return message.reply(`Succès : Le bot a quitté le groupe "${selectedGroup.name || selectedGroup.threadID}".`);
      } catch (error) {
        console.error(error);
        return message.reply("Échec : Impossible de quitter ce groupe.");
      }
    }

    // CAS 2 : LISTER LES GROUPES ET ATTENDRE UNE RÉPONSE
    try {
      const inbox = await api.getThreadList(100, null, ["INBOX"]);
      const groupList = inbox.filter(group => group.isGroup && group.isSubscribed);

      if (groupList.length === 0) {
        return message.reply("Le bot ne se trouve dans aucun groupe actuellement.");
      }

      let msg = "LISTE DES GROUPES DISPONIBLES :\n──────────────────\n";
      groupList.forEach((group, index) => {
        msg += `${index + 1}. ${group.name || "Groupe sans nom"}\n   (Membres : ${group.participantIDs.length})\n\n`;
      });
      msg += "──────────────────\nRéponds à ce message avec le NUMÉRO du groupe pour y être ajouté.";

      return message.reply(msg, (err, info) => {
        if (err) return console.error(err);
        
        // Attache l'écouteur de réponse (Reply)
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          messageID: info.messageID,
          author: event.senderID,
          groupList: groupList.map(g => ({ threadID: g.threadID, name: g.name }))
        });
      });

    } catch (error) {
      console.error(error);
      return message.reply("Impossible de récupérer la liste des groupes.");
    }
  },

  // GESTION DE LA RÉPONSE DE L'UTILISATEUR
  onReply: async function ({ api, event, Reply, message }) {
    const { author, groupList } = Reply;

    // Sécurité : seul l'auteur de la commande initiale peut répondre
    if (event.senderID !== author) {
      return message.reply("Tu n'es pas autorisé à exécuter cette action.");
    }

    const choice = parseInt(event.body.trim());

    if (isNaN(choice) || choice < 1 || choice > groupList.length) {
      return message.reply(`Choix invalide. Entre un chiffre entre 1 et ${groupList.length}.`);
    }

    const targetGroup = groupList[choice - 1];

    try {
      // Ajoute l'utilisateur qui a répondu dans le groupe choisi
      await api.addUserToGroup(event.senderID, targetGroup.threadID);
      message.reply(`Succès : Tu as été ajouté au groupe "${targetGroup.name || targetGroup.threadID}".`);
    } catch (error) {
      console.error(error);
      message.reply(`Échec : Impossible de t'ajouter au groupe "${targetGroup.name}". Raisons possibles :\n- Le groupe bloque les ajouts directes.\n- Tu es déjà dans le groupe.\n- Tes paramètres de confidentialité Facebook bloquent cette action.`);
    }

    // Nettoyage de l'écouteur
    global.GoatBot.onReply.delete(Reply.messageID);
  }
};
