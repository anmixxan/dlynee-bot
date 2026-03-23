import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function parseInitData(initData) {
  const params = new URLSearchParams(initData);
  const data = {};

  for (const [key, value] of params.entries()) {
    data[key] = value;
  }

  return data;
}

function validateTelegramInitData(initData, botToken) {
  if (!initData) {
    return { ok: false, error: 'Missing initData' };
  }

  const params = new URLSearchParams(initData);
  const hash = params.get('hash');

  if (!hash) {
    return { ok: false, error: 'Missing hash' };
  }

  params.delete('hash');

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();

  const computedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  if (computedHash !== hash) {
    return { ok: false, error: 'Invalid hash' };
  }

  const authDate = Number(params.get('auth_date'));
  const now = Math.floor(Date.now() / 1000);

  if (!authDate || now - authDate > 60 * 60 * 24) {
    return { ok: false, error: 'Auth data is too old' };
  }

  return { ok: true };
}

function signSession(payload) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');

  const signature = crypto
    .createHmac('sha256', process.env.SESSION_SECRET)
    .update(encoded)
    .digest('hex');

  return `${encoded}.${signature}`;
}

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
    const { initData } = req.body || {};

    const validation = validateTelegramInitData(initData, process.env.BOT_TOKEN);

    if (!validation.ok) {
      return res.status(401).json({ error: validation.error });
    }

    const parsed = parseInitData(initData);
    const userRaw = parsed.user;

    if (!userRaw) {
      return res.status(400).json({ error: 'Missing Telegram user' });
    }

    const user = JSON.parse(userRaw);

    const { data, error } = await supabase
      .from('users')
      .upsert(
        {
          telegram_id: user.id,
          first_name: user.first_name || null,
          last_name: user.last_name || null,
          username: user.username || null
        },
        { onConflict: 'telegram_id' }
      )
      .select()
      .single();

    if (error) {
      console.error('Supabase upsert error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    const sessionToken = signSession({
      telegram_id: user.id,
      db_id: data.id
    });

    res.setHeader(
      'Set-Cookie',
      serializeCookie('dlynee_session', sessionToken, 60 * 60 * 24 * 30)
    );

    return res.status(200).json({
      ok: true,
      user: {
        id: data.id,
        telegram_id: user.id,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        username: user.username || ''
      }
    });
  } catch (error) {
    console.error('telegram-login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
