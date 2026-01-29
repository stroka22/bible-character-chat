/**
 * Suggests relevant Bible characters based on book/passage being read
 */

// Map Bible books to relevant characters (by name)
const BOOK_TO_CHARACTERS = {
  // Pentateuch
  'Genesis': ['Abraham', 'Moses', 'Joseph', 'Jacob', 'Adam', 'Eve', 'Noah'],
  'Exodus': ['Moses', 'Aaron', 'Miriam'],
  'Leviticus': ['Moses', 'Aaron'],
  'Numbers': ['Moses', 'Aaron', 'Joshua', 'Caleb'],
  'Deuteronomy': ['Moses', 'Joshua'],
  
  // Historical Books
  'Joshua': ['Joshua', 'Caleb', 'Rahab'],
  'Judges': ['Deborah', 'Gideon', 'Samson'],
  'Ruth': ['Ruth', 'Naomi', 'Boaz'],
  '1 Samuel': ['David', 'Samuel', 'Saul', 'Jonathan', 'Hannah'],
  '2 Samuel': ['David', 'Nathan', 'Absalom'],
  '1 Kings': ['Solomon', 'Elijah', 'David'],
  '2 Kings': ['Elijah', 'Elisha', 'Hezekiah', 'Josiah'],
  '1 Chronicles': ['David', 'Solomon'],
  '2 Chronicles': ['Solomon', 'Hezekiah', 'Josiah'],
  'Ezra': ['Ezra', 'Nehemiah'],
  'Nehemiah': ['Nehemiah', 'Ezra'],
  'Esther': ['Esther', 'Mordecai'],
  
  // Wisdom Literature
  'Job': ['Job'],
  'Psalms': ['David', 'Solomon', 'Moses'],
  'Proverbs': ['Solomon', 'David'],
  'Ecclesiastes': ['Solomon'],
  'Song of Solomon': ['Solomon'],
  'Song of Songs': ['Solomon'],
  
  // Major Prophets
  'Isaiah': ['Isaiah', 'Hezekiah'],
  'Jeremiah': ['Jeremiah'],
  'Lamentations': ['Jeremiah'],
  'Ezekiel': ['Ezekiel', 'Daniel'],
  'Daniel': ['Daniel', 'Shadrach', 'Meshach', 'Abednego'],
  
  // Minor Prophets
  'Hosea': ['Hosea'],
  'Joel': ['Joel'],
  'Amos': ['Amos'],
  'Obadiah': ['Obadiah'],
  'Jonah': ['Jonah'],
  'Micah': ['Micah'],
  'Nahum': ['Nahum'],
  'Habakkuk': ['Habakkuk'],
  'Zephaniah': ['Zephaniah'],
  'Haggai': ['Haggai'],
  'Zechariah': ['Zechariah'],
  'Malachi': ['Malachi'],
  
  // Gospels
  'Matthew': ['Jesus', 'Peter', 'John', 'Mary', 'Joseph'],
  'Mark': ['Jesus', 'Peter', 'John'],
  'Luke': ['Jesus', 'Mary', 'Peter', 'John', 'Luke'],
  'John': ['Jesus', 'John', 'Peter', 'Mary Magdalene', 'Thomas'],
  
  // Acts & Epistles
  'Acts': ['Paul', 'Peter', 'Luke', 'Barnabas', 'Stephen', 'Philip'],
  'Romans': ['Paul'],
  'Corinthians': ['Paul'],
  '1 Corinthians': ['Paul'],
  '2 Corinthians': ['Paul'],
  'Galatians': ['Paul', 'Peter'],
  'Ephesians': ['Paul'],
  'Philippians': ['Paul'],
  'Colossians': ['Paul'],
  'Thessalonians': ['Paul'],
  '1 Thessalonians': ['Paul'],
  '2 Thessalonians': ['Paul'],
  'Timothy': ['Paul', 'Timothy'],
  '1 Timothy': ['Paul', 'Timothy'],
  '2 Timothy': ['Paul', 'Timothy'],
  'Titus': ['Paul', 'Titus'],
  'Philemon': ['Paul'],
  'Hebrews': ['Paul', 'Moses', 'Abraham'],
  'James': ['James'],
  '1 Peter': ['Peter'],
  '2 Peter': ['Peter'],
  '1 John': ['John'],
  '2 John': ['John'],
  '3 John': ['John'],
  'Jude': ['Jude'],
  'Revelation': ['John', 'Jesus'],
};

// Topic-based character suggestions
const TOPIC_TO_CHARACTERS = {
  'faith': ['Abraham', 'Moses', 'David', 'Peter', 'Paul'],
  'prayer': ['David', 'Daniel', 'Jesus', 'Hannah', 'Elijah'],
  'forgiveness': ['Jesus', 'Joseph', 'David', 'Peter'],
  'hope': ['Job', 'Paul', 'David', 'Jeremiah'],
  'love': ['Jesus', 'John', 'Ruth', 'Mary'],
  'courage': ['David', 'Esther', 'Daniel', 'Joshua', 'Stephen'],
  'wisdom': ['Solomon', 'Daniel', 'James', 'Paul'],
  'leadership': ['Moses', 'Joshua', 'David', 'Nehemiah', 'Paul'],
  'suffering': ['Job', 'Paul', 'Joseph', 'Jeremiah', 'Jesus'],
  'obedience': ['Abraham', 'Mary', 'Samuel', 'Jesus'],
  'marriage': ['Ruth', 'Boaz', 'Abraham', 'Sarah'],
  'parenting': ['Hannah', 'Mary', 'Joseph', 'Abraham'],
  'anxiety': ['David', 'Jesus', 'Paul', 'Elijah'],
  'peace': ['Jesus', 'Paul', 'David'],
  'grief': ['David', 'Job', 'Mary', 'Martha'],
  'identity': ['Paul', 'Peter', 'Moses', 'David'],
  'work': ['Nehemiah', 'Paul', 'Joseph', 'Daniel'],
  'money': ['Solomon', 'Jesus', 'Paul'],
  'finances': ['Solomon', 'Jesus', 'Paul'],
};

/**
 * Get suggested character names based on readings
 * @param {Array} readings - Array of {book, chapter, verses} objects
 * @returns {string[]} - Array of character names, most relevant first
 */
export function getSuggestedCharacters(readings) {
  if (!readings || readings.length === 0) {
    return ['Jesus', 'Paul', 'David']; // Default suggestions
  }
  
  const characterScores = {};
  
  readings.forEach((reading, index) => {
    const book = reading.book;
    const characters = BOOK_TO_CHARACTERS[book] || [];
    
    // Earlier readings get slightly higher weight
    const weight = readings.length - index;
    
    characters.forEach((char, charIndex) => {
      // First character for a book is most relevant
      const charWeight = weight * (characters.length - charIndex);
      characterScores[char] = (characterScores[char] || 0) + charWeight;
    });
  });
  
  // Sort by score descending
  const sorted = Object.entries(characterScores)
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name);
  
  // Return top 3, or defaults if none found
  return sorted.length > 0 ? sorted.slice(0, 3) : ['Jesus', 'Paul', 'David'];
}

/**
 * Get suggested character for a topic/theme
 * @param {string} topic - Topic keyword
 * @returns {string[]} - Array of character names
 */
export function getCharactersForTopic(topic) {
  const lowerTopic = topic.toLowerCase();
  
  for (const [key, characters] of Object.entries(TOPIC_TO_CHARACTERS)) {
    if (lowerTopic.includes(key)) {
      return characters;
    }
  }
  
  return ['Jesus', 'Paul', 'David']; // Defaults
}

/**
 * Get the best single character suggestion
 * @param {Array} readings - Array of {book, chapter, verses} objects
 * @param {string} planTitle - Optional plan title for topic hints
 * @returns {string} - Single character name
 */
export function getBestCharacterSuggestion(readings, planTitle = '') {
  const fromReadings = getSuggestedCharacters(readings);
  
  // Check if plan title suggests a specific character
  const titleLower = (planTitle || '').toLowerCase();
  
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
  if (titleLower.includes('women')) return 'Ruth';
  if (titleLower.includes('spirit')) return 'Paul';
  if (titleLower.includes('romans')) return 'Paul';
  if (titleLower.includes('corinthians')) return 'Paul';
  if (titleLower.includes('galatians')) return 'Paul';
  if (titleLower.includes('ephesians')) return 'Paul';
  if (titleLower.includes('philippians')) return 'Paul';
  if (titleLower.includes('colossians')) return 'Paul';
  if (titleLower.includes('thessalonians')) return 'Paul';
  if (titleLower.includes('hebrews')) return 'Paul';
  if (titleLower.includes('acts')) return 'Paul';
  if (titleLower.includes('mark')) return 'Peter';
  if (titleLower.includes('prayer')) return 'David';
  if (titleLower.includes('leadership')) return 'Moses';
  if (titleLower.includes('marriage')) return 'Ruth';
  if (titleLower.includes('parenting')) return 'Mary';
  if (titleLower.includes('suffering')) return 'Job';
  if (titleLower.includes('grief')) return 'David';
  if (titleLower.includes('anxiety')) return 'David';
  if (titleLower.includes('peace')) return 'Paul';
  if (titleLower.includes('faith')) return 'Abraham';
  if (titleLower.includes('hope')) return 'Paul';
  if (titleLower.includes('identity')) return 'Paul';
  if (titleLower.includes('forgiveness')) return 'Joseph';
  
  return fromReadings[0] || 'Jesus';
}
