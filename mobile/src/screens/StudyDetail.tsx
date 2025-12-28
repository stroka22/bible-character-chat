import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, Text, TouchableOpacity, View, Image, Alert, Share } from 'react-native';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { chat } from '../lib/chat';
import { generateCharacterResponse } from '../lib/api';
import { getStudyProgress, toggleLessonComplete, getProgressPercent, saveStudyProgress, StudyProgress } from '../lib/studyProgress';
import { theme } from '../theme';

type LessonPrompt = {
  text?: string;
};

type Lesson = {
  id: string;
  title: string;
  order_index: number;
  summary?: string | null;
  character_id?: string | null;
  prompts?: LessonPrompt[] | null;
  scripture_refs?: string[] | null;
};

export default function StudyDetail({ route, navigation }: any) {
  const { studyId, title, progressId: routeProgressId } = route.params as { studyId: string; title: string; progressId?: string };
  const { user } = useAuth();
  const isFocused = useIsFocused();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [studyMeta, setStudyMeta] = useState<{ character_id?: string | null; character_instructions?: string | null } | null>(null);
  const [guide, setGuide] = useState<{ id: string; name: string; avatar_url?: string | null; persona_prompt?: string | null } | null>(null);
  const [lessonCharacters, setLessonCharacters] = useState<Record<string, { id: string; name: string; avatar_url?: string | null }>>({});
  const [progress, setProgress] = useState<StudyProgress | null>(null);
  const [togglingLesson, setTogglingLesson] = useState<number | null>(null);
  const [lessonChats, setLessonChats] = useState<Record<string, any[]>>({});

  const loadData = async () => {
    setLoading(true);
    let studyCharId: string | null = null;
    try {
      const { data: s, error: studyError } = await supabase
        ?.from('bible_studies')
        .select('character_id,character_instructions')
        .eq('id', studyId)
        .maybeSingle() as any;
      
      console.log('[StudyDetail] Loaded study meta:', { 
        studyId, 
        hasData: !!s, 
        character_id: s?.character_id,
        character_instructions_length: s?.character_instructions?.length || 0,
        character_instructions_preview: s?.character_instructions?.substring(0, 100),
        error: studyError?.message
      });
      
      setStudyMeta(s || {});
      studyCharId = s?.character_id || null;
      if (s?.character_id) {
        const { data: c } = await supabase
          .from('characters')
          .select('id,name,avatar_url,persona_prompt')
          .eq('id', s.character_id)
          .maybeSingle();
        if (c) setGuide(c as any);
      }
    } catch {}
    const { data } = await supabase
      ?.from('bible_study_lessons')
      .select('id,title,order_index,summary,character_id,prompts,scripture_refs')
      .eq('study_id', studyId)
      .order('order_index', { ascending: true }) as any;
    const lessonsData = data || [];
    setLessons(lessonsData);
    
    // Fetch lesson-specific characters (different from study's default)
    const lessonCharIds = [...new Set(
      lessonsData
        .filter((l: Lesson) => l.character_id && l.character_id !== studyCharId)
        .map((l: Lesson) => l.character_id)
    )].filter(Boolean) as string[];
    
    if (lessonCharIds.length > 0) {
      const { data: chars } = await supabase
        .from('characters')
        .select('id,name,avatar_url')
        .in('id', lessonCharIds);
      if (chars) {
        const charMap: Record<string, { id: string; name: string; avatar_url?: string | null }> = {};
        chars.forEach((c: any) => { charMap[c.id] = c; });
        setLessonCharacters(charMap);
      }
    }
    
    // Load progress (use routeProgressId if provided)
    if (user?.id) {
      const p = await getStudyProgress(user.id, studyId, routeProgressId);
      setProgress(p);
      
      // Load existing chats for this progress
      const currentProgressId = routeProgressId || p?.id;
      if (currentProgressId) {
        const existingChats = await chat.getChatsByProgress(currentProgressId);
        // Group chats by lesson_id
        const chatsByLesson: Record<string, any[]> = {};
        for (const c of existingChats) {
          const lessonId = (c as any).lesson_id;
          if (lessonId) {
            if (!chatsByLesson[lessonId]) chatsByLesson[lessonId] = [];
            chatsByLesson[lessonId].push(c);
          }
        }
        setLessonChats(chatsByLesson);
      }
    }
    setLoading(false);
  };

  // Always reload data when screen comes into focus (e.g., after marking lesson complete)
  useEffect(() => {
    if (isFocused) {
      console.log('[StudyDetail] Screen focused, reloading data...');
      loadData();
    }
  }, [isFocused]);

  const completedLessons = progress?.completed_lessons || [];
  const progressPercent = getProgressPercent(completedLessons, lessons.length);

  const handleToggleComplete = async (lessonIndex: number) => {
    if (!user?.id || togglingLesson !== null) return;
    setTogglingLesson(lessonIndex);
    try {
      const { progress: updated, isNowComplete } = await toggleLessonComplete(user.id, studyId, lessonIndex);
      setProgress(updated);
      // Check if study is now complete
      if (isNowComplete && updated) {
        const newPercent = getProgressPercent(updated.completed_lessons || [], lessons.length);
        if (newPercent === 100) {
          Alert.alert('Congratulations!', `You've completed all lessons in "${title}"!`);
        }
      }
    } catch (e) {
      console.warn('[StudyDetail] toggleComplete error:', e);
    } finally {
      setTogglingLesson(null);
    }
  };

  async function startLesson(lesson: Lesson) {
    if (!user || starting) return;
    setStarting(true);
    try {
      // Get or create progress record
      let currentProgressId = routeProgressId || progress?.id;
      
      // If no progress exists, create one
      if (!currentProgressId) {
        console.log('[StudyDetail] Creating new progress record for study:', studyId);
        const newProgress = await saveStudyProgress({
          userId: user.id,
          studyId: studyId,
          currentLessonIndex: lesson.order_index,
          completedLessons: []
        });
        console.log('[StudyDetail] New progress result:', newProgress);
        if (newProgress?.id) {
          currentProgressId = newProgress.id;
          setProgress(newProgress);
        } else {
          console.error('[StudyDetail] Failed to create progress record');
          alert('Failed to start lesson. Please try again.');
          setStarting(false);
          return;
        }
      } else {
        // Update current lesson index
        await saveStudyProgress({
          userId: user.id,
          studyId: studyId,
          progressId: currentProgressId,
          currentLessonIndex: lesson.order_index
        });
      }
      
      // Check if there's an existing chat for this lesson and progress
      if (currentProgressId) {
        const existingChats = await chat.getChatsByProgress(currentProgressId);
        const lessonChat = existingChats.find((c: any) => c.lesson_id === lesson.id);
        if (lessonChat) {
          // Resume existing chat - pass character for avatar display
          const targetCharacterId = lesson.character_id || studyMeta?.character_id || null;
          let char = guide;
          if (targetCharacterId && (!char || char.id !== targetCharacterId)) {
            const { data: c } = await supabase
              .from('characters')
              .select('id,name,persona_prompt,avatar_url')
              .eq('id', targetCharacterId)
              .maybeSingle();
            if (c) char = c as any;
          }
          navigation.navigate('MainTabs', {
            screen: 'Chat',
            params: {
              screen: 'ChatDetail',
              params: { chatId: lessonChat.id, character: char }
            }
          } as any);
          setStarting(false);
          return;
        }
      }
      
      // Determine which character to use: lesson override > study default
      const targetCharacterId = lesson.character_id || studyMeta?.character_id || null;
      
      // Fetch character if set
      let char = guide;
      // If lesson has its own character or we don't have guide loaded, fetch it
      if (targetCharacterId && (!char || char.id !== targetCharacterId)) {
        const { data: c } = await supabase
          .from('characters')
          .select('id,name,persona_prompt,avatar_url')
          .eq('id', targetCharacterId)
          .maybeSingle();
        if (c) char = c as any;
      }
      const characterId = char?.id || targetCharacterId || '';
      const chatTitle = `${title} - Lesson ${lesson.order_index + 1}: ${lesson.title}`;
      const lessonId = lesson.id !== 'synthetic-intro' ? lesson.id : undefined;
      
      console.log('[StudyDetail] Creating chat with:', { 
        userId: user.id, 
        characterId, 
        chatTitle, 
        studyId, 
        lessonId, 
        progressId: currentProgressId 
      });
      
      const newChat = await chat.createChat(user.id, characterId, chatTitle, { 
        studyId: studyId, 
        lessonId,
        progressId: currentProgressId
      });
      
      console.log('[StudyDetail] Chat created:', newChat);
      
      // Build lesson prompts string from the prompts array
      const lessonPromptsText = Array.isArray(lesson.prompts) && lesson.prompts.length > 0
        ? lesson.prompts.map(p => typeof p === 'string' ? p : p?.text || '').filter(Boolean).join('\n\n')
        : '';
      
      // Re-fetch study instructions to ensure we have the latest (avoid race conditions)
      let studyInstructions = studyMeta?.character_instructions || '';
      if (!studyInstructions) {
        const { data: freshStudy } = await supabase
          .from('bible_studies')
          .select('character_instructions')
          .eq('id', studyId)
          .maybeSingle();
        studyInstructions = freshStudy?.character_instructions || '';
        console.log('[StudyDetail] Re-fetched study instructions, length:', studyInstructions.length);
      }
      
      // Add lesson context as system message
      // Put Study Prompt (character_instructions) FIRST so it's prioritized
      const lessonPrompt = [
        studyInstructions ? `=== MANDATORY STUDY PROMPT (FOLLOW EXACTLY) ===\n${studyInstructions}\n=== END MANDATORY STUDY PROMPT ===` : '',
        `You are guiding a Bible study lesson.`,
        `Study: ${title}`,
        `Lesson: ${lesson.title}`,
        Array.isArray(lesson.scripture_refs) && lesson.scripture_refs.length > 0 
          ? `Scripture: ${lesson.scripture_refs.join(', ')}` 
          : '',
        lesson.summary ? `Summary: ${lesson.summary}` : '',
        lessonPromptsText ? `Lesson Instructions:\n${lessonPromptsText}` : ''
      ].filter(Boolean).join('\n\n');
      
      console.log('[StudyDetail] Lesson prompt length:', lessonPrompt.length);
      console.log('[StudyDetail] Study instructions included:', studyInstructions.length > 0);
      
      await chat.addMessage(newChat.id, lessonPrompt, 'system');
      
      // Generate intro for the lesson - use same prompt as web to enforce structure
      try {
        const displayName = char?.name || 'Guide';
        console.log('[StudyDetail] Generating intro with character:', displayName);
        
        // Build a stronger intro prompt that emphasizes following the Study Prompt structure
        const hasStudyPrompt = studyInstructions && studyInstructions.trim().length > 0;
        console.log('[StudyDetail] Has study prompt:', hasStudyPrompt, 'length:', studyInstructions?.length || 0);
        const introRequest = hasStudyPrompt
          ? `Begin this Bible study session now. You MUST follow the MANDATORY STRUCTURE in the Study Prompt section above EXACTLY. If the Study Prompt says to open with prayer, you MUST start with a prayer. If it specifies steps or format, follow them precisely. Do not skip, reorder, or improvise any required steps. The Study Prompt instructions take priority over everything else.`
          : `Begin this Bible study session now. Start with a warm greeting and introduce the lesson topic.`;
        
        const intro = await generateCharacterResponse(displayName, char?.persona_prompt || '', [
          { role: 'system', content: lessonPrompt },
          { role: 'user', content: introRequest }
        ]);
        console.log('[StudyDetail] Generated intro:', intro?.slice(0, 200));
        if (intro) await chat.addMessage(newChat.id, intro, 'assistant');
      } catch (introErr) {
        console.warn('[StudyDetail] Intro generation failed:', introErr);
      }
      
      navigation.navigate('MainTabs', {
        screen: 'Chat',
        params: {
          screen: 'ChatDetail',
          params: { chatId: newChat.id, character: char }
        }
      } as any);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unable to start this lesson.';
      alert(msg);
    } finally {
      setStarting(false);
    }
  }

  async function startGuidedChat() {
    if (!user || starting) return;
    if (!studyMeta?.character_id) {
      alert('No guide is set for this study.');
      return;
    }
    setStarting(true);
    try {
      // Fetch character name/persona for intro
      const { data: char } = await supabase
        .from('characters')
        .select('id,name,persona_prompt')
        .eq('id', studyMeta.character_id)
        .maybeSingle();
      const newChat = await chat.createChat(user.id, String(studyMeta.character_id), title, { studyId });
      const prompt = String(studyMeta?.character_instructions || '').trim();
      if (prompt) {
        await chat.addMessage(newChat.id, `[Guiding Prompt]\n${prompt}`, 'system');
      }
      // Generate a short intro
      try {
        const history = prompt ? [{ role: 'system' as const, content: `[Guiding Prompt]\n${prompt}` }] : [];
        const displayName = char?.name || guide?.name || 'Guide';
        const intro = await generateCharacterResponse(displayName, char?.persona_prompt || guide?.persona_prompt || '', [
          ...history,
          { role: 'user', content: `Greet me as ${displayName}, briefly introduce this study in 2 short sentences, and end with a friendly question to begin.` }
        ]);
        if (intro) await chat.addMessage(newChat.id, intro, 'assistant');
      } catch {}
      // Navigate immediately even if intro generation fails
      // Must target nested nav: MainTabs -> Chat (stack) -> ChatDetail
      navigation.navigate('MainTabs', {
        screen: 'Chat',
        params: {
          screen: 'ChatDetail',
          params: { chatId: newChat.id, character: { name: char?.name, persona_prompt: char?.persona_prompt } }
        }
      } as any);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unable to start this study right now.';
      alert(msg);
    } finally {
      setStarting(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: 16, flex: 1 }}>
        <Text style={{ color: theme.colors.accent, fontSize: 22, fontWeight: '800', marginBottom: 8 }}>{title}</Text>
        
        {/* Progress Bar */}
        {user && lessons.length > 0 && (
          <View style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ color: theme.colors.muted, fontSize: 12 }}>
                {completedLessons.length} of {lessons.length} lessons complete
              </Text>
              <Text style={{ 
                color: progressPercent === 100 ? '#22c55e' : theme.colors.primary, 
                fontSize: 12, 
                fontWeight: '700' 
              }}>
                {progressPercent}%
              </Text>
            </View>
            <View style={{ height: 6, backgroundColor: theme.colors.surface, borderRadius: 3, overflow: 'hidden' }}>
              <View style={{ 
                height: '100%', 
                width: `${progressPercent}%`, 
                backgroundColor: progressPercent === 100 ? '#22c55e' : theme.colors.primary,
                borderRadius: 3 
              }} />
            </View>
          </View>
        )}

        {!!guide && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            {guide.avatar_url ? (
              <Image source={{ uri: guide.avatar_url }} style={{ width: 28, height: 28, borderRadius: 14 }} />
            ) : (
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: theme.colors.surface }} />
            )}
            <Text style={{ color: theme.colors.muted }}>Guide: <Text style={{ color: theme.colors.text, fontWeight: '700' }}>{guide.name}</Text></Text>
          </View>
        )}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <TouchableOpacity disabled={starting} onPress={startGuidedChat} style={{ backgroundColor: theme.colors.primary, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 }}>
            <Text style={{ fontWeight: '600', fontSize: 13, color: theme.colors.primaryText }}>{starting ? 'Starting…' : 'Start Guided Chat'}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={async () => {
              const url = `https://faithtalkai.com/studies/${studyId}`;
              const message = `Join me in studying "${title}" on Faith Talk AI!\n\n${url}`;
              try {
                await Share.share({ message, url, title: 'Invite Friend to Bible Study' });
              } catch {}
            }} 
            style={{ backgroundColor: theme.colors.primary, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 }}
          >
            <Text style={{ fontWeight: '600', fontSize: 13, color: theme.colors.primaryText }}>Invite Friend</Text>
          </TouchableOpacity>
        </View>
        {loading ? (
          <ActivityIndicator color={theme.colors.primary} />
        ) : (
          <FlatList
            data={lessons}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 8 }}
            renderItem={({ item }) => {
              const isComplete = completedLessons.includes(item.order_index);
              const isToggling = togglingLesson === item.order_index;
              // Determine lesson's character: lesson override > study default
              const lessonChar = item.character_id 
                ? (lessonCharacters[item.character_id] || (item.character_id === studyMeta?.character_id ? guide : null))
                : guide;
              // Check if there are existing chats for this lesson
              const existingLessonChats = lessonChats[item.id] || [];
              const hasExistingChat = existingLessonChats.length > 0;
              
              return (
                <View style={{ 
                  padding: 12, 
                  backgroundColor: theme.colors.card, 
                  borderRadius: 10, 
                  marginBottom: 8,
                  borderLeftWidth: isComplete ? 4 : 0,
                  borderLeftColor: '#22c55e'
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: theme.colors.text, fontWeight: '700' }}>
                        Lesson {item.order_index + 1}: {item.title}
                      </Text>
                      {!!lessonChar && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                          {lessonChar.avatar_url ? (
                            <Image source={{ uri: lessonChar.avatar_url }} style={{ width: 16, height: 16, borderRadius: 8 }} />
                          ) : (
                            <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: theme.colors.surface }} />
                          )}
                          <Text style={{ color: theme.colors.muted, fontSize: 12 }}>Guide: {lessonChar.name}</Text>
                        </View>
                      )}
                      {!!item.summary && (
                        <Text style={{ color: theme.colors.muted, marginTop: 6 }} numberOfLines={2}>
                          {item.summary}
                        </Text>
                      )}
                      
                      {/* Show conversation history if exists */}
                      {hasExistingChat && (
                        <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: theme.colors.surface }}>
                          <Text style={{ color: theme.colors.muted, fontSize: 11, marginBottom: 4 }}>
                            Previous conversations:
                          </Text>
                          {existingLessonChats.slice(0, 2).map((c: any) => (
                            <TouchableOpacity 
                              key={c.id}
                              onPress={() => navigation.navigate('MainTabs', {
                                screen: 'Chat',
                                params: { screen: 'ChatDetail', params: { chatId: c.id } }
                              })}
                              style={{ paddingVertical: 4 }}
                            >
                              <Text style={{ color: theme.colors.accent, fontSize: 12 }}>
                                💬 {new Date(c.updated_at).toLocaleDateString()}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                    {isComplete && (
                      <Text style={{ color: '#22c55e', fontSize: 18, marginLeft: 8 }}>✓</Text>
                    )}
                  </View>
                  
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                    <TouchableOpacity onPress={() => startLesson(item)} disabled={starting}>
                      <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>
                        {starting ? 'Loading...' : hasExistingChat ? 'Continue →' : 'Start Lesson →'}
                      </Text>
                    </TouchableOpacity>
                    
                    {user && (
                      <TouchableOpacity 
                        onPress={() => handleToggleComplete(item.order_index)}
                        disabled={isToggling}
                        style={{ 
                          paddingHorizontal: 10, 
                          paddingVertical: 5, 
                          backgroundColor: isComplete ? '#22c55e20' : theme.colors.surface,
                          borderRadius: 6,
                          borderWidth: 1,
                          borderColor: isComplete ? '#22c55e' : theme.colors.muted
                        }}
                      >
                        <Text style={{ 
                          color: isComplete ? '#22c55e' : theme.colors.muted, 
                          fontSize: 12, 
                          fontWeight: '600' 
                        }}>
                          {isToggling ? '...' : isComplete ? 'Completed' : 'Mark Complete'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
