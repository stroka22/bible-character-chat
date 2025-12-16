import React from 'react';
import { ActivityIndicator, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../theme';

export default function JoinChat() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { user, loading } = useAuth();
  const code = route.params?.code as string | undefined;
  const [status, setStatus] = React.useState<'idle'|'working'|'done'|'error'>('idle');
  const [message, setMessage] = React.useState<string>('');

  React.useEffect(() => {
    (async () => {
      if (!code) {
        setStatus('error');
        setMessage('Invalid invite link.');
        return;
      }
      if (loading) return;
      if (!user) {
        setStatus('idle');
        setMessage('Please log in to join this chat.');
        return;
      }
      try {
        setStatus('working');
        const { data, error } = await supabase.rpc('redeem_chat_invite', { p_code: code });
        if (error) throw error;
        const chatId = (data as any)?.chat_id;
        if (!chatId) throw new Error('Invalid response');
        setStatus('done');
        setMessage('Joined! Opening chat…');
        setTimeout(() => {
          navigation.navigate('Chat', { screen: 'ChatDetail', params: { chatId } });
        }, 400);
      } catch (e: any) {
        setStatus('error');
        setMessage(e?.message || 'Failed to join chat');
      }
    })();
  }, [code, user, loading]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        {status === 'working' && <ActivityIndicator color={theme.colors.primary} />}
        <Text style={{ color: theme.colors.text, fontSize: 16, textAlign: 'center', marginTop: 12 }}>{message || 'Joining chat…'}</Text>
        {!user && (
          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: 16, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: theme.colors.primary, borderRadius: 8 }}>
            <Text style={{ color: theme.colors.primaryText, fontWeight: '700' }}>Log in</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
