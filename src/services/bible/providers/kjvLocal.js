// Lazy-load the KJV JSON to avoid bloating the main bundle

function normalize(data) {
  // Supports two formats:
  // 1) Array: [ { name: 'Genesis', chapters: [[...],[...], ...] }, ... ]
  // 2) Object: { book: [ { name: 'Genesis', chapters: [...] }, ... ] }
  const out = {};
  if (Array.isArray(data)) {
    for (const b of data) {
      const name = b.name || b.abbrev || 'Unknown';
      const chapters = Array.isArray(b.chapters) ? b.chapters : [];
      out[name] = chapters.map((ch) => ch.map((v) => (typeof v === 'string' ? v : (v?.text ?? ''))));
    }
  } else if (data && (data.book || data.books)) {
    const books = data.book || data.books || [];
    for (const b of books) {
      const name = b.name || b.book_name || b.book || 'Unknown';
      const chapters = b.chapters || b.chapter || [];
      out[name] = chapters.map((ch) => ch.map((v) => (typeof v === 'string' ? v : (v?.text ?? ''))));
    }
  }
  return out;
}

let STORE = null;
async function loadStore() {
  if (STORE) return STORE;
  const mod = await import('../../../data/kjv.json');
  const kjv = mod.default ?? mod;
  STORE = normalize(kjv);
  return STORE;
}

export class KjvLocalProvider {
  constructor(opts = {}) { this.opts = opts; }
  async getBooks() { const S = await loadStore(); return Object.keys(S); }
  async getChapters(book) { const S = await loadStore(); return (S[book] || []).map((_, i) => i + 1); }
  async getChapterText(book, chapter) {
    const S = await loadStore();
    const idx = Number(chapter) - 1;
    const verses = (S[book]?.[idx] || []).slice();
    return { translation: 'KJV', book, chapter: Number(chapter), verses };
  }
  async search(q) {
    const S = await loadStore();
    const results = [];
    const ql = (q || '').toLowerCase();
    for (const [book, chapters] of Object.entries(S)) {
      chapters.forEach((verses, chIdx) => {
        verses.forEach((text, vIdx) => {
          if ((text || '').toLowerCase().includes(ql)) {
            results.push({ book, chapter: chIdx + 1, verse: vIdx + 1, preview: text });
          }
        });
      });
    }
    return results.slice(0, 50);
  }
}
