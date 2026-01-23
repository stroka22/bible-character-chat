import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  FlatList,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '../theme';
import {
  AVAILABLE_TRANSLATIONS,
  BIBLE_BOOKS,
  getChapters,
  getChapterText,
  ChapterData,
} from '../lib/bible';

interface RouteParams {
  translation?: string;
  book?: string;
  chapter?: number;
}

export default function BibleReader() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = (route.params || {}) as RouteParams;

  const [translation, setTranslation] = useState(params.translation || 'KJV');
  const [book, setBook] = useState(params.book || 'Genesis');
  const [chapter, setChapter] = useState(params.chapter || 1);
  const [data, setData] = useState<ChapterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal states
  const [showTranslationPicker, setShowTranslationPicker] = useState(false);
  const [showBookPicker, setShowBookPicker] = useState(false);
  const [showChapterPicker, setShowChapterPicker] = useState(false);
  
  // For "Chat about this" feature
  const [selectedVerses, setSelectedVerses] = useState<Set<number>>(new Set());

  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadChapter();
  }, [translation, book, chapter]);

  const loadChapter = async () => {
    setLoading(true);
    setError('');
    setSelectedVerses(new Set());
    try {
      const result = await getChapterText(translation, book, chapter);
      setData(result);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    } catch (e: any) {
      setError(e.message || 'Failed to load chapter');
    } finally {
      setLoading(false);
    }
  };

  const toggleVerseSelection = (verseNum: number) => {
    setSelectedVerses(prev => {
      const next = new Set(prev);
      if (next.has(verseNum)) {
        next.delete(verseNum);
      } else {
        next.add(verseNum);
      }
      return next;
    });
  };

  const chatAboutSelection = () => {
    if (selectedVerses.size === 0 || !data) return;
    
    // Build the passage text
    const sortedVerses = Array.from(selectedVerses).sort((a, b) => a - b);
    const passageText = sortedVerses
      .map(v => `${v}. ${data.verses[v - 1]}`)
      .join('\n');
    
    // Build reference string
    let reference = `${book} ${chapter}:`;
    if (sortedVerses.length === 1) {
      reference += sortedVerses[0];
    } else {
      // Group consecutive verses
      const ranges: string[] = [];
      let start = sortedVerses[0];
      let end = sortedVerses[0];
      for (let i = 1; i < sortedVerses.length; i++) {
        if (sortedVerses[i] === end + 1) {
          end = sortedVerses[i];
        } else {
          ranges.push(start === end ? `${start}` : `${start}-${end}`);
          start = sortedVerses[i];
          end = sortedVerses[i];
        }
      }
      ranges.push(start === end ? `${start}` : `${start}-${end}`);
      reference += ranges.join(', ');
    }
    
    // Navigate to chat with context
    navigation.navigate('Chat', {
      screen: 'ChatNew',
      params: {
        initialMessage: `I'd like to discuss ${reference} (${translation}):\n\n${passageText}`,
        bibleContext: {
          reference,
          translation,
          text: passageText,
        },
      },
    });
  };

  const goToNextChapter = () => {
    const chapters = getChapters(book);
    if (chapter < chapters.length) {
      setChapter(chapter + 1);
    } else {
      // Go to next book
      const bookIndex = BIBLE_BOOKS.indexOf(book);
      if (bookIndex < BIBLE_BOOKS.length - 1) {
        setBook(BIBLE_BOOKS[bookIndex + 1]);
        setChapter(1);
      }
    }
  };

  const goToPrevChapter = () => {
    if (chapter > 1) {
      setChapter(chapter - 1);
    } else {
      // Go to previous book's last chapter
      const bookIndex = BIBLE_BOOKS.indexOf(book);
      if (bookIndex > 0) {
        const prevBook = BIBLE_BOOKS[bookIndex - 1];
        const prevChapters = getChapters(prevBook);
        setBook(prevBook);
        setChapter(prevChapters.length);
      }
    }
  };

  const translationInfo = AVAILABLE_TRANSLATIONS.find(t => t.code === translation);
  const isNIV = translation === 'NIV';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header Controls */}
      <View style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {/* Translation Picker */}
          <TouchableOpacity
            onPress={() => setShowTranslationPicker(true)}
            style={{
              backgroundColor: theme.colors.card,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <Text style={{ color: theme.colors.text, fontWeight: '600' }}>{translation}</Text>
          </TouchableOpacity>

          {/* Book Picker */}
          <TouchableOpacity
            onPress={() => setShowBookPicker(true)}
            style={{
              backgroundColor: theme.colors.card,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: theme.colors.border,
              flex: 1,
              minWidth: 120,
            }}
          >
            <Text style={{ color: theme.colors.text, fontWeight: '600' }} numberOfLines={1}>{book}</Text>
          </TouchableOpacity>

          {/* Chapter Picker */}
          <TouchableOpacity
            onPress={() => setShowChapterPicker(true)}
            style={{
              backgroundColor: theme.colors.card,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <Text style={{ color: theme.colors.text, fontWeight: '600' }}>Ch. {chapter}</Text>
          </TouchableOpacity>
        </View>

        {isNIV && (
          <Text style={{ color: theme.colors.muted, fontSize: 12, marginTop: 8 }}>
            NIV coming soon. Showing KJV.
          </Text>
        )}
      </View>

      {/* Content */}
      {error ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ color: theme.colors.error || '#ff6b6b', textAlign: 'center' }}>{error}</Text>
          <TouchableOpacity onPress={loadChapter} style={{ marginTop: 12 }}>
            <Text style={{ color: theme.colors.primary }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
          <Text style={{ color: theme.colors.muted, marginTop: 12 }}>Loading {book} {chapter}...</Text>
        </View>
      ) : (
        <ScrollView ref={scrollRef} style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
          <Text style={{ color: theme.colors.accent, fontSize: 22, fontWeight: '700', marginBottom: 16 }}>
            {book} {chapter}
          </Text>

          {data?.verses.map((verse, idx) => {
            const verseNum = idx + 1;
            const isSelected = selectedVerses.has(verseNum);
            return (
              <TouchableOpacity
                key={idx}
                onPress={() => toggleVerseSelection(verseNum)}
                style={{
                  flexDirection: 'row',
                  marginBottom: 12,
                  backgroundColor: isSelected ? theme.colors.primary + '20' : 'transparent',
                  padding: 8,
                  borderRadius: 8,
                  marginHorizontal: -8,
                }}
              >
                <Text style={{ color: theme.colors.muted, width: 32, fontSize: 14 }}>{verseNum}</Text>
                <Text style={{ color: theme.colors.text, flex: 1, fontSize: 16, lineHeight: 24 }}>
                  {verse}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* Navigation */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, paddingBottom: 40 }}>
            <TouchableOpacity onPress={goToPrevChapter} style={{ padding: 12 }}>
              <Text style={{ color: theme.colors.primary, fontSize: 16 }}>← Previous</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={goToNextChapter} style={{ padding: 12 }}>
              <Text style={{ color: theme.colors.primary, fontSize: 16 }}>Next →</Text>
            </TouchableOpacity>
          </View>

          <Text style={{ color: theme.colors.muted, fontSize: 12, textAlign: 'center', marginBottom: 20 }}>
            {translationInfo?.name || translation} (Public Domain)
          </Text>
        </ScrollView>
      )}

      {/* Floating Action Button for Chat */}
      {selectedVerses.size > 0 && (
        <View style={{
          position: 'absolute',
          bottom: 20,
          left: 16,
          right: 16,
        }}>
          <TouchableOpacity
            onPress={chatAboutSelection}
            style={{
              backgroundColor: theme.colors.primary,
              paddingVertical: 14,
              borderRadius: 12,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <Text style={{ color: theme.colors.primaryText, fontWeight: '700', fontSize: 16 }}>
              Chat About {selectedVerses.size} Verse{selectedVerses.size > 1 ? 's' : ''}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Translation Picker Modal */}
      <Modal visible={showTranslationPicker} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: theme.colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '60%' }}>
            <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '700' }}>Select Translation</Text>
              <TouchableOpacity onPress={() => setShowTranslationPicker(false)}>
                <Text style={{ color: theme.colors.primary, fontSize: 16 }}>Done</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={AVAILABLE_TRANSLATIONS}
              keyExtractor={item => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setTranslation(item.code);
                    setShowTranslationPicker(false);
                  }}
                  style={{
                    padding: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.border,
                    backgroundColor: item.code === translation ? theme.colors.primary + '20' : 'transparent',
                  }}
                >
                  <Text style={{ color: theme.colors.text, fontWeight: item.code === translation ? '700' : '400' }}>
                    {item.code} - {item.name}
                  </Text>
                  <Text style={{ color: theme.colors.muted, fontSize: 12 }}>{item.year}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Book Picker Modal */}
      <Modal visible={showBookPicker} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: theme.colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '70%' }}>
            <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '700' }}>Select Book</Text>
              <TouchableOpacity onPress={() => setShowBookPicker(false)}>
                <Text style={{ color: theme.colors.primary, fontSize: 16 }}>Done</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={BIBLE_BOOKS}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setBook(item);
                    setChapter(1);
                    setShowBookPicker(false);
                  }}
                  style={{
                    padding: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.colors.border,
                    backgroundColor: item === book ? theme.colors.primary + '20' : 'transparent',
                  }}
                >
                  <Text style={{ color: theme.colors.text, fontWeight: item === book ? '700' : '400' }}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Chapter Picker Modal */}
      <Modal visible={showChapterPicker} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: theme.colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '50%' }}>
            <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '700' }}>Select Chapter</Text>
              <TouchableOpacity onPress={() => setShowChapterPicker(false)}>
                <Text style={{ color: theme.colors.primary, fontSize: 16 }}>Done</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={getChapters(book)}
              keyExtractor={item => String(item)}
              numColumns={5}
              contentContainerStyle={{ padding: 16 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setChapter(item);
                    setShowChapterPicker(false);
                  }}
                  style={{
                    width: '20%',
                    aspectRatio: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: item === chapter ? theme.colors.primary : theme.colors.surface,
                    borderRadius: 8,
                    margin: 4,
                  }}
                >
                  <Text style={{ 
                    color: item === chapter ? theme.colors.primaryText : theme.colors.text,
                    fontWeight: item === chapter ? '700' : '400',
                    fontSize: 16,
                  }}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
