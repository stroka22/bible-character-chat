#!/usr/bin/env node

/**
 * generate_mock_responses.js
 * 
 * This script generates realistic mock responses for Bible characters to use
 * when the OpenAI API is not available or fails. It creates character-specific
 * responses that match their biblical personality and writing style.
 * 
 * Usage: node generate_mock_responses.js
 * 
 * The script will generate a mockResponses.json file in the src/data directory
 * that can be imported and used by the application.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name using ES modules approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define output path
const outputDir = path.join(__dirname, 'src', 'data');
const outputFile = path.join(outputDir, 'mockResponses.json');

// Character-specific response styles and patterns
const characterStyles = {
  Jesus: {
    openings: [
      "Truly, I tell you, ",
      "Consider this: ",
      "Listen carefully: ",
      "My child, ",
      "As it is written, ",
      "The Kingdom of Heaven is like ",
      "Blessed are those who ",
    ],
    closings: [
      "Let those with ears hear.",
      "Go and do likewise.",
      "Your faith has much to teach you.",
      "Peace be with you.",
      "Remember these words.",
      "This is the way of my Father's kingdom.",
    ],
    metaphors: [
      "like a shepherd searching for the lost sheep",
      "as seeds falling on different soils",
      "like the light of the world",
      "as the living water",
      "like the narrow gate",
      "as branches connected to the vine",
    ],
    style: "parables, questions that lead to reflection, references to scripture, compassionate tone, focus on love and forgiveness"
  },
  Paul: {
    openings: [
      "Brothers and sisters, ",
      "I urge you, therefore, ",
      "Consider what I say: ",
      "As I have written before, ",
      "Remember this truth: ",
      "In Christ, we know that ",
      "By grace, ",
    ],
    closings: [
      "Stand firm in the faith.",
      "May the grace of our Lord Jesus Christ be with you.",
      "Test everything; hold fast to what is good.",
      "I have fought the good fight; I encourage you to do the same.",
      "Remember me in your prayers as I remember you.",
    ],
    metaphors: [
      "like a race that must be run with perseverance",
      "as one body with many parts",
      "like putting on the full armor of God",
      "as clay in the potter's hands",
      "like a soldier serving Christ",
    ],
    style: "logical arguments, rhetorical questions, personal testimony, theological depth, references to his own struggles"
  },
  Moses: {
    openings: [
      "Hear, O Israel: ",
      "Thus says the LORD: ",
      "As God commanded, ",
      "Remember what the LORD has done: ",
      "These are the words of the covenant: ",
      "Listen to the statutes and judgments: ",
    ],
    closings: [
      "May you always follow the LORD's commands.",
      "Keep these words in your heart.",
      "The LORD will be with you; do not be afraid.",
      "Choose life, that you and your descendants may live.",
      "Be strong and courageous, for the LORD goes with you.",
    ],
    metaphors: [
      "like the pillar of cloud by day and fire by night",
      "as the manna from heaven",
      "like crossing through the sea on dry ground",
      "as the tablets of stone with God's own writing",
      "like a shepherd leading his flock through the wilderness",
    ],
    style: "authoritative declarations, references to the Law, historical recounting, focus on covenant, obedience and God's faithfulness"
  }
};

// Generate general responses for each character
const generateGeneralResponses = (character, style) => {
  const greetings = [
    `${style.openings[0]}I greet you with peace.`,
    `${style.openings[1]}It is good to speak with you today.`,
    `${style.openings[2]}I welcome your questions and thoughts.`,
    `May God's wisdom guide our conversation.`,
    `I am here to share what I have learned through my journey with God.`
  ];

  const uncertainties = [
    `${style.openings[0]}Some matters remain mysteries that only God fully understands.`,
    `${style.openings[1]}Not all is revealed to us in this life.`,
    `${style.openings[2]}I cannot speak with certainty on matters not revealed to me.`,
    `We see through a glass darkly on such matters.`,
    `God's ways are higher than our ways, and His thoughts than our thoughts.`
  ];

  const encouragements = [
    `${style.openings[0]}Take heart and be of good courage.`,
    `${style.openings[1]}God is with you, even in your struggles.`,
    `${style.openings[2]}Faith can move mountains, but first it must move our hearts.`,
    `Trust in the LORD with all your heart and lean not on your own understanding.`,
    `Remember that God works all things together for good for those who love Him.`
  ];

  const challenges = [
    `${style.openings[0]}Examine your heart and consider your ways.`,
    `${style.openings[1]}The path of righteousness is not always easy, but it is always right.`,
    `${style.openings[2]}What does the Lord require of you but to do justice, love mercy, and walk humbly with your God?`,
    `Let your actions reflect your faith, for faith without works is dead.`,
    `Consider how you might serve others as God has served you.`
  ];

  return {
    greetings,
    uncertainties,
    encouragements,
    challenges
  };
};

// Generate responses to common questions for each character
const generateCommonResponses = (character, style) => {
  const responses = {};

  // Questions about salvation
  responses.salvation = [
    `${style.openings[0]}Salvation comes through faith in God's promises. ${style.closings[0]}`,
    `${style.openings[1]}God desires that all would turn to Him and live. ${style.closings[1]}`,
    `${style.openings[2]}The path to life is found in following God's ways. ${style.closings[2]}`,
    `Seek the LORD while He may be found; call on Him while He is near. ${style.closings[3]}`,
    `Repentance and faith are the beginning of the journey with God. ${style.closings[4]}`
  ];

  // Questions about suffering
  responses.suffering = [
    `${style.openings[0]}Suffering is part of our broken world, but God remains present in it. ${style.closings[0]}`,
    `${style.openings[1]}Even in our darkest moments, God's light can still be found. ${style.closings[1]}`,
    `${style.openings[2]}God does not promise absence of suffering, but presence in suffering. ${style.closings[2]}`,
    `The question is not why suffering exists, but how we respond to it in faith. ${style.closings[3]}`,
    `In suffering, we may find ourselves closest to understanding God's heart. ${style.closings[4]}`
  ];

  // Questions about prayer
  responses.prayer = [
    `${style.openings[0]}Prayer is conversation with God, speaking and listening with an open heart. ${style.closings[0]}`,
    `${style.openings[1]}Approach God with reverence and honesty in your prayers. ${style.closings[1]}`,
    `${style.openings[2]}Prayer aligns our hearts with God's will rather than bending God's will to ours. ${style.closings[2]}`,
    `Pray without ceasing, in all circumstances, with thanksgiving. ${style.closings[3]}`,
    `Prayer is both a duty and a privilege, a lifeline to the divine. ${style.closings[4]}`
  ];

  // Questions about purpose
  responses.purpose = [
    `${style.openings[0]}Your purpose is to know God and to make Him known. ${style.closings[0]}`,
    `${style.openings[1]}God has created you for good works, prepared beforehand. ${style.closings[1]}`,
    `${style.openings[2]}Seek first the kingdom of God, and all these things will be added to you. ${style.closings[2]}`,
    `Your life is a testimony to God's faithfulness and love. ${style.closings[3]}`,
    `In serving others, you fulfill part of your divine purpose. ${style.closings[4]}`
  ];

  // Questions about faith
  responses.faith = [
    `${style.openings[0]}Faith is the assurance of things hoped for, the conviction of things not seen. ${style.closings[0]}`,
    `${style.openings[1]}Faith grows through testing, like gold refined by fire. ${style.closings[1]}`,
    `${style.openings[2]}Walk by faith, not by sight, trusting God's promises. ${style.closings[2]}`,
    `Faith is a journey of trust, with steps both certain and uncertain. ${style.closings[3]}`,
    `Without faith it is impossible to please God, for whoever would draw near to Him must believe that He exists and rewards those who seek Him. ${style.closings[4]}`
  ];

  return responses;
};

// Character-specific responses
const generateCharacterSpecificResponses = () => {
  // Jesus-specific responses
  const jesus = {
    identity: [
      "I am the way, the truth, and the life. No one comes to the Father except through me.",
      "Before Abraham was, I am.",
      "I and the Father are one.",
      "I am the good shepherd. The good shepherd lays down his life for the sheep.",
      "I am the bread of life; whoever comes to me shall not hunger, and whoever believes in me shall never thirst."
    ],
    miracles: [
      "The works that I do in my Father's name bear witness about me.",
      "If I am not doing the works of my Father, then do not believe me; but if I do them, even though you do not believe me, believe the works.",
      "These signs are written so that you may believe that I am the Christ, the Son of God.",
      "With God, all things are possible.",
      "Your faith has made you well. Go in peace."
    ],
    forgiveness: [
      "Neither do I condemn you; go, and from now on sin no more.",
      "Forgive, and you will be forgiven.",
      "If you forgive others their trespasses, your heavenly Father will also forgive you.",
      "Love your enemies and pray for those who persecute you.",
      "Father, forgive them, for they know not what they do."
    ]
  };

  // Paul-specific responses
  const paul = {
    conversion: [
      "I was once a blasphemer, persecutor, and insolent opponent. But I received mercy because I had acted ignorantly in unbelief.",
      "By the grace of God I am what I am, and his grace toward me was not in vain.",
      "It is no longer I who live, but Christ who lives in me.",
      "I count everything as loss because of the surpassing worth of knowing Christ Jesus my Lord.",
      "This one thing I do: forgetting what lies behind and straining forward to what lies ahead, I press on toward the goal for the prize of the upward call of God in Christ Jesus."
    ],
    church: [
      "You are the body of Christ and individually members of it.",
      "Let all things be done for building up the church.",
      "There are varieties of gifts, but the same Spirit; and there are varieties of service, but the same Lord.",
      "We, though many, are one body in Christ, and individually members one of another.",
      "The church is the pillar and buttress of the truth."
    ],
    grace: [
      "By grace you have been saved through faith. And this is not your own doing; it is the gift of God.",
      "Where sin increased, grace abounded all the more.",
      "My grace is sufficient for you, for my power is made perfect in weakness.",
      "We are justified by his grace as a gift, through the redemption that is in Christ Jesus.",
      "The grace of the Lord Jesus Christ and the love of God and the fellowship of the Holy Spirit be with you all."
    ]
  };

  // Moses-specific responses
  const moses = {
    law: [
      "These commandments that I give you today are to be on your hearts.",
      "Keep the decrees and laws that I am setting before you today, so that you may live.",
      "Be careful to follow every command I am giving you today, so that you may live and increase.",
      "Do not add to what I command you and do not subtract from it, but keep the commands of the LORD your God.",
      "The LORD is our God, the LORD alone. Love the LORD your God with all your heart and with all your soul and with all your strength."
    ],
    exodus: [
      "The LORD brought us out of Egypt with a mighty hand and an outstretched arm, with great terror and with signs and wonders.",
      "Remember this day in which you came out from Egypt, out of the house of slavery, for by a strong hand the LORD brought you out from this place.",
      "I have seen the affliction of my people, and have heard their cry, and I have come down to deliver them.",
      "The LORD will fight for you; you need only to be still.",
      "By faith we passed through the Red Sea as on dry land; but when the Egyptians tried to do so, they were drowned."
    ],
    leadership: [
      "Who am I that I should go to Pharaoh and bring the children of Israel out of Egypt?",
      "O Lord, I have never been eloquent, neither in the past nor since you have spoken to your servant.",
      "The LORD your God will raise up for you a prophet like me from among you, from your brothers—it is to him you shall listen.",
      "Teach these things to your children and to their children after them.",
      "Be strong and courageous. Do not be afraid or terrified because of them, for the LORD your God goes with you; he will never leave you nor forsake you."
    ]
  };

  return {
    Jesus: jesus,
    Paul: paul,
    Moses: moses
  };
};

// Generate fallback responses for when no specific response matches
const generateFallbackResponses = () => {
  return {
    Jesus: [
      "Consider what is in your heart as you ask this.",
      "The Kingdom of Heaven is at hand. Seek first His righteousness.",
      "My Father is still working, and I am working.",
      "What does the Scripture say about this matter?",
      "Let your faith guide you in this question."
    ],
    Paul: [
      "In all things, seek to glorify God and edify one another.",
      "Test everything; hold fast what is good.",
      "Let us walk by the Spirit, and not gratify the desires of the flesh.",
      "Whatever is true, whatever is honorable, whatever is just, whatever is pure, whatever is lovely, whatever is commendable—think about these things.",
      "I do not claim to have all wisdom, but I share what has been revealed to me."
    ],
    Moses: [
      "Remember the LORD your God and keep His commandments.",
      "The LORD will guide you if you seek His will.",
      "Consider the history of God's faithfulness to His people.",
      "These matters should be approached with reverence for the LORD.",
      "Look to the Law that the LORD has given for guidance."
    ]
  };
};

// Combine all responses into a single object
const generateAllResponses = () => {
  const mockResponses = {};
  
  // Generate responses for each character
  for (const [character, style] of Object.entries(characterStyles)) {
    mockResponses[character] = {
      general: generateGeneralResponses(character, style),
      common: generateCommonResponses(character, style),
      specific: {},
    };
  }
  
  // Add character-specific responses
  const specificResponses = generateCharacterSpecificResponses();
  for (const character of Object.keys(characterStyles)) {
    mockResponses[character].specific = specificResponses[character];
  }
  
  // Add fallback responses
  mockResponses.fallback = generateFallbackResponses();
  
  return mockResponses;
};

// Main function to generate and save mock responses
async function generateMockResponses() {
  try {
    console.log('Generating mock responses for Bible characters...');
    
    const mockResponses = generateAllResponses();
    
    // Create directory if it doesn't exist
    try {
      await fs.mkdir(outputDir, { recursive: true });
    } catch (err) {
      if (err.code !== 'EEXIST') {
        throw err;
      }
    }
    
    // Write responses to file
    await fs.writeFile(
      outputFile,
      JSON.stringify(mockResponses, null, 2),
      'utf8'
    );
    
    console.log(`Mock responses successfully generated and saved to ${outputFile}`);
    console.log('These responses will be used when the OpenAI API is unavailable.');
    
    // Return the responses for testing
    return mockResponses;
  } catch (error) {
    console.error('Error generating mock responses:', error);
    throw error;
  }
}

// Execute the function if this file is run directly
if (import.meta.url === `file://${__filename}`) {
  generateMockResponses()
    .then(() => {
      console.log('Done!');
    })
    .catch((error) => {
      console.error('Failed to generate mock responses:', error);
      process.exit(1);
    });
}

// Export for use in other modules
export { generateMockResponses };
