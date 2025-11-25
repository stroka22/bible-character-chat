import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
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

  const filtered = characters.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(search.toLowerCase())
  );

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
              <TouchableOpacity onPress={() => toggle(item.id)} style={{ paddingVertical: 10, paddingHorizontal: 8, backgroundColor: selected.includes(item.id) ? '#1f2937' : 'transparent', borderRadius: 8 }}>
                <Text style={{ color: 'white', fontWeight: '600' }}>{item.name}</Text>
                {!!item.description && <Text numberOfLines={1} style={{ color: '#9ca3af', fontSize: 12 }}>{item.description}</Text>}
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
