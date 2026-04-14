const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

(async () => {
  const sizes = [0.90, 0.94, 0.96, 0.98, 1.0];
  const borders = [0.05, 0.03, 0.0]; // 5%, 3%, none
  const size = 1024;
  const borderColor = process.env.BORDER_COLOR || '#1e3a8a'; // navy

  const assetsDir = path.join(__dirname, '..', 'assets');
  const outDir = path.join(assetsDir, 'previews');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const adaptiveIconPath = path.join(assetsDir, 'adaptive-icon.png');
  if (!fs.existsSync(adaptiveIconPath)) {
    console.error(`Missing ${adaptiveIconPath}`);
    process.exit(1);
  }

  const base = () => sharp({
    create: { width: size, height: size, channels: 4, background: '#ffffff' }
  }).png();

  for (const borderPct of borders) {
    const borderWidth = Math.round(size * borderPct);
    const inset = Math.round(borderWidth / 2);
    const borderSvg = borderPct > 0 ? Buffer.from(`<?xml version="1.0"?>\n<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"${size}\" height=\"${size}\" viewBox=\"0 0 ${size} ${size}\">\n  <rect x=\"${inset}\" y=\"${inset}\" width=\"${size - borderWidth}\" height=\"${size - borderWidth}\" fill=\"none\" stroke=\"${borderColor}\" stroke-width=\"${borderWidth}\" rx=\"${Math.round(size*0.22)}\" ry=\"${Math.round(size*0.22)}\"/>\n</svg>`) : null;

    for (const pct of sizes) {
      const inner = Math.round(size * pct);
      const fg = await sharp(adaptiveIconPath)
        .resize({ width: inner, height: inner, fit: 'contain' })
        .png()
        .toBuffer();

      const label = `${Math.round(pct*100)}-${Math.round(borderPct*100)}`;
      const outPath = path.join(outDir, `icon-ios-preview-${label}.png`);
      const comps = [
        ...(borderSvg ? [{ input: borderSvg, left: 0, top: 0 }] : []),
        { input: fg, left: Math.round((size - inner) / 2), top: Math.round((size - inner) / 2) },
      ];

      await base()
        .composite(comps)
        .flatten({ background: '#ffffff' })
        .removeAlpha()
        .png()
        .toFile(outPath);
      console.log('Wrote', outPath);
    }
  }
})();
