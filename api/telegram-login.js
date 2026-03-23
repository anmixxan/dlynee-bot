import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function serializeCookie(name, value, maxAgeSeconds) {
  return [
    `${name}=${value}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    `Max-Age=${maxAgeSeconds}`
  ].join('; ');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body || {};

    const telegramId = body.id;
    const firstName = body.first_name || null;
    const lastName = body.last_name || null;
    const username = body.username || null;

    if (!telegramId) {
      return res.status(400).json({ error: 'Missing Telegram user id' });
    }

    const { data, error } = await supabase
      .from('users')
      .upsert(
        {
          telegram_id: telegramId,
          first_name: firstName,
          last_name: lastName,
          username: username
        },
        { onConflict: 'telegram_id' }
      )
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: error.message || 'Database error' });
    }

    const sessionPayload = Buffer.from(
      JSON.stringify({
        telegram_id: telegramId,
        id: data.id
      })
    ).toString('base64url');

    res.setHeader(
      'Set-Cookie',
      serializeCookie('dlynee_session', sessionPayload, 60 * 60 * 24 * 30)
    );

    return res.status(200).json({
      ok: true,
      user: {
        id: data.id,
        telegram_id: telegramId,
        first_name: firstName || '',
        last_name: lastName || '',
        username: username || ''
      }
    });
  } catch (error) {
    console.error('telegram-login crash:', error);
    return res.status(500).json({
      error: error?.message || 'Internal server error'
    });
  }
}
