const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
	config: {
		name: "tiktok",
		aliases: ["tt"],
		version: "1.0",
		author: "Azadx69x",
		role: 0,
		shortDescription: "🎬 Rechercher une vidéo TikTok",
		longDescription: "🔎 Rechercher une vidéo TikTok et l'envoyer avec ses statistiques",
		category: "media"
	},

	onStart: async function ({ message, args }) {
		return this.run({ message, args });
	},

	onChat: async function ({ message, args, event }) {
		const body = (event.body || "").toLowerCase();

		if (!body.startsWith("tt ") && !body.startsWith("tiktok "))
			return;

		args = body.split(" ").slice(1);

		return this.run({ message, args });
	},

	run: async function ({ message, args }) {
		try {
			const query = args.join(" ").trim();

			if (!query)
				return message.reply(
					"🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n" +
					"━━━━━━━━━━━━━━━━━━━━━━\n" +
					"⚠️ Entre un mot-clé à rechercher.\n" +
					"📌 Exemple : tt football\n" +
					"━━━━━━━━━━━━━━━━━━━━━━"
				);

			await message.reply(
				`🔎 Recherche TikTok pour « ${query} »...`
			);

			const apiUrl =
				`https://azadx69x-all-apis-top.vercel.app/api/tiktok?query=${encodeURIComponent(query)}`;

			const { data } = await axios.get(apiUrl);

			if (!data?.data || !data.data.length) {
				return message.reply(
					"🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n" +
					"━━━━━━━━━━━━━━━━━━━━━━\n" +
					"❌ Aucune vidéo trouvée.\n" +
					"━━━━━━━━━━━━━━━━━━━━━━"
				);
			}

			const videos = data.data.slice(0, 10);
			const video =
				videos[Math.floor(Math.random() * videos.length)];

			const videoUrl = video.video_url.replace(/^\[|\]$/g, "");

			const filePath = path.join(
				__dirname,
				`tiktok_${Date.now()}.mp4`
			);

			const writer = fs.createWriteStream(filePath);

			const response = await axios({
				url: videoUrl,
				method: "GET",
				responseType: "stream"
			});

			response.data.pipe(writer);

			writer.on("finish", async () => {
				try {
					const hashtags =
						video.title.match(/#[\w]+/g)?.join(" ") ||
						"Aucun";

					await message.reply({
						body:
							`🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n` +
							`━━━━━━━━━━━━━━━━━━━━━━\n` +
							`🎬 𝐓𝐈𝐊𝐓𝐎𝐊\n\n` +
							`📝 Titre : ${video.title}\n` +
							`👤 Créateur : ${video.author}\n` +
							`🏷️ Hashtags : ${hashtags}\n\n` +
							`❤️ Likes : ${video.stats.likes}\n` +
							`💬 Commentaires : ${video.stats.comments}\n` +
							`🔁 Partages : ${video.stats.shares}\n` +
							`━━━━━━━━━━━━━━━━━━━━━━\n` +
							`🖇️ 𝐂𝐑𝐈𝐌𝐒𝐎𝐍 🩵🪽`,
						attachment: fs.createReadStream(filePath)
					});

					if (fs.existsSync(filePath))
						fs.unlinkSync(filePath);
				}
				catch (error) {
					console.error("TikTok send error:", error);

					if (fs.existsSync(filePath))
						fs.unlinkSync(filePath);

					await message.reply(
						"❌ Impossible d'envoyer la vidéo."
					);
				}
			});

			writer.on("error", async error => {
				console.error("TikTok download error:", error);

				if (fs.existsSync(filePath))
					fs.unlinkSync(filePath);

				await message.reply(
					"❌ Erreur pendant le téléchargement de la vidéo."
				);
			});

		}
		catch (err) {
			console.error("TikTok error:", err);

			return message.reply(
				"🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n" +
				"━━━━━━━━━━━━━━━━━━━━━━\n" +
				"❌ Une erreur est survenue pendant la recherche TikTok.\n" +
				"━━━━━━━━━━━━━━━━━━━━━━"
			);
		}
	}
};