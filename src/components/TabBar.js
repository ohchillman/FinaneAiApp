import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';

const TabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const getIconName = () => {
          switch (route.name) {
            case 'Home':
              return isFocused ? 'home' : 'home-outline';
            case 'Expenses':
              return isFocused ? 'list' : 'list-outline';
            case 'Add':
              return 'add-circle';
            case 'Analytics':
              return isFocused ? 'bar-chart' : 'bar-chart-outline';
            case 'Profile':
              return isFocused ? 'person' : 'person-outline';
            default:
              return 'help-circle-outline';
          }
        };

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={index}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            style={[
              styles.tabButton,
              route.name === 'Add' && styles.addButton,
            ]}
          >
            <Ionicons
              name={getIconName()}
              size={route.name === 'Add' ? 40 : 24}
              color={
                isFocused
                  ? theme.colors.primary
                  : route.name === 'Add'
                  ? theme.colors.primary
                  : theme.colors.textLight
              }
              style={route.name === 'Add' && styles.addIcon}
            />
            {route.name !== 'Add' && (
              <Text
                style={[
                  styles.tabLabel,
                  isFocused && styles.tabLabelFocused,
                ]}
              >
                {label}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingBottom: theme.spacing.sm,
    paddingTop: theme.spacing.xs,
    height: 60,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    marginTop: -20,
  },
  addIcon: {
    marginBottom: -5,
  },
  tabLabel: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textLight,
    marginTop: 2,
  },
  tabLabelFocused: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeights.medium,
  },
});

export default TabBar;
