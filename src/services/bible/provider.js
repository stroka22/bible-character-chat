// Bible provider interface and simple registry
// We will support multiple providers: 'kjv-local' and 'biblebrain'

export const PROVIDERS = {
  KJV_LOCAL: 'kjv-local',
  BIBLE_BRAIN: 'biblebrain',
};

export function createBibleProvider(name, options = {}) {
  switch (name) {
    case PROVIDERS.KJV_LOCAL:
      return new (await import('./providers/kjvLocal.js')).KjvLocalProvider(options);
    case PROVIDERS.BIBLE_BRAIN:
      return new (await import('./providers/bibleBrain.js')).BibleBrainProvider(options);
    default:
      throw new Error('Unknown bible provider: ' + name);
  }
}

export const BIBLE_META = {
  // Canonical order and basic metadata for 66 books (KJV/standard order)
  books: [
    'Genesis','Exodus','Leviticus','Numbers','Deuteronomy',
    'Joshua','Judges','Ruth','1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra','Nehemiah','Esther','Job','Psalms','Proverbs','Ecclesiastes','Song of Solomon','Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos','Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi',
    'Matthew','Mark','Luke','John','Acts','Romans','1 Corinthians','2 Corinthians','Galatians','Ephesians','Philippians','Colossians','1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon','Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation'
  ]
};
