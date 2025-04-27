import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';
import { ExpenseProvider } from './context/ExpenseContext';
import { UserProvider } from './context/UserContext';
import { AIProvider } from './context/AIContext';
import { VoiceProvider } from './context/VoiceContext';
import { LogBox } from 'react-native';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Reanimated 2',
  'Failed prop type',
  'VirtualizedLists should never be nested',
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
