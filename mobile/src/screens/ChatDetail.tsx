import React from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { useRoute, useNavigation } from '@react-navigation/native';
import { chat, type ChatMessage } from '../lib/chat';
import { guardMessageSend, incrementDailyMessageCount } from '../lib/tier';
import { Linking } from 'react-native';
import { generateCharacterResponse } from '../lib/api';
import { theme } from '../theme';

export default function ChatDetail() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { chatId } = route.params || {};
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const [character, setCharacter] = React.useState<any>(route.params?.character || null);
  const [isFav, setIsFav] = React.useState<boolean>(false);
  const [title, setTitle] = React.useState<string>('Chat');
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  React.useEffect(() => {
    (async () => {
      if (!chatId) return;
      try {
        const meta = await chat.getChat(chatId);
        setIsFav(!!meta?.is_favorite);
        setTitle(meta?.title || 'Chat');
      } catch {}
      const rows = await chat.getChatMessages(chatId);
      setMessages(rows);
    })();
  }, [chatId]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title,
      headerRight: () => (
        <TouchableOpacity onPress={async () => {
          try {
            await chat.toggleFavorite(chatId, !isFav);
            setIsFav(!isFav);
          } catch {}
        }}>
          <Text style={{ fontSize: 18 }}>{isFav ? '★' : '☆'}</Text>
        </TouchableOpacity>
      )
    });
  }, [navigation, isFav, title, chatId]);

  // character is passed from ChatNew; optional.

  async function onSend() {
    if (!input.trim() || sending || !chatId) return;
    const content = input.trim();
    setInput('');
    setSending(true);
    try {
      // gating: free daily limit
      await guardMessageSend({
        userId: undefined, // using local-only for now; if AuthContext has user, wire here
        onAllowed: async () => {},
        onUpgrade: () => { throw new Error('UPGRADE_REQUIRED'); }
      });
      const userMsg = await chat.addMessage(chatId, content, 'user');
      setMessages((m) => [...m, userMsg]);

      // Build context for proxy
      const persona = character?.persona_prompt || '';
      const name = character?.name || 'Guide';
      const history = [...messages, userMsg].slice(-12).map((m) => ({ role: m.role as any, content: m.content }));
      const reply = await generateCharacterResponse(name, persona, history);
      const aiMsg = await chat.addMessage(chatId, reply || '...', 'assistant');
      setMessages((m) => [...m, aiMsg]);
      await incrementDailyMessageCount(undefined);
    } catch (e) {
      if ((e as any)?.message === 'UPGRADE_REQUIRED') {
        // show prompt
        // Basic inline notice instead of inserting message bubble
        alert('Free daily message limit reached. Upgrade at faithtalkai.com/pricing to continue.');
      } else {
        const errText = e instanceof Error ? e.message : 'Failed to send';
        const aiMsg = await chat.addMessage(chatId, `(Error) ${errText}`, 'assistant');
        setMessages((m) => [...m, aiMsg]);
      }
    } finally {
      setSending(false);
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
