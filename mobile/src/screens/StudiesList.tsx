import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { theme } from '../theme';

type Study = {
  id: string;
  title: string;
  owner_slug?: string | null;
  visibility?: string | null;
  cover_image_url?: string | null;
};

export default function StudiesList() {
  const navigation = useNavigation<any>();
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        ?.from('bible_studies')
        .select('id,title,owner_slug,visibility,cover_image_url')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false }) as any;
      setStudies(data || []);
      setLoading(false);
    })();
  }, []);

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
                      alert('Upgrade required to access this study. Visit faithtalkai.com/pricing to upgrade.');
                    }
                  });
                } catch {
                  navigation.navigate('StudyDetail', { studyId: item.id, title: item.title });
                }
              }} style={{ paddingVertical: 12, paddingHorizontal: 12, backgroundColor: theme.colors.card, borderRadius: 10, marginBottom: 8 }}>
                <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600' }}>{item.title}</Text>
                {!!item.owner_slug && <Text style={{ color: theme.colors.muted, fontSize: 12, marginTop: 4 }}>Org: {item.owner_slug}</Text>}
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
