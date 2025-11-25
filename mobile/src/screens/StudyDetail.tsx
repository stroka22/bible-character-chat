import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, Text, View } from 'react-native';
import { supabase } from '../lib/supabase';

type Lesson = {
  id: string;
  title: string;
  order_index: number;
  summary?: string | null;
};

export default function StudyDetail({ route }: any) {
  const { studyId, title } = route.params as { studyId: string; title: string };
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        ?.from('bible_study_lessons')
        .select('id,title,order_index,summary')
        .eq('study_id', studyId)
        .order('order_index', { ascending: true }) as any;
      setLessons(data || []);
      setLoading(false);
    })();
  }, [studyId]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <View style={{ padding: 16 }}>
        <Text style={{ color: '#fde68a', fontSize: 22, fontWeight: '800', marginBottom: 8 }}>{title}</Text>
        {loading ? (
          <ActivityIndicator color="#facc15" />
        ) : (
          <FlatList
            data={lessons}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={{ paddingVertical: 10 }}>
                <Text style={{ color: 'white', fontWeight: '700' }}>Lesson {item.order_index + 1}: {item.title}</Text>
                {!!item.summary && (
                  <Text style={{ color: '#e5e7eb' }}>{item.summary}</Text>
                )}
              </View>
            )}
            ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#1f2937' }} />}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
