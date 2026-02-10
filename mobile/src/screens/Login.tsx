import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { SafeAreaView, Text, TextInput, TouchableOpacity, View, ScrollView, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Wordmark from '../components/Wordmark';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../theme';

export default function Login() {
  const navigation = useNavigation<any>();
  const { signInWithPassword } = useAuth();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const logoWidth = Math.min(width * 0.7, 900);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      const { error } = (await signInWithPassword(email.trim(), password)) || {};
      if (error) {
        setError(error.message || String(error));
      } else {
        // Navigate to Home after successful login
        navigation.navigate('MainTabs', { screen: 'Home' });
      }
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 16, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }} keyboardShouldPersistTaps="handled">
        <View style={{ alignItems: 'center', marginBottom: 16, justifyContent: 'center', minHeight: 160 }}>
          <Wordmark width={logoWidth} variant="stacked" />
        </View>
      {!!error && (
        <View style={{ backgroundColor: theme.colors.error, padding: 10, borderRadius: 8, marginBottom: 12 }}>
          <Text style={{ color: 'white' }}>{error}</Text>
        </View>
      )}
      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor={theme.colors.muted}
        style={{ backgroundColor: theme.colors.card, color: theme.colors.text, padding: 12, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: theme.colors.border }}
      />
      <TextInput
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        placeholderTextColor={theme.colors.muted}
        style={{ backgroundColor: theme.colors.card, color: theme.colors.text, padding: 12, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: theme.colors.border }}
      />
      <TouchableOpacity onPress={onSubmit} disabled={loading || !email.trim() || !password} style={{ backgroundColor: (!email.trim() || !password) ? theme.colors.muted : theme.colors.primary, padding: 16, borderRadius: 12, alignItems: 'center' }}>
        <Text style={{ fontWeight: '800', fontSize: 16, color: theme.colors.primaryText }}>{loading ? 'Signing in...' : 'Sign In'}</Text>
      </TouchableOpacity>
        <View style={{ marginTop: 12, alignItems: 'center', gap: 8 }}>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={{ color: theme.colors.accent, textDecorationLine: 'underline', fontWeight: '700' }}>Create account</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('ResetPassword')}>
            <Text style={{ color: theme.colors.muted, textDecorationLine: 'underline' }}>Forgot password?</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
