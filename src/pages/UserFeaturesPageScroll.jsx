import React from 'react';
import { Link } from 'react-router-dom';
import FooterScroll from '../components/FooterScroll';
import PreviewLayout from '../components/PreviewLayout';
import { ScrollWrap, ScrollDivider, ScrollBackground } from '../components/ScrollWrap';

const UserFeaturesPageScroll = () => {
  const features = [
    {
      icon: '💬',
      title: 'One-on-One Character Conversations',
      description: 'Have meaningful, personal conversations with over 90 biblical characters from both Old and New Testaments.',
      highlights: [
        'Ask questions about their lives and experiences',
        'Seek wisdom for your own situations',
        'Explore Scripture through their eyes',
        'Characters respond based on biblical accuracy',
      ],
    },
    {
      icon: '👥',
      title: 'Roundtable Discussions',
      description: 'Bring multiple biblical characters together to discuss any topic from their unique perspectives.',
      highlights: [
        'Choose up to 8 characters (12 for premium)',
        'Enter any topic or question',
        'Watch characters interact with each other',
        'Gain multiple biblical perspectives at once',
      ],
    },
    {
      icon: '📖',
      title: 'Character-Guided Bible Studies',
      description: '36+ structured Bible studies led by characters who lived the stories.',
      highlights: [
        'Studies on books, topics, and themes',
        'Interactive lessons with your guide',
        'Track your progress through each study',
        'Studies begin with prayer for focus',
      ],
    },
    {
      icon: '📅',
      title: 'Reading Plans',
      description: '148+ curated reading plans with character-guided discussions and daily teachings.',
      highlights: [
        'Plans for all timeframes and topics',
        'Daily teachings and reflection prompts',
        'Character-led discussions on each day\'s reading',
        'Highlight verses and discuss with a biblical character',
        'Navigate between days easily',
        'Mark and unmark days as complete',
      ],
    },
    {
      icon: '📕',
      title: 'Integrated Bible Reader',
      description: 'Read Scripture directly in the app with 9 translations available.',
      highlights: [
        'KJV, NIV, ESV, NASB, NLT, and more',
        'Quick navigation to any book/chapter',
        'Highlight any verse and discuss with a biblical character',
        'Seamlessly integrated with studies and plans',
        'Clean, distraction-free reading experience',
      ],
    },
    {
      icon: '🔖',
      title: 'My Walk - Personal Dashboard',
      description: 'Your personal faith journey hub to track all your progress.',
      highlights: [
        'Saved conversations and roundtables',
        'Bible study progress tracking',
        'Reading plan completion status',
        'Favorite characters for quick access',
      ],
    },
    {
      icon: '🤝',
      title: 'Share & Invite Friends',
      description: 'Faith is better together. Share your journey with others.',
      highlights: [
        'Invite friends to join conversations',
        'Share insights and discussion highlights',
        'Grow together in community',
        'Easy link sharing',
      ],
    },
    {
      icon: '📱',
      title: 'Mobile App',
      description: 'Take your faith journey anywhere with our iOS app.',
      highlights: [
        'Full-featured mobile experience',
        'All reading plans and Bible studies',
        'Bible reader with character discussions',
        'Push notifications for reminders',
        'Seamless sync across devices',
      ],
    },
  ];

  const premiumFeatures = [
    {
      icon: '♾️',
      title: 'Unlimited Conversations',
      description: 'No daily message limits - chat as much as you want.',
    },
    {
      icon: '🌟',
      title: 'Access All Characters',
      description: 'Unlock every biblical character in our library.',
    },
    {
      icon: '📚',
      title: 'Premium Bible Studies',
      description: 'Access exclusive in-depth study content.',
    },
    {
      icon: '💾',
      title: 'Unlimited Saves',
      description: 'Save unlimited conversations to your My Walk.',
    },
  ];

  return (
    <PreviewLayout>
      <ScrollBackground className="min-h-screen py-12 px-4">
        <ScrollWrap className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-amber-900 mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
              Features for You
            </h1>
            <p className="text-amber-700 text-lg max-w-2xl mx-auto">
              Everything you need to deepen your faith and grow in Scripture
            </p>
          </div>

          <ScrollDivider />

          {/* Main Features Grid */}
          <div className="mt-10 grid md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="bg-white/80 rounded-xl border border-amber-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-amber-900 text-lg mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
                      {feature.title}
                    </h3>
                    <p className="text-amber-700 text-sm mb-3">{feature.description}</p>
                    <ul className="space-y-1">
                      {feature.highlights.map((highlight, j) => (
                        <li key={j} className="text-amber-600 text-sm flex items-start gap-2">
                          <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <ScrollDivider />

          {/* Premium Section */}
          <div className="mt-10">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-amber-900 mb-3" style={{ fontFamily: 'Cinzel, serif' }}>
                Premium Benefits
              </h2>
              <p className="text-amber-700">Unlock the full experience with FaithTalkAI Premium</p>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              {premiumFeatures.map((feature, i) => (
                <div key={i} className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border border-amber-300 p-5 text-center">
                  <div className="text-3xl mb-3">{feature.icon}</div>
                  <h3 className="font-bold text-amber-900 mb-1">{feature.title}</h3>
                  <p className="text-amber-700 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors shadow-md"
              >
                View Pricing
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>

          <ScrollDivider />

          {/* CTA Section */}
          <div className="mt-10 text-center bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl p-8 border border-amber-300">
            <h2 className="text-2xl font-bold text-amber-900 mb-3" style={{ fontFamily: 'Cinzel, serif' }}>
              Ready to Begin Your Journey?
            </h2>
            <p className="text-amber-700 mb-6 max-w-xl mx-auto">
              Start exploring Scripture in a new way. No account required to try it out.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/chat"
                className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors"
              >
                Start Chatting Free
              </Link>
              <Link
                to="/how-it-works"
                className="px-6 py-3 bg-white hover:bg-amber-50 text-amber-700 font-bold rounded-lg border border-amber-300 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>

        </ScrollWrap>
        <FooterScroll />
      </ScrollBackground>
    </PreviewLayout>
  );
};

export default UserFeaturesPageScroll;
