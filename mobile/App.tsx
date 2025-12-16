import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { DefaultTheme, DarkTheme, NavigationContainer } from '@react-navigation/native';
import * as LinkingExpo from 'expo-linking';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaView, Text, TouchableOpacity, View, Alert, useWindowDimensions, KeyboardAvoidingView, Platform } from 'react-native';
import Wordmark from './src/components/Wordmark';
import { useFonts, Inter_700Bold } from '@expo-google-fonts/inter';
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
import Login from './src/screens/Login';
import JoinChat from './src/screens/JoinChat';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { theme } from './src/theme';
import { startSettingsRealtimeForUser, refreshAllSettingsForUser } from './src/lib/settings';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();
const ChatStack = createNativeStackNavigator();

function BrandHeaderTitle() {
  const { width } = useWindowDimensions();
  const w = Math.min(width * 0.12, 56);
  return <Wordmark width={w} variant="iconOnly" />;
}

function ChatStackScreen() {
  return (
    <ChatStack.Navigator>
      <ChatStack.Screen name="ChatNew" component={ChatNew} options={{
        headerShown: true,
        headerTitleAlign: 'center',
        headerTitle: () => <BrandHeaderTitle />,
      }} />
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
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          <Wordmark width={logoWidth} variant="stacked" />
          <Text style={{ fontSize: 14, color: theme.colors.muted, marginTop: 8, textAlign: 'center' }}>Study the Bible with guided conversations</Text>
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
            onUpgrade: () => {
              Alert.alert('Upgrade required', 'Roundtable is a premium feature. Upgrade to continue.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Upgrade', onPress: () => Linking.openURL('https://faithtalkai.com/pricing') }
              ]);
            }
          });
        }} style={{ minHeight: 52, paddingVertical: 12, backgroundColor: theme.colors.primary, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontWeight: '900', fontSize: 16, color: theme.colors.primaryText }}>Start a Roundtable</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Studies')} style={{ minHeight: 52, paddingVertical: 12, backgroundColor: theme.colors.primary, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontWeight: '900', fontSize: 16, color: theme.colors.primaryText }}>Browse Bible Studies</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('My Walk')} style={{ minHeight: 52, paddingVertical: 12, backgroundColor: theme.colors.primary, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontWeight: '900', fontSize: 16, color: theme.colors.primaryText }}>My Walk</Text>
        </TouchableOpacity>
      </View>
      <StatusBar style="light" />
      </View>
      </KeyboardAvoidingView>
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
    prefixes: [LinkingExpo.createURL('/'), 'https://faithtalkai.com', 'faithtalkai://'],
    config: {
      screens: {
        JoinChat: 'join/:code',
      },
    },
  } as const;

  return (
    <NavigationContainer linking={linking} theme={{
      ...DarkTheme,
      colors: {
        ...DarkTheme.colors,
        primary: theme.colors.primary,
        background: theme.colors.background,
        card: theme.colors.card,
        text: theme.colors.text,
        border: theme.colors.border,
        notification: theme.colors.primary,
      }
    }}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Always available to support deep links before/after auth */}
        <Stack.Screen name="JoinChat" component={JoinChat} />
        {!authed ? (
          <Stack.Screen name="Login" component={Login} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="StudyDetail" component={StudyDetail} options={{ headerShown: true, headerTitleAlign: 'center', headerTitle: () => <BrandHeaderTitle /> }} />
            <Stack.Screen name="RoundtableSetup" component={RoundtableSetup} options={{ headerShown: true, headerTitleAlign: 'center', headerTitle: () => <BrandHeaderTitle /> }} />
            <Stack.Screen name="RoundtableChat" component={RoundtableChat} options={{ headerShown: true, headerTitleAlign: 'center', headerTitle: () => <BrandHeaderTitle /> }} />
          </>
        )}
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
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen name="Chat" component={ChatStackScreen} options={{ headerShown: false }} />
      <Tabs.Screen name="Studies" component={StudiesList} />
      <Tabs.Screen name="My Walk" component={MyWalk} />
      <Tabs.Screen name="Profile" component={Profile} />
    </Tabs.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({ Inter_700Bold });
  if (!fontsLoaded) return null;
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}