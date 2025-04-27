import React, { createContext, useState, useContext } from 'react';
import { Alert } from 'react-native';
import { recognizeExpenseFromText } from '../services/aiService';
import { getSettings, saveSettings } from '../services/storageService';

// Create context
const AIContext = createContext();

// Provider component
export const AIProvider = ({ children }) => {
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [apiKey, setApiKey] = useState('');
  
  // Load API key on mount
  React.useEffect(() => {
    loadApiKey();
  }, []);
  
  // Load API key from storage
  const loadApiKey = async () => {
    try {
      const settings = await getSettings();
      if (settings.openRouterApiKey) {
        setApiKey(settings.openRouterApiKey);
      }
    } catch (error) {
      console.error('Failed to load API key:', error);
    }
  };
  
  // Save API key to storage
  const saveApiKey = async (key) => {
    try {
      const settings = await getSettings();
      const updatedSettings = { ...settings, openRouterApiKey: key };
      await saveSettings(updatedSettings);
      setApiKey(key);
      return true;
    } catch (error) {
      console.error('Failed to save API key:', error);
      return false;
    }
  };
  
  // Recognize expense from text
  const recognizeExpense = async (text) => {
    if (!text) {
      Alert.alert('Error', 'Please enter an expense description');
      return null;
    }
    
    if (!apiKey) {
      Alert.alert('API Key Required', 'Please set your OpenRouter API key in settings');
      return null;
    }
    
    setIsRecognizing(true);
    
    try {
      const result = await recognizeExpenseFromText(text, apiKey);
      return result;
    } catch (error) {
      Alert.alert('Recognition Error', error.message || 'Failed to recognize expense');
      return null;
    } finally {
      setIsRecognizing(false);
    }
  };
  
  // Context value
  const value = {
    isRecognizing,
    apiKey,
    recognizeExpense,
    saveApiKey,
  };
  
  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
};

// Custom hook to use the AI context
export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};
