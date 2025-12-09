import React, { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, SafeAreaView, Text, TextInput, TouchableOpacity, View, Alert, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { generateCharacterResponse } from '../lib/api';
import { supabase } from '../lib/supabase';
import { theme } from '../theme';
import { chat } from '../lib/chat';
import { requirePremiumOrPrompt } from '../lib/tier';
import { useAuth } from '../contexts/AuthContext';

type Message = {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  speakerId?: string | null;
};

export default function RoundtableChat({ route }: any) {
  const { participantIds, topic } = route.params as { participantIds: string[]; topic: string };
  const [messages, setMessages] = useState<Message[]>([{
    id: `sys-${Date.now()}`,
    role: 'system',
    content: `A roundtable discussion on the topic: "${topic}"`
  }]);
  const [isTyping, setIsTyping] = useState(false);
  const [input, setInput] = useState('');
  const [participants, setParticipants] = useState<any[]>([]);
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { user } = useAuth();
  const didAutoStart = React.useRef(false);

  React.useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('characters')
        .select('id,name,persona_prompt,description,avatar_url,character_traits,scriptural_context')
        .in('id', participantIds);
      const loaded = (data as any) || [];
      setParticipants(loaded);
      // Auto-start the first round once characters are loaded
      if (!didAutoStart.current) {
        didAutoStart.current = true;
        try { await generateRound(messages, loaded); } catch {}
      }
    })();
  }, [participantIds]);

  const sendUser = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content: input.trim() };
    const base = [...messages, userMsg];
    setMessages(base);
    setInput('');
    await generateRound(base);
  };

  const generateRound = async (baseMessages: Message[], overrideParticipants?: any[]) => {
    const used = (overrideParticipants && overrideParticipants.length ? overrideParticipants : participants);
    if (used.length === 0) return;
    setIsTyping(true);
    try {
      // simple round: up to 3 speakers sequentially
      const speakers = used.slice(0, Math.min(3, used.length));
      const working = [...baseMessages];
      for (const speaker of speakers) {
        const system = {
          role: 'system' as const,
          content: `You are ${speaker.name}. Persona: ${speaker.persona_prompt || speaker.description || ''}\nContext: A roundtable on: "${topic}".\nCRITICAL: Respond strictly as ${speaker.name} only. Do NOT take on any other role. Use first-person from ${speaker.name}'s perspective. Keep it concise (<=110 words). Avoid repeating prior points; add a distinct, scripture-grounded perspective.`
        };
        const payload = [system, ...working.slice(-10).map(m => ({ role: m.role, content: m.content }))];
        let text = '';
        try {
          text = await generateCharacterResponse(speaker.name, speaker.persona_prompt || speaker.description || '', payload as any);
        } catch (e) {
          text = '(unable to respond)';
        }
        const msg: Message = { id: `a-${speaker.id}-${Date.now()}`, role: 'assistant', content: text, speakerId: String(speaker.id) };
        working.push(msg);
        setMessages(prev => [...prev, msg]);
      }
    } finally {
      setIsTyping(false);
    }
  };

  const renderItem = ({ item }: { item: Message }) => {
    if (item.role === 'user') {
      return (
        <View style={{ alignItems: 'flex-end', marginVertical: 6 }}>
          <View style={{ backgroundColor: '#2563eb', padding: 10, borderRadius: 12 }}>
            <Text style={{ color: 'white' }}>{item.content}</Text>
          </View>
        </View>
      );
    }
    if (item.role === 'assistant') {
      const sp = participants.find(p => String(p.id) === String(item.speakerId));
      return (
        <View style={{ flexDirection: 'row', gap: 8, marginVertical: 6 }}>
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#374151', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: 'white', fontSize: 12 }}>{sp?.name?.[0] || '?'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#fde68a', fontWeight: '600', marginBottom: 4 }}>{sp?.name || 'Character'}</Text>
            <Text style={{ color: 'white' }}>{item.content}</Text>
          </View>
        </View>
      );
    }
    return null;
  };

  const saveToMyWalk = async () => {
    await requirePremiumOrPrompt({
      userId: user?.id,
      feature: 'save',
      onUpgrade: () => Linking.openURL('https://faithtalkai.com/pricing'),
      onAllowed: async () => {
        try {
          const title = `Roundtable: ${topic}`;
          const c = await chat.createChat(String(user?.id), String(participantIds[0] || ''), title);
          const seq = messages.filter(m => m.role !== 'system');
          for (const m of seq) {
            await chat.addMessage(c.id, m.content, m.role as any);
          }
          Alert.alert('Saved', 'Roundtable saved to My Walk.');
        } catch (e) {
          Alert.alert('Error', 'Unable to save this roundtable.');
        }
      }
    });
  };


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: 16, paddingBottom: 8 }}>
        <Text style={{ color: theme.colors.accent, fontSize: 18, fontWeight: '700' }}>Biblical Roundtable</Text>
        <Text style={{ color: theme.colors.text }}>{topic}</Text>
        <View style={{ marginTop: 8 }}>
          <TouchableOpacity onPress={saveToMyWalk} style={{ alignSelf: 'flex-start', backgroundColor: theme.colors.primary, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 }}>
            <Text style={{ color: theme.colors.primaryText, fontWeight: '700' }}>Save to My Walk</Text>
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={messages.filter(m => m.role !== 'system')}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12 + Math.max(insets.bottom, 8) + 56 }}
        renderItem={renderItem}
      />
      {isTyping && (
        <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      )}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16, paddingBottom: 16 + Math.max(insets.bottom, 6) }}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type your message..."
            placeholderTextColor={theme.colors.muted}
            style={{ flex: 1, backgroundColor: theme.colors.surface, color: theme.colors.text, padding: 12, borderRadius: 24, borderWidth: 1, borderColor: theme.colors.border }}
          />
          <TouchableOpacity onPress={sendUser} disabled={!input.trim() || isTyping} style={{ backgroundColor: (!input.trim() || isTyping) ? theme.colors.muted : theme.colors.primary, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 20 }}>
            <Text style={{ fontWeight: '700', color: theme.colors.primaryText }}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
