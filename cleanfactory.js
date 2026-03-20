const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');
let start = c.indexOf('const Factory = ({ brands, gemKey }) => {');
let depth = 0, end = -1, begun = false;
for (let i = start; i < c.length; i++) {
  if (c[i] === '{') { depth++; begun = true; }
  if (c[i] === '}') { depth--; }
  if (begun && depth === 0) { end = i + 1; break; }
}
let nf = `const Factory = ({ brands, gemKey }) => {
  const t = useT();
  const [brand, setBrand] = useState(brands[0]);
  const [ct, setCt] = useState(CTYPES[0]);
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState(null);
  const [txt, setTxt] = useState("");
  const [loading, setLoading] = useState(false);
  const go = async () => {
    if (!topic.trim() || !brand) return; setLoading(true); setResult(null); setTxt("");
    const sys = "Eres DIRECTOR CREATIVO SENIOR agencia digital Bogota. MARCA: " + brand.name + " | " + brand.industry + " | TONO: " + (brand.tone||"Profesional") + " | AUDIENCIA: " + (brand.audience||"General") + " | VOZ: " + (brand.brandVoice||"Profesional") + ". REGLAS: 1)Gancho irresistible 2)3-5 emojis estrategicos 3)Gancho-Valor-CTA 4)8 hashtags 5)Espanol colombiano tu 6)Valor antes de vender. SOLO JSON valido sin markdown ni backticks.";
    const fmt = ct.fmt;
    let msg;
    if (fmt === "visual") msg = 'Post visual sobre: "' + topic + '". Responde SOLO JSON: {"headline":"max 8 palabras","subtext":"subtitulo","caption":"3-5 lineas con emojis, gancho+valor+CTA","hashtags":"8 hashtags","image_prompt":"english: professional commercial photo for this topic, high quality, no text overlay"}';
    else if (fmt === "carousel") msg = 'Carrusel 5 slides sobre: "' + topic + '". JSON: {"slides":[{"title":"..","body":"con emojis","emoji":".."}],"caption":"copy+CTA","hashtags":"8 hashtags"}';
    else if (fmt === "reel") msg = 'Storyboard reel 5 escenas sobre: "' + topic + '". JSON: {"scenes":[{"title":"..","duration":"3s","emoji":"..","visual":"indicaciones camara","text_overlay":"texto+emoji","audio":"musica trending","transition":"tipo"}],"caption":"caption+CTA","hashtags":"8 hashtags"}';
    else msg = ct.label + ' profesional sobre: "' + topic + '". Emojis estrategicos, Gancho-Valor-CTA. 8 hashtags.';
    try {
      const r = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 2500, system: sys, messages: [{ role: "user", content: msg }] }) });
      const d = await r.json();
      const raw = d.content?.map(c => c.text || "").join("") || "";
      if (fmt === "text") { setTxt(raw); setResult({ t: "text" }); }
      else {
        try {
          const pd = JSON.parse(raw.replace(/\\\`\\\`\\\`json|\\\`\\\`\\\`/g, "").trim());
          let imgUrl = null;
          if (pd.image_prompt) {
            imgUrl = "https://image.pollinations.ai/prompt/" + encodeURIComponent(pd.image_prompt) + "?width=1024&height=1024&nologo=true&seed=" + Date.now();
          }
          setResult({ t: fmt, d: pd, img: imgUrl });
        } catch { setTxt(raw); setResult({ t: "text" }); }
      }
    } catch { setTxt("Error de conexion."); setResult({ t: "text" }); }
    setLoading(false);
  };
  if (!brands.length) return <Section title="Crear Contenido"><Card style={{ textAlign: "center", padding: 48 }}><div style={{ fontSize: 48, marginBottom: 12 }}>\\u{1F3E2}</div><div style={{ fontSize: 16, fontWeight: 600, color: t.tx }}>Primero crea una marca</div></Card></Section>;
  return (
    <Section title="Crear Contenido" sub="Genera contenido profesional con IA." right={<Badge>Claude AI</Badge>}>
      <div style={{ marginBottom: 14 }}><Label>Marca</Label><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{brands.map(b => <button key={b.id} onClick={() => setBrand(b)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 10, border: brand?.id === b.id ? "2px solid " + b.color : "1px solid " + t.brd, background: brand?.id === b.id ? b.color + "12" : t.bgC, color: brand?.id === b.id ? t.tx : t.txS, fontSize: 12, fontWeight: 600, cursor: "pointer" }}><span>{b.emoji}</span>{b.short || b.name.slice(0, 3)}</button>)}</div></div>
      <div style={{ marginBottom: 14 }}><Label>Tipo</Label><div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>{CTYPES.map(c => <button key={c.id} onClick={() => setCt(c)} style={{ padding: "12px 10px", borderRadius: 12, border: ct.id === c.id ? "2px solid " + t.ac : "1px solid " + t.brd, background: ct.id === c.id ? t.acS : t.bgC, cursor: "pointer", textAlign: "center" }}><div style={{ fontSize: 22, marginBottom: 4 }}>{c.icon}</div><div style={{ fontSize: 12, fontWeight: 600, color: ct.id === c.id ? t.tx : t.txS }}>{c.label}</div></button>)}</div></div>
      <div style={{ display: "flex", gap: 10, marginBottom: 22 }}><Input value={topic} onChange={e => setTopic(e.target.value)} placeholder="Describe el contenido..." onKeyDown={e => e.key === "Enter" && go()} /><Btn onClick={go} disabled={loading || !topic.trim()} primary style={{ whiteSpace: "nowrap", padding: "14px 28px" }}>{loading ? <><Spin /> Creando...</> : <><Ic name="sparkle" size={16} /> Generar</>}</Btn></div>
      {loading && <Card style={{ padding: 48, textAlign: "center" }}><div style={{ width: 48, height: 48, border: "3px solid " + t.brd, borderTop: "3px solid " + (brand?.color || t.ac), borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto 16px" }} /><div style={{ color: t.tx, fontSize: 16, fontWeight: 600 }}>Generando para {brand?.name}...</div></Card>}
      {result && !loading && result.t === "text" && <Card><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}><span style={{ fontSize: 13, fontWeight: 600, color: t.txS }}>{brand?.emoji} {brand?.name}</span><CopyBtn text={txt} /></div><div style={{ fontSize: 14, color: t.tx, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{txt}</div></Card>}
      {result && !loading && result.t === "visual" && result.d && <Card>{result.img && <div style={{ marginBottom: 16, borderRadius: 14, overflow: "hidden", border: "1px solid " + t.brd }}><img src={result.img} alt="AI Generated" style={{ width: "100%", height: 400, objectFit: "cover", display: "block" }} /></div>}<div style={{ fontSize: 22, fontWeight: 800, color: t.tx, marginBottom: 6 }}>{result.d.headline}</div>{result.d.subtext && <div style={{ color: t.txS, marginBottom: 12 }}>{result.d.subtext}</div>}<div style={{ fontSize: 14, color: t.tx, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{result.d.caption}</div>{result.d.hashtags && <div style={{ fontSize: 12, color: brand?.color, marginTop: 10 }}>{result.d.hashtags}</div>}<div style={{ marginTop: 12, display: "flex", gap: 8 }}><CopyBtn text={(result.d.caption || "") + "\\n\\n" + (result.d.hashtags || "")} label="Copiar" />{result.img && <a href={result.img} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "rgba(55,194,235,.08)", border: "1px solid rgba(55,194,235,.2)", borderRadius: 10, color: "#37c2eb", fontSize: 12, fontWeight: 600, textDecoration: "none" }}><Ic name="download" size={14} /> Imagen</a>}</div></Card>}
      {result && !loading && result.t === "carousel" && result.d?.slides && <Card>{result.d.slides.map((sl, i) => <div key={i} style={{ padding: "12px 0", borderBottom: i < result.d.slides.length - 1 ? "1px solid " + t.brd : "none" }}><div style={{ fontSize: 14, fontWeight: 600, color: t.tx }}>{sl.emoji} Slide {i + 1}: {sl.title}</div><div style={{ fontSize: 13, color: t.txS, marginTop: 3 }}>{sl.body}</div></div>)}{result.d.caption && <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid " + t.brd, fontSize: 14, color: t.tx, whiteSpace: "pre-wrap" }}>{result.d.caption}</div>}<div style={{ marginTop: 12 }}><CopyBtn text={result.d.slides.map((s, i) => s.emoji + " Slide " + (i + 1) + ": " + s.title + "\\n" + s.body).join("\\n\\n") + "\\n\\n" + (result.d.caption || "") + "\\n" + (result.d.hashtags || "")} label="Copiar todo" /></div></Card>}
      {result && !loading && result.t === "reel" && result.d?.scenes && <Card>{result.d.scenes.map((sc, i) => <div key={i} style={{ padding: "14px 0", borderBottom: i < result.d.scenes.length - 1 ? "1px solid " + t.brd : "none" }}><div style={{ fontSize: 15, fontWeight: 700, color: t.tx, marginBottom: 4 }}>Escena {i + 1}: {sc.title} <span style={{ fontSize: 12, color: t.txM }}>({sc.duration})</span></div><div style={{ fontSize: 13, color: t.txS, marginBottom: 4 }}>📹 {sc.visual}</div><div style={{ fontSize: 14, fontWeight: 700, color: brand?.color }}>📝 {sc.text_overlay}</div>{sc.audio && <div style={{ fontSize: 12, color: t.txM, marginTop: 4 }}>🎵 {sc.audio}</div>}</div>)}{result.d.caption && <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid " + t.brd, fontSize: 14, color: t.tx, whiteSpace: "pre-wrap" }}>{result.d.caption}</div>}<div style={{ marginTop: 12 }}><CopyBtn text={result.d.scenes.map((s, i) => "Escena " + (i + 1) + " (" + s.duration + "): " + s.title + "\\n" + s.visual + "\\n" + s.text_overlay + "\\n" + (s.audio || "")).join("\\n\\n") + "\\n\\n" + (result.d.caption || "") + "\\n" + (result.d.hashtags || "")} label="Copiar storyboard" /></div></Card>}
      <style>{\`@keyframes spin{to{transform:rotate(360deg)}}\`}</style>
    </Section>
  );
}`;
c = c.substring(0, start) + nf + c.substring(end);
fs.writeFileSync('src/App.jsx', c);
console.log("LISTO - Factory limpia con Pollinations");
