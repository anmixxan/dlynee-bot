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
      text,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '💐 Выбрать букет',
              web_app: {
                url: 'https://dlynee-bot.vercel.app'
              }
            }
          ]
        ]
      }
    })
  });

  return await response.json();
}

export default async function handler(req, res) {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('telegram_id')
      .not('telegram_id', 'is', null);

    if (error) {
      return res.status(500).json({
        ok: false,
        error: error.message
      });
    }

    if (!users || users.length === 0) {
      return res.status(200).json({
        ok: true,
        message: 'Нет пользователей для рассылки'
      });
    }

    const posts = [
      `💌 Когда слова излишни — говорят цветы.

ДляНеё создаёт букеты, которые передают чувства без лишних слов.

Порадуй ту, кто вдохновляет. Просто выбери — а мы доставим с любовью.`,

      `🌸 Иногда один букет говорит больше, чем длинные признания.

В ДляНеё собраны композиции для самых важных чувств и красивых моментов.

Выбери букет для особенного человека — остальное мы берём на себя.`,

      `💐 Нежность, внимание и красота — в одном букете.

ДляНеё помогает сказать самое важное мягко, красиво и без лишних слов.

Открой каталог и выбери идеальный букет.`,

      `✨ Есть чувства, которые хочется выразить особенно красиво.

ДляНеё создаёт букеты для любви, благодарности и тёплых жестов.

Порадуй любимую, маму, подругу или того, кто тебе дорог.`,

      `🌷 Красивый жест начинается с правильных цветов.

В ДляНеё ты найдёшь букеты для любви, заботы и вдохновения.

Выбирай композицию, а мы доставим её с теплом.`,

      `💌 Для особенных людей нужны особенные букеты.

ДляНеё помогает говорить о чувствах красиво, тонко и с душой.

Загляни в каталог и найди свой вариант.`,

      `🌹 Один букет может изменить целый день.

С ДляНеё легко подарить радость, внимание и немного волшебства.

Выбери композицию для того, кто тебе дорог.`,

      `💐 Цветы умеют говорить о любви, заботе и благодарности лучше любых слов.

ДляНеё собрала букеты для самых тёплых и важных моментов.

Пора выбрать тот самый.`,

      `🌸 Иногда лучший подарок — это эмоции.

ДляНеё создаёт букеты, которые удивляют, радуют и вдохновляют.

Открой mini app и выбери красивую композицию.`,

      `✨ Когда хочется сделать приятно — начни с цветов.

ДляНеё поможет выбрать букет для искреннего, нежного и красивого жеста.

Порадуй того, кто важен для тебя.`,

      `🌷 Букет — это маленькая история о чувствах.

С ДляНеё каждая композиция становится особенным знаком внимания.

Выбери цветы для того, кому хочешь подарить улыбку.`,

      `💌 Не жди особого повода, чтобы порадовать близкого человека.

С ДляНеё красивый букет всегда рядом.

Открой каталог и выбери настроение в цветах.`
    ];

    const text = posts[Math.floor(Math.random() * posts.length)];

    let success = 0;
    let failed = 0;

    for (const user of users) {
      try {
        const result = await sendTelegramMessage(user.telegram_id, text);

        if (result.ok) {
          success++;
        } else {
          failed++;
          console.log('Telegram error:', result);
        }
      } catch (e) {
        failed++;
        console.error('Send error:', e);
      }
    }

    return res.status(200).json({
      ok: true,
      total: users.length,
      success,
      failed
    });
  } catch (e) {
    return res.status(500).json({
      ok: false,
      error: String(e.message || e)
    });
  }
}
