import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { SafeAreaView, Text, View, TouchableOpacity, Linking, Platform, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { getDailyMessageCount, getOwnerSlug, getTierSettings, isPremiumUser } from '../lib/tier';
import { theme } from '../theme';

export default function Profile() {
  const navigation = useNavigation<any>();
  const { user, signOut } = useAuth();
  const [email, setEmail] = React.useState<string>('');
  const [ownerSlug, setOwnerSlug] = React.useState<string>('default');
  const [premium, setPremium] = React.useState<boolean>(false);
  const [limit, setLimit] = React.useState<number>(0);
  const [count, setCount] = React.useState<number>(0);
  const [deleting, setDeleting] = React.useState<boolean>(false);

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

  const isIOSPremium = premium || Platform.OS === 'ios';
  const progressPct = limit > 0 ? Math.min(100, Math.round((count / limit) * 100)) : 0;

  // If not logged in, show login prompt
  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <View style={{ padding: 16, flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: theme.colors.accent, fontSize: 22, fontWeight: '800', marginBottom: 12, fontFamily: 'Cinzel_700Bold' }}>Profile</Text>
          <Text style={{ color: theme.colors.text, textAlign: 'center', marginBottom: 20 }}>
            Sign in to save your conversations, track your progress, and access your profile.
          </Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Login')}
            style={{ backgroundColor: theme.colors.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 10, marginBottom: 12 }}
          >
            <Text style={{ color: theme.colors.primaryText, fontWeight: '700', fontSize: 16 }}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => navigation.navigate('SignUp')}
            style={{ backgroundColor: theme.colors.card, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border }}
          >
            <Text style={{ color: theme.colors.text, fontWeight: '600', fontSize: 16 }}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: 16 }}>
        <Text style={{ color: theme.colors.accent, fontSize: 22, fontWeight: '800', marginBottom: 12, fontFamily: 'Cinzel_700Bold' }}>Profile</Text>
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
          <Text style={{ color: isIOSPremium ? theme.colors.accent : theme.colors.text, fontWeight: '700' }}>{isIOSPremium ? 'Premium' : 'Free'}</Text>
        </View>
        {!isIOSPremium && (
          <View style={{ backgroundColor: theme.colors.card, borderRadius: 10, padding: 12, marginBottom: 12 }}>
            <Text style={{ color: theme.colors.muted, marginBottom: 6 }}>Daily messages</Text>
            <View style={{ height: 10, backgroundColor: theme.colors.surface, borderRadius: 6, overflow: 'hidden' }}>
              <View style={{ height: 10, width: `${progressPct}%`, backgroundColor: theme.colors.primary }} />
            </View>
            <Text style={{ color: theme.colors.text, marginTop: 6 }}>{count}/{limit} used today</Text>
          </View>
        )}
        {!isIOSPremium && (
          <TouchableOpacity onPress={() => (navigation as any).navigate('Paywall')} style={{ backgroundColor: theme.colors.primary, padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontWeight: '700', color: theme.colors.primaryText }}>Upgrade</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={signOut} style={{ backgroundColor: theme.colors.surface, padding: 14, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border }}>
          <Text style={{ fontWeight: '700', color: theme.colors.text }}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 12 }} />
        <TouchableOpacity
          disabled={deleting}
          onPress={async () => {
            if (!user?.id || deleting) return;
            Alert.alert(
              'Delete Account',
              'This will permanently delete your account and data. This action cannot be undone.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      setDeleting(true);
                      const { supabase } = await import('../lib/supabase');
                      const { error } = await supabase.functions.invoke('delete-user', { body: { userId: user.id } });
                      if (error) throw error;
                      Alert.alert('Account deleted', 'Your account has been deleted.');
                      await signOut();
                    } catch (e) {
                      Alert.alert('Error', e instanceof Error ? e.message : 'Unable to delete account');
                    } finally {
                      setDeleting(false);
                    }
                  }
                }
              ]
            );
          }}
          style={{ backgroundColor: '#991b1b', padding: 14, borderRadius: 10, alignItems: 'center', opacity: deleting ? 0.6 : 1 }}
        >
          <Text style={{ fontWeight: '700', color: 'white' }}>{deleting ? 'Deleting…' : 'Delete Account'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
