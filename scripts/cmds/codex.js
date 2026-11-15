/**
 * ============================================================
 *  CODEX - Assistant intelligent & Mémoire persistante (GoatBot V2)
 * ============================================================
 *  Usage :
 *    {p}codex <demande>        -> discute ou génère une commande
 *    (Réponds directement aux messages du bot pour dialoguer,
 *     modifier le code en cours, ou taper "oui" pour installer)
 *    {p}codex reset            -> efface la mémoire et le contexte
 *    {p}codex quota            -> vérifie tes requêtes restantes
 * ============================================================
 */

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const vm = require("vm");

const FREE_API_URL = "https://christus-s-apis.vercel.app/api/na/ai/gemini";
const TIMEOUT_MS = 60000;

const COMMANDS_DIR = path.join(process.cwd(), "scripts", "cmds");
const TRASH_DIR = path.join(COMMANDS_DIR, "trash");
fs.ensureDirSync(TRASH_DIR);

const HISTORY_LIMIT = 15;
const HISTORY_TTL_MS = 60 * 60 * 1000; // 1 heure de mémoire contextuelle
const DAILY_LIMIT = 40;
const CHUNK_SIZE = 1800;
const FILE_THRESHOLD = 3500;
const MAX_REPAIRS = 2;

const SYSTEM_PROMPT = [
  "Tu es Codex, un assistant de programmation expert intégré à un bot Messenger (GoatBot V2).",
  "Tu réponds en français, de manière claire et directe.",
  "Tu disposes d'une mémoire contextuelle complète sur la discussion en cours et les commandes générées.",
  "Quand l'utilisateur te demande de modifier un code précédent, prends en compte tout l'historique et renvoie le code complet mis à jour dans un bloc ```javascript."
].join("\n");

const COMMAND_SYSTEM_PROMPT = [
  "Tu es un développeur expert sur GoatBot V2 (Node.js / Messenger).",
  "L'utilisateur veut une COMMANDE GOATBOT V2 COMPLÈTE, 100% fonctionnelle et prête à être installée.",
  "",
  "RÈGLES OBLIGATOIRES :",
  "1. Renvoie UN SEUL bloc ```javascript contenant tout le fichier.",
  "2. Aucun squelette, aucun code manquant, aucun TODO.",
  "3. CommonJS uniquement (require / module.exports). Jamais d'import ESM.",
  "4. Utilise l'API GoatBot : message.reply(), message.reaction(), event, args.",
  "5. Protège tout le code asynchrone dans un try/catch avec message d'erreur clair.",
  "",
  "EXEMPLE DE STRUCTURE GOATBOT V2 À RESPECTER :",
  "```javascript",
  'const axios = require("axios");',
  "",
  "module.exports = {",
  "  config: {",
  '    name: "ping",',
  '    aliases: ["p"],',
  '    version: "1.0.0",',
  '    author: "Stack\'s",',
  "    countDown: 5,",
  "    role: 0,",
  '    description: { fr: "Vérifie la latence du bot" },',
  '    category: "utilitaires",',
  '    guide: { fr: "{pn}" }',
  "  },",
  "  onStart: async function ({ message, event, args }) {",
  "    try {",
  "      const start = Date.now();",
  '      message.reaction("⏳", event.messageID);',
  "      const latency = Date.now() - start;",
  '      message.reaction("✅", event.messageID);',
  "      return message.reply(`🏓 Pong ! Latence : ${latency}ms`);",
  "    } catch (err) {",
  '      message.reaction("❌", event.messageID);',
  "      return message.reply(`❌ Erreur : ${err.message}`);",
  "    }",
  "  }",
  "};",
  "```"
].join("\n");

const HISTORIES = new Map(); // userID -> { messages, updatedAt, activeCommand }
const USAGE = new Map();

function isAdminBot(senderID) {
  const { adminBot } = global.GoatBot?.config || {};
  return Array.isArray(adminBot) && adminBot.includes(senderID);
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getUserSession(userID) {
  let session = HISTORIES.get(userID);
  if (!session || Date.now() - session.updatedAt > HISTORY_TTL_MS) {
    session = { messages: [], updatedAt: Date.now(), activeCommand: null };
    HISTORIES.set(userID, session);
  }
  session.updatedAt = Date.now();
  return session;
}

function saveUserMessages(userID, messages, activeCommand = null) {
  const session = getUserSession(userID);
  const trimmed = messages.slice(-HISTORY_LIMIT);
  while (trimmed.length && trimmed[0].role !== "user") trimmed.shift();
  session.messages = trimmed;
  if (activeCommand !== null) {
    session.activeCommand = activeCommand;
  }
  session.updatedAt = Date.now();
}

function remainingQuota(userID) {
  const u = USAGE.get(userID);
  if (!u || u.day !== todayKey()) return DAILY_LIMIT;
  return Math.max(0, DAILY_LIMIT - u.count);
}

function consumeQuota(userID) {
  const day = todayKey();
  const u = USAGE.get(userID);
  if (!u || u.day !== day) USAGE.set(userID, { day, count: 1 });
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

function isCommandRequest(prompt) {
  return /\b(cmd|cmds|commande|commandes|command|goatbot|crée|cree|écris|ecris|fais|code)\b/i.test(String(prompt));
}

function checkCommandCode(text) {
  const blocks = extractCodeBlocks(text);
  if (!blocks.length) return ["Aucun bloc ```javascript trouvé."];
  const jsBlocks = blocks.filter((b) => ["javascript", "js", "node", ""].includes(b.lang));
  const code = (jsBlocks.length ? jsBlocks : blocks).reduce((a, b) =>
    b.code.length > a.code.length ? b : a
  ).code;

  const problems = [];
  try {
    new vm.Script(code, { filename: "test_cmd.js" });
  } catch (e) {
    problems.push(`Erreur syntaxe JS : ${e.message}`);
  }
  if (!/module\.exports/.test(code)) problems.push("module.exports manquant");
  if (!/config\s*:/.test(code)) problems.push("objet config manquant");
  if (!/onStart/.test(code)) problems.push("fonction onStart manquante");
  return problems;
}

function extractCommandName(code) {
  const match = code.match(/\bname\s*:\s*["']([\w-]{1,30})["']/);
  return match ? match[1].toLowerCase() : `codex_cmd_${Date.now()}`;
}

async function callAI(sysPrompt, prompt, history) {
  let fullPrompt = sysPrompt + "\n\n";
  if (history && history.length > 0) {
    fullPrompt += "=== HISTORIQUE DE LA CONVERSATION ===\n";
    for (const h of history) {
      fullPrompt += `${h.role === "user" ? "Utilisateur" : "Codex"} :\n${h.content}\n\n`;
    }
    fullPrompt += "=== FIN HISTORIQUE ===\n\n";
  }
  fullPrompt += `Utilisateur :\n${prompt}`;

  const res = await axios.post(FREE_API_URL, { prompt: fullPrompt }, { timeout: TIMEOUT_MS });
  if (!res.data?.success || !res.data?.result?.answer) {
    throw new Error("L'API Christus n'a renvoyé aucune réponse.");
  }
  return res.data.result.answer;
}

async function handleCodexTurn({ api, event, message, prompt, forceCommandMode }) {
  const { messageID, senderID } = event;

  if (remainingQuota(senderID) <= 0) {
    return message.reply(`⚠️ Limite atteinte (${DAILY_LIMIT} requêtes/jour).`);
  }

  consumeQuota(senderID);
  message.reaction("⏳", messageID);

  try {
    const session = getUserSession(senderID);
    
    // Si l'utilisateur a une commande active en mémoire et qu'il demande une modification, on injecte le code précédent dans le prompt
    let finalPrompt = prompt;
    if (session.activeCommand && (isCommandRequest(prompt) || /modifie|change|ajoute|mets|enlève|corrige/i.test(prompt))) {
      finalPrompt = `Voici le code de la commande en cours de modification :\n\`\`\`javascript\n${session.activeCommand.code}\n\`\`\`\n\nDemande de modification : ${prompt}`;
    }

    const isCmd = forceCommandMode || isCommandRequest(finalPrompt);
    const sysPrompt = isCmd ? COMMAND_SYSTEM_PROMPT : SYSTEM_PROMPT;

    let answer = await callAI(sysPrompt, finalPrompt, session.messages);

    if (isCmd) {
      let problems = checkCommandCode(answer);
      let repairs = 0;
      while (problems.length > 0 && repairs < MAX_REPAIRS) {
        repairs++;
        const fixPrompt = `Ton code précédent a ces erreurs :\n- ${problems.join("\n- ")}\n\nCorrige-le et renvoie uniquement le fichier COMPLET dans un seul bloc \`\`\`javascript.`;
        answer = await callAI(sysPrompt, `Code à corriger :\n${answer}\n\n${fixPrompt}`, []);
        problems = checkCommandCode(answer);
      }

      if (problems.length > 0) {
        message.reaction("❌", messageID);
        return message.reply(`❌ Le code généré contient des erreurs :\n• ${problems.join("\n• ")}\n\n💬 Réponds-moi pour ajuster.`);
      }

      const blocks = extractCodeBlocks(answer);
      const jsBlocks = blocks.filter((b) => ["javascript", "js", "node", ""].includes(b.lang));
      const codeToInstall = (jsBlocks.length ? jsBlocks : blocks).reduce((a, b) =>
        b.code.length > a.code.length ? b : a
      ).code.trim();

      const cmdName = extractCommandName(codeToInstall);
      const fileName = `${cmdName}.js`;
      const exists = fs.existsSync(path.join(COMMANDS_DIR, fileName));

      // Sauvegarde dans la mémoire de session (activeCommand mise à jour !)
      session.messages.push({ role: "user", content: finalPrompt }, { role: "assistant", content: answer });
      saveUserMessages(senderID, session.messages, { fileName, code: codeToInstall });

      const cacheDir = path.join(__dirname, "cache");
      fs.ensureDirSync(cacheDir);
      const previewPath = path.join(cacheDir, `preview_${cmdName}_${Date.now()}.js`);
      await fs.writeFile(previewPath, codeToInstall, "utf-8");

      message.reaction("✅", messageID);

      const confirmText =
        `📦 | COMMANDE EN MÉMOIRE : ${fileName}\n` +
        `• État : ${exists ? "Remplacera l'existante (sauvegarde en corbeille)" : "Nouvelle commande"}\n` +
        `• Syntaxe JS : Valide ✅\n\n` +
        `👉 Réponds "oui" à ce message pour l'installer.\n` +
        `💬 Ou réponds directement pour la modifier encore (ex: "ajoute un check d'admin") !`;

      return message.reply(
        { body: confirmText, attachment: fs.createReadStream(previewPath) },
        (err, info) => {
          fs.unlink(previewPath).catch(() => {});
          if (err || !info) return;
          const sentID = info.messageID || info.mid;
          if (sentID) {
            global.GoatBot.onReply.set(sentID, {
              commandName: "codex",
              messageID: sentID,
              author: senderID,
              mode: "command_review"
            });
          }
        }
      );
    }

    // Mode dialogue normal
    session.messages.push({ role: "user", content: finalPrompt }, { role: "assistant", content: answer });
    saveUserMessages(senderID, session.messages);

    message.reaction("✅", messageID);

    const chunks = splitText(answer, CHUNK_SIZE);
    for (let i = 0; i < chunks.length; i++) {
      const isLast = i === chunks.length - 1;
      await new Promise((resolve) => {
        message.reply(chunks[i], (err, info) => {
          const sentID = info?.messageID || info?.mid;
          if (!err && sentID && isLast) {
            global.GoatBot.onReply.set(sentID, {
              commandName: "codex",
              messageID: sentID,
              author: senderID,
              mode: "chat"
            });
          }
          resolve();
        });
      });
    }
  } catch (err) {
    message.reaction("❌", messageID);
    return message.reply(`❌ Erreur Codex : ${err.message}`);
  }
}

module.exports = {
  config: {
    name: "codex",
    version: "6.0.0",
    author: "Stack's",
    countDown: 3,
    role: 0,
    description: { fr: "Assistant code avec mémoire persistante et dialogue continu" },
    category: "outils",
    guide: {
      fr: "{pn} <demande>\nRéponds simplement au message du bot pour continuer à discuter, modifier la commande en mémoire ou taper 'oui' pour l'installer.\n{pn} reset | quota"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const { senderID, messageReply } = event;
    const sub = (args[0] || "").toLowerCase();

    if (sub === "reset") {
      HISTORIES.delete(senderID);
      return message.reply("🗑️ Mémoire et historique entièrement effacés.");
    }

    if (sub === "quota") {
      return message.reply(`📊 Quota restant : ${remainingQuota(senderID)}/${DAILY_LIMIT} aujourd'hui.`);
    }

    let prompt = args.join(" ").trim();
    if (messageReply && messageReply.body) {
      prompt = prompt
        ? `Message cité :\n\`\`\`\n${messageReply.body}\n\`\`\`\n\nDemande : ${prompt}`
        : `Explique ou corrige ceci :\n\`\`\`\n${messageReply.body}\n\`\`\``;
    }

    if (!prompt) {
      const session = getUserSession(senderID);
      let statusMemoire = session.activeCommand ? `\n📌 Commande en mémoire : ${session.activeCommand.fileName}` : "";
      return message.reply(`🤖 Salut ! Je suis à ton écoute.${statusMemoire}\n\n• Demande une commande (ex: codex une cmd kick)\n• Ou réponds-moi pour continuer.`);
    }

    return handleCodexTurn({ api, event, message, prompt, forceCommandMode: false });
  },

  onReply: async function ({
    Reply, api, event, message, getLang,
    threadModel, userModel, dashBoardModel, globalModel,
    threadsData, usersData, dashBoardData, globalData
  }) {
    const { author, mode } = Reply;
    if (event.senderID !== author) return;

    const userText = (event.body || "").trim();
    if (!userText) return;

    global.GoatBot.onReply.delete(Reply.messageID);
    const session = getUserSession(event.senderID);

    if (mode === "command_review") {
      const normalized = userText.toLowerCase();

      if (["oui", "yes", "ok", "confirmer", "installe", "install", "valide"].includes(normalized)) {
        if (!isAdminBot(event.senderID)) return message.reply("❌ Réservé aux administrateurs du bot.");
        if (!session.activeCommand) return message.reply("❌ Aucune commande en mémoire à installer.");

        try {
          const { fileName, code } = session.activeCommand;
          const filePath = path.join(COMMANDS_DIR, fileName);

          if (fs.existsSync(filePath)) {
            const orig = fs.readFileSync(filePath, "utf-8");
            let trashPath = path.join(TRASH_DIR, `replace_${fileName}`);
            let num = 0;
            while (fs.existsSync(trashPath)) {
              num++;
              trashPath = path.join(TRASH_DIR, `${num}_replace_${fileName}`);
            }
            fs.writeFileSync(trashPath, orig, "utf-8");
          }

          fs.writeFileSync(filePath, code, "utf-8");

          const { log, loadScripts } = global.utils;
          const { configCommands } = global.GoatBot;
          const cmdShortName = fileName.replace(/\.js$/, "");

          const info = loadScripts(
            "cmds", cmdShortName, log, configCommands, api,
            threadModel, userModel, dashBoardModel, globalModel,
            threadsData, usersData, dashBoardData, globalData, getLang
          );

          if (info.status === "success") {
            session.activeCommand = null; // Nettoyage après installation réussie
            return message.reply(`✅ "${fileName}" a été installé et chargé à chaud avec succès !`);
          } else {
            return message.reply(`⚠️ Fichier enregistré, mais échec du chargement : ${info.error.message}`);
          }
        } catch (err) {
          return message.reply(`❌ Erreur d'installation : ${err.message}`);
        }
      }

      if (["non", "no", "annuler", "cancel", "stop"].includes(normalized)) {
        return message.reply("🚫 Opération annulée.");
      }

      // Si l'utilisateur tape une modification (ex: "ajoute un rôle admin"), on utilise la mémoire de la commande active !
      return handleCodexTurn({
        api,
        event,
        message,
        prompt: userText,
        forceCommandMode: true
      });
    }

    // Dialogue normal en répondant au bot
    return handleCodexTurn({
      api,
      event,
      message,
      prompt: userText,
      forceCommandMode: isCommandRequest(userText)
    });
  }
};
