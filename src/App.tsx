import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AuthScreen from './screens/AuthScreen';
import GalleryScreen from './screens/GalleryScreen';
import AddScreen from './screens/AddScreen';
import SettingsScreen from './screens/SettingsScreen';

import { AuthProvider } from './providers/AuthProvider';
import { ThemeProvider, useThemeMode } from './providers/ThemeProvider';

export type RootStackParamList = {
  Auth: undefined;
  Gallery: undefined;
  Add: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  const { navTheme } = useThemeMode();

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator>
        <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Gallery" component={GalleryScreen} options={{ title: 'My Gallery' }} />
        <Stack.Screen name="Add" component={AddScreen} options={{ title: 'Add Photo' }} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <RootNavigator />
      </ThemeProvider>
    </AuthProvider>
  );
}