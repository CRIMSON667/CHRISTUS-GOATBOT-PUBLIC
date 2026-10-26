const axios = require("axios");

function formatLayout(title, body) {
  return (
    `🎀 𝑴𝑨𝑹𝑰𝑵 𝑲𝑰𝑻𝑨𝑮𝑨𝑾𝑨\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `✨ [ ${title} ]\n\n` +
    body
  );
}

// Fonction pour traduire les descriptions météo basiques
function translateWeather(desc) {
  const map = {
    "Clear": "Dégagé ☀️",
    "Sunny": "Ensoleillé ☀️",
    "Partly cloudy": "Partiellement nuageux ⛅",
    "Cloudy": "Nuageux ☁️",
    "Overcast": "Ciel couvert ☁️",
    "Mist": "Brume 🌫️",
    "Patchy rain possible": "Risque de pluie 🌦️",
    "Light rain": "Pluie légère 🌧️",
    "Moderate rain": "Pluie modérée 🌧️",
    "Heavy rain": "Forte pluie 🌧️",
    "Thunderstorm": "Orage ⚡"
  };
  return map[desc] || desc;
}

module.exports = {
  config: {
    name: "meteo",
    version: "3.8",
    author: "CRIMSON 🩵🪽 (Marin Mode)",
    countDown: 5,
    role: 0,
    description: "Donne la vraie météo en temps réel et l'heure locale exacte de la ville",
    category: "utilitaire",
    aliases: ["weather", "temps"],
    guide: {
      fr: "   {pn} <ville> : affiche la vraie météo et l'heure locale (ex: {pn} kinshasa, {pn} paris)"
    }
  },

  onStart: async function ({ message, args, usersData, event }) {
    const city = args.join(" ").trim();
    const userName = await usersData.getName(event.senderID);

    if (!city) {
      return message.reply(
        formatLayout("MÉTÉO RÉELLE ☀️", `Coucou ${userName} ! Tu dois préciser une ville pour que je consulte les satellites.\n\n💡 Exemple : \`meteo kinshasa\``)
      );
    }

    try {
      const url = `https://wttr.in/${encodeURIComponent(city)}?format=j1`;
      const response = await axios.get(url, { timeout: 15000 });
      const data = response.data;

      const current = data.current_condition[0];
      const area = data.nearest_area[0];

      const cityName = area.areaName ? area.areaName[0].value : city;
      const country = area.country ? area.country[0].value : "";
      const tempC = current.temp_C;
      const feelsLikeC = current.FeelsLikeC;
      const humidity = current.humidity;
      const windSpeed = current.windspeedKmph;
      const rawDesc = current.weatherDesc[0].value;
      const weatherDesc = translateWeather(rawDesc);

      // Récupération propre de l'heure locale via le fuseau horaire système / UTC de wttr.in si possible,
      // sinon calcul basé sur l'heure UTC actuelle et le décalage de la ville
      let localTimeStr = "";
      let localHour = 12;

      // Tentative 1 : Utiliser le champ de wttr.in s'il est présent
      if (current.localObsDateTime) {
        const timePart = current.localObsDateTime.split(" ")[1]; // ex: "04:15"
        if (timePart) {
          localTimeStr = timePart;
          localHour = parseInt(timePart.split(":")[0], 10);
        }
      }

      // Tentative 2 : Si wttr.in n'a pas renvoyé l'heure, on utilise l'API de fuseau horaire JavaScript avec la zone géographique
      if (!localTimeStr) {
        try {
          // On passe par un objet Date UTC converti selon la ville (Kinshasa = WAT, Paris = CET, etc.)
          // wttr.in renvoie parfois les coordonnées (latitude/longitude) ou le nom de la zone, 
          // mais le plus simple et robuste pour l'heure exacte est d'utiliser les timezones mondiales courantes ou Intl :
          const options = { timeZone: getSafeTimeZone(cityName), hour: '2-digit', minute: '2-digit', hour12: false };
          localTimeStr = new Intl.DateTimeFormat('fr-FR', options).format(new Date());
          localHour = parseInt(localTimeStr.split(":")[0], 10);
        } catch (e) {
          // Fallback ultime si le fuseau échoue
          const now = new Date();
          localHour = now.getUTCHours(); // UTC par défaut
          localTimeStr = `${String(localHour).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}`;
        }
      }

      // Adaptation du commentaire de Marin selon l'heure exacte
      let marinComment = "";
      const tempNum = parseInt(tempC, 10);

      if (localHour >= 23 || localHour < 6) {
        marinComment = `Il est ${localTimeStr} là-bas ! Pourquoi tu ne dors pas encore ? Va au lit, les projets et les cosplays t'attendent demain ! 🛌✨`;
      } else if (localHour >= 6 && localHour < 10) {
        marinComment = `C'est le matin (${localTimeStr}) ! Prends un bon café et commence bien ta journée ! ☕🌸`;
      } else if (tempNum < 15) {
        marinComment = `Brrr, il fait assez frais (${tempC}°C) à ${localTimeStr} ! N'oublie pas de bien te couvrir si tu sors. 🧥`;
      } else if (tempNum > 30) {
        marinComment = `Il fait déjà chaud (${tempC}°C) à ${localTimeStr} ! Hydrate-toi bien et reste à l'ombre ! 🥵☀️`;
      } else {
        marinComment = `Il est ${localTimeStr} et la température est de ${tempC}°C, c'est super agréable ! ✨`;
      }

      const bodyText = 
        `🌍 Ville : ${cityName} (${country})\n` +
        `⏰ Heure locale : ${localTimeStr}\n` +
        `👤 Demandé par : ${userName}\n\n` +
        `🌡️ Température : ${tempC}°C (Ressenti ${feelsLikeC}°C)\n` +
        `☁️ Temps : ${weatherDesc}\n` +
        `💧 Humidité : ${humidity}%\n` +
        `💨 Vent : ${windSpeed} km/h\n\n` +
        `💬 *Mot de Marin* : "${marinComment}"\n\n` +
        `✨ Données réelles en direct`;

      return message.reply(formatLayout(`MÉTÉO : ${cityName.toUpperCase()} ⛅`, bodyText));

    } catch (error) {
      console.error("Erreur meteo heure:", error.message);

      return message.reply(
        formatLayout("MÉTÉO INTROUVABLE ❌", `Impossible de récupérer la météo pour "${city}". Vérifie l'orthographe du nom de la ville !`)
      );
    }
  }
};

// Petite table de correspondance pour assurer les fuseaux horaires principaux
function getSafeTimeZone(city) {
  const c = city.toLowerCase().trim();
  if (c.includes("kinshasa") || c.includes("congo")) return "Africa/Kinshasa";
  if (c.includes("paris") || c.includes("france")) return "Europe/Paris";
  if (c.includes("tokyo")) return "Asia/Tokyo";
  if (c.includes("londres") || c.includes("london")) return "Europe/London";
  if (c.includes("new york")) return "America/New_York";
  if (c.includes("abidjan")) return "Africa/Abidjan";
  if (c.includes("dakar")) return "Africa/Dakar";
  return "UTC";
}
