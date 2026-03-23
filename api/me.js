export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = {
    id: req.headers['x-telegram-user-id'] || null
  };

  return res.status(200).json({
    ok: true,
    user
  });
}

