const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const AI_API_URL = "https://christus-s-apis.vercel.app/api/na/ai/gemini";
const HISTORY_FILE = path.join(__dirname, "cache", "horoscope_history.json");

const validSigns = [
  "bélier", "taureau", "gémeaux", "cancer", 
  "lion", "vierge", "balance", "scorpion", 
  "sagittaire", "capricorne", "verseau", "poissons"
];

function formatLayout(title, body) {
  return (
    `🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `✨ [ ${title} ]\n\n` +
    body
  );
}

// Fonction pour déterminer le signe astrologique selon le jour et le mois
function getSignFromDate(day, month) {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "bélier";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "taureau";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "gémeaux";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "cancer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "lion";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "vierge";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "balance";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "scorpion";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "sagittaire";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "capricorne";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "verseau";
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return "poissons";
  return null;
}

// Parsing souple pour extraire jour et mois
function parseDateInput(args) {
  const monthsMap = {
    "janvier": 1, "janv": 1,
    "février": 2, "fevrier": 2, "févr": 2, "fevr": 2,
    "mars": 3,
    "avril": 4, "avr": 4,
    "mai": 5,
    "juin": 6,
    "juillet": 7, "juil": 7,
    "août": 8, "aout": 8,
    "septembre": 9, "sept": 9,
    "octobre": 10, "oct": 10,
    "novembre": 11, "nov": 11,
    "décembre": 12, "decembre": 12, "déc": 12, "dec": 12
  };

  const text = args.join(" ").toLowerCase().replace(/[\/\-\.]/g, " ").trim();
  const parts = text.split(/\s+/);

  if (parts.length >= 2) {
    const day = parseInt(parts[0], 10);
    let month = parseInt(parts[1], 10);

    if (isNaN(month) && monthsMap[parts[1]]) {
      month = monthsMap[parts[1]];
    }

    if (!isNaN(day) && !isNaN(month) && day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      return { day, month };
    }
  }
  return null;
}

// Gestion de la mémoire journalière
async function loadHistory() {
  try {
    if (await fs.pathExists(HISTORY_FILE)) {
      return await fs.readJson(HISTORY_FILE);
    }
  } catch (e) {}
  return {};
}

async function saveHistory(data) {
  try {
    await fs.ensureDir(path.dirname(HISTORY_FILE));
    await fs.writeJson(HISTORY_FILE, data, { spaces: 2 });
  } catch (e) {}
}

module.exports = {
  config: {
    name: "horoscope",
    version: "2.8",
    author: "CRIMSON 🩵🪽 (Marin Mode)",
    countDown: 5,
    role: 0,
    description: "Découvre ton horoscope du jour (avec menu d'aide et recherche par date)",
    category: "fun",
    aliases: ["astro", "signe"],
    guide: {
      fr: "   {pn} <signe> : affiche l'horoscope de ton signe\n" +
          "   {pn} search <jour> <mois> : trouve ton signe avec ta date de naissance\n" +
          "   {pn} help / menu : affiche le guide d'utilisation"
    }
  },

  onStart: async function ({ message, args, usersData, event, prefix, commandName }) {
    const uid = event.senderID;
    const today = new Date().toISOString().split('T')[0]; // Format "YYYY-MM-DD"
    const userName = await usersData.getName(uid);
    const subCommand = args[0] ? args[0].toLowerCase().trim() : "";

    // 1. Commande d'aide / Menu (Ne consomme PAS le quota journalier)
    if (["help", "menu", "aide"].includes(subCommand)) {
      const listSigns = validSigns.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(", ");
      const helpMenuText = 
        `Coucou ${userName} ! Bienvenue dans le module Horoscope de Marin 🌟\n\n` +
        `📌 **Comment l'utiliser ?**\n` +
        `  • **${prefix}${commandName} <signe>** : Affiche l'horoscope direct.\n` +
        `    Exemple : \`${prefix}${commandName} lion\`\n\n` +
        `  • **${prefix}${commandName} search <jour> <mois>** : Trouve ton signe si tu ne le connais pas.\n` +
        `    Exemple : \`${prefix}${commandName} search 15 08\`\n\n` +
        `  • **${prefix}${commandName} help** : Affiche ce menu.\n\n` +
        `⚠️ **Attention :** Tu n'as droit qu'à **une seule consultation par jour** ! Choisis bien ton moment. ✨`;

      return message.reply(formatLayout("MENU HOROSCOPE 🔮", helpMenuText));
    }

    // 2. Vérification anti-ressaisie (déjà fait aujourd'hui ?)
    const history = await loadHistory();
    if (history[uid] && history[uid].date === today) {
      const deniedText = 
        `🛑 STOP NET !\n\n` +
        `Tu as déjà consulté ton horoscope aujourd'hui (${history[uid].sign}).\n` +
        `Les astres n'aiment pas les impatients et les tricheurs ! 😤\n\n` +
        `🗓️ Reviens demain pour une nouvelle lecture des étoiles, ok ? ✨`;
      
      return message.reply(formatLayout("HOROSCOPE INTERDIT 🚫", deniedText));
    }

    let inputSign = "";

    // 3. Option Recherche par date de naissance
    if (["search", "recherche", "find", "date"].includes(subCommand)) {
      const dateParts = parseDateInput(args.slice(1));

      if (!dateParts) {
        const searchHelp = 
          `Coucou ${userName} ! Si tu ne connais pas ton signe, donne-moi ton jour et ton mois de naissance !\n\n` +
          `📌 Exemples de commande :\n` +
          `  • \`${prefix}${commandName} search 15 08\`\n` +
          `  • \`${prefix}${commandName} search 21 mai\`\n` +
          `  • \`${prefix}${commandName} search 03/12\``;

        return message.reply(formatLayout("RECHERCHE SIGNE 🔍", searchHelp));
      }

      inputSign = getSignFromDate(dateParts.day, dateParts.month);

      if (!inputSign) {
        return message.reply(formatLayout("ERREUR DATE ❌", "Date invalide ! Vérifie le jour et le mois renseignés."));
      }
    } 
    // 4. Saisie directe du signe
    else {
      inputSign = subCommand;
    }

    // Si pas de signe fourni ou invalide
    if (!inputSign || !validSigns.includes(inputSign)) {
      const helpText = 
        `Coucou ${userName} ! Tu dois préciser ton signe ou utiliser le menu d'aide.\n\n` +
        `💡 Tape \`${prefix}${commandName} help\` pour voir toutes les instructions et la liste des signes !`;

      return message.reply(formatLayout("HOROSCOPE DU JOUR ♈", helpText));
    }

    const cleanSign = inputSign.charAt(0).toUpperCase() + inputSign.slice(1);

    try {
      // 5. Demande globale à l'API de l'horoscope du jour
      const promptText = `
Génère l'horoscope du jour ultra-précis, réaliste, profond et détaillé pour TOUS les 12 signes astrologiques (Bélier, Taureau, Gémeaux, Cancer, Lion, Vierge, Balance, Scorpion, Sagittaire, Capricorne, Verseau, Poissons).
Fais en sorte que les prédictions soient percutantes, ancrées dans la réalité et surprenamment vraies.
Pour chaque signe, structure la réponse proprement avec le nom du signe suivi de ses prédictions (Amour, Travail, Énergie).
`;

      const response = await axios.post(
        AI_API_URL,
        { prompt: promptText },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 45000
        }
      );

      const data = response.data;
      let fullAnswer = null;

      if (typeof data?.result?.answer === "string") {
        fullAnswer = data.result.answer;
      } else if (typeof data?.result === "string") {
        fullAnswer = data.result;
      } else if (typeof data?.answer === "string") {
        fullAnswer = data.answer;
      }

      if (!fullAnswer) {
        throw new Error("L'API n'a renvoyé aucune réponse.");
      }

      // Filtrage de la portion du signe recherché
      let signHoroscope = "";
      const regex = new RegExp(`(?:###|\\*\\*)?\\s*${cleanSign}\\b[\\s\\S]*?(?=(?:###|\\*\\*)?\\s*(?:${validSigns.filter(s => s !== inputSign).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('|')})\\b|$)`, 'i');
      const match = fullAnswer.match(regex);

      if (match && match[0]) {
        signHoroscope = match[0].trim();
      } else {
        signHoroscope = fullAnswer;
      }

      // Enregistrement dans l'historique (bloque pour le reste de la journée)
      history[uid] = {
        date: today,
        sign: cleanSign
      };
      await saveHistory(history);

      const bodyText = 
        `👤 Destinataire : ${userName}\n` +
        `🔮 Signe identifié : ${cleanSign}\n` +
        `📅 Date : Aujourd'hui\n\n` +
        `${signHoroscope}\n\n` +
        `✨ Lue par Marin Kitagawa (Astrologue officielle)`;

      return message.reply(formatLayout(`HOROSCOPE : ${cleanSign.toUpperCase()} ✨`, bodyText));

    } catch (error) {
      console.error("Erreur horoscope global:", error.message);

      // Enregistrement de secours dans l'historique
      history[uid] = { date: today, sign: cleanSign };
      await saveHistory(history);

      const fallbackText = 
        `👤 Destinataire : ${userName}\n` +
        `🔮 Signe identifié : ${cleanSign}\n\n` +
        `Amour 💕 : Une discussion inattendue va clarifier une situation floue.\n` +
        `Travail ⚡ : Un choix stratégique s'impose aujourd'hui, fais confiance à ton intuition.\n` +
        `Conseil ✨ : Ne cherche pas à tout contrôler, laisse les choses se faire.\n\n` +
        `✨ Lue par Marin Kitagawa (Mode Secours)`;

      return message.reply(formatLayout(`HOROSCOPE : ${cleanSign.toUpperCase()} ✨`, fallbackText));
    }
  }
};
