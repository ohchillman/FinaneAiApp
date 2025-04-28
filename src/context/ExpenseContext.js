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
  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [dateRangeFilter, setDateRangeFilter] = useState('Last 30 Days'); // New state for date range
  const [sortCriteria, setSortCriteria] = useState('Date'); // New state for sorting

  // Load expenses from storage on mount
  useEffect(() => {
    loadExpenses();
  }, []);
  
  // Load test data when debug mode changes
  useEffect(() => {
    console.log('Debug mode changed:', isDebugMode);
    if (isDebugMode) {
      console.log('Loading test data...');
      loadTestData();
    } else {
      console.log('Loading regular expenses...');
      loadExpenses();
    }
  }, [isDebugMode]);

  // Apply filters and sorting whenever relevant state changes
  useEffect(() => {
    applyFiltersAndSort();
  }, [expenses, dateRangeFilter, categoryFilter, searchFilter, sortCriteria]);

  // Load expenses from storage
  const loadExpenses = async () => {
    setIsLoading(true);
    try {
      const storedExpenses = await getExpenses();
      if (storedExpenses) {
        // Ensure dates are Date objects for proper comparison
        const parsedExpenses = storedExpenses.map(exp => ({...exp, date: new Date(exp.date)}));
        setExpenses(parsedExpenses);
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
      const testExpenses = generateTestExpenses().map(exp => ({...exp, date: new Date(exp.date)}));
      await saveExpenses(testExpenses);
      setExpenses(testExpenses);
      console.log('Debug mode: Loaded test data with', testExpenses.length, 'expenses');
    } catch (error) {
      console.error('Error loading test data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Apply all active filters and sorting
  const applyFiltersAndSort = () => {
    let result = [...expenses];
    
    // Apply date range filter
    result = filterByDateRange(result, dateRangeFilter);
    
    // Apply category filter if set
    if (categoryFilter && categoryFilter !== 'All Categories') {
      result = result.filter(expense => expense.category === categoryFilter);
    }
    
    // Apply search filter if set
    if (searchFilter) {
      const searchLower = searchFilter.toLowerCase();
      result = result.filter(expense => 
        (expense.description && expense.description.toLowerCase().includes(searchLower)) ||
        (expense.category && expense.category.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply sorting
    result = sortExpensesList(result, sortCriteria);
    
    setFilteredExpenses(result);
  };

  // Filter expenses by selected date range
  const filterByDateRange = (expenseList, range) => {
    const now = new Date();
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0); // Start from beginning of the day

    switch (range) {
      case 'Last 7 Days':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'Last 30 Days':
        startDate.setDate(now.getDate() - 30);
        break;
      case 'Last 90 Days':
        startDate.setDate(now.getDate() - 90);
        break;
      case 'This Year':
        startDate.setFullYear(now.getFullYear(), 0, 1); // January 1st of current year
        break;
      default:
        // Default to Last 30 Days if range is unrecognized
        startDate.setDate(now.getDate() - 30); 
    }
    
    // Ensure expense.date is a Date object before comparison
    return expenseList.filter(expense => expense.date instanceof Date && expense.date >= startDate);
  };

  // Sort expenses list based on criteria
  const sortExpensesList = (expenseList, criteria) => {
    const sortedList = [...expenseList];
    switch (criteria) {
      case 'Date':
        sortedList.sort((a, b) => b.date - a.date); // Newest first
        break;
      case 'Amount':
        sortedList.sort((a, b) => parseFloat(b.amount || 0) - parseFloat(a.amount || 0)); // Highest first
        break;
      case 'Category':
        sortedList.sort((a, b) => a.category.localeCompare(b.category)); // Alphabetical
        break;
      case 'Name': // Assuming 'description' is the name
        sortedList.sort((a, b) => a.description.localeCompare(b.description)); // Alphabetical
        break;
      default:
        sortedList.sort((a, b) => b.date - a.date); // Default to Date
    }
    return sortedList;
  };

  // Add new expense
  const addExpense = async (expense) => {
    const newExpense = {
      id: generateUniqueId(),
      date: new Date(), // Store as Date object
      ...expense,
      amount: parseFloat(expense.amount || 0) // Ensure amount is number
    };
    
    const updatedExpenses = [...expenses, newExpense];
    // Save with date converted to ISO string for storage
    const expensesToSave = updatedExpenses.map(exp => ({...exp, date: exp.date.toISOString()}));
    setExpenses(updatedExpenses);
    
    try {
      await saveExpenses(expensesToSave);
    } catch (error) {
      console.error('Error saving expense:', error);
    }
  };

  // Update existing expense
  const updateExpense = async (id, updatedData) => {
    const updatedExpenses = expenses.map(expense => 
      expense.id === id ? { 
        ...expense, 
        ...updatedData, 
        date: updatedData.date ? new Date(updatedData.date) : expense.date, // Ensure date is Date object
        amount: updatedData.amount ? parseFloat(updatedData.amount) : expense.amount // Ensure amount is number
      } : expense
    );
    
    const expensesToSave = updatedExpenses.map(exp => ({...exp, date: exp.date.toISOString()}));
    setExpenses(updatedExpenses);
    
    try {
      await saveExpenses(expensesToSave);
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  // Delete expense
  const deleteExpense = async (id) => {
    const updatedExpenses = expenses.filter(expense => expense.id !== id);
    const expensesToSave = updatedExpenses.map(exp => ({...exp, date: exp.date.toISOString()}));
    setExpenses(updatedExpenses);
    
    try {
      await saveExpenses(expensesToSave);
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  // Change selected date range filter
  const changeDateRangeFilter = (range) => {
    setDateRangeFilter(range);
  };

  // Change selected sort criteria
  const changeSortCriteria = (criteria) => {
    setSortCriteria(criteria);
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

  // Force refresh expenses when debug mode changes
  const refreshExpensesWithDebugCheck = async () => {
    console.log('Force refreshing expenses, debug mode:', isDebugMode);
    if (isDebugMode) {
      await loadTestData();
    } else {
      await loadExpenses();
    }
  };

  // Refresh expenses
  const refreshExpenses = () => {
    refreshExpensesWithDebugCheck();
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        filteredExpenses,
        dateRangeFilter, // Expose current date range
        sortCriteria, // Expose current sort criteria
        isLoading,
        totalAmount,
        addExpense,
        updateExpense,
        deleteExpense,
        changeDateRangeFilter, // Expose function to change date range
        changeSortCriteria, // Expose function to change sort criteria
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

