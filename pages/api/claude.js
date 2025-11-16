export default async function handler(req, res) {
  // Support GET to let the frontend check whether the server-side API key is configured.
  if (req.method === 'GET') {
    const configured = !!process.env.INNOVAI_API_KEY;
    return res.status(200).json({ configured });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: { message: 'Method Not Allowed' } });
  }

  const apiKey = process.env.INNOVAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: { message: 'Server: INNOVAI_API_KEY is not configured' } });
  }

  try {
    const body = req.body; // already-parsed body from Next.js

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(body),
    });

    const data = await resp.json().catch(() => ({}));
    const statusCode = resp.ok ? 200 : 500;
    return res.status(statusCode).json(data);
  } catch (err) {
    console.error('Server /api/claude error:', err);
    return res.status(500).json({ error: { message: err.message || 'Internal server error' } });
  }
}
