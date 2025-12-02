import React from 'react';
import { FlatList, ListRenderItem, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { chat, type Chat } from '../lib/chat';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../theme';

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

  // Stable callbacks to avoid re-renders
  const openChat = React.useCallback((id: string) => {
    nav.navigate('ChatDetail', { chatId: id });
  }, [nav]);

  const toggleFavorite = React.useCallback(async (id: string, next: boolean) => {
    await chat.toggleFavorite(id, next);
    await load();
  }, [load]);

  const keyExtractor = React.useCallback((i: Chat) => i.id, []);

  // Memoized row component
  const ChatRow = React.useMemo(() => React.memo(({ item }: { item: Chat }) => {
    const updated = React.useMemo(() => new Date(item.updated_at).toLocaleString(), [item.updated_at]);
    return (
      <View style={{ padding: 12, borderRadius: 10, backgroundColor: theme.colors.card, marginBottom: 10 }}>
        <TouchableOpacity onPress={() => openChat(item.id)}>
          <Text style={{ fontWeight: '600', color: theme.colors.text }}>{item.title || 'Untitled Chat'}</Text>
          <Text style={{ color: theme.colors.muted, marginTop: 4 }}>{updated}</Text>
        </TouchableOpacity>
        <View style={{ marginTop: 8 }}>
          <TouchableOpacity
            onPress={async () => { await toggleFavorite(item.id, !item.is_favorite); }}
            style={{ alignSelf: 'flex-start', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, backgroundColor: theme.colors.surface }}
          >
            <Text style={{ color: theme.colors.text }}>{item.is_favorite ? 'Unfavorite' : 'Favorite'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }), [openChat, toggleFavorite]);

  const renderItem: ListRenderItem<Chat> = React.useCallback(({ item }) => (
    // @ts-ignore - memoized component typed above
    <ChatRow item={item} />
  ), [ChatRow]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: theme.colors.accent }}>Chats</Text>
        <TouchableOpacity onPress={() => nav.navigate('ChatNew')} style={{ minHeight: 44, paddingVertical: 10, paddingHorizontal: 14, backgroundColor: theme.colors.primary, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: theme.colors.primaryText, fontWeight: '800', fontSize: 16 }}>New</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={items}
        keyExtractor={keyExtractor}
        refreshing={loading}
        onRefresh={load}
        contentContainerStyle={{ padding: 12 }}
        renderItem={renderItem}
        initialNumToRender={10}
        windowSize={7}
        maxToRenderPerBatch={10}
        removeClippedSubviews
        ListEmptyComponent={!loading ? (
          <View style={{ alignItems: 'center', marginTop: 64 }}>
            <Text style={{ color: theme.colors.text }}>No chats yet</Text>
          </View>
        ) : null}
      />
    </SafeAreaView>
  );
}
