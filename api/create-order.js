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
    const {
      user,
      customer,
      items,
      totals
    } = req.body || {};

    const telegramId = user?.telegram_id || user?.id || null;
    const name = customer?.name?.trim() || '';
    const phone = customer?.phone?.trim() || '';
    const address = customer?.address?.trim() || '';
    const comment = customer?.comment?.trim() || '';

    if (!telegramId) {
      return res.status(400).json({ error: 'Missing telegram_id' });
    }

    if (!name || !phone || !address) {
      return res.status(400).json({ error: 'Missing customer fields' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const total = Number(totals?.total || 0);

    const { data, error } = await supabase
      .from('orders')
      .insert({
        telegram_id: telegramId,
        name,
        phone,
        address,
        comment,
        items,
        total,
        status: 'new'
      })
      .select()
      .single();

    if (error) {
      console.error('create-order error:', error);
      return res.status(500).json({ error: error.message || 'Database error' });
    }

    return res.status(200).json({
      ok: true,
      order: data
    });
  } catch (error) {
    console.error('create-order crash:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
