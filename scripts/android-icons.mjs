// Generates the Android launcher icons from the FastTime ring design.
// Run with: npm run android:icons
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const RES = "android/app/src/main/res";
const densities = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };

// The ring on a 108-unit adaptive-icon canvas. Android shows only the central
// 72 units and may crop to a circle of 66, so the artwork stays inside that.
const ring = (mono) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108">
  <defs>
    <linearGradient id="arc" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${mono ? "#fff" : "#B9AEFF"}"/>
      <stop offset="100%" stop-color="${mono ? "#fff" : "#4B3AC9"}"/>
    </linearGradient>
    <linearGradient id="dot" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${mono ? "#fff" : "#F5C08A"}"/>
      <stop offset="100%" stop-color="${mono ? "#fff" : "#DE7F42"}"/>
    </linearGradient>
  </defs>
  <circle cx="54" cy="54" r="20" fill="none" stroke="#fff" stroke-opacity="${mono ? 0.35 : 0.1}" stroke-width="5"/>
  <circle cx="54" cy="54" r="20" fill="none" stroke="url(#arc)" stroke-width="5" stroke-linecap="round"
          stroke-dasharray="94.25 125.66" transform="rotate(-90 54 54)"/>
  <circle cx="34" cy="54" r="3.6" fill="url(#dot)"/>
</svg>`;

// Full square icon (older Android without adaptive icons), with the glow.
const full = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108">
  <defs>
    <radialGradient id="glow" cx="50%" cy="0%" r="80%">
      <stop offset="0%" stop-color="#7C5CFF" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#7C5CFF" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="108" height="108" fill="#08080C"/>
  <rect width="108" height="108" fill="url(#glow)"/>
</svg>`;

for (const [name, scale] of Object.entries(densities)) {
  const dir = `${RES}/mipmap-${name}`;
  mkdirSync(dir, { recursive: true });
  const fg = Math.round(108 * scale);
  const legacy = Math.round(48 * scale);
  await sharp(Buffer.from(ring(false))).resize(fg, fg).png().toFile(`${dir}/ic_launcher_foreground.png`);
  await sharp(Buffer.from(ring(true))).resize(fg, fg).png().toFile(`${dir}/ic_launcher_monochrome.png`);
  await sharp(Buffer.from(full)).resize(fg, fg).png().toFile(`${dir}/ic_launcher_background.png`);

  // Legacy icons: background + ring, cropped to the visible 72-unit area.
  const layered = await sharp(Buffer.from(full))
    .resize(fg, fg)
    .composite([{ input: await sharp(Buffer.from(ring(false))).resize(fg, fg).png().toBuffer() }])
    .png()
    .toBuffer();
  const inset = Math.round(18 * scale);
  const crop = await sharp(layered)
    .extract({ left: inset, top: inset, width: fg - inset * 2, height: fg - inset * 2 })
    .resize(legacy, legacy)
    .png()
    .toBuffer();
  const r = Math.round(legacy * 0.18);
  const square = Buffer.from(`<svg width="${legacy}" height="${legacy}"><rect width="${legacy}" height="${legacy}" rx="${r}" ry="${r}"/></svg>`);
  const circle = Buffer.from(`<svg width="${legacy}" height="${legacy}"><circle cx="${legacy / 2}" cy="${legacy / 2}" r="${legacy / 2}"/></svg>`);
  await sharp(crop).composite([{ input: square, blend: "dest-in" }]).png().toFile(`${dir}/ic_launcher.png`);
  await sharp(crop).composite([{ input: circle, blend: "dest-in" }]).png().toFile(`${dir}/ic_launcher_round.png`);
}
console.log("Android icons written to", RES);
