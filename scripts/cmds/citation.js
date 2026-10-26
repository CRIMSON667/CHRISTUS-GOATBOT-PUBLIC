const axios = require("axios");

const AI_API_URL = "https://christus-s-apis.vercel.app/api/na/ai/gemini";

function formatLayout(title, body) {
  return (
    `╭───〖 ${title} 〗───⬣\n` +
    `│\n` +
    body.split('\n').map(line => `│  ${line}`).join('\n') + `\n` +
    `│\n` +
    `╰──────────────────⬣`
  );
}

module.exports = {
  config: {
    name: "citation",
    version: "2.0",
    author: "CRIMSON 🩵🪽 (Marin Mode)",
    countDown: 5,
    role: 0,
    description: "Génère une citation stylée selon un genre ou un thème via ton API IA",
    category: "fun",
    guide: {
      fr: "   {pn} : affiche une citation aléatoire\n" +
          "   {pn} <genre> : affiche une citation sur un thème précis (ex: {pn} motivation, {pn} amour, {pn} philosophie)"
    }
  },

  onStart: async function ({ message, args }) {
    try {
      const genre = args.join(" ").trim();

      // Construction du prompt pour ton API Gemini
      const promptText = genre 
        ? `Génère une belle citation unique et inspirante sur le thème ou genre suivant : "${genre}". Réponds uniquement avec la citation et son auteur de manière élégante.`
        : `Génère une citation inspirante, philosophique ou marquante, avec son auteur.`;

      // Appel à ton API sur Vercel
      const response = await axios.post(
        AI_API_URL,
        { prompt: promptText },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 30000
        }
      );

      const data = response.data;
      let answer = null;

      // Extraction selon ton format exact
      if (typeof data?.result?.answer === "string") {
        answer = data.result.answer;
      } else if (typeof data?.result === "string") {
        answer = data.result;
      } else if (typeof data?.answer === "string") {
        answer = data.answer;
      }

      if (!answer) {
        throw new Error("L'API n'a renvoyé aucune réponse valide.");
      }

      const title = genre ? `CITATION : ${genre.toUpperCase()} 💬` : `CITATION DU JOUR 💬`;
      const bodyText = `${answer}\n\n✨ Marin Kitagawa`;

      return message.reply(formatLayout(title, bodyText));

    } catch (error) {
      console.error("Erreur commande citation:", error.message);

      // Fallback de secours si l'API tombe en rade
      const fallbackQuotes = [
        "\"Le code qui fonctionne est un art, mais le code propre est un chef-d'œuvre.\" — CRIMSON",
        "\"Ne rêve pas ta vie, vis tes rêves... ou code-les !\" — Marin Kitagawa",
        "\"La simplicité est la sophistication suprême.\" — Leonardo da Vinci"
      ];
      const randomFallback = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];

      return message.reply(formatLayout("CITATION DE SECOURS ⚠️", `${randomFallback}\n\n✨ Marin Kitagawa`));
    }
  }
};
