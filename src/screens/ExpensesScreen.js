import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, ActivityIndicator, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import theme from '../theme';
import ExpenseItem from '../components/ExpenseItem';
import TimeFilter from '../components/TimeFilter';
import DropdownFilter from '../components/DropdownFilter';
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
    filterExpensesBySearch
  } = useExpenses();
  const { user } = useUser();
  const insets = useSafeAreaInsets();

  // State for filters
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedDateRange, setSelectedDateRange] = useState('Last 30 Days');
  const [searchText, setSearchText] = useState('');
  
  // Get all category names for the dropdown
  const categoryOptions = ['All Categories', ...EXPENSE_CATEGORIES.map(cat => cat.name)];
  const periodOptions = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'This Year'];

  // Handle category change
  const handleCategoryChange = (newCategory) => {
    setSelectedCategory(newCategory);
    filterExpensesByCategory(newCategory === 'All Categories' ? null : newCategory);
  };

  // Handle date range change
  const handleDateRangeChange = (newRange) => {
    setSelectedDateRange(newRange);
    // Implement date range filtering logic here
  };

  // Handle search text change
  const handleSearchChange = (text) => {
    setSearchText(text);
    filterExpensesBySearch(text);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Expenses</Text>
      </View>

      {/* Dropdown Filters */}
      <View style={styles.filterContainer}>
        <View style={styles.filterHeaderRow}>
          <Text style={styles.filterTitle}>Фильтры</Text>
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={() => {
              // Reset all filters to default values
              setSelectedCategory('All Categories');
              setSelectedDateRange('Last 30 Days');
              setSearchText('');
              filterExpensesByCategory(null);
              filterExpensesBySearch('');
              changePeriod('Month');
            }}
          >
            <Text style={styles.resetButtonText}>Сбросить все</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.filterRow}>
          <DropdownFilter
            label="Category"
            value={selectedCategory}
            options={categoryOptions}
            onSelect={handleCategoryChange}
            style={styles.filterItem}
          />
          <DropdownFilter
            label="Period"
            value={selectedDateRange}
            options={periodOptions}
            onSelect={handleDateRangeChange}
            style={styles.filterItem}
          />
        </View>
        <View style={styles.filterRow}>
          <DropdownFilter
            label="Sort By"
            value="Date"
            options={["Date", "Amount", "Category", "Name"]}
            onSelect={() => {}}
            style={styles.filterItem}
          />
          <DropdownFilter
            label="View"
            value="All"
            options={["All", "Expenses", "Income"]}
            onSelect={() => {}}
            style={styles.filterItem}
          />
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search expenses..."
          value={searchText}
          onChangeText={handleSearchChange}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator style={styles.loader} size="large" color={theme.colors.primary} />
      ) : (
        <FlatList
          data={filteredExpenses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ExpenseItem 
              item={item} 
              currency={user.currency} 
              onPress={() => navigation.navigate('Add', { expense: item })} 
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.emptyText}>No expenses found for this period.</Text>}
          onRefresh={refreshExpenses}
          refreshing={isLoading}
        />
      )}

      {/* Time Filter at the bottom */}
      <View style={[styles.bottomFilterContainer, { paddingBottom: insets.bottom }]}>
        <TimeFilter
          options={['Day', 'Week', 'Month']}
          selectedOption={selectedPeriod}
          onSelect={changePeriod}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSizes.xxl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
  },
  filterContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  filterHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  filterTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.medium,
    color: theme.colors.text,
  },
  resetButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    ...theme.shadows.light,
  },
  resetButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  filterItem: {
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    flexGrow: 0,
    width: 'auto',
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
    marginTop: 50,
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 80, // Add padding to avoid overlap with bottom filter
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textLight,
  },
  bottomFilterContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.background, // Ensure background matches
    paddingTop: theme.spacing.sm, // Add some top padding
  },
});

export default ExpensesScreen;
