import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { bibleStudiesRepository } from '../repositories/bibleStudiesRepository';
import { characterRepository } from '../repositories/characterRepository';
import { chatRepository } from '../repositories/chatRepository';
import { usePremium } from '../hooks/usePremium';
import UpgradeModal from '../components/modals/UpgradeModal';
import FooterScroll from '../components/FooterScroll';
import PreviewLayout from '../components/PreviewLayout';
import { ScrollWrap, ScrollDivider, ScrollBackground } from '../components/ScrollWrap';
import { useAuth } from '../contexts/AuthContext';

const StudyLessonScroll = () => {
  const { id, lessonIndex } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const progressIdFromUrl = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('progress');
  }, [location.search]);
  
  const [study, setStudy] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [character, setCharacter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const { isPremium } = usePremium();
  const [progress, setProgress] = useState(null);
  const [isSavingProgress, setIsSavingProgress] = useState(false);

  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        setIsLoading(true);
        
        const studyData = await bibleStudiesRepository.getStudyById(id);
        if (!studyData) {
          setError('Study not found');
          setIsLoading(false);
          return;
        }
        
        setStudy(studyData);
        
        if (studyData.is_premium && !isPremium) {
          setShowUpgrade(true);
          setIsLoading(false);
          return;
        }
        
        const idx = parseInt(lessonIndex, 10);
        let lessonData = await bibleStudiesRepository.getLessonByIndex(id, idx);
        
        if (!lessonData) {
          if (idx === 0 && (studyData?.description || '').trim().length) {
            lessonData = {
              id: 'synthetic-intro',
              study_id: id,
              order_index: 0,
              title: 'Introduction',
              scripture_refs: [],
              summary: studyData.description,
              prompts: [],
              character_id: studyData.character_id || null,
            };
          } else {
            const all = await bibleStudiesRepository.listLessons(id);
            if (all?.length > 0) {
              const first = all.reduce((min, cur) => (cur.order_index < min ? cur.order_index : min), all[0].order_index);
              if (first !== idx) {
                navigate(`/studies/${id}/lesson/${first}`, { replace: true });
                return;
              }
            }
          }
        }

        if (!lessonData) {
          setError('Lesson not found');
          setIsLoading(false);
          return;
        }

        setLesson(lessonData);

        const allLessons = await bibleStudiesRepository.listLessons(id);
        setLessons(allLessons || []);
        
        if (user?.id) {
          try {
            const fetchedProgress = await bibleStudiesRepository.getProgress({ 
              userId: user.id, 
              studyId: id,
              progressId: progressIdFromUrl || undefined
            });
            setProgress(fetchedProgress);
            
            // Save current progress
            const progressIdToUse = fetchedProgress?.id || progressIdFromUrl || undefined;
            (async () => {
              try {
                setIsSavingProgress(true);
                await bibleStudiesRepository.saveProgress({
                  userId: user.id,
                  studyId: id,
                  progressId: progressIdToUse,
                  currentLessonIndex: parseInt(lessonIndex, 10)
                });
              } catch {} finally {
                setIsSavingProgress(false);
              }
            })();
          } catch {
            setProgress(null);
          }
        }
        
        const characterId = lessonData.character_id || studyData.character_id;
        if (characterId) {
          const characterData = await characterRepository.getById(characterId);
          setCharacter(characterData);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching lesson:', err);
        setError('Failed to load lesson.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id && lessonIndex !== undefined) fetchLessonData();
  }, [id, lessonIndex, isPremium, user?.id, progressIdFromUrl]);

  const totalLessons = lessons?.length || 0;
  const currentIndex = useMemo(() => parseInt(lessonIndex ?? '0', 10) || 0, [lessonIndex]);
  const isCompleted = useMemo(() => {
    const completed = Array.isArray(progress?.completed_lessons) ? progress.completed_lessons : [];
    return completed.includes(currentIndex);
  }, [progress, currentIndex]);

  const handleToggleComplete = async () => {
    if (!user?.id || !study) return;
    try {
      setIsSavingProgress(true);
      const completed = Array.isArray(progress?.completed_lessons) ? [...progress.completed_lessons] : [];
      const idx = completed.indexOf(currentIndex);
      if (idx >= 0) {
        completed.splice(idx, 1);
      } else {
        completed.push(currentIndex);
        completed.sort((a, b) => a - b);
      }
      const updated = await bibleStudiesRepository.saveProgress({
        userId: user.id,
        studyId: id,
        progressId: progress?.id || progressIdFromUrl || undefined,
        currentLessonIndex: currentIndex,
        completedLessons: completed
      });
      setProgress(updated);
    } catch (err) {
      console.error('Error saving completion:', err);
    } finally {
      setIsSavingProgress(false);
    }
  };

  const goToPrev = async () => {
    const prev = Math.max(currentIndex - 1, 0);
    if (prev === currentIndex) return;
    if (user?.id) {
      try {
        setIsSavingProgress(true);
        await bibleStudiesRepository.saveProgress({ 
          userId: user.id, 
          studyId: id, 
          progressId: progress?.id || progressIdFromUrl || undefined,
          currentLessonIndex: prev 
        });
      } finally {
        setIsSavingProgress(false);
      }
    }
    navigate(`/studies/${id}/lesson/${prev}${progressIdFromUrl ? `?progress=${progressIdFromUrl}` : ''}`);
  };

  const goToNext = async () => {
    const next = Math.min(currentIndex + 1, Math.max(totalLessons - 1, 0));
    if (next === currentIndex) return;
    if (user?.id) {
      try {
        setIsSavingProgress(true);
        await bibleStudiesRepository.saveProgress({ 
          userId: user.id, 
          studyId: id, 
          progressId: progress?.id || progressIdFromUrl || undefined,
          currentLessonIndex: next 
        });
      } finally {
        setIsSavingProgress(false);
      }
    }
    navigate(`/studies/${id}/lesson/${next}${progressIdFromUrl ? `?progress=${progressIdFromUrl}` : ''}`);
  };

  const handleStartChat = async () => {
    if (study?.is_premium && !isPremium) {
      setShowUpgrade(true);
      return;
    }
    
    if (character) {
      const progressToUse = progress?.id || progressIdFromUrl;
      
      if (progressToUse) {
        try {
          const existingChats = await chatRepository.getChatsByProgress(progressToUse);
          if (existingChats?.length > 0) {
            navigate(`/chat/${existingChats[0].id}`);
            return;
          }
        } catch {}
      }
      
      const params = { character: character.id, study: id, lesson: lessonIndex };
      if (progressToUse) params.progress = progressToUse;
      navigate(`/chat?${new URLSearchParams(params).toString()}`);
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
            <button onClick={() => navigate(`/studies/${id}`)} className="block text-amber-600 hover:text-amber-800 text-sm">
              ← Back to Study
            </button>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600" />
                <p className="mt-4 text-amber-700">Loading lesson...</p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center my-8">
              <p className="text-red-700 mb-4">{error}</p>
              <button onClick={() => navigate(`/studies/${id}`)} className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">
                Return to Study
              </button>
            </div>
          )}

          {/* Lesson Content */}
          {!isLoading && !error && study && lesson && (
            <>
              {/* Lesson Header */}
              <div className="bg-white/80 border border-amber-200 rounded-xl p-6 mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-amber-900 mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
                  Lesson {parseInt(lessonIndex, 10) + 1}: {lesson.title}
                </h1>
                <p className="text-amber-600 mb-4">{study.title}</p>
                
                {character && (
                  <div className="flex items-center gap-3">
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
              </div>

              {/* Scripture References */}
              {lesson.scripture_refs?.length > 0 && (
                <div className="bg-white/80 border border-amber-200 rounded-xl p-6 mb-6">
                  <h2 className="text-lg font-bold text-amber-900 mb-3">Scripture References</h2>
                  <div className="flex flex-wrap gap-2">
                    {lesson.scripture_refs.map((ref, i) => (
                      <span key={i} className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full border border-amber-200 text-sm">
                        {ref}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary */}
              {lesson.summary && (
                <div className="bg-white/80 border border-amber-200 rounded-xl p-6 mb-6">
                  <h2 className="text-lg font-bold text-amber-900 mb-3">Summary</h2>
                  <p className="text-amber-800 whitespace-pre-line" style={{ fontFamily: 'Georgia, serif' }}>{lesson.summary}</p>
                </div>
              )}

              {/* Discussion Prompts */}
              {lesson.prompts?.length > 0 && (
                <div className="bg-white/80 border border-amber-200 rounded-xl p-6 mb-6">
                  <h2 className="text-lg font-bold text-amber-900 mb-3">Discussion Prompts</h2>
                  <ul className="space-y-3">
                    {lesson.prompts.map((prompt, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-medium">
                          {i + 1}
                        </span>
                        <span className="text-amber-800" style={{ fontFamily: 'Georgia, serif' }}>{prompt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <ScrollDivider className="my-6" />

              {/* Actions */}
              <div className="space-y-4">
                {/* Completion Toggle */}
                <button
                  onClick={handleToggleComplete}
                  disabled={isSavingProgress || !user}
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    isCompleted
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300'
                  }`}
                >
                  {isSavingProgress ? 'Saving...' : isCompleted ? '✓ Completed' : 'Mark as Complete'}
                </button>

                {/* Chat with Character */}
                {character && (
                  <button
                    onClick={handleStartChat}
                    className="w-full py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
                  >
                    Discuss with {character.name}
                  </button>
                )}

                {/* Navigation */}
                <div className="flex gap-3">
                  <button
                    onClick={goToPrev}
                    disabled={currentIndex === 0}
                    className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                      currentIndex === 0
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-white border border-amber-300 text-amber-700 hover:bg-amber-50'
                    }`}
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={goToNext}
                    disabled={currentIndex >= totalLessons - 1}
                    className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                      currentIndex >= totalLessons - 1
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-white border border-amber-300 text-amber-700 hover:bg-amber-50'
                    }`}
                  >
                    Next →
                  </button>
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

export default StudyLessonScroll;
