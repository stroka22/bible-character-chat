// Generic local Bible provider - works with any JSON file in KJV-style format

function normalize(data) {
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

const STORES = {};

async function loadStore(translation) {
  if (STORES[translation]) return STORES[translation];
  
  let mod;
  switch (translation) {
    case 'KJV':
      mod = await import('../../../data/kjv.json');
      break;
    case 'ASV':
      mod = await import('../../../data/asv.json');
      break;
    case 'WEB':
      mod = await import('../../../data/web.json');
      break;
    case 'YLT':
      mod = await import('../../../data/ylt.json');
      break;
    default:
      throw new Error(`Unknown translation: ${translation}`);
  }
  
  const data = mod.default ?? mod;
  STORES[translation] = normalize(data);
  return STORES[translation];
}

export class LocalBibleProvider {
  constructor(translation = 'KJV') {
    this.translation = translation;
  }
  
  async getBooks() {
    const S = await loadStore(this.translation);
    return Object.keys(S);
  }
  
  async getChapters(book) {
    const S = await loadStore(this.translation);
    return (S[book] || []).map((_, i) => i + 1);
  }
  
  async getChapterText(book, chapter) {
    const S = await loadStore(this.translation);
    const idx = Number(chapter) - 1;
    const verses = (S[book]?.[idx] || []).slice();
    return { translation: this.translation, book, chapter: Number(chapter), verses };
  }
  
  async search(q) {
    const S = await loadStore(this.translation);
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

// Available translations
export const AVAILABLE_TRANSLATIONS = [
  { code: 'NIV', name: 'New International Version (coming soon)', year: 1978, comingSoon: true },
  { code: 'KJV', name: 'King James Version', year: 1769 },
  { code: 'ASV', name: 'American Standard Version', year: 1901 },
  { code: 'WEB', name: 'World English Bible', year: 2000 },
  { code: 'YLT', name: "Young's Literal Translation", year: 1898 },
];
