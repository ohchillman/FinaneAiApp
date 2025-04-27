import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';
import ExpenseItem from '../components/ExpenseItem';
import Input from '../components/Input';
import TimeFilter from '../components/TimeFilter';
import { useExpenses } from '../context/ExpenseContext';

const ExpensesScreen = () => {
  const [searchText, setSearchText] = useState('');
  const { 
    filteredExpenses, 
    selectedPeriod, 
    changePeriod, 
    isLoading,
    removeExpense 
  } = useExpenses();
  const [displayedExpenses, setDisplayedExpenses] = useState([]);

  // Filter expenses based on search text
  useEffect(() => {
    if (searchText.trim() === '') {
      setDisplayedExpenses(filteredExpenses);
    } else {
      const filtered = filteredExpenses.filter(expense => 
        expense.title.toLowerCase().includes(searchText.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchText.toLowerCase()) ||
        expense.description?.toLowerCase().includes(searchText.toLowerCase())
      );
      setDisplayedExpenses(filtered);
    }
  }, [filteredExpenses, searchText]);

  const handleExpensePress = (expense) => {
    console.log('Expense pressed:', expense.id);
    // Navigation to expense details could be added here
  };

  const renderExpenseItem = ({ item }) => (
    <ExpenseItem
      title={item.title}
      amount={item.amount}
      category={item.category}
      date={item.date}
      onPress={() => handleExpensePress(item)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Expenses</Text>
      </View>

      <View style={styles.content}>
        <Input
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search expenses..."
          rightIcon={<Ionicons name="search-outline" size={24} color={theme.colors.primary} />}
          style={styles.searchInput}
        />

        <TimeFilter
          options={['Day', 'Week', 'Month']}
          selectedOption={selectedPeriod}
          onSelect={changePeriod}
          style={styles.timeFilter}
        />

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : displayedExpenses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color={theme.colors.textLight} />
            <Text style={styles.emptyText}>No expenses found</Text>
            <Text style={styles.emptySubtext}>
              {searchText.trim() !== '' 
                ? 'Try a different search term' 
                : 'Add some expenses to get started'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={displayedExpenses}
            renderItem={renderExpenseItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSizes.xxl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  searchInput: {
    marginBottom: theme.spacing.md,
  },
  timeFilter: {
    marginBottom: theme.spacing.md,
  },
  listContent: {
    paddingBottom: theme.spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: theme.spacing.xxl,
  },
  emptyText: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.medium,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  emptySubtext: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
});

export default ExpensesScreen;
