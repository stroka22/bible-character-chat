import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { characterRepository } from '../repositories/characterRepository';
import { readingPlansRepository } from '../repositories/readingPlansRepository';
import FooterScroll from '../components/FooterScroll';
import PreviewLayout from '../components/PreviewLayout';

// Scroll wrap container - makes content look like it's on an unfurled scroll
const ScrollWrap = ({ children, className = '' }) => (
  <div className={`relative ${className}`}>
    {/* Top scroll roll - SVG based */}
    <div className="relative h-12 md:h-14">
      <svg 
        className="absolute inset-x-0 top-0 w-full h-full overflow-visible" 
        viewBox="0 0 800 60" 
        preserveAspectRatio="xMidYMax meet"
        style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }}
      >
        <defs>
          {/* Wood grain gradient for the roll */}
          <linearGradient id="rollGradientTop" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#92400e" />
            <stop offset="20%" stopColor="#b45309" />
            <stop offset="40%" stopColor="#d97706" />
            <stop offset="60%" stopColor="#b45309" />
            <stop offset="80%" stopColor="#92400e" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>
          {/* End cap gradient */}
          <radialGradient id="capGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="50%" stopColor="#b45309" />
            <stop offset="100%" stopColor="#78350f" />
          </radialGradient>
        </defs>
        
        {/* Main wooden roll */}
        <ellipse cx="400" cy="22" rx="390" ry="22" fill="url(#rollGradientTop)" />
        
        {/* Highlight on roll */}
        <ellipse cx="400" cy="14" rx="370" ry="8" fill="rgba(255,255,255,0.15)" />
        
        {/* Left end cap */}
        <circle cx="20" cy="22" r="22" fill="url(#capGradient)" />
        <circle cx="20" cy="22" r="15" fill="none" stroke="rgba(120,53,15,0.5)" strokeWidth="2" />
        <circle cx="20" cy="22" r="6" fill="#78350f" />
        
        {/* Right end cap */}
        <circle cx="780" cy="22" r="22" fill="url(#capGradient)" />
        <circle cx="780" cy="22" r="15" fill="none" stroke="rgba(120,53,15,0.5)" strokeWidth="2" />
        <circle cx="780" cy="22" r="6" fill="#78350f" />
        
        {/* Shadow under roll onto parchment */}
        <rect x="20" y="44" width="760" height="16" fill="url(#shadowGradientTop)" />
        <defs>
          <linearGradient id="shadowGradientTop" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(120,53,15,0.3)" />
            <stop offset="100%" stopColor="rgba(120,53,15,0)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
    
    {/* Parchment content area - inset to align with roll edges */}
    <div className="relative -mt-1 mx-[5%] bg-gradient-to-b from-amber-100 via-amber-50 to-amber-100 
                    shadow-[inset_12px_0_20px_-12px_rgba(120,53,15,0.25),inset_-12px_0_20px_-12px_rgba(120,53,15,0.25)]
                    border-l-2 border-r-2 border-amber-300/40
                    px-4 md:px-8 py-4">
      {/* Parchment texture overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Aged stain effects */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-amber-200/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-20 right-16 w-40 h-40 bg-orange-200/15 rounded-full blur-3xl pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
    
    {/* Bottom scroll roll - SVG based */}
    <div className="relative h-12 md:h-14">
      <svg 
        className="absolute inset-x-0 top-0 w-full h-full overflow-visible" 
        viewBox="0 0 800 60" 
        preserveAspectRatio="xMidYMin meet"
        style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }}
      >
        <defs>
          <linearGradient id="rollGradientBottom" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#92400e" />
            <stop offset="20%" stopColor="#b45309" />
            <stop offset="40%" stopColor="#d97706" />
            <stop offset="60%" stopColor="#b45309" />
            <stop offset="80%" stopColor="#92400e" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>
          <linearGradient id="shadowGradientBottom" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="rgba(120,53,15,0.3)" />
            <stop offset="100%" stopColor="rgba(120,53,15,0)" />
          </linearGradient>
        </defs>
        
        {/* Shadow above roll onto parchment */}
        <rect x="20" y="0" width="760" height="16" fill="url(#shadowGradientBottom)" />
        
        {/* Main wooden roll */}
        <ellipse cx="400" cy="38" rx="390" ry="22" fill="url(#rollGradientBottom)" />
        
        {/* Highlight on roll */}
        <ellipse cx="400" cy="46" rx="370" ry="8" fill="rgba(255,255,255,0.15)" />
        
        {/* Left end cap */}
        <circle cx="20" cy="38" r="22" fill="url(#capGradient)" />
        <circle cx="20" cy="38" r="15" fill="none" stroke="rgba(120,53,15,0.5)" strokeWidth="2" />
        <circle cx="20" cy="38" r="6" fill="#78350f" />
        
        {/* Right end cap */}
        <circle cx="780" cy="38" r="22" fill="url(#capGradient)" />
        <circle cx="780" cy="38" r="15" fill="none" stroke="rgba(120,53,15,0.5)" strokeWidth="2" />
        <circle cx="780" cy="38" r="6" fill="#78350f" />
      </svg>
    </div>
  </div>
);

// Decorative scroll divider
const ScrollDivider = ({ className = '' }) => (
  <div className={`flex items-center justify-center gap-4 ${className}`}>
    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-amber-400/50" />
    <div className="w-3 h-3 rotate-45 border-2 border-amber-400/50 bg-amber-200/50" />
    <div className="flex-1 h-px bg-gradient-to-l from-transparent via-amber-400/50 to-amber-400/50" />
  </div>
);

// Decorative corner flourish
const CornerFlourish = ({ className = '', flip = false }) => (
  <svg 
    className={`w-16 h-16 text-amber-700/30 ${flip ? 'scale-x-[-1]' : ''} ${className}`} 
    viewBox="0 0 100 100"
  >
    <path
      d="M10,90 Q10,50 30,30 Q50,10 90,10"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M20,90 Q20,60 35,45 Q50,30 90,20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      opacity="0.5"
    />
    <circle cx="90" cy="10" r="3" fill="currentColor" opacity="0.5" />
    <circle cx="10" cy="90" r="3" fill="currentColor" opacity="0.5" />
  </svg>
);

// Wax seal button component
const WaxSealButton = ({ children, onClick, href, className = '', variant = 'primary' }) => {
  const baseClasses = `
    relative inline-flex items-center justify-center
    px-8 py-4 rounded-full
    font-serif text-lg font-semibold
    transition-all duration-300
    shadow-lg hover:shadow-xl
    transform hover:scale-105 active:scale-95
  `;
  
  const variants = {
    primary: 'bg-gradient-to-br from-amber-700 via-amber-800 to-amber-900 text-amber-50 hover:from-amber-600 hover:via-amber-700 hover:to-amber-800',
    secondary: 'bg-gradient-to-br from-stone-600 via-stone-700 to-stone-800 text-stone-50 hover:from-stone-500 hover:via-stone-600 hover:to-stone-700',
    gold: 'bg-gradient-to-br from-yellow-600 via-amber-600 to-yellow-700 text-yellow-50 hover:from-yellow-500 hover:via-amber-500 hover:to-yellow-600',
  };

  const classes = `${baseClasses} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link to={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={classes}>
      {children}
    </button>
  );
};

// Character card with illuminated manuscript style
const CharacterCard = ({ character, onClick }) => (
  <div
    onClick={onClick}
    className="group cursor-pointer bg-gradient-to-b from-amber-50 to-amber-100 
               border-2 border-amber-300/50 rounded-lg p-4
               shadow-md hover:shadow-xl transition-all duration-300
               transform hover:scale-105 hover:-translate-y-1"
  >
    <div className="relative mb-3">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-200 to-amber-300 rounded-lg opacity-50" />
      <img
        src={character.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(character.name)}&background=d4a574&color=3d2914&size=200`}
        alt={character.name}
        className="relative w-full h-32 object-cover rounded-lg border-2 border-amber-400/30"
      />
      <div className="absolute inset-0 rounded-lg border-4 border-amber-600/10 pointer-events-none" />
    </div>
    <h3 className="font-serif text-lg font-bold text-amber-900 text-center group-hover:text-amber-700 transition-colors">
      {character.name}
    </h3>
    <p className="text-sm text-amber-800/70 text-center mt-1 line-clamp-2">
      {character.short_biography || character.description}
    </p>
  </div>
);

// Reading plan card styled like an ancient book spine
const ReadingPlanCard = ({ plan, onClick }) => (
  <div
    onClick={onClick}
    className="group cursor-pointer bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100
               border border-amber-300/50 rounded-lg p-4
               shadow-md hover:shadow-lg transition-all duration-300
               transform hover:scale-[1.02]"
  >
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 w-12 h-16 bg-gradient-to-b from-amber-700 to-amber-900 
                      rounded shadow-md flex items-center justify-center">
        <span className="text-amber-100 font-serif text-xs font-bold writing-mode-vertical transform -rotate-180"
              style={{ writingMode: 'vertical-rl' }}>
          {plan.duration_days}d
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-serif text-base font-bold text-amber-900 group-hover:text-amber-700 transition-colors truncate">
          {plan.title}
        </h3>
        <p className="text-sm text-amber-800/70 mt-1 line-clamp-2">
          {plan.description}
        </p>
        <div className="flex items-center gap-2 mt-2 text-xs text-amber-700/60">
          <span className="capitalize">{plan.difficulty}</span>
          <span>•</span>
          <span>{plan.duration_days} days</span>
        </div>
      </div>
    </div>
  </div>
);

// Section header with decorative elements
const SectionHeader = ({ title, subtitle, action }) => (
  <div className="flex items-end justify-between mb-6">
    <div>
      <h2 className="font-serif text-2xl md:text-3xl font-bold text-amber-900">
        {title}
      </h2>
      {subtitle && (
        <p className="text-amber-800/70 mt-1">{subtitle}</p>
      )}
    </div>
    {action && (
      <Link 
        to={action.href} 
        className="text-amber-700 hover:text-amber-900 font-medium text-sm transition-colors flex items-center gap-1"
      >
        {action.label}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    )}
  </div>
);

const HomePageScroll = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [featuredCharacters, setFeaturedCharacters] = useState([]);
  const [featuredPlans, setFeaturedPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load characters
        const chars = await characterRepository.getAll();
        // Get first 6 visible characters for featured section
        const visible = chars.filter(c => c.is_visible !== false).slice(0, 6);
        setFeaturedCharacters(visible);

        // Load featured reading plans
        try {
          const plans = await readingPlansRepository.getFeatured();
          setFeaturedPlans(plans.slice(0, 4));
        } catch (e) {
          console.warn('Could not load reading plans:', e);
        }
      } catch (err) {
        console.error('Failed to load home page data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCharacterClick = (character) => {
    // Navigate to chat with the selected character
    navigate(`/chat?character=${character.slug || character.id}`);
  };

  const handlePlanClick = (plan) => {
    navigate(`/reading-plans/${plan.slug}`);
  };

  return (
    <PreviewLayout>
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100">
      {/* Parchment texture overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-30 z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Decorative corner flourishes */}
      <CornerFlourish className="fixed top-20 left-4 z-10 opacity-50" />
      <CornerFlourish className="fixed top-20 right-4 z-10 opacity-50" flip />

      {/* Hero Section - Wrapped in Scroll */}
      <section className="relative z-10 pt-28 pb-8 px-4 md:px-8">
        <div className="max-w-3xl mx-auto">
          <ScrollWrap>
            <div className="text-center">
              {/* Main heading */}
              <h1 className="font-serif text-2xl md:text-4xl font-bold text-amber-900 mb-1 leading-tight">
                Walk with the
                <span className="block text-amber-700 italic">Figures of Scripture</span>
              </h1>
              
              <ScrollDivider className="my-3 max-w-xs mx-auto" />
              
              <p className="text-sm md:text-base text-amber-800/80 max-w-md mx-auto mb-4">
                Have meaningful AI-powered conversations with Moses, David, Mary, Paul and 90+ biblical characters. Explore Bible studies, reading plans, and roundtable discussions.
              </p>

              {/* CTA Buttons - compact */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                <WaxSealButton href="/chat" variant="primary" className="!px-5 !py-2.5 !text-sm">
                  Start a Conversation
                </WaxSealButton>
                <WaxSealButton href="/getting-started" variant="secondary" className="!px-5 !py-2.5 !text-sm">
                  See How It Works
                </WaxSealButton>
              </div>
            </div>
          </ScrollWrap>
        </div>
      </section>

      {/* What is FaithTalk AI - Quick Feature Overview */}
      <section className="relative z-10 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-amber-100/90 via-amber-50/90 to-amber-100/90 
                        backdrop-blur-sm border border-amber-300/50 rounded-2xl p-6 md:p-8
                        shadow-lg">
            <h2 className="font-serif text-xl md:text-2xl font-bold text-amber-900 text-center mb-6">
              Four Ways to Grow in Faith
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Chat */}
              <Link 
                to="/" 
                className="group text-center p-4 bg-white/50 rounded-xl border border-amber-200/50
                         hover:bg-white/80 hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl 
                              flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="font-serif font-semibold text-amber-900 text-sm mb-1">Character Chat</h3>
                <p className="text-xs text-amber-700/70">90+ Bible figures</p>
              </Link>

              {/* Roundtable */}
              <Link 
                to="/roundtable/setup" 
                className="group text-center p-4 bg-white/50 rounded-xl border border-amber-200/50
                         hover:bg-white/80 hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl 
                              flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="font-serif font-semibold text-amber-900 text-sm mb-1">Roundtable</h3>
                <p className="text-xs text-amber-700/70">Multi-character discussions</p>
              </Link>

              {/* Bible Studies */}
              <Link 
                to="/studies" 
                className="group text-center p-4 bg-white/50 rounded-xl border border-amber-200/50
                         hover:bg-white/80 hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl 
                              flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="font-serif font-semibold text-amber-900 text-sm mb-1">Bible Studies</h3>
                <p className="text-xs text-amber-700/70">30+ guided studies</p>
              </Link>

              {/* Reading Plans */}
              <Link 
                to="/reading-plans" 
                className="group text-center p-4 bg-white/50 rounded-xl border border-amber-200/50
                         hover:bg-white/80 hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl 
                              flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className="font-serif font-semibold text-amber-900 text-sm mb-1">Reading Plans</h3>
                <p className="text-xs text-amber-700/70">140+ daily plans</p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Continue Your Journey (for logged-in users with activity) */}
      {user && (
        <section className="relative z-10 py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="bg-gradient-to-r from-amber-100/80 via-amber-50/80 to-amber-100/80 
                          backdrop-blur-sm border border-amber-300/50 rounded-2xl p-6 md:p-8
                          shadow-lg">
              <SectionHeader 
                title="Continue Your Journey"
                subtitle="Pick up where you left off"
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link 
                  to="/conversations" 
                  className="flex items-center gap-4 p-4 bg-white/50 rounded-lg border border-amber-200/50
                           hover:bg-white/80 transition-all group"
                >
                  <div className="w-12 h-12 bg-amber-200 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-serif font-semibold text-amber-900 group-hover:text-amber-700">Recent Conversations</h3>
                    <p className="text-sm text-amber-700/70">Continue your dialogues</p>
                  </div>
                </Link>

                <Link 
                  to="/reading-plans" 
                  className="flex items-center gap-4 p-4 bg-white/50 rounded-lg border border-amber-200/50
                           hover:bg-white/80 transition-all group"
                >
                  <div className="w-12 h-12 bg-amber-200 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-serif font-semibold text-amber-900 group-hover:text-amber-700">Reading Plans</h3>
                    <p className="text-sm text-amber-700/70">Continue your studies</p>
                  </div>
                </Link>

                <Link 
                  to="/my-walk" 
                  className="flex items-center gap-4 p-4 bg-white/50 rounded-lg border border-amber-200/50
                           hover:bg-white/80 transition-all group"
                >
                  <div className="w-12 h-12 bg-amber-200 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-serif font-semibold text-amber-900 group-hover:text-amber-700">My Walk</h3>
                    <p className="text-sm text-amber-700/70">Track your progress</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Featured Characters Section */}
      <section className="relative z-10 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <SectionHeader 
            title="Meet the Characters"
            subtitle="Engage with figures from Scripture"
            action={{ label: 'View All', href: '/chat' }}
          />
          
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-amber-100/50 rounded-lg p-4 animate-pulse">
                  <div className="w-full h-32 bg-amber-200/50 rounded-lg mb-3" />
                  <div className="h-4 bg-amber-200/50 rounded w-3/4 mx-auto" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {featuredCharacters.map((character) => (
                <CharacterCard
                  key={character.id}
                  character={character}
                  onClick={() => handleCharacterClick(character)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Reading Plans Section */}
      {featuredPlans.length > 0 && (
        <section className="relative z-10 py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <SectionHeader 
              title="Reading Plans"
              subtitle="Structured journeys through Scripture"
              action={{ label: 'Browse All Plans', href: '/reading-plans' }}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featuredPlans.map((plan) => (
                <ReadingPlanCard
                  key={plan.id}
                  plan={plan}
                  onClick={() => handlePlanClick(plan)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features/Value Proposition Section */}
      <section className="relative z-10 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-amber-900 mb-4">
              A New Way to Study Scripture
            </h2>
            <p className="text-amber-800/70 max-w-2xl mx-auto">
              Faith Talk AI brings the Bible to life through conversations with the people who lived it.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-200 to-amber-300 
                            rounded-full flex items-center justify-center shadow-md">
                <svg className="w-8 h-8 text-amber-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="font-serif text-xl font-bold text-amber-900 mb-2">
                Meaningful Dialogue
              </h3>
              <p className="text-amber-800/70">
                Ask questions, explore stories, and gain insights through natural conversation with Biblical figures.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-200 to-amber-300 
                            rounded-full flex items-center justify-center shadow-md">
                <svg className="w-8 h-8 text-amber-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="font-serif text-xl font-bold text-amber-900 mb-2">
                Guided Reading Plans
              </h3>
              <p className="text-amber-800/70">
                Follow structured paths through Scripture with daily readings and contextual insights.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-200 to-amber-300 
                            rounded-full flex items-center justify-center shadow-md">
                <svg className="w-8 h-8 text-amber-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="font-serif text-xl font-bold text-amber-900 mb-2">
                Personal Growth
              </h3>
              <p className="text-amber-800/70">
                Track your journey, save favorite conversations, and deepen your understanding over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      {!user && (
        <section className="relative z-10 py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-gradient-to-br from-amber-800 via-amber-900 to-stone-900 
                          rounded-2xl p-8 md:p-12 text-center shadow-2xl
                          border border-amber-600/30">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-amber-50 mb-4">
                Begin Your Journey Today
              </h2>
              <p className="text-amber-200/80 mb-8 max-w-xl mx-auto">
                Join thousands of believers exploring Scripture through meaningful conversations.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <WaxSealButton href="/signup" variant="gold">
                  Create Free Account
                </WaxSealButton>
                <Link 
                  to="/login" 
                  className="text-amber-200 hover:text-amber-100 font-medium transition-colors"
                >
                  Already have an account? Sign in
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <div className="relative z-10">
        <FooterScroll />
      </div>
    </div>
    </PreviewLayout>
  );
};

export default HomePageScroll;
