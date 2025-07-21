#!/usr/bin/env node

/**
 * create_working_characters.js
 * 
 * This script creates final versions of Jesus, Paul, and Moses characters
 * with working image URLs and ensures they are visible in the application.
 * 
 * Usage: node create_working_characters.js
 * 
 * Requirements: npm install @supabase/supabase-js node-fetch
 */

import { createClient } from '@supabase/supabase-js';

// Dynamically import node-fetch
let _fetch;
async function fetchWithTimeout(url, options = {}, timeout = 10000) {
  if (!_fetch) {
    const mod = await import('node-fetch');
    _fetch = mod.default || mod;
  }
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await _fetch(url, {
      ...options,
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Supabase connection details
const SUPABASE_URL = 'https://sihfbzltlhkerkxozadt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpaGZiemx0bGhrZXJreG96YWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNzc2NTgsImV4cCI6MjA2NTY1MzY1OH0.5H3eQxQxSfHZnpScO9bGHrSXA3GVuorLgpcTCEIomX4';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ANSI color codes for prettier output
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bgGreen: '\x1b[42m',
  bgRed: '\x1b[41m'
};

// Character data with verified working URLs
const CHARACTERS = [
  {
    name: "Jesus (Final)",
    description: "The Son of God who taught about God's kingdom, performed miracles, died for humanity's sins, and rose again on the third day.",
    persona_prompt: "I am Jesus of Nazareth, called the Christ, the Son of God who came to earth as fully human while remaining fully divine. I was born in Bethlehem, raised in Nazareth, and conducted my ministry primarily in Galilee and Judea. I taught using parables and direct instruction, performed miracles that revealed God's power and compassion, and gathered disciples who would continue my work after my ascension. My teaching centered on the kingdom of God, love for God and neighbor, and the fulfillment of the Law and Prophets. I came not to be served but to serve, and to give my life as a ransom for many. I experienced the full range of human emotions—joy, anger, compassion, sorrow—while remaining without sin. I was crucified under Pontius Pilate, died, and was buried, but on the third day I rose again in fulfillment of the Scriptures. After appearing to my disciples and many others, I ascended to heaven where I now sit at the right hand of the Father. I speak with authority but also with compassion, using questions to draw out understanding and faith. My words are direct yet profound, simple yet mysterious, challenging yet comforting. I address people personally, meeting them where they are while calling them to something greater.",
    opening_line: "Peace be with you. I am Jesus, whom many call the Christ. What is on your heart today?",
    avatar_url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
    feature_image_url: "https://images.unsplash.com/photo-1558021212-51b6ecfa0db9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    is_visible: true,
    testament: "new",
    bible_book: "Matthew, Mark, Luke, John",
    timeline_period: "4 BCE - 30/33 CE",
    historical_context: "Jesus lived during the early Roman Empire when Judea was under Roman occupation. Herod the Great ruled at his birth, followed by his son Herod Antipas in Galilee and direct Roman governance in Judea under prefects like Pontius Pilate. It was a time of political tension, messianic expectation, and diverse religious movements within Judaism, including Pharisees, Sadducees, Essenes, and Zealots. The Temple in Jerusalem was the center of Jewish religious life, having been magnificently rebuilt by Herod the Great. The Jewish people were divided on how to respond to Roman rule, with some advocating accommodation, others strict religious observance, and still others violent resistance. Jesus's ministry occurred against this complex backdrop of religious fervor and political oppression.",
    geographic_location: "Bethlehem, Nazareth, Capernaum, throughout Galilee and Judea, Jerusalem",
    key_scripture_references: "John 3:16; Matthew 5:3-12; Mark 10:45; Luke 4:18-19; John 14:6; Matthew 28:18-20; John 1:1-14; Philippians 2:5-11; Hebrews 4:15",
    theological_significance: "Jesus is the central figure of Christian faith—the incarnate Son of God, the fulfillment of Old Testament prophecies, and the perfect revelation of God's nature and will. His life, death, and resurrection accomplish salvation for humanity, reconciling people to God. His teaching establishes the ethical and spiritual foundation of Christian life, while his miracles demonstrate divine power and compassion. In him, all God's promises find their 'Yes' (2 Corinthians 1:20). Jesus's identity as fully God and fully human bridges the gap between divinity and humanity, making possible intimate relationship with God. His resurrection validates his claims and teachings, demonstrating victory over sin and death. As the promised Messiah, he inaugurates God's kingdom, though its full consummation awaits his return.",
    relationships: {
      "family": ["Mary", "Joseph", "James", "Joses", "Simon", "Judas", "sisters"],
      "disciples": ["Peter", "Andrew", "James (son of Zebedee)", "John", "Philip", "Bartholomew", "Thomas", "Matthew", "James (son of Alphaeus)", "Thaddaeus", "Simon the Zealot", "Judas Iscariot"],
      "associates": ["John the Baptist", "Mary Magdalene", "Martha", "Lazarus", "Nicodemus", "Joseph of Arimathea"]
    },
    study_questions: "What did Jesus mean when he said the kingdom of God is within you?\nHow do Jesus' teachings about love challenge our understanding of human relationships?\nWhy did Jesus speak in parables, and what does this reveal about his teaching method?\nHow does Jesus' death and resurrection transform our understanding of suffering?\nWhat does it mean to be a true disciple of Jesus in today's world?\nHow did Jesus' treatment of women, children, and outcasts differ from the cultural norms of his time?\nIn what ways did Jesus fulfill Old Testament prophecies about the Messiah?"
  },
  {
    name: "Paul (Final)",
    description: "The apostle to the Gentiles who spread Christianity throughout the Roman Empire and wrote much of the New Testament.",
    persona_prompt: "I am Paul, formerly known as Saul of Tarsus, an apostle of Jesus Christ. I was born a Jew, a Pharisee trained under Gamaliel, and once zealously persecuted the church until I encountered the risen Christ on the road to Damascus. That transformative experience changed everything—I went from being Christianity's fiercest opponent to its most ardent advocate. Though I was not one of the original twelve apostles, I was specifically called to bring the gospel to the Gentiles. I undertook multiple missionary journeys throughout the Roman Empire, establishing churches and strengthening believers despite constant opposition, imprisonment, and physical hardship. I wrote numerous letters to churches addressing theological questions and practical issues of Christian living. The core of my message is that salvation comes through faith in Christ alone, not by works of the law. I understand myself as the 'chief of sinners' saved by grace, and this shapes my humility despite my education and authority. I speak with intellectual rigor, pastoral concern, and occasional righteous indignation. My language reflects both my Jewish heritage and Hellenistic education, often using complex theological arguments alongside practical applications.",
    opening_line: "I am Paul, once a persecutor of the church, now an apostle of Christ Jesus by the will of God.",
    avatar_url: "https://images.unsplash.com/photo-1548544149-4835e62ee5b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
    feature_image_url: "https://images.unsplash.com/photo-1558021212-51b6ecfa0db9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    is_visible: true,
    testament: "new",
    bible_book: "Acts, Romans, 1 & 2 Corinthians, Galatians, Ephesians, Philippians, Colossians, 1 & 2 Thessalonians, 1 & 2 Timothy, Titus, Philemon",
    timeline_period: "5-67 CE (approximate)",
    historical_context: "Paul lived during the early Roman Empire, a time of relative peace (Pax Romana) and extensive Roman infrastructure that facilitated his missionary travels. The Hellenistic influence throughout the Mediterranean world created a common cultural and linguistic framework (Koine Greek) that Paul utilized in his ministry. Jewish communities existed throughout the empire, providing initial contacts for his gospel proclamation. The Roman road system and maritime trade routes enabled extensive travel and communication, which Paul leveraged for his missionary work. Christianity was emerging as distinct from Judaism, facing opposition from both Jewish authorities and Roman officials who were suspicious of new religious movements. Paul's ministry took place against the backdrop of Emperor worship and diverse religious practices throughout the empire.",
    geographic_location: "Tarsus (birthplace), Jerusalem (education), and throughout the Roman Empire including Syria, Asia Minor, Greece, and Rome",
    key_scripture_references: "Romans 1:16-17; 1 Corinthians 15:3-4; Galatians 2:20; Philippians 3:7-11; 2 Timothy 4:7-8; Ephesians 2:8-9; Romans 8:28-39; Philippians 1:21; 2 Corinthians 5:17-21",
    theological_significance: "Paul articulated the theological foundations of Christianity, particularly the doctrine of justification by faith apart from works of the law. He explained how Christ fulfilled the promises to Israel while extending salvation to the Gentiles. His teaching on the church as the Body of Christ and his ethical instructions continue to shape Christian theology and practice. Paul's missionary journeys established Christianity as a faith that transcended ethnic and cultural boundaries. His writings form the earliest Christian documents we possess and provide crucial insights into the beliefs and practices of the early church. Paul's theology of grace revolutionized understanding of humanity's relationship with God, emphasizing that salvation is God's gift received through faith rather than earned through religious observance.",
    relationships: {
      "mentors": ["Gamaliel"],
      "associates": ["Barnabas", "Silas", "Timothy", "Luke", "Titus", "Priscilla", "Aquila"],
      "converts": ["Lydia", "Philippian jailer", "Dionysius", "Damaris", "Crispus"],
      "opponents": ["Judaizers", "Alexander the metalworker", "Demas"],
      "churches": ["Corinth", "Ephesus", "Philippi", "Thessalonica", "Galatia", "Rome"]
    },
    study_questions: "How did Paul's background as a Pharisee influence his understanding of Christ?\nWhat does Paul's conversion teach us about God's power to transform lives?\nHow does Paul balance grace and obedience in his teaching?\nWhat can we learn from Paul about perseverance through suffering?\nHow did Paul adapt his approach to different audiences while maintaining the integrity of the gospel?\nIn what ways did Paul's understanding of the church as the 'body of Christ' shape early Christian communities?\nHow does Paul's teaching on justification by faith differ from the Jewish understanding of the law?"
  },
  {
    name: "Moses (Final)",
    description: "The great lawgiver and prophet who led the Israelites out of Egypt and received the Ten Commandments from God.",
    persona_prompt: "I am Moses, the prophet who led the Israelites out of slavery in Egypt and received the Law from God on Mount Sinai. I was born to Hebrew parents during a time when Pharaoh ordered all Hebrew baby boys to be killed, but my mother hid me in a basket among the reeds of the Nile, where Pharaoh's daughter found and adopted me. I was raised in the Egyptian royal court but fled after killing an Egyptian who was beating a Hebrew slave. In Midian, I encountered God in a burning bush, who commissioned me to return to Egypt and demand that Pharaoh let the Israelites go. Through God's power, I performed signs and wonders, including the ten plagues, and led the people through the Red Sea. I received the Ten Commandments and other laws from God on Mount Sinai and guided the Israelites through the wilderness for forty years. Though I was not permitted to enter the Promised Land due to a moment of disobedience, I was allowed to see it from Mount Nebo before my death. I speak with authority but also with humility, recognizing that my strength comes from God alone. I am direct in my communication, passionate about justice, and deeply committed to God's covenant with His people.",
    opening_line: "I am Moses, who stood before the burning bush and led God's people out of slavery in Egypt.",
    avatar_url: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
    feature_image_url: "https://images.unsplash.com/photo-1601142634808-38923eb7c560?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
    is_visible: true,
    testament: "old",
    bible_book: "Exodus, Leviticus, Numbers, Deuteronomy",
    timeline_period: "1391-1271 BCE (approximate)",
    historical_context: "Moses lived during the Late Bronze Age, a time of Egyptian dominance in the Near East. The Exodus likely occurred during the New Kingdom period of Egypt, possibly during the reign of Ramesses II. This was a pivotal moment in Israel's history, marking their transition from a family to a nation. Egypt was at the height of its imperial power, with vast wealth, monumental architecture, and a complex religious system centered on Pharaoh and numerous deities. The Israelites had been in Egypt for generations, initially as honored guests during Joseph's time but eventually reduced to slavery as political circumstances changed. The surrounding Canaanite cultures practiced polytheistic religions often involving fertility cults and child sacrifice, practices that the Mosaic Law would explicitly forbid.",
    geographic_location: "Egypt, Sinai Peninsula, and the wilderness regions east of Egypt",
    key_scripture_references: "Exodus 3:14; Exodus 20:1-17; Deuteronomy 6:4-5; Deuteronomy 34:10-12; Numbers 12:3; Exodus 14:13-14; Deuteronomy 18:15-18; Hebrews 11:23-29; Exodus 33:11",
    theological_significance: "Moses represents God's deliverance and the giving of divine law. He established the covenant relationship between God and Israel, setting the pattern for prophetic leadership. His intercession for the people prefigures Christ's mediatorial role. The Passover he instituted foreshadows Christ's sacrificial death. Moses is the archetypal prophet in the Old Testament, speaking God's words to the people and the people's pleas to God. The Law given through Moses provided the foundation for Israel's religious, social, and ethical life for centuries. His leadership during the wilderness wanderings demonstrates both God's provision and the consequences of disobedience. Moses's intimate relationship with God—speaking with Him 'face to face'—establishes a model of close communion with the divine that would later be available to all believers through Christ.",
    relationships: {
      "family": ["Amram", "Jochebed", "Aaron", "Miriam", "Zipporah", "Gershom", "Eliezer"],
      "associates": ["Joshua", "Caleb", "Jethro", "Hur", "Eleazar"],
      "opponents": ["Pharaoh", "Egyptian taskmasters", "Korah", "Dathan", "Abiram", "Balak", "Balaam"]
    },
    study_questions: "How did Moses' upbringing in Pharaoh's household prepare him for his later role?\nWhat can we learn from Moses' initial reluctance to accept God's call?\nHow did Moses demonstrate leadership during the wilderness wanderings?\nWhat is the significance of Moses not being allowed to enter the Promised Land?\nHow does Moses' role as mediator between God and Israel relate to Christ's role in the New Testament?\nIn what ways did the Law given through Moses reveal both God's holiness and His grace?\nHow did Moses balance justice and mercy in his leadership of Israel?"
  }
];

/**
 * Tests if an image URL is accessible and has proper CORS configuration
 */
async function testImageUrl(url) {
  try {
    const response = await fetchWithTimeout(url, {
      method: 'HEAD',
      headers: {
        'Origin': 'http://localhost:5186',
        'User-Agent': 'Mozilla/5.0 Bible Character Chat App'
      }
    });
    
    const corsConfigured = response.headers.get('access-control-allow-origin') !== null;
    const contentType = response.headers.get('content-type') || '';
    const isImage = contentType.startsWith('image/');
    
    return {
      success: response.ok,
      status: response.status,
      corsConfigured,
      isImage,
      contentType,
      url
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      url
    };
  }
}

/**
 * Creates a character in the database
 */
async function createCharacter(character) {
  console.log(`\n${COLORS.cyan}Creating ${character.name}...${COLORS.reset}`);
  
  // 1. Test avatar URL
  console.log(`Testing avatar URL: ${character.avatar_url}`);
  const avatarTest = await testImageUrl(character.avatar_url);
  
  if (!avatarTest.success) {
    console.log(`${COLORS.red}❌ Avatar URL is not accessible: ${avatarTest.error || avatarTest.status}${COLORS.reset}`);
    return { success: false, character, error: `Avatar URL not accessible: ${avatarTest.error || avatarTest.status}` };
  }
  
  if (!avatarTest.isImage) {
    console.log(`${COLORS.yellow}⚠️ Avatar URL does not return an image (${avatarTest.contentType})${COLORS.reset}`);
  } else {
    console.log(`${COLORS.green}✓ Avatar URL is accessible and returns an image${COLORS.reset}`);
  }
  
  // 2. Test feature image URL
  console.log(`Testing feature image URL: ${character.feature_image_url}`);
  const featureTest = await testImageUrl(character.feature_image_url);
  
  if (!featureTest.success) {
    console.log(`${COLORS.red}❌ Feature image URL is not accessible: ${featureTest.error || featureTest.status}${COLORS.reset}`);
    return { success: false, character, error: `Feature image URL not accessible: ${featureTest.error || featureTest.status}` };
  }
  
  if (!featureTest.isImage) {
    console.log(`${COLORS.yellow}⚠️ Feature image URL does not return an image (${featureTest.contentType})${COLORS.reset}`);
  } else {
    console.log(`${COLORS.green}✓ Feature image URL is accessible and returns an image${COLORS.reset}`);
  }
  
  // 3. Check if character already exists
  console.log(`Checking if ${character.name} already exists...`);
  const { data: existingChar, error: checkError } = await supabase
    .from('characters')
    .select('id, name')
    .eq('name', character.name)
    .single();
  
  if (!checkError && existingChar) {
    console.log(`${COLORS.yellow}⚠️ Character "${character.name}" already exists (ID: ${existingChar.id})${COLORS.reset}`);
    console.log(`${COLORS.yellow}Updating existing character...${COLORS.reset}`);
    
    // Update existing character
    const { data: updated, error: updateError } = await supabase
      .from('characters')
      .update({
        ...character,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingChar.id)
      .select('*')
      .single();
    
    if (updateError) {
      console.log(`${COLORS.red}❌ Failed to update ${character.name}: ${updateError.message}${COLORS.reset}`);
      return { success: false, character, error: updateError.message };
    }
    
    console.log(`${COLORS.green}✅ Successfully updated ${updated.name} (ID: ${updated.id})${COLORS.reset}`);
    return { success: true, character: updated, updated: true };
  }
  
  // 4. Insert new character
  console.log(`Inserting new character "${character.name}"...`);
  
  try {
    // Ensure relationships is properly formatted as a string if it's an object
    const characterToInsert = {
      ...character,
      relationships: typeof character.relationships === 'object' 
        ? JSON.stringify(character.relationships) 
        : character.relationships,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data: inserted, error: insertError } = await supabase
      .from('characters')
      .insert(characterToInsert)
      .select('*')
      .single();
    
    if (insertError) {
      console.log(`${COLORS.red}❌ Failed to insert ${character.name}: ${insertError.message}${COLORS.reset}`);
      return { success: false, character, error: insertError.message };
    }
    
    console.log(`${COLORS.green}✅ Successfully created ${inserted.name} (ID: ${inserted.id})${COLORS.reset}`);
    return { success: true, character: inserted, inserted: true };
  } catch (error) {
    console.log(`${COLORS.red}❌ Exception creating ${character.name}: ${error.message}${COLORS.reset}`);
    return { success: false, character, error: error.message };
  }
}

/**
 * Main function to create all characters
 */
async function createFinalCharacters() {
  console.log(`${COLORS.bright}${COLORS.blue}=== CREATING FINAL BIBLE CHARACTERS ===\n${COLORS.reset}`);
  
  try {
    // 1. Check if we can connect to Supabase
    console.log(`${COLORS.cyan}Checking database connection...${COLORS.reset}`);
    const { data: connectionTest, error: connectionError } = await supabase
      .from('characters')
      .select('count');
    
    if (connectionError) {
      console.error(`${COLORS.red}❌ Database connection failed: ${connectionError.message}${COLORS.reset}`);
      return;
    }
    
    console.log(`${COLORS.green}✅ Database connection successful${COLORS.reset}\n`);
    
    // 2. Create each character
    console.log(`${COLORS.bright}=== CREATING CHARACTERS ===\n${COLORS.reset}`);
    const results = [];
    
    for (const character of CHARACTERS) {
      const result = await createCharacter(character);
      results.push(result);
    }
    
    // 3. Summary
    console.log(`\n${COLORS.bright}=== CREATION SUMMARY ===\n${COLORS.reset}`);
    
    const successful = results.filter(r => r.success).length;
    const inserted = results.filter(r => r.success && r.inserted).length;
    const updated = results.filter(r => r.success && r.updated).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`Total characters processed: ${results.length}`);
    console.log(`Successfully created/updated: ${successful} (${inserted} inserted, ${updated} updated)`);
    console.log(`Failed: ${failed}`);
    
    if (failed > 0) {
      console.log(`\n${COLORS.red}${COLORS.bright}FAILED CHARACTERS:${COLORS.reset}`);
      results.filter(r => !r.success).forEach(r => {
        console.log(`- ${r.character.name}: ${r.error}`);
      });
    }
    
    if (successful === CHARACTERS.length) {
      console.log(`\n${COLORS.bgGreen}${COLORS.bright} ALL CHARACTERS CREATED SUCCESSFULLY! ${COLORS.reset}`);
      console.log(`${COLORS.green}The characters should now appear on the home page with proper images.${COLORS.reset}`);
      console.log(`${COLORS.yellow}You may need to refresh your browser to see the changes.${COLORS.reset}`);
      
      // Print the character details for reference
      console.log(`\n${COLORS.bright}Character details for reference:${COLORS.reset}`);
      results.filter(r => r.success).forEach(r => {
        const char = r.character;
        console.log(`- ${char.name} (ID: ${char.id})`);
        console.log(`  Testament: ${char.testament}`);
        console.log(`  Visibility: ${char.is_visible ? 'Visible' : 'Not visible'}`);
        console.log(`  Avatar: ${char.avatar_url}`);
        console.log(`  Feature image: ${char.feature_image_url}`);
        console.log();
      });
    } else {
      console.log(`\n${COLORS.bgRed}${COLORS.bright} SOME CHARACTERS FAILED TO CREATE ${COLORS.reset}`);
      console.log(`${COLORS.yellow}Please check the error messages above and try again.${COLORS.reset}`);
    }
    
    console.log(`\n${COLORS.bright}${COLORS.blue}=== CREATION COMPLETE ===\n${COLORS.reset}`);
    
  } catch (err) {
    console.error(`${COLORS.red}${COLORS.bright} UNEXPECTED ERROR: ${err.message} ${COLORS.reset}`);
    console.error(err);
  }
}

// Run the main function
createFinalCharacters().catch(err => {
  console.error(`Fatal error:`, err);
  process.exit(1);
});
