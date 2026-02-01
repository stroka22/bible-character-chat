import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import FooterScroll from '../components/FooterScroll';
import PreviewLayout from '../components/PreviewLayout';
import { ScrollWrap, ScrollDivider, ScrollBackground } from '../components/ScrollWrap';

const HowItWorksPageScroll = () => {
  const [activeTab, setActiveTab] = useState('chat');

  const tabs = [
    { id: 'chat', label: 'Character Chat', icon: '💬' },
    { id: 'roundtable', label: 'Roundtable', icon: '👥' },
    { id: 'studies', label: 'Bible Studies', icon: '📖' },
    { id: 'plans', label: 'Reading Plans', icon: '📅' },
  ];

  const content = {
    chat: {
      title: 'One-on-One Character Conversations',
      description: 'Have meaningful conversations with over 30 biblical characters. Ask questions, seek wisdom, and explore their stories in a personal way.',
      steps: [
        { title: 'Choose a Character', desc: 'Browse our library of biblical figures from both Old and New Testaments' },
        { title: 'Start a Conversation', desc: 'Ask questions, discuss life situations, or explore their biblical stories' },
        { title: 'Save & Continue', desc: 'Save conversations to revisit later and continue your discussions' },
      ],
      cta: { label: 'Start Chatting', link: '/chat/preview' },
    },
    roundtable: {
      title: 'Multi-Character Discussions',
      description: 'Bring multiple biblical characters together for a roundtable discussion on any topic. See different perspectives and gain deeper understanding.',
      steps: [
        { title: 'Choose Your Topic', desc: 'Enter any question or topic you want to explore' },
        { title: 'Select Characters', desc: 'Pick 2-5 biblical figures to participate in the discussion' },
        { title: 'Watch the Discussion', desc: 'Characters share their perspectives based on their biblical experiences' },
      ],
      cta: { label: 'Start a Roundtable', link: '/roundtable/setup/preview' },
    },
    studies: {
      title: 'Character-Guided Bible Studies',
      description: 'Go through structured Bible studies with a biblical character as your guide. Learn Scripture in context with interactive lessons.',
      steps: [
        { title: 'Browse Studies', desc: 'Choose from 90+ studies on various books, topics, and themes' },
        { title: 'Meet Your Guide', desc: 'Each study features a character narrator who lived the story' },
        { title: 'Complete Lessons', desc: 'Work through lessons at your own pace, tracking your progress' },
      ],
      cta: { label: 'Browse Studies', link: '/studies/preview' },
    },
    plans: {
      title: 'Structured Reading Plans',
      description: 'Follow curated reading plans to systematically read through Scripture. Perfect for building consistent Bible reading habits.',
      steps: [
        { title: 'Choose a Plan', desc: 'Select from 140+ plans covering different books, topics, and timeframes' },
        { title: 'Daily Readings', desc: 'Get your daily Scripture passages with educational context' },
        { title: 'Track Progress', desc: 'Mark readings complete and see your journey through the plan' },
      ],
      cta: { label: 'Explore Plans', link: '/reading-plans/preview' },
    },
  };

  const current = content[activeTab];

  return (
    <PreviewLayout>
      <ScrollBackground className="min-h-screen py-12 px-4">
        <ScrollWrap className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-amber-900 mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
              How FaithTalkAI Works
            </h1>
            <p className="text-amber-700 text-lg max-w-2xl mx-auto">
              Discover four powerful ways to engage with Scripture and grow in your faith
            </p>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 rounded-full font-medium transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-white/80 text-amber-700 border border-amber-300 hover:bg-amber-100'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <ScrollDivider />

          {/* Content */}
          <div className="mt-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-amber-900 mb-3" style={{ fontFamily: 'Cinzel, serif' }}>
                {current.title}
              </h2>
              <p className="text-amber-700 max-w-2xl mx-auto">{current.description}</p>
            </div>

            {/* Steps */}
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              {current.steps.map((step, i) => (
                <div key={i} className="bg-white/80 rounded-xl border border-amber-200 p-6 text-center relative">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold">
                    {i + 1}
                  </div>
                  <h3 className="font-bold text-amber-900 mt-2 mb-2">{step.title}</h3>
                  <p className="text-amber-700 text-sm">{step.desc}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="text-center">
              <Link
                to={current.cta.link}
                className="inline-flex items-center gap-2 px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors shadow-md"
              >
                {current.cta.label}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>

          <ScrollDivider />

          {/* Quick Stats */}
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { num: '30+', label: 'Biblical Characters' },
              { num: '90+', label: 'Bible Studies' },
              { num: '140+', label: 'Reading Plans' },
              { num: '9', label: 'Bible Translations' },
            ].map((stat, i) => (
              <div key={i} className="bg-amber-100/50 rounded-xl p-4 border border-amber-200">
                <div className="text-2xl font-bold text-amber-800">{stat.num}</div>
                <div className="text-amber-600 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-10 text-center bg-gradient-to-r from-amber-100 to-amber-200 rounded-xl p-8 border border-amber-300">
            <h2 className="text-2xl font-bold text-amber-900 mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
              Ready to Start Your Journey?
            </h2>
            <p className="text-amber-700 mb-6">Join thousands of users exploring Scripture in a new way</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/signup" className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors">
                Create Free Account
              </Link>
              <Link to="/" className="px-6 py-3 bg-white hover:bg-amber-50 text-amber-800 font-bold rounded-lg transition-colors border border-amber-300">
                Back to Home
              </Link>
            </div>
          </div>
        </ScrollWrap>
      </ScrollBackground>
      <FooterScroll />
    </PreviewLayout>
  );
};

export default HowItWorksPageScroll;
