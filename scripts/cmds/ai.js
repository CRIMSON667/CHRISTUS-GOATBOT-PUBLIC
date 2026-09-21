const axios = require("axios");
const fs = require("fs");
const path = require("path");

const CREATOR_UID = "61594127422186";

const MEMORY_FILE =
    path.join(__dirname, "marin_memory.json");

const IMAGE_API =
    "https://gem-tw6a.onrender.com/generate";


/* =========================
   💾 MÉMOIRE
========================= */

if (!fs.existsSync(MEMORY_FILE)) {
    fs.writeFileSync(
        MEMORY_FILE,
        "{}"
    );
}


function loadMemory() {
    try {
        return JSON.parse(
            fs.readFileSync(
                MEMORY_FILE,
                "utf8"
            )
        );
    } catch {
        return {};
    }
}


function saveMemory(data) {
    fs.writeFileSync(
        MEMORY_FILE,
        JSON.stringify(
            data,
            null,
            2
        )
    );
}


/* =========================
   👤 NOM UTILISATEUR
========================= */

async function getName(api, uid) {
    try {

        const info =
            await new Promise(
                (resolve, reject) => {

                    api.getUserInfo(
                        uid,
                        (err, data) => {

                            if (err)
                                reject(err);
                            else
                                resolve(data);
                        }
                    );
                }
            );

        return (
            info?.[uid]?.name ||
            "Inconnu"
        );

    } catch {

        return "Inconnu";
    }
}


/* =========================
   👥 GROUPE
========================= */

async function getGroupInfo(
    api,
    threadID
) {

    if (!threadID)
        return null;

    try {

        const info =
            await new Promise(
                (resolve, reject) => {

                    api.getThreadInfo(
                        threadID,
                        (err, data) => {

                            if (err)
                                reject(err);
                            else
                                resolve(data);
                        }
                    );
                }
            );

        return {

            uid:
                String(threadID),

            name:
                info?.threadName ||
                "Groupe sans nom",

            memberCount:
                info?.participantIDs
                    ?.length ||
                0
        };

    } catch {

        return {

            uid:
                String(threadID),

            name:
                "Groupe inconnu",

            memberCount:
                0
        };
    }
}


/* =========================
   🎯 PERSONNE CIBLÉE
========================= */

async function getTarget(
    api,
    event
) {

    let uid = null;


    /* 🏷️ TAG */

    if (
        event.mentions &&
        Object.keys(
            event.mentions
        ).length
    ) {

        uid = String(
            Object.keys(
                event.mentions
            )[0]
        );
    }


    /* ↩️ REPLY */

    if (
        !uid &&
        event.messageReply?.senderID
    ) {

        uid = String(
            event.messageReply
                .senderID
        );
    }


    /* 🆔 UID */

    if (
        !uid &&
        event.body
    ) {

        const match =
            event.body.match(
                /\b\d{8,20}\b/
            );

        if (match)
            uid = match[0];
    }


    if (!uid)
        return null;


    return {

        uid,

        name:
            await getName(
                api,
                uid
            )
    };
}


/* =========================
   🧠 COMPORTEMENT
========================= */

function getBehavior(
    memory,
    uid
) {

    if (
        !memory[uid].behavior
    ) {

        memory[uid].behavior = {

            rude: 0,

            creatorInsults: 0,

            respect: 0
        };
    }


    return memory[uid].behavior;
}


/* =========================
   🔎 ANALYSE MESSAGE
========================= */

function analyzeBehavior(
    text
) {

    const lower =
        text.toLowerCase();


    const rudeWords = [

        "ta gueule",

        "ferme ta gueule",

        "tg",

        "ftg",

        "dégage",

        "degage",

        "connard",

        "connasse",

        "idiot",

        "idiote",

        "imbécile",

        "imbecile",

        "abruti",

        "abrutie",

        "nul",

        "nulle"
    ];


    const creatorWords = [

        "ton créateur",

        "ton createur",

        "créateur",

        "createur",

        CREATOR_UID
    ];


    const insult =
        rudeWords.some(
            word =>
                lower.includes(word)
        );


    const creatorMentioned =
        creatorWords.some(
            word =>
                lower.includes(word)
        );


    return {

        rude:
            insult,

        creatorInsult:
            insult &&
            creatorMentioned
    };
}


/* =========================
   🎀 ATTITUDE
========================= */

function getAttitude(
    memory,
    uid
) {

    const behavior =
        getBehavior(
            memory,
            uid
        );


    if (
        behavior.creatorInsults >= 3
    ) {

        return (

            "Cette personne a insulté ton créateur plusieurs fois. " +

            "Sois ferme avec elle et demande-lui clairement d'arrêter. " +

            "Ne l'insulte jamais en retour."

        );
    }


    if (
        behavior.creatorInsults >= 1
    ) {

        return (

            "Cette personne a déjà manqué de respect à ton créateur. " +

            "Reste polie mais avertis-la clairement si elle recommence."

        );
    }


    if (
        behavior.rude >= 4
    ) {

        return (

            "Cette personne te parle régulièrement mal. " +

            "Sois plus froide et distante avec elle, " +

            "sans devenir insultante."

        );
    }


    if (
        behavior.rude >= 2
    ) {

        return (

            "Cette personne a déjà été irrespectueuse plusieurs fois. " +

            "Reste polie mais sois moins chaleureuse avec elle."

        );
    }


    return (

        "Cette personne est respectueuse. " +

        "Sois gentille, chaleureuse et naturelle avec elle."

    );
}


/* =========================
   📰 NEWS
========================= */

async function getNews(
    topic = "actualités"
) {

    try {

        const q =
            encodeURIComponent(
                topic
            );


        const url =
            "https://news.google.com/rss/search?q=" +
            q +
            "&hl=fr&gl=FR&ceid=FR:fr";


        const r =
            await axios.get(
                url,
                {
                    timeout: 15000
                }
            );


        const items = [

            ...r.data.matchAll(
                /<item>([\s\S]*?)<\/item>/g
            )

        ].slice(
            0,
            7
        );


        if (!items.length)

            return (
                "Aucune actualité trouvée."
            );


        return items.map(
            (x, i) => {

                const block =
                    x[1];


                const title =
                    block
                        .match(
                            /<title>([\s\S]*?)<\/title>/
                        )?.[1]
                        ?.replace(
                            /<!\[CDATA\[|\]\]>/g,
                            ""
                        )
                        ?.trim() ||
                    "Sans titre";


                return (
                    `${i + 1}. ${title}`
                );

            }
        ).join("\n");


    } catch {

        return (
            "❌ Impossible de récupérer les actualités."
        );
    }
}


/* =========================
   🎨 IMAGE
========================= */

async function generateImage(
    prompt
) {

    try {

        console.log(
            "🎨 MARIN IMAGE :",
            prompt
        );


        const response =
            await axios.post(

                IMAGE_API,

                {

                    prompt:
                        prompt,

                    ratio:
                        "1:1",

                    format:
                        "jpg"
                },

                {

                    responseType:
                        "arraybuffer",

                    timeout:
                        180000,

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Accept":
                            "*/*"
                    }
                }
            );


        const contentType =
            String(
                response.headers[
                    "content-type"
                ] || ""
            ).toLowerCase();


        /* 🖼️ IMAGE DIRECTE */

        if (
            contentType.includes(
                "image/"
            )
        ) {

            return Buffer.from(
                response.data
            );
        }


        /* 🔗 API RENVOIE UN LIEN */

        const raw =
            Buffer.from(
                response.data
            ).toString(
                "utf8"
            );


        let data = null;


        try {

            data =
                JSON.parse(
                    raw
                );

        } catch {}


        let imageUrl = null;


        if (
            typeof data ===
            "string"
        ) {

            if (
                data.startsWith(
                    "http"
                )
            ) {

                imageUrl =
                    data;
            }
        }


        if (data) {

            imageUrl =

                data.url ||

                data.image ||

                data.imageUrl ||

                data.link ||

                data.download ||

                data.result ||

                data.response ||

                data.data?.url ||

                data.data?.image ||

                data.data?.link ||

                null;
        }


        /* 🔎 CHERCHE URL DANS LA RÉPONSE */

        if (
            !imageUrl &&
            raw.includes("http")
        ) {

            const match =
                raw.match(
                    /https?:\/\/[^\s"'\\]+/
                );


            if (match)
                imageUrl =
                    match[0];
        }


        if (!imageUrl) {

            throw new Error(
                "Aucune URL d'image trouvée."
            );
        }


        console.log(
            "🔗 Image :",
            imageUrl
        );


        /* ⬇️ TÉLÉCHARGER L'IMAGE */

        const imageResponse =
            await axios.get(

                imageUrl,

                {

                    responseType:
                        "arraybuffer",

                    timeout:
                        180000
                }
            );


        if (
            !imageResponse.data ||
            imageResponse.data.length === 0
        ) {

            throw new Error(
                "Image vide."
            );
        }


        return Buffer.from(
            imageResponse.data
        );


    } catch (error) {

        console.error(
            "❌ IMAGE ERROR:",
            error.message
        );


        if (
            error.response
        ) {

            console.error(
                "STATUS:",
                error.response.status
            );
        }


        return null;
    }
}


/* =========================
   🔎 IMAGE REQUEST
========================= */

function isImageRequest(
    text
) {

    const t =
        text
            .toLowerCase()
            .trim();


    const words = [

        "imagine ",

        "génère ",

        "genere ",

        "génère-moi ",

        "genere-moi ",

        "crée une image ",

        "cree une image ",

        "crée-moi une image ",

        "cree-moi une image ",

        "dessine ",

        "fais une image "
    ];


    return words.some(
        word =>
            t.startsWith(word)
    );
}


/* =========================
   🧹 PROMPT IMAGE
========================= */

function getImagePrompt(
    text
) {

    let prompt =
        text.trim();


    const prefixes = [

        "imagine ",

        "génère ",

        "genere ",

        "génère-moi ",

        "genere-moi ",

        "crée une image ",

        "cree une image ",

        "crée-moi une image ",

        "cree-moi une image ",

        "dessine ",

        "fais une image "
    ];


    for (
        const prefix of prefixes
    ) {

        if (

            prompt
                .toLowerCase()
                .startsWith(prefix)

        ) {

            prompt =
                prompt
                    .slice(
                        prefix.length
                    )
                    .trim();

            break;
        }
    }


    return prompt;
}


/* =========================
   🤖 MODULE
========================= */

module.exports = {

    config: {

        name:
            "ai",

        aliases: [

            "marin",

            "gpt"

        ],

        version:
            "7.0",

        author:
            "CRIMSON",

        countDown:
            3,

        role:
            0,

        category:
            "ai"
    },


    /* =========================
       🎀 COMMAND
    ========================= */

    onStart: async function ({
        api,
        event,
        args,
        message
    }) {

        const text =
            args
                .join(" ")
                .trim();


        if (!text) {

            return message.reply(

                "🎀 𝗠𝗔𝗥𝗜𝗡\n" +
                "━━━━━━━━━━━━━━\n" +
                "🩷 Oui ? Je t'écoute !"
            );
        }


        return this.process(
            api,
            event,
            message,
            text
        );
    },


    /* =========================
       💬 MARINE
    ========================= */

    onChat: async function ({
        api,
        event,
        message
    }) {

        const body =
            event.body?.trim();


        if (!body)
            return;


        const lower =
            body.toLowerCase();


        if (
            lower ===
            "marine"
        ) {

            return message.reply(

                "🎀 𝗠𝗔𝗥𝗜𝗡\n" +
                "━━━━━━━━━━━━━━\n" +
                "🩷 Oui ? Je t'écoute !"
            );
        }


        if (
            !lower.startsWith(
                "marine "
            )
        ) {

            return;
        }


        return this.process(

            api,

            event,

            message,

            body
                .slice(7)
                .trim()
        );
    },


    /* =========================
       ↩️ REPLY
    ========================= */

    onReply: async function ({
        api,
        event,
        message
    }) {

        const text =
            event.body?.trim();


        if (!text)
            return;


        return this.process(
            api,
            event,
            message,
            text
        );
    },


    /* =========================
       🧠 PROCESS
    ========================= */

    process: async function (
        api,
        event,
        message,
        text
    ) {

        const lower =
            text.toLowerCase();


        /* 🎨 IMAGE */

        if (
            isImageRequest(
                text
            )
        ) {

            const prompt =
                getImagePrompt(
                    text
                );


            if (!prompt) {

                return message.reply(

                    "🎨 Dis-moi ce que tu veux que je crée 😭"
                );
            }


            await message.reply(

                "🎨 𝗠𝗔𝗥𝗜𝗡 𝗜𝗠𝗔𝗚𝗘\n" +
                "━━━━━━━━━━━━━━\n" +
                "⏳ Je crée ton image..."
            );


            const image =
                await generateImage(
                    prompt
                );


            if (!image) {

                return message.reply(

                    "❌ Je n'ai pas réussi à récupérer l'image."
                );
            }


            return message.reply({

                body:

                    "🎀 𝗠𝗔𝗥𝗜𝗡\n" +
                    "━━━━━━━━━━━━━━\n" +
                    "🖼️ Voilà ton image !",

                attachment:
                    image
            });
        }


        /* 📰 NEWS */

        if (

            lower ===
                "news" ||

            lower ===
                "actualités" ||

            lower ===
                "actualites"

        ) {

            const news =
                await getNews(
                    "actualités du jour"
                );


            return message.reply(

                "🎀 𝗠𝗔𝗥𝗜𝗡 𝗡𝗘𝗪𝗦\n" +
                "━━━━━━━━━━━━━━\n" +
                news
            );
        }


        if (
            lower.startsWith(
                "news "
            )
        ) {

            const topic =
                text
                    .slice(5)
                    .trim();


            const news =
                await getNews(
                    topic
                );


            return message.reply(

                "🎀 𝗠𝗔𝗥𝗜𝗡 𝗡𝗘𝗪𝗦\n" +
                "━━━━━━━━━━━━━━\n" +
                `🔎 ${topic}\n\n` +
                news
            );
        }


        return this.chat(
            api,
            event,
            message,
            text
        );
    },


    /* =========================
       🧠 CHAT
    ========================= */

    chat: async function (
        api,
        event,
        message,
        text
    ) {

        try {

            const uid =
                String(
                    event.senderID
                );


            const memory =
                loadMemory();


            if (
                !memory[uid]
            ) {

                memory[uid] = {

                    name:
                        "Inconnu",

                    messages:
                        [],

                    people:
                        {},

                    groups:
                        {},

                    behavior: {

                        rude:
                            0,

                        creatorInsults:
                            0,

                        respect:
                            0
                    }
                };
            }


            if (
                !memory[uid].people
            ) {

                memory[uid].people = {};
            }


            if (
                !memory[uid].messages
            ) {

                memory[uid].messages = [];
            }


            if (
                !memory[uid].groups
            ) {

                memory[uid].groups = {};
            }


            /* 🧠 COMPORTEMENT */

            const behavior =
                getBehavior(
                    memory,
                    uid
                );


            const analysis =
                analyzeBehavior(
                    text
                );


            if (
                analysis.rude
            ) {

                behavior.rude++;
            }


            if (
                analysis.creatorInsult
            ) {

                behavior.creatorInsults++;
            }


            if (
                !analysis.rude
            ) {

                behavior.respect++;
            }


            /* 👤 NOM */

            const userName =
                await getName(
                    api,
                    uid
                );


            if (

                userName &&
           
