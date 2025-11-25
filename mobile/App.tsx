import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import RoundtableSetup from './src/screens/RoundtableSetup';
import RoundtableChat from './src/screens/RoundtableChat';

const Stack = createNativeStackNavigator();

function HomeScreen({ navigation }: any) {
  return (
    <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 22, marginBottom: 16 }}>FaithTalkAI</Text>
      <TouchableOpacity onPress={() => navigation.navigate('RoundtableSetup')} style={{ padding: 12, backgroundColor: '#facc15', borderRadius: 8 }}>
        <Text style={{ fontWeight: '600' }}>Start a Roundtable</Text>
      </TouchableOpacity>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="RoundtableSetup" component={RoundtableSetup} options={{ title: 'Roundtable Setup' }} />
        <Stack.Screen name="RoundtableChat" component={RoundtableChat} options={{ title: 'Roundtable' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
