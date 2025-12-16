import kjv from '../../../data/kjv.json';

function normalize(data) {
  // Data format: [ { name: 'Genesis', chapters: [ [verse1, verse2, ...], ... ] }, ... ]
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

const STORE = normalize(kjv);

export class KjvLocalProvider {
  constructor(opts = {}) { this.opts = opts; }
  async getBooks() { return Object.keys(STORE); }
  async getChapters(book) { return (STORE[book] || []).map((_, i) => i + 1); }
  async getChapterText(book, chapter) {
    const idx = Number(chapter) - 1;
    const verses = (STORE[book]?.[idx] || []).slice();
    return { translation: 'KJV', book, chapter: Number(chapter), verses };
  }
  async search(q) {
    const results = [];
    const ql = (q || '').toLowerCase();
    for (const [book, chapters] of Object.entries(STORE)) {
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
