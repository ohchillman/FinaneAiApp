import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Animated, 
  Easing, 
  Dimensions, 
  Platform 
} from 'react-native';
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
      // Reset opacity before starting open animation
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.timing(dropdownHeight, { // Height animation (JS thread)
          toValue: contentHeight,
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false, // Height must use JS driver
        }),
        Animated.timing(rotateAnim, { // Rotation animation (Native thread)
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true, // Transform can use native driver
        }),
        Animated.timing(opacityAnim, { // Opacity animation (Native thread)
          toValue: 1,
          duration: 200,
          delay: 50, // Slight delay for smoother appearance
          useNativeDriver: true, // Opacity can use native driver
        })
      ]).start();
    } else {
      // Use parallel for closing animations as well
      Animated.parallel([
        Animated.timing(opacityAnim, { // Opacity animation (Native thread)
          toValue: 0,
          duration: 150, // Faster fade out
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(dropdownHeight, { // Height animation (JS thread)
          toValue: 0,
          duration: 200,
          easing: Easing.in(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(rotateAnim, { // Rotation animation (Native thread)
          toValue: 0,
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        })
      ]).start();
    }
    // Add opacityAnim to dependencies if its changes should trigger effect, though likely not needed here
  }, [isOpen, contentHeight, dropdownHeight, rotateAnim, opacityAnim]); // Include animated values in dependencies

  const toggleDropdown = () => {
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
    <View style={[styles.wrapper, style]}>
      <TouchableOpacity 
        ref={containerRef}
        style={styles.container} 
        onPress={toggleDropdown}
        activeOpacity={0.8}
      >
        <Text style={styles.valueText} numberOfLines={1} ellipsizeMode="tail">
          {label}: {value}
        </Text>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Ionicons name="chevron-down" size={20} color={colors.primary} />
        </Animated.View>
      </TouchableOpacity>

      {/* Dropdown List Container - Animates height (JS) */}
      <Animated.View 
        style={[
          styles.dropdown,
          {
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
            height: dropdownHeight, // Animated height (JS)
            // Remove opacity from here to avoid conflict
            zIndex: isOpen ? 100 : -1, 
          }
        ]}
        pointerEvents={isOpen ? 'auto' : 'none'}
      >
        {/* Inner Container - Animates opacity (Native) */}
        <Animated.View style={{ flex: 1, opacity: opacityAnim }}> 
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
                    item === value && styles.selectedOptionText
                  ]}
                  numberOfLines={1}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
            style={styles.list}
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative', 
    zIndex: 1, 
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', 
    backgroundColor: colors.dropdownBackground, 
    borderRadius: 20, 
    paddingVertical: 10, 
    paddingHorizontal: 15, 
    shadowColor: 'transparent',
    elevation: 0,
  },
  valueText: {
    fontSize: typography.fontSizes.sm, 
    color: colors.text, 
    fontWeight: typography.fontWeights.medium,
    flex: 1, 
    marginRight: 8, 
  },
  dropdown: {
    position: 'absolute',
    backgroundColor: colors.dropdownBackground, 
    borderRadius: 10, 
    overflow: 'hidden',
    shadowColor: 'transparent',
    elevation: 0,
    borderWidth: Platform.OS === 'ios' ? 0.5 : 0, 
    borderColor: colors.border,
    marginTop: 2, 
  },
  list: {
    width: '100%',
    flex: 1, // Ensure FlatList takes up available space in Animated.View
  },
  optionItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 0, 
  },
  optionText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text,
    fontWeight: typography.fontWeights.regular,
  },
  selectedOptionText: {
    fontWeight: typography.fontWeights.bold, 
    color: colors.primary, 
  },
});

export default DropdownFilter;

