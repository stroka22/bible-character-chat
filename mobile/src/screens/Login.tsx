import React, { useState } from 'react';
import { SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
      <Text style={{ color: '#fde68a', fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 24 }}>FaithTalkAI</Text>
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
      <TouchableOpacity onPress={onSubmit} disabled={loading || !email.trim() || !password} style={{ backgroundColor: (!email.trim() || !password) ? '#9ca3af' : '#facc15', padding: 14, borderRadius: 10, alignItems: 'center' }}>
        <Text style={{ fontWeight: '700' }}>{loading ? 'Signing in...' : 'Sign In'}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
