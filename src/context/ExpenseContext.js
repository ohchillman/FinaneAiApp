import React, { createContext, useState, useContext, useEffect } from 'react';
import { getExpenses, saveExpenses } from '../services/storageService';
import { generateUniqueId, generateTestExpenses } from '../utils/helpers';
import { useUser } from './UserContext';

// Create context
const ExpenseContext = createContext();

// Provider component
export const ExpenseProvider = ({ children }) => {
  const { isDebugMode } = useUser();
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('Month');
  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');

  // Load expenses from storage on mount
  useEffect(() => {
    loadExpenses();
  }, []);
  
  // Load test data when debug mode changes
  useEffect(() => {
    if (isDebugMode) {
      loadTestData();
    } else {
      loadExpenses();
    }
  }, [isDebugMode]);

  // Apply filters whenever expenses, period, category, or search changes
  useEffect(() => {
    applyFilters();
  }, [expenses, selectedPeriod, categoryFilter, searchFilter]);

  // Load expenses from storage
  const loadExpenses = async () => {
    setIsLoading(true);
    try {
      const storedExpenses = await getExpenses();
      if (storedExpenses) {
        setExpenses(storedExpenses);
      }
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load test data for debug mode
  const loadTestData = async () => {
    setIsLoading(true);
    try {
      // Generate test expenses
      const testExpenses = generateTestExpenses();
      
      // Save to storage for persistence
      await saveExpenses(testExpenses);
      
      // Update state
      setExpenses(testExpenses);
      console.log('Debug mode: Loaded test data with', testExpenses.length, 'expenses');
    } catch (error) {
      console.error('Error loading test data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Apply all active filters
  const applyFilters = () => {
    let result = [...expenses];
    
    // Apply period filter
    result = filterByPeriod(result, selectedPeriod);
    
    // Apply category filter if set
    if (categoryFilter) {
      result = result.filter(expense => expense.category === categoryFilter);
    }
    
    // Apply search filter if set
    if (searchFilter) {
      const searchLower = searchFilter.toLowerCase();
      result = result.filter(expense => 
        expense.description.toLowerCase().includes(searchLower) ||
        expense.category.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort by date, newest first
    result.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    setFilteredExpenses(result);
  };

  // Filter expenses by period
  const filterByPeriod = (expenseList, period) => {
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'Day':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'Week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'Month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3M':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'Year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1); // Default to Month
    }
    
    return expenseList.filter(expense => new Date(expense.date) >= startDate);
  };

  // Add new expense
  const addExpense = async (expense) => {
    const newExpense = {
      id: generateUniqueId(),
      date: new Date().toISOString(),
      ...expense
    };
    
    const updatedExpenses = [...expenses, newExpense];
    setExpenses(updatedExpenses);
    
    try {
      await saveExpenses(updatedExpenses);
    } catch (error) {
      console.error('Error saving expense:', error);
    }
  };

  // Update existing expense
  const updateExpense = async (id, updatedData) => {
    const updatedExpenses = expenses.map(expense => 
      expense.id === id ? { ...expense, ...updatedData } : expense
    );
    
    setExpenses(updatedExpenses);
    
    try {
      await saveExpenses(updatedExpenses);
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  // Delete expense
  const deleteExpense = async (id) => {
    const updatedExpenses = expenses.filter(expense => expense.id !== id);
    setExpenses(updatedExpenses);
    
    try {
      await saveExpenses(updatedExpenses);
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  // Change selected period
  const changePeriod = (period) => {
    setSelectedPeriod(period);
  };

  // Filter expenses by category
  const filterExpensesByCategory = (category) => {
    setCategoryFilter(category);
  };

  // Filter expenses by search text
  const filterExpensesBySearch = (text) => {
    setSearchFilter(text);
  };

  // Calculate total amount for current filtered expenses
  const totalAmount = filteredExpenses.reduce(
    (sum, expense) => sum + parseFloat(expense.amount || 0), 
    0
  );

  // Refresh expenses
  const refreshExpenses = () => {
    loadExpenses();
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        filteredExpenses,
        selectedPeriod,
        isLoading,
        totalAmount,
        addExpense,
        updateExpense,
        deleteExpense,
        changePeriod,
        refreshExpenses,
        filterExpensesByCategory,
        filterExpensesBySearch
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

// Custom hook to use the expense context
export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};
