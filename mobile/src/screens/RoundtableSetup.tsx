import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, Text, TextInput, TouchableOpacity, View, Image, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase';
import { getOwnerSlug, isPremiumUser } from '../lib/tier';
import { getRoundtableSettings } from '../lib/settings';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '../theme';

type Character = {
  id: string;
  name: string;
  description?: string | null;
  avatar_url?: string | null;
};

export default function RoundtableSetup({ navigation }: NativeStackScreenProps<any>) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeLetter, setActiveLetter] = useState('');
  const [maxParticipants, setMaxParticipants] = useState<number>(8);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('characters')
        .select('id,name,description,avatar_url')
        .eq('is_visible', true)
        .order('name', { ascending: true });
      setCharacters((data as any) || []);
      setLoading(false);
    })();
  }, []);

  // Load org roundtable limits to cap selection size
  useEffect(() => {
    (async () => {
      try {
        // Attempt to detect current user via profiles table session
        // If auth context exists in mobile, consider injecting; here we infer via supabase.auth.getUser()
        const { data: u } = await (supabase.auth?.getUser?.() as any || {});
        const userId: string | undefined = u?.user?.id;
        const slug = await getOwnerSlug(userId);
        const premium = await isPremiumUser(userId);
        const rt = await getRoundtableSettings(slug);
        const max = (premium ? rt.limits.premium.maxParticipants : rt.limits.free.maxParticipants) || rt.defaults.maxParticipants || 8;
        setMaxParticipants(max);
      } catch {
        setMaxParticipants(8);
      }
    })();
  }, []);

  const toggle = (id: string) => {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= maxParticipants) {
        alert(`You can select up to ${maxParticipants} participants for your plan.`);
        return prev;
      }
      return [...prev, id];
    });
  };

  const filtered = characters.filter(c => {
    const matchesText = c.name.toLowerCase().includes(search.toLowerCase()) || (c.description || '').toLowerCase().includes(search.toLowerCase());
    const matchesLetter = !activeLetter || c.name?.toUpperCase().startsWith(activeLetter);
    return matchesText && matchesLetter;
  });

  const start = () => {
    if (!topic.trim() || selected.length === 0) return;
    navigation.navigate('RoundtableChat', { participantIds: selected, topic });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: 16 }}>
        <Text style={{ color: theme.colors.accent, fontSize: 22, fontWeight: '700', marginBottom: 12 }}>Create a Biblical Roundtable</Text>
        <TextInput
          value={topic}
          onChangeText={setTopic}
          placeholder="Discussion topic..."
          placeholderTextColor={theme.colors.muted}
          style={{ backgroundColor: theme.colors.surface, color: theme.colors.text, padding: 12, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: theme.colors.border }}
        />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search characters..."
          placeholderTextColor={theme.colors.muted}
          style={{ backgroundColor: theme.colors.surface, color: theme.colors.text, padding: 12, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: theme.colors.border }}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>
          {['', 'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'].map((ltr) => (
            <TouchableOpacity key={ltr || 'all'} onPress={() => setActiveLetter(ltr)} style={{ paddingVertical: 6, paddingHorizontal: 10, marginRight: 8, borderRadius: 16, backgroundColor: activeLetter === ltr ? theme.colors.primary : theme.colors.card }}>
              <Text style={{ color: activeLetter === ltr ? theme.colors.primaryText : theme.colors.text, fontWeight: '600' }}>{ltr || 'All'}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Text style={{ color: theme.colors.text, marginBottom: 8 }}>Selected: {selected.length} / {maxParticipants}</Text>
        {loading ? (
          <View style={{ paddingVertical: 24 }}>
            <ActivityIndicator color={theme.colors.primary} />
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            style={{ height: 360, borderRadius: 8 }}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => toggle(item.id)} style={{ paddingVertical: 10, paddingHorizontal: 8, backgroundColor: selected.includes(item.id) ? theme.colors.card : 'transparent', borderRadius: 8, flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                <Image source={{ uri: item.avatar_url || 'https://faithtalkai.com/downloads/logo-pack/favicons/favicon-180.png' }} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.surface }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.colors.text, fontWeight: '600' }}>{item.name}</Text>
                  {!!item.description && <Text numberOfLines={1} style={{ color: theme.colors.muted, fontSize: 12 }}>{item.description}</Text>}
                </View>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          />
        )}
        <TouchableOpacity onPress={start} disabled={!topic.trim() || selected.length === 0} style={{ marginTop: 16, backgroundColor: (!topic.trim() || selected.length === 0) ? theme.colors.muted : theme.colors.primary, padding: 14, borderRadius: 10, alignItems: 'center' }}>
          <Text style={{ fontWeight: '700', color: theme.colors.primaryText }}>Start Roundtable</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
