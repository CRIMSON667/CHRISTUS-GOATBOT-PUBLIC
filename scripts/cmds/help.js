const os = require("os");
const process = require("process");
const util = require("util");

const MARIN_HELP_QUOTES = [
  "Waku waku ! Trouve la commande parfaite pour tes sessions, senpai ! ✨",
  "Dis donc, notre bot a un catalogue aussi incroyable que mes cosplays de Shizuku-tan ! 💖",
  "Mission exploration ! Navigue à travers toutes nos fonctionnalités avec le sourire ! 🌸",
  "C'est trop génial ! Regarde un peu toutes ces options de folie prêtes à l'emploi ! 🎀",
  "Kyaa ! Tout est super bien rangé et ultra rapide, on adore ! ✨",
  "Besoin d'un coup de main ? Je suis là pour guider chaque étape avec style ! 🌟",
  "Un catalogue digne d'un grand salon de manga ! Choisis ta prochaine commande ! 👗",
  "L'organisation, c'est la clé du succès, exactement comme pour les essayages ! 🎨",
  "Chaque commande a son petit secret, amuse-toi bien à les découvrir toutes ! 💫",
  "Prêt à booster ton serveur avec nos meilleures fonctionnalités, senpai ? 🚀"
];

const GOATBOT_FULL_COMMANDS_CATALOGUE = {
  utilitaires: {
    name: "Utilitaires & Système",
    icon: "🛠️",
    description: "Outils de diagnostic, latence, informations et configuration.",
    commands: [
      { name: "ping", desc: "Vérifie la latence et l'état complet du système." },
      { name: "help", desc: "Affiche le menu d'aide interactif et le catalogue." },
      { name: "uptime", desc: "Affiche le temps de fonctionnement du bot." },
      { name: "info", desc: "Donne des informations détaillées sur le bot." },
      { name: "prefix", desc: "Affiche ou modifie le préfixe du bot sur le groupe." }
    ]
  },
  administration: {
    name: "Administration & Modération",
    icon: "🛡️",
    description: "Gestion des membres, des rôles et sécurité des groupes.",
    commands: [
      { name: "ban", desc: "Bannit un membre indésirable du groupe Messenger." },
      { name: "kick", desc: "Expulse un utilisateur du groupe." },
      { name: "admin", desc: "Gère la liste des administrateurs du bot." },
      { name: "setname", desc: "Modifie le pseudonyme d'un membre dans le groupe." },
      { name: "antilink", desc: "Active ou désactive la protection anti-liens." }
    ]
  },
  economie: {
    name: "Économie & Jeux",
    icon: "💰",
    description: "Système financier, portefeuille, gains et mini-jeux d'argent.",
    commands: [
      { name: "balance", desc: "Consulte ton solde et ton portefeuille actuel." },
      { name: "daily", desc: "Récupère ta récompense financière quotidienne." },
      { name: "work", desc: "Travaille pour gagner de l'argent virtuel." },
      { name: "pay", desc: "Transfère de l'argent à un autre utilisateur." },
      { name: "slot", desc: "Joue à la machine à sous pour tenter de multiplier tes gains." }
    ]
  },
  anime: {
    name: "Anime & Médias",
    icon: "🌸",
    description: "Exploration d'animes, mangas, waifus et personnages cultes.",
    commands: [
      { name: "waifu", desc: "Recherche et affiche une image de waifu aléatoire." },
      { name: "cosplay", desc: "Découvre de superbes photos de cosplay." },
      { name: "neko", desc: "Affiche une image de fille chat mignonne." },
      { name: "anime", desc: "Recherche des informations sur un anime spécifique." }
    ]
  },
  divertissement: {
    name: "Divertissement & Fun",
    icon: "🎮",
    description: "Mini-jeux, interactions sociales et amusements entre membres.",
    commands: [
      { name: "roll", desc: "Lance un dé aléatoire." },
      { name: "8ball", desc: "Répond à tes questions mystiques." },
      { name: "kiss", desc: "Fait un bisou virtuel à un membre." },
      { name: "hug", desc: "Donne un câlin chaleureux à quelqu'un." }
    ]
  },
  ia: {
    name: "Intelligence Artificielle",
    icon: "🧠",
    description: "Discussions conversationnelles et génération de contenu intelligent.",
    commands: [
      { name: "ai", desc: "Discute avec l'intelligence artificielle principale." },
      { name: "gpt", desc: "Pose des questions complexes à l'assistant virtuel." },
      { name: "marin", desc: "Active ou discute avec le mode spécial Marin Kitagawa." },
      { name: "imagine", desc: "Génère des images à partir d'une description textuelle." }
    ]
  },
  musique: {
    name: "Musique & Multimédia",
    icon: "🎵",
    description: "Recherche et lecture de flux audio et vidéos.
    commands: [
      { name: "play", desc: "Joue une musique ou une vidéo audio." },
      { name: "song", desc: "Télécharge une piste audio depuis YouTube." },
      { name: "lyrics", desc: "Recherche les paroles d'une chanson." }
    ]
  }
};

function logHelpEvent(level, message) {
    const timestamp = new Date().toISOString();
    const prefix = `[GOATBOT-HELP-ULTIMATE] [${timestamp}] [${level}]`;
    if (level === 'ERROR') {
        console.error(`${prefix} ${message}`);
    } else {
        console.log(`${prefix} ${message}`);
    }
}

function sanitizeText(input) {
    if (typeof input !== 'string') return '';
    return input.trim().replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
}

function getRandomQuote() {
    const index = Math.floor(Math.random() * MARIN_HELP_QUOTES.length);
    return MARIN_HELP_QUOTES[index] || MARIN_HELP_QUOTES[0];
}

module.exports = {
  config: {
    name: "help",
    aliases: ["h", "aide", "marinhelp", "commandes"],
    version: "3.0.0",
    author: "Delfa Frost",
    countDown: 5,
    role: 0,
    description: {
      fr: "Affiche le catalogue complet et interactif de toutes les commandes avec le style de Marin Kitagawa 🎀"
    },
    category: "utilitaires",
    guide: {
      fr: "{pn} [nom_de_commande ou catégorie]"
    }
  },

  onStart: async function ({ message, event, args }) {
    let startTime = 0;
    try {
      startTime = Date.now();
      logHelpEvent('INFO', `Exécution de la commande help demandée par l'utilisateur ID: ${event.senderID || 'Inconnu'}`);

      await message.reaction("⏳", event.messageID);

      const query = args && args.length > 0 ? sanitizeText(args[0]).toLowerCase() : "";
      const selectedQuote = getRandomQuote();

      let responseText = "";

      if (query) {
        if (GOATBOT_FULL_COMMANDS_CATALOGUE[query]) {
          const catData = GOATBOT_FULL_COMMANDS_CATALOGUE[query];
          let cmdsListFormatted = "";
          catData.commands.forEach((cmd, idx) => {
            cmdsListFormatted += `🔹 **${cmd.name}** : \`${cmd.desc}\`\n`;
          });

          responseText = 
            `🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n` +
            `━━━━━━━━━━━━━━━━━━━━━━\n` +
            `🌸 **CATÉGORIE : ${catData.name.toUpperCase()}**\n` +
            `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
            `${catData.icon} **Description :** ${catData.description}\n\n` +
            `📋 **Liste des commandes :**\n\n` +
            cmdsListFormatted + `\n` +
            `💡 *Tape \`help [nom_commande]\` pour plus de détails !*\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━━\n` +
            `💬 *" ${selectedQuote} "*\n` +
            `━━━━━━━━━━━━━━━━━━━━━━`;
        } else {
          let foundCmd = null;
          let foundCategory = "";

          for (const [catKey, catObj] of Object.entries(GOATBOT_FULL_COMMANDS_CATALOGUE)) {
            const match = catObj.commands.find(c => c.name.toLowerCase() === query);
            if (match) {
              foundCmd = match;
              foundCategory = catObj.name;
              break;
            }
          }

          if (foundCmd) {
            responseText = 
              `🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n` +
              `━━━━━━━━━━━━━━━━━━━━━━\n` +
              `🌸 **FICHE DE COMMANDE**\n` +
              `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
              `📌 **Nom :** \`${foundCmd.name}\`\n` +
              `📂 **Catégorie :** \`${foundCategory}\`\n\n` +
              `📖 **Description :**\n> ${foundCmd.desc}\n\n` +
              `💡 **Guide d'utilisation :**\n> \`{pn} ${foundCmd.name}\`\n\n` +
              `━━━━━━━━━━━━━━━━━━━━━━\n` +
              `💬 *" ${selectedQuote} "*\n` +
              `━━━━━━━━━━━━━━━━━━━━━━`;
          } else {
            responseText = 
              `🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n` +
              `━━━━━━━━━━━━━━━━━━━━━━\n` +
              `❌ **COMMANDE INTROUVABLE**\n` +
              `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
              `Oups senpai ! Je n'ai trouvé aucune commande ou catégorie nommée \`${query}\` dans mon catalogue !\n` +
              `Tape \`help\` tout court pour voir la liste complète des catégories disponibles ! ✨\n\n` +
              `━━━━━━━━━━━━━━━━━━━━━━\n` +
              `💬 *" ${selectedQuote} "*\n` +
              `━━━━━━━━━━━━━━━━━━━━━━`;
          }
        }
      } else {
        let categoriesDisplay = "";
        let totalCommandsCount = 0;

        for (const [catKey, catObj] of Object.entries(GOATBOT_FULL_COMMANDS_CATALOGUE)) {
          totalCommandsCount += catObj.commands.length;
          categoriesDisplay += `${catObj.icon} **${catObj.name}** (\`${catObj.commands.length}\` cmds)\n   └ Clé : \`${catKey}\` (Tape \`help ${catKey}\`)\n\n`;
        }

        responseText = 
          `🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n` +
          `━━━━━━━━━━━━━━━━━━━━━━\n` +
          `🌸 **CENTRE DE COMMANDES & AIDE**\n` +
          `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
          `✨ Bienvenue dans mon espace de navigation, senpai !\n` +
          `Total de commandes répertoriées : \`${totalCommandsCount}\`\n\n` +
          `📂 **CATÉGORIES DISPONIBLES :**\n\n` +
          categoriesDisplay +
          `💡 **Astuce :** Tape \`help [nom_catégorie]\` ou \`help [nom_commande]\` pour explorer en détail !\n\n` +
          `━━━━━━━━━━━━━━━━━━━━━━\n` +
          `💬 *" ${selectedQuote} "*\n` +
          `━━━━━━━━━━━━━━━━━━━━━━`;
      }

      await message.reaction("✅", event.messageID);
      logHelpEvent('INFO', `Menu d'aide complet généré avec succès en ${Date.now() - startTime}ms`);

      return message.reply(responseText);

    } catch (err) {
      logHelpEvent('ERROR', `Erreur critique dans la commande help : ${err.message}`);
      console.error(err);

      try {
        await message.reaction("❌", event.messageID);
      } catch (e) {}

      return message.reply(`❌ Oups senpai ! Une erreur est survenue lors de l'affichage du menu d'aide : \`${err.message}\``);
    }
  }
};