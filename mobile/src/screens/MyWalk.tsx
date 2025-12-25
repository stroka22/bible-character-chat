import React from 'react';
import { FlatList, SafeAreaView, Text, TouchableOpacity, View, Image, ScrollView } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { chat, type Chat } from '../lib/chat';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme';
import { listFavoriteCharacters } from '../lib/favorites';

type TabType = 'chats' | 'roundtables' | 'studies';

export default function MyWalk() {
  const { user } = useAuth();
  const nav = useNavigation<any>();
  const [allChats, setAllChats] = React.useState<Chat[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [favChars, setFavChars] = React.useState<any[]>([]);
  const [activeTab, setActiveTab] = React.useState<TabType>('chats');

  // Separate chats by type
  const regularChats = React.useMemo(() => 
    allChats.filter(c => !(c as any).study_id && (c as any).conversation_type !== 'roundtable'), 
    [allChats]
  );
  const roundtables = React.useMemo(() => 
    allChats.filter(c => (c as any).conversation_type === 'roundtable'), 
    [allChats]
  );
  const bibleStudies = React.useMemo(() => 
    allChats.filter(c => !!(c as any).study_id), 
    [allChats]
  );

  const load = React.useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const rows = await chat.getUserChats(user.id);
      setAllChats(rows);
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

  // Get participant count for display
  const getParticipantCount = (c: Chat) => {
    const participants = (c as any).participants;
    if (Array.isArray(participants) && participants.length > 0) {
      return participants.length + 1; // +1 for owner
    }
    return 0;
  };

  // Get items for current tab
  const currentItems = activeTab === 'chats' ? regularChats 
    : activeTab === 'roundtables' ? roundtables 
    : bibleStudies;

  // Get route for navigation based on type
  const getNavRoute = (item: Chat) => {
    if ((item as any).conversation_type === 'roundtable') {
      return { screen: 'RoundtableChat', params: { conversationId: item.id } };
    }
    return { screen: 'Chat', params: { screen: 'ChatDetail', params: { chatId: item.id } } };
  };

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
      
      {/* Tab selector */}
      <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: theme.colors.surface, marginTop: 16 }}>
        <TouchableOpacity 
          onPress={() => setActiveTab('chats')}
          style={{ flex: 1, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: activeTab === 'chats' ? theme.colors.accent : 'transparent' }}
        >
          <Text style={{ textAlign: 'center', color: activeTab === 'chats' ? theme.colors.accent : theme.colors.muted, fontWeight: '600' }}>
            Chats ({regularChats.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setActiveTab('roundtables')}
          style={{ flex: 1, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: activeTab === 'roundtables' ? theme.colors.accent : 'transparent' }}
        >
          <Text style={{ textAlign: 'center', color: activeTab === 'roundtables' ? theme.colors.accent : theme.colors.muted, fontWeight: '600' }}>
            Roundtables ({roundtables.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setActiveTab('studies')}
          style={{ flex: 1, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: activeTab === 'studies' ? theme.colors.accent : 'transparent' }}
        >
          <Text style={{ textAlign: 'center', color: activeTab === 'studies' ? theme.colors.accent : theme.colors.muted, fontWeight: '600' }}>
            Studies ({bibleStudies.length})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={currentItems}
        keyExtractor={(i) => i.id}
        onRefresh={load}
        refreshing={loading}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => {
          const participantCount = getParticipantCount(item);
          const navRoute = getNavRoute(item);
          return (
            <View style={{ padding: 12, borderRadius: 10, backgroundColor: theme.colors.card, marginBottom: 8 }}>
              <TouchableOpacity onPress={() => nav.navigate(navRoute.screen, navRoute.params)}>
                <Text style={{ fontWeight: '600', color: theme.colors.text }}>{item.title || 'Untitled'}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 12 }}>
                  {participantCount > 0 && (
                    <Text style={{ color: theme.colors.muted, fontSize: 12 }}>👥 {participantCount}</Text>
                  )}
                  <Text style={{ color: theme.colors.muted, fontSize: 12 }}>{new Date(item.updated_at).toLocaleString()}</Text>
                </View>
              </TouchableOpacity>
              <View style={{ marginTop: 8, flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity onPress={() => toggleFavorite(item)} style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, backgroundColor: theme.colors.surface }}>
                  <Text style={{ color: item.is_favorite ? theme.colors.accent : theme.colors.text, fontSize: 12 }}>
                    {item.is_favorite ? '★ Saved' : '☆ Save'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={!loading ? (
          <View style={{ alignItems: 'center', marginTop: 64 }}>
            <Text style={{ color: theme.colors.text }}>
              {activeTab === 'chats' ? 'No chats yet' : activeTab === 'roundtables' ? 'No roundtables yet' : 'No Bible studies yet'}
            </Text>
          </View>
        ) : null}
      />
    </SafeAreaView>
  );
}
