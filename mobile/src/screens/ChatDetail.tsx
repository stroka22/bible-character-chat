import React from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, SafeAreaView, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View, Image, Alert, Share, Clipboard, ScrollView, Modal, ActionSheetIOS, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { useRoute, useNavigation } from '@react-navigation/native';
import { chat, type ChatMessage } from '../lib/chat';
import { guardMessageSend, incrementDailyMessageCount, requirePremiumOrPrompt, isPremiumUser } from '../lib/tier';
import { useAuth } from '../contexts/AuthContext';
import { Linking } from 'react-native';
import { generateCharacterResponse } from '../lib/api';
import { theme } from '../theme';
import { saveStudyProgress, getStudyProgress } from '../lib/studyProgress';
import { inviteFriendToChat } from '../lib/invites';
import { hasAIConsent, setAIConsent } from '../lib/aiConsent';
import AIConsentModal from '../components/AIConsentModal';
import { supabase } from '../lib/supabase';
import { getBestCharacterName } from '../utils/characterSuggestions';

export default function ChatDetail() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { chatId, ephemeral, studyContext, planContext, verseContext, suggestedCharacterName } = route.params || {};
  const { user } = useAuth();
  const isEphemeral = ephemeral === true || !chatId;
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const [character, setCharacter] = React.useState<any>(route.params?.character || null);
  
  // Reset state when chatId changes (navigating to a different conversation)
  const prevChatIdRef = React.useRef<string | undefined>(chatId);
  React.useEffect(() => {
    if (prevChatIdRef.current !== chatId) {
      // ChatId changed - reset state for new conversation
      setMessages([]);
      setCharacter(route.params?.character || null);
      setIsFav(false);
      setTitle('Chat');
      setStudyId(null);
      setStudyTitle(null);
      setLessonId(null);
      setProgressId(null);
      setLessonIndex(0);
      setIsLessonComplete(false);
      prevChatIdRef.current = chatId;
    }
  }, [chatId, route.params?.character]);
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
  
  // Reading Plan context (for back navigation)
  const fromPlan = route.params?.fromPlan as { slug: string; title: string; dayNumber: number } | undefined;

  
  // Action bar state
  const [showInsights, setShowInsights] = React.useState(false);
  const [insights, setInsights] = React.useState<string | null>(null);
  const [loadingInsights, setLoadingInsights] = React.useState(false);
  
  // AI consent state
  const [showConsentModal, setShowConsentModal] = React.useState(false);
  const [pendingMessage, setPendingMessage] = React.useState<string | null>(null);
  
  // Premium status for button styling
  const [isPremium, setIsPremium] = React.useState(false);
  
  // FlatList ref and scroll-to-bottom state
  const flatListRef = React.useRef<FlatList>(null);
  const [showScrollButton, setShowScrollButton] = React.useState(false);
  const [isNearBottom, setIsNearBottom] = React.useState(true);
  
  // Message editing state
  const [editingMessageId, setEditingMessageId] = React.useState<string | null>(null);
  const [editText, setEditText] = React.useState('');
  
  React.useEffect(() => {
    (async () => {
      if (user?.id) {
        const premium = await isPremiumUser(user.id);
        setIsPremium(premium);
      } else {
        setIsPremium(false);
      }
    })();
  }, [user?.id]);

  React.useEffect(() => {
    (async () => {
      // For ephemeral chats, just set up the opening line
      if (isEphemeral) {
        // If this is a Bible Study context, generate an intro message (same as logged-in users)
        if (studyContext && character) {
          setTitle(`${studyContext.studyTitle} - Lesson ${studyContext.lessonIndex + 1}`);
          // Generate intro message for Bible Study - same logic as logged-in users
          try {
            const hasStudyPrompt = studyContext.characterInstructions && studyContext.characterInstructions.trim().length > 0;
            
            // Build lesson context prompt (same as logged-in flow)
            const lessonPrompt = [
              hasStudyPrompt ? `=== MANDATORY STUDY PROMPT (FOLLOW EXACTLY) ===\n${studyContext.characterInstructions}\n=== END MANDATORY STUDY PROMPT ===` : '',
              `You are guiding a Bible study lesson.`,
              `Study: ${studyContext.studyTitle}`,
              `Lesson: ${studyContext.lessonTitle}`,
            ].filter(Boolean).join('\n\n');
            
            // Same intro request as logged-in users
            const introRequest = hasStudyPrompt
              ? `Begin this Bible study session now. CRITICAL: You MUST start with a prayer about this lesson's topic. After the prayer, follow any other instructions in the Study Prompt section above. The prayer should be sincere, relevant to the lesson topic, and about 2-3 sentences. Then greet the student and introduce the lesson.`
              : `Begin this Bible study session now. Start with a brief prayer about the lesson topic (2-3 sentences), then greet the student warmly and introduce what you'll be studying together.`;
            
            const response = await generateCharacterResponse(
              character.name,
              character.persona_prompt || '',
              [
                { role: 'system', content: lessonPrompt },
                { role: 'user', content: introRequest }
              ]
            );
            if (response) {
              setMessages([{
                id: 'opening',
                chat_id: 'ephemeral',
                content: response,
                role: 'assistant',
                created_at: new Date().toISOString(),
              }]);
            }
          } catch (e) {
            console.warn('[ChatDetail] Failed to generate study intro:', e);
            // Fallback to character opening line or generic message
            const fallback = character.opening_line || `Welcome to ${studyContext.lessonTitle}. I'm ${character.name}, and I'll be your guide for this lesson.`;
            setMessages([{
              id: 'opening',
              chat_id: 'ephemeral',
              content: fallback,
              role: 'assistant',
              created_at: new Date().toISOString(),
            }]);
          }
        } else if (planContext && character) {
          // Reading Plan context for ephemeral chat
          setTitle(`${planContext.planTitle} - Day ${planContext.dayNumber}`);
          try {
            // Build system prompt for reading plan
            const systemPrompt = [
              `READING PLAN CONTEXT:`,
              `Plan: "${planContext.planTitle}"`,
              `Day ${planContext.dayNumber}: ${planContext.dayTitle || ''}`,
              `Today's Passages: ${planContext.readings}`,
              planContext.context ? `\nToday's Teaching:\n${planContext.context}` : '',
              planContext.reflectionPrompt ? `\nReflection Question: ${planContext.reflectionPrompt}` : '',
              `\nINSTRUCTIONS:`,
              `You are ${character.name}, guiding this person through their daily reading plan.`,
              `Lead the conversation - don't wait for them to ask questions.`,
              `1. Start by warmly greeting them and introducing today's reading.`,
              `2. Share your personal connection to these passages (if relevant to your biblical story).`,
              `3. After they've read, guide them through the key themes and lessons.`,
              `4. Use the reflection question to spark deeper discussion.`,
              `5. Encourage them and remind them of God's faithfulness.`,
              `Keep responses warm, conversational, and spiritually encouraging.`
            ].filter(Boolean).join('\n');
            
            const introPrompt = `Begin today's reading plan session. Warmly greet the reader, introduce Day ${planContext.dayNumber} (${planContext.dayTitle || planContext.readings}), and share why these passages are meaningful. If these passages relate to your own story in Scripture, briefly mention that connection. Encourage them to read the passages and let you know when they're ready to discuss. Keep it warm and inviting (3-4 sentences).`;
            
            const response = await generateCharacterResponse(
              character.name,
              character.persona_prompt || '',
              [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: introPrompt }
              ]
            );
            if (response) {
              setMessages([{
                id: 'opening',
                chat_id: 'ephemeral',
                content: response,
                role: 'assistant',
                created_at: new Date().toISOString(),
              }]);
            }
          } catch (e) {
            console.warn('[ChatDetail] Failed to generate plan intro:', e);
            const fallback = `Welcome to Day ${planContext.dayNumber} of "${planContext.planTitle}"! Today we'll be reading ${planContext.readings}. Take your time with the passages, and when you're ready, I'd love to discuss what stood out to you and explore these truths together.`;
            setMessages([{
              id: 'opening',
              chat_id: 'ephemeral',
              content: fallback,
              role: 'assistant',
              created_at: new Date().toISOString(),
            }]);
          }
        } else if (verseContext) {
          // Verse selection context for ephemeral chat
          setTitle(`Discussion: ${verseContext.reference}`);
          
          // Look up character if not provided
          let charData = character;
          if (!charData) {
            try {
              // Use suggested character name if provided, otherwise derive from book
              let characterName = suggestedCharacterName;
              if (!characterName) {
                // Parse book from reference (e.g., "Psalms 1:1-3" -> "Psalms")
                const bookMatch = verseContext.reference.match(/^(\d?\s*[A-Za-z]+)/);
                const bookName = bookMatch ? bookMatch[1].trim() : 'Genesis';
                characterName = getBestCharacterName([{ book: bookName, chapter: 1 }], '');
              }
              
              // Find the character in database
              const { data: foundChar } = await supabase
                .from('characters')
                .select('id,name,avatar_url,persona_prompt,opening_line')
                .ilike('name', `%${characterName}%`)
                .limit(1)
                .maybeSingle();
              
              if (foundChar) {
                charData = foundChar;
                setCharacter(foundChar);
              } else {
                // Fallback to Chat Guide
                const { data: fallbackChar } = await supabase
                  .from('characters')
                  .select('id,name,avatar_url,persona_prompt,opening_line')
                  .ilike('name', '%Chat Guide%')
                  .limit(1)
                  .maybeSingle();
                if (fallbackChar) {
                  charData = fallbackChar;
                  setCharacter(fallbackChar);
                }
              }
            } catch (e) {
              console.warn('[ChatDetail] Failed to look up character:', e);
            }
          }
          
          if (!charData) {
            // No character found, show fallback message
            setMessages([{
              id: 'opening',
              chat_id: 'ephemeral',
              content: `I see you've selected ${verseContext.reference}. These are wonderful verses! I'd love to discuss what stood out to you.`,
              role: 'assistant',
              created_at: new Date().toISOString(),
            }]);
            return;
          }
          try {
            const systemPrompt = [
              `BIBLE VERSE CONTEXT:`,
              `Reference: ${verseContext.reference} (${verseContext.translation})`,
              `\nSelected verses:\n"${verseContext.text}"`,
              `\nINSTRUCTIONS:`,
              `You are ${charData.name}, discussing the verses the user selected.`,
              `1. Acknowledge the specific verses they selected.`,
              `2. Share your perspective on these verses, especially if they relate to your biblical story.`,
              `3. Ask what drew them to these particular verses.`,
              `4. Guide a meaningful discussion about the spiritual truths in these passages.`,
              `Keep responses warm, conversational, and spiritually encouraging.`
            ].join('\n');
            
            const introPrompt = `The reader just selected ${verseContext.reference} from the Bible. Warmly acknowledge their selection and share why these verses are meaningful. If they relate to your own story, mention that. Ask what drew them to these particular verses. Keep it conversational (3-4 sentences).`;
            
            const response = await generateCharacterResponse(
              charData.name,
              charData.persona_prompt || '',
              [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: introPrompt }
              ]
            );
            if (response) {
              setMessages([{
                id: 'opening',
                chat_id: 'ephemeral',
                content: response,
                role: 'assistant',
                created_at: new Date().toISOString(),
              }]);
            }
          } catch (e) {
            console.warn('[ChatDetail] Failed to generate verse intro:', e);
            const fallback = `I see you've selected ${verseContext.reference}. These are wonderful verses! I'd love to discuss what stood out to you and explore their meaning together.`;
            setMessages([{
              id: 'opening',
              chat_id: 'ephemeral',
              content: fallback,
              role: 'assistant',
              created_at: new Date().toISOString(),
            }]);
          }
        } else if (character?.opening_line) {
          setMessages([{
            id: 'opening',
            chat_id: 'ephemeral',
            content: character.opening_line,
            role: 'assistant',
            created_at: new Date().toISOString(),
          }]);
          setTitle(character?.name ? `Chat with ${character.name}` : 'Chat');
        } else {
          setTitle(character?.name ? `Chat with ${character.name}` : 'Chat');
        }
        return;
      }
      
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
          const { supabase } = await import('../lib/supabase');
          
          if (meta.lesson_id) {
            // This chat is linked to a specific lesson
            try {
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

            } catch (e) {
              console.warn('[ChatDetail] Failed to fetch lesson order_index:', e);
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
        <TouchableOpacity 
          onPress={async () => {
            // Check premium for invite feature - invite always requires premium
            if (!isPremium) {
              Alert.alert('Premium Feature', 'Inviting others to your conversation is a premium feature.', [
                { text: 'Cancel', style: 'cancel' },
                { text: user ? 'Upgrade' : 'Sign Up', onPress: () => navigation.navigate(user ? 'Paywall' : 'SignUp' as never) }
              ]);
              return;
            }
            // Require saved chat to invite
            if (!chatId || isEphemeral) {
              Alert.alert('Save First', 'Save this conversation to My Walk before inviting friends.');
              return;
            }
            const { success, error } = await inviteFriendToChat(chatId, title);
            if (error) {
              Alert.alert('Error', error);
            }
          }} 
          style={{ paddingHorizontal: 10, paddingVertical: 6, backgroundColor: isPremium ? theme.colors.primary : '#9ca3af', borderRadius: 6 }}
        >
          <Text style={{ color: isPremium ? theme.colors.primaryText : '#ffffff', fontWeight: '600', fontSize: 12 }}>👥 Invite</Text>
        </TouchableOpacity>
      )
    });
  }, [navigation, isFav, title, chatId, character, studyId, isPremium]);

  // character is passed from ChatNew; optional.

  async function onSend() {
    if (!input.trim() || sending) return;
    // For persistent chats, require chatId
    if (!isEphemeral && !chatId) return;
    
    const content = input.trim();
    
    // Check for AI consent before first message
    const consentGranted = await hasAIConsent();
    if (!consentGranted) {
      setPendingMessage(content);
      setShowConsentModal(true);
      return;
    }
    
    await sendMessage(content);
  }
  
  async function sendMessage(content: string) {
    setInput('');
    setSending(true);
    try {
      // For logged-in users, check premium gating (unlimited for free, gated features for premium)
      // For anonymous users, show signup prompt every 5 messages but allow them to continue
      if (user?.id) {
        // Logged-in users have unlimited chat - no message limit check needed
      } else {
        // Anonymous: show signup prompt at 5, 10, 15 messages etc.
        const userMsgCount = messages.filter(m => m.role === 'user').length + 1; // +1 for current
        if (userMsgCount >= 5 && userMsgCount % 5 === 0) {
          // Show signup prompt but don't block
          Alert.alert(
            'Create an Account',
            'Sign up for free to save your conversations and unlock more features!',
            [
              { text: 'Maybe Later', style: 'cancel' },
              { text: 'Sign Up', onPress: () => navigation.navigate('SignUp' as never) }
            ]
          );
        }
      }
      
      // Create user message
      const userMsg: ChatMessage = {
        id: `temp-${Date.now()}`,
        chat_id: chatId || 'ephemeral',
        content,
        role: 'user',
        created_at: new Date().toISOString(),
      };
      
      // For persistent chats, save to DB
      if (!isEphemeral && chatId) {
        const savedMsg = await chat.addMessage(chatId, content, 'user');
        userMsg.id = savedMsg.id;
      }
      setMessages((m) => [...m, userMsg]);

      // Build context for proxy
      const persona = character?.persona_prompt || '';
      const name = character?.name || 'Guide';
      
      // Include system messages (study context) at the start, then recent conversation
      const systemMsgs = messages.filter(m => m.role === 'system').map(m => ({ role: m.role as any, content: m.content }));
      const nonSystemMsgs = [...messages, userMsg].filter(m => m.role !== 'system').slice(-12).map(m => ({ role: m.role as any, content: m.content }));
      const history = [...systemMsgs, ...nonSystemMsgs];
      
      const reply = await generateCharacterResponse(name, persona, history);
      
      // Create assistant message
      const aiMsg: ChatMessage = {
        id: `temp-${Date.now()}-ai`,
        chat_id: chatId || 'ephemeral',
        content: reply || '...',
        role: 'assistant',
        created_at: new Date().toISOString(),
      };
      
      // For persistent chats, save to DB
      if (!isEphemeral && chatId) {
        const savedMsg = await chat.addMessage(chatId, reply || '...', 'assistant');
        aiMsg.id = savedMsg.id;
      }
      setMessages((m) => [...m, aiMsg]);
    } catch (e) {
      if ((e as any)?.message === 'UPGRADE_REQUIRED') {
        // show prompt
        (navigation as any).navigate('Paywall');
      } else {
        const errText = e instanceof Error ? e.message : 'Failed to send';
        const aiMsg: ChatMessage = {
          id: `temp-${Date.now()}-err`,
          chat_id: chatId || 'ephemeral',
          content: `(Error) ${errText}`,
          role: 'assistant',
          created_at: new Date().toISOString(),
        };
        if (!isEphemeral && chatId) {
          const savedMsg = await chat.addMessage(chatId, `(Error) ${errText}`, 'assistant');
          aiMsg.id = savedMsg.id;
        }
        setMessages((m) => [...m, aiMsg]);
      }
    } finally {
      setSending(false);
    }
  }
  
  // Handle AI consent acceptance
  async function handleConsentAccept() {
    await setAIConsent(true);
    setShowConsentModal(false);
    if (pendingMessage) {
      await sendMessage(pendingMessage);
      setPendingMessage(null);
    }
  }
  
  // Handle AI consent decline
  function handleConsentDecline() {
    setShowConsentModal(false);
    setPendingMessage(null);
    Alert.alert(
      'Consent Required',
      'To chat with biblical characters, you must agree to the AI data usage terms. You can still browse characters and studies without chatting.',
      [{ text: 'OK' }]
    );
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

  // Handle toggle lesson complete (mark or unmark)
  async function handleToggleComplete() {
    if (!user?.id || !studyId) return;
    setMarkingComplete(true);
    
    const willBeComplete = !isLessonComplete;
    console.log('[ChatDetail] handleToggleComplete - lessonIndex:', lessonIndex, 'willBeComplete:', willBeComplete);
    
    try {
      let currentProgressId = progressId;
      
      // If not saved yet and marking complete, create progress record first
      if (!isSavedToMyWalk && willBeComplete) {
        console.log('[ChatDetail] Creating new progress with completedLessons:', [lessonIndex]);
        const newProgress = await saveStudyProgress({
          userId: user.id,
          studyId,
          currentLessonIndex: lessonIndex,
          completedLessons: [lessonIndex],
          createNew: true
        });
        
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
        
        setIsLessonComplete(true);
        setMarkingComplete(false);
        
        Alert.alert(
          'Lesson Complete!', 
          'Would you like to continue to the next lesson?',
          [
            { text: 'Stay Here', style: 'cancel' },
            {
              text: 'View Outline',
              onPress: () => {
                navigation.navigate('StudyDetail', {
                  studyId,
                  title: studyTitle || 'Bible Study',
                  progressId: currentProgressId
                });
              }
            }
          ]
        );
        return;
      }
      
      // Get existing progress and toggle this lesson
      const existingProgress = await getStudyProgress(user.id, studyId, progressId || undefined);
      let completedLessons = Array.isArray(existingProgress?.completed_lessons) 
        ? [...existingProgress.completed_lessons] 
        : [];
      
      if (willBeComplete) {
        // Mark complete
        if (!completedLessons.includes(lessonIndex)) {
          completedLessons.push(lessonIndex);
          completedLessons.sort((a, b) => a - b);
        }
      } else {
        // Unmark complete
        completedLessons = completedLessons.filter(i => i !== lessonIndex);
      }
      
      await saveStudyProgress({
        userId: user.id,
        studyId,
        progressId: progressId || existingProgress?.id,
        currentLessonIndex: lessonIndex,
        completedLessons
      });
      
      setIsLessonComplete(willBeComplete);
      setMarkingComplete(false);
      
      if (willBeComplete) {
        const finalProgressId = currentProgressId || progressId;
        Alert.alert(
          'Lesson Complete!', 
          'Would you like to continue to the next lesson?',
          [
            { text: 'Stay Here', style: 'cancel' },
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
      }
    } catch (e) {
      console.warn('[ChatDetail] Error toggling complete:', e);
      Alert.alert('Error', 'Failed to update lesson status');
      setMarkingComplete(false);
    }
  }

  // Get button text based on state
  const getSaveButtonText = () => {
    if (!isSavedToMyWalk) return 'Save to My Walk';
    return 'Save Progress';
  };

  // Copy conversation to clipboard
  const copyConversation = () => {
    const characterName = character?.name || 'Guide';
    const header = `Conversation with ${characterName}\nDate: ${new Date().toLocaleDateString()}\n\n`;
    const text = messages
      .filter(m => m.role !== 'system')
      .map(m => {
        const speaker = m.role === 'user' ? 'You' : characterName;
        return `${speaker}:\n${m.content}`;
      })
      .join('\n\n');
    Clipboard.setString(`${header}${text}`);
    Alert.alert('Copied!', 'Conversation copied to clipboard.');
  };

  // Share conversation
  const shareConversation = async () => {
    const characterName = character?.name || 'Guide';
    const text = messages
      .filter(m => m.role !== 'system')
      .map(m => {
        const speaker = m.role === 'user' ? 'You' : characterName;
        return `${speaker}:\n${m.content}`;
      })
      .join('\n\n');
    const shareText = `Conversation with ${characterName}\n\n${text}\n\n— via Faith Talk AI (faithtalkai.com)`;
    try {
      await Share.share({ message: shareText, title });
    } catch {}
  };

  // Show character insights/bio
  const generateInsights = async () => {
    setShowInsights(true);
    setLoadingInsights(true);
    setInsights(null);
    
    try {
      const charName = character?.name || 'this character';
      const charPersona = character?.persona_prompt || '';
      
      const insightPrompt = `Provide a brief but comprehensive overview of ${charName} as a biblical figure. Include:

1. BIBLICAL BACKGROUND: Who ${charName} was, their role in the Bible, and key events they were part of
2. KEY SCRIPTURE: 2-3 important Bible verses where ${charName} appears or that relate to them
3. CHARACTER TRAITS: What qualities and characteristics defined ${charName}
4. LIFE LESSONS: What we can learn from ${charName}'s story today
5. CONVERSATION STARTERS: 2-3 interesting questions to ask ${charName}

Keep each section concise but informative. This is for someone about to have a conversation with ${charName}.`;

      const result = await generateCharacterResponse(
        charName,
        charPersona,
        [{ role: 'user', content: insightPrompt }]
      );
      setInsights(result);
    } catch (e) {
      setInsights('Unable to load character insights at this time. Please try again later.');
    } finally {
      setLoadingInsights(false);
    }
  };

  // Scroll to bottom handler - use scrollToOffset for reliability
  const scrollToBottom = () => {
    if (flatListRef.current && messages.length > 0) {
      // Use a very large offset to ensure we reach the bottom
      flatListRef.current.scrollToOffset({ offset: 999999, animated: true });
    }
  };

  // Handle scroll events for showing/hiding scroll button
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const distanceFromBottom = contentSize.height - contentOffset.y - layoutMeasurement.height;
    const nearBottom = distanceFromBottom < 100;
    setIsNearBottom(nearBottom);
    setShowScrollButton(!nearBottom && contentSize.height > layoutMeasurement.height + 200);
  };

  // Handle long press on a message - show copy/edit options
  const handleMessageLongPress = (message: ChatMessage) => {
    const isUserMessage = message.role === 'user';
    
    if (Platform.OS === 'ios') {
      const options = isUserMessage 
        ? ['Copy', 'Edit', 'Cancel']
        : ['Copy', 'Cancel'];
      const cancelButtonIndex = options.length - 1;
      
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex },
        (buttonIndex) => {
          if (buttonIndex === 0) {
            // Copy
            Clipboard.setString(message.content);
            Alert.alert('Copied', 'Message copied to clipboard');
          } else if (isUserMessage && buttonIndex === 1) {
            // Edit (only for user messages)
            setEditingMessageId(message.id);
            setEditText(message.content);
          }
        }
      );
    } else {
      // Android - use Alert
      const buttons = isUserMessage
        ? [
            { text: 'Copy', onPress: () => { Clipboard.setString(message.content); Alert.alert('Copied', 'Message copied to clipboard'); }},
            { text: 'Edit', onPress: () => { setEditingMessageId(message.id); setEditText(message.content); }},
            { text: 'Cancel', style: 'cancel' as const }
          ]
        : [
            { text: 'Copy', onPress: () => { Clipboard.setString(message.content); Alert.alert('Copied', 'Message copied to clipboard'); }},
            { text: 'Cancel', style: 'cancel' as const }
          ];
      
      Alert.alert('Message Options', '', buttons);
    }
  };

  // Save edited message
  const saveEditedMessage = async () => {
    if (!editingMessageId || !editText.trim()) return;
    
    const updatedMessages = messages.map(m => 
      m.id === editingMessageId ? { ...m, content: editText.trim() } : m
    );
    setMessages(updatedMessages);
    
    // If not ephemeral, save to database
    if (!isEphemeral && chatId && user?.id) {
      try {
        await chat.updateMessage(editingMessageId, editText.trim());
      } catch (e) {
        console.error('Failed to save edited message:', e);
      }
    }
    
    setEditingMessageId(null);
    setEditText('');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        {/* Action Bar */}
        {/* Back to Reading Plan */}
        {fromPlan && (
          <TouchableOpacity 
            onPress={() => navigation.navigate('ReadingPlanDetail', { slug: fromPlan.slug })}
            style={{ paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}
          >
            <Text style={{ color: theme.colors.primary, fontSize: 14 }}>← Back to {fromPlan.title} (Day {fromPlan.dayNumber})</Text>
          </TouchableOpacity>
        )}

        <View style={{ flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 8, gap: 8, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}>
          <TouchableOpacity 
            onPress={generateInsights}
            style={{ backgroundColor: theme.colors.surface, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border }}
          >
            <Text style={{ color: theme.colors.text, fontWeight: '600', fontSize: 12 }}>💡 Insights</Text>
          </TouchableOpacity>
          
          {/* Share requires premium */}
          <TouchableOpacity 
            onPress={async () => {
              if (!isPremium) {
                Alert.alert('Premium Feature', 'Sharing your conversation is a premium feature.', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: user ? 'Upgrade' : 'Sign Up', onPress: () => navigation.navigate(user ? 'Paywall' : 'SignUp' as never) }
                ]);
                return;
              }
              shareConversation();
            }}
            style={{ backgroundColor: theme.colors.surface, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: isPremium ? theme.colors.border : '#9ca3af' }}
          >
            <Text style={{ color: isPremium ? theme.colors.text : '#6b7280', fontWeight: '600', fontSize: 12 }}>📤 Share</Text>
          </TouchableOpacity>
          
          {/* Copy requires premium */}
          <TouchableOpacity 
            onPress={async () => {
              if (!isPremium) {
                Alert.alert('Premium Feature', 'Copying your conversation is a premium feature.', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: user ? 'Upgrade' : 'Sign Up', onPress: () => navigation.navigate(user ? 'Paywall' : 'SignUp' as never) }
                ]);
                return;
              }
              copyConversation();
            }}
            style={{ backgroundColor: theme.colors.surface, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: isPremium ? theme.colors.border : '#9ca3af' }}
          >
            <Text style={{ color: isPremium ? theme.colors.text : '#6b7280', fontWeight: '600', fontSize: 12 }}>📋 Copy</Text>
          </TouchableOpacity>
          
          {/* Save requires account (free users can save, but need premium to access in My Walk) */}
          {!studyId && (
            <TouchableOpacity 
              onPress={async () => {
                if (!user) {
                  Alert.alert('Account Required', 'Create a free account to save conversations.', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Sign Up', onPress: () => navigation.navigate('SignUp' as never) }
                  ]);
                  return;
                }
                
                try {
                  // If this is an ephemeral chat, we need to create it first
                  if (isEphemeral || !chatId) {
                    if (!character?.id) {
                      Alert.alert('Error', 'Cannot save - no character selected.');
                      return;
                    }
                    // Create the chat
                    const newChat = await chat.createChat(user.id, character.id, title || 'Conversation');
                    
                    // Save all messages to the new chat
                    for (const msg of messages) {
                      if (msg.role !== 'system') {
                        await chat.addMessage(newChat.id, msg.content, msg.role);
                      }
                    }
                    
                    // Mark as favorite
                    await chat.toggleFavorite(newChat.id, true);
                    setIsFav(true);
                    
                    // Navigate to the saved chat (replacing this ephemeral one)
                    navigation.replace('ChatDetail', { chatId: newChat.id, character });
                    Alert.alert('Saved!', 'Your conversation has been saved. Upgrade to Premium to access your saved conversations in My Walk anytime.');
                  } else {
                    // Regular toggle for existing chats
                    await chat.toggleFavorite(chatId, !isFav);
                    setIsFav(!isFav);
                    if (!isFav) {
                      Alert.alert('Saved!', 'Your conversation has been saved. Upgrade to Premium to access your saved conversations in My Walk anytime.');
                    }
                  }
                } catch (e) {
                  console.error('Error saving chat:', e);
                  Alert.alert('Error', 'Failed to save conversation. Please try again.');
                }
              }}
              style={{ backgroundColor: isFav ? theme.colors.primary : theme.colors.surface, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: isFav ? theme.colors.primary : theme.colors.border }}
            >
              <Text style={{ color: isFav ? theme.colors.primaryText : theme.colors.text, fontWeight: '600', fontSize: 12 }}>
                {isFav ? '★ Saved' : '☆ Save'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Insights Modal */}
        <Modal visible={showInsights} animationType="slide" transparent>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: theme.colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%', paddingBottom: 40 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.accent, fontFamily: 'Cinzel_700Bold' }}>About {character?.name || 'Character'}</Text>
                <TouchableOpacity onPress={() => setShowInsights(false)}>
                  <Text style={{ color: theme.colors.primary, fontSize: 16, fontWeight: '600' }}>Close</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={{ padding: 16 }}>
                {loadingInsights ? (
                  <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                    <ActivityIndicator color={theme.colors.primary} size="large" />
                    <Text style={{ color: theme.colors.muted, marginTop: 12 }}>Generating insights...</Text>
                  </View>
                ) : insights ? (
                  <Text style={{ color: theme.colors.text, lineHeight: 22 }}>{insights}</Text>
                ) : null}
              </ScrollView>
            </View>
          </View>
        </Modal>

        <FlatList
          ref={flatListRef}
          data={messages.filter((m) => {
            if (m.role === 'system') return false;
            const content = m.content || '';
            if (content.includes('[Guiding Prompt]')) return false;
            if (content.includes('[Study Prompt]')) return false;
            if (content.includes('[Lesson Instructions]')) return false;
            if (content.includes('IMPORTANT INSTRUCTIONS FOR THIS SESSION')) return false;
            return true;
          })}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: 12, paddingBottom: 12 + Math.max(insets.bottom, 8) + 56 }}
          onScroll={handleScroll}
          scrollEventThrottle={100}
          onContentSizeChange={() => {
            // Auto-scroll to bottom when new messages arrive, if user is near bottom
            if (isNearBottom) {
              flatListRef.current?.scrollToEnd({ animated: true });
            }
          }}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.7}
              onLongPress={() => handleMessageLongPress(item)}
              delayLongPress={300}
              style={{
                alignSelf: item.role === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor: item.role === 'user' ? theme.colors.primary : theme.colors.card,
                padding: 10,
                borderRadius: 12,
                marginBottom: 8,
                maxWidth: '85%',
                borderWidth: item.role === 'user' ? 0 : 1,
                borderColor: theme.colors.border
              }}
            >
              <Text style={{ color: item.role === 'user' ? theme.colors.primaryText : theme.colors.text }}>{item.content}</Text>
            </TouchableOpacity>
          )}
        />
        
        {/* Scroll to bottom button */}
        {showScrollButton && (
          <TouchableOpacity
            onPress={scrollToBottom}
            style={{
              position: 'absolute',
              right: 16,
              bottom: studyId ? 200 : 120,
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: theme.colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5
            }}
          >
            <Text style={{ color: theme.colors.primaryText, fontSize: 20, fontWeight: 'bold' }}>↓</Text>
          </TouchableOpacity>
        )}
        {/* Back to Study + Save/Complete buttons for Bible Studies */}
        {studyId && (
          <View style={{ paddingHorizontal: 12, paddingBottom: 6 }}>
            {/* Back to Study Outline button */}
            <TouchableOpacity 
              onPress={() => navigation.navigate('StudyDetail', {
                studyId,
                title: studyTitle || 'Bible Study',
                progressId
              })}
              style={{ 
                height: 34, 
                backgroundColor: theme.colors.surface,
                borderRadius: 6, 
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: 6,
                borderWidth: 1,
                borderColor: theme.colors.border
              }}
            >
              <Text style={{ color: theme.colors.text, fontWeight: '600', fontSize: 13 }}>
                ← Back to Study Outline
              </Text>
            </TouchableOpacity>
            
            <View style={{ flexDirection: 'row', gap: 6 }}>
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
              
              {/* Lesson Complete toggle button */}
              <TouchableOpacity 
                onPress={handleToggleComplete}
                disabled={markingComplete}
                style={{ 
                  flex: 1,
                  height: 34, 
                  backgroundColor: isLessonComplete ? '#22c55e' : theme.colors.primary, 
                  borderRadius: 6, 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  opacity: markingComplete ? 0.6 : 1
                }}
              >
                {markingComplete ? (
                  <ActivityIndicator color={theme.colors.primaryText} size="small" />
                ) : (
                  <Text style={{ color: theme.colors.primaryText, fontWeight: '600', fontSize: 13 }}>
                    {isLessonComplete ? '✓ Complete' : 'Mark Complete'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        <View style={{ flexDirection: 'row', padding: 12, gap: 8, paddingBottom: 12 + Math.max(insets.bottom, 6), alignItems: 'flex-end' }}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type a message…"
            placeholderTextColor={theme.colors.muted}
            multiline
            style={{ flex: 1, minHeight: 44, maxHeight: 120, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, textAlignVertical: 'top' }}
            editable={!sending}
          />
          <TouchableOpacity disabled={sending} onPress={onSend} style={{ height: 44, paddingHorizontal: 16, backgroundColor: theme.colors.primary, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}>
            {sending ? <ActivityIndicator color={theme.colors.primaryText} /> : <Text style={{ color: theme.colors.primaryText, fontWeight: '700' }}>Send</Text>}
          </TouchableOpacity>
        </View>
        
        {/* AI Consent Modal */}
        <AIConsentModal
          visible={showConsentModal}
          onAccept={handleConsentAccept}
          onDecline={handleConsentDecline}
        />
        
        {/* Edit Message Modal */}
        <Modal visible={!!editingMessageId} transparent animationType="fade">
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
            <View style={{ backgroundColor: theme.colors.background, borderRadius: 12, padding: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.text, marginBottom: 12 }}>Edit Message</Text>
              <TextInput
                value={editText}
                onChangeText={setEditText}
                multiline
                style={{
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  borderRadius: 8,
                  padding: 12,
                  minHeight: 100,
                  maxHeight: 200,
                  textAlignVertical: 'top'
                }}
                autoFocus
              />
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
                <TouchableOpacity
                  onPress={() => { setEditingMessageId(null); setEditText(''); }}
                  style={{ paddingVertical: 10, paddingHorizontal: 20 }}
                >
                  <Text style={{ color: theme.colors.muted, fontWeight: '600' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={saveEditedMessage}
                  style={{ backgroundColor: theme.colors.primary, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 }}
                >
                  <Text style={{ color: theme.colors.primaryText, fontWeight: '600' }}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
