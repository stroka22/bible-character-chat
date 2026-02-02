import React, { useState } from 'react';
import { SafeAreaView, Text, TextInput, TouchableOpacity, View, Alert, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../theme';

export default function SignUp() {
  const { signUpWithEmail } = useAuth();
  const insets = useSafeAreaInsets();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isValid = firstName.trim() && lastName.trim() && email.trim() && password && confirmPassword;

  const onSubmit = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Sign Up', 'Please enter your first and last name.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Sign Up', 'Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Sign Up', 'Password must be at least 8 characters.');
      return;
    }
    
    setLoading(true);
    try {
      const displayName = `${firstName.trim()} ${lastName.trim()}`;
      const { error } = (await signUpWithEmail(email.trim(), password, { displayName })) || {};
      if (error) Alert.alert('Sign Up', error.message || String(error));
      else Alert.alert('Sign Up', 'Check your email to confirm your account.');
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: 16, paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
        <View style={{ gap: 12 }}>
          <Text style={{ color: theme.colors.accent, fontSize: 22, fontWeight: '800', fontFamily: 'Cinzel_700Bold' }}>Create Account</Text>
          
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TextInput
              autoCapitalize='words'
              value={firstName}
              onChangeText={setFirstName}
              placeholder='First Name'
              placeholderTextColor={theme.colors.muted}
              style={{ flex: 1, backgroundColor: theme.colors.surface, color: theme.colors.text, padding: 12, borderRadius: 8 }}
            />
            <TextInput
              autoCapitalize='words'
              value={lastName}
              onChangeText={setLastName}
              placeholder='Last Name'
              placeholderTextColor={theme.colors.muted}
              style={{ flex: 1, backgroundColor: theme.colors.surface, color: theme.colors.text, padding: 12, borderRadius: 8 }}
            />
          </View>
          
          <TextInput
            autoCapitalize='none'
            keyboardType='email-address'
            value={email}
            onChangeText={setEmail}
            placeholder='Email'
            placeholderTextColor={theme.colors.muted}
            style={{ backgroundColor: theme.colors.surface, color: theme.colors.text, padding: 12, borderRadius: 8 }}
          />
          
          <TextInput
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholder='Password (8+ characters)'
            placeholderTextColor={theme.colors.muted}
            style={{ backgroundColor: theme.colors.surface, color: theme.colors.text, padding: 12, borderRadius: 8 }}
          />
          
          <TextInput
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder='Confirm Password'
            placeholderTextColor={theme.colors.muted}
            style={{ backgroundColor: theme.colors.surface, color: theme.colors.text, padding: 12, borderRadius: 8 }}
          />
          
          <TouchableOpacity onPress={onSubmit} disabled={loading || !isValid} style={{ backgroundColor: !isValid ? theme.colors.muted : theme.colors.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 4 }}>
            <Text style={{ fontWeight: '900', fontSize: 16, color: theme.colors.primaryText }}>{loading ? 'Creating…' : 'Create Account'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
