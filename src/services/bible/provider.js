// Bible provider interface and simple registry
// Supports local translations (KJV, ASV, WEB, YLT) and BibleBrain API

export const PROVIDERS = {
  LOCAL: 'local',
  BIBLE_BRAIN: 'biblebrain',
};

export const TRANSLATIONS = {
  KJV: 'KJV',
  ASV: 'ASV',
  WEB: 'WEB',
  YLT: 'YLT',
};

export async function createBibleProvider(name, options = {}) {
  switch (name) {
    case PROVIDERS.LOCAL:
      const { LocalBibleProvider } = await import('./providers/localBible.js');
      return new LocalBibleProvider(options.translation || 'KJV');
    case PROVIDERS.BIBLE_BRAIN:
      const { BibleBrainProvider } = await import('./providers/bibleBrain.js');
      return new BibleBrainProvider(options);
    default:
      throw new Error('Unknown bible provider: ' + name);
  }
}

export { AVAILABLE_TRANSLATIONS } from './providers/localBible.js';

export const BIBLE_META = {
  // Canonical order and basic metadata for 66 books (KJV/standard order)
  books: [
    'Genesis','Exodus','Leviticus','Numbers','Deuteronomy',
    'Joshua','Judges','Ruth','1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra','Nehemiah','Esther','Job','Psalms','Proverbs','Ecclesiastes','Song of Solomon','Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos','Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi',
    'Matthew','Mark','Luke','John','Acts','Romans','1 Corinthians','2 Corinthians','Galatians','Ephesians','Philippians','Colossians','1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon','Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation'
  ]
};
