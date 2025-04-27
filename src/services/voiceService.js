import Voice from '@react-native-community/voice';
import { Platform } from 'react-native';

// Initialize voice recognition
export const initVoiceRecognition = () => {
  Voice.onSpeechStart = () => console.log('Speech started');
  Voice.onSpeechEnd = () => console.log('Speech ended');
  Voice.onSpeechError = (error) => console.error('Speech error:', error);
};

// Clean up voice recognition
export const destroyVoiceRecognition = () => {
  Voice.destroy().then(Voice.removeAllListeners);
};

// Start voice recognition
export const startVoiceRecognition = async (locale = 'en-US') => {
  try {
    await Voice.start(locale);
    return true;
  } catch (error) {
    console.error('Error starting voice recognition:', error);
    return false;
  }
};

// Stop voice recognition
export const stopVoiceRecognition = async () => {
  try {
    await Voice.stop();
    return true;
  } catch (error) {
    console.error('Error stopping voice recognition:', error);
    return false;
  }
};

// Cancel voice recognition
export const cancelVoiceRecognition = async () => {
  try {
    await Voice.cancel();
    return true;
  } catch (error) {
    console.error('Error canceling voice recognition:', error);
    return false;
  }
};

// Check if voice recognition is available
export const isVoiceRecognitionAvailable = async () => {
  try {
    const isAvailable = await Voice.isAvailable();
    return isAvailable;
  } catch (error) {
    console.error('Error checking voice recognition availability:', error);
    return false;
  }
};

// Get supported voice recognition locales
export const getSupportedVoiceLocales = async () => {
  try {
    if (Platform.OS === 'android') {
      const locales = await Voice.getSpeechRecognitionServices();
      return locales;
    }
    return ['en-US']; // iOS doesn't provide a way to get supported locales
  } catch (error) {
    console.error('Error getting supported voice locales:', error);
    return ['en-US'];
  }
};
