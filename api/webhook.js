const token = process.env.BOT_TOKEN;

async function sendMessage(chatId, text, extra = {}) {
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      ...extra,
    }),
  });

  const data = await response.json();
  console.log('sendMessage:', data);

  if (!data.ok) {
    throw new Error(data.description || 'Telegram API error');
  }
}

export default async function handler(req, res) {
  try {
    console.log('method:', req.method);

    if (req.method !== 'POST') {
      return res.status(200).send('bot is alive');
    }

    const message = req.body?.message;
    const chatId = message?.chat?.id;
    const text = message?.text || '';

    console.log('incoming:', { chatId, text });

    if (!chatId) {
      return res.status(200).send('no message');
    }

    if (text === '/start') {
      await sendMessage(chatId, 'Открыть приложение 👇', {
        reply_markup: {
          inline_keyboard: [[
            {
              text: '🚀 Открыть Mini App',
              web_app: { url: 'https://dlynee-bot.vercel.app' },
            },
          ]],
        },
      });

      return res.status(200).send('ok');
    }

    await sendMessage(chatId, `Ты написал: ${text}`);
    return res.status(200).send('ok');
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).send('error');
  }
}
