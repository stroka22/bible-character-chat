import React from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { useRoute } from '@react-navigation/native';
import { chat, type ChatMessage } from '../lib/chat';
import { generateCharacterResponse } from '../lib/api';

export default function ChatDetail() {
  const route = useRoute<any>();
  const { chatId } = route.params || {};
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const [character, setCharacter] = React.useState<any>(route.params?.character || null);
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  React.useEffect(() => {
    (async () => {
      if (!chatId) return;
      const rows = await chat.getChatMessages(chatId);
      setMessages(rows);
    })();
  }, [chatId]);

  // character is passed from ChatNew; optional.

  async function onSend() {
    if (!input.trim() || sending || !chatId) return;
    const content = input.trim();
    setInput('');
    setSending(true);
    try {
      const userMsg = await chat.addMessage(chatId, content, 'user');
      setMessages((m) => [...m, userMsg]);

      // Build context for proxy
      const persona = character?.persona_prompt || '';
      const name = character?.name || 'Guide';
      const history = [...messages, userMsg].slice(-12).map((m) => ({ role: m.role as any, content: m.content }));
      const reply = await generateCharacterResponse(name, persona, history);
      const aiMsg = await chat.addMessage(chatId, reply || '...', 'assistant');
      setMessages((m) => [...m, aiMsg]);
    } catch (e) {
      const errText = e instanceof Error ? e.message : 'Failed to send';
      const aiMsg = await chat.addMessage(chatId, `(Error) ${errText}`, 'assistant');
      setMessages((m) => [...m, aiMsg]);
    } finally {
      setSending(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}>
      <SafeAreaView style={{ flex: 1 }}>
        <FlatList
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: 12, paddingBottom: 12 + Math.max(insets.bottom, 8) + 56 }}
          renderItem={({ item }) => (
            <View style={{
              alignSelf: item.role === 'user' ? 'flex-end' : 'flex-start',
              backgroundColor: item.role === 'user' ? '#2563eb' : '#e5e7eb',
              padding: 10,
              borderRadius: 12,
              marginBottom: 8,
              maxWidth: '85%'
            }}>
              <Text style={{ color: item.role === 'user' ? 'white' : '#111827' }}>{item.content}</Text>
            </View>
          )}
        />
        <View style={{ flexDirection: 'row', padding: 12, gap: 8, paddingBottom: 12 + Math.max(insets.bottom, 6) }}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type a message…"
            style={{ flex: 1, height: 44, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 12 }}
            editable={!sending}
          />
          <TouchableOpacity disabled={sending} onPress={onSend} style={{ height: 44, paddingHorizontal: 16, backgroundColor: '#111827', borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}>
            {sending ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: '600' }}>Send</Text>}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
