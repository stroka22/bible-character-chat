import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { readingPlansRepository } from '../repositories/readingPlansRepository';
import { getOwnerSlug } from '../services/tierSettingsService';

// Compact card for horizontal scroll rows
function PlanCard({ plan, userProgress, onStart, onRemove, compact = false, showRemove = false, isCompleted = false }) {
  const progress = userProgress?.find(p => p.plan_id === plan.id);
  const completedDaysCount = progress?.completed_days?.length || 0;
  const progressPercent = progress 
    ? Math.round(completedDaysCount / plan.duration_days * 100)
    : 0;
  const currentDay = progress?.current_day || 1;
  
  const difficultyColors = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    intensive: 'bg-red-100 text-red-800',
  };

  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRemove) onRemove(plan.id, plan.title);
  };

  if (compact) {
    return (
      <div className="relative flex-shrink-0 w-72">
        {/* Remove Button */}
        {showRemove && (
          <button
            onClick={handleRemove}
            className="absolute -top-2 -right-2 z-10 bg-gray-800 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transition-colors"
            title="Remove from Continue Reading"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        
        <Link 
          to={`/reading-plans/${plan.slug}`}
          className="block bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer h-[220px] flex flex-col"
        >
          <div className="p-4 flex flex-col h-full">
            <div className="flex items-start justify-between mb-1">
              <h3 className="text-base font-semibold text-gray-900 line-clamp-2 leading-tight">{plan.title}</h3>
            </div>
            
            <p 
              className="text-gray-500 text-sm mb-3 line-clamp-2 flex-shrink-0" 
              title={plan.description}
            >
              {plan.description}
            </p>
            
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="text-xs text-gray-500">{plan.duration_days} days</span>
              <span className="text-gray-300">•</span>
              <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${difficultyColors[plan.difficulty] || difficultyColors.medium}`}>
                {plan.difficulty}
              </span>
            </div>

            <div className="mt-auto">
              {isCompleted ? (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-green-600 font-medium">Completed!</span>
                  </div>
                  <span className="block w-full text-center bg-green-600 text-white text-sm font-medium py-1.5 px-3 rounded-lg">
                    View / Restart
                  </span>
                </div>
              ) : progress ? (
                <div>
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Day {currentDay} of {plan.duration_days}</span>
                    <span>{progressPercent}% complete</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                    <div 
                      className="bg-blue-600 h-1.5 rounded-full transition-all" 
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <span className="block w-full text-center bg-blue-600 text-white text-sm font-medium py-1.5 px-3 rounded-lg">
                    Continue Reading
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
          </div>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{plan.title}</h3>
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
          className="flex gap-4 overflow-x-auto pb-2 pt-3 pl-1 scrollbar-hide"
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
  const [completedProgress, setCompletedProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removeConfirm, setRemoveConfirm] = useState(null);

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

  const [searchQuery, setSearchQuery] = useState('');

  // Filter plans by search
  const filteredPlans = searchQuery 
    ? plans.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : plans;

  // Get active plans (filter out any null plans)
  const activePlans = userProgress.filter(p => !p.is_completed && p.plan).map(p => p.plan);
  
  // Get completed plans (filter out any null plans)
  const completedPlans = completedProgress.filter(p => p.plan).map(p => p.plan);

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
          {/* Your Active Plans - with remove option */}
          {activePlans.length > 0 && (
            <PlanRow 
              title="Continue Reading" 
              icon="📖"
              plans={activePlans}
              userProgress={userProgress}
              onStart={handleStartPlan}
              onRemove={handleRemovePlan}
              showRemove={true}
            />
          )}

          {/* Completed Plans */}
          {completedPlans.length > 0 && (
            <PlanRow 
              title="Completed" 
              icon="✅"
              plans={completedPlans}
              userProgress={completedProgress}
              onStart={handleStartPlan}
              isCompletedRow={true}
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

      {/* Remove Confirmation Modal */}
      {removeConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Remove Reading Plan?</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to remove <span className="font-medium">"{removeConfirm.planTitle}"</span> from your reading list? Your progress will be lost.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setRemoveConfirm(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
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
    </div>
  );
}
