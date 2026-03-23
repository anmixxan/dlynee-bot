import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const user = req.body;

  if (!user.id) {
    return res.status(400).json({ error: 'no user' });
  }

  await supabase.from('profiles').upsert({
    telegram_id: user.id,
    first_name: user.first_name,
    username: user.username || null
  });

  res.status(200).json({ ok: true });
}
