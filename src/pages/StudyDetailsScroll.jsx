import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { bibleStudiesRepository } from '../repositories/bibleStudiesRepository';
import { characterRepository } from '../repositories/characterRepository';
import { chatRepository } from '../repositories/chatRepository';
import { usePremium } from '../hooks/usePremium';
import { useAuth } from '../contexts/AuthContext';
import { getSettings as getTierSettings } from '../services/tierSettingsService';
import UpgradeModal from '../components/modals/UpgradeModal';
import FooterScroll from '../components/FooterScroll';
import PreviewLayout from '../components/PreviewLayout';
import { ScrollWrap, ScrollDivider, ScrollBackground } from '../components/ScrollWrap';

const StudyDetailsScroll = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [premiumStudyIds, setPremiumStudyIds] = useState([]);
  
  const progressIdFromUrl = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('progress');
  }, [location.search]);
  
  const [study, setStudy] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [character, setCharacter] = useState(null);
  const [lessonCharacters, setLessonCharacters] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const { isPremium } = usePremium();
  const [progress, setProgress] = useState(null);
  const [togglingLesson, setTogglingLesson] = useState(null);
  
  const isStudyPremium = (s) => {
    if (!s) return false;
    if (s.is_premium) return true;
    if (premiumStudyIds.includes(s.id)) return true;
    return false;
  };

  useEffect(() => {
    (async () => {
      try {
        const settings = await getTierSettings();
        if (Array.isArray(settings?.premiumStudyIds)) {
          setPremiumStudyIds(settings.premiumStudyIds);
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    const fetchStudyDetails = async () => {
      try {
        setIsLoading(true);
        
        const studyData = await bibleStudiesRepository.getStudyById(id);
        if (!studyData) {
          setError('Study not found');
          setIsLoading(false);
          return;
        }
        
        setStudy(studyData);
        
        const lessonsData = await bibleStudiesRepository.listLessons(id);
        setLessons(lessonsData);

        if (user?.id) {
          try {
            const p = await bibleStudiesRepository.getProgress({ 
              userId: user.id, 
              studyId: id,
              progressId: progressIdFromUrl || undefined
            });
            setProgress(p);
          } catch {
            setProgress(null);
          }
        }
        
        if (studyData.character_id) {
          const characterData = await characterRepository.getById(studyData.character_id);
          setCharacter(characterData);
        }
        
        const lessonCharIds = [...new Set(
          lessonsData.filter(l => l.character_id && l.character_id !== studyData.character_id).map(l => l.character_id)
        )];
        if (lessonCharIds.length > 0) {
          const charMap = {};
          await Promise.all(lessonCharIds.map(async (cid) => {
            try {
              const c = await characterRepository.getById(cid);
              if (c) charMap[cid] = c;
            } catch {}
          }));
          setLessonCharacters(charMap);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching study details:', err);
        setError('Failed to load study details.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchStudyDetails();
  }, [id, isPremium, user?.id, progressIdFromUrl]);

  const nextLessonIndex = useMemo(() => {
    if (!lessons || lessons.length === 0) return 0;
    if (!progress) return 0;
    const completed = Array.isArray(progress.completed_lessons) ? progress.completed_lessons : [];
    for (let i = 0; i < lessons.length; i++) {
      if (!completed.includes(i)) return i;
    }
    return Math.min(progress.current_lesson_index ?? 0, lessons.length - 1);
  }, [lessons, progress]);

  const handleToggleComplete = async (e, lessonIndex) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user?.id || togglingLesson !== null) return;
    setTogglingLesson(lessonIndex);
    try {
      const completed = Array.isArray(progress?.completed_lessons) ? [...progress.completed_lessons] : [];
      const idx = completed.indexOf(lessonIndex);
      if (idx >= 0) {
        completed.splice(idx, 1);
      } else {
        completed.push(lessonIndex);
        completed.sort((a, b) => a - b);
      }
      const updated = await bibleStudiesRepository.saveProgress({
        userId: user.id,
        studyId: id,
        progressId: progress?.id,
        completedLessons: completed
      });
      setProgress(updated);
    } catch (err) {
      console.error('Error toggling lesson:', err);
    } finally {
      setTogglingLesson(null);
    }
  };

  return (
    <PreviewLayout>
      <ScrollBackground className="min-h-screen py-8 px-4">
        <ScrollWrap className="max-w-4xl mx-auto">
          {/* Navigation */}
          <div className="mb-4">
            <Link to="/" className="inline-flex items-center text-amber-700 hover:text-amber-900 text-sm mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Home
            </Link>
            <button onClick={() => navigate('/studies')} className="block text-amber-600 hover:text-amber-800 text-sm">
              ← Back to Studies
            </button>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600" />
                <p className="mt-4 text-amber-700">Loading study details...</p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center my-8">
              <p className="text-red-700 mb-4">{error}</p>
              <button onClick={() => navigate('/studies')} className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">
                Back to Studies
              </button>
            </div>
          )}

          {/* Study Content */}
          {!isLoading && !error && study && (
            <>
              {/* Header */}
              <div className="bg-white/80 border border-amber-200 rounded-xl p-6 mb-6">
                {study.cover_image_url && (
                  <div className="h-48 rounded-lg overflow-hidden mb-4">
                    <img src={study.cover_image_url} alt={study.title} className="w-full h-full object-cover" />
                  </div>
                )}
                
                <h1 className="text-2xl md:text-3xl font-bold text-amber-900 mb-3" style={{ fontFamily: 'Cinzel, serif' }}>
                  {study.title}
                </h1>
                
                {character && (
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400">
                      <img
                        src={character.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(character.name)}&background=random`}
                        alt={character.name}
                        className="w-full h-full object-cover"
                        style={{ objectPosition: 'center 8%' }}
                      />
                    </div>
                    <div>
                      <p className="text-amber-600 text-sm">Guided by</p>
                      <p className="text-amber-900 font-medium">{character.name}</p>
                    </div>
                  </div>
                )}
                
                <p className="text-amber-800 mb-4" style={{ fontFamily: 'Georgia, serif' }}>{study.description}</p>
                
                {isStudyPremium(study) && !isPremium && (
                  <div className="bg-amber-100 border border-amber-300 rounded-lg p-3 text-center">
                    <span className="text-amber-800 font-medium">Premium Study</span>
                    <button onClick={() => setShowUpgrade(true)} className="ml-3 px-3 py-1 bg-amber-600 text-white text-sm rounded hover:bg-amber-700">
                      Upgrade
                    </button>
                  </div>
                )}
              </div>

              <ScrollDivider className="my-6" />

              {/* Lessons */}
              <div>
                <h2 className="text-xl font-bold text-amber-900 mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
                  Lessons ({lessons.length})
                </h2>
                
                <div className="space-y-3">
                  {lessons.map((lesson, index) => {
                    const isCompleted = progress?.completed_lessons?.includes(index);
                    const isNext = index === nextLessonIndex;
                    const lessonChar = lesson.character_id ? lessonCharacters[lesson.character_id] : character;
                    
                    return (
                      <Link
                        key={lesson.id}
                        to={`/studies/${id}/lesson/${index}${progressIdFromUrl ? `?progress=${progressIdFromUrl}` : ''}`}
                        onClick={(e) => {
                          if (isStudyPremium(study) && !isPremium) {
                            e.preventDefault();
                            setShowUpgrade(true);
                          }
                        }}
                        className={`block bg-white/80 border rounded-xl p-4 transition-all hover:shadow-md ${
                          isNext ? 'border-amber-500 ring-2 ring-amber-300' : 'border-amber-200'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          {/* Completion checkbox */}
                          <button
                            onClick={(e) => handleToggleComplete(e, index)}
                            disabled={togglingLesson === index || !user}
                            className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                              isCompleted
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-amber-300 text-amber-400 hover:border-amber-500'
                            }`}
                          >
                            {togglingLesson === index ? (
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : isCompleted ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <span className="text-sm font-medium">{index + 1}</span>
                            )}
                          </button>
                          
                          {/* Lesson info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-amber-900 font-medium truncate">{lesson.title}</h3>
                            {lesson.scripture_refs?.length > 0 && (
                              <p className="text-amber-600 text-sm truncate">{lesson.scripture_refs.join(', ')}</p>
                            )}
                          </div>
                          
                          {/* Character avatar */}
                          {lessonChar && (
                            <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden border border-amber-300">
                              <img
                                src={lessonChar.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(lessonChar.name)}&background=random`}
                                alt={lessonChar.name}
                                className="w-full h-full object-cover"
                                style={{ objectPosition: 'center 8%' }}
                              />
                            </div>
                          )}
                          
                          {/* Arrow */}
                          <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                        
                        {isNext && !isCompleted && (
                          <div className="mt-2 text-amber-600 text-sm font-medium">Continue here →</div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </ScrollWrap>
      </ScrollBackground>
      <FooterScroll />
      
      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        message="Upgrade to access premium Bible studies."
      />
    </PreviewLayout>
  );
};

export default StudyDetailsScroll;
