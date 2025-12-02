import React from 'react';
import { FlatList, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { chat, type Chat } from '../lib/chat';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme';

export default function MyWalk() {
  const { user } = useAuth();
  const nav = useNavigation<any>();
  const [items, setItems] = React.useState<Chat[]>([]);
  const [loading, setLoading] = React.useState(false);

  const load = React.useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const rows = await chat.getUserChats(user.id);
      setItems(rows.filter((c) => !!c.is_favorite));
    } finally {
      setLoading(false);
    }
  }, [user]);

  React.useEffect(() => { load(); }, [load]);

  async function toggleFavorite(c: Chat) {
    await chat.toggleFavorite(c.id, !c.is_favorite);
    await load();
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: theme.colors.accent }}>My Walk</Text>
        <Text style={{ color: theme.colors.muted }}>Favorites</Text>
      </View>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        onRefresh={load}
        refreshing={loading}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <View style={{ padding: 12, borderRadius: 10, backgroundColor: theme.colors.card, marginBottom: 8 }}>
            <TouchableOpacity onPress={() => nav.navigate('ChatDetail', { chatId: item.id })}>
              <Text style={{ fontWeight: '600', color: theme.colors.text }}>{item.title || 'Untitled Chat'}</Text>
              <Text style={{ color: theme.colors.muted, marginTop: 4 }}>{new Date(item.updated_at).toLocaleString()}</Text>
            </TouchableOpacity>
            <View style={{ marginTop: 8 }}>
              <TouchableOpacity onPress={() => toggleFavorite(item)} style={{ alignSelf: 'flex-start', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, backgroundColor: theme.colors.surface }}>
                <Text style={{ color: theme.colors.text }}>{item.is_favorite ? 'Unfavorite' : 'Favorite'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={!loading ? (
          <View style={{ alignItems: 'center', marginTop: 64 }}>
            <Text style={{ color: theme.colors.text }}>No favorites yet</Text>
          </View>
        ) : null}
      />
    </SafeAreaView>
  );
}
