import React, { createContext, useState, useEffect, useContext } from 'react';
import { getUserProfile, saveUserProfile } from '../services/storageService';
import { DEFAULT_USER_PROFILE } from '../utils/constants';

// Create context
const UserContext = createContext();

// Provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(DEFAULT_USER_PROFILE);
  const [isLoading, setIsLoading] = useState(true);

  // Load user profile on mount
  useEffect(() => {
    loadUserProfile();
  }, []);

  // Load user profile from storage
  const loadUserProfile = async () => {
    setIsLoading(true);
    try {
      const profile = await getUserProfile();
      setUser(profile);
    } catch (error) {
      console.error('Failed to load user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update user profile
  const updateUserProfile = async (profileData) => {
    try {
      const updatedProfile = { ...user, ...profileData };
      const success = await saveUserProfile(updatedProfile);
      if (success) {
        setUser(updatedProfile);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update user profile:', error);
      return false;
    }
  };

  // Context value
  const value = {
    user,
    isLoading,
    updateUserProfile,
    refreshUserProfile: loadUserProfile,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the user context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
