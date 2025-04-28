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
  // dateRangeFilter can now be a string ('Last 30 Days') or an object ({ type: 'custom', startDate, endDate })
  const [dateRangeFilter, setDateRangeFilter] = useState('Last 30 Days'); 
  const [sortCriteria, setSortCriteria] = useState('Date');

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

  // Filter expenses by selected date range (string or custom object)
  const filterByDateRange = (expenseList, range) => {
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date(now); // Default end date is today
    endDate.setHours(23, 59, 59, 999); // Set to end of the day

    if (typeof range === 'object' && range?.type === 'custom') {
      // Handle custom range object
      startDate = new Date(range.startDate);
      startDate.setHours(0, 0, 0, 0); // Start of the selected start day
      endDate = new Date(range.endDate);
      endDate.setHours(23, 59, 59, 999); // End of the selected end day
    } else if (typeof range === 'string') {
      // Handle predefined string ranges
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
          // Default to Last 30 Days if range string is unrecognized
          startDate.setDate(now.getDate() - 30); 
      }
    } else {
      // Fallback if range is neither object nor string (shouldn't happen)
      startDate.setDate(now.getDate() - 30); 
    }
    
    // Ensure expense.date is a Date object before comparison
    return expenseList.filter(expense => {
      const expenseDate = expense.date instanceof Date ? expense.date : new Date(0);
      return expenseDate >= startDate && expenseDate <= endDate;
    });
  };

  // Sort expenses list based on criteria
  const sortExpensesList = (expenseList, criteria) => {
    const sortedList = [...expenseList];
    
    // Helper function to safely get a string value for comparison
    const getSafeString = (value) => {
      if (value === null || value === undefined) return '';
      return String(value).toLowerCase();
    };
    
    // Helper function to safely get a number value for comparison
    const getSafeNumber = (value) => {
      if (value === null || value === undefined) return 0;
      const num = parseFloat(value);
      return isNaN(num) ? 0 : num;
    };
    
    switch (criteria) {
      case 'Date':
        // Sort by date, newest first
        sortedList.sort((a, b) => {
          // Ensure both dates are valid Date objects
          const dateA = a.date instanceof Date ? a.date : new Date(0);
          const dateB = b.date instanceof Date ? b.date : new Date(0);
          return dateB - dateA;
        });
        break;
        
      case 'Amount':
        // Sort by amount, highest first
        sortedList.sort((a, b) => {
          return getSafeNumber(b.amount) - getSafeNumber(a.amount);
        });
        break;
        
      case 'Category':
        // Sort by category alphabetically
        sortedList.sort((a, b) => {
          const categoryA = getSafeString(a.category);
          const categoryB = getSafeString(b.category);
          return categoryA.localeCompare(categoryB);
        });
        break;
        
      case 'Name':
        // Sort by name (description or title) alphabetically
        sortedList.sort((a, b) => {
          // Try to use description first, then title, then fallback to empty string
          const nameA = getSafeString(a.description || a.title || a.name);
          const nameB = getSafeString(b.description || b.title || b.name);
          return nameA.localeCompare(nameB);
        });
        break;
        
      default:
        // Default to date sorting if criteria is unrecognized
        sortedList.sort((a, b) => {
          const dateA = a.date instanceof Date ? a.date : new Date(0);
          const dateB = b.date instanceof Date ? b.date : new Date(0);
          return dateB - dateA;
        });
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

  // Change selected date range filter (accepts string or object)
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
        dateRangeFilter, // Expose current date range (string or object)
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
