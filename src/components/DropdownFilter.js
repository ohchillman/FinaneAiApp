import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Animated, Easing, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Define colors directly as theme.js is not found
const colors = {
  primary: '#734F96', // Main purple color from user spec
  background: '#FFFFFF', // Default background, might need adjustment for dropdown list
  dropdownBackground: '#EDE8F2', // Background for the dropdown button itself
  text: '#734F96', // Main text color from user spec
  border: '#D1D5DB', // A light border color for the dropdown list
  white: '#FFFFFF',
};

const typography = {
  fontSizes: {
    sm: 14,
    md: 16,
    lg: 18,
  },
  fontWeights: {
    regular: '400',
    medium: '500',
    bold: '700',
  },
};

const DropdownFilter = ({ 
  id, // Unique ID for this dropdown instance
  label, 
  value, 
  options, 
  onSelect, 
  style, 
  activeDropdownId, // ID of the currently open dropdown
  setActiveDropdownId // Function to set the active dropdown ID
}) => {
  const isOpen = activeDropdownId === id;
  const dropdownHeight = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const containerRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [maxHeight, setMaxHeight] = useState(150); // Adjusted default max height
  
  // Calculate dropdown height based on number of options
  const contentHeight = Math.min(options.length * 40, maxHeight); // Adjusted item height

  useEffect(() => {
    if (containerRef.current && isOpen) {
      // Measure button position when opening
      containerRef.current.measure((x, y, width, height, pageX, pageY) => {
        const screenHeight = Dimensions.get('window').height;
        const spaceBelow = screenHeight - pageY - height;
        // Ensure dropdown doesn't go off-screen
        const calculatedMaxHeight = Math.max(50, spaceBelow - 20); 
        setMaxHeight(Math.min(150, calculatedMaxHeight)); // Limit max height
        
        setDropdownPosition({
          top: height + 2, // Add small gap
          left: 0,
          width: width,
        });
      });
    }

    // Animations
    if (isOpen) {
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.timing(dropdownHeight, {
          toValue: contentHeight,
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          delay: 50,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
         Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(dropdownHeight, {
          toValue: 0,
          duration: 200,
          easing: Easing.in(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [isOpen, contentHeight]); // Rerun effect if isOpen or contentHeight changes

  const toggleDropdown = () => {
    // If this dropdown is already open, close it.
    // If another dropdown is open, close it and open this one.
    // If no dropdown is open, open this one.
    setActiveDropdownId(isOpen ? null : id);
  };

  const handleSelect = (option) => {
    onSelect(option);
    setActiveDropdownId(null); // Close dropdown after selection
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });

  return (
    // Use a View wrapper to help with positioning and zIndex
    <View style={[styles.wrapper, style]}>
      <TouchableOpacity 
        ref={containerRef}
        style={styles.container} 
        onPress={toggleDropdown}
        activeOpacity={0.8} // Slightly higher opacity on press
      >
        {/* Combine Label and Value for better alignment */}
        <Text style={styles.valueText} numberOfLines={1} ellipsizeMode="tail">
          {label}: {value}
        </Text>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Ionicons name="chevron-down" size={20} color={colors.primary} />
        </Animated.View>
      </TouchableOpacity>

      {/* Dropdown List - Rendered conditionally but kept in layout for measurement */}
      {/* Use absolute positioning for the dropdown list */}
      <Animated.View 
        style={[
          styles.dropdown,
          {
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
            height: dropdownHeight, // Animated height
            opacity: opacityAnim, // Animated opacity
            // Ensure dropdown is above other elements
            zIndex: isOpen ? 100 : -1, // High zIndex when open, negative when closed
          }
        ]}
        pointerEvents={isOpen ? 'auto' : 'none'} // Only allow interaction when open
      >
        <FlatList
          data={options}
          keyExtractor={(item) => item.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.optionItem}
              onPress={() => handleSelect(item)}
            >
              <Text 
                style={[
                  styles.optionText,
                  item === value && styles.selectedOptionText // Highlight selected option
                ]}
                numberOfLines={1}
              >
                {item}
              </Text>
              {/* Optional: Add checkmark for selected item if needed */}
              {/* {item === value && (
                <Ionicons name="checkmark" size={18} color={colors.primary} />
              )} */}
            </TouchableOpacity>
          )}
          nestedScrollEnabled
          showsVerticalScrollIndicator={false} // Hide scroll indicator for cleaner look
          style={styles.list}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative', // Needed for absolute positioning of dropdown
    zIndex: 1, // Default zIndex
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Space between text and icon
    backgroundColor: colors.dropdownBackground, // User specified background
    borderRadius: 20, // Rounded corners like screenshot
    paddingVertical: 10, // Adjust padding to match screenshot
    paddingHorizontal: 15, // Adjust padding
    // Remove shadows and elevation
    shadowColor: 'transparent',
    elevation: 0,
  },
  valueText: {
    fontSize: typography.fontSizes.sm, // Slightly smaller font size
    color: colors.text, // User specified text color
    fontWeight: typography.fontWeights.medium,
    flex: 1, // Take available space
    marginRight: 8, // Space before icon
  },
  dropdown: {
    position: 'absolute',
    backgroundColor: colors.dropdownBackground, // Same background as button
    borderRadius: 10, // Slightly less rounded than button
    overflow: 'hidden',
    // Remove shadows and elevation
    shadowColor: 'transparent',
    elevation: 0,
    borderWidth: Platform.OS === 'ios' ? 0.5 : 0, // Subtle border for iOS
    borderColor: colors.border,
    marginTop: 2, // Small gap from button
  },
  list: {
    width: '100%',
  },
  optionItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 0, // Remove internal borders for cleaner look
  },
  optionText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text,
    fontWeight: typography.fontWeights.regular,
  },
  selectedOptionText: {
    fontWeight: typography.fontWeights.bold, // Make selected option bold
    color: colors.primary, // Use primary color for selected text
  },
});

export default DropdownFilter;

