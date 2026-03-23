import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function parseCookies(cookieHeader = '') {
  return Object.fromEntries(
    cookieHeader
      .split(';')
      .map(part => part.trim())
      .filter(Boolean)
      .map(part => {
        const index = part.indexOf('=');
        const key = part.slice(0, index);
        const value = part.slice(index + 1);
        return [key, value];
      })
  );
}

function verifySession(token) {
  if (!token || !token.includes('.')) return null;

  const [encoded, signature] = token.split('.');

  const expected = crypto
    .createHmac('sha256', process.env.SESSION_SECRET)
    .update(encoded)
    .digest('hex');

  if (expected !== signature) return null;

  try {
    return JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  try {
    const cookies = parseCookies(req.headers.cookie || '');
    const session = verifySession(cookies.dlynee_session);

    if (!session?.telegram_id) {
      return res.status(401).json({ user: null });
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', session.telegram_id)
      .single();

    if (error || !data) {
      return res.status(401).json({ user: null });
    }

    return res.status(200).json({
      user: {
        id: data.id,
        telegram_id: data.telegram_id,
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        username: data.username || ''
      }
    });
  } catch (error) {
    console.error('me error:', error);
    return res.status(500).json({ user: null });
  }
}
