const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const vm = require("vm");

/* ------------------------------------------------------------
 *  CONFIG
 * ------------------------------------------------------------ */
const API_URL = "https://api.anthropic.com/v1/messages";
const API_VERSION = "2023-06-01";
const MODEL = "claude-sonnet-5-5";
const MAX_TOKENS = 2000;
const TIMEOUT_MS = 60000;

// API gratuite : POST { prompt } -> { success, result: { answer } }
const FREE_API_URL = "https://christus-s-apis.vercel.app/api/na/ai/gemini";
const FREE_PROMPT_MAX = 12000; // limite de sécurité sur le prompt envoyé
const PROVIDER = String(
  process.env.CODEX_PROVIDER || global.GoatBot?.config?.codexProvider || "free"
).toLowerCase();

const HISTORY_LIMIT = 8; // nb max de messages gardés par utilisateur
const HISTORY_TTL_MS = 30 * 60 * 1000; // 30 min d'inactivité
const DAILY_LIMIT = 20; // requêtes par utilisateur et par jour
const CHUNK_SIZE = 1800; // taille max d'un message Messenger
const FILE_THRESHOLD = 3500; // au-delà, on envoie le code en fichier

const SYSTEM_PROMPT = [
  "Tu es Codex, un assistant de programmation intégré à un bot Messenger.",
  "Tu réponds en français, sauf si l'utilisateur écrit dans une autre langue.",
  "Sois direct : le code d'abord, puis 2 à 5 lignes d'explication maximum.",
  "Mets toujours le code dans des blocs ``` avec le nom du langage.",
  "Si la demande est ambiguë, fais l'hypothèse la plus raisonnable et dis-la en une ligne.",
  "Si le code fourni contient un bug, explique la cause réelle, pas juste le correctif.",
  "Les messages sont lus sur téléphone : évite les longs préambules et les tableaux."
].join("\n");

const LANG_ALIASES = {
  js: "JavaScript",
  node: "Node.js",
  ts: "TypeScript",
  py: "Python",
  python: "Python",
  java: "Java",
  c: "C",
  cpp: "C++",
  "c++": "C++",
  cs: "C#",
  php: "PHP",
  html: "HTML",
  css: "CSS",
  sql: "SQL",
  bash: "Bash",
  sh: "Bash",
  go: "Go",
  rust: "Rust",
  rs: "Rust",
  kotlin: "Kotlin",
  swift: "Swift",
  ruby: "Ruby",
  lua: "Lua",
  dart: "Dart"
};

/* ------------------------------------------------------------
 *  ETAT EN MEMOIRE
 * ------------------------------------------------------------ */
const histories = new Map(); // userID -> { messages, updatedAt }
const usage = new Map(); // userID -> { day, count }

/* ------------------------------------------------------------
 *  UTILITAIRES
 * ------------------------------------------------------------ */

function getApiKey() {
  return (
    process.env.ANTHROPIC_API_KEY ||
    global.GoatBot?.config?.anthropicApiKey ||
    ""
  ).trim();
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getHistory(userID) {
  const h = histories.get(userID);
  if (!h) return [];
  if (Date.now() - h.updatedAt > HISTORY_TTL_MS) {
    histories.delete(userID);
    return [];
  }
  return h.messages;
}

function saveHistory(userID, messages) {
  const trimmed = messages.slice(-HISTORY_LIMIT);
  while (trimmed.length && trimmed[0].role !== "user") trimmed.shift();
  histories.set(userID, { messages: trimmed, updatedAt: Date.now() });
}

function remainingQuota(userID) {
  const u = usage.get(userID);
  if (!u || u.day !== todayKey()) return DAILY_LIMIT;
  return Math.max(0, DAILY_LIMIT - u.count);
}

function consumeQuota(userID) {
  const day = todayKey();
  const u = usage.get(userID);
  if (!u || u.day !== day) usage.set(userID, { day, count: 1 });
  else u.count += 1;
}

function splitText(text, size = CHUNK_SIZE) {
  const parts = [];
  let rest = String(text);
  while (rest.length > size) {
    let cut = rest.lastIndexOf("\n", size);
    if (cut < size * 0.5) cut = size;
    const prev = rest.charCodeAt(cut - 1);
    if (prev >= 0xd800 && prev <= 0xdbff) cut -= 1;
    parts.push(rest.slice(0, cut));
    rest = rest.slice(cut).replace(/^\n/, "");
  }
  if (rest.length) parts.push(rest);
  return parts;
}

function extractCodeBlocks(text) {
  const blocks = [];
  const re = /```([\w+#-]*)\n([\s\S]*?)```/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    blocks.push({ lang: (m[1] || "txt").toLowerCase(), code: m[2], raw: m[0] });
  }
  return blocks;
}

function parseLanguage(args) {
  const first = (args[0] || "").toLowerCase();
  if (LANG_ALIASES[first] && args.length > 1) {
    return { language: LANG_ALIASES[first], rest: args.slice(1) };
  }
  return { language: null, rest: args };
}

function explainError(err) {
  if (err?.isFreeApi) return err.message;
  const status = err?.response?.status;
  const apiMsg = String(err?.response?.data?.error?.message || "");

  if (status === 401) return "Clé API invalide ou manquante. Vérifie ta config.";
  if (status === 403) return "Accès refusé par l'API pour cette clé.";
  if (status === 404) return "Modèle introuvable. Vérifie la constante MODEL.";
  if (status === 429) return "Trop de requêtes. Réessaie dans une minute.";
  if (status === 400 && /credit balance/i.test(apiMsg)) {
    return "Plus de crédits sur le compte API. Il faut en ajouter dans la Console.";
  }
  if (status === 400) return "Requête refusée par l'API (400). Message trop long ?";
  if (status === 529 || status === 503) {
    return "L'API est surchargée. Réessaie dans un instant.";
  }
  if (err?.code === "ECONNABORTED") return "Délai dépassé. Réessaie.";
  if (err?.code === "ENOTFOUND" || err?.code === "ECONNREFUSED") {
    return "Impossible de joindre l'API. Vérifie la connexion du serveur.";
  }
  return "Erreur inattendue pendant l'appel à l'API.";
}

/* ------------------------------------------------------------
 *  REGLES DE COMMANDES GOATBOT
 * ------------------------------------------------------------ */
const COMMAND_FORMAT = String(
  process.env.CODEX_FORMAT || global.GoatBot?.config?.codexFormat || "goat"
).toLowerCase();
const MAX_REPAIRS = 2;

const COMMAND_RULES = [
  "MODE CRÉATION DE COMMANDE : tu livres un fichier COMPLET, prêt à copier dans le dossier des commandes.",
  "Règles obligatoires :",
  "1. Un seul bloc ```javascript contenant tout le fichier. Aucun squelette, aucun TODO.",
  "2. CommonJS uniquement (require / module.exports). Pas d'import ESM.",
  "3. Si args est vide ou invalide : envoie un message d'usage clair.",
  "4. Tout le corps dans un try/catch pour éviter tout crash du bot.",
  "5. Aucune clé API en dur : utilise process.env ou la config."
].join("\n");

const COMMAND_CONTRACT_GOAT = [
  "FORMAT DU BOT (GoatBot V2) :",
  "module.exports = {",
  "  config: {",
  '    name: "nom", aliases: [], version: "1.0.0", author: "Stack\'s",',
  "    countDown: 5, role: 0,",
  '    description: { fr: "..." }, category: "utilitaires",',
  '    guide: { fr: "{pn} <argument>" }',
  "  },",
  "  onStart: async function ({ message, args, event, api }) { ... }",
  "};"
].join("\n");

function commandSystemPrompt() {
  return [COMMAND_RULES, COMMAND_CONTRACT_GOAT].join("\n\n");
}

function isCommandRequest(prompt) {
  return /\b(cmd|cmds|commande|commandes|command)\b/i.test(String(prompt));
}

function checkCommandCode(text) {
  const blocks = extractCodeBlocks(text);
  if (!blocks.length) return ["aucun bloc de code trouvé"];
  const code = blocks[0].code;
  const problems = [];
  try {
    new vm.Script(code, { filename: "commande.js" });
  } catch (e) {
    problems.push(`erreur de syntaxe : ${e.message}`);
  }
  if (!/module\.exports/.test(code)) problems.push("module.exports absent");
  if (!/onStart/.test(code)) problems.push("onStart absent");
  return problems;
}

function repairPrompt(problems) {
  return (
    "Le fichier renvoyé a ces problèmes :\n" +
    problems.map((p) => `- ${p}`).join("\n") +
    "\n\nRenvoie le fichier COMPLET corrigé dans un seul bloc de code."
  );
}

/* ------------------------------------------------------------
 *  EXPORT MODULE GOATBOT
 * ------------------------------------------------------------ */
module.exports = {
  config: {
    name: "codex",
    version: "2.1.0",
    author: "Stack's",
    countDown: 5,
    role: 0,
    description: {
      fr: "Assistant de code intelligent (Gemini / Claude)"
    },
    category: "outils",
    guide: {
      fr: "{pn} <demande> ou réponds à un message de code avec {pn} corrige / explique"
    }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, senderID, messageReply } = event;
    const reply = (text) => api.sendMessage(text, threadID, undefined, messageID);

    const sub = (args[0] || "").toLowerCase();

    if (sub === "reset") {
      histories.delete(senderID);
      return reply("🗑️ Ton historique de conversation avec Codex a été effacé.");
    }

    if (sub === "quota") {
      const left = remainingQuota(senderID);
      return reply(`📊 Il te reste ${left}/${DAILY_LIMIT} requêtes pour aujourd'hui.`);
    }

    if (remainingQuota(senderID) <= 0) {
      return reply("⚠️ Tu as atteint ta limite de ${DAILY_LIMIT} requêtes pour aujourd'hui. Réessaie demain !");
    }

    let prompt = args.join(" ").trim();
    let quotedCode = "";

    if (messageReply && messageReply.body) {
      quotedCode = messageReply.body;
      if (prompt) {
        prompt = `Concernant ce code :\n\`\`\`\n${quotedCode}\n\`\`\`\n\nDemande : ${prompt}`;
      } else {
        prompt = `Explique ou corrige ce code :\n\`\`\`\n${quotedCode}\n\`\`\`\n`;
      }
    }

    if (!prompt) {
      return reply("🤖 Utilisation : !codex <ta demande>\nExemple : !codex écris une fonction en JS qui trie un tableau");
    }

    consumeQuota(senderID);
    api.setMessageReaction("⏳", messageID, () => {}, true);

    try {
      const history = getHistory(senderID);
      const isCmd = isCommandRequest(prompt);
      const sysPrompt = isCmd ? commandSystemPrompt() : SYSTEM_PROMPT;

      let answer = "";

      // Appel de l'API (Free par défaut, bascule sur Claude si configuré)
      if (PROVIDER === "claude" || getApiKey()) {
        const apiKey = getApiKey();
        if (!apiKey && PROVIDER === "claude") {
          api.setMessageReaction("❌", messageID, () => {}, true);
          return reply("❌ Clé API Anthropic manquante (configure ANTHROPIC_API_KEY ou anthropicApiKey dans config.json).");
        }

        if (apiKey) {
          const messages = [...history, { role: "user", content: prompt }];
          const res = await axios.post(
            API_URL,
            {
              model: MODEL,
              max_tokens: MAX_TOKENS,
              system: sysPrompt,
              messages
            },
            {
              headers: {
                "x-api-key": apiKey,
                "anthropic-version": API_VERSION,
                "content-type": "application/json"
              },
              timeout: TIMEOUT_MS
            }
          );
          answer = res.data?.content?.[0]?.text || "";
          history.push({ role: "user", content: prompt });
          history.push({ role: "assistant", content: answer });
          saveHistory(senderID, history);
        }
      }

      // Si pas de réponse (fallback ou mode free)
      if (!answer) {
        const freeRes = await axios.post(
          FREE_API_URL,
          { prompt: `${sysPrompt}\n\nUtilisateur : ${prompt}` },
          { timeout: TIMEOUT_MS }
        );
        if (!freeRes.data?.success) {
          throw new Error("L'API gratuite a refusé la requête.");
        }
        answer = freeRes.data.result.answer;
      }

      // Validation automatique si c'est une commande
      if (isCmd) {
        let problems = checkCommandCode(answer);
        let repairs = 0;
        while (problems.length > 0 && repairs < MAX_REPAIRS) {
          repairs++;
          const fixPrompt = repairPrompt(problems);
          const fixRes = await axios.post(
            FREE_API_URL,
            { prompt: `${sysPrompt}\n\nCode précédent :\n${answer}\n\n${fixPrompt}` },
            { timeout: TIMEOUT_MS }
          );
          if (fixRes.data?.success) {
            answer = fixRes.data.result.answer;
            problems = checkCommandCode(answer);
          } else {
            break;
          }
        }
      }

      api.setMessageReaction("✅", messageID, () => {}, true);

      // Envoi du message (découpage si trop long ou envoi en fichier si nécessaire)
      if (answer.length > FILE_THRESHOLD) {
        const filePath = path.join(__dirname, `cache/codex_${Date.now()}.js`);
        await fs.outputFile(filePath, answer);
        await api.sendMessage(
          {
            body: "📄 La réponse est trop longue, voici le fichier complet :",
            attachment: fs.createReadStream(filePath)
          },
          threadID,
          () => fs.unlink(filePath).catch(() => {}),
          messageID
        );
      } else {
        const chunks = splitText(answer, CHUNK_SIZE);
        for (const chunk of chunks) {
          await api.sendMessage(chunk, threadID, undefined, messageID);
        }
      }

    } catch (err) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      return reply(`❌ Erreur Codex : ${explainError(err)}`);
    }
  }
};