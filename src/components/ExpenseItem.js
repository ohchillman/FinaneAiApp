import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';

const ExpenseItem = ({
  title,
  amount,
  category,
  date,
  onPress,
  style = {},
}) => {
  // Get icon based on category
  const getCategoryIcon = () => {
    switch (category.toLowerCase()) {
      case 'food':
        return 'fast-food-outline';
      case 'transport':
        return 'car-outline';
      case 'shopping':
        return 'cart-outline';
      case 'entertainment':
        return 'film-outline';
      case 'bills':
        return 'receipt-outline';
      case 'health':
        return 'medical-outline';
      case 'education':
        return 'school-outline';
      default:
        return 'cash-outline';
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={getCategoryIcon()} size={24} color={theme.colors.primary} />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.category}>{category}</Text>
      </View>
      <View style={styles.rightContainer}>
        <Text style={styles.amount}>${amount}</Text>
        <Text style={styles.date}>{date}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.light,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.medium,
    color: theme.colors.text,
    marginBottom: 2,
  },
  category: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textLight,
  },
  rightContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semiBold,
    color: theme.colors.text,
    marginBottom: 2,
  },
  date: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textLight,
  },
});

export default ExpenseItem;
