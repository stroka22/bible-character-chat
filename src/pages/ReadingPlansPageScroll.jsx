import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { readingPlansRepository } from '../repositories/readingPlansRepository';
import { getOwnerSlug } from '../services/tierSettingsService';
import FooterScroll from '../components/FooterScroll';
import { ScrollWrap, ScrollDivider, ScrollBackground } from '../components/ScrollWrap';
import PreviewLayout from '../components/PreviewLayout';

// Compact card for horizontal scroll rows - scroll theme
function PlanCard({ plan, userProgress, onStart, onRemove, compact = false, showRemove = false, isCompleted = false }) {
  const progress = userProgress?.find(p => p.plan_id === plan.id);
  const completedDaysCount = progress?.completed_days?.length || 0;
  const progressPercent = progress 
    ? Math.round(completedDaysCount / plan.duration_days * 100)
    : 0;
  const currentDay = progress?.current_day || 1;
  
  const difficultyColors = {
    easy: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-amber-100 text-amber-800 border-amber-200',
    intensive: 'bg-red-100 text-red-800 border-red-200',
  };

  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRemove) onRemove(plan.id, plan.title);
  };

  if (compact) {
    return (
      <div className="relative flex-shrink-0 w-64">
        {showRemove && (
          <button
            onClick={handleRemove}
            className="absolute -top-2 -right-2 z-10 bg-amber-800 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transition-colors"
            title="Remove from Continue Reading"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        
        <Link 
          to={`/reading-plans/${plan.slug}`}
          className="block bg-white/80 rounded-lg border border-amber-200 overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer h-[200px] flex flex-col"
        >
          <div className="p-3 flex flex-col h-full">
            <h3 className="text-sm font-semibold text-amber-900 line-clamp-2 leading-tight mb-1">{plan.title}</h3>
            
            <p className="text-amber-700/70 text-xs mb-2 line-clamp-2 flex-shrink-0" title={plan.description}>
              {plan.description}
            </p>
            
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs text-amber-600">{plan.duration_days} days</span>
              <span className="text-amber-300">•</span>
              <span className={`text-xs font-medium px-1.5 py-0.5 rounded border ${difficultyColors[plan.difficulty] || difficultyColors.medium}`}>
                {plan.difficulty}
              </span>
            </div>

            <div className="mt-auto">
              {isCompleted ? (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs text-green-700 font-medium">Completed!</span>
                  </div>
                  <span className="block w-full text-center bg-green-600 text-white text-xs font-medium py-1.5 px-2 rounded-lg">
                    View / Restart
                  </span>
                </div>
              ) : progress ? (
                <div>
                  <div className="flex items-center justify-between text-xs text-amber-700 mb-1">
                    <span>Day {currentDay} of {plan.duration_days}</span>
                    <span>{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-amber-200 rounded-full h-1.5 mb-2">
                    <div className="bg-amber-600 h-1.5 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
                  </div>
                  <span className="block w-full text-center bg-amber-600 text-white text-xs font-medium py-1.5 px-2 rounded-lg">
                    Continue
                  </span>
                </div>
              ) : (
                <span className="block w-full text-center bg-amber-100 text-amber-900 text-xs font-medium py-1.5 px-2 rounded-lg border border-amber-200">
                  View Plan
                </span>
              )}
            </div>
          </div>
        </Link>
      </div>
    );
  }

  return null;
}

// Horizontal scroll row component - scroll theme
function PlanRow({ title, plans, userProgress, onStart, onRemove, icon, showRemove = false, isCompletedRow = false }) {
  const scrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkArrows = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkArrows();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkArrows);
      return () => el.removeEventListener('scroll', checkArrows);
    }
  }, [plans]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 280;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  if (!plans || plans.length === 0) return null;

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-amber-900 mb-2 flex items-center gap-2">
        {icon && <span>{icon}</span>}
        {title}
        <span className="text-sm font-normal text-amber-600">({plans.length})</span>
      </h2>
      <div className="relative group">
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-amber-100/90 hover:bg-amber-200 shadow-lg rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity border border-amber-300"
          >
            <svg className="w-4 h-4 text-amber-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        
        <div 
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-2 pt-2 pl-1 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {plans.map(plan => (
            <PlanCard 
              key={plan.id} 
              plan={plan} 
              userProgress={userProgress}
              onStart={onStart}
              onRemove={onRemove}
              showRemove={showRemove}
              isCompleted={isCompletedRow}
              compact
            />
          ))}
        </div>

        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-amber-100/90 hover:bg-amber-200 shadow-lg rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity border border-amber-300"
          >
            <svg className="w-4 h-4 text-amber-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export default function ReadingPlansPageScroll() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [userProgress, setUserProgress] = useState([]);
  const [completedProgress, setCompletedProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removeConfirm, setRemoveConfirm] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const ownerSlug = getOwnerSlug();
      const [allPlans, progress, completed] = await Promise.all([
        readingPlansRepository.getAll(ownerSlug),
        user ? readingPlansRepository.getUserPlans(user.id) : [],
        user ? readingPlansRepository.getCompletedPlans(user.id) : [],
      ]);
      setPlans(allPlans);
      setUserProgress(progress);
      setCompletedProgress(completed || []);
    } catch (e) {
      console.error('Error loading reading plans:', e);
      setError('Failed to load reading plans');
    } finally {
      setLoading(false);
    }
  };

  const handleStartPlan = async (planId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await readingPlansRepository.startPlan(user.id, planId);
      const plan = plans.find(p => p.id === planId);
      navigate(`/reading-plans/${plan.slug}`);
    } catch (e) {
      console.error('Error starting plan:', e);
      setError('Failed to start plan');
    }
  };

  const handleRemovePlan = async (planId, planTitle) => {
    setRemoveConfirm({ planId, planTitle });
  };

  const confirmRemovePlan = async () => {
    if (!removeConfirm || !user) return;
    try {
      await readingPlansRepository.leavePlan(user.id, removeConfirm.planId);
      setUserProgress(prev => prev.filter(p => p.plan_id !== removeConfirm.planId));
      setRemoveConfirm(null);
    } catch (e) {
      console.error('Error removing plan:', e);
      setError('Failed to remove plan');
    }
  };

  const filteredPlans = searchQuery 
    ? plans.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : plans;

  const activePlans = userProgress.filter(p => !p.is_completed && p.plan).map(p => p.plan);
  const completedPlans = completedProgress.filter(p => p.plan).map(p => p.plan);

  const featuredPlans = filteredPlans.filter(p => p.is_featured);
  const foundationalPlans = filteredPlans.filter(p => p.category === 'foundational');
  const bookPlans = filteredPlans.filter(p => p.category === 'book');
  const topicalPlans = filteredPlans.filter(p => p.category === 'topical');
  const characterPlans = filteredPlans.filter(p => p.category === 'character');
  const lifePlans = filteredPlans.filter(p => p.category === 'life');
  const seasonalPlans = filteredPlans.filter(p => p.category === 'seasonal');
  const quickPlans = filteredPlans.filter(p => p.duration_days <= 7);
  const deepDivePlans = filteredPlans.filter(p => p.duration_days >= 30);
  const beginnerPlans = filteredPlans.filter(p => p.difficulty === 'easy');

  return (
    <PreviewLayout>
      <ScrollBackground>
        <ScrollWrap className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center text-amber-700 hover:text-amber-900 text-sm mb-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Home
            </Link>
            
            {/* The Bible - Hero Card */}
            <Link
              to="/bible"
              className="block mb-6 group"
            >
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-amber-600">
                {/* Decorative cross pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-48 border-4 border-amber-200" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-16 border-4 border-amber-200" style={{ marginTop: '-2rem' }} />
                </div>
                {/* Light rays effect */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-400/20 rounded-full blur-3xl group-hover:bg-amber-400/30 transition-all" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-amber-300/10 rounded-full blur-2xl" />
                
                <div className="relative flex items-center gap-4">
                  {/* Book icon */}
                  <div className="flex-shrink-0 w-16 h-20 bg-amber-100 rounded-lg shadow-lg flex items-center justify-center border-2 border-amber-300 group-hover:scale-105 transition-transform">
                    <svg className="w-10 h-12 text-amber-800" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z"/>
                      <path d="M8 12h8v2H8zm0 4h5v2H8z" opacity=".5"/>
                    </svg>
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-amber-300 text-xs uppercase tracking-wider mb-1">Read Freely</p>
                    <h2 className="text-2xl md:text-3xl font-bold text-amber-100 mb-1" style={{ fontFamily: 'Cinzel, serif' }}>
                      THE Bible
                    </h2>
                    <p className="text-amber-200/80 text-sm">Browse and read without following a plan</p>
                  </div>
                  
                  <svg className="w-8 h-8 text-amber-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
            
            <h1 className="text-2xl md:text-3xl font-bold text-amber-900 mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
              Bible Reading Plans
            </h1>
            <p className="text-amber-700/80 mb-4">Explore {plans.length} plans to guide your daily Bible reading</p>
            
            {/* Search */}
            <div className="relative max-w-sm">
              <input
                type="text"
                placeholder="Search plans..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white/80 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-amber-900 placeholder-amber-400"
              />
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-amber-500 hover:text-amber-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <ScrollDivider className="my-4" />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-700" />
            </div>
          ) : searchQuery ? (
            <div>
              <h2 className="text-lg font-semibold text-amber-900 mb-3">Search Results ({filteredPlans.length})</h2>
              {filteredPlans.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filteredPlans.map(plan => (
                    <PlanCard key={plan.id} plan={plan} userProgress={userProgress} onStart={handleStartPlan} compact />
                  ))}
                </div>
              ) : (
                <p className="text-amber-600">No plans found matching "{searchQuery}"</p>
              )}
            </div>
          ) : (
            <>
              {activePlans.length > 0 && (
                <PlanRow title="Continue Reading" icon="📖" plans={activePlans} userProgress={userProgress} onStart={handleStartPlan} onRemove={handleRemovePlan} showRemove={true} />
              )}
              {completedPlans.length > 0 && (
                <PlanRow title="Completed" icon="✅" plans={completedPlans} userProgress={completedProgress} onStart={handleStartPlan} isCompletedRow={true} />
              )}
              <PlanRow title="Featured Plans" icon="⭐" plans={featuredPlans} userProgress={userProgress} onStart={handleStartPlan} />
              <PlanRow title="Quick Start (7 days or less)" icon="⚡" plans={quickPlans} userProgress={userProgress} onStart={handleStartPlan} />
              <PlanRow title="New to the Bible" icon="🌱" plans={foundationalPlans} userProgress={userProgress} onStart={handleStartPlan} />
              <PlanRow title="Beginner Friendly" icon="👋" plans={beginnerPlans.filter(p => !foundationalPlans.includes(p)).slice(0, 15)} userProgress={userProgress} onStart={handleStartPlan} />
              <PlanRow title="Topical Studies" icon="🎯" plans={topicalPlans} userProgress={userProgress} onStart={handleStartPlan} />
              <PlanRow title="Book Studies" icon="📚" plans={bookPlans} userProgress={userProgress} onStart={handleStartPlan} />
              <PlanRow title="Character Studies" icon="👤" plans={characterPlans} userProgress={userProgress} onStart={handleStartPlan} />
              <PlanRow title="Life & Relationships" icon="💪" plans={lifePlans} userProgress={userProgress} onStart={handleStartPlan} />
              <PlanRow title="Deep Dives (30+ days)" icon="🏔️" plans={deepDivePlans} userProgress={userProgress} onStart={handleStartPlan} />
              {seasonalPlans.length > 0 && (
                <PlanRow title="Seasonal" icon="🗓️" plans={seasonalPlans} userProgress={userProgress} onStart={handleStartPlan} />
              )}
              {plans.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-amber-700">No reading plans available yet.</p>
                </div>
              )}
            </>
          )}
        </ScrollWrap>
      </ScrollBackground>

      <FooterScroll />

      {/* Remove Confirmation Modal */}
      {removeConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-amber-50 rounded-lg shadow-xl max-w-md w-full p-6 border border-amber-200">
            <h3 className="text-lg font-semibold text-amber-900 mb-2">Remove Reading Plan?</h3>
            <p className="text-amber-700 mb-4">
              Are you sure you want to remove <span className="font-medium">"{removeConfirm.planTitle}"</span> from your reading list? Your progress will be lost.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setRemoveConfirm(null)}
                className="px-4 py-2 text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg font-medium transition-colors border border-amber-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemovePlan}
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </PreviewLayout>
  );
}
