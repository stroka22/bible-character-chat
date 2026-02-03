import React, { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, SafeAreaView, Text, TextInput, TouchableOpacity, View, Alert, Linking, Image, Share, Clipboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { useNavigation } from '@react-navigation/native';
import { generateCharacterResponse } from '../lib/api';
import { supabase } from '../lib/supabase';
import { theme } from '../theme';
import { chat } from '../lib/chat';
import { requirePremiumOrPrompt, getOwnerSlug as getTierOwnerSlug, getTierSettings } from '../lib/tier';
import { useAuth } from '../contexts/AuthContext';
import { inviteFriendToChat } from '../lib/invites';

type Message = {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  speakerId?: string | null;
};

export default function RoundtableChat({ route }: any) {
  const navigation = useNavigation<any>();
  const { participantIds, topic, conversationId } = route.params as { participantIds?: string[]; topic?: string; conversationId?: string };
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [input, setInput] = useState('');
  const [participants, setParticipants] = useState<any[]>([]);
  const [roundIndex, setRoundIndex] = useState<number>(1);
  const roundRef = React.useRef<number>(1);
  const [promptTemplate, setPromptTemplate] = useState<string>('');
  const [replyOnlySpeakerId, setReplyOnlySpeakerId] = useState<string | null>(null);
  const [savedConversationId, setSavedConversationId] = useState<string | null>(conversationId || null);
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

      // If resuming an existing conversation, load it
      if (conversationId) {
        try {
          const existingChat = await chat.getChat(conversationId);
          const existingMessages = await chat.getChatMessages(conversationId);
          
          console.log('[RoundtableChat] Loaded chat:', existingChat);
          console.log('[RoundtableChat] Chat participants:', existingChat?.participants);
          console.log('[RoundtableChat] Message count:', existingMessages.length);
          
          // Load participants from saved chat
          const savedParticipantIds = existingChat?.participants || [];
          console.log('[RoundtableChat] savedParticipantIds:', savedParticipantIds);
          
          if (savedParticipantIds.length > 0) {
            const { data } = await supabase
              .from('characters')
              .select('id,name,persona_prompt,description,avatar_url,character_traits,scriptural_context')
              .in('id', savedParticipantIds);
            console.log('[RoundtableChat] Loaded characters:', data);
            setParticipants((data as any) || []);
          } else {
            console.warn('[RoundtableChat] No participant IDs found in saved chat');
          }
          
          // Convert to Message format
          const loadedMessages: Message[] = existingMessages.map((m: any) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            speakerId: m.metadata?.speakerCharacterId || null
          }));
          console.log('[RoundtableChat] Loaded messages with speakerIds:', loadedMessages.map(m => ({ role: m.role, speakerId: m.speakerId })));
          setMessages(loadedMessages);
          
          // Calculate round index from existing messages
          const assistantCount = loadedMessages.filter(m => m.role === 'assistant').length;
          const participantCount = savedParticipantIds.length || 1;
          const rounds = Math.floor(assistantCount / participantCount) + 1;
          setRoundIndex(rounds);
          roundRef.current = rounds;
          return;
        } catch (e) {
          console.warn('Failed to load existing roundtable:', e);
        }
      }

      // New conversation - set initial system message
      if (topic) {
        setMessages([{
          id: `sys-${Date.now()}`,
          role: 'system',
          content: `A roundtable discussion on the topic: "${topic}"`
        }]);
      }

      // Load participants for new conversation
      if (participantIds && participantIds.length > 0) {
        const { data } = await supabase
          .from('characters')
          .select('id,name,persona_prompt,description,avatar_url,character_traits,scriptural_context')
          .in('id', participantIds);
        const loaded = (data as any) || [];
        setParticipants(loaded);
        // Auto-start the first round once characters are loaded
        if (!didAutoStart.current) {
          didAutoStart.current = true;
          const initialMessages = [{
            id: `sys-${Date.now()}`,
            role: 'system' as const,
            content: `A roundtable discussion on the topic: "${topic}"`
          }];
          try { await generateRound(initialMessages, loaded, undefined, roundRef.current); } catch {}
        }
      }
    })();
  }, [participantIds, conversationId]);

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
    
    // Persist user message if conversation is saved
    if (savedConversationId) {
      try { await chat.addMessage(savedConversationId, content, 'user'); } catch {}
    }
    
    await generateRound(base, undefined, { onlySpeakerId: targetId || undefined }, roundRef.current);
  };

  const generateRound = async (
    baseMessages: Message[], 
    overrideParticipants?: any[],
    opts?: { onlySpeakerId?: string },
    roundNum?: number
  ) => {
    const used = (overrideParticipants && overrideParticipants.length ? overrideParticipants : participants);
    if (used.length === 0) return;
    setIsTyping(true);
    try {
      const currentRound = typeof roundNum === "number" ? roundNum : (roundRef.current || roundIndex || 1);
      // Speaker selection
      let speakers: any[] = [];
      if (opts?.onlySpeakerId) {
        const s = used.find(u => String(u.id) === String(opts.onlySpeakerId));
        if (s) speakers = [s];
      }
      if (speakers.length === 0) {
        // default: up to 3 speakers, rotated by roundIndex so different voices lead each round
        const max = Math.min(3, used.length);
        const offset = Math.max(0, (currentRound - 1) % used.length);
        const rotated = [...used.slice(offset), ...used.slice(0, offset)];
        speakers = rotated.slice(0, max);
      }
      const working = [...baseMessages];
      for (const speaker of speakers) {
        // Build system prompt (admin template or default)
        const others = used.filter(p => String(p.id) !== String(speaker.id)).map(p => p.name).join(', ');
        const latestUser = [...working].reverse().find(m => m.role === 'user')?.content || '';
        // Get ALL previous assistant messages for full context
        const allAssistantMsgs = [...working].filter(m => m.role === 'assistant');
        const recentRemarks = allAssistantMsgs.map((m) => {
          const sp = participants.find(p => String(p.id) === String(m.speakerId));
          const name = sp?.name || 'Participant';
          const snippet = String(m.content || '').slice(0, 200).replace(/\s+/g, ' ');
          return `${name}: "${snippet}${m.content && m.content.length > 200 ? '…' : ''}"`;
        }).join('\n\n');
        const persona = speaker.persona_prompt || speaker.description || `a biblical figure known for ${speaker.scriptural_context || 'wisdom'}`;
        const traits = Array.isArray(speaker.character_traits) ? speaker.character_traits.join(', ') : (speaker.character_traits || '');
        
        // Build a prompt that forces unique perspective based on the character
        const uniqueAngle = speaker.name === 'Paul' ? 'your conversion experience, missionary journeys, and letters to the churches' :
          speaker.name === 'Peter' ? 'your time walking with Jesus, denying him, and leading the early church' :
          speaker.name === 'Moses' ? 'leading Israel out of Egypt, receiving the Law, and wandering in the wilderness' :
          speaker.name === 'David' ? 'your experiences as shepherd, warrior, king, and psalmist' :
          speaker.name === 'Mary' ? 'your experience as the mother of Jesus and witnessing his ministry' :
          speaker.name === 'Abraham' ? 'your journey of faith, leaving Ur, and the covenant promises' :
          speaker.name === 'Solomon' ? 'your wisdom, building the temple, and the lessons from Ecclesiastes' :
          speaker.name === 'Elijah' ? 'confronting the prophets of Baal, fleeing Jezebel, and hearing God\'s still small voice' :
          `your unique biblical experiences and perspective`;
        
        const defaultPrompt = (
          `You are ${speaker.name}. ${persona}. ${traits ? `Traits: ${traits}.` : ''}\n\n` +
          `ROUNDTABLE DISCUSSION - Round ${currentRound}\n` +
          `Topic: "${topic}"\n` +
          `Other participants: ${others || 'none'}\n\n` +
          (recentRemarks ? `WHAT OTHERS HAVE ALREADY SAID (DO NOT REPEAT ANY OF THIS):\n${recentRemarks}\n\n` : '') +
          `YOUR TASK:\n` +
          `You MUST offer a FRESH, UNIQUE perspective that NO ONE else has mentioned.\n\n` +
          `REQUIREMENTS:\n` +
          `1. Draw ONLY from ${uniqueAngle}.\n` +
          `2. Share a SPECIFIC story, event, or scripture from YOUR life that relates to this topic.\n` +
          `3. If others talked about faith, YOU talk about something different - maybe obedience, patience, suffering, or joy.\n` +
          `4. If others quoted certain scriptures, YOU quote DIFFERENT ones from your own experience.\n` +
          `5. You may DISAGREE with or BUILD UPON what others said, but add NEW insight.\n` +
          `6. Speak in first person as ${speaker.name}. Do NOT prefix with your name.\n` +
          `7. Keep response to 80-120 words.\n\n` +
          (latestUser ? `The user asked: "${latestUser}" - respond to this.\n\n` : '') +
          `Now speak as ${speaker.name} with YOUR unique voice and experience.`
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
        
        // Persist assistant message if conversation is saved (with speaker metadata)
        if (savedConversationId) {
          try { await chat.addMessage(savedConversationId, text, 'assistant', { speakerCharacterId: String(speaker.id) }); } catch {}
        }
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
          <View style={{ backgroundColor: theme.colors.primary, padding: 10, borderRadius: 12 }}>
            <Text style={{ color: theme.colors.primaryText }}>{item.content}</Text>
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
          style={{ flexDirection: 'row', gap: 8, marginVertical: 6, backgroundColor: theme.colors.card, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border }}>
          {sp?.avatar_url ? (
            <Image source={{ uri: sp.avatar_url }} style={{ width: 36, height: 36, borderRadius: 18 }} />
          ) : (
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: theme.colors.primaryText, fontSize: 14, fontWeight: '700' }}>{sp?.name?.[0] || '?'}</Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.colors.accent, fontWeight: '700', marginBottom: 4 }}>{sp?.name || 'Character'}</Text>
            <Text style={{ color: theme.colors.text }}>{item.content}</Text>
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
    
    // If already saved (resumed conversation), just show confirmation
    if (savedConversationId) {
      Alert.alert('Already Saved', 'This roundtable is already saved to My Walk. New messages are saved automatically.');
      return;
    }
    
    await requirePremiumOrPrompt({
      userId: user?.id,
      feature: 'save',
      onUpgrade: () => navigation.navigate('Paywall'),
      onAllowed: async () => {
        try {
          const title = `Roundtable: ${topic}`;
          const pIds = participantIds || participants.map(p => p.id);
          const c = await chat.createChat(String(user?.id), String(pIds[0] || ''), title, {
            conversationType: 'roundtable',
            participants: pIds
          });
          const seq = messages.filter(m => m.role !== 'system');
          for (const m of seq) {
            const metadata = m.speakerId ? { speakerCharacterId: m.speakerId } : undefined;
            await chat.addMessage(c.id, m.content, m.role as any, metadata);
          }
          // Mark saved chats as favorites so they appear under My Walk
          try { await chat.toggleFavorite(c.id, true); } catch {}
          setSavedConversationId(c.id);
          Alert.alert('Saved', 'Roundtable saved to My Walk.');
        } catch (e) {
          Alert.alert('Error', `Unable to save this roundtable.${e && (e as any).message ? `\n${(e as any).message}` : ''}`);
        }
      }
    });
  };

  const copyConversation = () => {
    const text = messages
      .filter(m => m.role !== 'system')
      .map(m => {
        if (m.role === 'user') return `You: ${m.content}`;
        const sp = participants.find(p => String(p.id) === String(m.speakerId));
        return `${sp?.name || 'Character'}: ${m.content}`;
      })
      .join('\n\n');
    Clipboard.setString(text);
    Alert.alert('Copied!', 'Conversation copied to clipboard.');
  };

  const shareConversation = async () => {
    const text = messages
      .filter(m => m.role !== 'system')
      .map(m => {
        if (m.role === 'user') return `You: ${m.content}`;
        const sp = participants.find(p => String(p.id) === String(m.speakerId));
        return `${sp?.name || 'Character'}: ${m.content}`;
      })
      .join('\n\n');
    const shareText = `Roundtable Discussion: ${topic}\n\nParticipants: ${participants.map(p => p.name).join(', ')}\n\n${text}\n\n— via Faith Talk AI`;
    try {
      await Share.share({ message: shareText, title: `Roundtable: ${topic}` });
    } catch {}
  };




  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: 16, paddingBottom: 8 }}>
        <Text style={{ color: theme.colors.accent, fontSize: 18, fontWeight: '700' }}>Biblical Roundtable</Text>
        <Text style={{ color: theme.colors.text }}>{topic}</Text>
        <View style={{ marginTop: 8, flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          <TouchableOpacity onPress={saveToMyWalk} style={{ backgroundColor: theme.colors.primary, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 }}>
            <Text style={{ color: theme.colors.primaryText, fontWeight: '600', fontSize: 12 }}>💾 Save</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={shareConversation} style={{ backgroundColor: theme.colors.surface, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border }}>
            <Text style={{ color: theme.colors.text, fontWeight: '600', fontSize: 12 }}>📤 Share</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={copyConversation} style={{ backgroundColor: theme.colors.surface, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border }}>
            <Text style={{ color: theme.colors.text, fontWeight: '600', fontSize: 12 }}>📋 Copy</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={async () => {
              if (!savedConversationId) {
                Alert.alert('Save First', 'Please save this roundtable first to invite friends.');
                return;
              }
              const { error } = await inviteFriendToChat(savedConversationId, `Roundtable: ${topic}`);
              if (error) Alert.alert('Error', error);
            }} 
            style={{ backgroundColor: theme.colors.primary, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 }}
          >
            <Text style={{ color: theme.colors.primaryText, fontWeight: '600', fontSize: 12 }}>👥 Invite</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => navigation.navigate('RoundtableSetup')}
            style={{ backgroundColor: theme.colors.surface, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border }}
          >
            <Text style={{ color: theme.colors.text, fontWeight: '600', fontSize: 12 }}>🔄 New</Text>
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
