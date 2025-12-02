import React from 'react';
import { SafeAreaView, Text, TextInput, TouchableOpacity, View, FlatList, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { chat } from '../lib/chat';
import { getOwnerSlug, getTierSettings, isCharacterFree, isPremiumUser } from '../lib/tier';
import { Alert, Linking } from 'react-native';
import { supabase } from '../lib/supabase';
import { theme } from '../theme';

const CURATED_BOOKS = ['Genesis','Exodus','Psalms','Proverbs','Gospels','Acts','Romans','Hebrews'];

export default function ChatNew() {
  const { user } = useAuth();
  const nav = useNavigation<any>();
  const [title, setTitle] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [characters, setCharacters] = React.useState<any[]>([]);
  const [activeLetter, setActiveLetter] = React.useState<string>('');
  // Categories row removed for clarity and speed

  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        let query = supabase.from('characters').select('id,name,description,avatar_url,opening_line,persona_prompt');
        if (search && search.trim()) {
          query = query.or(
            `name.ilike.%${search}%,description.ilike.%${search}%,bible_book.ilike.%${search}%`
          ) as any;
        }
        if (activeLetter) {
          query = query.ilike('name', `${activeLetter}%`) as any;
        }
        // no category filter
        const { data } = await query.order('name');
        if (active) setCharacters(data || []);
      } catch {}
    })();
    return () => { active = false; };
  }, [search, activeLetter]);

  // Categories kept small and curated for speed and legibility

  async function start(c: any) {
    if (!user) return;
    // Gate by character if not premium and not in free list
    try {
      const premium = await isPremiumUser(user.id);
      if (!premium) {
        const slug = await getOwnerSlug(user.id);
        const s = await getTierSettings(slug);
        if (!isCharacterFree(s, { id: c.id, name: c.name })) {
          Alert.alert('Upgrade required', `${c.name} is a premium character. Upgrade to continue.`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Upgrade', onPress: () => Linking.openURL('https://faithtalkai.com/pricing') }
          ]);
          return;
        }
      }
    } catch {}
    setLoading(true);
    try {
      const newChat = await chat.createChat(user.id, String(c.id), title.trim() || `Chat with ${c.name}`);
      // add opening line if available
      if (c.opening_line) {
        try { await chat.addMessage(newChat.id, c.opening_line, 'assistant'); } catch {}
      }
      nav.replace('ChatDetail', { chatId: newChat.id, character: c });
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12, color: theme.colors.accent }}>New Chat</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Title (optional)"
          placeholderTextColor={theme.colors.muted}
          style={{ borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text, borderRadius: 8, paddingHorizontal: 12, height: 44, marginBottom: 12 }}
        />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search characters…"
          placeholderTextColor={theme.colors.muted}
          style={{ borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, color: theme.colors.text, borderRadius: 8, paddingHorizontal: 12, height: 44 }}
        />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8 }}>
        {['', 'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'].map((ltr) => (
          <TouchableOpacity key={ltr || 'all'} onPress={() => setActiveLetter(ltr)} style={{ minHeight: 56, paddingVertical: 14, paddingHorizontal: 18, marginRight: 8, borderRadius: 28, backgroundColor: activeLetter === ltr ? theme.colors.primary : theme.colors.card }}>
            <Text style={{ color: activeLetter === ltr ? theme.colors.primaryText : theme.colors.text, fontWeight: '900', fontSize: 18 }}>{ltr || 'All'}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {/* categories pills removed */}
      <FlatList
        data={characters}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ padding: 12 }}
        initialNumToRender={12}
        windowSize={10}
        maxToRenderPerBatch={12}
        removeClippedSubviews
        renderItem={({ item }) => (
          <TouchableOpacity disabled={loading} onPress={() => start(item)} style={{ padding: 12, borderRadius: 10, backgroundColor: theme.colors.card, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Image source={{ uri: item.avatar_url || 'https://faithtalkai.com/downloads/logo-pack/favicons/favicon-180.png' }} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.surface }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '600', color: theme.colors.text }}>{item.name}</Text>
              {item.description ? <Text numberOfLines={2} style={{ color: theme.colors.muted, marginTop: 4 }}>{item.description}</Text> : null}
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
