const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
        config: {
                name: "diffuse",
                aliases: ["diff", "broadcast"],
                version: "3.4",
                author: "CRIMSON 🖇️🩵🪽",
                countDown: 5,
                role: 2,
                description: {
                        fr: "Envoyer une notification avec sélection des groupes",
                        en: "Send notification with group selection"
                },
                category: "owner",
                guide: {
                        fr: "{pn} votre message",
                        en: "{pn} your message"
                },
                envConfig: {
                        delayPerGroup: 300
                }
        },

        langs: {
                fr: {
                        missingMessage: "🌸 Veuillez entrer le message à diffuser.",
                        noGroups: "❌ Aucun groupe éligible trouvé.",
                        selectHeader: "╭─── 📢 𝐒𝐄́𝐋𝐄𝐂𝐓𝐈𝐎𝐍 𝐃𝐄𝐒 𝐆𝐑𝐎𝐔𝐏𝐄𝐒 ───╮\n│\n│ Répondez à ce message avec :\n│  • \"all\" ➔ Tous les groupes\n│  • \"1,2,3\" ➔ Numéros spécifiques\n├─────────────────────────────\n",
                        selectFooter: "╰─────────────────────────────╯",
                        sendingNotification: "📢 Diffusion en cours vers %1 groupe(s)...",
                        sentNotification: "✅ Diffusion réussie dans %1 groupe(s).",
                        invalidSelection: "❌ Sélection invalide. Répondez avec \"all\" ou des numéros valides."
                },
                en: {
                        missingMessage: "🌸 Please enter the message to broadcast.",
                        noGroups: "❌ No eligible groups found.",
                        selectHeader: "╭─── 📢 𝐆𝐑𝐎𝐔𝐏 𝐒𝐄𝐋𝐄𝐂𝐓𝐈𝐎𝐍 ───╮\n│\n│ Reply to this message with:\n│  • \"all\" ➔ All groups\n│  • \"1,2,3\" ➔ Specific numbers\n├─────────────────────────────\n",
                        selectFooter: "╰─────────────────────────────╯",
                        sendingNotification: "📢 Broadcasting to %1 group(s)...",
                        sentNotification: "✅ Broadcast successfully sent to %1 group(s).",
                        invalidSelection: "❌ Invalid selection. Reply with \"all\" or valid numbers."
                }
        },

        onStart: async function ({ api, message, event, args, threadsData, getLang }) {
                if (!args[0])
                        return message.reply(getLang("missingMessage"));

                const broadcastMessage = args.join(" ");

                const allThreads = (await threadsData.getAll())
                        .filter(t => t.isGroup && t.members.some(m => m.userID == api.getCurrentUserID() && m.inGroup));

                if (allThreads.length === 0)
                        return message.reply(getLang("noGroups"));

                let msgList = getLang("selectHeader");
                allThreads.forEach((thread, index) => {
                        const num = (index + 1).toString().padStart(2, '0');
                        msgList += `│ [${num}] ➔ ${thread.threadName || "Groupe sans nom"}\n`;
                });
                msgList += getLang("selectFooter");

                return message.reply(msgList, (err, info) => {
                        if (err) return;
                        global.GoatBot.onReply.set(info.messageID, {
                                commandName: this.config.name,
                                messageID: info.messageID,
                                author: event.senderID,
                                broadcastMessage,
                                allThreads
                        });
                });
        },

        onReply: async function ({ message, event, Reply, api, envCommands, commandName, getLang }) {
                const { author, broadcastMessage, allThreads } = Reply;

                if (event.senderID !== author) return;

                const replyText = event.body.trim().toLowerCase();
                let selectedThreads = [];

                if (replyText === "all") {
                        selectedThreads = allThreads;
                } else {
                        const indexes = replyText.split(",")
                                .map(x => parseInt(x.trim()) - 1)
                                .filter(x => !isNaN(x) && x >= 0 && x < allThreads.length);

                        if (indexes.length === 0)
                                return message.reply(getLang("invalidSelection"));

                        selectedThreads = indexes.map(i => allThreads[i]);
                }

                global.GoatBot.onReply.delete(Reply.messageID);

                // Mesure du VRAI ping sur une requête réseau réelle vers Messenger
                const startPing = Date.now();
                await message.reply(getLang("sendingNotification", selectedThreads.length));
                const ping = Date.now() - startPing;

                const { delayPerGroup } = envCommands[commandName];

                // Fichier cache temporaire pour garantir l'affichage photo natif
                const cachePath = path.join(__dirname, "cache", `broadcast_${Date.now()}.jpg`);
                let hasImage = false;

                try {
                        await fs.ensureDir(path.join(__dirname, "cache"));
                        const imgRes = await axios.get(
                                "https://i.ibb.co/MDcpxtMG/620628800-25863355999927181-6293027326747011463-n-jpg-stp-dst-jpg-s480x480-tt6-nc-cat-106-ccb-1-7.jpg",
                                { responseType: "arraybuffer" }
                        );
                        await fs.writeFile(cachePath, Buffer.from(imgRes.data));
                        hasImage = true;
                } catch (e) {
                        hasImage = false;
                }

                const now = new Date();
                const dateStr = now.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
                const timeStr = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

                let success = 0;

                for (const thread of selectedThreads) {
                        const formSend = {
                                body: `╭───────────── Broadcast ─────────────╮
│ 📢 𝐍𝐎𝐓𝐈𝐅𝐈𝐂𝐀𝐓𝐈𝐎𝐍 𝐎𝐅𝐅𝐈𝐂𝐈𝐄𝐋𝐋𝐄
├─────────────────────────────────────
│ 👥 𝐆𝐫𝐨𝐮𝐩𝐞 : ${thread.threadName || "Groupe"}
│ 📅 𝐃𝐚𝐭𝐞   : ${dateStr}
│ ⏰ 𝐇𝐞𝐮𝐫𝐞   : ${timeStr}
│ ⚡ 𝐏𝐢𝐧𝐠    : ${ping}ms
├─────────────────────────────────────
│ 💬 𝐌𝐞𝐬𝐬𝐚𝐠𝐞 :
│
│ ${broadcastMessage}
│
├─────────────────────────────────────
│ ℹ️ POUR CONTACTER L'ADMIN IL FAUT
│ ÉCRIRE CALLAD PUIS TA QUESTION
╰─────────────────────────────────────╯`
                        };

                        if (hasImage) {
                                formSend.attachment = fs.createReadStream(cachePath);
                        }

                        try {
                                await api.sendMessage(formSend, thread.threadID);
                                success++;
                                await new Promise(r => setTimeout(r, delayPerGroup));
                        } catch (e) {}
                }

                if (hasImage && fs.existsSync(cachePath)) {
                        await fs.unlink(cachePath).catch(() => {});
                }

                message.reply(getLang("sentNotification", success));
        }
};