import React from 'react';
import { SafeAreaView, Text, TextInput, TouchableOpacity, View, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { chat } from '../lib/chat';
import { supabase } from '../lib/supabase';

export default function ChatNew() {
  const { user } = useAuth();
  const nav = useNavigation<any>();
  const [title, setTitle] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [characters, setCharacters] = React.useState<any[]>([]);

  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        let query = supabase.from('characters').select('*');
        if (search && search.trim()) {
          query = query.or(
            `name.ilike.%${search}%,description.ilike.%${search}%,bible_book.ilike.%${search}%`
          ) as any;
        }
        const { data } = await query.order('name');
        if (active) setCharacters(data || []);
      } catch {}
    })();
    return () => { active = false; };
  }, [search]);

  async function start(c: any) {
    if (!user) return;
    setLoading(true);
    try {
      const newChat = await chat.createChat(user.id, String(c.id), title.trim() || `Chat with ${c.name}`);
      nav.replace('ChatDetail', { chatId: newChat.id, character: c });
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>New Chat</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Title (optional)"
          style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 12, height: 44, marginBottom: 12 }}
        />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search characters…"
          style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 12, height: 44 }}
        />
      </View>
      <FlatList
        data={characters}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity disabled={loading} onPress={() => start(item)} style={{ padding: 12, borderRadius: 10, backgroundColor: '#f9fafb', marginBottom: 8 }}>
            <Text style={{ fontWeight: '600' }}>{item.name}</Text>
            {item.description ? <Text numberOfLines={2} style={{ color: '#6b7280', marginTop: 4 }}>{item.description}</Text> : null}
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
