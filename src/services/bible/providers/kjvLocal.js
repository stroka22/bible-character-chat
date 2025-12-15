// Minimal local KJV provider
// For Phase 1 we include a tiny subset (Genesis 1, John 1) and return placeholders for others.

const SAMPLE = {
  'Genesis': {
    1: [
      'In the beginning God created the heaven and the earth.',
      'And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.',
      'And God said, Let there be light: and there was light.',
    ]
  },
  'John': {
    1: [
      'In the beginning was the Word, and the Word was with God, and the Word was God.',
      'The same was in the beginning with God.',
      'All things were made by him; and without him was not any thing made that was made.',
    ]
  }
};

export class KjvLocalProvider {
  constructor(opts = {}) { this.opts = opts; }
  async getBooks() {
    return Object.keys(SAMPLE);
  }
  async getChapters(book) {
    const b = SAMPLE[book];
    return b ? Object.keys(b).map(n => Number(n)).sort((a,b)=>a-b) : [];
  }
  async getChapterText(book, chapter) {
    const verses = SAMPLE[book]?.[chapter];
    if (!verses) return { translation: 'KJV', book, chapter, verses: [], notice: 'Placeholder chapter (full KJV will be loaded when available).'};
    return { translation: 'KJV', book, chapter, verses };
  }
  async search(q) {
    const results = [];
    for (const [book, chapters] of Object.entries(SAMPLE)) {
      for (const [chStr, verses] of Object.entries(chapters)) {
        verses.forEach((v, i) => {
          if (v.toLowerCase().includes(q.toLowerCase())) results.push({ book, chapter: Number(chStr), verse: i+1, preview: v });
        });
      }
    }
    return results;
  }
}
