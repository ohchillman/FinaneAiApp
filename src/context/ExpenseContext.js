import React, { createContext, useState, useEffect, useContext } from 'react';
import { getExpenses, addExpense, updateExpense, deleteExpense } from '../services/storageService';
import { filterExpensesByPeriod, calculateTotalExpenses } from '../utils/helpers';
import { TIME_PERIODS } from '../utils/constants';

// Create context
const ExpenseContext = createContext();

// Provider component
export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(TIME_PERIODS.DAY);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  // Load expenses on mount
  useEffect(() => {
    loadExpenses();
  }, []);

  // Update filtered expenses when period or expenses change
  useEffect(() => {
    const filtered = filterExpensesByPeriod(expenses, selectedPeriod);
    setFilteredExpenses(filtered);
    setTotalAmount(calculateTotalExpenses(filtered));
  }, [expenses, selectedPeriod]);

  // Load expenses from storage
  const loadExpenses = async () => {
    setIsLoading(true);
    try {
      const storedExpenses = await getExpenses();
      setExpenses(storedExpenses);
    } catch (error) {
      console.error('Failed to load expenses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add new expense
  const createExpense = async (expenseData) => {
    try {
      const newExpense = await addExpense(expenseData);
      if (newExpense) {
        setExpenses(prevExpenses => [newExpense, ...prevExpenses]);
        return newExpense;
      }
      return null;
    } catch (error) {
      console.error('Failed to create expense:', error);
      return null;
    }
  };

  // Update existing expense
  const editExpense = async (expenseData) => {
    try {
      const success = await updateExpense(expenseData);
      if (success) {
        setExpenses(prevExpenses =>
          prevExpenses.map(expense =>
            expense.id === expenseData.id ? expenseData : expense
          )
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update expense:', error);
      return false;
    }
  };

  // Delete expense
  const removeExpense = async (expenseId) => {
    try {
      const success = await deleteExpense(expenseId);
      if (success) {
        setExpenses(prevExpenses =>
          prevExpenses.filter(expense => expense.id !== expenseId)
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to delete expense:', error);
      return false;
    }
  };

  // Change selected period
  const changePeriod = (period) => {
    setSelectedPeriod(period);
  };

  // Refresh expenses
  const refreshExpenses = () => {
    loadExpenses();
  };

  // Context value
  const value = {
    expenses,
    filteredExpenses,
    totalAmount,
    selectedPeriod,
    isLoading,
    createExpense,
    editExpense,
    removeExpense,
    changePeriod,
    refreshExpenses,
  };

  return (
    <ExpenseContext.Provider value={value}>
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
