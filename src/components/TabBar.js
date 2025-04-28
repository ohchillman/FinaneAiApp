import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import theme from '../theme';
import { useUser } from '../context/UserContext';

const TabBar = ({ state, descriptors, navigation }) => {
  const { user } = useUser();
  const insets = useSafeAreaInsets();
  
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
          <TouchableOpacity
            key={index}
            activeOpacity={0.7}
            onPress={onPress}
            style={[
              styles.tabButton,
              route.name === 'Add' && styles.addButton,
            ]}
          >
            {route.name === 'Profile' ? (
              user.avatar ? (
                <Image 
                  source={{ uri: user.avatar }} 
                  style={[
                    styles.profileImage,
                    isFocused && styles.profileImageActive
                  ]} 
                />
              ) : (
                <View style={[
                  styles.profilePlaceholder,
                  isFocused && styles.profilePlaceholderActive
                ]}>
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
                  isFocused
                    ? theme.colors.primary
                    : route.name === 'Add'
                    ? 'white'
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
  addButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    marginTop: 5,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
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
    borderWidth: 1,
    borderColor: 'transparent',
  },
  profileImageActive: {
    borderColor: theme.colors.primary,
  },
  profilePlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePlaceholderActive: {
    backgroundColor: theme.colors.primary,
  },
  profileInitial: {
    fontSize: 12,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.primary,
  },
});

export default TabBar;
