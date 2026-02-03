import React, { useState } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme';

type TabId = 'chat' | 'roundtable' | 'studies' | 'plans';

const tabs: { id: TabId; label: string; icon: string }[] = [
  { id: 'chat', label: 'Character Chat', icon: '💬' },
  { id: 'roundtable', label: 'Roundtable', icon: '👥' },
  { id: 'studies', label: 'Bible Studies', icon: '📖' },
  { id: 'plans', label: 'Reading Plans', icon: '📅' },
];

const content: Record<TabId, {
  title: string;
  description: string;
  steps: { title: string; desc: string }[];
  ctaLabel: string;
  ctaScreen: string;
}> = {
  chat: {
    title: 'One-on-One Character Conversations',
    description: 'Have meaningful conversations with over 90 biblical characters. Ask questions, seek wisdom, and explore their stories in a personal way.',
    steps: [
      { title: 'Choose a Character', desc: 'Browse our library of biblical figures from both Old and New Testaments' },
      { title: 'Start a Conversation', desc: 'Ask questions, discuss life situations, or explore their biblical stories' },
      { title: 'Save & Share', desc: 'Save conversations, share insights, and invite friends to join your discussions' },
    ],
    ctaLabel: 'Start Chatting',
    ctaScreen: 'Chat',
  },
  roundtable: {
    title: 'Multi-Character Discussions',
    description: 'Bring multiple biblical characters together for a roundtable discussion on any topic. See different perspectives and gain deeper understanding.',
    steps: [
      { title: 'Choose Your Topic', desc: 'Enter any question or topic you want to explore' },
      { title: 'Select Characters', desc: 'Pick 2-5 biblical figures to participate in the discussion' },
      { title: 'Watch the Discussion', desc: 'Characters share their perspectives based on their biblical experiences' },
    ],
    ctaLabel: 'Start a Roundtable',
    ctaScreen: 'RoundtableSetup',
  },
  studies: {
    title: 'Character-Guided Bible Studies',
    description: 'Go through structured Bible studies with a biblical character as your guide. Learn Scripture in context with interactive lessons.',
    steps: [
      { title: 'Browse Studies', desc: 'Choose from 35+ studies on various books, topics, and themes' },
      { title: 'Meet Your Guide', desc: 'Each study features a character narrator who lived the story' },
      { title: 'Complete Lessons', desc: 'Work through lessons at your own pace, tracking your progress' },
    ],
    ctaLabel: 'Browse Studies',
    ctaScreen: 'Studies',
  },
  plans: {
    title: 'Structured Reading Plans',
    description: 'Follow curated reading plans to systematically read through Scripture. Perfect for building consistent Bible reading habits.',
    steps: [
      { title: 'Choose a Plan', desc: 'Select from 140+ plans covering different books, topics, and timeframes' },
      { title: 'Daily Readings', desc: 'Get your daily Scripture passages with educational context' },
      { title: 'Track Progress', desc: 'Mark readings complete and see your journey through the plan' },
    ],
    ctaLabel: 'Explore Plans',
    ctaScreen: 'Plans',
  },
};

const stats = [
  { num: '90+', label: 'Biblical Characters' },
  { num: '35+', label: 'Bible Studies' },
  { num: '140+', label: 'Reading Plans' },
  { num: '9', label: 'Translations' },
];

const shareFeatures = [
  { icon: '💾', title: 'Save Conversations', desc: 'Keep meaningful discussions to revisit later' },
  { icon: '📤', title: 'Share Insights', desc: 'Share powerful conversations with friends' },
  { icon: '👥', title: 'Invite Friends', desc: 'Invite others to join your conversations' },
];

export default function HowItWorks() {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<TabId>('chat');
  const current = content[activeTab];

  const handleCTA = () => {
    if (current.ctaScreen === 'Chat') {
      navigation.navigate('MainTabs', { screen: 'Chat', params: { screen: 'ChatNew' } });
    } else if (current.ctaScreen === 'RoundtableSetup') {
      navigation.navigate('RoundtableSetup');
    } else {
      navigation.navigate('MainTabs', { screen: current.ctaScreen });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: '700', color: theme.colors.accent, fontFamily: 'Cinzel_700Bold', textAlign: 'center' }}>
            How FaithTalkAI Works
          </Text>
          <Text style={{ color: theme.colors.muted, marginTop: 8, textAlign: 'center' }}>
            Four powerful ways to engage with Scripture
          </Text>
        </View>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {tabs.map(tab => (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 20,
                  backgroundColor: activeTab === tab.id ? theme.colors.primary : theme.colors.card,
                  borderWidth: activeTab === tab.id ? 0 : 1,
                  borderColor: theme.colors.border,
                }}
              >
                <Text style={{
                  color: activeTab === tab.id ? theme.colors.primaryText : theme.colors.text,
                  fontWeight: '600',
                  fontSize: 13,
                }}>
                  {tab.icon} {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Current Feature Content */}
        <View style={{ backgroundColor: theme.colors.card, borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: theme.colors.border }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.accent, marginBottom: 8, textAlign: 'center' }}>
            {current.title}
          </Text>
          <Text style={{ color: theme.colors.muted, textAlign: 'center', marginBottom: 16, lineHeight: 20 }}>
            {current.description}
          </Text>

          {/* Steps */}
          {current.steps.map((step, i) => (
            <View key={i} style={{ flexDirection: 'row', marginBottom: 12, alignItems: 'flex-start' }}>
              <View style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: theme.colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}>
                <Text style={{ color: theme.colors.primaryText, fontWeight: '700' }}>{i + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.colors.text, fontWeight: '700', marginBottom: 2 }}>{step.title}</Text>
                <Text style={{ color: theme.colors.muted, fontSize: 13, lineHeight: 18 }}>{step.desc}</Text>
              </View>
            </View>
          ))}

          {/* CTA Button */}
          <TouchableOpacity
            onPress={handleCTA}
            style={{
              backgroundColor: theme.colors.primary,
              paddingVertical: 14,
              borderRadius: 10,
              alignItems: 'center',
              marginTop: 8,
            }}
          >
            <Text style={{ color: theme.colors.primaryText, fontWeight: '700', fontSize: 16 }}>
              {current.ctaLabel} →
            </Text>
          </TouchableOpacity>
        </View>

        {/* Share the Journey */}
        <View style={{ backgroundColor: theme.colors.surface, borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: theme.colors.border }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.accent, marginBottom: 4, textAlign: 'center', fontFamily: 'Cinzel_700Bold' }}>
            Share the Journey
          </Text>
          <Text style={{ color: theme.colors.muted, textAlign: 'center', marginBottom: 16 }}>
            Faith is better together
          </Text>
          
          {shareFeatures.map((feature, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 24, marginRight: 12 }}>{feature.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.colors.text, fontWeight: '600' }}>{feature.title}</Text>
                <Text style={{ color: theme.colors.muted, fontSize: 13 }}>{feature.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Stats */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 }}>
          {stats.map((stat, i) => (
            <View key={i} style={{
              width: '48%',
              backgroundColor: theme.colors.card,
              borderRadius: 10,
              padding: 14,
              alignItems: 'center',
              marginBottom: 10,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}>
              <Text style={{ fontSize: 24, fontWeight: '700', color: theme.colors.primary }}>{stat.num}</Text>
              <Text style={{ color: theme.colors.muted, fontSize: 12 }}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Back to Home */}
        <TouchableOpacity
          onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
          style={{
            backgroundColor: theme.colors.card,
            paddingVertical: 14,
            borderRadius: 10,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <Text style={{ color: theme.colors.text, fontWeight: '600' }}>← Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
