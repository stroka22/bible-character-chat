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
  const [lessonId, setLessonId] = React.useState<string | null>(null);
  const [progressId, setProgressId] = React.useState<string | null>(null);
  const [lessonIndex, setLessonIndex] = React.useState<number>(0);
  const [isLessonComplete, setIsLessonComplete] = React.useState(false);
  const [markingComplete, setMarkingComplete] = React.useState(false);

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
          setProgressId(meta.progress_id || null);
          
          // Get lesson index from title or lesson metadata
          const lessonMatch = meta.title?.match(/Lesson (\d+)/i);
          const idx = lessonMatch ? parseInt(lessonMatch[1], 10) - 1 : 0;
          setLessonIndex(idx);
          
          // Check if this lesson is already complete
          if (user?.id && meta.progress_id) {
            const progress = await getStudyProgress(user.id, meta.study_id, meta.progress_id);
            if (progress?.completed_lessons?.includes(idx)) {
              setIsLessonComplete(true);
            }
          }
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
          <Text style={{ color: theme.colors.text, fontWeight: '700' }}>{isFav ? 'Unsave' : 'Save'}</Text>
        </TouchableOpacity>
      )
    });
  }, [navigation, isFav, title, chatId, character]);

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

  // Mark lesson complete and save progress
  async function handleMarkComplete() {
    if (!user?.id || !studyId) return;
    setMarkingComplete(true);
    
    try {
      // Check if we have an existing progress record
      let currentProgressId = progressId;
      let existingProgress = currentProgressId 
        ? await getStudyProgress(user.id, studyId, currentProgressId)
        : await getStudyProgress(user.id, studyId);
      
      const isFirstSave = !existingProgress;
      
      if (isFirstSave) {
        // First time - ask user if they want to save
        Alert.alert(
          'Save Progress',
          'Would you like to save this Bible Study to your My Walk page?',
          [
            { 
              text: 'Not Now', 
              style: 'cancel',
              onPress: () => setMarkingComplete(false)
            },
            {
              text: 'Save',
              onPress: async () => {
                try {
                  // Create new progress record
                  const newProgress = await saveStudyProgress({
                    userId: user.id,
                    studyId,
                    currentLessonIndex: lessonIndex,
                    completedLessons: [lessonIndex],
                    createNew: true
                  });
                  
                  if (newProgress?.id) {
                    setProgressId(newProgress.id);
                    setIsLessonComplete(true);
                    
                    // Update the chat with the progress_id
                    try {
                      const { supabase } = await import('../lib/supabase');
                      await supabase
                        .from('chats')
                        .update({ progress_id: newProgress.id })
                        .eq('id', chatId);
                    } catch {}
                    
                    Alert.alert('Saved!', 'Your progress has been saved to My Walk.');
                  }
                } catch (e) {
                  Alert.alert('Error', 'Failed to save progress');
                } finally {
                  setMarkingComplete(false);
                }
              }
            }
          ]
        );
      } else {
        // Subsequent saves - auto-save
        const completedLessons = Array.isArray(existingProgress?.completed_lessons) 
          ? [...existingProgress.completed_lessons] 
          : [];
        
        if (!completedLessons.includes(lessonIndex)) {
          completedLessons.push(lessonIndex);
          completedLessons.sort((a, b) => a - b);
        }
        
        await saveStudyProgress({
          userId: user.id,
          studyId,
          progressId: existingProgress?.id,
          currentLessonIndex: lessonIndex,
          completedLessons
        });
        
        setIsLessonComplete(true);
        setMarkingComplete(false);
        
        // Brief confirmation
        Alert.alert('Complete!', 'Lesson marked as complete.');
      }
    } catch (e) {
      console.warn('[ChatDetail] Error marking complete:', e);
      Alert.alert('Error', 'Failed to mark lesson complete');
      setMarkingComplete(false);
    }
  }

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
        {/* Mark Complete button for Bible Studies */}
        {studyId && (
          <View style={{ paddingHorizontal: 12, paddingBottom: 8 }}>
            <TouchableOpacity 
              onPress={handleMarkComplete}
              disabled={markingComplete || isLessonComplete}
              style={{ 
                height: 40, 
                backgroundColor: isLessonComplete ? theme.colors.surface : theme.colors.accent, 
                borderRadius: 8, 
                alignItems: 'center', 
                justifyContent: 'center',
                opacity: markingComplete ? 0.6 : 1
              }}
            >
              {markingComplete ? (
                <ActivityIndicator color={theme.colors.primaryText} size="small" />
              ) : (
                <Text style={{ color: isLessonComplete ? theme.colors.muted : theme.colors.primaryText, fontWeight: '700' }}>
                  {isLessonComplete ? '✓ Lesson Complete' : 'Mark Complete'}
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
