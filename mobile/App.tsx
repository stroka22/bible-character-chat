import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import RoundtableSetup from './src/screens/RoundtableSetup';
import RoundtableChat from './src/screens/RoundtableChat';
import StudiesList from './src/screens/StudiesList';
import StudyDetail from './src/screens/StudyDetail';
import Login from './src/screens/Login';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

const Stack = createNativeStackNavigator();

function HomeScreen({ navigation }: any) {
  return (
    <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 22, marginBottom: 16 }}>FaithTalkAI</Text>
      <View style={{ gap: 12, width: '80%' }}>
        <TouchableOpacity onPress={() => navigation.navigate('RoundtableSetup')} style={{ padding: 12, backgroundColor: '#facc15', borderRadius: 8, alignItems: 'center' }}>
          <Text style={{ fontWeight: '600' }}>Start a Roundtable</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Studies')} style={{ padding: 12, backgroundColor: '#60a5fa', borderRadius: 8, alignItems: 'center' }}>
          <Text style={{ fontWeight: '600', color: 'white' }}>Browse Bible Studies</Text>
        </TouchableOpacity>
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

function AppInner() {
  const { user, loading } = useAuth();
  if (loading) return null;
  const authed = !!user;
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!authed ? (
          <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Studies" component={StudiesList} />
            <Stack.Screen name="StudyDetail" component={StudyDetail} options={({ route }: any) => ({ title: route.params?.title || 'Study' })} />
            <Stack.Screen name="RoundtableSetup" component={RoundtableSetup} options={{ title: 'Roundtable Setup' }} />
            <Stack.Screen name="RoundtableChat" component={RoundtableChat} options={{ title: 'Roundtable' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
