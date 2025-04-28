import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';

const DropdownFilter = ({ label, value, options, onSelect, style }) => {
  // Basic implementation - needs a proper dropdown library like react-native-picker-select
  // or a custom modal implementation for full functionality.
  return (
    <TouchableOpacity style={[styles.container, style]} onPress={() => {/* Open dropdown */}}>
      <Text style={styles.label}>{label}:</Text>
      <Text style={styles.value}>{value}</Text>
      <Ionicons name="chevron-down" size={16} color={theme.colors.textLight} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.inputBackground,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8, // Add some spacing between dropdowns
  },
  label: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textLight,
    marginRight: 4,
  },
  value: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeights.medium,
    marginRight: 4,
  },
});

export default DropdownFilter;
