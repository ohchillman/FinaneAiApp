import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import theme from '../theme';

const TimeFilter = ({ 
  options = ['Day', 'Week', 'Month'], 
  selectedOption, 
  onSelect,
  style = {},
}) => {
  return (
    <View style={[styles.container, style]}>
      {options.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.option,
            selectedOption === option && styles.selectedOption,
            index === 0 && styles.firstOption,
            index === options.length - 1 && styles.lastOption,
          ]}
          onPress={() => onSelect(option)}
        >
          <Text
            style={[
              styles.optionText,
              selectedOption === option && styles.selectedOptionText,
            ]}
          >
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.round,
    padding: theme.spacing.xs,
  },
  option: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedOption: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.round,
    ...theme.shadows.light,
  },
  firstOption: {
    marginLeft: 0,
  },
  lastOption: {
    marginRight: 0,
  },
  optionText: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium,
    color: theme.colors.textLight,
  },
  selectedOptionText: {
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeights.semiBold,
  },
});

export default TimeFilter;
