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
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 20, fontWeight: '700' }}>Chats</Text>
        <TouchableOpacity onPress={() => nav.navigate('ChatNew')} style={{ paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#111827', borderRadius: 8 }}>
          <Text style={{ color: 'white', fontWeight: '600' }}>New</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        refreshing={loading}
        onRefresh={load}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => nav.navigate('ChatDetail', { chatId: item.id })} style={{ padding: 12, borderRadius: 10, backgroundColor: '#f3f4f6', marginBottom: 10 }}>
            <Text style={{ fontWeight: '600' }}>{item.title || 'Untitled Chat'}</Text>
            <Text style={{ color: '#6b7280', marginTop: 4 }}>{new Date(item.updated_at).toLocaleString()}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={!loading ? (
          <View style={{ alignItems: 'center', marginTop: 64 }}>
            <Text>No chats yet</Text>
          </View>
        ) : null}
      />
    </SafeAreaView>
  );
}
