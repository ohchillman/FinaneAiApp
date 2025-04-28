// This file contains mock implementations for Expo Go compatibility
// The actual voice recognition functionality is disabled

export const initVoiceRecognition = () => {
  console.log('Mock voice recognition initialized');
};

export const destroyVoiceRecognition = () => {
  console.log('Mock voice recognition destroyed');
};

export const startVoiceRecognition = async (locale = 'en-US') => {
  console.log('Mock voice recognition started');
  return true;
};

export const stopVoiceRecognition = async () => {
  console.log('Mock voice recognition stopped');
  return true;
};

export const cancelVoiceRecognition = async () => {
  console.log('Mock voice recognition canceled');
  return true;
};

export const isVoiceRecognitionAvailable = async () => {
  // Return true for testing purposes
  return true;
};

export const getSupportedVoiceLocales = async () => {
  return ['en-US'];
};
