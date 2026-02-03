import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, Text, TouchableOpacity, View, Image, ScrollView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getStudyProgress, getProgressPercent, StudyProgress } from '../lib/studyProgress';
import { getOwnerSlug } from '../lib/tier';
import { theme } from '../theme';

type Study = {
  id: string;
  title: string;
  description?: string | null;
  owner_slug?: string | null;
  visibility?: string | null;
  cover_image_url?: string | null;
  lessonCount?: number;
  character_id?: string | null;
  character?: { id: string; name: string; avatar_url?: string | null } | null;
  category?: string | null;
};

const CATEGORIES = [
  { key: 'all', label: 'All Studies' },
  { key: 'active', label: 'My Active' },
  { key: 'book', label: 'Book Studies' },
  { key: 'topical', label: 'Topical' },
  { key: 'character', label: 'Character' },
  { key: 'life', label: 'Life & Growth' },
];

type StudyWithProgress = Study & {
  progress?: StudyProgress | null;
  progressPercent: number;
};

export default function StudiesList() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [studies, setStudies] = useState<StudyWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const loadStudies = async () => {
    setLoading(true);
    try {
      // Get user's organization
      const userSlug = user?.id ? await getOwnerSlug(user.id) : 'default';
      console.log('[StudiesList] Loading studies for owner_slug:', userSlug);
      
      // Fetch studies for user's organization (or default)
      const { data: studiesData } = await supabase
        ?.from('bible_studies')
        .select('id,title,description,owner_slug,visibility,cover_image_url,character_id,category')
        .eq('visibility', 'public')
        .or(`owner_slug.eq.${userSlug},owner_slug.is.null`)
        .order('created_at', { ascending: false }) as any;
      const rows: Study[] = studiesData || [];
      
      // Fetch character info for studies that have character_id
      const charIds = [...new Set(rows.filter(s => s.character_id).map(s => s.character_id))];
      let charMap: Record<string, { id: string; name: string; avatar_url?: string | null }> = {};
      if (charIds.length > 0) {
        const { data: chars } = await supabase
          .from('characters')
          .select('id,name,avatar_url')
          .in('id', charIds);
        if (chars) {
          chars.forEach((c: any) => { charMap[c.id] = c; });
        }
      }
      
      // Attach character info to studies
      rows.forEach(s => {
        if (s.character_id && charMap[s.character_id]) {
          s.character = charMap[s.character_id];
        }
      });
      console.log('[StudiesList] Found', rows.length, 'studies');
      
      // Deduplicate by normalized title (prefer user's org over null)
      const seen = new Map<string, Study>();
      for (const s of rows) {
        const key = (s.title || '').trim().toLowerCase();
        if (!key) continue;
        const existing = seen.get(key);
        // Prefer the one matching user's org
        if (!existing || (s.owner_slug === userSlug && existing.owner_slug !== userSlug)) {
          seen.set(key, s);
        }
      }
      const unique: Study[] = Array.from(seen.values());
      
      // Fetch lesson counts for each study
      const studyIds = unique.map(s => s.id);
      const { data: lessonCounts } = await supabase
        .from('bible_study_lessons')
        .select('study_id')
        .in('study_id', studyIds) as any;
      
      const countMap: Record<string, number> = {};
      for (const lc of (lessonCounts || [])) {
        countMap[lc.study_id] = (countMap[lc.study_id] || 0) + 1;
      }
      
      // Fetch progress for each study if user is logged in
      const withProgress: StudyWithProgress[] = await Promise.all(
        unique.map(async (study) => {
          const lessonCount = countMap[study.id] || 0;
          let progress: StudyProgress | null = null;
          if (user?.id) {
            progress = await getStudyProgress(user.id, study.id);
          }
          const progressPercent = getProgressPercent(
            progress?.completed_lessons || [],
            lessonCount
          );
          return { ...study, lessonCount, progress, progressPercent };
        })
      );
      
      setStudies(withProgress);
    } catch (e) {
      console.warn('[StudiesList] loadStudies error:', e);
    } finally {
      setLoading(false);
    }
  };

  // Reload on focus to get updated progress
  useFocusEffect(
    React.useCallback(() => {
      loadStudies();
    }, [user?.id])
  );

  // Filter studies based on category
  const filteredStudies = studies.filter(s => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'active') return s.progress && s.progressPercent > 0 && s.progressPercent < 100;
    if (selectedCategory === 'book') return s.category?.toLowerCase().includes('book');
    if (selectedCategory === 'topical') return s.category?.toLowerCase().includes('topical');
    if (selectedCategory === 'character') return s.category?.toLowerCase().includes('character');
    if (selectedCategory === 'life') return s.category?.toLowerCase().includes('life') || s.category?.toLowerCase().includes('growth');
    return true;
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: 16, flex: 1 }}>
        <Text style={{ color: theme.colors.accent, fontSize: 22, fontWeight: '800', marginBottom: 8, fontFamily: 'Cinzel_700Bold' }}>Bible Studies</Text>
        <Text style={{ color: theme.colors.muted, marginBottom: 12 }}>{studies.length} studies to deepen your faith</Text>
        
        {/* Category Filters */}
        <View style={{ height: 40, marginBottom: 12, marginHorizontal: -16 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, alignItems: 'center' }}>
            {CATEGORIES.map(cat => {
              const isActive = selectedCategory === cat.key;
              return (
                <TouchableOpacity
                  key={cat.key}
                  onPress={() => setSelectedCategory(cat.key)}
                  style={{
                    height: 32,
                    paddingHorizontal: 14,
                    justifyContent: 'center',
                    borderRadius: 16,
                    backgroundColor: isActive ? theme.colors.primary : theme.colors.card,
                    borderWidth: isActive ? 0 : 1,
                    borderColor: theme.colors.border,
                  }}
                >
                  <Text style={{ color: isActive ? theme.colors.primaryText : theme.colors.text, fontWeight: '600', fontSize: 13 }}>{cat.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
        
        {loading ? (
          <ActivityIndicator color={theme.colors.primary} />
        ) : (
          <FlatList
            data={filteredStudies}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 8 }}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={async () => {
                try {
                  const { requirePremiumOrPrompt } = await import('../lib/tier');
                  await requirePremiumOrPrompt({
                    userId: user?.id,
                    feature: 'premiumStudy',
                    studyId: item.id,
                    onAllowed: () => navigation.navigate('StudyDetail', { studyId: item.id, title: item.title }),
                    onUpgrade: () => {
                      (navigation as any).navigate('Paywall');
                    }
                  });
                } catch {
                  navigation.navigate('StudyDetail', { studyId: item.id, title: item.title });
                }
              }} style={{ paddingVertical: 12, paddingHorizontal: 12, backgroundColor: theme.colors.card, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: theme.colors.border }}>
                <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
                  {/* Avatar */}
                  {item.character?.avatar_url ? (
                    <Image source={{ uri: item.character.avatar_url }} style={{ width: 48, height: 48, borderRadius: 24 }} />
                  ) : (
                    <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: theme.colors.primaryText, fontWeight: '700', fontSize: 18 }}>{item.title?.[0] || '?'}</Text>
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600' }}>{item.title}</Text>
                    {item.character?.name && (
                      <Text style={{ color: theme.colors.muted, fontSize: 12, marginTop: 2 }}>Guide: {item.character.name}</Text>
                    )}
                    {item.description && (
                      <Text numberOfLines={3} style={{ color: theme.colors.muted, fontSize: 13, marginTop: 4, lineHeight: 18 }}>{item.description}</Text>
                    )}
                  </View>
                </View>
                {!!item.lessonCount && item.lessonCount > 0 && (
                  <View style={{ marginTop: 10 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ color: theme.colors.muted, fontSize: 12 }}>
                        {item.lessonCount} lesson{item.lessonCount !== 1 ? 's' : ''}
                      </Text>
                      {user && (
                        <Text style={{ color: item.progressPercent === 100 ? '#22c55e' : theme.colors.muted, fontSize: 12, fontWeight: '600' }}>
                          {item.progressPercent}% complete
                        </Text>
                      )}
                    </View>
                    {user && (
                      <View style={{ height: 4, backgroundColor: theme.colors.surface, borderRadius: 2, overflow: 'hidden' }}>
                        <View style={{ 
                          height: '100%', 
                          width: `${item.progressPercent}%`, 
                          backgroundColor: item.progressPercent === 100 ? '#22c55e' : theme.colors.primary,
                          borderRadius: 2 
                        }} />
                      </View>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
