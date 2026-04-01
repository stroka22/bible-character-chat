import React from 'react';
import { SafeAreaView, Text, View, TouchableOpacity, Linking, Platform, Alert, ScrollView } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
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

  // If not logged in, show login prompt with Free vs Premium breakdown
  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          <Text style={{ fontSize: 22, fontWeight: '700', color: theme.colors.accent, fontFamily: 'Cinzel_700Bold', marginBottom: 8, textAlign: 'center' }}>Profile</Text>
          <Text style={{ color: theme.colors.muted, textAlign: 'center', marginBottom: 20, fontSize: 14 }}>
            Track your spiritual journey with Faith Talk AI
          </Text>
          
          {/* Free Account Benefits */}
          <View style={{ backgroundColor: theme.colors.card, borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: theme.colors.border }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: theme.colors.text, marginBottom: 12 }}>✨ Free Account</Text>
            <View style={{ gap: 8 }}>
              <Text style={{ color: theme.colors.text, fontSize: 14 }}>✓ Unlimited conversations with characters</Text>
              <Text style={{ color: theme.colors.text, fontSize: 14 }}>✓ Access to Bible Studies (Lesson 1)</Text>
              <Text style={{ color: theme.colors.text, fontSize: 14 }}>✓ Save conversations for later</Text>
              <Text style={{ color: theme.colors.text, fontSize: 14 }}>✓ Track Bible study progress</Text>
              <Text style={{ color: theme.colors.text, fontSize: 14 }}>✓ Reading Plans access</Text>
            </View>
          </View>
          
          {/* Premium Benefits */}
          <View style={{ backgroundColor: theme.colors.accent + '15', borderRadius: 12, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: theme.colors.accent }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: theme.colors.accent, marginBottom: 12 }}>👑 Premium ($5.99/mo)</Text>
            <View style={{ gap: 8 }}>
              <Text style={{ color: theme.colors.text, fontSize: 14 }}>✓ Everything in Free, plus:</Text>
              <Text style={{ color: theme.colors.text, fontSize: 14 }}>✓ Access saved conversations in My Walk</Text>
              <Text style={{ color: theme.colors.text, fontSize: 14 }}>✓ All Bible Study lessons</Text>
              <Text style={{ color: theme.colors.text, fontSize: 14 }}>✓ Roundtable discussions</Text>
              <Text style={{ color: theme.colors.text, fontSize: 14 }}>✓ Invite friends to conversations</Text>
              <Text style={{ color: theme.colors.text, fontSize: 14 }}>✓ Share & copy conversations</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            onPress={() => navigation.navigate('SignUp')}
            style={{ backgroundColor: theme.colors.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 10, marginBottom: 12 }}
          >
            <Text style={{ color: theme.colors.primaryText, fontWeight: '700', fontSize: 16, textAlign: 'center' }}>Create Free Account</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Login')}
            style={{ backgroundColor: theme.colors.card, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border }}
          >
            <Text style={{ color: theme.colors.text, fontWeight: '600', fontSize: 16, textAlign: 'center' }}>Already have an account?{'\n'}Sign In</Text>
          </TouchableOpacity>
        </ScrollView>
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
        <TouchableOpacity 
          onPress={async () => {
            try {
              console.log('[Profile] Starting sign out...');
              await signOut();
              console.log('[Profile] Sign out complete, navigating to Home...');
              navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs', params: { screen: 'Home' } }],
              });
            } catch (e) {
              console.error('[Profile] Sign out error:', e);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          }} 
          style={{ backgroundColor: theme.colors.surface, padding: 14, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border }}
        >
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
                      console.log('[Profile] Attempting to delete user:', user.id);
                      const { data, error } = await supabase.functions.invoke('delete-user', { body: { userId: user.id } });
                      console.log('[Profile] Delete response:', { data, error });
                      if (error) {
                        console.error('[Profile] Delete error:', error);
                        throw new Error(error.message || JSON.stringify(error));
                      }
                      if (data?.error) {
                        throw new Error(data.error);
                      }
                      Alert.alert('Account deleted', 'Your account has been deleted.');
                      await signOut();
                      navigation.navigate('MainTabs', { screen: 'Home' });
                    } catch (e: any) {
                      console.error('[Profile] Delete catch:', e);
                      Alert.alert('Error', e?.message || 'Unable to delete account');
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
