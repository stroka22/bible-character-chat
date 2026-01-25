import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { readingPlansRepository } from '../repositories/readingPlansRepository';

function PlanCard({ plan, userProgress, onStart }) {
  const progress = userProgress?.find(p => p.plan_id === plan.id);
  const progressPercent = progress 
    ? Math.round((progress.completed_days?.length || 0) / plan.duration_days * 100)
    : 0;
  
  const difficultyColors = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    intensive: 'bg-red-100 text-red-800',
  };

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

  const activePlans = userProgress.filter(p => !p.is_completed);
  const featuredPlans = plans.filter(p => p.is_featured);
  const otherPlans = plans.filter(p => !p.is_featured);

  return (
    <div className="container mx-auto px-4 pt-24 pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bible Reading Plans</h1>
        <p className="text-gray-600">Structured plans to guide your daily Bible reading</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-gray-600">Loading plans...</div>
      ) : (
        <>
          {/* Active Plans */}
          {activePlans.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Active Plans</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activePlans.map(progress => (
                  <PlanCard 
                    key={progress.plan_id} 
                    plan={progress.plan} 
                    userProgress={userProgress}
                    onStart={handleStartPlan}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Featured Plans */}
          {featuredPlans.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Featured Plans</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredPlans.map(plan => (
                  <PlanCard 
                    key={plan.id} 
                    plan={plan} 
                    userProgress={userProgress}
                    onStart={handleStartPlan}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Other Plans */}
          {otherPlans.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">More Plans</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherPlans.map(plan => (
                  <PlanCard 
                    key={plan.id} 
                    plan={plan} 
                    userProgress={userProgress}
                    onStart={handleStartPlan}
                  />
                ))}
              </div>
            </div>
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
