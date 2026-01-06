import React from 'react';
import { SafeAreaView, Text, TouchableOpacity, View, Alert, ActivityIndicator, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../theme';
import { purchaseMonthly, purchaseYearly, restorePurchases } from '../lib/iap';

const PRIVACY_URL = 'https://faithtalkai.com/privacy';
const TERMS_URL = 'https://faithtalkai.com/terms';

export default function Paywall() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [busy, setBusy] = React.useState(false);

  const onMonthly = async () => {
    if (busy) return; 
    setBusy(true);
    try {
      const res = await purchaseMonthly(user?.id);
      if (!res.ok) {
        const errMsg = res.error?.message || res.error?.toString() || 'Purchase could not be completed. Please ensure IAP products are configured in App Store Connect.';
        throw new Error(errMsg);
      }
      Alert.alert('Success', 'You are now Premium. Enjoy!');
    } catch (e:any) {
      Alert.alert('Purchase Issue', e?.message || 'Unable to complete purchase. Please try again later.');
    } finally { setBusy(false); }
  };

  const onYearly = async () => {
    if (busy) return; setBusy(true);
    try {
      const res = await purchaseYearly(user?.id);
      if (!res.ok) {
        const errMsg = res.error?.message || res.error?.toString() || 'Purchase could not be completed. Please ensure IAP products are configured in App Store Connect.';
        throw new Error(errMsg);
      }
      Alert.alert('Success', 'You are now Premium. Enjoy!');
    } catch (e:any) {
      Alert.alert('Purchase Issue', e?.message || 'Unable to complete purchase. Please try again later.');
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
            <Text style={{ color: theme.colors.primaryText, fontWeight: '900', fontSize: 16 }}>Monthly — $6.99/month</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onYearly} disabled={busy} style={{ backgroundColor: theme.colors.card, paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border }}>
            <Text style={{ color: theme.colors.text, fontWeight: '900', fontSize: 16 }}>Yearly — $49.99/year</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onRestore} disabled={busy} style={{ backgroundColor: theme.colors.surface, paddingVertical: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border }}>
            <Text style={{ color: theme.colors.text, fontWeight: '700' }}>Restore Purchases</Text>
          </TouchableOpacity>
          {busy && <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 6 }} />}
        </View>
        
        <Text style={{ color: theme.colors.muted, fontSize: 12, textAlign: 'center', marginTop: 16, lineHeight: 18 }}>
          Subscriptions automatically renew unless canceled at least 24 hours before the end of the current period. 
          Manage subscriptions in your Apple ID settings.
        </Text>
        
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 12 }}>
          <TouchableOpacity onPress={() => Linking.openURL(PRIVACY_URL)}>
            <Text style={{ color: theme.colors.accent, fontSize: 13, textDecorationLine: 'underline' }}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL(TERMS_URL)}>
            <Text style={{ color: theme.colors.accent, fontSize: 13, textDecorationLine: 'underline' }}>Terms of Use</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
