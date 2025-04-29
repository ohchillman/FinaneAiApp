import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';
import Card from '../components/Card';
import Button from '../components/Button';
import { useUser } from '../context/UserContext';
import { clearAllData } from '../services/storageService';

const ProfileScreen = () => {
  const { user, isLoading, toggleDebugMode } = useUser();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isDebugMode, setIsDebugMode] = useState(user.debugMode || false);

  const handleToggleDebugMode = async (value) => {
    console.log('Toggle debug mode:', value);
    setIsDebugMode(value);
    const success = await toggleDebugMode(value);
    console.log('Debug mode toggle success:', success);
    
    // Force reload the app state to ensure changes take effect
    if (success) {
      Alert.alert(
        "Debug Mode " + (value ? "Enabled" : "Disabled"),
        value ? "Test data has been loaded." : "Regular data has been restored.",
        [{ text: "OK" }]
      );
    }
  };

  const menuItems = [
    { id: '1', title: 'Manage Account', icon: 'person-outline' },
    { id: '2', title: 'Change Currency', icon: 'swap-horizontal-outline' }, // Updated icon
    { id: '3', title: 'Notifications', icon: 'notifications-outline' },
    { id: '4', title: 'Privacy & Security', icon: 'lock-closed-outline' }, // Updated icon
    { id: '5', title: 'Help & Support', icon: 'help-circle-outline' },
    { id: '6', title: 'Log Out', icon: 'log-out-outline' }, // Updated icon and action
  ];

  const handleMenuItemPress = (item) => {
    if (item.title === 'Log Out') {
      handleSignOut();
    } else {
      console.log(`Navigate to ${item.title}`);
      // Navigation to specific settings screens could be added here
    }
  };

  // Remove handleUpgradeToPro function as it's not needed
  // const handleUpgradeToPro = () => { ... };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await clearAllData();
      Alert.alert('Success', 'You have been signed out');
      // In a real app, you would navigate to a login screen here
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
    } finally {
      setIsSigningOut(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        {/* Settings button removed based on screenshot */}
        {/* <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color={theme.colors.text} />
        </TouchableOpacity> */}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{user.name ? user.name.charAt(0) : 'U'}</Text>
              </View>
            )}
          </View>
          <Text style={styles.userName}>{user.name || 'User Name'}</Text>
          {/* User email removed based on screenshot */}
          {/* <Text style={styles.userEmail}>{user.email || 'No email set'}</Text> */}
          <Button
            title="Edit Profile"
            onPress={() => console.log('Edit Profile pressed')}
            style={styles.editProfileButton}
          />
        </View>

        {/* Pro card removed based on screenshot */}
        {/* {!user.isPro && (
          <Card style={styles.proCard}>
            <View style={styles.proCardContent}>
              <View>
                <Text style={styles.proTitle}>Upgrade to Pro</Text>
                <Text style={styles.proDescription}>
                  Get advanced analytics, unlimited expense history, and more
                </Text>
              </View>
              <Button
                title="Upgrade"
                size="small"
                onPress={handleUpgradeToPro}
              />
            </View>
          </Card>
        )} */}

        <View style={styles.menuContainer}>
          {/* Debug Mode Toggle removed based on screenshot */}
          {/* <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="bug-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.menuItemText}>Debug Mode</Text>
            </View>
            <Switch
              trackColor={{ false: theme.colors.border, true: theme.colors.primaryLight }}
              thumbColor={isDebugMode ? theme.colors.primary : '#f4f3f4'}
              ios_backgroundColor={theme.colors.border}
              onValueChange={handleToggleDebugMode}
              value={isDebugMode}
            />
          </View> */}
          
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => handleMenuItemPress(item)}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name={item.icon} size={24} color={theme.colors.primary} />
                <Text style={styles.menuItemText}>{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textLight} />
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title={isSigningOut ? "Signing Out..." : "Sign Out"}
          variant="outline"
          onPress={handleSignOut}
          loading={isSigningOut}
          style={styles.signOutButton}
        />
      </ScrollView>
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
    // justifyContent: 'space-between', // Remove space-between
    justifyContent: 'center', // Center the title
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.sm,
    position: 'relative', // Needed for absolute positioning if settings button were kept
  },
  title: {
    fontSize: theme.typography.fontSizes.xxxl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
  },
  settingsButton: {
    padding: theme.spacing.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  avatarContainer: {
    marginBottom: theme.spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: theme.typography.fontSizes.xxxl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.card,
  },
  editProfileButton: {
    marginTop: theme.spacing.md, // Add margin top
    width: '80%', // Make button slightly less than full width
    alignSelf: 'center', // Center the button
  },
  userName: {
    fontSize: theme.typography.fontSizes.xxl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  userEmail: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textLight,
  },
  proCard: {
    backgroundColor: theme.colors.secondary,
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  proCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  proTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.semiBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  proDescription: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textLight,
    maxWidth: '80%',
  },
  menuContainer: {
    marginBottom: theme.spacing.xl,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
  },
  signOutButton: {
    marginBottom: theme.spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProfileScreen;
