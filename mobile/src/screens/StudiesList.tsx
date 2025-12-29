import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getStudyProgress, getProgressPercent, StudyProgress } from '../lib/studyProgress';
import { getOwnerSlug } from '../lib/tier';
import { theme } from '../theme';

type Study = {
  id: string;
  title: string;
  owner_slug?: string | null;
  visibility?: string | null;
  cover_image_url?: string | null;
  lessonCount?: number;
};

type StudyWithProgress = Study & {
  progress?: StudyProgress | null;
  progressPercent: number;
};

export default function StudiesList() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [studies, setStudies] = useState<StudyWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStudies = async () => {
    setLoading(true);
    try {
      // Get user's organization
      const userSlug = user?.id ? await getOwnerSlug(user.id) : 'default';
      console.log('[StudiesList] Loading studies for owner_slug:', userSlug);
      
      // Fetch studies for user's organization (or default)
      const { data: studiesData } = await supabase
        ?.from('bible_studies')
        .select('id,title,owner_slug,visibility,cover_image_url')
        .eq('visibility', 'public')
        .or(`owner_slug.eq.${userSlug},owner_slug.is.null`)
        .order('created_at', { ascending: false }) as any;
      const rows: Study[] = studiesData || [];
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: 16 }}>
        <Text style={{ color: theme.colors.accent, fontSize: 22, fontWeight: '800', marginBottom: 8 }}>Bible Studies</Text>
        {loading ? (
          <ActivityIndicator color={theme.colors.primary} />
        ) : (
          <FlatList
            data={studies}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 8 }}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={async () => {
                try {
                  const { requirePremiumOrPrompt } = await import('../lib/tier');
                  await requirePremiumOrPrompt({
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
              }} style={{ paddingVertical: 12, paddingHorizontal: 12, backgroundColor: theme.colors.card, borderRadius: 10, marginBottom: 8 }}>
                <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600' }}>{item.title}</Text>
                {!!item.lessonCount && item.lessonCount > 0 && (
                  <View style={{ marginTop: 8 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ color: theme.colors.muted, fontSize: 12 }}>
                        {item.lessonCount} lesson{item.lessonCount !== 1 ? 's' : ''}
                      </Text>
                      {user && (
                        <Text style={{ color: item.progressPercent === 100 ? theme.colors.primary : theme.colors.muted, fontSize: 12, fontWeight: '600' }}>
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
