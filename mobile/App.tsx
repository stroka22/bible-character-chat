import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme, Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaView, Text, TouchableOpacity, View, Alert, Image } from 'react-native';
import ChatList from './src/screens/ChatList';
import ChatNew from './src/screens/ChatNew';
import ChatDetail from './src/screens/ChatDetail';
import MyWalk from './src/screens/MyWalk';
import RoundtableSetup from './src/screens/RoundtableSetup';
import RoundtableChat from './src/screens/RoundtableChat';
import { Linking } from 'react-native';
// useAuth imported below with AuthProvider
import { requirePremiumOrPrompt } from './src/lib/tier';
import StudiesList from './src/screens/StudiesList';
import StudyDetail from './src/screens/StudyDetail';
import Login from './src/screens/Login';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

const AppTheme: Theme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: '#0f172a',
    card: '#0b1220',
    text: '#e5e7eb',
    border: '#1f2937',
    primary: '#facc15',
    notification: '#facc15',
  },
};

function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  return (
    <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, backgroundColor: '#0f172a' }}>
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <Image
          source={{ uri: 'https://faithtalkai.com/downloads/logo-pack/favicons/favicon-180.png' }}
          style={{ width: 72, height: 72, borderRadius: 16, marginBottom: 8 }}
        />
        <Text style={{ fontSize: 22, fontWeight: '800', color: '#fde68a' }}>FaithTalkAI</Text>
      </View>
      <View style={{ gap: 12, width: '80%' }}>
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
        }} style={{ padding: 12, backgroundColor: '#facc15', borderRadius: 8, alignItems: 'center' }}>
          <Text style={{ fontWeight: '600', color: '#111827' }}>Start a Roundtable</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Studies')} style={{ padding: 12, backgroundColor: '#60a5fa', borderRadius: 8, alignItems: 'center' }}>
          <Text style={{ fontWeight: '600', color: 'white' }}>Browse Bible Studies</Text>
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
    <NavigationContainer theme={AppTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0f172a' },
          headerStyle: { backgroundColor: '#0b1220' },
          headerTintColor: '#e5e7eb',
        }}
      >
        {!authed ? (
          <Stack.Screen name="Login" component={Login} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="StudyDetail" component={StudyDetail} options={({ route }: any) => ({ headerShown: true, title: route.params?.title || 'Study' })} />
            <Stack.Screen name="RoundtableSetup" component={RoundtableSetup} options={{ headerShown: true, title: 'Roundtable Setup' }} />
            <Stack.Screen name="RoundtableChat" component={RoundtableChat} options={{ headerShown: true, title: 'Roundtable' }} />
            <Stack.Screen name="ChatNew" component={ChatNew} options={{ headerShown: true, title: 'New Chat' }} />
            <Stack.Screen name="ChatDetail" component={ChatDetail} options={{ headerShown: true, title: 'Chat' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#0b1220', borderTopColor: '#1f2937' },
        tabBarActiveTintColor: '#facc15',
        tabBarInactiveTintColor: '#9ca3af',
      }}
    >
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen name="Chat" component={ChatList} />
      <Tabs.Screen name="Studies" component={StudiesList} />
      <Tabs.Screen name="My Walk" component={MyWalk} />
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
