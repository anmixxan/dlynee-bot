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
        return [part.slice(0, index), part.slice(index + 1)];
      })
  );
}

export default async function handler(req, res) {
  try {
    const cookies = parseCookies(req.headers.cookie || '');
    const token = cookies.dlynee_session;

    if (!token) {
      return res.status(401).json({ user: null });
    }

    let session = null;

    try {
      session = JSON.parse(Buffer.from(token, 'base64url').toString('utf8'));
    } catch {
      return res.status(401).json({ user: null });
    }

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
