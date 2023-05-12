require("dotenv").config();
const axios = require("axios");
const { Client, IntentsBitField, MessageEmbed } = require("discord.js");

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.on("ready", () => {
  console.log(`${client.user.tag} is online`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) {
    return;
  }

  if (message.content === "/ping") {
    const user = message.author;

    const embed = {
      color: 0x0099ff,
      title: "INFORMASI DARI:",
      description: `Username: ${user.username}\nTag: ${user.tag}\nUser ID: ${user.id}`,
      thumbnail: { url: user.displayAvatarURL() },
    };

    message.reply({ embeds: [embed] });
  }
  if (message.content.startsWith("/password")) {
    const args = message.content.split(" ");
    const length = parseInt(args[1]);

    if (isNaN(length) || length <= 0) {
      message.reply("Mohon masukkan panjang yang valid!");
      return;
    }

    if (length > 200) {
      message.reply(
        "Panjang kata sandi melebihi batas maksimum (200 karakter)!"
      );
      return;
    }

    const password = generatePassword(length);
    message.author.send(`Kata sandi baru: ${password}`);
    message.reply("Kata sandi baru telah dikirim melalui pesan pribadi (DM).");
  }

  if (message.content === "/news") {
    const API_KEY = process.env.NEWS_API_KEY; // Ganti YOUR_API_KEY dengan kunci API NewsAPI Anda yang valid

    try {
      const response = await axios.get(
        `https://newsapi.org/v2/top-headlines?country=id&apiKey=${API_KEY}`
      );
      const newsData = response.data;

      if (newsData.articles && newsData.articles.length > 0) {
        const articles = newsData.articles.slice(0, 10);
        let reply = "Berikut adalah berita terbaru dari Indonesia:\n";

        for (let i = 0; i < articles.length; i++) {
          reply += `\n${i + 1}. ${articles[i].title}\n`;
        }

        message.reply(reply);
      } else {
        message.reply("Tidak ada berita terbaru yang ditemukan.");
      }
    } catch (error) {
      console.error("Error:", error);
      message.reply(
        "Terjadi kesalahan dalam mengambil berita terbaru. Mohon coba lagi nanti."
      );
    }
  }
  if (message.content.startsWith("/clear")) {
    const args = message.content.split(" ");
    const time = parseInt(args[1]);

    if (isNaN(time) || time <= 0) {
      message.reply("Mohon masukkan jangka waktu yang valid dalam menit!");
      return;
    }

    const channel = message.channel;

    try {
      const fetchedMessages = await channel.messages.fetch({ limit: 100 });
      const filteredMessages = fetchedMessages.filter(
        (msg) => !msg.pinned && Date.now() - msg.createdTimestamp < time * 60000
      );

      if (filteredMessages.size === 0) {
        message.reply("Tidak ada pesan yang memenuhi kriteria untuk dihapus.");
        return;
      }

      await channel.bulkDelete(filteredMessages, true);
      message.reply(
        `Pesan dalam saluran ini yang lebih baru dari ${time} menit telah dihapus.`
      );
    } catch (error) {
      console.error("Error:", error);
      message.reply(
        "Terjadi kesalahan dalam menghapus pesan. Mohon coba lagi nanti."
      );
    }
  }
});

function generatePassword(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";
  const maxLength = Math.min(length, 200);

  for (let i = 0; i < maxLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    password += characters.charAt(randomIndex);
  }

  return password;
}

client.login(process.env.BOT_TOKEN);
