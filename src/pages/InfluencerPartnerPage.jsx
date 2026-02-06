import React from 'react';
import { Link, useParams } from 'react-router-dom';
import FooterScroll from '../components/FooterScroll';
import PreviewLayout from '../components/PreviewLayout';
import { ScrollWrap, ScrollDivider, ScrollBackground } from '../components/ScrollWrap';

// Influencer configuration - add new influencers here
const influencers = {
  'joshua-wright': {
    name: 'Joshua Wright',
    handle: '@joshuawrightguided',
    instagram: 'https://www.instagram.com/joshuawrightgguided/',
    followers: '817K',
    tagline: 'Your Ministry. Your Message. Your Business.',
    welcomeMessage: "This isn't about promoting an app - it's about building something that's truly yours.",
    bio: "Joshua Wright reaches hundreds of thousands with powerful content about authentic faith. Now imagine that message amplified through AI characters that teach exactly the way you do.",
    photoUrl: null,
    customColor: 'amber',
    hasCustomCharacters: true,
    customCharacterExamples: ['Real Jesus', 'Fake Jesus', 'The Discerner'],
    controlsTiers: true,
  },
};

// Default config for unknown influencers
const defaultInfluencer = {
  name: 'Partner',
  handle: '',
  tagline: 'Your Ministry. Your Message. Your Business.',
  welcomeMessage: "This isn't about promoting an app - it's about building something that's truly yours.",
  bio: "A trusted voice in the Christian community ready to amplify their message through AI.",
  photoUrl: null,
  customColor: 'amber',
  hasCustomCharacters: true,
  controlsTiers: true,
};

const InfluencerLandingPage = () => {
  const { slug } = useParams();
  const influencer = influencers[slug] || defaultInfluencer;
  
  const features = [
    {
      icon: '🎭',
      title: 'Custom Characters',
      description: 'Create AI characters that teach YOUR theology, answer questions YOUR way, and reflect YOUR message.',
    },
    {
      icon: '💰',
      title: 'You Own the Revenue',
      description: "Your audience, your pricing, your business. We handle the tech - you keep the profits.",
    },
    {
      icon: '🎯',
      title: 'Your Brand, Your Platform',
      description: 'Custom landing pages, your branding, your voice. Not a generic app with your name slapped on it.',
    },
    {
      icon: '📖',
      title: 'Custom Bible Studies',
      description: 'Create guided studies led by your custom characters teaching exactly how you would teach.',
    },
    {
      icon: '🔄',
      title: '24/7 Ministry',
      description: 'Your characters can minister to your audience anytime, anywhere - even when you sleep.',
    },
    {
      icon: '📈',
      title: 'Scalable Income',
      description: 'Turn your following into sustainable ministry income without trading more of your time.',
    },
  ];

  // What makes this different - the business opportunity
  const businessFeatures = [
    {
      icon: '⭐',
      title: 'Your Custom Characters',
      description: `Characters that teach YOUR message - designed by you, powered by our AI.`,
      examples: influencer.customCharacterExamples,
    },
    {
      icon: '💵',
      title: 'Real Revenue',
      description: `Set your own pricing. Your subscribers pay you directly. We just take a small platform fee.`,
    },
    {
      icon: '🚀',
      title: 'We Build It For You',
      description: 'No tech skills needed. Tell us your vision, we make it happen. You focus on ministry.',
    },
  ];

  const comingSoon = [
    {
      icon: '🎥',
      title: 'Video Conversations',
      description: 'Face-to-face video meetings with biblical characters using cutting-edge AI avatar technology.',
      status: 'Coming 2026',
    },
    {
      icon: '🎧',
      title: 'Voice Conversations',
      description: 'Speak naturally and hear characters respond in realistic voices.',
      status: 'Coming Soon',
    },
  ];

  return (
    <PreviewLayout>
      <ScrollBackground className="min-h-screen">
        {/* Hero Section */}
        <section className="relative py-12 px-4">
          <ScrollWrap className="max-w-4xl mx-auto">
            <div className="text-center py-8">
              {/* Partner Badge */}
              <div className="inline-flex items-center gap-2 bg-amber-600/20 text-amber-800 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-amber-300">
                <span>🤝</span>
                <span>Partnership Opportunity for {influencer.name}</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl md:text-5xl font-bold text-amber-900 mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
                Launch Your Own AI-Powered Ministry
              </h1>
              
              <p className="text-xl text-amber-700 max-w-2xl mx-auto mb-6">
                Your theology. Your characters. Your audience. Your revenue. We handle the tech.
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
                <a
                  href="mailto:partnerships@faithtalkai.com?subject=Partnership Inquiry&body=Hi, I'm interested in learning more about launching my own AI-powered ministry platform."
                  className="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors shadow-lg text-lg"
                >
                  Let's Talk Partnership
                </a>
                <Link
                  to="/chat"
                  className="px-8 py-3 bg-white/80 hover:bg-white text-amber-800 font-medium rounded-lg transition-colors border border-amber-300"
                >
                  Try the Platform
                </Link>
              </div>

              {/* Trust indicators */}
              <p className="mt-4 text-amber-600 text-sm">
                ✓ No upfront costs &nbsp;•&nbsp; ✓ We build it for you &nbsp;•&nbsp; ✓ You own your business
              </p>
            </div>
          </ScrollWrap>
        </section>

        {/* Business Opportunity Section */}
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <ScrollWrap>
              <div className="py-8">
                <div className="text-center mb-8">
                  <span className="inline-block bg-gradient-to-r from-amber-600 to-orange-500 text-white text-sm font-bold px-4 py-1 rounded-full mb-4">
                    NOT A SPONSORSHIP - A BUSINESS
                  </span>
                  <h2 className="text-3xl font-bold text-amber-900" style={{ fontFamily: 'Cinzel, serif' }}>
                    What You Get
                  </h2>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6">
                  {businessFeatures.map((feature, i) => (
                    <div key={i} className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl p-6 border-2 border-amber-400 relative">
                      <div className="text-3xl mb-3">{feature.icon}</div>
                      <h3 className="font-bold text-amber-900 mb-2">{feature.title}</h3>
                      <p className="text-amber-700 text-sm mb-3">{feature.description}</p>
                      {feature.examples && (
                        <div className="flex flex-wrap gap-2">
                          {feature.examples.map((ex, j) => (
                            <span key={j} className="text-xs bg-amber-600/20 text-amber-800 px-2 py-1 rounded-full border border-amber-300">
                              {ex}
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

        {/* Features Section */}
        <section className="py-12 px-4">
          <div className="max-w-5xl mx-auto">
            <ScrollWrap>
              <div className="py-8">
                <h2 className="text-3xl font-bold text-amber-900 text-center mb-8" style={{ fontFamily: 'Cinzel, serif' }}>
                  Build a Real Ministry Business
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

        {/* Coming Soon Section */}
        <section className="py-12 px-4 bg-gradient-to-b from-transparent via-amber-100/50 to-transparent">
          <div className="max-w-4xl mx-auto">
            <ScrollWrap>
              <div className="py-8">
                <h2 className="text-2xl font-bold text-amber-900 text-center mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
                  The Future of Faith Technology
                </h2>
                <p className="text-amber-600 text-center mb-8">Exciting features on our roadmap</p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {comingSoon.map((feature, i) => (
                    <div key={i} className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border-2 border-dashed border-amber-300">
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">{feature.icon}</div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-amber-900">{feature.title}</h3>
                            <span className="text-xs bg-amber-600 text-white px-2 py-0.5 rounded-full">{feature.status}</span>
                          </div>
                          <p className="text-amber-700 text-sm">{feature.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollWrap>
          </div>
        </section>

        {/* How It Works Preview */}
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <ScrollWrap>
              <div className="py-8">
                <h2 className="text-2xl font-bold text-amber-900 text-center mb-8" style={{ fontFamily: 'Cinzel, serif' }}>
                  How It Works
                </h2>
                
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    { step: '1', title: 'We Talk', desc: "Tell us your vision, your theology, your audience. We'll design a plan together." },
                    { step: '2', title: 'We Build', desc: "We create your custom characters, studies, and branded experience. You approve everything." },
                    { step: '3', title: 'You Launch', desc: "Announce to your audience. They subscribe. You earn. We handle the tech." },
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

        {/* Partnership Model */}
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <ScrollWrap>
              <div className="py-8">
                <h2 className="text-2xl font-bold text-amber-900 text-center mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
                  The Partnership Model
                </h2>
                <p className="text-amber-600 text-center mb-8 text-sm">
                  This isn't affiliate marketing. You're building your own business.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                  {/* What You Get */}
                  <div className="bg-white/80 rounded-xl p-6 border border-amber-200">
                    <h3 className="font-bold text-amber-900 text-lg mb-4">What You Get</h3>
                    <ul className="text-amber-700 text-sm space-y-3">
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500">✓</span>
                        <span>Custom AI characters trained on YOUR teaching</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500">✓</span>
                        <span>Branded landing page for your audience</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500">✓</span>
                        <span>Custom Bible studies you design</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500">✓</span>
                        <span>You set your own subscription pricing</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500">✓</span>
                        <span>Full analytics on your audience</span>
                      </li>
                    </ul>
                  </div>
                  
                  {/* Revenue Model */}
                  <div className="bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl p-6 border-2 border-amber-400 relative">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      YOUR REVENUE
                    </div>
                    <h3 className="font-bold text-amber-900 text-lg mb-4">How You Earn</h3>
                    <ul className="text-amber-700 text-sm space-y-3">
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500">💰</span>
                        <span><strong>You keep 70-80%</strong> of subscriber revenue</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500">💰</span>
                        <span>Set your price: $5, $10, $20/month - your choice</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500">💰</span>
                        <span>Monthly payouts directly to you</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500">💰</span>
                        <span>No upfront costs to get started</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500">💰</span>
                        <span>Scalable: more subscribers = more income</span>
                      </li>
                    </ul>
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
                  Ready to Build Something That Matters?
                </h2>
                <p className="text-amber-700 mb-6 max-w-xl mx-auto">
                  Your message deserves to reach more people. Let's build a platform that amplifies your ministry and creates sustainable income.
                </p>
                <a
                  href="mailto:partnerships@faithtalkai.com?subject=Partnership Inquiry - {influencer.name}&body=Hi, I'm interested in learning more about launching my own AI-powered ministry platform."
                  className="inline-flex items-center gap-2 px-10 py-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors shadow-lg text-lg"
                >
                  Schedule a Conversation
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
                <p className="mt-4 text-amber-600 text-sm">
                  No commitment. Just a conversation about what's possible.
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
