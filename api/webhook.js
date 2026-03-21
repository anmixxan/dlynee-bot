import TelegramBot from 'node-telegram-bot-api';

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    bot.processUpdate(req.body);
    return res.status(200).send('ok');
  }
  return res.status(200).send('bot is alive');
}
