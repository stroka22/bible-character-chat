import React, { useCallback } from 'react';
import { SafeAreaView, Text, TextInput, TouchableOpacity, View, FlatList, Image, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { chat } from '../lib/chat';
import { getOwnerSlug, getTierSettings, isCharacterFree, isPremiumUser } from '../lib/tier';
import { isLocalPremiumActive } from '../lib/iap';
import { getSiteSettingsForUser } from '../lib/settings';
import { Alert, Linking, Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { theme } from '../theme';
import { getFavoriteCharacterIds, setFavoriteCharacter } from '../lib/favorites';

const CURATED_BOOKS = ['Genesis','Exodus','Psalms','Proverbs','Gospels','Acts','Romans','Hebrews'];

export default function ChatNew() {
  const { user } = useAuth();
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [title, setTitle] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [characters, setCharacters] = React.useState<any[]>([]);
  const [activeLetter, setActiveLetter] = React.useState<string>('');
  const [filterMode, setFilterMode] = React.useState<'all' | 'favorites' | 'ot' | 'nt' | 'group'>('all');
  const [selectedGroup, setSelectedGroup] = React.useState<string>('');
  const [favIds, setFavIds] = React.useState<Set<string>>(new Set());
  const [siteSettings, setSiteSettings] = React.useState<{ defaultFeaturedCharacterId: string | null; enforceAdminDefault: boolean }>({ defaultFeaturedCharacterId: null, enforceAdminDefault: false });
  // Categories row removed for clarity and speed

  // Load favorites when screen comes into focus (syncs with My Walk changes)
  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      (async () => {
        if (!user) { setFavIds(new Set()); return; }
        try {
          const favs = await getFavoriteCharacterIds(user.id);
          if (mounted) setFavIds(favs);
        } catch {}
      })();
      return () => { mounted = false; };
    }, [user])
  );

  // Load site settings (featured character + enforcement)
  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const s = await getSiteSettingsForUser(user?.id);
        if (active) setSiteSettings({ defaultFeaturedCharacterId: s.defaultFeaturedCharacterId, enforceAdminDefault: !!s.enforceAdminDefault });
      } catch {}
    })();
    return () => { active = false; };
  }, [user?.id]);

  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        let query = supabase
          .from('characters')
          .select('id,name,description,avatar_url,opening_line,persona_prompt,is_visible,bible_book')
          .or('is_visible.is.null,is_visible.eq.true');
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
        let out = data || [];
        // enforce featured pin if configured
        if (siteSettings.enforceAdminDefault && siteSettings.defaultFeaturedCharacterId) {
          const fid = String(siteSettings.defaultFeaturedCharacterId);
          const idx = out.findIndex((c: any) => String(c.id) === fid);
          if (idx > 0) {
            out = [out[idx], ...out.slice(0, idx), ...out.slice(idx + 1)];
          }
        }
        if (filterMode === 'favorites' && user) {
          const ids = favIds;
          out = out.filter((c: any) => ids.has(String(c.id)));
        } else if (filterMode === 'ot') {
          // Old Testament characters
          const otBooks = ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi'];
          out = out.filter((c: any) => c.bible_book && otBooks.some(b => c.bible_book?.toLowerCase().includes(b.toLowerCase())));
        } else if (filterMode === 'nt') {
          // New Testament characters
          const ntBooks = ['Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', 'Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', 'Thessalonians', 'Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', 'Peter', 'Jude', 'Revelation', 'Gospel', 'Gospels'];
          out = out.filter((c: any) => c.bible_book && ntBooks.some(b => c.bible_book?.toLowerCase().includes(b.toLowerCase())));
        } else if (filterMode === 'group' && selectedGroup) {
          out = out.filter((c: any) => c.bible_book?.toLowerCase().includes(selectedGroup.toLowerCase()));
        }
        if (active) setCharacters(out);
      } catch {}
    })();
    return () => { active = false; };
  }, [search, activeLetter, filterMode, selectedGroup, user, favIds, siteSettings.defaultFeaturedCharacterId, siteSettings.enforceAdminDefault]);

  // Categories kept small and curated for speed and legibility

  async function start(c: any) {
    if (!user) return;
    if (c && c.is_visible === false) {
      Alert.alert('Unavailable', 'This character is not available.');
      return;
    }
    // Gate by character if not premium and not in free list
    try {
      const premium = (Platform.OS === 'ios' ? (await isLocalPremiumActive()) : await isPremiumUser(user.id));
      if (!premium) {
        const slug = await getOwnerSlug(user.id);
        const s = await getTierSettings(slug);
        if (!isCharacterFree(s, { id: c.id, name: c.name })) {
          Alert.alert('Upgrade required', `${c.name} is a premium character. Upgrade to continue.`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Upgrade', onPress: () => (nav as any).navigate('Paywall') }
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
      nav.navigate('ChatDetail', { chatId: newChat.id, character: c });
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: 16 }}>
        <View style={{ position: 'absolute', right: 16, top: 16 }}>
          <TouchableOpacity onPress={() => nav.navigate('MainTabs', { screen: 'Home' })} style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 16, backgroundColor: theme.colors.card }}>
            <Text style={{ color: theme.colors.text, fontWeight: '700' }}>Back</Text>
          </TouchableOpacity>
        </View>
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
      {/* Main filter row */}
      <View style={{ height: 44, justifyContent: 'center' }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          <TouchableOpacity onPress={() => { setFilterMode('all'); setActiveLetter(''); setSelectedGroup(''); }} style={{ height: 32, paddingHorizontal: 14, borderRadius: 16, justifyContent: 'center', backgroundColor: filterMode === 'all' && !activeLetter ? theme.colors.primary : theme.colors.card }}>
            <Text style={{ color: (filterMode === 'all' && !activeLetter) ? theme.colors.primaryText : theme.colors.text, fontWeight: '700', fontSize: 14 }}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setFilterMode('favorites'); setActiveLetter(''); setSelectedGroup(''); }} style={{ height: 32, paddingHorizontal: 14, borderRadius: 16, justifyContent: 'center', backgroundColor: filterMode === 'favorites' ? theme.colors.primary : theme.colors.card }}>
            <Text style={{ color: filterMode === 'favorites' ? theme.colors.primaryText : theme.colors.text, fontWeight: '700', fontSize: 14 }}>⭐ Favorites</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setFilterMode('ot'); setActiveLetter(''); setSelectedGroup(''); }} style={{ height: 32, paddingHorizontal: 14, borderRadius: 16, justifyContent: 'center', backgroundColor: filterMode === 'ot' ? theme.colors.primary : theme.colors.card }}>
            <Text style={{ color: filterMode === 'ot' ? theme.colors.primaryText : theme.colors.text, fontWeight: '700', fontSize: 14 }}>Old Testament</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setFilterMode('nt'); setActiveLetter(''); setSelectedGroup(''); }} style={{ height: 32, paddingHorizontal: 14, borderRadius: 16, justifyContent: 'center', backgroundColor: filterMode === 'nt' ? theme.colors.primary : theme.colors.card }}>
            <Text style={{ color: filterMode === 'nt' ? theme.colors.primaryText : theme.colors.text, fontWeight: '700', fontSize: 14 }}>New Testament</Text>
          </TouchableOpacity>
          {CURATED_BOOKS.map((book) => (
            <TouchableOpacity key={book} onPress={() => { setFilterMode('group'); setSelectedGroup(book); setActiveLetter(''); }} style={{ height: 32, paddingHorizontal: 14, borderRadius: 16, justifyContent: 'center', backgroundColor: filterMode === 'group' && selectedGroup === book ? theme.colors.primary : theme.colors.card }}>
              <Text style={{ color: (filterMode === 'group' && selectedGroup === book) ? theme.colors.primaryText : theme.colors.text, fontWeight: '700', fontSize: 14 }}>{book}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      {/* A-Z row */}
      <View style={{ height: 40, justifyContent: 'center' }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 4 }}>
          {['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'].map((ltr) => (
            <TouchableOpacity key={ltr} onPress={() => { setFilterMode('all'); setActiveLetter(ltr); setSelectedGroup(''); }} style={{ width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: activeLetter === ltr ? theme.colors.primary : theme.colors.surface }}>
              <Text style={{ color: activeLetter === ltr ? theme.colors.primaryText : theme.colors.text, fontWeight: '600', fontSize: 13 }}>{ltr}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      {/* categories pills removed */}
      <FlatList
        data={characters}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ padding: 12, paddingBottom: 24 + Math.max(insets.bottom, 8) }}
        initialNumToRender={12}
        windowSize={10}
        maxToRenderPerBatch={12}
        removeClippedSubviews
        renderItem={({ item }) => (
          <View style={{ padding: 12, borderRadius: 10, backgroundColor: theme.colors.card, marginBottom: 8 }}>
            <TouchableOpacity disabled={loading} onPress={() => start(item)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Image source={{ uri: item.avatar_url || 'https://faithtalkai.com/downloads/logo-pack/favicons/favicon-180.png' }} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.surface }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '600', color: theme.colors.text }}>{item.name}</Text>
              {item.description ? <Text numberOfLines={2} style={{ color: theme.colors.muted, marginTop: 4 }}>{item.description}</Text> : null}
            </View>
            </TouchableOpacity>
            {user ? (
              <TouchableOpacity onPress={async () => {
                const id = String(item.id);
                const next = !favIds.has(id);
                try {
                  await setFavoriteCharacter(user.id, id, next);
                  const updated = new Set(favIds);
                  if (next) updated.add(id); else updated.delete(id);
                  setFavIds(updated);
                } catch {}
              }} style={{ position: 'absolute', right: 10, top: 10, padding: 4 }}>
                <Text style={{ fontSize: 18, color: favIds.has(String(item.id)) ? '#facc15' : theme.colors.muted, textShadowColor: '#0f172a', textShadowRadius: 3, textShadowOffset: { width: 0, height: 1 } }}>
                  {favIds.has(String(item.id)) ? '★' : '☆'}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}
      />
    </SafeAreaView>
  );
}
