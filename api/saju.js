module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { pillars, counts, dominant } = req.body || {};
  if (!pillars || !counts || !dominant) {
    res.status(400).json({ error: 'Missing saju data' });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Server is missing OPENAI_API_KEY' });
    return;
  }

  const prompt = `당신은 사주(四柱) 풀이를 해주는 친근한 챗봇입니다. 아래 사주 정보를 바탕으로 2~3문장의 짧고 다정한 해석을 한국어로 작성하세요.
이건 재미로 보는 콘텐츠이니 과도하게 단정적인 표현은 피하고, 긍정적이고 가벼운 톤을 유지하세요.

년주: ${pillars.year}
월주: ${pillars.month}
일주: ${pillars.day}
시주: ${pillars.time || '정보 없음'}
오행 분포 — 목:${counts.목} 화:${counts.화} 토:${counts.토} 금:${counts.금} 수:${counts.수}
가장 강한 기운: ${dominant}`;

  try {
    const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-5.4-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,
        temperature: 0.8,
      }),
    });

    if (!upstream.ok) {
      const detail = await upstream.text();
      res.status(502).json({ error: 'Upstream request failed', detail });
      return;
    }

    const data = await upstream.json();
    const text = data.choices?.[0]?.message?.content?.trim() || '';
    res.status(200).json({ text });
  } catch (err) {
    res.status(500).json({ error: 'Request failed', detail: String(err) });
  }
};
