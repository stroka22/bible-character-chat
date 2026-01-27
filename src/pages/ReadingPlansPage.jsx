import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { readingPlansRepository } from '../repositories/readingPlansRepository';

// Compact card for horizontal scroll rows
function PlanCard({ plan, userProgress, onStart, compact = false }) {
  const progress = userProgress?.find(p => p.plan_id === plan.id);
  const progressPercent = progress 
    ? Math.round((progress.completed_days?.length || 0) / plan.duration_days * 100)
    : 0;
  
  const difficultyColors = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    intensive: 'bg-red-100 text-red-800',
  };

  if (compact) {
    return (
      <Link 
        to={`/reading-plans/${plan.slug}`}
        className="flex-shrink-0 w-80 bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer block"
      >
        <div className="p-4">
          <div className="flex items-start justify-between mb-1">
            <h3 className="text-base font-semibold text-gray-900 line-clamp-2 leading-tight">{plan.title}</h3>
          </div>
          
          <p className="text-gray-500 text-sm mb-3">{plan.description}</p>
          
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-xs text-gray-500">{plan.duration_days} days</span>
            <span className="text-gray-300">•</span>
            <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${difficultyColors[plan.difficulty] || difficultyColors.medium}`}>
              {plan.difficulty}
            </span>
            {plan.is_featured && (
              <>
                <span className="text-gray-300">•</span>
                <span className="text-xs text-blue-600">★ Featured</span>
              </>
            )}
          </div>

          {progress ? (
            <div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full transition-all" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="block w-full text-center bg-blue-600 text-white text-sm font-medium py-1.5 px-3 rounded-lg">
                Continue ({progressPercent}%)
              </span>
            </div>
          ) : (
            <span
              className="block w-full text-center bg-gray-100 text-gray-900 text-sm font-medium py-1.5 px-3 rounded-lg"
            >
              View Plan
            </span>
          )}
        </div>
      </Link>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{plan.title}</h3>
          {plan.is_featured && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">Featured</span>
          )}
        </div>
        
        <p className="text-gray-600 text-sm mb-3">{plan.description}</p>
        
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-gray-500">{plan.duration_days} days</span>
          <span className="text-gray-300">•</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded ${difficultyColors[plan.difficulty] || difficultyColors.medium}`}>
            {plan.difficulty}
          </span>
        </div>

        {progress ? (
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">Progress</span>
              <span className="text-gray-900 font-medium">{progressPercent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <Link 
              to={`/reading-plans/${plan.slug}`}
              className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Continue Reading
            </Link>
          </div>
        ) : (
          <button
            onClick={() => onStart(plan.id)}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Start Plan
          </button>
        )}
      </div>
    </div>
  );
}

// Horizontal scroll row component
function PlanRow({ title, plans, userProgress, onStart, icon }) {
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
      const scrollAmount = 300;
      scrollRef.current.scrollBy({ 
        left: direction === 'left' ? -scrollAmount : scrollAmount, 
        behavior: 'smooth' 
      });
    }
  };

  if (!plans || plans.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
        {icon && <span>{icon}</span>}
        {title}
        <span className="text-sm font-normal text-gray-500">({plans.length})</span>
      </h2>
      <div className="relative group">
        {/* Left Arrow */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        
        {/* Scrollable Container */}
        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {plans.map(plan => (
            <PlanCard 
              key={plan.id} 
              plan={plan} 
              userProgress={userProgress}
              onStart={onStart}
              compact
            />
          ))}
        </div>

        {/* Right Arrow */}
        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export default function ReadingPlansPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [userProgress, setUserProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [allPlans, progress] = await Promise.all([
        readingPlansRepository.getAll(),
        user ? readingPlansRepository.getUserPlans(user.id) : [],
      ]);
      setPlans(allPlans);
      setUserProgress(progress);
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

  const [searchQuery, setSearchQuery] = useState('');

  // Filter plans by search
  const filteredPlans = searchQuery 
    ? plans.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : plans;

  // Get active plans
  const activePlans = userProgress.filter(p => !p.is_completed).map(p => p.plan);

  // Organize plans by category
  const featuredPlans = filteredPlans.filter(p => p.is_featured);
  const foundationalPlans = filteredPlans.filter(p => p.category === 'foundational');
  const bookPlans = filteredPlans.filter(p => p.category === 'book');
  const topicalPlans = filteredPlans.filter(p => p.category === 'topical');
  const characterPlans = filteredPlans.filter(p => p.category === 'character');
  const lifePlans = filteredPlans.filter(p => p.category === 'life');
  const seasonalPlans = filteredPlans.filter(p => p.category === 'seasonal');
  
  // Quick-start plans (7 days or less)
  const quickPlans = filteredPlans.filter(p => p.duration_days <= 7);
  
  // Deep dive plans (30+ days)
  const deepDivePlans = filteredPlans.filter(p => p.duration_days >= 30);

  // Beginner-friendly (easy difficulty)
  const beginnerPlans = filteredPlans.filter(p => p.difficulty === 'easy');

  return (
    <div className="container mx-auto px-4 pt-24 pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bible Reading Plans</h1>
        <p className="text-gray-600 mb-4">Explore {plans.length} plans to guide your daily Bible reading</p>
        
        {/* Search Bar */}
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search plans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-gray-600">Loading plans...</div>
      ) : searchQuery ? (
        // Search Results - show as grid
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Search Results ({filteredPlans.length})
          </h2>
          {filteredPlans.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredPlans.map(plan => (
                <PlanCard 
                  key={plan.id} 
                  plan={plan} 
                  userProgress={userProgress}
                  onStart={handleStartPlan}
                  compact
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No plans found matching "{searchQuery}"</p>
          )}
        </div>
      ) : (
        // Netflix-style rows
        <>
          {/* Your Active Plans */}
          {activePlans.length > 0 && (
            <PlanRow 
              title="Continue Reading" 
              icon="📖"
              plans={activePlans}
              userProgress={userProgress}
              onStart={handleStartPlan}
            />
          )}

          {/* Featured Plans */}
          <PlanRow 
            title="Featured Plans" 
            icon="⭐"
            plans={featuredPlans}
            userProgress={userProgress}
            onStart={handleStartPlan}
          />

          {/* Quick Start */}
          <PlanRow 
            title="Quick Start (7 days or less)" 
            icon="⚡"
            plans={quickPlans}
            userProgress={userProgress}
            onStart={handleStartPlan}
          />

          {/* New to Faith / Foundational */}
          <PlanRow 
            title="New to the Bible" 
            icon="🌱"
            plans={foundationalPlans}
            userProgress={userProgress}
            onStart={handleStartPlan}
          />

          {/* Beginner Friendly */}
          <PlanRow 
            title="Beginner Friendly" 
            icon="👋"
            plans={beginnerPlans.filter(p => !foundationalPlans.includes(p)).slice(0, 15)}
            userProgress={userProgress}
            onStart={handleStartPlan}
          />

          {/* Topical Studies */}
          <PlanRow 
            title="Topical Studies" 
            icon="🎯"
            plans={topicalPlans}
            userProgress={userProgress}
            onStart={handleStartPlan}
          />

          {/* Book Studies */}
          <PlanRow 
            title="Book Studies" 
            icon="📚"
            plans={bookPlans}
            userProgress={userProgress}
            onStart={handleStartPlan}
          />

          {/* Character Studies */}
          <PlanRow 
            title="Character Studies" 
            icon="👤"
            plans={characterPlans}
            userProgress={userProgress}
            onStart={handleStartPlan}
          />

          {/* Life Situations */}
          <PlanRow 
            title="Life & Relationships" 
            icon="💪"
            plans={lifePlans}
            userProgress={userProgress}
            onStart={handleStartPlan}
          />

          {/* Deep Dives */}
          <PlanRow 
            title="Deep Dives (30+ days)" 
            icon="🏔️"
            plans={deepDivePlans}
            userProgress={userProgress}
            onStart={handleStartPlan}
          />

          {/* Seasonal */}
          {seasonalPlans.length > 0 && (
            <PlanRow 
              title="Seasonal" 
              icon="🗓️"
              plans={seasonalPlans}
              userProgress={userProgress}
              onStart={handleStartPlan}
            />
          )}

          {plans.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No reading plans available yet.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
