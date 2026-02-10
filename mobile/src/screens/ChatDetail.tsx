import React from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, SafeAreaView, Text, TextInput, TouchableOpacity, View, Image, Alert, Share, Clipboard, ScrollView, Modal } from 'react-native';
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
  const { chatId, ephemeral } = route.params || {};
  const { user } = useAuth();
  const isEphemeral = ephemeral === true || !chatId;
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
  
  // Reading Plan context (for back navigation)
  const fromPlan = route.params?.fromPlan as { slug: string; title: string; dayNumber: number } | undefined;

  
  // Action bar state
  const [showInsights, setShowInsights] = React.useState(false);
  const [insights, setInsights] = React.useState<string | null>(null);
  const [loadingInsights, setLoadingInsights] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      // For ephemeral chats, just set up the opening line
      if (isEphemeral) {
        if (character?.opening_line) {
          setMessages([{
            id: 'opening',
            chat_id: 'ephemeral',
            content: character.opening_line,
            role: 'assistant',
            created_at: new Date().toISOString(),
          }]);
        }
        setTitle(character?.name ? `Chat with ${character.name}` : 'Chat');
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
            const { success, error } = await inviteFriendToChat(chatId, title);
            if (error) {
              Alert.alert('Error', error);
            }
          }} 
          style={{ paddingHorizontal: 10, paddingVertical: 6, backgroundColor: theme.colors.primary, borderRadius: 6 }}
        >
          <Text style={{ color: theme.colors.primaryText, fontWeight: '600', fontSize: 12 }}>👥 Invite</Text>
        </TouchableOpacity>
      )
    });
  }, [navigation, isFav, title, chatId, character, studyId]);

  // character is passed from ChatNew; optional.

  async function onSend() {
    if (!input.trim() || sending) return;
    // For persistent chats, require chatId
    if (!isEphemeral && !chatId) return;
    
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
      await incrementDailyMessageCount(user?.id);
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

  // Copy conversation to clipboard
  const copyConversation = () => {
    const text = messages
      .filter(m => m.role !== 'system')
      .map(m => m.role === 'user' ? `You: ${m.content}` : `${character?.name || 'Guide'}: ${m.content}`)
      .join('\n\n');
    Clipboard.setString(text);
    Alert.alert('Copied!', 'Conversation copied to clipboard.');
  };

  // Share conversation
  const shareConversation = async () => {
    const text = messages
      .filter(m => m.role !== 'system')
      .map(m => m.role === 'user' ? `You: ${m.content}` : `${character?.name || 'Guide'}: ${m.content}`)
      .join('\n\n');
    const shareText = `${title}\n\n${text}\n\n— via Faith Talk AI`;
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
          
          <TouchableOpacity 
            onPress={shareConversation}
            style={{ backgroundColor: theme.colors.surface, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border }}
          >
            <Text style={{ color: theme.colors.text, fontWeight: '600', fontSize: 12 }}>📤 Share</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={copyConversation}
            style={{ backgroundColor: theme.colors.surface, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border }}
          >
            <Text style={{ color: theme.colors.text, fontWeight: '600', fontSize: 12 }}>📋 Copy</Text>
          </TouchableOpacity>
          
          {!studyId && (
            <TouchableOpacity 
              onPress={async () => {
                await requirePremiumOrPrompt({
                  userId: user?.id,
                  feature: 'save',
                  onUpgrade: () => navigation.navigate('Paywall'),
                  onAllowed: async () => {
                    await chat.toggleFavorite(chatId, !isFav);
                    setIsFav(!isFav);
                  }
                });
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
              maxWidth: '85%',
              borderWidth: item.role === 'user' ? 0 : 1,
              borderColor: theme.colors.border
            }}>
              <Text style={{ color: item.role === 'user' ? theme.colors.primaryText : theme.colors.text }}>{item.content}</Text>
            </View>
          )}
        />
        {/* Save/Complete buttons for Bible Studies (not for Introduction) */}
        {studyId && (
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
