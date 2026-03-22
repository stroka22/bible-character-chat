import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const defaultFaqs = [
  // General
  { order_index: 1, category: 'General', question: 'What is FaithTalkAI?', answer: 'FaithTalkAI is an AI-powered platform that lets you have meaningful conversations with Biblical characters, explore guided Bible studies and reading plans, and participate in roundtable discussions with multiple characters at once.' },
  { order_index: 2, category: 'General', question: 'Is this a replacement for Bible study?', answer: 'No. FaithTalkAI is designed to supplement your faith journey, not replace traditional Bible study, church attendance, or pastoral counsel. Think of it as a companion tool to help you engage with Scripture in a new and interactive way.' },
  { order_index: 3, category: 'General', question: 'How accurate are the character responses?', answer: 'Our AI characters are trained on Biblical scripture and historical context to provide thoughtful, scripturally-grounded responses. However, they are AI interpretations and should not be considered authoritative theological sources. Always refer to Scripture and trusted spiritual leaders for guidance.' },
  
  // Features
  { order_index: 4, category: 'Features', question: 'How many characters can I chat with?', answer: 'We have over 50 Biblical characters available, including figures from both the Old and New Testaments such as Moses, David, Paul, Mary, and many more.' },
  { order_index: 5, category: 'Features', question: 'What is a Roundtable discussion?', answer: 'A Roundtable brings multiple Biblical characters together to discuss a topic from their unique perspectives. You can select 2-5 characters and watch them engage with each other and with you on topics like faith, forgiveness, leadership, and more.' },
  { order_index: 6, category: 'Features', question: 'What are Bible Studies?', answer: "Our guided Bible Studies are multi-lesson journeys through Scripture with AI-powered conversation. Each lesson includes a reading passage, discussion questions, and the ability to chat with a relevant Biblical character about what you're learning." },
  { order_index: 7, category: 'Features', question: 'What are Reading Plans?', answer: 'Reading Plans help you establish a daily Bible reading habit. Choose from various plans covering topics like foundational readings, book studies, topical studies, and more. Track your progress and pick up where you left off.' },
  { order_index: 8, category: 'Features', question: 'What is My Walk?', answer: 'My Walk is your personal dashboard (Premium feature) where you can view all your saved conversations, continue past chats, track your Bible study and reading plan progress, and see your spiritual journey at a glance.' },
  
  // Account & Pricing
  { order_index: 9, category: 'Account & Pricing', question: "What's included in the free plan?", answer: "Free accounts get unlimited conversations with all characters. However, you won't be able to access your conversation history later or use premium features like My Walk, Roundtables, and Invite Friends." },
  { order_index: 10, category: 'Account & Pricing', question: 'What does Premium include?', answer: 'Premium ($5.99/month or $59.99/year) unlocks My Walk dashboard to access all your saved conversations, Roundtable discussions with multiple characters, the ability to invite friends to conversations, and priority support.' },
  { order_index: 11, category: 'Account & Pricing', question: 'How do I upgrade to Premium?', answer: 'Tap the "Upgrade" button in the app or visit our Pricing page. You can subscribe monthly or yearly through the App Store (iOS) or directly through our website.' },
  { order_index: 12, category: 'Account & Pricing', question: 'Can I cancel my subscription?', answer: "Yes, you can cancel anytime. For iOS subscriptions, manage them in your Apple ID settings. For web subscriptions, visit your account settings. You'll retain Premium access until the end of your billing period." },
  
  // Technical
  { order_index: 13, category: 'Technical', question: 'Is my data private?', answer: 'Yes. Your conversations are private and stored securely. We do not share your personal conversations with third parties. See our Privacy Policy for full details.' },
  { order_index: 14, category: 'Technical', question: 'Can I use FaithTalkAI on multiple devices?', answer: 'Yes! Sign in with the same account on any device - iOS app or web browser - and your account and Premium status will sync across all devices.' },
  { order_index: 15, category: 'Technical', question: 'What if I encounter a problem?', answer: 'Contact us at support@FaithTalkAI.com and we\'ll help you resolve any issues. You can also use the Contact form on our website.' },
];

async function seedFaqs() {
  console.log('Seeding FAQs...');
  
  for (const faq of defaultFaqs) {
    // Check if FAQ with same question exists
    const { data: existing } = await supabase
      .from('faqs')
      .select('id')
      .ilike('question', faq.question)
      .maybeSingle();
    
    if (existing) {
      // Update existing
      const { error } = await supabase
        .from('faqs')
        .update({
          answer: faq.answer,
          category: faq.category,
          order_index: faq.order_index,
          is_published: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);
      
      if (error) {
        console.error(`Error updating "${faq.question}":`, error.message);
      } else {
        console.log(`Updated: ${faq.question}`);
      }
    } else {
      // Insert new
      const { error } = await supabase
        .from('faqs')
        .insert({
          question: faq.question,
          answer: faq.answer,
          category: faq.category,
          order_index: faq.order_index,
          is_published: true
        });
      
      if (error) {
        console.error(`Error inserting "${faq.question}":`, error.message);
      } else {
        console.log(`Inserted: ${faq.question}`);
      }
    }
  }
  
  console.log('Done!');
}

seedFaqs();
