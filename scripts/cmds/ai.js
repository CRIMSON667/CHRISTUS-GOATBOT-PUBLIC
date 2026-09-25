const axios = require("axios");
const fs = require("fs").promises;
const fsSync = require("fs");
const path = require("path");

const CREATOR_UID = "61594127422186";
const MEMORY_FILE = path.join(__dirname, "marin_memory.json");
const AI_API_URL = "https://christus-s-apis.vercel.app/api/na/ai/gemini";

// Fiche profil permanente
const BOSS_PROFILE = `
INFOS BOSS SUPRÊME (CRIMSON):
- Noms/Surnoms: Crimson, Brayan, reuf, Stack's.
- Localisation & Études: RDC, 3e humanité option Électronique.
- Gaming: Free Fire (UID Principal: 14221990151 | UID Secondaire: 16321696553), PUBG Mobile, DLS.
- Style/Identité: Dark, Crimson, futuriste.
- Directif d'interaction: Tu connais ces infos en arrière-plan. Ne les répète jamais dans tes réponses.
`;

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

async function getGroupDetails(api, threadID, senderID) {
    try {
        const threadInfo = await new Promise((resolve, reject) => {
            api.getThreadInfo(threadID, (err, info) => {
                if (err) reject(err);
                else resolve(info);
            });
        });

        const groupName = threadInfo?.threadName || "Discussion Privée / Groupe";
        const adminIDs = (threadInfo?.adminIDs || []).map(a => String(a.id));
        const isAdmin = adminIDs.includes(String(senderID));

        return { groupName, isAdmin };
    } catch {
        return { groupName: "Discussion / Groupe", isAdmin: false };
    }
}

async function generateAudio(text) {
    try {
        const cleanText = text
            .replace(/[*_~`#━🎀]/g, "")
            .trim()
            .slice(0, 200);

        if (!cleanText) return null;

        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=fr&client=tw-ob`;
        const res = await axios.get(url, { responseType: "arraybuffer", timeout: 15000 });
        
        const audioPath = path.join(__dirname, `tts_${Date.now()}.mp3`);
        await fs.writeFile(audioPath, Buffer.from(res.data));
        return audioPath;
    } catch (e) {
        console.error("❌ AUDIO GENERATION ERROR:", e.message);
        return null;
    }
}

function extractImageUrls(event) {
    const urls = [];
    
    if (event.attachments && event.attachments.length) {
        for (const att of event.attachments) {
            if (att.type === "photo" && att.url) {
                urls.push(att.url);
            }
        }
    }
    
    if (event.messageReply?.attachments && event.messageReply.attachments.length) {
        for (const att of event.messageReply.attachments) {
            if (att.type === "photo" && att.url) {
                urls.push(att.url);
            }
        }
    }
    
    return urls;
}

module.exports = {
    config: {
        name: "ai",
        aliases: ["marin", "gpt", "box"],
        version: "11.1",
        author: "CRIMSON",
        countDown: 3,
        role: 0,
        category: "ai"
    },

    onStart: async function ({ api, event, args, message }) {
        const text = args.join(" ").trim();
        return this.process(api, event, message, text || "salut");
    },

    onChat: async function ({ api, event, message }) {
        if (!event.body) return;
        
        const body = event.body.trim();
        const lower = body.toLowerCase();

        const match = lower.match(/^(marine|marin|box)(\s+[\s\S]*)?$/);
        if (!match) return;

        const prefixUsed = match[1];
        const content = body.slice(prefixUsed.length).trim();

        if (!content) {
            return message.reply(
                " 𝗠𝗔𝗥𝗜𝗡 𝗞𝗜𝗧𝗔𝗚𝗔𝗪𝗔 🎀\n" +
                "━──────────────━\n" +
                "Oui ? Je t'écoute ! 🎀"
            );
        }

        return this.process(api, event, message, content);
    },

    onReply: async function ({ api, event, message }) {
        const text = event.body?.trim() || "";
        return this.process(api, event, message, text);
    },

    process: async function (api, event, message, text) {
        const lower = text.toLowerCase();
        const isAudioRequested = lower.includes("vocal") || lower.includes("audio") || lower.includes("parle") || lower.includes("voix");
        const imageUrls = extractImageUrls(event);

        let replyContext = "";
        if (event.messageReply?.body) {
            replyContext = ` [RÉPONSE AU MESSAGE: "${event.messageReply.body}"]`;
        }

        return this.chat(api, event, message, text, imageUrls, isAudioRequested, replyContext);
    },

    chat: async function (api, event, message, text, imageUrls = [], sendAudio = false, replyContext = "") {
        try {
            const uid = String(event.senderID);
            const threadID = String(event.threadID);
            const memory = await loadMemory();

            if (!memory[uid]) {
                memory[uid] = { name: "Inconnu", messages: [], people: {} };
            }

            const userName = await getName(api, uid);
            if (userName && userName !== "Inconnu") {
                memory[uid].name = userName;
            }

            const { groupName, isAdmin } = await getGroupDetails(api, threadID, uid);

            const isCreator = uid === CREATOR_UID;
            const creatorTag = isCreator ? " [Créateur/CRIMSON]" : "";
            const adminTag = isAdmin ? " [ADMIN DU GROUPE]" : "";
            const bossContext = isCreator ? BOSS_PROFILE : "";

            // --- PREPARATION DES ACTIONS (SANS EXECUTION IMMEDIATE) ---
            let pendingAction = null;
            let directActionExecutedText = null;

            // 1. Détection du changement d'emoji
            const emojiMatch = text.match(/(?:change|met|mets|modifie)\s+(?:l'|l’)?emoji\s+(?:en\s+|par\s+)?(\S+)/i);
            if (emojiMatch && emojiMatch[1]) {
                const targetEmoji = emojiMatch[1].trim();
                pendingAction = () => {
                    api.changeThreadEmoji(targetEmoji, threadID, (err) => {
                        if (err) console.error("❌ Erreur changement emoji:", err);
                    });
                };
                directActionExecutedText = `L'emoji du groupe va être changé en ${targetEmoji}`;
            }

            // 2. Détection du changement de nom
            const nameMatch = text.match(/(?:change|met|mets|modifie)\s+(?:le\s+)?nom(?:\s+du\s+groupe)?\s+(?:en\s+|par\s+)(.+)/i);
            if (nameMatch && nameMatch[1]) {
                const newName = nameMatch[1].trim();
                pendingAction = () => {
                    api.setTitle(newName, threadID, (err) => {
                        if (err) console.error("❌ Erreur changement nom:", err);
                    });
                };
                directActionExecutedText = `Le nom du groupe va être changé en "${newName}"`;
            }

            // 3. Détection de l'expulsion (kick)
            const kickMatch = text.match(/(?:vire|expulse|kick|enlève)\s+(.+)/i);
            if (kickMatch) {
                let targetUID = null;
                if (event.messageReply?.senderID) {
                    targetUID = event.messageReply.senderID;
                } else if (event.mentions && Object.keys(event.mentions).length > 0) {
                    targetUID = Object.keys(event.mentions)[0];
                }

                if (targetUID) {
                    pendingAction = () => {
                        api.removeUserFromGroup(targetUID, threadID, (err) => {
                            if (err) console.error("❌ Erreur expulsion:", err);
                        });
                    };
                    directActionExecutedText = `Un membre va être expulsé du groupe`;
                }
            }

            const historyText = memory[uid].messages.length > 0
                ? " Hist: " + memory[uid].messages.map(m => `${m.role === 'user' ? 'U' : 'M'}:${m.text}`).join(";")
                : "";

            let imagePromptContext = "";
            if (imageUrls.length > 0) {
                imagePromptContext = ` [IMAGE DÉTECTÉE: ${imageUrls.join(", ")}. Décris la photo envoyée et intègre son contenu dans ta réponse.]`;
            }

            let audioPromptContext = "";
            if (sendAudio) {
                audioPromptContext = " [SITUATION : L'UTILISATEUR A DEMANDÉ UN VOCAL. Parle directement à l'oral comme si tu utilisais un micro.]";
            }

            let actionPromptContext = "";
            if (directActionExecutedText) {
                actionPromptContext = ` [SYSTÈME : "${directActionExecutedText}". Confirme à l'utilisateur que tu vas le faire ou que c'est en cours avec enthousiasme.]`;
            }

            const systemInstruction = 
                `Tu es Marin Kitagawa, expressive, directe, drôle, dynamique, adorant utiliser des emojis ✨.\n` +
                `Interlocuteur: ${memory[uid].name} (${uid})${creatorTag}${adminTag}.\n` +
                `Groupe actuel: "${groupName}" (ID: ${threadID}).\n` +
                `${bossContext}\n` +
                `${historyText}\n` +
                `CONSIGNES DE STYLE :\n` +
                `1. N'hésite pas à utiliser des emojis expressifs dans tes réponses ✨.\n` +
                `2. Si une action a été demandée, confirme-la avec dynamisme.`;

            const fullPrompt = `${systemInstruction}\n${actionPromptContext}\n${audioPromptContext}\n${imagePromptContext}\n${replyContext}\nMessage de ${memory[uid].name}: ${text || "Regarde ça"}`;

            memory[uid].messages.push({ role: "user", text: text || "[Image/Reply]", date: new Date().toISOString() });
            if (memory[uid].messages.length > 8) memory[uid].messages = memory[uid].messages.slice(-8);
            await saveMemory(memory);

            const payload = {
                prompt: fullPrompt,
                image_url: imageUrls.length > 0 ? imageUrls[0] : null,
                images: imageUrls
            };

            const r = await axios.post(AI_API_URL, payload, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 35000
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
                answer = "Désolée, je n'ai pas pu analyser le message ou l'image correctement.";
            }

            memory[uid].messages.push({ role: "assistant", text: answer, date: new Date().toISOString() });
            if (memory[uid].messages.length > 8) memory[uid].messages = memory[uid].messages.slice(-8);
            await saveMemory(memory);

            const responseText = ` 𝗠𝗔𝗥𝗜𝗡 𝗞𝗜𝗧𝗔𝗚𝗔𝗪𝗔 🎀\n━──────────────━\n${answer}`;

            let audioFilePath = null;
            if (sendAudio) {
                audioFilePath = await generateAudio(answer);
            }

            let sent;
            if (audioFilePath && fsSync.existsSync(audioFilePath)) {
                sent = await message.reply({
                    body: responseText,
                    attachment: fsSync.createReadStream(audioFilePath)
                });
                fs.unlink(audioFilePath).catch(() => {});
            } else {
                sent = await message.reply(responseText);
            }

            // --- EXECUTION DE L'ACTION APRES L'ENVOI DU MESSAGE ---
            if (pendingAction) {
                pendingAction();
            }

            if (sent?.messageID && global.GoatBot?.onReply) {
                global.GoatBot.onReply.set(sent.messageID, {
                    commandName: this.config.name,
                    author: uid
                });
            }

        } catch (e) {
            console.error("❌ MARIN ERROR:", e.response?.data || e.message || e);
            return message.reply(" 𝗠𝗔𝗥𝗜𝗡 𝗞𝗜𝗧𝗔𝗚𝗔𝗪𝗔 🎀\n━──────────────━\nL'API Gemini ne répond pas. Réessaie plus tard.");
        }
    }
};