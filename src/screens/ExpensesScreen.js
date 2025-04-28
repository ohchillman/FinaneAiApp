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
  TouchableWithoutFeedback, // Import TouchableWithoutFeedback
  Keyboard, // Import Keyboard
  Platform // Import Platform for potential OS-specific adjustments
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
    selectedPeriod,
    changePeriod,
    isLoading,
    refreshExpenses,
    filterExpensesByCategory,
    filterExpensesBySearch,
    sortExpenses // Assuming a sort function exists or needs to be added
  } = useExpenses();
  const { user } = useUser();
  const insets = useSafeAreaInsets();

  // State for filters
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedDateRange, setSelectedDateRange] = useState('Last 30 Days');
  const [selectedSort, setSelectedSort] = useState('Date'); // Add state for sorting
  const [searchText, setSearchText] = useState('');
  const [activeDropdownId, setActiveDropdownId] = useState(null); // State to track open dropdown

  // Options for dropdowns
  const categoryOptions = ['All Categories', ...EXPENSE_CATEGORIES.map(cat => cat.name)];
  const periodOptions = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'This Year'];
  const sortOptions = ["Date", "Amount", "Category", "Name"];
  // Removed the "View" dropdown as it wasn't in the screenshot and seems redundant

  // Handle category change
  const handleCategoryChange = (newCategory) => {
    setSelectedCategory(newCategory);
    filterExpensesByCategory(newCategory === 'All Categories' ? null : newCategory);
    // Close dropdown handled by DropdownFilter component
  };

  // Handle date range change
  const handleDateRangeChange = (newRange) => {
    setSelectedDateRange(newRange);
    // TODO: Implement date range filtering logic in useExpenses hook
    console.log("Selected date range:", newRange); // Placeholder
  };

  // Handle sort change
  const handleSortChange = (newSort) => {
    setSelectedSort(newSort);
    // TODO: Implement sorting logic in useExpenses hook
    // sortExpenses(newSort); // Example call
    console.log("Selected sort:", newSort); // Placeholder
  };

  // Handle search text change
  const handleSearchChange = (text) => {
    setSearchText(text);
    filterExpensesBySearch(text);
  };

  // Function to close all dropdowns
  const closeAllDropdowns = () => {
    setActiveDropdownId(null);
    Keyboard.dismiss(); // Dismiss keyboard as well
  };

  return (
    // Wrap entire screen content with TouchableWithoutFeedback to close dropdowns on outside tap
    <TouchableWithoutFeedback onPress={closeAllDropdowns}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Expenses</Text>
          {/* Optional: Add settings icon if needed */}
          {/* <TouchableOpacity style={styles.settingsIcon}>
            <Ionicons name="settings-outline" size={24} color={theme.colors.text} />
          </TouchableOpacity> */}
        </View>

        {/* Dropdown Filters - Adjusted layout to match screenshot */}
        <View style={styles.filterContainer}>
          {/* Row 1: Category & Period */}
          <View style={styles.filterRow}>
            <DropdownFilter
              id="category-filter" // Unique ID
              label="Category"
              value={selectedCategory}
              options={categoryOptions}
              onSelect={handleCategoryChange}
              style={[styles.filterItem, styles.filterItemFlex]} // Added flex style
              activeDropdownId={activeDropdownId}
              setActiveDropdownId={setActiveDropdownId}
            />
            <DropdownFilter
              id="period-filter" // Unique ID
              label="Period"
              value={selectedDateRange}
              options={periodOptions}
              onSelect={handleDateRangeChange}
              style={[styles.filterItem, styles.filterItemFlex]} // Added flex style
              activeDropdownId={activeDropdownId}
              setActiveDropdownId={setActiveDropdownId}
            />
          </View>
          {/* Row 2: Sort By (aligned left) */}
          <View style={styles.filterRow}>
             <DropdownFilter
              id="sort-filter" // Unique ID
              label="Sort By"
              value={selectedSort}
              options={sortOptions}
              onSelect={handleSortChange}
              style={[styles.filterItem, styles.filterItemThird]} // Specific width for Sort By
              activeDropdownId={activeDropdownId}
              setActiveDropdownId={setActiveDropdownId}
            />
            {/* Removed the second dropdown from this row */}
          </View>
        </View>

        {/* Search Input - Removed as it's not in the screenshot */}
        {/* <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search expenses..."
            value={searchText}
            onChangeText={handleSearchChange}
          />
        </View> */}

        {/* Expense List */}
        {isLoading ? (
          <ActivityIndicator style={styles.loader} size="large" color={theme.colors.primary} />
        ) : (
          <FlatList
            data={filteredExpenses} // Use filtered/sorted expenses
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ExpenseItem
                item={item}
                currency={user?.currency || '$'} // Use optional chaining and default currency
                onPress={() => navigation.navigate('Add', { expense: item })}
              />
            )}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={<Text style={styles.emptyText}>No expenses found.</Text>}
            onRefresh={refreshExpenses}
            refreshing={isLoading}
            // Make list scrollable even when dropdown is open
            keyboardShouldPersistTaps="handled"
          />
        )}

        {/* Time Filter at the bottom - Removed as it's not in the screenshot */}
        {/* <View style={[styles.bottomFilterContainer, { paddingBottom: insets.bottom }]}>
          <TimeFilter
            options={['Day', 'Week', 'Month']}
            selectedOption={selectedPeriod}
            onSelect={changePeriod}
          />
        </View> */}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9', // Slightly off-white background like screenshot
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: Platform.OS === 'android' ? theme.spacing.xl : theme.spacing.lg, // Adjust top padding for Android status bar
    paddingBottom: theme.spacing.sm, // Reduced bottom padding
    flexDirection: 'row', // Added for potential settings icon alignment
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 34, // Larger font size like screenshot
    fontWeight: theme.typography.fontWeights.bold,
    color: '#000000', // Black title
  },
  settingsIcon: {
    padding: theme.spacing.sm,
  },
  filterContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md, // Add some padding below filters
    // Ensure filter container allows dropdowns to overlay content below
    zIndex: 10, 
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Distribute space between items
    marginBottom: theme.spacing.sm, // Space between rows
    zIndex: 20, // Ensure row is above list content for dropdown overlap
  },
  filterItem: {
    marginRight: theme.spacing.sm, // Default right margin
    zIndex: 30, // Ensure individual dropdowns are high enough
  },
  filterItemFlex: {
    flex: 1, // Make Category and Period take equal width
    marginRight: theme.spacing.sm, // Keep margin between them
  },
  filterItemThird: {
     // Adjust width to be roughly 1/3 or as needed
     // Let the component's internal padding define width, or set a specific width/flexGrow
     flexGrow: 0.6, // Adjust flex grow as needed, less than the full row items
     marginRight: 0, // No margin needed if it's the last/only item in its conceptual space
  },
  // Remove marginRight from the last item in each row to prevent extra space
  filterRow > *:last-child {
    marginRight: 0,
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
    flex: 1, // Take remaining space
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg, // Padding at the bottom of the list
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textLight,
  },
  // Removed bottomFilterContainer styles
});

export default ExpensesScreen;

