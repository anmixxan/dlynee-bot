export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { telegram_id, first_name, last_name, username } = req.body || {};

    if (!telegram_id) {
      return res.status(400).json({ error: 'telegram_id is required' });
    }

    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: process.env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        telegram_id,
        first_name,
        last_name,
        username,
      }),
    });

    const text = await response.text();

    if (!response.ok) {
      console.error('Supabase error:', text);
      return res.status(500).json({ error: 'Failed to save user', details: text });
    }

    return res.status(200).json({
      ok: true,
      result: text ? JSON.parse(text) : [],
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
