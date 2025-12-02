import { StatusBar } from 'expo-status-bar';
import { DefaultTheme, DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaView, Text, TouchableOpacity, View, Alert, Image, useWindowDimensions } from 'react-native';
// Static require ensures bundling in Dev Client
// eslint-disable-next-line @typescript-eslint/no-var-requires
const AppLogo = require('./assets/wordmark.png');
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
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { theme } from './src/theme';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function BrandHeader() {
  const { width, height } = useWindowDimensions();
  const aspect = 300 / 84;
  const headerH = Math.min(Math.max(120, height * 0.16), 180); // 16% of screen, min 120, max 180
  const imgW = Math.min(width * 0.9, 1200);
  const imgH = Math.min(headerH * 0.8, imgW / aspect);
  return (
    <View style={{ height: headerH, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.card }}>
      <Image source={AppLogo} style={{ width: imgW, height: imgH, tintColor: theme.colors.muted }} resizeMode="contain" />
    </View>
  );
}

function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const { width, height } = useWindowDimensions();
  const logoHeight = Math.min(height * 0.4, 480); // 40% of viewport, cap for tablets
  const logoAspect = 300 / 84; // maintain wordmark ratio
  return (
    <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, backgroundColor: theme.colors.background }}>
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <Image source={AppLogo} style={{ height: logoHeight, width: undefined, aspectRatio: logoAspect, maxWidth: width * 0.95, tintColor: theme.colors.muted }} resizeMode="contain" />
        <Text style={{ fontSize: 14, color: theme.colors.muted, marginTop: 8, textAlign: 'center' }}>Study the Bible with guided conversations</Text>
      </View>
      <View style={{ gap: 10, width: '86%' }}>
        <TouchableOpacity onPress={() => navigation.navigate('ChatNew')} style={{ minHeight: 44, paddingVertical: 10, backgroundColor: theme.colors.primary, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
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
        }} style={{ minHeight: 44, paddingVertical: 10, backgroundColor: theme.colors.primary, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontWeight: '900', fontSize: 16, color: theme.colors.primaryText }}>Start a Roundtable</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Studies')} style={{ minHeight: 44, paddingVertical: 10, backgroundColor: theme.colors.primary, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontWeight: '900', fontSize: 16, color: theme.colors.primaryText }}>Browse Bible Studies</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('My Walk')} style={{ minHeight: 44, paddingVertical: 10, backgroundColor: theme.colors.primary, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontWeight: '900', fontSize: 16, color: theme.colors.primaryText }}>My Walk</Text>
        </TouchableOpacity>
      </View>
      <StatusBar style="light" />
    </SafeAreaView>
  );
}

// Placeholder tabs for Chat and My Walk (will implement screens next)
function Empty() { return null; }

function AppInner() {
  const { user, loading } = useAuth();
  if (loading) return null;
  const authed = !!user;
  return (
    <NavigationContainer theme={{
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
        {!authed ? (
          <Stack.Screen name="Login" component={Login} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="StudyDetail" component={StudyDetail} options={{ headerShown: true, header: () => <BrandHeader /> }} />
            <Stack.Screen name="RoundtableSetup" component={RoundtableSetup} options={{ headerShown: true, header: () => <BrandHeader /> }} />
            <Stack.Screen name="RoundtableChat" component={RoundtableChat} options={{ headerShown: true, header: () => <BrandHeader /> }} />
            <Stack.Screen name="ChatNew" component={ChatNew} options={{ headerShown: true, header: () => <BrandHeader /> }} />
            <Stack.Screen name="ChatDetail" component={ChatDetail} options={{ headerShown: true, header: () => <BrandHeader /> }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function MainTabs() {
  return (
    <Tabs.Navigator screenOptions={{
      header: () => <BrandHeader />,
      tabBarStyle: { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border },
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.muted,
    }}>
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen name="Chat" component={ChatNew} />
      <Tabs.Screen name="Studies" component={StudiesList} />
      <Tabs.Screen name="My Walk" component={MyWalk} />
      <Tabs.Screen name="Profile" component={Profile} />
    </Tabs.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
