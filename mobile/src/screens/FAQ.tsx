import React, { useState } from 'react';
import { SafeAreaView, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme';

type FAQ = {
  id: string;
  category: string;
  question: string;
  answer: string;
};

const defaultFaqs: FAQ[] = [
  // General
  { id: 'default-1', category: 'General', question: 'What is FaithTalkAI?', answer: 'FaithTalkAI is an AI-powered platform that lets you have meaningful conversations with Biblical characters, explore guided Bible studies and reading plans, and participate in roundtable discussions with multiple characters at once.' },
  { id: 'default-2', category: 'General', question: 'Is this a replacement for Bible study?', answer: 'No. FaithTalkAI is designed to supplement your faith journey, not replace traditional Bible study, church attendance, or pastoral counsel. Think of it as a companion tool to help you engage with Scripture in a new and interactive way.' },
  { id: 'default-3', category: 'General', question: 'How accurate are the character responses?', answer: 'Our AI characters are trained on Biblical scripture and historical context to provide thoughtful, scripturally-grounded responses. However, they are AI interpretations and should not be considered authoritative theological sources. Always refer to Scripture and trusted spiritual leaders for guidance.' },
  
  // Features
  { id: 'default-4', category: 'Features', question: 'How many characters can I chat with?', answer: 'We have over 50 Biblical characters available, including figures from both the Old and New Testaments such as Moses, David, Paul, Mary, and many more.' },
  { id: 'default-5', category: 'Features', question: 'What is a Roundtable discussion?', answer: 'A Roundtable brings multiple Biblical characters together to discuss a topic from their unique perspectives. You can select 2-5 characters and watch them engage with each other and with you on topics like faith, forgiveness, leadership, and more.' },
  { id: 'default-6', category: 'Features', question: 'What are Bible Studies?', answer: 'Our guided Bible Studies are multi-lesson journeys through Scripture with AI-powered conversation. Each lesson includes a reading passage, discussion questions, and the ability to chat with a relevant Biblical character about what you\'re learning.' },
  { id: 'default-7', category: 'Features', question: 'What are Reading Plans?', answer: 'Reading Plans help you establish a daily Bible reading habit. Choose from various plans covering topics like foundational readings, book studies, topical studies, and more. Track your progress and pick up where you left off.' },
  { id: 'default-8', category: 'Features', question: 'What is My Walk?', answer: 'My Walk is your personal dashboard (Premium feature) where you can view all your saved conversations, continue past chats, track your Bible study and reading plan progress, and see your spiritual journey at a glance.' },
  
  // Account & Pricing
  { id: 'default-9', category: 'Account & Pricing', question: 'What\'s included in the free plan?', answer: 'Free accounts get unlimited conversations with all characters. However, you won\'t be able to access your conversation history later or use premium features like My Walk, Roundtables, and Invite Friends.' },
  { id: 'default-10', category: 'Account & Pricing', question: 'What does Premium include?', answer: 'Premium ($5.99/month or $59.99/year) unlocks My Walk dashboard to access all your saved conversations, Roundtable discussions with multiple characters, the ability to invite friends to conversations, and priority support.' },
  { id: 'default-11', category: 'Account & Pricing', question: 'How do I upgrade to Premium?', answer: 'Tap the "Upgrade" button in the app or visit our Pricing page. You can subscribe monthly or yearly through the App Store (iOS) or directly through our website.' },
  { id: 'default-12', category: 'Account & Pricing', question: 'Can I cancel my subscription?', answer: 'Yes, you can cancel anytime. For iOS subscriptions, manage them in your Apple ID settings. For web subscriptions, visit your account settings. You\'ll retain Premium access until the end of your billing period.' },
  
  // Technical
  { id: 'default-13', category: 'Technical', question: 'Is my data private?', answer: 'Yes. Your conversations are private and stored securely. We do not share your personal conversations with third parties. See our Privacy Policy for full details.' },
  { id: 'default-14', category: 'Technical', question: 'Can I use FaithTalkAI on multiple devices?', answer: 'Yes! Sign in with the same account on any device - iOS app or web browser - and your account and Premium status will sync across all devices.' },
  { id: 'default-15', category: 'Technical', question: 'What if I encounter a problem?', answer: 'Contact us at support@FaithTalkAI.com and we\'ll help you resolve any issues. You can also use the Contact form on our website.' },
];

const categories = ['General', 'Features', 'Account & Pricing', 'Technical'];

export default function FAQ() {
  const navigation = useNavigation<any>();
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});

  const toggleQuestion = (id: string) => {
    setExpandedQuestions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getFaqsByCategory = (category: string) => {
    return defaultFaqs.filter(f => f.category === category);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ color: theme.colors.accent, fontSize: 24, fontWeight: '800', fontFamily: 'Cinzel_700Bold' }}>
            FAQ
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={{ color: theme.colors.primary, fontSize: 16, fontWeight: '600' }}>← Back</Text>
          </TouchableOpacity>
        </View>

        <Text style={{ color: theme.colors.muted, fontSize: 14, marginBottom: 20 }}>
          Find answers to commonly asked questions about FaithTalkAI.
        </Text>

        {/* FAQ Categories */}
        {categories.map(category => (
          <View key={category} style={{ marginBottom: 24 }}>
            <Text style={{ 
              color: theme.colors.accent, 
              fontSize: 18, 
              fontWeight: '700', 
              marginBottom: 12,
              fontFamily: 'Cinzel_700Bold'
            }}>
              {category}
            </Text>

            {getFaqsByCategory(category).map(faq => (
              <View 
                key={faq.id} 
                style={{ 
                  backgroundColor: theme.colors.card, 
                  borderRadius: 10, 
                  marginBottom: 8,
                  borderWidth: 1,
                  borderColor: theme.colors.border
                }}
              >
                <TouchableOpacity 
                  onPress={() => toggleQuestion(faq.id)}
                  style={{ 
                    padding: 14, 
                    flexDirection: 'row', 
                    justifyContent: 'space-between', 
                    alignItems: 'center' 
                  }}
                >
                  <Text style={{ 
                    color: theme.colors.text, 
                    fontSize: 15, 
                    fontWeight: '600',
                    flex: 1,
                    marginRight: 8
                  }}>
                    {faq.question}
                  </Text>
                  <Text style={{ color: theme.colors.primary, fontSize: 18 }}>
                    {expandedQuestions[faq.id] ? '−' : '+'}
                  </Text>
                </TouchableOpacity>

                {expandedQuestions[faq.id] && (
                  <View style={{ 
                    paddingHorizontal: 14, 
                    paddingBottom: 14,
                    borderTopWidth: 1,
                    borderTopColor: theme.colors.border
                  }}>
                    <Text style={{ 
                      color: theme.colors.muted, 
                      fontSize: 14, 
                      lineHeight: 20,
                      marginTop: 10
                    }}>
                      {faq.answer}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        ))}

        {/* Contact Section */}
        <View style={{ 
          backgroundColor: theme.colors.card, 
          borderRadius: 10, 
          padding: 16,
          borderWidth: 1,
          borderColor: theme.colors.border,
          alignItems: 'center'
        }}>
          <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
            Still have questions?
          </Text>
          <Text style={{ color: theme.colors.muted, fontSize: 14, textAlign: 'center' }}>
            Contact us at support@FaithTalkAI.com
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
