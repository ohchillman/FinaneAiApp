import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import theme from '../theme';
import { useUser } from '../context/UserContext';

const TabBar = ({ state, descriptors, navigation }) => {
  const { user } = useUser();
  const insets = useSafeAreaInsets();
  
  // Create animated values for each tab button
  const tabAnimations = useRef(
    state.routes.map(() => new Animated.Value(1))
  ).current;
  
  return (
    <View style={[
      styles.container,
      { paddingBottom: Math.max(insets.bottom, 8) }
    ]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;
        
        // Animation functions for button press
        const onPressIn = () => {
          Animated.spring(tabAnimations[index], {
            toValue: 0.9,
            friction: 5,
            tension: 300,
            useNativeDriver: true,
          }).start();
        };
        
        const onPressOut = () => {
          Animated.spring(tabAnimations[index], {
            toValue: 1,
            friction: 3,
            tension: 400,
            useNativeDriver: true,
          }).start();
        };

        const onPress = () => {
          // Trigger haptic feedback if available
          if (route.name === 'Add') {
            // More pronounced animation for the Add button
            Animated.sequence([
              Animated.timing(tabAnimations[index], {
                toValue: 0.85,
                duration: 50,
                useNativeDriver: true,
              }),
              Animated.spring(tabAnimations[index], {
                toValue: 1,
                friction: 3,
                tension: 400,
                useNativeDriver: true,
              })
            ]).start();
          }
          
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        let iconName;
        switch (route.name) {
          case 'Home':
            iconName = isFocused ? 'home' : 'home-outline';
            break;
          case 'Expenses':
            iconName = isFocused ? 'card' : 'card-outline';
            break;
          case 'Add':
            iconName = 'add';
            break;
          case 'Analytics':
            iconName = isFocused ? 'bar-chart' : 'bar-chart-outline';
            break;
          case 'Profile':
            iconName = isFocused ? 'person' : 'person-outline';
            break;
          default:
            iconName = 'help-outline';
        }

        return (
          <Animated.View
            key={index}
            style={[
              styles.tabButton,
              { transform: [{ scale: tabAnimations[index] }] },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onPress}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              style={[
                styles.touchableArea,
                route.name === 'Add' && styles.addButton,
                route.name === 'Add' && isFocused && styles.addButtonFocused,
              ]}
            >
            {route.name === 'Profile' ? (
              user.avatar ? (
                <Image 
                  source={{ uri: user.avatar }} 
                  style={styles.profileImage} 
                />
              ) : (
                <View style={styles.profilePlaceholder}>
                  <Text style={styles.profileInitial}>
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </Text>
                </View>
              )
            ) : (
              <Ionicons
                name={iconName}
                size={route.name === 'Add' ? 24 : 22}
                color={
                  route.name === 'Add'
                    ? 'white'
                    : isFocused
                      ? theme.colors.primary
                      : theme.colors.textLight
                }
              />
            )}
            <Text
              style={[
                styles.tabLabel,
                isFocused && styles.tabLabelActive,
                route.name === 'Add' && styles.addLabel,
              ]}
            >
              {label}
            </Text>
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
    paddingTop: 8,
    paddingHorizontal: 10,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 8,
  },
  touchableArea: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 25, // Increased to ensure perfect circle
    width: 50, // Increased and made equal to height
    height: 50, // Increased and made equal to width
    marginTop: 0, // Adjusted for better vertical alignment
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    elevation: 4, // Add shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  addButtonFocused: {
    // Keep the same appearance when focused
    backgroundColor: theme.colors.primary, // Maintain the same color
    transform: [{ scale: 1.05 }], // Slight scale effect instead of color change
  },
  tabLabel: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginTop: 4,
  },
  tabLabelActive: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeights.medium,
  },
  addLabel: {
    color: 'transparent',
    height: 0,
  },
  profileImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'white',
    // Add outer border effect
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 3,
  },
  profilePlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    // Add outer border effect
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 3,
  },
  profileInitial: {
    fontSize: 12,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.primary,
  },
});

export default TabBar;
