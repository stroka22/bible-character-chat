import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const HowItWorksPage = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      id: 'chat',
      title: 'Chat with Biblical Characters',
      subtitle: 'Have meaningful one-on-one conversations',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      description: 'Engage in natural dialogue with figures from Scripture. Ask questions about their experiences, seek wisdom for your life, and explore the Bible through their eyes.',
      steps: [
        'Choose from 30+ biblical characters like Moses, David, Mary, Paul, and more',
        'Ask questions about faith, their stories, or seek guidance',
        'Receive thoughtful responses grounded in Scripture',
        'Save conversations to revisit and continue later'
      ],
      cta: { text: 'Start a Conversation', href: '/chat' },
      image: '/images/feature-chat.png',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'roundtable',
      title: 'Roundtable Discussions',
      subtitle: 'Explore topics with multiple perspectives',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      description: 'Bring multiple biblical characters together to discuss a topic. Watch as they share different perspectives and engage with each other based on their unique experiences.',
      steps: [
        'Choose a discussion topic or question',
        'Select 2-5 characters to participate',
        'Watch them discuss and respond to each other',
        'Jump in with your own questions anytime'
      ],
      cta: { text: 'Start a Roundtable', href: '/roundtable/setup' },
      image: '/images/feature-roundtable.png',
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'studies',
      title: 'Bible Studies',
      subtitle: 'Structured lessons with character insights',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      description: 'Follow guided Bible studies that combine traditional lessons with interactive character conversations. Deepen your understanding through structured learning.',
      steps: [
        'Browse studies by topic, book, or character',
        'Work through lessons at your own pace',
        'Chat with relevant characters during each lesson',
        'Track your progress and earn completion badges'
      ],
      cta: { text: 'Browse Studies', href: '/studies' },
      image: '/images/feature-studies.png',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'reading-plans',
      title: 'Reading Plans',
      subtitle: 'Daily Scripture with context and guidance',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      description: 'Stay consistent with structured reading plans. From 7-day introductions to year-long journeys through the Bible, find a plan that fits your schedule.',
      steps: [
        'Choose from 100+ reading plans for all levels',
        'Get daily readings with historical context',
        'Discuss passages with relevant characters',
        'Track streaks and celebrate milestones'
      ],
      cta: { text: 'Explore Plans', href: '/reading-plans' },
      image: '/images/feature-plans.png',
      color: 'from-amber-500 to-amber-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-700 text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Hero Section */}
        <div className="max-w-5xl mx-auto mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-yellow-300 mb-4">
            Discover Faith Talk AI
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
            Experience Scripture like never before. Chat with biblical characters, explore topics through roundtable discussions, 
            follow guided studies, and stay consistent with reading plans.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-blue-900 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              Get Started Free
            </Link>
            <Link
              to="/chat"
              className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-xl font-semibold text-lg transition-all"
            >
              Try Without Account
            </Link>
          </div>
        </div>

        {/* Feature Navigation Tabs */}
        <div className="max-w-5xl mx-auto mb-8">
          <div className="flex flex-wrap justify-center gap-2 md:gap-4">
            {features.map((feature, index) => (
              <button
                key={feature.id}
                onClick={() => setActiveFeature(index)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
                  activeFeature === index
                    ? 'bg-yellow-400 text-blue-900 shadow-lg scale-105'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <span className="hidden sm:block">{feature.icon}</span>
                <span className="text-sm md:text-base">{feature.title.split(' ').slice(0, 2).join(' ')}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Active Feature Detail */}
        <div className="max-w-5xl mx-auto mb-16">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className={`transition-all duration-500 ${
                activeFeature === index ? 'opacity-100' : 'opacity-0 hidden'
              }`}
            >
              <div className="bg-white/5 backdrop-blur-md border border-white/15 rounded-2xl overflow-hidden">
                <div className={`bg-gradient-to-r ${feature.color} p-6 md:p-8`}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                      {feature.icon}
                    </div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold text-white">{feature.title}</h2>
                      <p className="text-white/80">{feature.subtitle}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 md:p-8">
                  <p className="text-blue-100 text-lg mb-8">
                    {feature.description}
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    {/* Steps */}
                    <div>
                      <h3 className="text-xl font-semibold text-yellow-300 mb-4">How It Works</h3>
                      <div className="space-y-4">
                        {feature.steps.map((step, stepIndex) => (
                          <div key={stepIndex} className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-400 text-blue-900 flex items-center justify-center font-bold text-sm">
                              {stepIndex + 1}
                            </div>
                            <p className="text-blue-100 pt-1">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Preview/Illustration Area */}
                    <div className="bg-white/5 rounded-xl p-6 flex items-center justify-center min-h-[200px]">
                      <div className="text-center">
                        <div className={`w-24 h-24 mx-auto mb-4 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center`}>
                          <div className="text-white scale-150">
                            {feature.icon}
                          </div>
                        </div>
                        <p className="text-blue-200 text-sm">Interactive preview coming soon</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* CTA */}
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-6 border-t border-white/10">
                    <p className="text-blue-200">
                      Ready to try {feature.title.toLowerCase()}?
                    </p>
                    <Link
                      to={feature.cta.href}
                      className={`px-6 py-3 bg-gradient-to-r ${feature.color} hover:opacity-90 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg`}
                    >
                      {feature.cta.text} →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* All Features Overview */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-yellow-300 mb-8 text-center">
            Everything You Need for Your Faith Journey
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.id}
                onClick={() => setActiveFeature(index)}
                className="bg-white/5 backdrop-blur-md border border-white/15 rounded-xl p-6 cursor-pointer hover:bg-white/10 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-yellow-300 mb-1">{feature.title}</h3>
                    <p className="text-blue-100 text-sm">{feature.subtitle}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Features Grid */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-yellow-300 mb-8 text-center">
            Plus These Great Features
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: '💾', title: 'Save Conversations', desc: 'Never lose a meaningful discussion' },
              { icon: '📤', title: 'Share with Friends', desc: 'Send conversations via unique links' },
              { icon: '⭐', title: 'Favorite Characters', desc: 'Quick access to your go-to guides' },
              { icon: '📖', title: 'Scripture References', desc: 'Every response cites the Bible' },
              { icon: '📊', title: 'Track Progress', desc: 'See your growth in My Walk' },
              { icon: '🔒', title: 'Private & Secure', desc: 'Your conversations stay yours' },
            ].map((item, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-md border border-white/15 rounded-xl p-4 text-center">
                <div className="text-3xl mb-2">{item.icon}</div>
                <h3 className="font-semibold text-yellow-300 text-sm mb-1">{item.title}</h3>
                <p className="text-blue-200 text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AI Disclaimer */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-white/5 backdrop-blur-md border border-white/15 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-yellow-300 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              About Our AI
            </h2>
            <p className="text-blue-100 mb-4">
              Our AI-powered characters are designed to respond based on biblical accounts, historical context, and theological accuracy. 
              We've carefully crafted each character to stay true to Scripture.
            </p>
            <p className="text-blue-200 text-sm">
              These conversations are meant to supplement your faith journey—not replace Scripture study or pastoral guidance. 
              Always refer to the Bible as your authoritative source of truth.
            </p>
          </div>
        </div>

        {/* Final CTA */}
        <div className="max-w-4xl mx-auto text-center pb-8">
          <div className="bg-gradient-to-r from-yellow-400/20 to-amber-400/20 backdrop-blur-md border border-yellow-400/30 rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-yellow-300 mb-4">
              Ready to Begin Your Journey?
            </h2>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of believers exploring Scripture in a whole new way. 
              Start for free—no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-blue-900 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
              >
                Create Free Account
              </Link>
              <Link
                to="/chat"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-xl font-semibold text-lg transition-all"
              >
                Try a Conversation First
              </Link>
            </div>
            <p className="text-blue-200 text-sm mt-6">
              Already have an account? <Link to="/login" className="text-yellow-300 hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default HowItWorksPage;
