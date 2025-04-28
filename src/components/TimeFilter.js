import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import theme from '../theme';

const TimeFilter = ({ options, selectedOption, onSelect, style }) => {
  return (
    <View style={[styles.container, style]}>
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          style={[
            styles.option,
            selectedOption === option && styles.selectedOption,
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
    backgroundColor: theme.colors.inputBackground,
    borderRadius: 30,
    padding: 4,
    height: 44,
  },
  option: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    paddingVertical: 8,
  },
  selectedOption: {
    backgroundColor: theme.colors.background,
    ...theme.shadows.sm,
  },
  optionText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textLight,
  },
  selectedOptionText: {
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeights.medium,
  },
});

export default TimeFilter;
