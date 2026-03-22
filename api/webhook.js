const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token);

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text || '';

  if (text === '/start') {
    await bot.sendMessage(chatId, 'Привет! Бот работает 🚀');
    return;
  }

  await bot.sendMessage(chatId, `Ты написал: ${text}`);
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      await bot.processUpdate(req.body);
      return res.status(200).send('ok');
    } catch (error) {
      console.error('Webhook error:', error);
      return res.status(500).send('error');
    }
  }

  return res.status(200).send('bot is alive');
}
