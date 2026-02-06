import React from 'react';
import { Link, useParams } from 'react-router-dom';
import FooterScroll from '../components/FooterScroll';
import PreviewLayout from '../components/PreviewLayout';
import { ScrollWrap, ScrollDivider, ScrollBackground } from '../components/ScrollWrap';

// Influencer configuration - audience-facing content
const influencers = {
  'joshua-wright': {
    name: 'Joshua Wright',
    handle: '@joshuawrightgguided',
    followers: '817K',
    welcomeMessage: "I'm excited to share this incredible tool with you. It's helped me go deeper in Scripture, and I know it will do the same for you.",
    photoUrl: null,
    // Exclusive characters for this influencer's audience
    hasExclusiveContent: true,
    exclusiveCharacters: ['Real Jesus', 'Fake Jesus', 'The Discerner'],
    exclusiveStudies: ['Authentic Faith', 'Discerning Truth from Deception'],
  },
};

const defaultInfluencer = {
  name: 'Our Partner',
  handle: '',
  welcomeMessage: "Welcome! I'm excited to share this incredible tool with you.",
  photoUrl: null,
  hasExclusiveContent: false,
  exclusiveCharacters: [],
  exclusiveStudies: [],
};

const InfluencerLandingPage = () => {
  const { slug } = useParams();
  const influencer = influencers[slug] || defaultInfluencer;
  
  const features = [
    {
      icon: '💬',
      title: '90+ Biblical Characters',
      description: 'Have real conversations with Moses, David, Paul, Mary, and dozens more. Ask questions, explore their stories, grow in faith.',
    },
    {
      icon: '👥',
      title: 'Roundtable Discussions',
      description: 'Bring multiple characters together to discuss any topic from different biblical perspectives.',
    },
    {
      icon: '📖',
      title: '35+ Guided Bible Studies',
      description: 'Go through structured studies with a biblical character as your personal guide.',
    },
    {
      icon: '📅',
      title: '140+ Reading Plans',
      description: 'Follow curated plans covering different books, topics, and timeframes.',
    },
    {
      icon: '📚',
      title: '9 Bible Translations',
      description: 'Read Scripture in KJV, ASV, WEB, and more - all built right in.',
    },
    {
      icon: '🔖',
      title: 'Save & Share',
      description: 'Save meaningful conversations, share insights, and invite friends to join discussions.',
    },
  ];

  const exclusiveFeatures = influencer.hasExclusiveContent ? [
    {
      icon: '⭐',
      title: 'Exclusive Characters',
      description: `Access unique characters curated by ${influencer.name} - only available to this community.`,
      items: influencer.exclusiveCharacters,
    },
    {
      icon: '📖',
      title: 'Exclusive Studies',
      description: `Special Bible studies designed for ${influencer.name}'s community.`,
      items: influencer.exclusiveStudies,
    },
  ] : [];

  return (
    <PreviewLayout>
      <ScrollBackground className="min-h-screen">
        {/* Hero Section */}
        <section className="relative py-12 px-4">
          <ScrollWrap className="max-w-4xl mx-auto">
            <div className="text-center py-8">
              {/* Partner Badge */}
              <div className="inline-flex items-center gap-2 bg-amber-600/20 text-amber-800 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-amber-300">
                <span>✨</span>
                <span>Recommended by {influencer.name}</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl md:text-5xl font-bold text-amber-900 mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
                Have Real Conversations with Biblical Characters
              </h1>
              
              <p className="text-xl text-amber-700 max-w-2xl mx-auto mb-6">
                AI-powered faith conversations that help you understand Scripture like never before.
              </p>

              {/* Influencer Welcome */}
              <div className="bg-white/60 rounded-xl p-6 max-w-xl mx-auto mb-8 border border-amber-200">
                <div className="flex items-center gap-4 mb-3">
                  {influencer.photoUrl ? (
                    <img 
                      src={influencer.photoUrl} 
                      alt={influencer.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-amber-400"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-2xl font-bold">
                      {influencer.name.charAt(0)}
                    </div>
                  )}
                  <div className="text-left">
                    <h3 className="font-bold text-amber-900">{influencer.name}</h3>
                    {influencer.handle && (
                      <p className="text-amber-600 text-sm">{influencer.handle}</p>
                    )}
                    {influencer.followers && (
                      <p className="text-amber-500 text-xs">{influencer.followers} followers</p>
                    )}
                  </div>
                </div>
                <p className="text-amber-800 italic">"{influencer.welcomeMessage}"</p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to={`/signup?ref=${slug}`}
                  className="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors shadow-lg text-lg"
                >
                  Start Free Today
                </Link>
                <Link
                  to="/chat"
                  className="px-8 py-3 bg-white/80 hover:bg-white text-amber-800 font-medium rounded-lg transition-colors border border-amber-300"
                >
                  Try It Now
                </Link>
              </div>

              {/* Trust indicators */}
              <p className="mt-4 text-amber-600 text-sm">
                ✓ No credit card required &nbsp;•&nbsp; ✓ Free tier available &nbsp;•&nbsp; ✓ Cancel anytime
              </p>
            </div>
          </ScrollWrap>
        </section>

        {/* Exclusive Content Section */}
        {exclusiveFeatures.length > 0 && (
          <section className="py-12 px-4">
            <div className="max-w-4xl mx-auto">
              <ScrollWrap>
                <div className="py-8">
                  <div className="text-center mb-8">
                    <span className="inline-block bg-gradient-to-r from-amber-600 to-orange-500 text-white text-sm font-bold px-4 py-1 rounded-full mb-4">
                      EXCLUSIVE TO THIS COMMUNITY
                    </span>
                    <h2 className="text-3xl font-bold text-amber-900" style={{ fontFamily: 'Cinzel, serif' }}>
                      Only Available Through {influencer.name}
                    </h2>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {exclusiveFeatures.map((feature, i) => (
                      <div key={i} className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl p-6 border-2 border-amber-400">
                        <div className="text-3xl mb-3">{feature.icon}</div>
                        <h3 className="font-bold text-amber-900 mb-2">{feature.title}</h3>
                        <p className="text-amber-700 text-sm mb-3">{feature.description}</p>
                        {feature.items && feature.items.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {feature.items.map((item, j) => (
                              <span key={j} className="text-xs bg-amber-600/20 text-amber-800 px-2 py-1 rounded-full border border-amber-300">
                                {item}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollWrap>
            </div>
          </section>
        )}

        {/* Features Section */}
        <section className="py-12 px-4">
          <div className="max-w-5xl mx-auto">
            <ScrollWrap>
              <div className="py-8">
                <h2 className="text-3xl font-bold text-amber-900 text-center mb-8" style={{ fontFamily: 'Cinzel, serif' }}>
                  Everything in FaithTalkAI
                </h2>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {features.map((feature, i) => (
                    <div key={i} className="bg-white/70 rounded-xl p-5 border border-amber-200 hover:shadow-lg transition-shadow">
                      <div className="text-3xl mb-3">{feature.icon}</div>
                      <h3 className="font-bold text-amber-900 mb-2">{feature.title}</h3>
                      <p className="text-amber-700 text-sm">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollWrap>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <ScrollWrap>
              <div className="py-8">
                <h2 className="text-2xl font-bold text-amber-900 text-center mb-8" style={{ fontFamily: 'Cinzel, serif' }}>
                  Getting Started is Easy
                </h2>
                
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    { step: '1', title: 'Create Your Account', desc: 'Sign up free in seconds with just your email' },
                    { step: '2', title: 'Choose a Character', desc: influencer.hasExclusiveContent 
                      ? `Talk to exclusive characters from ${influencer.name} or 90+ biblical figures`
                      : 'Browse 90+ biblical figures and pick who to talk with' },
                    { step: '3', title: 'Start the Conversation', desc: 'Ask questions, explore stories, and grow in your faith' },
                  ].map((item, i) => (
                    <div key={i} className="text-center">
                      <div className="w-12 h-12 bg-amber-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                        {item.step}
                      </div>
                      <h3 className="font-bold text-amber-900 mb-2">{item.title}</h3>
                      <p className="text-amber-700 text-sm">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollWrap>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <ScrollWrap>
              <div className="py-8">
                <h2 className="text-2xl font-bold text-amber-900 text-center mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
                  Simple, Honest Pricing
                </h2>
                <p className="text-amber-600 text-center mb-8 text-sm">
                  Start free and upgrade when you're ready
                </p>
                
                <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                  {/* Free Tier */}
                  <div className="bg-white/80 rounded-xl p-6 border border-amber-200">
                    <h3 className="font-bold text-amber-900 text-lg mb-2">Free</h3>
                    <p className="text-3xl font-bold text-amber-800 mb-4">$0<span className="text-sm font-normal">/month</span></p>
                    <ul className="text-amber-700 text-sm space-y-2 mb-6">
                      <li>✓ Access to select characters</li>
                      <li>✓ Limited daily messages</li>
                      <li>✓ Sample Bible studies</li>
                      <li>✓ Basic features</li>
                    </ul>
                    <Link
                      to={`/signup?ref=${slug}`}
                      className="block text-center py-2 px-4 border border-amber-400 text-amber-700 rounded-lg hover:bg-amber-50 transition-colors"
                    >
                      Get Started Free
                    </Link>
                  </div>
                  
                  {/* Premium Tier */}
                  <div className="bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl p-6 border-2 border-amber-400 relative">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      FULL ACCESS
                    </div>
                    <h3 className="font-bold text-amber-900 text-lg mb-2">Premium</h3>
                    <p className="text-3xl font-bold text-amber-800 mb-1">$6.99<span className="text-sm font-normal">/month</span></p>
                    <p className="text-amber-600 text-sm mb-4">or $49.99/year (save 40%)</p>
                    <ul className="text-amber-700 text-sm space-y-2 mb-6">
                      <li>✓ <strong>Unlimited</strong> conversations</li>
                      <li>✓ All 90+ characters</li>
                      {influencer.hasExclusiveContent && (
                        <li>✓ <strong>Exclusive characters</strong></li>
                      )}
                      <li>✓ All 35+ Bible studies</li>
                      <li>✓ All 140+ reading plans</li>
                      <li>✓ Roundtable discussions</li>
                    </ul>
                    <Link
                      to={`/signup?ref=${slug}`}
                      className="block text-center py-2 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors"
                    >
                      Start Free Trial
                    </Link>
                  </div>
                </div>
              </div>
            </ScrollWrap>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-12 px-4">
          <div className="max-w-3xl mx-auto">
            <ScrollWrap>
              <div className="py-8 text-center">
                <h2 className="text-3xl font-bold text-amber-900 mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
                  Ready to Go Deeper?
                </h2>
                <p className="text-amber-700 mb-6 max-w-xl mx-auto">
                  Join thousands of believers growing in their faith through meaningful conversations with biblical characters.
                </p>
                <Link
                  to={`/signup?ref=${slug}`}
                  className="inline-flex items-center gap-2 px-10 py-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors shadow-lg text-lg"
                >
                  Create Your Free Account
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <p className="mt-4 text-amber-600 text-sm">
                  Recommended by {influencer.name}
                </p>
              </div>
            </ScrollWrap>
          </div>
        </section>

        <FooterScroll />
      </ScrollBackground>
    </PreviewLayout>
  );
};

export default InfluencerLandingPage;
