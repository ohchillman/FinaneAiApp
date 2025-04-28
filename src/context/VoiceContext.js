import React, { createContext, useState, useContext } from 'react';
import { Alert } from 'react-native';

// Create context
const VoiceContext = createContext();

// Provider component
export const VoiceProvider = ({ children }) => {
  const [isListening, setIsListening] = useState(false);
  const [speechResults, setSpeechResults] = useState([]);
  const [isAvailable, setIsAvailable] = useState(false);
  const [error, setError] = useState(null);

  // Mock implementation for Expo Go compatibility
  const startListening = async () => {
    setIsListening(true);
    // Simulate voice recognition after a delay
    setTimeout(() => {
      setSpeechResults(['Spent $25 on lunch at restaurant']);
      setIsListening(false);
    }, 2000);
    return true;
  };

  // Stop listening
  const stopListening = async () => {
    setIsListening(false);
    return true;
  };

  // Cancel listening
  const cancelListening = async () => {
    setIsListening(false);
    return true;
  };

  // Get the most recent speech result
  const getLatestResult = () => {
    return speechResults && speechResults.length > 0 ? speechResults[0] : '';
  };

  // Context value
  const value = {
    isListening,
    isAvailable: true, // Set to true for testing
    speechResults,
    error,
    startListening,
    stopListening,
    cancelListening,
    getLatestResult,
  };

  return (
    <VoiceContext.Provider value={value}>
      {children}
    </VoiceContext.Provider>
  );
};

// Custom hook to use the voice context
export const useVoice = () => {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
};
