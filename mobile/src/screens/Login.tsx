import React, { useState } from 'react';
import { SafeAreaView, Text, TextInput, TouchableOpacity, View, Image, Linking } from 'react-native';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const AppLogo = require('../../assets/wordmark.png');
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { signInWithPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      const { error } = (await signInWithPassword(email.trim(), password)) || {};
      if (error) setError(error.message || String(error));
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a', padding: 16, justifyContent: 'center' }}>
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <View style={{ backgroundColor: '#1f2937', padding: 10, borderRadius: 20 }}>
          <Image source={AppLogo} style={{ width: 200, height: 56 }} resizeMode="contain" />
        </View>
      </View>
      {!!error && (
        <View style={{ backgroundColor: '#991b1b', padding: 10, borderRadius: 8, marginBottom: 12 }}>
          <Text style={{ color: 'white' }}>{error}</Text>
        </View>
      )}
      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor="#9ca3af"
        style={{ backgroundColor: '#111827', color: 'white', padding: 12, borderRadius: 8, marginBottom: 12 }}
      />
      <TextInput
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        placeholderTextColor="#9ca3af"
        style={{ backgroundColor: '#111827', color: 'white', padding: 12, borderRadius: 8, marginBottom: 12 }}
      />
      <TouchableOpacity onPress={onSubmit} disabled={loading || !email.trim() || !password} style={{ backgroundColor: (!email.trim() || !password) ? '#9ca3af' : '#facc15', padding: 16, borderRadius: 12, alignItems: 'center' }}>
        <Text style={{ fontWeight: '800', fontSize: 16, color: '#0f172a' }}>{loading ? 'Signing in...' : 'Sign In'}</Text>
      </TouchableOpacity>
      <View style={{ marginTop: 12, alignItems: 'center', gap: 8 }}>
        <TouchableOpacity onPress={() => Linking.openURL('https://faithtalkai.com/signup')}>
          <Text style={{ color: '#fde68a', textDecorationLine: 'underline', fontWeight: '700' }}>Create account</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Linking.openURL('https://faithtalkai.com/reset-password')}>
          <Text style={{ color: '#9ca3af', textDecorationLine: 'underline' }}>Forgot password?</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
