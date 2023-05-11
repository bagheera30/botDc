require("dotenv").config();
const axios = require("axios");
const { Client, IntentsBitField } = require("discord.js");
const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.on("ready", (c) => {
  console.log(`${c.user.tag} is online`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) {
    return;
  }
  if (message.content == "/ping") {
    message.reply("hai");
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
    message.reply(`Kata sandi baru: ${password}`);
  }
  if (message.content === "/news") {
    const API_KEY = process.env.NEWS_API_KEY; // Ganti YOUR_API_KEY dengan kunci API NewsAPI Anda yang valid

    try {
      // Mengirim permintaan ke API berita
      const response = await axios.get(
        `https://newsapi.org/v2/top-headlines?country=id&apiKey=${API_KEY}`
      );

      // Mengambil data berita dari response
      const newsData = response.data;

      // Memeriksa apakah ada berita
      if (newsData.articles && newsData.articles.length > 0) {
        const articles = newsData.articles.slice(0, 10);

        // Mengirim balasan ke pengguna dengan daftar judul berita
        let reply = "Berikut adalah berita terbaru dari Indonesia:\n";
        for (let i = 0; i < articles.length; i++) {
          reply += `\n${i + 1}. ${articles[i].title}\n`;
        }
        message.reply(reply);
      } else {
        // Jika tidak ada berita, mengirim pesan bahwa tidak ada berita yang ditemukan
        message.reply("Tidak ada berita terbaru yang ditemukan.");
      }
    } catch (error) {
      // Menangani kesalahan jika terjadi kesalahan dalam mengambil berita
      console.error("Error:", error);
      message.reply(
        "Terjadi kesalahan dalam mengambil berita terbaru. Mohon coba lagi nanti."
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
