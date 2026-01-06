import React, { useState } from 'react';
import { SafeAreaView, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../theme';

export default function ResetPassword() {
  const navigation = useNavigation<any>();
  const { resetPasswordEmail } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setLoading(true);
    try {
      const { error } = (await resetPasswordEmail(email.trim())) || {};
      if (error) Alert.alert('Reset Password', error.message || String(error));
      else Alert.alert('Reset Password', 'Check your email for a link to reset your password.');
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background, paddingTop: insets.top + 16, paddingHorizontal: 16 }}>
      <View style={{ gap: 10 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ alignSelf: 'flex-start', paddingVertical: 8, paddingRight: 16 }}>
          <Text style={{ color: theme.colors.muted, fontSize: 16 }}>← Back</Text>
        </TouchableOpacity>
        <Text style={{ color: theme.colors.accent, fontSize: 22, fontWeight: '800' }}>Reset Password</Text>
        <TextInput
          autoCapitalize='none'
          keyboardType='email-address'
          value={email}
          onChangeText={setEmail}
          placeholder='Email'
          placeholderTextColor={theme.colors.muted}
          style={{ backgroundColor: theme.colors.surface, color: theme.colors.text, padding: 12, borderRadius: 8 }}
        />
        <TouchableOpacity onPress={onSubmit} disabled={loading || !email.trim()} style={{ backgroundColor: (!email.trim()) ? theme.colors.muted : theme.colors.primary, padding: 16, borderRadius: 12, alignItems: 'center' }}>
          <Text style={{ fontWeight: '900', fontSize: 16, color: theme.colors.primaryText }}>{loading ? 'Sending…' : 'Send reset email'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
