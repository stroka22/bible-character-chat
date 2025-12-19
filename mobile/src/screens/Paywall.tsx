import React from 'react';
import { SafeAreaView, Text, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../theme';
import { purchaseMonthly, purchaseYearly, restorePurchases } from '../lib/iap';

export default function Paywall() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [busy, setBusy] = React.useState(false);

  const onMonthly = async () => {
    if (busy) return; setBusy(true);
    try {
      const res = await purchaseMonthly(user?.id);
      if (!res.ok) throw new Error('Purchase failed');
      Alert.alert('Success', 'You are now Premium. Enjoy!');
    } catch (e:any) {
      Alert.alert('Purchase', e?.message || 'Unable to complete purchase.');
    } finally { setBusy(false); }
  };

  const onYearly = async () => {
    if (busy) return; setBusy(true);
    try {
      const res = await purchaseYearly(user?.id);
      if (!res.ok) throw new Error('Purchase failed');
      Alert.alert('Success', 'You are now Premium. Enjoy!');
    } catch (e:any) {
      Alert.alert('Purchase', e?.message || 'Unable to complete purchase.');
    } finally { setBusy(false); }
  };

  const onRestore = async () => {
    if (busy) return; setBusy(true);
    try {
      const { restored } = await restorePurchases(user?.id);
      Alert.alert('Restore', restored ? 'Purchases restored.' : 'No active purchases found.');
    } catch {
      Alert.alert('Restore', 'Unable to restore purchases.');
    } finally { setBusy(false); }
  };

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ padding: 16, gap: 12 }}>
        <TouchableOpacity onPress={goBack} style={{ alignSelf: 'flex-start', paddingVertical: 8, paddingRight: 16 }}>
          <Text style={{ color: theme.colors.muted, fontSize: 16 }}>← Back</Text>
        </TouchableOpacity>
        <Text style={{ color: theme.colors.accent, fontSize: 22, fontWeight: '800' }}>Go Premium</Text>
        <Text style={{ color: theme.colors.text }}>
          Unlock roundtables, saving, and premium studies.
        </Text>
        <View style={{ marginTop: 12, gap: 10 }}>
          <TouchableOpacity onPress={onMonthly} disabled={busy} style={{ backgroundColor: theme.colors.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center' }}>
            <Text style={{ color: theme.colors.primaryText, fontWeight: '900', fontSize: 16 }}>Monthly — $9.97 (7‑day free trial)</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onYearly} disabled={busy} style={{ backgroundColor: theme.colors.card, paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border }}>
            <Text style={{ color: theme.colors.text, fontWeight: '900', fontSize: 16 }}>Yearly — $97.97 (7‑day free trial)</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onRestore} disabled={busy} style={{ backgroundColor: theme.colors.surface, paddingVertical: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border }}>
            <Text style={{ color: theme.colors.text, fontWeight: '700' }}>Restore Purchases</Text>
          </TouchableOpacity>
          {busy && <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 6 }} />}
        </View>
      </View>
    </SafeAreaView>
  );
}
