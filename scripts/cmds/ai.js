const axios = require("axios");
const fs = require("fs");
const fsp = require("fs").promises;
const path = require("path");

const MEMORY_FILE = path.join(__dirname, "marin_memory.json");

const AI_API_URL =
    "https://christus-s-apis.vercel.app/api/na/ai/gemini";

const IMG2PROMPT_API_URL =
    "https://smfahim.xyz/ai/img2prompt/v3";

/* =========================
   MÉMOIRE
========================= */

if (!fs.existsSync(MEMORY_FILE)) {
    fs.writeFileSync(
        MEMORY_FILE,
        JSON.stringify({}, null, 2)
    );
}

async function loadMemory() {
    try {
        const data = await fsp.readFile(
            MEMORY_FILE,
            "utf8"
        );

        const memory = JSON.parse(data);

        if (
            !memory ||
            typeof memory !== "object" ||
            Array.isArray(memory)
        ) {
            return {};
        }

        return memory;
    } catch {
        return {};
    }
}

async function saveMemory(memory) {
    await fsp.writeFile(
        MEMORY_FILE,
        JSON.stringify(memory, null, 2)
    );
}

/* =========================
   NOM UTILISATEUR
========================= */

async function getName(api, uid) {
    try {
        const info = await api.getUserInfo(uid);

        return (
            info?.[uid]?.name ||
            "Utilisateur"
        );
    } catch {
        return "Utilisateur";
    }
}

/* =========================
   IMAGES
========================= */

function extractImageUrls(event) {
    const urls = [];

    for (const att of event?.attachments || []) {
        if (
            (
                att.type === "photo" ||
                att.type === "image"
            ) &&
            att.url
        ) {
            urls.push(att.url);
        }
    }

    for (
        const att of
        event?.messageReply?.attachments || []
    ) {
        if (
            (
                att.type === "photo" ||
                att.type === "image"
            ) &&
            att.url
        ) {
            urls.push(att.url);
        }
    }

    return [...new Set(urls)];
}

/* =========================
   ANALYSE IMAGE
========================= */

async function analyzeImage(imageUrl) {
    try {
        const response = await axios.get(
            IMG2PROMPT_API_URL,
            {
                params: {
                    imageUrl,
                    language: "fr",
                    model: 0
                },
                timeout: 60000
            }
        );

        const data = response.data;

        if (
            data?.success &&
            typeof data?.prompt === "string"
        ) {
            return data.prompt;
        }

        if (
            typeof data?.prompt === "string"
        ) {
            return data.prompt;
        }

        if (
            typeof data?.result?.prompt === "string"
        ) {
            return data.result.prompt;
        }

        if (
            typeof data?.result === "string"
        ) {
            return data.result;
        }

        return null;

    } catch (error) {

        console.log(
            "❌ Analyse image :",
            error.message
        );

        return null;
    }
}

/* =========================
   RECHERCHE WEB
========================= */

async function searchWeb(query) {
    try {

        const response = await axios.get(
            "https://www.google.com/search",
            {
                params: {
                    q: query,
                    hl: "fr"
                },
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/130.0 Mobile Safari/537.36"
                },
                timeout: 20000
            }
        );

        const html = response.data;

        const text = html
            .replace(
                /<script[\s\S]*?<\/script>/gi,
                " "
            )
            .replace(
                /<style[\s\S]*?<\/style>/gi,
                " "
            )
            .replace(
                /<[^>]+>/g,
                " "
            )
            .replace(
                /\s+/g,
                " "
            )
            .trim();

        return text.substring(0, 12000);

    } catch (error) {

        console.log(
            "❌ Recherche Web :",
            error.message
        );

        return null;
    }
}

/* =========================
   DÉTECTION RECHERCHE
========================= */

function needsWebSearch(prompt) {

    const words = [
        "cherche",
        "recherche",
        "internet",
        "web",
        "info",
        "information",
        "informations",
        "c'est quoi",
        "c’est quoi",
        "qui est",
        "quel est",
        "quelle est",
        "prix",
        "date",
        "origine",
        "histoire",
        "actualité",
        "actuel",
        "actuelle",
        "récent",
        "récente",
        "vérifie",
        "vérifier",
        "confirme",
        "confirmer",
        "identifie",
        "identifier",
        "nom",
        "marque",
        "modèle",
        "produit",
        "personnage",
        "lieu"
    ];

    const lower =
        prompt.toLowerCase();

    return words.some(
        word => lower.includes(word)
    );
}

/* =========================
   COMMANDE
========================= */

module.exports = {

    config: {
        name: "ai",
        version: "18.0",
        author: "CRIMSON D-SHADOW",
        countDown: 3,
        role: 0,
        category: "ai",

        aliases: [
            "marin",
            "gpt",
            "ai"
        ]
    },

    /* =========================
       ON START
    ========================= */

    onStart: async function ({
        api,
        event,
        message,
        args
    }) {

        const prompt =
            args.join(" ").trim();

        await this.process(
            api,
            event,
            message,
            prompt
        );
    },

    /* =========================
       ON CHAT
    ========================= */

    onChat: async function ({
        api,
        event,
        message
    }) {

        const body =
            event?.body || "";

        if (
            !/^(marin|marine|box)\b/i.test(body)
        ) {
            return;
        }

        const prompt =
            body
                .replace(
                    /^(marin|marine|box)\b/i,
                    ""
                )
                .trim();

        await this.process(
            api,
            event,
            message,
            prompt
        );
    },

    /* =========================
       ON REPLY
    ========================= */

    onReply: async function ({
        api,
        event,
        message,
        Reply
    }) {

        const prompt =
            event?.body?.trim() || "";

        const previousImages =
            Array.isArray(Reply?.imageUrls)
                ? Reply.imageUrls
                : [];

        await this.process(
            api,
            event,
            message,
            prompt,
            previousImages
        );
    },

    /* =========================
       PROCESS
    ========================= */

    process: async function (
        api,
        event,
        message,
        prompt,
        previousImages = []
    ) {

        try {

            const uid =
                event.senderID;

            const name =
                await getName(
                    api,
                    uid
                );

            /* =====================
               RÉCUPÉRER LES IMAGES
            ===================== */

            let imageUrls =
                extractImageUrls(event);

            if (
                imageUrls.length === 0 &&
                Array.isArray(previousImages)
            ) {
                imageUrls =
                    previousImages;
            }

            /* =====================
               ANALYSE
            ===================== */

            let imageContext = "";

            if (
                imageUrls.length > 0
            ) {

                const descriptions = [];

                for (
                    const imageUrl of imageUrls
                ) {

                    const description =
                        await analyzeImage(
                            imageUrl
                        );

                    if (description) {
                        descriptions.push(
                            description
                        );
                    }
                }

                if (
                    descriptions.length > 0
                ) {

                    imageContext = `
📸 ANALYSE DE L'IMAGE

${descriptions.join("\n\n")}

Utilise cette analyse pour
comprendre ce qui apparaît
dans l'image.
`;
                }
            }

            /* =====================
               RECHERCHE WEB
            ===================== */

            let webContext = "";

            const shouldSearch =
                needsWebSearch(prompt) ||
                (
                    imageUrls.length > 0 &&
                    /identifie|identifier|nom|marque|modèle|model|produit|personnage|lieu|information|info/i
                        .test(prompt)
                );

            if (shouldSearch) {

                const searchQuery = `
${prompt}

Éléments détectés dans l'image :
${imageContext.substring(0, 3500)}
`;

                const searchResult =
                    await searchWeb(
                        searchQuery
                    );

                if (searchResult) {

                    webContext = `
🔎 INFORMATIONS TROUVÉES SUR LE WEB

${searchResult}

IMPORTANT :
Utilise uniquement les informations
pertinentes pour répondre.

Si l'information n'est pas certaine,
indique-le clairement.
`;
                }
            }

            /* =====================
               QUESTION
            ===================== */

            const userPrompt =
                prompt ||
                (
                    imageUrls.length > 0
                        ? "Analyse cette image et donne-moi les informations importantes."
                        : "Bonjour Marin"
                );

            /* =====================
               PERSONNALITÉ MARIN
            ===================== */

            const fullPrompt = `
Tu es MARIN KITAGAWA 🎀.

Tu gardes toujours une personnalité
inspirée de Marin Kitagawa :
joyeuse, expressive, naturelle,
amicale et énergique.

Tu réponds principalement en français.

STYLE :
✨ Utilise quelques emojis naturellement.
💬 Garde des réponses humaines et fluides.
📌 Utilise cet emoji pour les informations importantes.
🔎 Utilise cet emoji lorsqu'il s'agit d'une recherche.
💡 Utilise cet emoji pour une explication.
✅ Pour une information confirmée.
⚠️ Pour une information incertaine.

Ne mets PAS un emoji après chaque phrase.
Les emojis doivent décorer la réponse,
pas la rendre illisible.

RECHERCHE :
Quand une recherche Web est effectuée,
donne de vraies informations trouvées.
Ne fabrique jamais une information
qui n'est pas présente dans les données.

IMAGE :
Si une image est fournie,
utilise son analyse.

Si l'utilisateur demande :
- ce qu'il y a sur l'image
- le nom d'un objet
- une marque
- un modèle
- un personnage
- un lieu
- un produit
- une information concernant l'image

utilise l'analyse de l'image et,
si nécessaire, les informations Web.

Si les informations trouvées ne
permettent pas une identification fiable,
dis-le franchement.

========================

👤 UTILISATEUR :
${name}

${imageContext}

${webContext}

========================

💬 QUESTION :
${userPrompt}
`;

            /* =====================
               APPEL IA
            ===================== */

            const response =
                await axios.post(
                    AI_API_URL,
                    {
                        prompt: fullPrompt
                    },
                    {
                        headers: {
                            "Content-Type":
                                "application/json"
                        },
                        timeout: 60000
                    }
                );

            const data =
                response.data;

            let answer = null;

            if (
                typeof data?.result?.answer ===
                "string"
            ) {
                answer =
                    data.result.answer;
            }

            else if (
                typeof data?.answer ===
                "string"
            ) {
                answer =
                    data.answer;
            }

            else if (
                typeof data?.result ===
                "string"
            ) {
                answer =
                    data.result;
            }

            else if (
                typeof data?.response ===
                "string"
            ) {
                answer =
                    data.response;
            }

            else if (
                typeof data?.message ===
                "string"
            ) {
                answer =
                    data.message;
            }

            else if (
                typeof data?.text ===
                "string"
            ) {
                answer =
                    data.text;
            }

            if (!answer) {
                throw new Error(
                    "L'API IA n'a renvoyé aucune réponse."
                );
            }

            /* =====================
               MÉMOIRE
            ===================== */

            const memory =
                await loadMemory();

            if (
                !Array.isArray(memory[uid])
            ) {
                memory[uid] = [];
            }

            memory[uid].push({
                user: userPrompt,
                assistant: answer,
                timestamp: Date.now()
            });

            if (
                memory[uid].length > 20
            ) {
                memory[uid] =
                    memory[uid].slice(-20);
            }

            await saveMemory(
                memory
            );

            /* =====================
               STYLE FINAL
            ===================== */

            const decoratedAnswer =
`🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨
━━━━━━━━━━━━━━━━━━━━━━
${answer}`;

            const sent =
                await message.reply(
                    decoratedAnswer
                );

            /* =====================
               CONSERVER L'IMAGE
            ===================== */

            if (
                sent?.messageID &&
                global.GoatBot?.onReply
            ) {

                global.GoatBot.onReply.set(
                    sent.messageID,
                    {
                        commandName:
                            this.config.name,

                        author:
                            uid,

                        imageUrls:
                            imageUrls
                    }
                );
            }

        } catch (error) {

            console.log(
                "\n========== MARIN ERROR =========="
            );

            console.log(
                "MESSAGE :",
                error?.message
            );

            console.log(
                "STATUS :",
                error?.response?.status
            );

            console.log(
                "DATA :",
                error?.response?.data
            );

            console.log(
                "=================================\n"
            );

            await message.reply(
`🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨
━━━━━━━━━━━━━━━━━━━━━━
❌ Une erreur est survenue.

${error?.message || "Erreur inconnue"}`
            );
        }
    }
};