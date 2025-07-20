/**
 * Mock Bible Character Data
 * 
 * This file provides fallback character data when the Supabase database
 * connection fails. It contains a representative sample of biblical figures
 * from both Old and New Testaments with all fields needed by the application.
 */

// Mock character data based on the existing mock-characters.js file
const MOCK_CHARACTERS = [
  {
    id: 1,
    name: "Moses",
    description: "Prophet and lawgiver who led the Israelites out of Egypt and received the Ten Commandments from God on Mount Sinai.",
    bible_book: "Exodus",
    scriptural_context: "Exodus, Leviticus, Numbers, Deuteronomy",
    avatar_url: "https://ui-avatars.com/api/?name=Moses&background=0D8ABC&color=fff",
    feature_image_url: null,
    is_visible: true,
    created_at: "2023-01-01T00:00:00.000Z",
    updated_at: "2023-01-01T00:00:00.000Z",
    persona_prompt: "You were born in Egypt during the time of Hebrew slavery, raised in Pharaoh's household, and later led the Israelites to freedom. You received the Ten Commandments from God and guided your people through the wilderness for 40 years. You're known for your humility, leadership, and direct communication with God."
  },
  {
    id: 2,
    name: "David",
    description: "Shepherd boy who became king of Israel, known for slaying Goliath, writing many Psalms, and being a man after God's own heart.",
    bible_book: "1 Samuel",
    scriptural_context: "1 Samuel, 2 Samuel, 1 Kings, Psalms",
    avatar_url: "https://ui-avatars.com/api/?name=David&background=B91C1C&color=fff",
    feature_image_url: null,
    is_visible: true,
    created_at: "2023-01-01T00:00:00.000Z",
    updated_at: "2023-01-01T00:00:00.000Z",
    persona_prompt: "You were a shepherd boy who defeated Goliath, became Israel's greatest king, and were known as a man after God's own heart. You wrote many psalms, expressing deep emotions from joy to despair. Despite your sins, including your affair with Bathsheba, you remained faithful to God and repentant."
  },
  {
    id: 3,
    name: "Esther",
    description: "Jewish queen of Persia who saved her people from genocide through her courage and faith.",
    bible_book: "Esther",
    scriptural_context: "Esther",
    avatar_url: "https://ui-avatars.com/api/?name=Esther&background=7E22CE&color=fff",
    feature_image_url: null,
    is_visible: true,
    created_at: "2023-01-01T00:00:00.000Z",
    updated_at: "2023-01-01T00:00:00.000Z",
    persona_prompt: "You were a Jewish orphan who became queen of Persia and risked your life to save your people from genocide. Your courage in approaching the king unbidden—'if I perish, I perish'—and your strategic thinking led to the defeat of Haman's plot and the establishment of the feast of Purim."
  },
  {
    id: 4,
    name: "Mary",
    description: "Mother of Jesus, chosen by God to give birth to the Messiah as a virgin.",
    bible_book: "Luke",
    scriptural_context: "Matthew, Luke, John, Acts",
    avatar_url: "https://ui-avatars.com/api/?name=Mary&background=1D4ED8&color=fff",
    feature_image_url: null,
    is_visible: true,
    created_at: "2023-01-01T00:00:00.000Z",
    updated_at: "2023-01-01T00:00:00.000Z",
    persona_prompt: "You were chosen by God to give birth to Jesus despite being a young virgin. You pondered the mystery of your son's identity in your heart, stood by him during his ministry, witnessed his crucifixion, and joined the early church after his resurrection. You're known for your faith, obedience, and contemplative nature."
  },
  {
    id: 5,
    name: "Paul",
    description: "Former persecutor of Christians who became an apostle after encountering the risen Christ, wrote much of the New Testament.",
    bible_book: "Acts",
    scriptural_context: "Acts, Romans, 1 & 2 Corinthians, Galatians, Ephesians, Philippians, Colossians, 1 & 2 Thessalonians, 1 & 2 Timothy, Titus, Philemon",
    avatar_url: "https://ui-avatars.com/api/?name=Paul&background=15803D&color=fff",
    feature_image_url: null,
    is_visible: true,
    created_at: "2023-01-01T00:00:00.000Z",
    updated_at: "2023-01-01T00:00:00.000Z",
    persona_prompt: "You were once Saul of Tarsus, a persecutor of Christians, until your dramatic conversion on the road to Damascus. You became Christianity's most influential early missionary, writing many New Testament letters, establishing churches throughout the Roman world, and enduring imprisonment and hardship for your faith."
  },
  {
    id: 6,
    name: "Peter",
    description: "Fisherman who became one of Jesus' closest disciples and a leader in the early church.",
    bible_book: "Matthew",
    scriptural_context: "Matthew, Mark, Luke, John, Acts, 1 & 2 Peter",
    avatar_url: "https://ui-avatars.com/api/?name=Peter&background=A16207&color=fff",
    feature_image_url: null,
    is_visible: true,
    created_at: "2023-01-01T00:00:00.000Z",
    updated_at: "2023-01-01T00:00:00.000Z",
    persona_prompt: "You were a fisherman called by Jesus to become a 'fisher of men.' Impulsive and passionate, you walked on water with Jesus but also denied him three times. After his resurrection, you became a bold leader in the early church, preaching at Pentecost and eventually dying as a martyr for your faith."
  },
  {
    id: 7,
    name: "Abraham",
    description: "Patriarch who left his homeland at God's call and became the father of many nations through God's covenant.",
    bible_book: "Genesis",
    scriptural_context: "Genesis",
    avatar_url: "https://ui-avatars.com/api/?name=Abraham&background=4D7C0F&color=fff",
    feature_image_url: null,
    is_visible: true,
    created_at: "2023-01-01T00:00:00.000Z",
    updated_at: "2023-01-01T00:00:00.000Z",
    persona_prompt: "You left your homeland of Ur at God's call, journeying to an unknown land with your wife Sarah. Despite being childless until old age, you believed God's promise that you would become the father of many nations. Your faith was tested when God asked you to sacrifice your son Isaac, but God provided a ram instead. You're known as the father of faith."
  },
  {
    id: 8,
    name: "John",
    description: "Apostle whom Jesus loved, wrote the Gospel of John, three epistles, and Revelation.",
    bible_book: "John",
    scriptural_context: "Matthew, Mark, Luke, John, Acts, 1, 2 & 3 John, Revelation",
    avatar_url: "https://ui-avatars.com/api/?name=John&background=BE185D&color=fff",
    feature_image_url: null,
    is_visible: true,
    created_at: "2023-01-01T00:00:00.000Z",
    updated_at: "2023-01-01T00:00:00.000Z",
    persona_prompt: "You were one of Jesus' closest disciples, often referred to as 'the disciple whom Jesus loved.' You witnessed Jesus' transfiguration and were present at the crucifixion, where Jesus entrusted his mother to your care. You wrote the Gospel of John, three epistles, and Revelation, emphasizing themes of love, light, and eternal life."
  },
  {
    id: 9,
    name: "Ruth",
    description: "Moabite woman who showed extraordinary loyalty to her mother-in-law Naomi and became an ancestor of King David and Jesus.",
    bible_book: "Ruth",
    scriptural_context: "Ruth",
    avatar_url: "https://ui-avatars.com/api/?name=Ruth&background=9D174D&color=fff",
    feature_image_url: null,
    is_visible: true,
    created_at: "2023-01-01T00:00:00.000Z",
    updated_at: "2023-01-01T00:00:00.000Z",
    persona_prompt: "You were a Moabite woman who chose to follow your mother-in-law Naomi back to Bethlehem after both your husbands died, saying 'Where you go I will go, and where you stay I will stay. Your people will be my people and your God my God.' Through your loyalty and faith, you married Boaz and became the great-grandmother of King David, placing you in the lineage of Jesus."
  },
  {
    id: 10,
    name: "Daniel",
    description: "Prophet who remained faithful to God while serving in the Babylonian court, known for interpreting dreams and receiving apocalyptic visions.",
    bible_book: "Daniel",
    scriptural_context: "Daniel",
    avatar_url: "https://ui-avatars.com/api/?name=Daniel&background=0E7490&color=fff",
    feature_image_url: null,
    is_visible: true,
    created_at: "2023-01-01T00:00:00.000Z",
    updated_at: "2023-01-01T00:00:00.000Z",
    persona_prompt: "You were taken to Babylon as a young man during the exile of Judah. Despite serving in a foreign court, you remained faithful to God's laws, even when it meant facing the lions' den. You interpreted dreams for kings Nebuchadnezzar and Belshazzar, and received apocalyptic visions about future kingdoms and the end times. Your life demonstrates unwavering faith under pressure."
  }
];

/**
 * Mock character data repository that implements the same interface as characterRepository.js
 * Used as a fallback when the Supabase database connection fails
 */
export const mockCharacterData = {
  characters: MOCK_CHARACTERS,
  
  /**
   * Get all characters
   * @param {boolean} isAdmin - Whether to include non-visible characters (ignored in mock)
   * @returns {Promise<Array>} - Array of character objects
   */
  getAll(isAdmin = false) {
    try {
      // In the mock version, we don't filter by visibility
      return Promise.resolve([...this.characters]);
    } catch (error) {
      console.error('Error in mock getAll:', error);
      return Promise.reject(new Error('Failed to get mock characters'));
    }
  },
  
  /**
   * Get a character by ID
   * @param {number|string} id - The character ID to find
   * @returns {Promise<Object|null>} - Character object or null if not found
   */
  getById(id) {
    try {
      const character = this.characters.find(c => c.id === Number(id));
      return Promise.resolve(character || null);
    } catch (error) {
      console.error(`Error in mock getById(${id}):`, error);
      return Promise.reject(new Error('Failed to get mock character by ID'));
    }
  },
  
  /**
   * Get a character by name
   * @param {string} name - The character name to find
   * @returns {Promise<Object|null>} - Character object or null if not found
   */
  getByName(name) {
    try {
      const character = this.characters.find(c => 
        c.name.toLowerCase() === name.toLowerCase());
      return Promise.resolve(character || null);
    } catch (error) {
      console.error(`Error in mock getByName(${name}):`, error);
      return Promise.reject(new Error('Failed to get mock character by name'));
    }
  },
  
  /**
   * Search characters by query string (matches name or description)
   * @param {string} query - The search query
   * @param {boolean} isAdmin - Whether to include non-visible characters (ignored in mock)
   * @returns {Promise<Array>} - Array of matching character objects
   */
  search(query, isAdmin = false) {
    try {
      if (!query || typeof query !== 'string') {
        return Promise.resolve([...this.characters]);
      }
      
      const lowercaseQuery = query.toLowerCase();
      const results = this.characters.filter(c => 
        c.name.toLowerCase().includes(lowercaseQuery) || 
        (c.description && c.description.toLowerCase().includes(lowercaseQuery)) ||
        (c.bible_book && c.bible_book.toLowerCase().includes(lowercaseQuery)));
        
      return Promise.resolve(results);
    } catch (error) {
      console.error(`Error in mock search(${query}):`, error);
      return Promise.reject(new Error('Failed to search mock characters'));
    }
  }
};

// For direct use in browser scripts if needed
if (typeof window !== 'undefined') {
  window.MOCK_BIBLE_CHARACTERS = MOCK_CHARACTERS;
}
