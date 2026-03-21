export default async function handler(req, res) {
  const { prompt } = req.query;
  if (!prompt) return res.status(400).json({ error: 'No prompt' });

  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_KEY) return res.redirect(302, 'https://picsum.photos/seed/' + Math.abs(prompt.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) + '/768/768');

  const models = [
    'gemini-2.0-flash-exp-image-generation',
    'gemini-2.0-flash-preview-image-generation',
    'gemini-2.5-flash-preview-image-generation'
  ];

  for (const model of models) {
    try {
      const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + GEMINI_KEY;
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Generate a professional image: ' + prompt + '. Modern vibrant illustrated digital art style, eye-catching, beautiful, NO text or words in the image.' }] }],
          generationConfig: { responseModalities: ['IMAGE', 'TEXT'] }
        })
      });

      if (!r.ok) continue;

      const data = await r.json();
      const parts = data.candidates?.[0]?.content?.parts || [];
      for (const p of parts) {
        if (p.inlineData) {
          const buf = Buffer.from(p.inlineData.data, 'base64');
          res.setHeader('Content-Type', p.inlineData.mimeType || 'image/png');
          res.setHeader('Cache-Control', 'public, max-age=86400');
          return res.send(buf);
        }
      }
    } catch (e) {
      continue;
    }
  }

  // Fallback to picsum
  const seed = Math.abs(prompt.split('').reduce((a, c) => a + c.charCodeAt(0), 0));
  return res.redirect(302, 'https://picsum.photos/seed/' + seed + '/768/768');
}
