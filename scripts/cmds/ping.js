module.exports = {
	config: {
		name: "ping",
		aliases: ["p"],
		version: "1.4",
		author: "CRIMSON 🖇️🩵🪽",
		countDown: 3,
		role: 0,
		description: {
			fr: "⚡ Voir la vitesse du bot",
			en: "⚡ Check bot speed"
		},
		category: "system",
		guide: {
			fr: "{pn}",
			en: "{pn}"
		}
	},

	onStart: async function ({ message }) {
		const start = Date.now();

		const msg = await message.reply("🏓 𝐏𝐨𝐧𝐠...");

		const ping = Date.now() - start;

		return message.reply(
			`🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨
━━━━━━━━━━━━━━━━━━━━━━
⚡ 𝐏𝐢𝐧𝐠 : ${ping}ms
🟢 𝐒𝐭𝐚𝐭𝐮𝐭 : Online
🤖 𝐁𝐨𝐭 : Actif
━━━━━━━━━━━━━━━━━━━━━━
🖇️ 𝐂𝐑𝐈𝐌𝐒𝐎𝐍 🩵🪽`
		);
	}
};