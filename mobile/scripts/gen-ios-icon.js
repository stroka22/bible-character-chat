const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

(async () => {
  const size = 1024;
  const ringWidth = Math.round(size * 0.12); // ~12%
  const innerMargin = Math.round(size * 0.06); // ~6% padding inside ring

  const assetsDir = path.join(__dirname, '..', 'assets');
  const adaptiveIconPath = path.join(assetsDir, 'adaptive-icon.png');
  const outPath = path.join(assetsDir, 'icon-ios.png');

  if (!fs.existsSync(adaptiveIconPath)) {
    console.error(`Missing ${adaptiveIconPath}`);
    process.exit(1);
  }

  // Base white background
  const base = sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: '#ffffff',
    },
  }).png();

  // Gold ring via SVG stroke
  const r = size / 2 - ringWidth / 2; // radius to center the stroke
  const svg = `<?xml version="1.0"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="#facc15" stroke-width="${ringWidth}" />
</svg>`;

  const ring = Buffer.from(svg);

  // Size adaptive foreground to fit within inner circle minus margin
  const innerDiameter = size - 2 * ringWidth - 2 * innerMargin;
  const fg = await sharp(adaptiveIconPath)
    .resize({ width: innerDiameter, height: innerDiameter, fit: 'contain' })
    .png()
    .toBuffer();

  await base
    .composite([
      { input: ring, left: 0, top: 0 },
      { input: fg, left: Math.round((size - innerDiameter) / 2), top: Math.round((size - innerDiameter) / 2) },
    ])
    .flatten({ background: '#ffffff' }) // blend any alpha against white
    .removeAlpha() // drop alpha channel entirely
    .png()
    .toFile(outPath);

  console.log(`Wrote ${outPath}`);
})();
