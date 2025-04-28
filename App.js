import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { ExpenseProvider } from './src/context/ExpenseContext';
import { UserProvider } from './src/context/UserContext';
import { AIProvider } from './src/context/AIContext';
import { VoiceProvider } from './src/context/VoiceContext';
import { LogBox } from 'react-native';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Reanimated 2',
  'Failed prop type',
  'VirtualizedLists should never be nested',
  // Ignore voice module errors
  'native module',
  'Native module cannot be null',
  'Module @react-native-community/voice requires',
]);

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <UserProvider>
        <ExpenseProvider>
          <AIProvider>
            <VoiceProvider>
              <AppNavigator />
            </VoiceProvider>
          </AIProvider>
        </ExpenseProvider>
      </UserProvider>
    </SafeAreaProvider>
  );
}
