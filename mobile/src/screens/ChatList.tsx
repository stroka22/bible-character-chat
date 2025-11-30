import React from 'react';
import { FlatList, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { chat, type Chat } from '../lib/chat';
import { useAuth } from '../contexts/AuthContext';

export default function ChatList() {
  const { user } = useAuth();
  const nav = useNavigation<any>();
  const [items, setItems] = React.useState<Chat[]>([]);
  const [loading, setLoading] = React.useState(false);
  const load = React.useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const rows = await chat.getUserChats(user.id);
      setItems(rows);
    } finally {
      setLoading(false);
    }
  }, [user]);
  useFocusEffect(React.useCallback(() => { load(); }, [load]));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <View style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: '#e5e7eb' }}>Chats</Text>
        <TouchableOpacity onPress={() => nav.navigate('ChatNew')} style={{ paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#facc15', borderRadius: 8 }}>
          <Text style={{ color: '#111827', fontWeight: '600' }}>New</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        refreshing={loading}
        onRefresh={load}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <View style={{ padding: 12, borderRadius: 10, backgroundColor: '#0b1220', marginBottom: 10, borderWidth: 1, borderColor: '#1f2937' }}>
            <TouchableOpacity onPress={() => nav.navigate('ChatDetail', { chatId: item.id })}>
              <Text style={{ fontWeight: '600', color: '#e5e7eb' }}>{item.title || 'Untitled Chat'}</Text>
              <Text style={{ color: '#9ca3af', marginTop: 4 }}>{new Date(item.updated_at).toLocaleString()}</Text>
            </TouchableOpacity>
            <View style={{ marginTop: 8 }}>
              <TouchableOpacity onPress={async () => { await chat.toggleFavorite(item.id, !item.is_favorite); await load(); }} style={{ alignSelf: 'flex-start', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, backgroundColor: '#111827' }}>
                <Text style={{ color: 'white' }}>{item.is_favorite ? 'Unfavorite' : 'Favorite'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={!loading ? (
          <View style={{ alignItems: 'center', marginTop: 64 }}>
            <Text style={{ color: '#9ca3af' }}>No chats yet</Text>
          </View>
        ) : null}
      />
    </SafeAreaView>
  );
}
