const axios = require("axios");
const fs = require("fs").promises;
const fsSync = require("fs");
const path = require("path");

const CREATOR_UID = "61594127422186";
const MEMORY_FILE = path.join(__dirname, "marin_memory.json");
const IMAGE_API = "https://gem-tw6a.onrender.com/generate";
const AI_API_URL = "https://christus-s-apis.vercel.app/api/na/ai/gemini";

if (!fsSync.existsSync(MEMORY_FILE)) {
    fsSync.writeFileSync(MEMORY_FILE, "{}");
}

async function loadMemory() {
    try {
        const data = await fs.readFile(MEMORY_FILE, "utf8");
        return JSON.parse(data);
    } catch {
        return {};
    }
}

async function saveMemory(data) {
    try {
        await fs.writeFile(MEMORY_FILE, JSON.stringify(data, null, 2), "utf8");
    } catch (err) {
        console.error("❌ ERREUR MEMOIRE:", err.message);
    }
}

async function getName(api, uid) {
    try {
        const info = await new Promise((resolve, reject) => {
            api.getUserInfo(uid, (err, data) => {
                if (err) reject(err);
                else resolve(data);
            });
        });
        return info?.[uid]?.name || "Inconnu";
    } catch {
        return "Inconnu";
    }
}

async function getTarget(api, event) {
    let uid = null;

    if (event.mentions && Object.keys(event.mentions).length) {
        uid = String(Object.keys(event.mentions)[0]);
    } else if (event.messageReply?.senderID) {
        uid = String(event.messageReply.senderID);
    } else if (event.body) {
        const match = event.body.match(/\b\d{8,20}\b/);
        if (match) uid = match[0];
    }

    if (!uid) return null;

    return {
        uid,
        name: await getName(api, uid)
    };
}

async function getNews(topic = "actualités") {
    try {
        const q = encodeURIComponent(topic);
        const url = `https://news.google.com/rss/search?q=${q}&hl=fr&gl=FR&ceid=FR:fr`;
        const r = await axios.get(url, { timeout: 15000 });

        const items = [...r.data.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 7);

        if (!items.length) return "Aucune actualité trouvée.";

        return items.map((x, i) => {
            const block = x[1];
            const title = block
                .match(/<title>([\s\S]*?)<\/title>/)?.[1]
                ?.replace(/<!\[CDATA\[\vert{}\]\]>/g, "")
                ?.trim() || "Sans titre";

            return `${i + 1}. ${title}`;
        }).join("\n\n");
    } catch {
        return "❌ Impossible de récupérer les actualités.";
    }
}

async function generateImage(prompt) {
    try {
        const response = await axios.post(
            IMAGE_API,
            { prompt, ratio: "1:1", format: "jpg" },
            {
                responseType: "arraybuffer",
                timeout: 180000,
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "image/jpeg"
                }
            }
        );

        if (!response.data || response.data.length === 0) {
            throw new Error("Image vide");
        }

        return Buffer.from(response.data);
    } catch (error) {
        console.error("❌ MARIN IMAGE ERROR:", error.message);
        return null;
    }
}

function parseImageQuery(text) {
    const patterns = [
        /^(imagine|génère|genere|dessine)\b\s*(.*)/i,
        /^(génère-moi|genere-moi|crée-moi une image|cree-moi une image)\b\s*(.*)/i,
        /^(crée une image|cree une image|fais une image)\b\s*(.*)/i
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            return { isImage: true, prompt: match[2].trim() };
        }
    }
    return { isImage: false, prompt: "" };
}

module.exports = {
    config: {
        name: "ai",
        aliases: ["marin", "gpt"],
        version: "6.8",
        author: "CRIMSON",
        countDown: 3,
        role: 0,
        category: "ai"
    },

    onStart: async function ({ api, event, args, message }) {
        const text = args.join(" ").trim();

        if (!text) {
            return message.reply(
                "🎀 𝗠𝗔𝗥𝗜𝗡 𝗞𝗜𝗧𝗔𝗚𝗔𝗪𝗔\n" +
                "━──────────────━\n" +
                "Oui ? Je t'écoute !\n\n" +
                "Exemple : /ai explique-moi l'électronique"
            );
        }

        return this.process(api, event, message, text);
    },

    onChat: async function ({ api, event, message }) {
        const body = event.body?.trim();
        if (!body) return;

        const lower = body.toLowerCase();

        if (lower === "marine" || lower === "marin") {
            return message.reply(
                "🎀 𝗠𝗔𝗥𝗜𝗡 𝗞𝗜𝗧𝗔𝗚𝗔𝗪𝗔\n" +
                "━──────────────━\n" +
                "Oui ? Je t'écoute !"
            );
        }

        if (!lower.startsWith("marine ") && !lower.startsWith("marin ")) return;

        const content = lower.startsWith("marine ") ? body.slice(7).trim() : body.slice(6).trim();
        return this.process(api, event, message, content);
    },

    onReply: async function ({ api, event, message }) {
        const text = event.body?.trim();
        if (!text) return;

        return this.process(api, event, message, text);
    },

    process: async function (api, event, message, text) {
        const lower = text.toLowerCase();
        const imgCheck = parseImageQuery(text);

        if (imgCheck.isImage) {
            if (!imgCheck.prompt) {
                return message.reply(
                    "🎨 𝗠𝗔𝗥𝗜𝗡 𝗜𝗠𝗔𝗚𝗘\n" +
                    "━──────────────━\n" +
                    "Dis-moi ce que tu veux que je crée !"
                );
            }

            await message.reply(
                "🎨 𝗠𝗔𝗥𝗜𝗡 𝗜𝗠𝗔𝗚𝗘\n" +
                "━──────────────━\n" +
                "⏳ Génération en cours..."
            );

            const image = await generateImage(imgCheck.prompt);

            if (!image) {
                return message.reply(
                    "❌ 𝗠𝗔𝗥𝗜𝗡 𝗜𝗠𝗔𝗚𝗘\n" +
                    "━──────────────━\n" +
                    "Je n'ai pas réussi à générer l'image."
                );
            }

            return message.reply({
                body: "🎨 𝗠𝗔𝗥𝗜𝗡 𝗜𝗠𝗔𝗚𝗘\n━──────────────━\nVoilà ton image !",
                attachment: image
            });
        }

        if (lower === "news" || lower === "actualités" || lower === "actualites") {
            const news = await getNews("actualités du jour");
            return message.reply(
                "📰 𝗠𝗔𝗥𝗜𝗡 𝗡𝗘𝗪𝗦\n━──────────────━\n\n" + news
            );
        }

        if (lower.startsWith("news ")) {
            const topic = text.slice(5).trim();
            const news = await getNews(topic);
            return message.reply(
                `🔎 𝗡𝗘𝗪𝗦 : ${topic.toUpperCase()}\n━──────────────━\n\n` + news
            );
        }

        return this.chat(api, event, message, text);
    },

    chat: async function (api, event, message, text) {
        // Envoi du message d'attente
        const loadingMsg = await message.reply("⏳ Réflexion en cours...");

        try {
            const uid = String(event.senderID);
            const memory = await loadMemory();

            if (!memory[uid]) {
                memory[uid] = { name: "Inconnu", messages: [], people: {} };
            }
            if (!memory[uid].people) memory[uid].people = {};
            if (!Array.isArray(memory[uid].messages)) memory[uid].messages = [];

            const userName = await getName(api, uid);
            if (userName && userName !== "Inconnu") {
                memory[uid].name = userName;
            }

            const target = await getTarget(api, event);
            let targetInfo = "";

            if (target) {
                memory[uid].people[target.uid] = {
                    name: target.name,
                    lastSeen: new Date().toISOString()
                };
                targetInfo = ` | Cible: ${target.name} (${target.uid})`;
            }

            const creator = uid === CREATOR_UID ? " [Créateur]" : "";
            const historyText = memory[uid].messages.length > 0
                ? " Historique récents: " + memory[uid].messages.map(m => `${m.role === 'user' ? 'Utilisateur' : 'Marin'}:${m.text}`).join(";")
                : "";

            const fullPrompt = `Consigne système: Tu es Marin Kitagawa. Utilisateur: ${memory[uid].name} (UID:${uid})${creator}${targetInfo}.${historyText} Réponds en français, sois très expressive, dynamique, drôle, utilise des emojis et un langage familier léger.\n\nMessage de l'utilisateur: ${text}`;

            memory[uid].messages.push({ role: "user", text, date: new Date().toISOString() });
            if (memory[uid].messages.length > 6) {
                memory[uid].messages = memory[uid].messages.slice(-6);
            }
            await saveMemory(memory);

            const r = await axios.post(AI_API_URL, {
                prompt: fullPrompt
            }, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000
            });

            const data = r.data;
            let answer = "";

            if (typeof data === "string") {
                answer = data;
            } else if (data && typeof data === "object") {
                answer = 
                    data.result?.answer || 
                    data.answer || 
                    (typeof data.result === "string" ? data.result : null) ||
                    (typeof data.response === "string" ? data.response : null) ||
                    data.message || 
                    data.text;
            }

            if (!answer || typeof answer !== "string") {
                answer = "Désolée, je n'ai pas pu structurer ma réponse correctement.";
            }

            memory[uid].messages.push({ role: "assistant", text: answer, date: new Date().toISOString() });
            if (memory[uid].messages.length > 6) {
                memory[uid].messages = memory[uid].messages.slice(-6);
            }
            await saveMemory(memory);

            // Suppression du message d'attente
            if (loadingMsg?.messageID) {
                message.unsend(loadingMsg.messageID).catch(() => {});
            }

            const responseText = `🎀 𝗠𝗔𝗥𝗜𝗡 𝗞𝗜𝗧𝗔𝗚𝗔𝗪𝗔\n━──────────────━\n${answer}`;

            const sent = await message.reply(responseText);

            if (sent?.messageID && global.GoatBot?.onReply) {
                global.GoatBot.onReply.set(sent.messageID, {
                    commandName: this.config.name,
                    author: uid
                });
            }

        } catch (e) {
            console.error("❌ MARIN ERROR:", e.response?.data || e.message || e);

            // Nettoyage du message d'attente en cas d'erreur
            if (loadingMsg?.messageID) {
                message.unsend(loadingMsg.messageID).catch(() => {});
            }

            return message.reply("❌ 𝗠𝗔𝗥𝗜𝗡\n━──────────────━\nL'API Gemini ne répond pas. Réessaie plus tard.");
        }
    }
};
          
