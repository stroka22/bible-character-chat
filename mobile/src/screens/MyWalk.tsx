import React from 'react';
import { FlatList, SafeAreaView, Text, TouchableOpacity, View, Image } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { chat, type Chat } from '../lib/chat';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme';
import { listFavoriteCharacters } from '../lib/favorites';

export default function MyWalk() {
  const { user } = useAuth();
  const nav = useNavigation<any>();
  const [items, setItems] = React.useState<Chat[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [favChars, setFavChars] = React.useState<any[]>([]);

  const load = React.useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const rows = await chat.getUserChats(user.id);
      setItems(rows.filter((c) => !!c.is_favorite));
      try {
        const chars = await listFavoriteCharacters(user.id);
        setFavChars(chars);
      } catch {}
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Refresh when screen comes into focus to reflect latest favorites immediately
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { useFocusEffect } = require('@react-navigation/native');
  useFocusEffect(React.useCallback(() => {
    load();
  }, [load]));

  async function toggleFavorite(c: Chat) {
    await chat.toggleFavorite(c.id, !c.is_favorite);
    await load();
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: theme.colors.accent }}>My Walk</Text>
        <Text style={{ color: theme.colors.muted, marginTop: 4 }}>Favorite Characters</Text>
      </View>
      <FlatList
        data={favChars}
        keyExtractor={(i) => String(i.id)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 0, paddingTop: 4 }}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => nav.navigate('Chat', { preselectedCharacterId: item.id })} style={{ width: 180, height: 52, paddingHorizontal: 10, borderRadius: 10, backgroundColor: theme.colors.card, marginHorizontal: 4, justifyContent: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Image source={{ uri: item.avatar_url || 'https://faithtalkai.com/downloads/logo-pack/favicons/favicon-180.png' }} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: theme.colors.surface }} />
              <Text style={{ color: theme.colors.text, fontWeight: '700' }} numberOfLines={1}>{item.name}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={!loading ? (
          <View style={{ paddingHorizontal: 16 }}>
            <Text style={{ color: theme.colors.muted }}>No favorite characters yet</Text>
          </View>
        ) : null}
      />
      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        <Text style={{ color: theme.colors.muted }}>Saved Chats</Text>
      </View>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        onRefresh={load}
        refreshing={loading}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <View style={{ padding: 12, borderRadius: 10, backgroundColor: theme.colors.card, marginBottom: 8 }}>
            <TouchableOpacity onPress={() => nav.navigate('Chat', { screen: 'ChatDetail', params: { chatId: item.id } })}>
              <Text style={{ fontWeight: '600', color: theme.colors.text }}>{item.title || 'Untitled Chat'}</Text>
              <Text style={{ color: theme.colors.muted, marginTop: 4 }}>{new Date(item.updated_at).toLocaleString()}</Text>
            </TouchableOpacity>
            <View style={{ marginTop: 8 }}>
              <TouchableOpacity onPress={() => toggleFavorite(item)} style={{ alignSelf: 'flex-start', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, backgroundColor: theme.colors.surface }}>
                <Text style={{ color: theme.colors.text }}>{item.is_favorite ? 'Unsave' : 'Save'}</Text>
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
