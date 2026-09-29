const fs = require("fs-extra");
const path = require("path");
const payConfigPath = path.join(__dirname, "../../payConfig.json");

// À l'intérieur de la fonction qui gère l'action / commande :
if (fs.existsSync(payConfigPath)) {
  try {
    const payConfig = fs.readJsonSync(payConfigPath);
    const defaultFree = ["help", "bal", "daily", "work", "pay", "setpay", "register"];
    const whitelist = payConfig.whitelist || defaultFree;

    if (payConfig.enabled && !whitelist.includes(command.config.name)) {
      const userMoney = await usersData.get(senderID, "money") || 0;

      if (userMoney < payConfig.cost) {
        return message.reply(
          `⚠️ 𝐒𝐎𝐋𝐃𝐄 𝐈𝐍𝐒𝐔𝐅𝐅𝐈𝐒𝐀𝐍𝐓 !\n\n` +
          `L'action "${command.config.name}" coûte $${payConfig.cost}.\n` +
          `Ton solde actuel : $${userMoney}.\n\n` +
          `💡 Utilise le daily ou le work pour gagner de l'argent.`
        );
      }

      await usersData.set(senderID, userMoney - payConfig.cost, "money");
    }
  } catch (err) {
    console.error("[PayToUse Error]:", err);
  }
}
