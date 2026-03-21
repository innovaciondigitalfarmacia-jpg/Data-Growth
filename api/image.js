export default async function handler(req, res) {
  const { prompt } = req.query;
  if (!prompt) return res.status(400).json({ error: 'No prompt' });
  try {
    const url = "https://image.pollinations.ai/prompt/" + encodeURIComponent(prompt.substring(0, 80)) + "?width=768&height=768&nologo=true&model=flux&seed=42";
    const r = await fetch(url);
    if (!r.ok) throw new Error('Failed');
    const buf = Buffer.from(await r.arrayBuffer());
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(buf);
  } catch {
    return res.redirect('https://placehold.co/768x768/1a1a2e/37c2eb?text=Generando...');
  }
}
