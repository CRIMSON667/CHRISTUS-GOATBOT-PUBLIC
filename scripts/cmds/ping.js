const axios = require("axios");

module.exports = {
        config: {
                name: "ping",
                aliases: ["p"],
                version: "1.3",
                author: "CRIMSON 🖇️🩵🪽",
                countDown: 5,
                role: 0,
                description: {
                        fr: "Voir la vitesse du bot",
                        en: "Check bot speed"
                },
                category: "system",
                guide: {
                        fr: "{pn}",
                        en: "{pn}"
                }
        },

        onStart: async function ({ message }) {

                const start = Date.now();


                const gifs = [
                        "https://i.ibb.co/fVTYwSfZ/540928151-1246878020785337-8504017987248964804-n-gif-nc-cat-109-ccb-1-7-nc-sid-cf94fc-nc-eui2-Ae-H.gif",
                        "https://i.ibb.co/tMzQPfSG/467104543-1609427259673042-7413638891178667400-n-gif-nc-cat-109-ccb-1-7-nc-sid-cf94fc-nc-eui2-Ae-G.gif"
                ];


                const gif = await axios.get(
                        gifs[Math.floor(Math.random() * gifs.length)],
                        {
                                responseType: "stream"
                        }
                );


                const ping = Date.now() - start;


                message.reply({

                        body: `╭━━━━━━〔 🌸 𝐊𝐈𝐓𝐀𝐆𝐀𝐖𝐀 〕━━━━━━╮
┃
┃ ⚡ 𝐏𝐈𝐍𝐆 𝐒𝐘𝐒𝐓𝐄𝐌
┃
┣━━━━━━━━━━━━━━
┃
┃ 🏷️ 𝐒𝐭𝐚𝐭𝐮𝐬 : ✅ Online
┃ ⚡ 𝐋𝐚𝐭𝐞𝐧𝐜𝐞 : ${ping}ms
┃ 🤖 𝐁𝐨𝐭 : Actif
┃
┣━━━━━━━━━━━━━━
┃
┃ 🌸 𝐊𝐈𝐓𝐀𝐆𝐀𝐖𝐀 𝐒𝐘𝐒𝐓𝐄𝐌
┃ 🖇️ 𝐂𝐑𝐈𝐌𝐒𝐎𝐍 🩵🪽
┃
╰━━━━━━━━━━━━━━╯`,

                        attachment: gif.data

                });

        }
};
