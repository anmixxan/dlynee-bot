import { createClient } from '@supabase/supabase-js';

const BOT_TOKEN = process.env.BOT_TOKEN;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function sendTelegramMessage(chatId, text) {
  const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: text
    })
  });

  return await response.json();
}

export default async function handler(req, res) {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('telegram_id')
      .not('telegram_id', 'is', null)
      .limit(1);

    if (error) {
      return res.status(500).json({
        step: 'supabase_select',
        ok: false,
        error: error.message
      });
    }

    if (!users || users.length === 0) {
      return res.status(200).json({
        step: 'no_users',
        ok: false,
        error: 'В таблице users нет пользователей'
      });
    }

    const chatId = users[0].telegram_id;

    const telegramResult = await sendTelegramMessage(
      chatId,
      'Тест рассылки 🌸 Если ты видишь это сообщение — всё работает'
    );

    return res.status(200).json({
      step: 'telegram_send',
      ok: true,
      chatId: chatId,
      telegramResult: telegramResult
    });
  } catch (error) {
    return res.status(500).json({
      step: 'catch',
      ok: false,
      error: String(error.message || error)
    });
  }
}
