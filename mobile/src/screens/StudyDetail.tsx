import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, Text, TouchableOpacity, View, Image } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { chat } from '../lib/chat';
import { generateCharacterResponse } from '../lib/api';
import { theme } from '../theme';

type Lesson = {
  id: string;
  title: string;
  order_index: number;
  summary?: string | null;
};

export default function StudyDetail({ route, navigation }: any) {
  const { studyId, title } = route.params as { studyId: string; title: string };
  const { user } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [studyMeta, setStudyMeta] = useState<{ character_id?: string | null; character_instructions?: string | null } | null>(null);
  const [guide, setGuide] = useState<{ id: string; name: string; avatar_url?: string | null; persona_prompt?: string | null } | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      // fetch study meta (character + instructions)
      try {
        const { data: s } = await supabase
          ?.from('bible_studies')
          .select('character_id,character_instructions')
          .eq('id', studyId)
          .maybeSingle() as any;
        setStudyMeta(s || {});
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
        .select('id,title,order_index,summary')
        .eq('study_id', studyId)
        .order('order_index', { ascending: true }) as any;
      setLessons(data || []);
      setLoading(false);
    })();
  }, [studyId]);

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
      const newChat = await chat.createChat(user.id, String(studyMeta.character_id), title);
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
      <View style={{ padding: 16 }}>
        <Text style={{ color: theme.colors.accent, fontSize: 22, fontWeight: '800', marginBottom: 8 }}>{title}</Text>
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
        <TouchableOpacity disabled={starting} onPress={startGuidedChat} style={{ alignSelf: 'flex-start', backgroundColor: theme.colors.primary, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12 }}>
          <Text style={{ fontWeight: '700', color: theme.colors.primaryText }}>{starting ? 'Starting…' : 'Start Guided Chat'}</Text>
        </TouchableOpacity>
        {loading ? (
          <ActivityIndicator color={theme.colors.primary} />
        ) : (
          <FlatList
            data={lessons}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 8 }}
            renderItem={({ item }) => (
              <View style={{ padding: 12, backgroundColor: theme.colors.card, borderRadius: 10, marginBottom: 8 }}>
                <Text style={{ color: theme.colors.text, fontWeight: '700' }}>Lesson {item.order_index + 1}: {item.title}</Text>
                {!!item.summary && (
                  <Text style={{ color: theme.colors.muted, marginTop: 6 }}>{item.summary}</Text>
                )}
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
