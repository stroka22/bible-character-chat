import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <View style={{ padding: 16 }}>
        <Text style={{ color: '#fde68a', fontSize: 22, fontWeight: '800', marginBottom: 8 }}>Bible Studies</Text>
        {loading ? (
          <ActivityIndicator color="#facc15" />
        ) : (
          <FlatList
            data={studies}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={async () => {
                // TODO: pull actual premium study IDs from tier settings; use gate helper
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
              }} style={{ paddingVertical: 12 }}>
                <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>{item.title}</Text>
                {!!item.owner_slug && <Text style={{ color: '#9ca3af', fontSize: 12 }}>Org: {item.owner_slug}</Text>}
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#1f2937' }} />}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
