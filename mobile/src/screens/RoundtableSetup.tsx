import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, Text, TextInput, TouchableOpacity, View, Image, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

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

  const toggle = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <View style={{ padding: 16 }}>
        <Text style={{ color: '#fde68a', fontSize: 22, fontWeight: '700', marginBottom: 12 }}>Create a Biblical Roundtable</Text>
        <TextInput
          value={topic}
          onChangeText={setTopic}
          placeholder="Discussion topic..."
          placeholderTextColor="#9ca3af"
          style={{ backgroundColor: '#111827', color: 'white', padding: 12, borderRadius: 8, marginBottom: 12 }}
        />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search characters..."
          placeholderTextColor="#9ca3af"
          style={{ backgroundColor: '#111827', color: 'white', padding: 12, borderRadius: 8, marginBottom: 12 }}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>
          {['', 'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'].map((ltr) => (
            <TouchableOpacity key={ltr || 'all'} onPress={() => setActiveLetter(ltr)} style={{ paddingVertical: 6, paddingHorizontal: 10, marginRight: 8, borderRadius: 16, backgroundColor: activeLetter === ltr ? '#facc15' : '#1f2937' }}>
              <Text style={{ color: activeLetter === ltr ? '#111827' : '#e5e7eb', fontWeight: '600' }}>{ltr || 'All'}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Text style={{ color: '#e5e7eb', marginBottom: 8 }}>Selected: {selected.length}</Text>
        {loading ? (
          <View style={{ paddingVertical: 24 }}>
            <ActivityIndicator color="#facc15" />
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            style={{ height: 360, borderRadius: 8 }}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => toggle(item.id)} style={{ paddingVertical: 10, paddingHorizontal: 8, backgroundColor: selected.includes(item.id) ? '#1f2937' : 'transparent', borderRadius: 8, flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                <Image source={{ uri: item.avatar_url || 'https://faithtalkai.com/downloads/logo-pack/favicons/favicon-180.png' }} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#374151' }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: 'white', fontWeight: '600' }}>{item.name}</Text>
                  {!!item.description && <Text numberOfLines={1} style={{ color: '#9ca3af', fontSize: 12 }}>{item.description}</Text>}
                </View>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          />
        )}
        <TouchableOpacity onPress={start} disabled={!topic.trim() || selected.length === 0} style={{ marginTop: 16, backgroundColor: (!topic.trim() || selected.length === 0) ? '#9ca3af' : '#facc15', padding: 14, borderRadius: 10, alignItems: 'center' }}>
          <Text style={{ fontWeight: '700' }}>Start Roundtable</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
