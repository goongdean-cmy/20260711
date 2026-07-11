module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    res.status(500).json({ error: 'Server is missing Supabase configuration' });
    return;
  }

  const {
    birthDate, birthTime, gender,
    pillars, counts, dominant,
    interpretation, main, bonus,
  } = req.body || {};

  if (!birthDate || !pillars || !Array.isArray(main) || bonus === undefined) {
    res.status(400).json({ error: 'Missing saju record data' });
    return;
  }

  try {
    const upstream = await fetch(`${supabaseUrl}/rest/v1/saju_draws`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify([{
        birth_date: birthDate,
        birth_time: birthTime || null,
        gender: gender || null,
        year_pillar: pillars.year,
        month_pillar: pillars.month,
        day_pillar: pillars.day,
        time_pillar: pillars.time || null,
        elements: counts,
        dominant_element: dominant,
        interpretation: interpretation || null,
        main_numbers: main,
        bonus_number: bonus,
      }]),
    });

    if (!upstream.ok) {
      const detail = await upstream.text();
      res.status(502).json({ error: 'Upstream request failed', detail });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Request failed', detail: String(err) });
  }
};
