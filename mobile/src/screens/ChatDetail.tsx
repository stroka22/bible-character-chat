import React from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, SafeAreaView, Text, TextInput, TouchableOpacity, View, Image, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { useRoute, useNavigation } from '@react-navigation/native';
import { chat, type ChatMessage } from '../lib/chat';
import { guardMessageSend, incrementDailyMessageCount, requirePremiumOrPrompt } from '../lib/tier';
import { useAuth } from '../contexts/AuthContext';
import { Linking } from 'react-native';
import { generateCharacterResponse } from '../lib/api';
import { theme } from '../theme';
import { saveStudyProgress, getStudyProgress } from '../lib/studyProgress';
import { inviteFriendToChat } from '../lib/invites';

export default function ChatDetail() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { chatId } = route.params || {};
  const { user } = useAuth();
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const [character, setCharacter] = React.useState<any>(route.params?.character || null);
  const [isFav, setIsFav] = React.useState<boolean>(false);
  const [title, setTitle] = React.useState<string>('Chat');
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  
  // Bible Study state
  const [studyId, setStudyId] = React.useState<string | null>(null);
  const [studyTitle, setStudyTitle] = React.useState<string | null>(null);
  const [lessonId, setLessonId] = React.useState<string | null>(null);
  const [progressId, setProgressId] = React.useState<string | null>(null);
  const [lessonIndex, setLessonIndex] = React.useState<number>(0);
  const [isLessonComplete, setIsLessonComplete] = React.useState(false);
  const [markingComplete, setMarkingComplete] = React.useState(false);
  const [isIntroduction, setIsIntroduction] = React.useState(false);
  const [nextLesson, setNextLesson] = React.useState<{ id: string; title: string; order_index: number; character_id?: string | null } | null>(null);

  React.useEffect(() => {
    (async () => {
      if (!chatId) return;
      try {
        const meta = await chat.getChat(chatId);
        setIsFav(!!meta?.is_favorite);
        setTitle(meta?.title || 'Chat');
        
        // Load Bible Study info if this is a study chat
        if (meta?.study_id) {
          setStudyId(meta.study_id);
          setLessonId(meta.lesson_id || null);
          
          // Extract study title from chat title (format: "Study Title - Lesson X: ...")
          const titleMatch = meta.title?.match(/^(.+?)\s*-\s*Lesson/i);
          if (titleMatch) {
            setStudyTitle(titleMatch[1].trim());
          }
          
          // Get lesson index from database (more reliable than parsing title)
          let idx = 0;
          let lessonTitle = '';
          if (meta.lesson_id) {
            try {
              const { supabase } = await import('../lib/supabase');
              const { data: lessonData } = await supabase
                .from('bible_study_lessons')
                .select('order_index, title')
                .eq('id', meta.lesson_id)
                .maybeSingle();
              if (lessonData?.order_index !== undefined) {
                idx = lessonData.order_index;
                lessonTitle = lessonData.title || '';
                console.log('[ChatDetail] Got lesson order_index from DB:', idx, 'title:', lessonTitle);
              }
              
              // Check if this is the Introduction lesson (title contains "Introduction")
              const isIntro = lessonTitle.toLowerCase().includes('introduction');
              console.log('[ChatDetail] Is Introduction?', isIntro, 'title:', lessonTitle, 'order_index:', idx);
              setIsIntroduction(isIntro);
              
              // If Introduction, fetch the next lesson (the one after this)
              if (isIntro && meta.study_id) {
                const { data: nextLessonData } = await supabase
                  .from('bible_study_lessons')
                  .select('id, title, order_index, character_id')
                  .eq('study_id', meta.study_id)
                  .gt('order_index', idx)
                  .order('order_index', { ascending: true })
                  .limit(1)
                  .maybeSingle();
                if (nextLessonData) {
                  setNextLesson(nextLessonData);
                  console.log('[ChatDetail] Next lesson:', nextLessonData);
                }
              }
            } catch (e) {
              console.warn('[ChatDetail] Failed to fetch lesson order_index:', e);
            }
          }
          // Fallback: parse from title if DB lookup failed
          if (idx === 0 && !meta.lesson_id) {
            const lessonMatch = meta.title?.match(/Lesson (\d+)/i);
            idx = lessonMatch ? parseInt(lessonMatch[1], 10) - 1 : 0;
            console.log('[ChatDetail] Parsed lesson index from title:', idx);
            
            // Also check for Introduction in chat title as fallback
            if (meta.title?.toLowerCase().includes('introduction')) {
              console.log('[ChatDetail] Detected Introduction from chat title');
              setIsIntroduction(true);
            }
          }
          setLessonIndex(idx);
          
          // Check for existing progress - first from chat, then search for any progress
          let foundProgressId = meta.progress_id || null;
          let progress = null;
          
          if (user?.id) {
            if (foundProgressId) {
              progress = await getStudyProgress(user.id, meta.study_id, foundProgressId);
            }
            // If no progress_id on chat or couldn't find it, look for any progress for this study
            if (!progress) {
              progress = await getStudyProgress(user.id, meta.study_id);
              if (progress?.id) {
                foundProgressId = progress.id;
                // Update the chat with the progress_id if found
                try {
                  const { supabase } = await import('../lib/supabase');
                  await supabase
                    .from('chats')
                    .update({ progress_id: progress.id })
                    .eq('id', chatId);
                } catch {}
              }
            }
            
            if (progress?.completed_lessons?.includes(idx)) {
              setIsLessonComplete(true);
            }
          }
          
          setProgressId(foundProgressId);
        }
        
        if (!character && meta?.character_id) {
          try {
            const { data: c } = await (await import('../lib/supabase')).supabase
              .from('characters')
              .select('id,name,avatar_url,persona_prompt')
              .eq('id', meta.character_id)
              .maybeSingle();
            if (c) setCharacter(c);
          } catch {}
        }
      } catch {}
      const rows = await chat.getChatMessages(chatId);
      setMessages(rows);
    })();
  }, [chatId, user?.id]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title,
      headerTitle: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {character?.avatar_url || character?.avatar ? (
            <Image source={{ uri: (character.avatar_url || character.avatar) as string }} style={{ width: 24, height: 24, borderRadius: 12, marginRight: 8 }} />
          ) : (
            <View style={{ width: 24, height: 24, borderRadius: 12, marginRight: 8, backgroundColor: theme.colors.surface }} />
          )}
          <Text style={{ color: theme.colors.text, fontWeight: '700' }}>{character?.name || title}</Text>
        </View>
      ),
      headerRight: () => (
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {/* Invite Friend button */}
          <TouchableOpacity 
            onPress={async () => {
              const { success, error } = await inviteFriendToChat(chatId, title);
              if (error) {
                Alert.alert('Error', error);
              }
            }} 
            style={{ paddingHorizontal: 8, paddingVertical: 4, backgroundColor: theme.colors.primary, borderRadius: 6 }}
          >
            <Text style={{ color: theme.colors.primaryText, fontWeight: '600', fontSize: 12 }}>Invite Friend</Text>
          </TouchableOpacity>
          
          {/* Save button - only for non-study chats */}
          {!studyId && (
            <TouchableOpacity onPress={async () => {
              await requirePremiumOrPrompt({
                userId: (user as any)?.id,
                feature: 'save',
                onUpgrade: () => { try { (navigation as any).navigate('Paywall'); } catch {} },
                onAllowed: async () => {
                  try {
                    await chat.toggleFavorite(chatId, !isFav);
                    setIsFav(!isFav);
                  } catch {}
                }
              });
            }} style={{ paddingHorizontal: 8, paddingVertical: 4, backgroundColor: theme.colors.surface, borderRadius: 6 }}>
              <Text style={{ color: theme.colors.text, fontWeight: '600', fontSize: 12 }}>{isFav ? 'Unsave' : 'Save'}</Text>
            </TouchableOpacity>
          )}
        </View>
      )
    });
  }, [navigation, isFav, title, chatId, character, studyId]);

  // character is passed from ChatNew; optional.

  async function onSend() {
    if (!input.trim() || sending || !chatId) return;
    const content = input.trim();
    setInput('');
    setSending(true);
    try {
      // gating: free daily limit
      await guardMessageSend({
        userId: user?.id,
        onAllowed: async () => {},
        onUpgrade: () => { throw new Error('UPGRADE_REQUIRED'); }
      });
      const userMsg = await chat.addMessage(chatId, content, 'user');
      setMessages((m) => [...m, userMsg]);

      // Build context for proxy
      const persona = character?.persona_prompt || '';
      const name = character?.name || 'Guide';
      
      // Include system messages (study context) at the start, then recent conversation
      const systemMsgs = messages.filter(m => m.role === 'system').map(m => ({ role: m.role as any, content: m.content }));
      const nonSystemMsgs = [...messages, userMsg].filter(m => m.role !== 'system').slice(-12).map(m => ({ role: m.role as any, content: m.content }));
      const history = [...systemMsgs, ...nonSystemMsgs];
      
      const reply = await generateCharacterResponse(name, persona, history);
      const aiMsg = await chat.addMessage(chatId, reply || '...', 'assistant');
      setMessages((m) => [...m, aiMsg]);
      await incrementDailyMessageCount(user?.id);
    } catch (e) {
      if ((e as any)?.message === 'UPGRADE_REQUIRED') {
        // show prompt
        // Basic inline notice instead of inserting message bubble
        (navigation as any).navigate('Paywall');
      } else {
        const errText = e instanceof Error ? e.message : 'Failed to send';
        const aiMsg = await chat.addMessage(chatId, `(Error) ${errText}`, 'assistant');
        setMessages((m) => [...m, aiMsg]);
      }
    } finally {
      setSending(false);
    }
  }

  // Determine if study is already saved (has progress record)
  const isSavedToMyWalk = !!progressId;

  // Handle save action (doesn't mark complete)
  async function handleSaveProgress() {
    if (!user?.id || !studyId) return;
    setMarkingComplete(true);
    
    try {
      if (!isSavedToMyWalk) {
        // First time - save to My Walk (create progress record)
        const newProgress = await saveStudyProgress({
          userId: user.id,
          studyId,
          currentLessonIndex: lessonIndex,
          completedLessons: [],
          createNew: true
        });
        
        if (newProgress?.id) {
          setProgressId(newProgress.id);
          
          // Update the chat with the progress_id
          try {
            const { supabase } = await import('../lib/supabase');
            await supabase
              .from('chats')
              .update({ progress_id: newProgress.id })
              .eq('id', chatId);
          } catch {}
          
          Alert.alert('Saved!', 'This study has been saved to your My Walk page.');
        }
      } else {
        // Already saved - just update progress
        await saveStudyProgress({
          userId: user.id,
          studyId,
          progressId,
          currentLessonIndex: lessonIndex
        });
        
        Alert.alert('Saved!', 'Your progress has been saved.');
      }
    } catch (e) {
      console.warn('[ChatDetail] Error saving progress:', e);
      Alert.alert('Error', 'Failed to save progress');
    } finally {
      setMarkingComplete(false);
    }
  }

  // Handle mark complete action
  async function handleMarkComplete() {
    if (!user?.id || !studyId || isLessonComplete) return;
    setMarkingComplete(true);
    
    console.log('[ChatDetail] handleMarkComplete - lessonIndex:', lessonIndex, 'studyId:', studyId, 'progressId:', progressId);
    
    try {
      let currentProgressId = progressId;
      
      // If not saved yet, create progress record first
      if (!isSavedToMyWalk) {
        console.log('[ChatDetail] Creating new progress with completedLessons:', [lessonIndex]);
        const newProgress = await saveStudyProgress({
          userId: user.id,
          studyId,
          currentLessonIndex: lessonIndex,
          completedLessons: [lessonIndex],
          createNew: true
        });
        console.log('[ChatDetail] New progress created:', newProgress);
        
        if (newProgress?.id) {
          currentProgressId = newProgress.id;
          setProgressId(newProgress.id);
          
          // Update the chat with the progress_id
          try {
            const { supabase } = await import('../lib/supabase');
            await supabase
              .from('chats')
              .update({ progress_id: newProgress.id })
              .eq('id', chatId);
          } catch {}
        }
      } else {
        // Get existing progress and add this lesson to completed
        console.log('[ChatDetail] Updating existing progress:', progressId);
        const existingProgress = await getStudyProgress(user.id, studyId, progressId!);
        console.log('[ChatDetail] Existing progress:', existingProgress);
        const completedLessons = Array.isArray(existingProgress?.completed_lessons) 
          ? [...existingProgress.completed_lessons] 
          : [];
        
        if (!completedLessons.includes(lessonIndex)) {
          completedLessons.push(lessonIndex);
          completedLessons.sort((a, b) => a - b);
        }
        
        console.log('[ChatDetail] Saving with completedLessons:', completedLessons);
        await saveStudyProgress({
          userId: user.id,
          studyId,
          progressId,
          currentLessonIndex: lessonIndex,
          completedLessons
        });
      }
      
      setIsLessonComplete(true);
      setMarkingComplete(false);
      
      // Navigate back to study outline
      const finalProgressId = currentProgressId || progressId;
      Alert.alert(
        'Lesson Complete!', 
        'Would you like to continue to the next lesson?',
        [
          {
            text: 'Stay Here',
            style: 'cancel'
          },
          {
            text: 'View Outline',
            onPress: () => {
              navigation.navigate('StudyDetail', {
                studyId,
                title: studyTitle || 'Bible Study',
                progressId: finalProgressId
              });
            }
          }
        ]
      );
    } catch (e) {
      console.warn('[ChatDetail] Error marking complete:', e);
      Alert.alert('Error', 'Failed to mark lesson complete');
      setMarkingComplete(false);
    }
  }

  // Get button text based on state
  const getSaveButtonText = () => {
    if (!isSavedToMyWalk) return 'Save to My Walk';
    return 'Save Progress';
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <FlatList
          data={messages.filter((m) => m.role !== 'system')}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: 12, paddingBottom: 12 + Math.max(insets.bottom, 8) + 56 }}
          renderItem={({ item }) => (
            <View style={{
              alignSelf: item.role === 'user' ? 'flex-end' : 'flex-start',
              backgroundColor: item.role === 'user' ? theme.colors.primary : theme.colors.card,
              padding: 10,
              borderRadius: 12,
              marginBottom: 8,
              maxWidth: '85%'
            }}>
              <Text style={{ color: item.role === 'user' ? theme.colors.primaryText : theme.colors.text }}>{item.content}</Text>
            </View>
          )}
        />
        {/* Save/Complete buttons for Bible Studies (not for Introduction) */}
        {studyId && !isIntroduction && (
          <View style={{ flexDirection: 'row', paddingHorizontal: 12, paddingBottom: 6, gap: 6 }}>
            {/* Save Progress button */}
            <TouchableOpacity 
              onPress={handleSaveProgress}
              disabled={markingComplete || isLessonComplete}
              style={{ 
                flex: 1,
                height: 34, 
                backgroundColor: isLessonComplete ? theme.colors.surface : theme.colors.primary,
                borderRadius: 6, 
                alignItems: 'center', 
                justifyContent: 'center',
                opacity: (markingComplete || isLessonComplete) ? 0.6 : 1
              }}
            >
              <Text style={{ color: isLessonComplete ? theme.colors.muted : theme.colors.primaryText, fontWeight: '600', fontSize: 13 }}>
                {getSaveButtonText()}
              </Text>
            </TouchableOpacity>
            
            {/* Lesson Complete button */}
            <TouchableOpacity 
              onPress={handleMarkComplete}
              disabled={markingComplete || isLessonComplete}
              style={{ 
                flex: 1,
                height: 34, 
                backgroundColor: isLessonComplete ? theme.colors.surface : theme.colors.primary, 
                borderRadius: 6, 
                alignItems: 'center', 
                justifyContent: 'center',
                opacity: (markingComplete || isLessonComplete) ? 0.6 : 1
              }}
            >
              {markingComplete ? (
                <ActivityIndicator color={theme.colors.primaryText} size="small" />
              ) : (
                <Text style={{ color: isLessonComplete ? theme.colors.muted : theme.colors.primaryText, fontWeight: '600', fontSize: 13 }}>
                  {isLessonComplete ? '✓ Lesson Complete' : 'Lesson Complete'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
        
        {/* Start Next Lesson button for Introduction */}
        {isIntroduction && nextLesson && (
          <View style={{ paddingHorizontal: 12, paddingBottom: 6 }}>
            <TouchableOpacity 
              onPress={async () => {
                // Navigate to Lesson 1
                try {
                  const { supabase } = await import('../lib/supabase');
                  
                  // Get study meta for character
                  const { data: studyData } = await supabase
                    .from('bible_studies')
                    .select('character_id')
                    .eq('id', studyId)
                    .maybeSingle();
                  
                  // Get or use existing progress
                  const currentProgressId = progressId;
                  
                  // Get character info
                  let charInfo = character;
                  const charId = nextLesson.character_id || studyData?.character_id;
                  if (charId && (!charInfo || charInfo.id !== charId)) {
                    const { data: c } = await supabase
                      .from('characters')
                      .select('id,name,avatar_url,persona_prompt')
                      .eq('id', charId)
                      .maybeSingle();
                    if (c) charInfo = c;
                  }
                  
                  // Create chat for lesson 1
                  const chatTitle = `${studyTitle} - Lesson ${nextLesson.order_index + 1}: ${nextLesson.title}`;
                  const newChat = await chat.createChat(user!.id, charInfo?.id || '', chatTitle, {
                    studyId: studyId!,
                    lessonId: nextLesson.id,
                    progressId: currentProgressId || undefined
                  });
                  
                  // Navigate to the new chat
                  navigation.replace('ChatDetail', { chatId: newChat.id, character: charInfo });
                } catch (e) {
                  console.warn('[ChatDetail] Error starting next lesson:', e);
                  Alert.alert('Error', 'Failed to start lesson');
                }
              }}
              style={{ 
                height: 44, 
                backgroundColor: theme.colors.accent,
                borderRadius: 8, 
                alignItems: 'center', 
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
                Start Lesson 1: {nextLesson.title}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        
        <View style={{ flexDirection: 'row', padding: 12, gap: 8, paddingBottom: 12 + Math.max(insets.bottom, 6) }}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type a message…"
            placeholderTextColor={theme.colors.muted}
            style={{ flex: 1, height: 44, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text, borderRadius: 8, paddingHorizontal: 12 }}
            editable={!sending}
          />
          <TouchableOpacity disabled={sending} onPress={onSend} style={{ height: 44, paddingHorizontal: 16, backgroundColor: theme.colors.primary, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}>
            {sending ? <ActivityIndicator color={theme.colors.primaryText} /> : <Text style={{ color: theme.colors.primaryText, fontWeight: '700' }}>Send</Text>}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
