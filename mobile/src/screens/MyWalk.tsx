import React from 'react';
import { FlatList, SafeAreaView, Text, TouchableOpacity, View, Image, ScrollView, Alert, TextInput, Modal } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { chat, type Chat } from '../lib/chat';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme';
import { listFavoriteCharacters, setFavoriteCharacter } from '../lib/favorites';
import { getUserStudiesWithProgress, deleteProgress, updateProgressLabel, saveStudyProgress, getProgressPercent, type StudyWithProgress } from '../lib/studyProgress';
import { supabase } from '../lib/supabase';

type TabType = 'chats' | 'roundtables' | 'studies';

const PAGE_SIZE = 25;

export default function MyWalk() {
  const { user } = useAuth();
  const nav = useNavigation<any>();
  const [allChats, setAllChats] = React.useState<Chat[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [hasMoreChats, setHasMoreChats] = React.useState(false);
  const [favChars, setFavChars] = React.useState<any[]>([]);
  const [activeTab, setActiveTab] = React.useState<TabType>('chats');
  const [userStudies, setUserStudies] = React.useState<StudyWithProgress[]>([]);
  const [studiesLoading, setStudiesLoading] = React.useState(false);
  
  // Add favorites modal state
  const [showAddFavorite, setShowAddFavorite] = React.useState(false);
  const [allCharacters, setAllCharacters] = React.useState<any[]>([]);
  const [loadingCharacters, setLoadingCharacters] = React.useState(false);

  // Separate chats by type (only show saved/favorited items, exclude study chats - those are shown in Studies tab)
  const regularChats = React.useMemo(() => 
    allChats.filter(c => c.is_favorite && !c.study_id && c.conversation_type !== 'roundtable'), 
    [allChats]
  );
  const roundtables = React.useMemo(() => 
    allChats.filter(c => c.is_favorite && c.conversation_type === 'roundtable'), 
    [allChats]
  );

  const load = React.useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { chats, hasMore } = await chat.getUserChats(user.id, { limit: PAGE_SIZE, offset: 0 });
      setAllChats(chats);
      setHasMoreChats(hasMore);
      try {
        const chars = await listFavoriteCharacters(user.id);
        setFavChars(chars);
      } catch {}
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadMoreChats = React.useCallback(async () => {
    if (!user || loadingMore || !hasMoreChats) return;
    setLoadingMore(true);
    try {
      const { chats, hasMore } = await chat.getUserChats(user.id, { limit: PAGE_SIZE, offset: allChats.length });
      setAllChats(prev => [...prev, ...chats]);
      setHasMoreChats(hasMore);
    } finally {
      setLoadingMore(false);
    }
  }, [user, loadingMore, hasMoreChats, allChats.length]);

  const loadStudies = React.useCallback(async () => {
    if (!user?.id) return;
    setStudiesLoading(true);
    try {
      const studies = await getUserStudiesWithProgress(user.id);
      setUserStudies(studies);
    } catch (err) {
      console.warn('[MyWalk] Error loading studies:', err);
    } finally {
      setStudiesLoading(false);
    }
  }, [user?.id]);

  // Refresh when screen comes into focus to reflect latest favorites immediately
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { useFocusEffect } = require('@react-navigation/native');
  useFocusEffect(React.useCallback(() => {
    load();
    loadStudies();
  }, [load, loadStudies]));

  async function toggleFavorite(c: Chat) {
    await chat.toggleFavorite(c.id, !c.is_favorite);
    await load();
  }

  // Load all characters for the add favorites modal
  const loadAllCharacters = React.useCallback(async () => {
    setLoadingCharacters(true);
    try {
      const { data } = await supabase
        .from('characters')
        .select('id, name, description, avatar_url')
        .or('is_visible.is.null,is_visible.eq.true')
        .order('name');
      setAllCharacters(data || []);
    } catch (e) {
      console.warn('[MyWalk] Error loading characters:', e);
    } finally {
      setLoadingCharacters(false);
    }
  }, []);

  const openAddFavoriteModal = async () => {
    setShowAddFavorite(true);
    await loadAllCharacters();
  };

  const addFavorite = async (character: any) => {
    if (!user?.id) return;
    try {
      await setFavoriteCharacter(user.id, character.id, true);
      setFavChars(prev => [...prev, character]);
      setShowAddFavorite(false);
    } catch (e) {
      Alert.alert('Error', 'Failed to add favorite');
    }
  };

  // Get participant count for display
  const getParticipantCount = (c: Chat) => {
    const participants = (c as any).participants;
    if (Array.isArray(participants) && participants.length > 0) {
      return participants.length + 1; // +1 for owner
    }
    return 0;
  };

  // Get items for current tab (chats/roundtables)
  const currentChatItems = activeTab === 'chats' ? regularChats : roundtables;

  // Handle chat deletion
  const handleDeleteChat = (c: Chat) => {
    Alert.alert(
      'Delete Conversation',
      `Delete "${c.title || 'Untitled'}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.from('chats').delete().eq('id', c.id);
              if (!error) {
                load();
              } else {
                Alert.alert('Error', 'Failed to delete conversation');
              }
            } catch {
              Alert.alert('Error', 'Failed to delete conversation');
            }
          }
        }
      ]
    );
  };

  // Handle chat rename
  const handleRenameChat = (c: Chat) => {
    Alert.prompt(
      'Rename Conversation',
      'Enter a new title:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: async (newTitle?: string) => {
            if (newTitle && newTitle.trim()) {
              await chat.updateTitle(c.id, newTitle.trim());
              load();
            }
          }
        }
      ],
      'plain-text',
      c.title || ''
    );
  };

  // Handle study deletion
  const handleDeleteStudy = (study: StudyWithProgress) => {
    Alert.alert(
      'Delete Study Progress',
      `Delete "${study.title}"${study.progress.label ? ` (${study.progress.label})` : ''}? This will remove your progress but not the study itself.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteProgress(study.progressId);
            if (success) {
              loadStudies();
            } else {
              Alert.alert('Error', 'Failed to delete study progress');
            }
          }
        }
      ]
    );
  };

  // Handle study label edit
  const handleEditStudyLabel = (study: StudyWithProgress) => {
    Alert.prompt(
      'Edit Label',
      `Label for "${study.title}":`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: async (newLabel?: string) => {
            if (newLabel !== undefined) {
              await updateProgressLabel(study.progressId, newLabel.trim());
              loadStudies();
            }
          }
        }
      ],
      'plain-text',
      study.progress.label || ''
    );
  };

  // Handle start study again
  const handleStartStudyAgain = (study: StudyWithProgress) => {
    Alert.prompt(
      'Start Again',
      `Starting "${study.title}" again.\n\nEnter a label (e.g., "with Sarah", "January 2025"):`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: async (label?: string) => {
            if (!user?.id) return;
            const newProgress = await saveStudyProgress({
              userId: user.id,
              studyId: study.id,
              currentLessonIndex: 0,
              completedLessons: [],
              label: label?.trim() || undefined,
              createNew: true
            });
            if (newProgress) {
              loadStudies();
              // Navigate to the study detail with new progress
              nav.navigate('StudyDetail', {
                studyId: study.id,
                title: study.title,
                progressId: newProgress.id
              });
            } else {
              Alert.alert('Error', 'Failed to start study');
            }
          }
        }
      ],
      'plain-text',
      ''
    );
  };

  // Get route for navigation based on type
  const getNavRoute = (item: Chat) => {
    if (item.conversation_type === 'roundtable') {
      return { screen: 'RoundtableChat', params: { conversationId: item.id } };
    }
    return { screen: 'Chat', params: { screen: 'ChatDetail', params: { chatId: item.id } } };
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: theme.colors.accent }}>My Walk</Text>
        <Text style={{ color: theme.colors.muted, marginTop: 4 }}>Favorite Characters <Text style={{ fontSize: 11 }}>(hold to remove)</Text></Text>
      </View>
      <FlatList
        data={favChars}
        keyExtractor={(i) => String(i.id)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 0, paddingTop: 4 }}
        renderItem={({ item }) => (
          <TouchableOpacity 
            onPress={async () => {
              // Start a new chat with this character
              try {
                // Fetch character's opening line
                const { data: charData } = await supabase
                  .from('characters')
                  .select('opening_sentence')
                  .eq('id', item.id)
                  .maybeSingle();
                
                const newChat = await chat.createChat(user!.id, item.id, `Chat with ${item.name}`);
                
                // Add opening line if available
                if (charData?.opening_sentence) {
                  try { await chat.addMessage(newChat.id, charData.opening_sentence, 'assistant'); } catch {}
                }
                
                nav.navigate('Chat', { screen: 'ChatDetail', params: { chatId: newChat.id, character: item } });
              } catch (e) {
                Alert.alert('Error', 'Failed to start chat');
              }
            }} 
            onLongPress={() => {
              Alert.alert(
                'Remove Favorite',
                `Remove ${item.name} from your favorites?`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Remove', 
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        await setFavoriteCharacter(user!.id, item.id, false);
                        setFavChars(prev => prev.filter(c => c.id !== item.id));
                      } catch (e) {
                        Alert.alert('Error', 'Failed to remove favorite');
                      }
                    }
                  }
                ]
              );
            }}
            style={{ width: 180, height: 52, paddingHorizontal: 10, borderRadius: 10, backgroundColor: theme.colors.card, marginHorizontal: 4, justifyContent: 'center' }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Image source={{ uri: item.avatar_url || 'https://faithtalkai.com/downloads/logo-pack/favicons/favicon-180.png' }} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: theme.colors.surface }} />
              <Text style={{ color: theme.colors.text, fontWeight: '700' }} numberOfLines={1}>{item.name}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListHeaderComponent={() => (
          <TouchableOpacity 
            onPress={openAddFavoriteModal}
            style={{ width: 52, height: 52, borderRadius: 10, backgroundColor: theme.colors.primary, marginHorizontal: 4, justifyContent: 'center', alignItems: 'center' }}
          >
            <Text style={{ color: theme.colors.primaryText, fontSize: 24, fontWeight: '700' }}>+</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={!loading ? (
          <View style={{ paddingHorizontal: 16 }}>
            <Text style={{ color: theme.colors.muted }}>Tap + to add favorites</Text>
          </View>
        ) : null}
      />

      {/* Add Favorite Modal */}
      <Modal visible={showAddFavorite} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: theme.colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%', paddingBottom: 40 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.text }}>Add Favorite Character</Text>
              <TouchableOpacity onPress={() => setShowAddFavorite(false)}>
                <Text style={{ color: theme.colors.primary, fontSize: 16 }}>Close</Text>
              </TouchableOpacity>
            </View>
            {loadingCharacters ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <Text style={{ color: theme.colors.muted }}>Loading characters...</Text>
              </View>
            ) : (
              <FlatList
                data={allCharacters.filter(c => !favChars.some(f => f.id === c.id))}
                keyExtractor={(i) => String(i.id)}
                contentContainerStyle={{ padding: 16 }}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    onPress={() => addFavorite(item)}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: theme.colors.card, borderRadius: 10, marginBottom: 8 }}
                  >
                    <Image source={{ uri: item.avatar_url || 'https://faithtalkai.com/downloads/logo-pack/favicons/favicon-180.png' }} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.surface }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: theme.colors.text, fontWeight: '600' }}>{item.name}</Text>
                      {item.description ? <Text numberOfLines={1} style={{ color: theme.colors.muted, fontSize: 12, marginTop: 2 }}>{item.description}</Text> : null}
                    </View>
                    <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>Add</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={{ padding: 20, alignItems: 'center' }}>
                    <Text style={{ color: theme.colors.muted }}>All characters are already favorites!</Text>
                  </View>
                }
              />
            )}
          </View>
        </View>
      </Modal>
      
      {/* Tab selector */}
      <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: theme.colors.surface, marginTop: 16 }}>
        <TouchableOpacity 
          onPress={() => setActiveTab('chats')}
          style={{ flex: 1, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: activeTab === 'chats' ? theme.colors.accent : 'transparent' }}
        >
          <Text numberOfLines={1} style={{ textAlign: 'center', color: activeTab === 'chats' ? theme.colors.accent : theme.colors.muted, fontWeight: '600', fontSize: 13 }}>
            Chats ({regularChats.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setActiveTab('roundtables')}
          style={{ flex: 1, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: activeTab === 'roundtables' ? theme.colors.accent : 'transparent' }}
        >
          <Text numberOfLines={1} style={{ textAlign: 'center', color: activeTab === 'roundtables' ? theme.colors.accent : theme.colors.muted, fontWeight: '600', fontSize: 13 }}>
            Roundtables ({roundtables.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setActiveTab('studies')}
          style={{ flex: 1, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: activeTab === 'studies' ? theme.colors.accent : 'transparent' }}
        >
          <Text numberOfLines={1} style={{ textAlign: 'center', color: activeTab === 'studies' ? theme.colors.accent : theme.colors.muted, fontWeight: '600', fontSize: 13 }}>
            Studies ({userStudies.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bible Studies Tab */}
      {activeTab === 'studies' && (
        <FlatList
          data={userStudies}
          keyExtractor={(i) => i.progressId}
          onRefresh={loadStudies}
          refreshing={studiesLoading}
          contentContainerStyle={{ padding: 12 }}
          renderItem={({ item: study }) => {
            const completedCount = Array.isArray(study.progress.completed_lessons) 
              ? study.progress.completed_lessons.length 
              : 0;
            const totalLessons = study.lesson_count || 0;
            const progressPercent = getProgressPercent(study.progress.completed_lessons || [], totalLessons);
            
            return (
              <View style={{ padding: 12, borderRadius: 10, backgroundColor: theme.colors.card, marginBottom: 8 }}>
                <TouchableOpacity 
                  onPress={() => nav.navigate('StudyDetail', { 
                    studyId: study.id, 
                    title: study.title,
                    progressId: study.progressId 
                  })}
                >
                  <Text style={{ fontWeight: '700', color: theme.colors.text, fontSize: 16 }}>
                    {study.title}
                  </Text>
                  {study.progress.label && (
                    <Text style={{ color: theme.colors.accent, fontSize: 12, marginTop: 2 }}>
                      {study.progress.label}
                    </Text>
                  )}
                  
                  {/* Progress bar */}
                  <View style={{ marginTop: 8 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ color: theme.colors.muted, fontSize: 12 }}>
                        {completedCount} of {totalLessons} lessons
                      </Text>
                      <Text style={{ 
                        color: progressPercent === 100 ? '#22c55e' : theme.colors.primary, 
                        fontSize: 12, 
                        fontWeight: '700' 
                      }}>
                        {progressPercent}%
                      </Text>
                    </View>
                    <View style={{ height: 4, backgroundColor: theme.colors.surface, borderRadius: 2, overflow: 'hidden' }}>
                      <View style={{ 
                        height: '100%', 
                        width: `${progressPercent}%`, 
                        backgroundColor: progressPercent === 100 ? '#22c55e' : theme.colors.primary,
                        borderRadius: 2 
                      }} />
                    </View>
                  </View>
                  
                  <Text style={{ color: theme.colors.muted, fontSize: 11, marginTop: 6 }}>
                    Last activity: {new Date(study.progress.last_activity_at).toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                  <TouchableOpacity 
                    onPress={() => nav.navigate('StudyDetail', { 
                      studyId: study.id, 
                      title: study.title,
                      progressId: study.progressId 
                    })}
                    style={{ paddingVertical: 6, paddingHorizontal: 12, backgroundColor: theme.colors.primary, borderRadius: 6 }}
                  >
                    <Text style={{ color: theme.colors.primaryText, fontWeight: '600', fontSize: 13 }}>
                      Continue →
                    </Text>
                  </TouchableOpacity>
                  
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <TouchableOpacity 
                      onPress={() => handleEditStudyLabel(study)}
                      style={{ paddingVertical: 6, paddingHorizontal: 8, backgroundColor: theme.colors.surface, borderRadius: 6 }}
                    >
                      <Text style={{ color: theme.colors.text, fontSize: 12 }}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => handleStartStudyAgain(study)}
                      style={{ paddingVertical: 6, paddingHorizontal: 8, backgroundColor: theme.colors.surface, borderRadius: 6 }}
                    >
                      <Text style={{ color: '#22c55e', fontSize: 12 }}>🔄</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => handleDeleteStudy(study)}
                      style={{ paddingVertical: 6, paddingHorizontal: 8, backgroundColor: theme.colors.surface, borderRadius: 6 }}
                    >
                      <Text style={{ color: '#ef4444', fontSize: 12 }}>🗑</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={!studiesLoading ? (
            <View style={{ alignItems: 'center', marginTop: 64 }}>
              <Text style={{ color: theme.colors.text, marginBottom: 8 }}>No Bible studies in progress</Text>
              <TouchableOpacity 
                onPress={() => nav.navigate('Studies')}
                style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: theme.colors.primary, borderRadius: 8 }}
              >
                <Text style={{ color: theme.colors.primaryText, fontWeight: '600' }}>Browse Studies</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        />
      )}

      {/* Chats and Roundtables Tabs */}
      {activeTab !== 'studies' && (
        <FlatList
          data={currentChatItems}
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
                <View style={{ marginTop: 8, flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                  <TouchableOpacity onPress={() => toggleFavorite(item)} style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, backgroundColor: theme.colors.surface }}>
                    <Text style={{ color: item.is_favorite ? theme.colors.accent : theme.colors.text, fontSize: 12 }}>
                      {item.is_favorite ? '★ Saved' : '☆ Save'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleRenameChat(item)} style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, backgroundColor: theme.colors.surface }}>
                    <Text style={{ color: theme.colors.text, fontSize: 12 }}>✏️ Rename</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteChat(item)} style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, backgroundColor: theme.colors.surface }}>
                    <Text style={{ color: '#ef4444', fontSize: 12 }}>🗑 Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={!loading ? (
            <View style={{ alignItems: 'center', marginTop: 64 }}>
              <Text style={{ color: theme.colors.text, marginBottom: 8 }}>
                {activeTab === 'chats' ? 'No chats yet' : 'No roundtables yet'}
              </Text>
              <TouchableOpacity 
                onPress={() => {
                  if (activeTab === 'chats') {
                    nav.navigate('Chat', { screen: 'ChatNew' });
                  } else {
                    nav.navigate('RoundtableSetup');
                  }
                }}
                style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: theme.colors.primary, borderRadius: 8 }}
              >
                <Text style={{ color: theme.colors.primaryText, fontWeight: '600' }}>
                  {activeTab === 'chats' ? 'Start a Chat' : 'Start a Roundtable'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
          ListFooterComponent={hasMoreChats ? (
            <TouchableOpacity 
              onPress={loadMoreChats}
              disabled={loadingMore}
              style={{ 
                paddingVertical: 12, 
                alignItems: 'center', 
                marginTop: 8,
                backgroundColor: theme.colors.surface,
                borderRadius: 8
              }}
            >
              <Text style={{ color: theme.colors.primary, fontWeight: '600' }}>
                {loadingMore ? 'Loading...' : 'Load More'}
              </Text>
            </TouchableOpacity>
          ) : null}
        />
      )}
    </SafeAreaView>
  );
}
