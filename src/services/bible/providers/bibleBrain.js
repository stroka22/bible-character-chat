// Bible Brain provider (stub). Real calls will be enabled when API key is present.

const BASE = 'https://4.dbt.io/api';
function hasKey() {
  return !!(import.meta.env?.VITE_BIBLE_BRAIN_KEY || process.env.BIBLE_BRAIN_API_KEY);
}

async function fetchJson(url) {
  const key = import.meta.env?.VITE_BIBLE_BRAIN_KEY || process.env.BIBLE_BRAIN_API_KEY;
  const headers = key ? { Authorization: `Bearer ${key}` } : {};
  const r = await fetch(url, { headers });
  if (!r.ok) throw new Error(`BibleBrain error ${r.status}`);
  return r.json();
}

export class BibleBrainProvider {
  constructor(opts = {}) { this.opts = opts; }
  async getBooks(bibleId) {
    if (!hasKey()) return [];
    // TODO: list books endpoint (bibleId required) according to Bible Brain docs
    // Placeholder until key arrives
    return [];
  }
  async getChapters(bookRef) {
    if (!hasKey()) return [];
    return [];
  }
  async getChapterText(book, chapter, { translationId } = {}) {
    if (!hasKey()) return { translation: 'NIV', book, chapter, verses: [], notice: 'Waiting for Bible Brain key. Showing local KJV instead.' };
    return { translation: 'NIV', book, chapter, verses: [], notice: 'Stub until key wired.' };
  }
  async search(q, { translationId } = {}) {
    if (!hasKey()) return [];
    return [];
  }
}
