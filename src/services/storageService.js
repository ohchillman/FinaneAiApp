import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, DEFAULT_USER_PROFILE } from '../utils/constants';

// Save expenses to AsyncStorage
export const saveExpenses = async (expenses) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    return true;
  } catch (error) {
    console.error('Error saving expenses:', error);
    return false;
  }
};

// Get expenses from AsyncStorage
export const getExpenses = async () => {
  try {
    const expensesJson = await AsyncStorage.getItem(STORAGE_KEYS.EXPENSES);
    return expensesJson ? JSON.parse(expensesJson) : [];
  } catch (error) {
    console.error('Error getting expenses:', error);
    return [];
  }
};

// Add a new expense
export const addExpense = async (expense) => {
  try {
    const expenses = await getExpenses();
    const newExpense = {
      ...expense,
      id: Date.now().toString(), // Generate unique ID
      date: expense.date || new Date().toISOString(), // Use current date if not provided
    };
    
    const updatedExpenses = [newExpense, ...expenses];
    await saveExpenses(updatedExpenses);
    return newExpense;
  } catch (error) {
    console.error('Error adding expense:', error);
    return null;
  }
};

// Update an existing expense
export const updateExpense = async (updatedExpense) => {
  try {
    const expenses = await getExpenses();
    const index = expenses.findIndex(expense => expense.id === updatedExpense.id);
    
    if (index !== -1) {
      expenses[index] = updatedExpense;
      await saveExpenses(expenses);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error updating expense:', error);
    return false;
  }
};

// Delete an expense
export const deleteExpense = async (expenseId) => {
  try {
    const expenses = await getExpenses();
    const updatedExpenses = expenses.filter(expense => expense.id !== expenseId);
    
    await saveExpenses(updatedExpenses);
    return true;
  } catch (error) {
    console.error('Error deleting expense:', error);
    return false;
  }
};

// Save user profile to AsyncStorage
export const saveUserProfile = async (profile) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    return true;
  } catch (error) {
    console.error('Error saving user profile:', error);
    return false;
  }
};

// Get user profile from AsyncStorage
export const getUserProfile = async () => {
  try {
    const profileJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return profileJson ? JSON.parse(profileJson) : DEFAULT_USER_PROFILE;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return DEFAULT_USER_PROFILE;
  }
};

// Save app settings to AsyncStorage
export const saveSettings = async (settings) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
};

// Get app settings from AsyncStorage
export const getSettings = async () => {
  try {
    const settingsJson = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    return settingsJson ? JSON.parse(settingsJson) : {};
  } catch (error) {
    console.error('Error getting settings:', error);
    return {};
  }
};

// Clear all app data (for logout or reset)
export const clearAllData = async () => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.EXPENSES,
      STORAGE_KEYS.USER_PROFILE,
      STORAGE_KEYS.SETTINGS,
    ]);
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
};
