import React, { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, SafeAreaView, Text, TextInput, TouchableOpacity, View, Alert, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { generateCharacterResponse } from '../lib/api';
import { supabase } from '../lib/supabase';
import { theme } from '../theme';
import { chat } from '../lib/chat';
import { requirePremiumOrPrompt, getOwnerSlug as getTierOwnerSlug, getTierSettings } from '../lib/tier';
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
  const [roundIndex, setRoundIndex] = useState<number>(1);
  const [promptTemplate, setPromptTemplate] = useState<string>('');
  const [replyOnlySpeakerId, setReplyOnlySpeakerId] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { user } = useAuth();
  const didAutoStart = React.useRef(false);

  React.useEffect(() => {
    (async () => {
      // Load optional admin-configured prompt template from tier settings
      try {
        const slug = await getTierOwnerSlug(user?.id);
        const s = await getTierSettings(slug);
        const tpl = s?.premiumRoundtableGates?.promptTemplate;
        if (typeof tpl === 'string') setPromptTemplate(tpl);
      } catch {}

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
    // Detect direct reply to a specific character using @Name prefix
    let targetId: string | null = null;
    let content = input.trim();
    const atMatch = content.match(/^@\s*([A-Za-z][A-Za-z\s\-'\.]{0,40})(?:\:)?\s+(.*)$/);
    if (atMatch) {
      const name = atMatch[1].trim().toLowerCase();
      content = atMatch[2].trim();
      const found = participants.find(p => String(p.name || '').toLowerCase() === name);
      if (found) targetId = String(found.id);
    }
    setReplyOnlySpeakerId(targetId);

    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content };
    const base = [...messages, userMsg];
    setMessages(base);
    setInput('');
    await generateRound(base, undefined, { onlySpeakerId: targetId || undefined });
  };

  const generateRound = async (
    baseMessages: Message[], 
    overrideParticipants?: any[],
    opts?: { onlySpeakerId?: string }
  ) => {
    const used = (overrideParticipants && overrideParticipants.length ? overrideParticipants : participants);
    if (used.length === 0) return;
    setIsTyping(true);
    try {
      // Speaker selection
      let speakers: any[] = [];
      if (opts?.onlySpeakerId) {
        const s = used.find(u => String(u.id) === String(opts.onlySpeakerId));
        if (s) speakers = [s];
      }
      if (speakers.length === 0) {
        // default: up to 3 speakers, rotated by roundIndex so different voices lead each round
        const max = Math.min(3, used.length);
        const offset = Math.max(0, (roundIndex - 1) % used.length);
        const rotated = [...used.slice(offset), ...used.slice(0, offset)];
        speakers = rotated.slice(0, max);
      }
      const working = [...baseMessages];
      for (const speaker of speakers) {
        // Build system prompt (admin template or default)
        const others = used.filter(p => String(p.id) !== String(speaker.id)).map(p => p.name).join(', ');
        const latestUser = [...working].reverse().find(m => m.role === 'user')?.content || '';
        const recentAssistantMsgs = [...working].filter(m => m.role === 'assistant').slice(-3);
        const recentRemarks = recentAssistantMsgs.map((m) => {
          const sp = participants.find(p => String(p.id) === String(m.speakerId));
          const name = sp?.name || 'Participant';
          const snippet = String(m.content || '').slice(0, 120).replace(/\s+/g, ' ');
          return `- ${name}: ${snippet}${m.content && m.content.length > 120 ? '…' : ''}`;
        }).join('\n');
        const persona = speaker.persona_prompt || speaker.description || `a biblical figure known for ${speaker.scriptural_context || 'wisdom'}`;
        const traits = Array.isArray(speaker.character_traits) ? speaker.character_traits.join(', ') : (speaker.character_traits || '');
        const defaultPrompt = (
          `You are ${speaker.name}. Persona: ${persona}. ${traits ? `Known traits: ${traits}.` : ''}\n` +
          `You are participating in a roundtable discussion (Round ${roundIndex}) on the topic: "${topic}".\n` +
          `The other participants are: ${others || 'none'}.\n` +
          (recentRemarks ? `Recent remarks:\n${recentRemarks}\n` : '') +
          `Respond in first person as ${speaker.name}. Do not include any name prefixes.\n` +
          `Keep it concise (<=110 words). Do not repeat prior points; add a distinct, scripture-grounded perspective; if someone already made your point, add a complementary or contrasting insight. Optionally reference others by name.\n` +
          (latestUser ? `Latest user input to consider: "${latestUser}"\n` : '') +
          `Stay in character and draw from biblical knowledge.`
        ).trim();

        const sysContent = (promptTemplate && typeof promptTemplate === 'string' && promptTemplate.trim().length > 0)
          ? promptTemplate
              .replace(/\{NAME\}/g, String(speaker.name))
              .replace(/\{PERSONA\}/g, String(persona))
              .replace(/\{TRAITS\}/g, String(traits))
              .replace(/\{TOPIC\}/g, String(topic))
              .replace(/\{OTHERS\}/g, String(others))
              .replace(/\{MAX_WORDS\}/g, '110')
              .replace(/\{LATEST_USER_INPUT\}/g, String(latestUser))
          : defaultPrompt;

        const system = { role: 'system' as const, content: sysContent };
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
      // Clear one-shot reply-only target after a directed reply
      setReplyOnlySpeakerId(null);
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
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            if (sp?.name) setInput(prev => prev?.startsWith('@') ? prev : `@${sp.name} `);
          }}
          style={{ flexDirection: 'row', gap: 8, marginVertical: 6 }}>
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#374151', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: 'white', fontSize: 12 }}>{sp?.name?.[0] || '?'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#fde68a', fontWeight: '600', marginBottom: 4 }}>{sp?.name || 'Character'}</Text>
            <Text style={{ color: 'white' }}>{item.content}</Text>
          </View>
        </TouchableOpacity>
      );
    }
    return null;
  };

  const saveToMyWalk = async () => {
    if (!user?.id) {
      Alert.alert('Sign in required', 'Please sign in to save this roundtable.');
      return;
    }
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
          // Mark saved chats as favorites so they appear under My Walk
          try { await chat.toggleFavorite(c.id, true); } catch {}
          Alert.alert('Saved', 'Roundtable saved to My Walk.');
        } catch (e) {
          Alert.alert('Error', `Unable to save this roundtable.${e && (e as any).message ? `\n${(e as any).message}` : ''}`);
        }
      }
    });
  };

  const nextRound = async () => {
    if (isTyping) return;
    setRoundIndex((r) => r + 1);
    await generateRound(messages);
  };


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: 16, paddingBottom: 8 }}>
        <Text style={{ color: theme.colors.accent, fontSize: 18, fontWeight: '700' }}>Biblical Roundtable</Text>
        <Text style={{ color: theme.colors.text }}>{topic}</Text>
        <View style={{ marginTop: 8, flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity onPress={saveToMyWalk} style={{ alignSelf: 'flex-start', backgroundColor: theme.colors.primary, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 }}>
            <Text style={{ color: theme.colors.primaryText, fontWeight: '700' }}>Save to My Walk</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={nextRound} disabled={isTyping} style={{ alignSelf: 'flex-start', backgroundColor: isTyping ? theme.colors.muted : theme.colors.card, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border }}>
            <Text style={{ color: theme.colors.text, fontWeight: '700' }}>Next Round</Text>
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
