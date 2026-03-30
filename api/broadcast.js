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
      text
    })
  });

  return response.json();
}

export default async function handler(req, res) {
  try {
    const posts = [
      '🌸 Новая подборка букетов уже в боте',
      '💐 Загляни в каталог — там красивые букеты',
      '🌷 Пора порадовать близких цветами',
      '🌹 У нас есть нежные и винные букеты — заходи посмотреть',
      '✨ Открой бот и выбери букет для особенного повода'
    ];

    const randomPost = posts[Math.floor(Math.random() * posts.length)];

    const { data: users, error } = await supabase
      .from('users')
      .select('telegram_id')
      .not('telegram_id', 'is', null);

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ ok: false, error: 'Ошибка Supabase' });
    }

    if (!users || users.length === 0) {
      return res.status(200).json({ ok: true, message: 'Нет пользователей для рассылки' });
    }

    let success = 0;
    let failed = 0;

    for (const user of users) {
      try {
        const chatId = user.telegram_id;
        const result = await sendTelegramMessage(chatId, randomPost);

        if (result.ok) {
          success++;
        } else {
          failed++;
          console.log('Telegram send error:', chatId, result);
        }
      } catch (err) {
        failed++;
        console.error('Send failed:', user.telegram_id, err);
      }
    }

    return res.status(200).json({
      ok: true,
      total: users.length,
      success,
      failed
    });
  } catch (error) {
    console.error('Broadcast error:', error);
    return res.status(500).json({
      ok: false,
      error: 'Ошибка рассылки'
    });
  }
}
