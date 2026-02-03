// Map Bible books to relevant character names
const BOOK_TO_CHARACTERS: Record<string, string[]> = {
  'Genesis': ['Abraham', 'Moses', 'Joseph', 'Jacob', 'Adam', 'Eve', 'Noah'],
  'Exodus': ['Moses', 'Aaron', 'Miriam'],
  'Leviticus': ['Moses', 'Aaron'],
  'Numbers': ['Moses', 'Aaron', 'Joshua', 'Caleb'],
  'Deuteronomy': ['Moses', 'Joshua'],
  'Joshua': ['Joshua', 'Caleb', 'Rahab'],
  'Judges': ['Deborah', 'Gideon', 'Samson'],
  'Ruth': ['Ruth', 'Naomi', 'Boaz'],
  '1 Samuel': ['David', 'Samuel', 'Saul', 'Jonathan', 'Hannah'],
  '2 Samuel': ['David', 'Nathan', 'Absalom'],
  '1 Kings': ['Solomon', 'Elijah', 'David'],
  '2 Kings': ['Elijah', 'Elisha', 'Hezekiah', 'Josiah'],
  'Psalms': ['David', 'Solomon', 'Moses'],
  'Proverbs': ['Solomon', 'David'],
  'Isaiah': ['Isaiah', 'Hezekiah'],
  'Jeremiah': ['Jeremiah'],
  'Daniel': ['Daniel'],
  'Jonah': ['Jonah'],
  'Matthew': ['Jesus', 'Peter', 'John', 'Mary'],
  'Mark': ['Jesus', 'Peter', 'John'],
  'Luke': ['Jesus', 'Mary', 'Peter', 'John'],
  'John': ['Jesus', 'John', 'Peter', 'Mary Magdalene', 'Thomas'],
  'Acts': ['Paul', 'Peter', 'Luke', 'Barnabas', 'Stephen'],
  'Romans': ['Paul'],
  '1 Corinthians': ['Paul'],
  '2 Corinthians': ['Paul'],
  'Galatians': ['Paul', 'Peter'],
  'Ephesians': ['Paul'],
  'Philippians': ['Paul'],
  'Colossians': ['Paul'],
  'Hebrews': ['Paul', 'Moses', 'Abraham'],
  'James': ['James'],
  '1 Peter': ['Peter'],
  '2 Peter': ['Peter'],
  '1 John': ['John'],
  'Revelation': ['John', 'Jesus'],
};

export function getSuggestedCharacterName(readings: { book: string; chapter: number }[]): string {
  if (!readings || readings.length === 0) {
    return 'Jesus';
  }
  
  const book = readings[0].book;
  const characters = BOOK_TO_CHARACTERS[book];
  
  if (characters && characters.length > 0) {
    return characters[0];
  }
  
  return 'Jesus';
}

export function getBestCharacterName(readings: { book: string; chapter: number }[], planTitle: string = ''): string {
  const titleLower = (planTitle || '').toLowerCase();
  
  // Check plan title for character hints
  if (titleLower.includes('david')) return 'David';
  if (titleLower.includes('moses')) return 'Moses';
  if (titleLower.includes('paul')) return 'Paul';
  if (titleLower.includes('peter')) return 'Peter';
  if (titleLower.includes('abraham')) return 'Abraham';
  if (titleLower.includes('joseph')) return 'Joseph';
  if (titleLower.includes('jesus')) return 'Jesus';
  if (titleLower.includes('john')) return 'John';
  if (titleLower.includes('ruth')) return 'Ruth';
  if (titleLower.includes('esther')) return 'Esther';
  if (titleLower.includes('daniel')) return 'Daniel';
  if (titleLower.includes('elijah')) return 'Elijah';
  if (titleLower.includes('mary')) return 'Mary';
  
  return getSuggestedCharacterName(readings);
}
