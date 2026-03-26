import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { AppState, Modal, TextInput, Share } from 'react-native';
import { DefaultTheme, DarkTheme, NavigationContainer } from '@react-navigation/native';
import * as LinkingExpo from 'expo-linking';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaView, Text, TouchableOpacity, View, Alert, useWindowDimensions, KeyboardAvoidingView, Platform } from 'react-native';
import Wordmark from './src/components/Wordmark';
import { useFonts, Inter_700Bold } from '@expo-google-fonts/inter';
import { Cinzel_700Bold } from '@expo-google-fonts/cinzel';
import ChatList from './src/screens/ChatList';
import ChatNew from './src/screens/ChatNew';
import ChatDetail from './src/screens/ChatDetail';
import MyWalk from './src/screens/MyWalk';
import Profile from './src/screens/Profile';
import RoundtableSetup from './src/screens/RoundtableSetup';
import RoundtableChat from './src/screens/RoundtableChat';
import { Linking } from 'react-native';
// useAuth imported below with AuthProvider
import { requirePremiumOrPrompt } from './src/lib/tier';
import StudiesList from './src/screens/StudiesList';
import StudyDetail from './src/screens/StudyDetail';
import BibleReader from './src/screens/BibleReader';
import ReadingPlans from './src/screens/ReadingPlans';
import ReadingPlanDetail from './src/screens/ReadingPlanDetail';
import Login from './src/screens/Login';
import SignUp from './src/screens/SignUp';
import ResetPassword from './src/screens/ResetPassword';
import Paywall from './src/screens/Paywall';
import JoinChat from './src/screens/JoinChat';
import HowItWorks from './src/screens/HowItWorks';
import FAQ from './src/screens/FAQ';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { theme } from './src/theme';
import { startSettingsRealtimeForUser, refreshAllSettingsForUser } from './src/lib/settings';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();
const ChatStack = createNativeStackNavigator();

function BrandHeaderTitle() {
  const { width } = useWindowDimensions();
  const w = Math.min(width * 0.12, 56);
  const nav = require('@react-navigation/native').useNavigation();
  return (
    <TouchableOpacity onPress={() => nav?.navigate?.('Home')}>
      <Wordmark width={w} variant="iconOnly" />
    </TouchableOpacity>
  );
}

function ChatStackScreen() {
  return (
    <ChatStack.Navigator>
      <ChatStack.Screen name="ChatNew" component={ChatNew} options={({ navigation }) => ({
        headerShown: true,
        headerTitleAlign: 'center',
        headerTitle: () => <BrandHeaderTitle />,
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={{ paddingHorizontal: 8 }}>
            <Text style={{ color: theme.colors.primary, fontSize: 16 }}>{'< Home'}</Text>
          </TouchableOpacity>
        ),
      })} />
      <ChatStack.Screen name="ChatDetail" component={ChatDetail} options={{
        headerShown: true,
        headerTitleAlign: 'center',
        headerTitle: () => <BrandHeaderTitle />,
      }} />
    </ChatStack.Navigator>
  );
}

function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const { width, height } = useWindowDimensions();
  const logoWidth = Math.min(width * 0.7, 900);
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [inviteInput, setInviteInput] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joining, setJoining] = useState(false);

  const handleJoinInvite = async () => {
    if (!inviteInput.trim()) return;
    
    // Extract code from URL or use as-is
    let code = inviteInput.trim();
    const match = code.match(/\/join\/([A-Za-z0-9]+)/);
    if (match) code = match[1];
    
    if (!code || code.length < 6) {
      setJoinError('Please enter a valid invite link or code');
      return;
    }
    
    if (!user) {
      setJoinModalVisible(false);
      setInviteInput('');
      navigation.navigate('JoinChat', { code });
      return;
    }
    
    setJoining(true);
    setJoinError('');
    try {
      const { supabase } = await import('./src/lib/supabase');
      console.log('[JoinInvite] Calling redeem_chat_invite with code:', code);
      const { data, error } = await supabase.rpc('redeem_chat_invite', { p_code: code });
      console.log('[JoinInvite] Response:', { data, error });
      if (error) throw error;
      // RPC returns {success: false, error: "..."} on failure
      if (data?.success === false) throw new Error(data.error || 'Failed to join');
      const chatId = data?.chat_id;
      if (!chatId) throw new Error('Invalid response');
      setJoinModalVisible(false);
      setInviteInput('');
      navigation.navigate('Chat', { screen: 'ChatDetail', params: { chatId } });
    } catch (e: any) {
      console.log('[JoinInvite] Error:', e);
      setJoinError(e?.message || 'Failed to join. Please check the invite link.');
    } finally {
      setJoining(false);
    }
  };

  const handleInviteFriend = async () => {
    const url = 'https://faithtalkai.com';
    const message = `Check out Faith Talk AI - have meaningful conversations with Biblical characters!\n\n${url}`;
    try {
      await Share.share({ message, url });
    } catch {}
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          <Wordmark width={logoWidth} variant="stacked" />
          <Text style={{ fontSize: 14, color: theme.colors.muted, marginTop: 8, textAlign: 'center' }}>Conversations with Biblical Characters</Text>
        </View>
        <View style={{ gap: 10, width: '86%' }}>
          {/* Ensure Chat tab opens on the ChatNew composer instead of a previously open ChatDetail */}
          <TouchableOpacity onPress={() => navigation.navigate('Chat', { screen: 'ChatNew' })} style={{ minHeight: 52, paddingVertical: 12, backgroundColor: theme.colors.primary, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontWeight: '900', fontSize: 16, color: theme.colors.primaryText }}>Start a Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={async () => {
          await requirePremiumOrPrompt({
            userId: user?.id,
            feature: 'roundtable',
            onAllowed: () => navigation.navigate('RoundtableSetup'),
            onUpgrade: () => navigation.navigate('Paywall')
          });
        }} style={{ minHeight: 52, paddingVertical: 12, backgroundColor: theme.colors.primary, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontWeight: '900', fontSize: 16, color: theme.colors.primaryText }}>Start a Roundtable</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Studies')} style={{ minHeight: 52, paddingVertical: 12, backgroundColor: theme.colors.primary, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontWeight: '900', fontSize: 16, color: theme.colors.primaryText }}>Browse Bible Studies</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Plans')} style={{ minHeight: 52, paddingVertical: 12, backgroundColor: theme.colors.primary, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontWeight: '900', fontSize: 16, color: theme.colors.primaryText }}>Reading Plans</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('My Walk')} style={{ minHeight: 52, paddingVertical: 12, backgroundColor: theme.colors.primary, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontWeight: '900', fontSize: 16, color: theme.colors.primaryText }}>My Walk</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity onPress={() => setJoinModalVisible(true)} style={{ flex: 1, minHeight: 44, paddingVertical: 10, backgroundColor: theme.colors.accent, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontWeight: '700', fontSize: 13, color: '#fff' }}>🔗 Join Invite</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleInviteFriend} style={{ flex: 1, minHeight: 44, paddingVertical: 10, backgroundColor: theme.colors.accent, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontWeight: '700', fontSize: 13, color: '#fff' }}>📨 Invite Friend</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity onPress={() => navigation.navigate('HowItWorks')} style={{ flex: 1, minHeight: 40, paddingVertical: 8, backgroundColor: theme.colors.card, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border }}>
            <Text style={{ fontWeight: '600', fontSize: 12, color: theme.colors.text }}>📖 How It Works</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('FAQ')} style={{ flex: 1, minHeight: 40, paddingVertical: 8, backgroundColor: theme.colors.card, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border }}>
            <Text style={{ fontWeight: '600', fontSize: 12, color: theme.colors.text }}>❓ FAQ</Text>
          </TouchableOpacity>
        </View>
      </View>
      <StatusBar style="dark" />
      </View>
      </KeyboardAvoidingView>

      {/* Join Invite Modal */}
      <Modal visible={joinModalVisible} transparent animationType="fade" onRequestClose={() => setJoinModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <View style={{ backgroundColor: theme.colors.card, borderRadius: 16, padding: 20, width: '100%', maxWidth: 340 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.text, marginBottom: 8, textAlign: 'center' }}>Join a Conversation</Text>
            <Text style={{ fontSize: 14, color: theme.colors.muted, marginBottom: 16, textAlign: 'center' }}>Paste the invite link or code you received</Text>
            <TextInput
              value={inviteInput}
              onChangeText={(t) => { setInviteInput(t); setJoinError(''); }}
              placeholder="Paste invite link or code..."
              placeholderTextColor={theme.colors.muted}
              style={{ backgroundColor: theme.colors.surface, borderRadius: 10, padding: 14, fontSize: 15, color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.border, marginBottom: 12 }}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {joinError ? <Text style={{ color: '#dc2626', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>{joinError}</Text> : null}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity onPress={() => { setJoinModalVisible(false); setInviteInput(''); setJoinError(''); }} style={{ flex: 1, padding: 14, borderRadius: 10, backgroundColor: theme.colors.surface, alignItems: 'center' }}>
                <Text style={{ fontWeight: '600', color: theme.colors.text }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleJoinInvite} disabled={joining} style={{ flex: 1, padding: 14, borderRadius: 10, backgroundColor: theme.colors.primary, alignItems: 'center', opacity: joining ? 0.6 : 1 }}>
                <Text style={{ fontWeight: '700', color: theme.colors.primaryText }}>{joining ? 'Joining...' : 'Join'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Placeholder tabs for Chat and My Walk (will implement screens next)
function Empty() { return null; }

function AppInner() {
  const { user, loading } = useAuth();
  useEffect(() => {
    let cleanup: undefined | (() => void);
    (async () => {
      cleanup = await startSettingsRealtimeForUser(user?.id);
    })();
    return () => { try { cleanup && cleanup(); } catch {} };
  }, [user?.id]);
  // Global: refresh settings on app foreground and light periodic poll
  useEffect(() => {
    const sub = AppState.addEventListener('change', async (state) => {
      if (state === 'active') {
        try { await refreshAllSettingsForUser(user?.id); } catch {}
      }
    });
    const id = setInterval(async () => {
      try { await refreshAllSettingsForUser(user?.id); } catch {}
    }, 5 * 60 * 1000); // 5 minutes
    return () => { try { sub.remove(); } catch {}; clearInterval(id); };
  }, [user?.id]);
  if (loading) return null;
  const authed = !!user;
  const linking = {
    prefixes: ([] as string[]).concat([String(LinkingExpo.createURL('/')), 'https://faithtalkai.com', 'faithtalkai://']),
    config: {
      screens: {
        JoinChat: 'join/:code',
      },
    },
  } as const;

  return (
    <NavigationContainer linking={linking} theme={{
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        primary: theme.colors.primary,
        background: theme.colors.background,
        card: theme.colors.card,
        text: theme.colors.text,
        border: theme.colors.border,
        notification: theme.colors.primary,
      }
    }}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* All users (logged in or not) can access the main app */}
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="SignUp" component={SignUp} />
          <Stack.Screen name="ResetPassword" component={ResetPassword} />
            <Stack.Screen name="StudyDetail" component={StudyDetail} options={({ navigation }) => ({ 
              headerShown: true, 
              headerTitleAlign: 'center', 
              headerTitle: () => <BrandHeaderTitle />,
              headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Studies' })} style={{ paddingHorizontal: 8 }}>
                  <Text style={{ color: theme.colors.primary, fontSize: 16 }}>{'< Studies'}</Text>
                </TouchableOpacity>
              )
            })} />
            <Stack.Screen name="RoundtableSetup" component={RoundtableSetup} options={({ navigation }) => ({ 
              headerShown: true, 
              headerTitleAlign: 'center', 
              headerTitle: () => <BrandHeaderTitle />,
              headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })} style={{ paddingHorizontal: 8 }}>
                  <Text style={{ color: theme.colors.primary, fontSize: 16 }}>{'< Home'}</Text>
                </TouchableOpacity>
              )
            })} />
            <Stack.Screen name="RoundtableChat" component={RoundtableChat} options={({ navigation }) => ({ 
              headerShown: true, 
              headerTitleAlign: 'center', 
              headerTitle: () => <BrandHeaderTitle />,
              headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })} style={{ paddingHorizontal: 8 }}>
                  <Text style={{ color: theme.colors.primary, fontSize: 16 }}>{'< Home'}</Text>
                </TouchableOpacity>
              )
            })} />
            <Stack.Screen name="ReadingPlanDetail" component={ReadingPlanDetail} options={({ navigation }) => ({ 
              headerShown: true, 
              headerTitleAlign: 'center', 
              headerTitle: () => <BrandHeaderTitle />,
              headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Plans' })} style={{ paddingHorizontal: 8 }}>
                  <Text style={{ color: theme.colors.primary, fontSize: 16 }}>{'< Plans'}</Text>
                </TouchableOpacity>
              )
            })} />
            <Stack.Screen name="HowItWorks" component={HowItWorks} options={({ navigation }) => ({ 
              headerShown: true, 
              headerTitleAlign: 'center', 
              headerTitle: () => <BrandHeaderTitle />,
              headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })} style={{ paddingHorizontal: 8 }}>
                  <Text style={{ color: theme.colors.primary, fontSize: 16 }}>{'< Home'}</Text>
                </TouchableOpacity>
              )
            })} />
            <Stack.Screen name="FAQ" component={FAQ} options={({ navigation }) => ({ 
              headerShown: true, 
              headerTitleAlign: 'center', 
              headerTitle: () => <BrandHeaderTitle />,
              headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingHorizontal: 8 }}>
                  <Text style={{ color: theme.colors.primary, fontSize: 16 }}>{'< Back'}</Text>
                </TouchableOpacity>
              )
            })} />
            <Stack.Screen name="Bible" component={BibleReader} options={({ navigation }) => ({ 
              headerShown: true, 
              headerTitleAlign: 'center', 
              headerTitle: () => <BrandHeaderTitle />,
              headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingHorizontal: 8 }}>
                  <Text style={{ color: theme.colors.primary, fontSize: 16 }}>{'< Back'}</Text>
                </TouchableOpacity>
              )
            })} />
          <Stack.Screen name="JoinChat" component={JoinChat} />
          <Stack.Screen name="Paywall" component={Paywall} />
        </>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function MainTabs() {
  return (
    <Tabs.Navigator screenOptions={{
      headerTitleAlign: 'center',
      headerStyle: { backgroundColor: theme.colors.card },
      headerTintColor: theme.colors.text,
      tabBarStyle: { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border },
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.muted,
      headerTitle: () => <BrandHeaderTitle />
    }}>
      <Tabs.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🏠</Text> }} />
      <Tabs.Screen name="Chat" component={ChatStackScreen} options={{ headerShown: false, tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>💬</Text> }} />
      <Tabs.Screen name="Plans" component={ReadingPlans} options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📅</Text> }} />
      <Tabs.Screen name="Studies" component={StudiesList} options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📖</Text> }} />
      <Tabs.Screen name="My Walk" component={MyWalk} options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>⭐</Text> }} />
      <Tabs.Screen name="Profile" component={Profile} options={{ tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>👤</Text> }} />
    </Tabs.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({ Inter_700Bold, Cinzel_700Bold });
  if (!fontsLoaded) return null;
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}