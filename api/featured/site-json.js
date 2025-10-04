// Removed in favor of ESM implementation (site-json.mjs) to avoid ESM/CJS import issues on Vercel
export default function handler(req, res) {
  res.status(410).json({ error: 'Gone', message: 'Use /api/featured/site-json implemented in ESM (.mjs)' });
}
