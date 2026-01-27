import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { readingPlansRepository } from '../repositories/readingPlansRepository';
import { getBestCharacterSuggestion } from '../utils/characterSuggestions';

function DayCard({ day, isCompleted, isCurrent, onSelect }) {
  return (
    <button
      onClick={() => onSelect(day.day_number)}
      className={`p-4 rounded-lg border text-left transition-all ${
        isCompleted 
          ? 'bg-green-50 border-green-200 hover:bg-green-100' 
          : isCurrent 
            ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-300 hover:bg-blue-100'
            : 'bg-white border-gray-200 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-medium ${isCompleted ? 'text-green-700' : isCurrent ? 'text-blue-700' : 'text-gray-500'}`}>
          Day {day.day_number}
        </span>
        {isCompleted && (
          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      {day.title && (
        <h4 className="font-medium text-gray-900 text-sm">{day.title}</h4>
      )}
      <p className="text-xs text-gray-500 mt-1">
        {day.readings?.map(r => `${r.book} ${r.chapter}`).join(', ')}
      </p>
    </button>
  );
}

function ReadingView({ day, plan, onComplete, onBack, navigate }) {
  const readings = day.readings || [];
  const suggestedCharacter = getBestCharacterSuggestion(readings, plan.title);
  const chatContext = encodeURIComponent(`Today's reading: ${readings.map(r => `${r.book} ${r.chapter}${r.verses ? ':' + r.verses : ''}`).join(', ')} from "${plan.title}"`);
  const reflectionContext = encodeURIComponent(`I'm reading ${day.title || `Day ${day.day_number}`} from the "${plan.title}" reading plan. Today's passages: ${readings.map(r => `${r.book} ${r.chapter}${r.verses ? ':' + r.verses : ''}`).join(', ')}. ${day.reflection_prompt || ''}`);
  const characterParam = encodeURIComponent(suggestedCharacter);
  
  return (
    <div className="max-w-3xl mx-auto">
      <button 
        onClick={onBack}
        className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-1"
      >
        ← Back to Plan
      </button>
      
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="mb-6">
          <span className="text-sm text-blue-600 font-medium">Day {day.day_number} of {plan.duration_days}</span>
          <h2 className="text-2xl font-bold text-gray-900 mt-1">{day.title || `Day ${day.day_number}`}</h2>
        </div>

        {/* Context/Teaching Section */}
        {day.context && (
          <div className="mb-6 p-5 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">📖 Today's Teaching</h3>
            <div className="text-blue-900 prose prose-sm max-w-none">
              {day.context.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="mb-3 last:mb-0 leading-relaxed">{paragraph}</p>
              ))}
            </div>
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">📜 Today's Scripture</h3>
          <div className="space-y-2">
            {readings.map((reading, idx) => (
              <Link
                key={idx}
                to={`/bible/KJV/${reading.book}/${reading.chapter}`}
                className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="font-medium text-gray-900">
                  {reading.book} {reading.chapter}
                  {reading.verses && `:${reading.verses}`}
                </span>
                <span className="text-blue-600">Read →</span>
              </Link>
            ))}
          </div>
        </div>

        {day.reflection_prompt && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-sm font-semibold text-yellow-800 mb-2">💭 Reflection Question</h3>
            <p className="text-yellow-900">{day.reflection_prompt}</p>
            <Link
              to={`/chat?character=${characterParam}&context=${reflectionContext}`}
              className="inline-block mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Discuss this with {suggestedCharacter} →
            </Link>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onComplete}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Mark Complete ✓
          </button>
          <button
            onClick={() => {
              const reading = readings[0];
              if (reading) {
                navigate(`/bible/KJV/${reading.book}/${reading.chapter}`);
              }
            }}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Open in Bible Reader
          </button>
          <Link
            to={`/chat?character=${characterParam}&context=${chatContext}`}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors text-center"
          >
            Chat with {suggestedCharacter}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ReadingPlanDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [plan, setPlan] = useState(null);
  const [days, setDays] = useState([]);
  const [progress, setProgress] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPlan();
  }, [slug, user]);

  const loadPlan = async () => {
    setLoading(true);
    setError('');
    try {
      const planData = await readingPlansRepository.getBySlug(slug);
      if (!planData) {
        setError('Plan not found');
        return;
      }
      setPlan(planData);
      
      const [daysData, progressData] = await Promise.all([
        readingPlansRepository.getPlanDays(planData.id),
        user ? readingPlansRepository.getUserProgress(user.id, planData.id) : null,
      ]);
      
      setDays(daysData);
      setProgress(progressData);
      
      // If user has progress, show their current day
      if (progressData && !selectedDay) {
        const currentDayData = daysData.find(d => d.day_number === progressData.current_day);
        if (currentDayData) {
          setSelectedDay(currentDayData);
        }
      }
    } catch (e) {
      console.error('Error loading plan:', e);
      setError('Failed to load plan');
    } finally {
      setLoading(false);
    }
  };

  const handleStartPlan = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const newProgress = await readingPlansRepository.startPlan(user.id, plan.id);
      setProgress(newProgress);
      const firstDay = days.find(d => d.day_number === 1);
      if (firstDay) setSelectedDay(firstDay);
    } catch (e) {
      console.error('Error starting plan:', e);
      setError('Failed to start plan');
    }
  };

  const handleSelectDay = (dayNumber) => {
    const day = days.find(d => d.day_number === dayNumber);
    if (day) setSelectedDay(day);
  };

  const handleCompleteDay = async () => {
    if (!user || !progress || !selectedDay) return;
    try {
      const updatedProgress = await readingPlansRepository.completeDay(
        user.id, 
        plan.id, 
        selectedDay.day_number,
        plan.duration_days
      );
      setProgress(updatedProgress);
      
      // Move to next day if available
      const nextDay = days.find(d => d.day_number === selectedDay.day_number + 1);
      if (nextDay) {
        setSelectedDay(nextDay);
      } else {
        setSelectedDay(null); // Plan complete
      }
    } catch (e) {
      console.error('Error completing day:', e);
      setError('Failed to mark day complete');
    }
  };

  const completedDays = new Set(progress?.completed_days || []);
  const progressPercent = progress 
    ? Math.round((completedDays.size / plan?.duration_days) * 100)
    : 0;

  if (loading) {
    return (
      <div className="container mx-auto px-4 pt-24 pb-12">
        <p className="text-gray-600">Loading plan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
        <Link to="/reading-plans" className="text-blue-600 hover:text-blue-700">
          ← Back to Reading Plans
        </Link>
      </div>
    );
  }

  if (!plan) return null;

  return (
    <div className="container mx-auto px-4 pt-24 pb-12">
      {selectedDay ? (
        <ReadingView 
          day={selectedDay} 
          plan={plan}
          onComplete={handleCompleteDay}
          onBack={() => setSelectedDay(null)}
          navigate={navigate}
        />
      ) : (
        <>
          {/* Plan Header */}
          <div className="mb-8">
            <Link to="/reading-plans" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
              ← All Plans
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{plan.title}</h1>
            <p className="text-gray-600 mb-4">{plan.description}</p>
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>{plan.duration_days} days</span>
              <span>•</span>
              <span className="capitalize">{plan.difficulty}</span>
            </div>
          </div>

          {/* Progress Bar */}
          {progress && (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Your Progress</span>
                <span className="text-gray-900 font-medium">{completedDays.size} of {plan.duration_days} days ({progressPercent}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Start Button */}
          {!progress && (
            <div className="mb-6">
              <button
                onClick={handleStartPlan}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Start This Plan
              </button>
            </div>
          )}

          {/* Days Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {days.map(day => (
              <DayCard
                key={day.id}
                day={day}
                isCompleted={completedDays.has(day.day_number)}
                isCurrent={progress?.current_day === day.day_number}
                onSelect={handleSelectDay}
              />
            ))}
          </div>

          {progress?.is_completed && (
            <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg text-center">
              <h3 className="text-xl font-semibold text-green-800 mb-2">🎉 Congratulations!</h3>
              <p className="text-green-700">You've completed this reading plan!</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
