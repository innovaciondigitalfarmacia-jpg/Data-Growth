export default async function handler(req, res) {
  const { prompt } = req.query;
  if (!prompt) return res.status(400).json({ error: 'No prompt' });
  
  try {
    const url = "https://image.pollinations.ai/prompt/" + encodeURIComponent(prompt) + "?width=768&height=768&nologo=true&model=flux";
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    
    const r = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    
    if (!r.ok) throw new Error('Pollinations failed');
    
    const contentType = r.headers.get('content-type');
    if (!contentType || !contentType.includes('image')) throw new Error('Not an image');
    
    const buf = Buffer.from(await r.arrayBuffer());
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(buf);
  } catch (e) {
    // Fallback to picsum (beautiful stock photos)
    const seed = Math.abs(prompt.split('').reduce((a, c) => a + c.charCodeAt(0), 0));
    return res.redirect(302, 'https://picsum.photos/seed/' + seed + '/768/768');
  }
}
