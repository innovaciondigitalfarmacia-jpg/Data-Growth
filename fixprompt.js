const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

let old = 'image_prompt":"english: professional commercial photography prompt for this topic, high quality, no text"';
let neu = 'image_prompt":"english: modern vibrant illustrated digital art, animated colorful style, eye-catching social media graphic about this topic, use ${brand.color} color tones, beautiful professional illustration, trending on dribbble, no text no words"';

if (c.includes(old)) {
  c = c.replace(old, neu);
  console.log("DONE - Fixed!");
} else {
  console.log("NOT FOUND - checking...");
  console.log(c.includes("image_prompt") ? "image_prompt exists but different text" : "no image_prompt at all");
}

fs.writeFileSync('src/App.jsx', c);
