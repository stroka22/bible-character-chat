import React from 'react';
import { SafeAreaView, Text, View, TouchableOpacity, Linking } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { getDailyMessageCount, getOwnerSlug, getTierSettings, isPremiumUser } from '../lib/tier';
import { theme } from '../theme';

export default function Profile() {
  const { user, signOut } = useAuth();
  const [email, setEmail] = React.useState<string>('');
  const [ownerSlug, setOwnerSlug] = React.useState<string>('default');
  const [premium, setPremium] = React.useState<boolean>(false);
  const [limit, setLimit] = React.useState<number>(0);
  const [count, setCount] = React.useState<number>(0);

  const load = React.useCallback(async () => {
    if (!user) return;
    setEmail(user.email || '');
    const slug = await getOwnerSlug(user.id);
    setOwnerSlug(slug);
    setPremium(await isPremiumUser(user.id));
    const s = await getTierSettings(slug); // network-first now
    setLimit(Number(s.freeMessageLimit || 0));
    const dc = await getDailyMessageCount(user.id);
    setCount(dc.count || 0);
  }, [user]);

  React.useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    React.useCallback(() => {
      load();
      return () => {};
    }, [load])
  );

  const progressPct = limit > 0 ? Math.min(100, Math.round((count / limit) * 100)) : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: 16 }}>
        <Text style={{ color: theme.colors.accent, fontSize: 22, fontWeight: '800', marginBottom: 12 }}>Profile</Text>
        <View style={{ backgroundColor: theme.colors.card, borderRadius: 10, padding: 12, marginBottom: 12 }}>
          <Text style={{ color: theme.colors.muted, marginBottom: 4 }}>Email</Text>
          <Text style={{ color: theme.colors.text, fontWeight: '600' }}>{email}</Text>
        </View>
        <View style={{ backgroundColor: theme.colors.card, borderRadius: 10, padding: 12, marginBottom: 12 }}>
          <Text style={{ color: theme.colors.muted, marginBottom: 4 }}>Organization</Text>
          <Text style={{ color: theme.colors.text, fontWeight: '600' }}>{ownerSlug}</Text>
        </View>
        <View style={{ backgroundColor: theme.colors.card, borderRadius: 10, padding: 12, marginBottom: 12 }}>
          <Text style={{ color: theme.colors.muted, marginBottom: 6 }}>Status</Text>
          <Text style={{ color: premium ? theme.colors.accent : theme.colors.text, fontWeight: '700' }}>{premium ? 'Premium' : 'Free'}</Text>
        </View>
        {!premium && (
          <View style={{ backgroundColor: theme.colors.card, borderRadius: 10, padding: 12, marginBottom: 12 }}>
            <Text style={{ color: theme.colors.muted, marginBottom: 6 }}>Daily messages</Text>
            <View style={{ height: 10, backgroundColor: theme.colors.surface, borderRadius: 6, overflow: 'hidden' }}>
              <View style={{ height: 10, width: `${progressPct}%`, backgroundColor: theme.colors.primary }} />
            </View>
            <Text style={{ color: theme.colors.text, marginTop: 6 }}>{count}/{limit} used today</Text>
          </View>
        )}
        {!premium && (
          <TouchableOpacity onPress={() => Linking.openURL('https://faithtalkai.com/pricing')} style={{ backgroundColor: theme.colors.primary, padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontWeight: '700', color: theme.colors.primaryText }}>Upgrade</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={signOut} style={{ backgroundColor: theme.colors.surface, padding: 14, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border }}>
          <Text style={{ fontWeight: '700', color: theme.colors.text }}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
