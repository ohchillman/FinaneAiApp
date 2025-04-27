import React, { createContext, useState, useEffect, useContext } from 'react';
import { Alert } from 'react-native';
import Voice from '@react-native-community/voice';
import { 
  initVoiceRecognition, 
  destroyVoiceRecognition,
  startVoiceRecognition,
  stopVoiceRecognition,
  cancelVoiceRecognition,
  isVoiceRecognitionAvailable
} from '../services/voiceService';

// Create context
const VoiceContext = createContext();

// Provider component
export const VoiceProvider = ({ children }) => {
  const [isListening, setIsListening] = useState(false);
  const [speechResults, setSpeechResults] = useState([]);
  const [isAvailable, setIsAvailable] = useState(false);
  const [error, setError] = useState(null);

  // Initialize voice recognition on mount
  useEffect(() => {
    const checkAvailability = async () => {
      const available = await isVoiceRecognitionAvailable();
      setIsAvailable(available);
    };

    // Set up voice recognition listeners
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;

    checkAvailability();

    // Clean up on unmount
    return () => {
      destroyVoiceRecognition();
    };
  }, []);

  // Speech recognition event handlers
  const onSpeechStart = () => {
    setIsListening(true);
    setError(null);
  };

  const onSpeechEnd = () => {
    setIsListening(false);
  };

  const onSpeechResults = (event) => {
    setSpeechResults(event.value);
  };

  const onSpeechError = (event) => {
    setIsListening(false);
    setError(event.error);
  };

  // Start listening
  const startListening = async () => {
    if (!isAvailable) {
      Alert.alert('Error', 'Voice recognition is not available on this device');
      return false;
    }

    setSpeechResults([]);
    setError(null);
    
    try {
      const started = await startVoiceRecognition();
      return started;
    } catch (error) {
      setError(error);
      return false;
    }
  };

  // Stop listening
  const stopListening = async () => {
    try {
      await stopVoiceRecognition();
      return true;
    } catch (error) {
      setError(error);
      return false;
    }
  };

  // Cancel listening
  const cancelListening = async () => {
    try {
      await cancelVoiceRecognition();
      setIsListening(false);
      return true;
    } catch (error) {
      setError(error);
      return false;
    }
  };

  // Get the most recent speech result
  const getLatestResult = () => {
    return speechResults && speechResults.length > 0 ? speechResults[0] : '';
  };

  // Context value
  const value = {
    isListening,
    isAvailable,
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
