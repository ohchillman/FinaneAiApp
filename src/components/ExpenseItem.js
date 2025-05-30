import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';
import { formatCurrency, formatDate } from '../utils/helpers';
import { EXPENSE_CATEGORIES } from '../utils/constants'; // Import EXPENSE_CATEGORIES instead

const ExpenseItem = ({ item, onPress, currency }) => {
  // Find the category object from the array based on the item's category name
  const categoryInfo = EXPENSE_CATEGORIES.find(cat => cat.name === item.category);
  // Get the icon name, provide a fallback if not found
  const iconName = categoryInfo ? categoryInfo.icon : 'help-circle-outline'; 

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        <Ionicons name={iconName} size={24} color={theme.colors.primary} />
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.date}>{formatDate(item.date)}</Text>
      </View>
      <Text style={styles.amount}>-{formatCurrency(item.amount, currency)}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  iconContainer: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.sm,
    marginRight: theme.spacing.md,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  category: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  date: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textLight,
  },
  amount: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.semiBold,
    color: theme.colors.success, // Changed to success color (green)
  },
});

export default ExpenseItem;
