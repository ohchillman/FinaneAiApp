import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  FlatList, 
  ActivityIndicator, 
  TextInput, 
  TouchableOpacity, 
  TouchableWithoutFeedback, 
  Keyboard, 
  Platform 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePickerModal from "react-native-modal-datetime-picker";

// Assuming theme object might exist elsewhere or defining fallback colors
const theme = {
  colors: {
    background: '#FFFFFF',
    primary: '#734F96',
    text: '#333333',
    textLight: '#888888',
    inputBackground: '#F0F0F0',
    border: '#D1D5DB',
    white: '#FFFFFF',
  },
  spacing: {
    sm: 8,
    md: 16,
    lg: 20,
    xl: 24,
  },
  typography: {
    fontSizes: {
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 28,
    },
    fontWeights: {
      regular: '400',
      medium: '500',
      bold: '700',
    },
  },
  shadows: {
    light: {
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.18,
      shadowRadius: 1.00,
      elevation: 1,
    },
    medium: {
       shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
    }
  }
};

import ExpenseItem from '../components/ExpenseItem';
import TimeFilter from '../components/TimeFilter';
import DropdownFilter from '../components/DropdownFilter'; // Updated component
import { useExpenses } from '../context/ExpenseContext';
import { useUser } from '../context/UserContext';
import { EXPENSE_CATEGORIES } from '../utils/constants';

const ExpensesScreen = ({ navigation }) => {
  const {
    filteredExpenses,
    isLoading,
    refreshExpenses,
    filterExpensesByCategory,
    filterExpensesBySearch,
    changeDateRangeFilter,
    changeSortCriteria,
    dateRangeFilter, // This might be a string or an object for custom range
    sortCriteria
  } = useExpenses();
  const { user } = useUser();
  const insets = useSafeAreaInsets();

  // State for filters
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedSort, setSelectedSort] = useState(sortCriteria || 'Date');
  const [searchText, setSearchText] = useState('');
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  // State for custom date range picker
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState('start'); // 'start' or 'end'
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);
  const [datePickerTitle, setDatePickerTitle] = useState('Select Start Date');

  // Determine the display value for the Period dropdown
  const getPeriodDisplayValue = () => {
    if (typeof dateRangeFilter === 'object' && dateRangeFilter?.type === 'custom') {
      const start = dateRangeFilter.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const end = dateRangeFilter.endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `${start} - ${end}`;
    }
    return dateRangeFilter || 'Last 30 Days'; // Fallback to string value
  };

  const [selectedPeriodDisplay, setSelectedPeriodDisplay] = useState(getPeriodDisplayValue());

  // Sync local state with context when context values change
  useEffect(() => {
    setSelectedPeriodDisplay(getPeriodDisplayValue());
  }, [dateRangeFilter]);

  useEffect(() => {
    setSelectedSort(sortCriteria || 'Date');
  }, [sortCriteria]);

  // Options for dropdowns - Add 'Custom Range'
  const categoryOptions = ['All Categories', ...EXPENSE_CATEGORIES.map(cat => cat.name)];
  const periodOptions = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'This Year', 'Custom Range'];
  const sortOptions = ["Date", "Amount", "Category", "Name"];

  // Handle category change
  const handleCategoryChange = (newCategory) => {
    setSelectedCategory(newCategory);
    filterExpensesByCategory(newCategory === 'All Categories' ? null : newCategory);
  };

  // Handle date range change
  const handleDateRangeChange = (newRange) => {
    if (newRange === 'Custom Range') {
      // Reset dates and open start date picker
      setCustomStartDate(null);
      setCustomEndDate(null);
      setDatePickerMode('start');
      setDatePickerTitle('Select Start Date');
      setDatePickerVisibility(true);
    } else {
      // For predefined ranges, update context directly
      changeDateRangeFilter(newRange);
    }
  };

  // Handle sort change
  const handleSortChange = (newSort) => {
    setSelectedSort(newSort);
    changeSortCriteria(newSort);
  };

  // Handle search text change
  const handleSearchChange = (text) => {
    setSearchText(text);
    filterExpensesBySearch(text);
  };

  // Function to close all dropdowns
  const closeAllDropdowns = () => {
    setActiveDropdownId(null);
    Keyboard.dismiss();
  };

  // --- Date Picker Modal Handlers ---
  const showDatePicker = (mode) => {
    setDatePickerMode(mode);
    setDatePickerTitle(mode === 'start' ? 'Select Start Date' : 'Select End Date');
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirmDate = (date) => {
    hideDatePicker();
    if (datePickerMode === 'start') {
      setCustomStartDate(date);
      // Automatically open end date picker after selecting start date
      setTimeout(() => {
        setDatePickerMode('end');
        setDatePickerTitle('Select End Date');
        setDatePickerVisibility(true);
      }, Platform.OS === 'ios' ? 500 : 0); // Delay needed for iOS modal transition
    } else {
      setCustomEndDate(date);
      // Ensure start date is set before applying
      if (customStartDate) {
        // Ensure end date is not before start date
        const finalEndDate = date < customStartDate ? customStartDate : date;
        // Apply custom range filter
        changeDateRangeFilter({ 
          type: 'custom', 
          startDate: customStartDate, 
          endDate: finalEndDate 
        });
      }
    }
  };
  // --- End Date Picker Modal Handlers ---

  return (
    <TouchableWithoutFeedback onPress={closeAllDropdowns}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Expenses</Text>
        </View>

        {/* Dropdown Filters */}
        <View style={styles.filterContainer}>
          {/* Row 1: Category & Period */}
          <View style={styles.filterRow}>
            <DropdownFilter
              id="category-filter"
              label="Category"
              value={selectedCategory}
              options={categoryOptions}
              onSelect={handleCategoryChange}
              style={[styles.filterItem, styles.filterItemFlex]}
              activeDropdownId={activeDropdownId}
              setActiveDropdownId={setActiveDropdownId}
            />
            <DropdownFilter
              id="period-filter"
              label="Period"
              value={selectedPeriodDisplay} // Use display value
              options={periodOptions}
              onSelect={handleDateRangeChange}
              style={[styles.filterItem, styles.filterItemFlex, { marginRight: 0 }]}
              activeDropdownId={activeDropdownId}
              setActiveDropdownId={setActiveDropdownId}
            />
          </View>
          {/* Row 2: Sort By */}
          <View style={styles.filterRow}>
             <DropdownFilter
              id="sort-filter"
              label="Sort By"
              value={selectedSort}
              options={sortOptions}
              onSelect={handleSortChange}
              style={[styles.filterItem, styles.filterItemThird, { marginRight: 0 }]}
              activeDropdownId={activeDropdownId}
              setActiveDropdownId={setActiveDropdownId}
            />
          </View>
        </View>

        {/* Expense List */}
        {isLoading ? (
          <ActivityIndicator style={styles.loader} size="large" color={theme.colors.primary} />
        ) : (
          <FlatList
            data={filteredExpenses}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ExpenseItem
                item={item}
                currency={user?.currency || '$'}
                onPress={() => navigation.navigate('Add', { expense: item })}
              />
            )}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={<Text style={styles.emptyText}>No expenses found.</Text>}
            onRefresh={refreshExpenses}
            refreshing={isLoading}
            keyboardShouldPersistTaps="handled"
          />
        )}

        {/* Date Picker Modal */}
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirmDate}
          onCancel={hideDatePicker}
          date={datePickerMode === 'start' 
            ? (customStartDate || new Date()) 
            : (customEndDate || customStartDate || new Date())
          }
          maximumDate={datePickerMode === 'start' ? undefined : new Date()} // End date can't be in future
          minimumDate={datePickerMode === 'end' ? customStartDate : undefined} // End date must be after start
          headerTextIOS={datePickerTitle}
          confirmTextIOS="Confirm"
          cancelTextIOS="Cancel"
          customHeaderIOS={() => (
            <View style={styles.datePickerHeader}>
              <Text style={styles.datePickerTitle}>{datePickerTitle}</Text>
            </View>
          )}
          customCancelButtonIOS={({ onPress }) => (
            <TouchableOpacity 
              style={[styles.datePickerButton, styles.datePickerCancelButton]} 
              onPress={onPress}
            >
              <Text style={styles.datePickerButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
          customConfirmButtonIOS={({ onPress }) => (
            <TouchableOpacity 
              style={[styles.datePickerButton, styles.datePickerConfirmButton]} 
              onPress={onPress}
            >
              <Text style={[styles.datePickerButtonText, styles.datePickerConfirmText]}>Confirm</Text>
            </TouchableOpacity>
          )}
        />

      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: Platform.OS === 'android' ? theme.spacing.xl : theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: theme.typography.fontWeights.bold,
    color: '#000000',
  },
  settingsIcon: {
    padding: theme.spacing.sm,
  },
  filterContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    zIndex: 10, 
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  filterItem: {
    marginRight: theme.spacing.sm,
  },
  filterItemFlex: {
    flex: 1,
  },
  filterItemThird: {
     flexGrow: 0.6,
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  searchInput: {
    backgroundColor: theme.colors.inputBackground,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textLight,
  },
  // Date Picker Styles
  datePickerHeader: {
    backgroundColor: '#EDE8F2',
    paddingVertical: 15,
    alignItems: 'center',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#734F96',
  },
  datePickerButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 10,
    marginVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePickerCancelButton: {
    backgroundColor: '#F0F0F0',
  },
  datePickerConfirmButton: {
    backgroundColor: '#EDE8F2',
  },
  datePickerButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  datePickerConfirmText: {
    color: '#734F96',
    fontWeight: '600',
  },
});

export default ExpensesScreen;
