import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import theme from '../theme';
import ExpenseItem from '../components/ExpenseItem';
import TimeFilter from '../components/TimeFilter';
import DropdownFilter from '../components/DropdownFilter'; // Import the new component
import { useExpenses } from '../context/ExpenseContext';
import { useUser } from '../context/UserContext';

const ExpensesScreen = ({ navigation }) => {
  const { 
    filteredExpenses, 
    selectedPeriod, 
    changePeriod, 
    isLoading,
    refreshExpenses
  } = useExpenses();
  const { user, updateUser } = useUser();
  const insets = useSafeAreaInsets();

  // Mock options for dropdowns - replace with actual logic if needed
  const currencyOptions = ['USD', 'EUR', 'GBP'];
  const periodOptions = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days'];
  const [selectedCurrency, setSelectedCurrency] = useState(user.currency || 'USD');
  const [selectedDateRange, setSelectedDateRange] = useState('Last 30 Days');

  // Handle currency change
  const handleCurrencyChange = (newCurrency) => {
    setSelectedCurrency(newCurrency);
    updateUser({ currency: newCurrency });
    // Potentially refresh expenses or re-calculate amounts based on new currency
  };

  // Handle date range change
  const handleDateRangeChange = (newRange) => {
    setSelectedDateRange(newRange);
    // Potentially filter expenses based on the selected date range
    // This might require more complex logic than the simple Day/Week/Month filter
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Expenses</Text>
        {/* Settings icon can be added here if needed */}
      </View>

      {/* Dropdown Filters */}
      <View style={styles.filterRow}>
        <DropdownFilter
          label="Currency"
          value={selectedCurrency}
          options={currencyOptions}
          onSelect={handleCurrencyChange}
        />
        <DropdownFilter
          label="Period"
          value={selectedDateRange}
          options={periodOptions}
          onSelect={handleDateRangeChange}
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
              currency={selectedCurrency} 
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
      <View style={[styles.bottomFilterContainer, { paddingBottom: insets.bottom + 8 }]}>
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
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
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
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
});

export default ExpensesScreen;
