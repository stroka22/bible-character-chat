// Bible provider for mobile - fetches Bible data from the web app's static JSON files
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://faithtalkai.com';
const CACHE_PREFIX = 'bible_cache_';

export interface BibleVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface ChapterData {
  translation: string;
  book: string;
  chapter: number;
  verses: string[];
}

export interface Translation {
  code: string;
  name: string;
  year: number;
  comingSoon?: boolean;
}

export const AVAILABLE_TRANSLATIONS: Translation[] = [
  { code: 'KJV', name: 'King James Version', year: 1769 },
  { code: 'ASV', name: 'American Standard Version', year: 1901 },
  { code: 'WEB', name: 'World English Bible', year: 2000 },
  { code: 'YLT', name: "Young's Literal Translation", year: 1898 },
];

// Bible book metadata
export const BIBLE_BOOKS = [
  'Genesis','Exodus','Leviticus','Numbers','Deuteronomy',
  'Joshua','Judges','Ruth','1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra','Nehemiah','Esther','Job','Psalms','Proverbs','Ecclesiastes','Song of Solomon','Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos','Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi',
  'Matthew','Mark','Luke','John','Acts','Romans','1 Corinthians','2 Corinthians','Galatians','Ephesians','Philippians','Colossians','1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon','Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation'
];

// Chapter counts for each book
const CHAPTER_COUNTS: Record<string, number> = {
  'Genesis': 50, 'Exodus': 40, 'Leviticus': 27, 'Numbers': 36, 'Deuteronomy': 34,
  'Joshua': 24, 'Judges': 21, 'Ruth': 4, '1 Samuel': 31, '2 Samuel': 24,
  '1 Kings': 22, '2 Kings': 25, '1 Chronicles': 29, '2 Chronicles': 36,
  'Ezra': 10, 'Nehemiah': 13, 'Esther': 10, 'Job': 42, 'Psalms': 150,
  'Proverbs': 31, 'Ecclesiastes': 12, 'Song of Solomon': 8, 'Isaiah': 66,
  'Jeremiah': 52, 'Lamentations': 5, 'Ezekiel': 48, 'Daniel': 12,
  'Hosea': 14, 'Joel': 3, 'Amos': 9, 'Obadiah': 1, 'Jonah': 4,
  'Micah': 7, 'Nahum': 3, 'Habakkuk': 3, 'Zephaniah': 3, 'Haggai': 2,
  'Zechariah': 14, 'Malachi': 4,
  'Matthew': 28, 'Mark': 16, 'Luke': 24, 'John': 21, 'Acts': 28,
  'Romans': 16, '1 Corinthians': 16, '2 Corinthians': 13, 'Galatians': 6,
  'Ephesians': 6, 'Philippians': 4, 'Colossians': 4, '1 Thessalonians': 5,
  '2 Thessalonians': 3, '1 Timothy': 6, '2 Timothy': 4, 'Titus': 3,
  'Philemon': 1, 'Hebrews': 13, 'James': 5, '1 Peter': 5, '2 Peter': 3,
  '1 John': 5, '2 John': 1, '3 John': 1, 'Jude': 1, 'Revelation': 22,
};

// Cache for loaded Bible data
const bibleCache: Record<string, any> = {};

async function loadBibleData(translation: string): Promise<any> {
  // NIV falls back to KJV
  const effectiveTranslation = translation === 'NIV' ? 'KJV' : translation;
  
  if (bibleCache[effectiveTranslation]) {
    return bibleCache[effectiveTranslation];
  }
  
  // Try to load from AsyncStorage cache first
  const cacheKey = CACHE_PREFIX + effectiveTranslation.toLowerCase();
  try {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      const data = JSON.parse(cached);
      bibleCache[effectiveTranslation] = data;
      return data;
    }
  } catch {}
  
  // Fetch from server
  const url = `${BASE_URL}/data/${effectiveTranslation.toLowerCase()}.json`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load ${effectiveTranslation} Bible`);
  }
  
  const data = await response.json();
  bibleCache[effectiveTranslation] = data;
  
  // Cache in AsyncStorage (async, don't await)
  AsyncStorage.setItem(cacheKey, JSON.stringify(data)).catch(() => {});
  
  return data;
}

function normalizeData(data: any): Record<string, string[][]> {
  const out: Record<string, string[][]> = {};
  if (Array.isArray(data)) {
    for (const b of data) {
      const name = b.name || b.abbrev || 'Unknown';
      const chapters = Array.isArray(b.chapters) ? b.chapters : [];
      out[name] = chapters.map((ch: any) => 
        ch.map((v: any) => (typeof v === 'string' ? v : (v?.text ?? '')))
      );
    }
  }
  return out;
}

export function getChapterCount(book: string): number {
  return CHAPTER_COUNTS[book] || 1;
}

export function getChapters(book: string): number[] {
  const count = getChapterCount(book);
  return Array.from({ length: count }, (_, i) => i + 1);
}

export async function getChapterText(
  translation: string,
  book: string,
  chapter: number
): Promise<ChapterData> {
  const effectiveTranslation = translation === 'NIV' ? 'KJV' : translation;
  const raw = await loadBibleData(effectiveTranslation);
  const normalized = normalizeData(raw);
  
  const chapters = normalized[book];
  if (!chapters || chapters.length < chapter) {
    return { translation: effectiveTranslation, book, chapter, verses: [] };
  }
  
  const verses = chapters[chapter - 1] || [];
  return { translation: effectiveTranslation, book, chapter, verses };
}

export async function searchBible(
  translation: string,
  query: string,
  limit = 50
): Promise<BibleVerse[]> {
  const effectiveTranslation = translation === 'NIV' ? 'KJV' : translation;
  const raw = await loadBibleData(effectiveTranslation);
  const normalized = normalizeData(raw);
  
  const results: BibleVerse[] = [];
  const ql = (query || '').toLowerCase();
  
  for (const [book, chapters] of Object.entries(normalized)) {
    for (let chIdx = 0; chIdx < chapters.length; chIdx++) {
      const verses = chapters[chIdx];
      for (let vIdx = 0; vIdx < verses.length; vIdx++) {
        const text = verses[vIdx];
        if ((text || '').toLowerCase().includes(ql)) {
          results.push({
            book,
            chapter: chIdx + 1,
            verse: vIdx + 1,
            text
          });
          if (results.length >= limit) return results;
        }
      }
    }
  }
  
  return results;
}
