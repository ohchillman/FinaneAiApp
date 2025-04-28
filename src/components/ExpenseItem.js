import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';
import { formatCurrency, formatDate } from '../utils/helpers';
import { CATEGORY_ICONS } from '../utils/constants';

const ExpenseItem = ({ item, onPress, currency }) => {
  const iconName = CATEGORY_ICONS[item.category] || 'help-circle-outline';

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        <Ionicons name={iconName} size={24} color={theme.colors.primary} />
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.date}>{formatDate(item.date)}</Text>
      </View>
      <Text style={styles.amount}>{formatCurrency(item.amount, currency)}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  iconContainer: {
    backgroundColor: theme.colors.inputBackground,
    borderRadius: 12, // More rounded corners
    padding: 12,
    marginRight: theme.spacing.md,
    width: 48, // Fixed width
    height: 48, // Fixed height
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
    marginBottom: 2,
  },
  date: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textLight,
  },
  amount: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.medium,
    color: theme.colors.success, // Use success color for amount
  },
});

export default ExpenseItem;
