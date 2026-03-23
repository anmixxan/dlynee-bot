import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id, first_name, last_name, username, photo_url } = req.body || {};

    if (!id) {
      return res.status(400).json({ error: 'No Telegram user id' });
    }

    const user = {
      telegram_id: String(id),
      first_name: first_name || '',
      last_name: last_name || '',
      username: username || '',
      photo_url: photo_url || ''
    };

    const { data, error } = await supabase
      .from('users')
      .upsert(user, { onConflict: 'telegram_id' })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({
      ok: true,
      user: data
    });
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
}
