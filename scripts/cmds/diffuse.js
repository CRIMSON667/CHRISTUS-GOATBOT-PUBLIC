const axios = require("axios");

module.exports = {
        config: {
                name: "diffuse",
                aliases: ["diff", "broadcast"],
                version: "2.2",
                author: "CRIMSON 🖇️🩵🪽",
                countDown: 5,
                role: 2,
                description: {
                        fr: "Envoyer une notification à tous les groupes",
                        en: "Send notification to all groups"
                },
                category: "owner",
                guide: {
                        fr: "{pn} message"
                },
                envConfig: {
                        delayPerGroup: 250
                }
        },

        langs: {
                fr: {
                        missingMessage: "🌸 Entre le message à diffuser.",
                        sendingNotification: "📢 Diffusion vers %1 groupes...",
                        sentNotification: "✅ Diffusion envoyée dans %1 groupes.",
                        errorSendingNotification: "❌ Erreur dans %1 groupes :\n%2"
                },
                en: {
                        missingMessage: "🌸 Enter the message.",
                        sendingNotification: "📢 Sending to %1 groups...",
                        sentNotification: "✅ Sent to %1 groups.",
                        errorSendingNotification: "❌ Error in %1 groups:\n%2"
                }
        },

        onStart: async function ({
                message,
                api,
                event,
                args,
                commandName,
                envCommands,
                threadsData,
                getLang
        }) {

                const { delayPerGroup } = envCommands[commandName];

                if (!args[0])
                        return message.reply(getLang("missingMessage"));


                const photo = await axios.get(
                        "https://i.ibb.co/MDcpxtMG/620628800-25863355999927181-6293027326747011463-n-jpg-stp-dst-jpg-s480x480-tt6-nc-cat-106-ccb-1-7.jpg",
                        {
                                responseType: "stream"
                        }
                );


                const allThreadID = (await threadsData.getAll())
                        .filter(t =>
                                t.isGroup &&
                                t.members.find(
                                        m => m.userID == api.getCurrentUserID()
                                )?.inGroup
                        );


                message.reply(
                        getLang(
                                "sendingNotification",
                                allThreadID.length
                        )
                );


                let success = 0;


                for (const thread of allThreadID) {

                        const formSend = {

                                body: `━━━━━━━━━━━━━━━━
📢 𝐊𝐈𝐓𝐀𝐆𝐀𝐖𝐀 𝐍𝐎𝐓𝐈𝐅𝐈𝐂𝐀𝐓𝐈𝐎𝐍

🏷️ 𝐆𝐫𝐨𝐮𝐩 𝐧𝐚𝐦𝐞: ${thread.threadName || "Groupe"}

━━━━━━━━━━━━━━━━

💬 𝐌𝐞𝐬𝐬𝐚𝐠𝐞 :

${args.join(" ")}

━━━━━━━━━━━━━━━━
🌸 𝐊𝐈𝐓𝐀𝐆𝐀𝐖𝐀 𝐁𝐎𝐓
⚡ 𝐎𝐟𝐟𝐢𝐜𝐢𝐚𝐥 𝐁𝐫𝐨𝐚𝐝𝐜𝐚𝐬𝐭
━━━━━━━━━━━━━━━━`,

                                attachment: photo.data
                        };


                        try {

                                await api.sendMessage(
                                        formSend,
                                        thread.threadID
                                );

                                success++;

                                await new Promise(resolve =>
                                        setTimeout(resolve, delayPerGroup)
                                );

                        } catch (e) {}

                }


                message.reply(
                        getLang(
                                "sentNotification",
                                success
                        )
                );

        }
};
