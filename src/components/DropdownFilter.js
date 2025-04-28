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
  Platform, 
  Modal, // Import Modal
  TouchableWithoutFeedback // Import TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Define colors directly as theme.js is not found
const colors = {
  primary: '#734F96',
  background: '#FFFFFF',
  dropdownBackground: '#EDE8F2',
  text: '#734F96',
  border: '#D1D5DB',
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
  id, 
  label, 
  value, 
  options, 
  onSelect, 
  style, 
  activeDropdownId, 
  setActiveDropdownId 
}) => {
  const isOpen = activeDropdownId === id;
  const dropdownHeight = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const containerRef = useRef(null);
  // Store position relative to the screen, not just parent
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 }); 
  const [maxHeight, setMaxHeight] = useState(150);
  
  const contentHeight = Math.min(options.length * 40, maxHeight);

  useEffect(() => {
    // Measure button position relative to the window when opening
    if (containerRef.current && isOpen) {
      containerRef.current.measureInWindow((pageX, pageY, width, height) => {
        const screenHeight = Dimensions.get('window').height;
        const spaceBelow = screenHeight - pageY - height;
        const calculatedMaxHeight = Math.max(50, spaceBelow - 20);
        setMaxHeight(Math.min(150, calculatedMaxHeight));
        
        setDropdownPosition({
          top: pageY + height + 2, // Position below the button, relative to screen
          left: pageX, // Position relative to screen
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
          easing: Easing.in(Easing.ease),
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
  }, [isOpen, contentHeight, dropdownHeight, rotateAnim, opacityAnim]);

  const toggleDropdown = () => {
    setActiveDropdownId(isOpen ? null : id);
  };

  const handleSelect = (option) => {
    onSelect(option);
    setActiveDropdownId(null); // Close dropdown after selection
  };

  const closeModal = () => {
    setActiveDropdownId(null);
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });

  return (
    // Wrapper View - No complex zIndex needed here anymore
    <View style={[styles.wrapper, style]}>
      <TouchableOpacity 
        ref={containerRef} // Ref to measure position
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

      {/* Modal for Dropdown List - Renders above everything */}
      <Modal
        transparent={true}
        visible={isOpen}
        onRequestClose={closeModal} // For Android back button
        animationType="none" // Control animation manually
      >
        <TouchableWithoutFeedback onPress={closeModal}> 
          {/* Full screen overlay to catch outside taps */}
          <View style={StyleSheet.absoluteFill}> 
            {/* Animated Container for the dropdown list itself */}
            <Animated.View 
              style={[
                styles.dropdown, // Use dropdown styles
                {
                  // Position based on screen coordinates
                  top: dropdownPosition.top,
                  left: dropdownPosition.left,
                  width: dropdownPosition.width,
                  height: dropdownHeight, // Animated height
                  opacity: opacityAnim, // Animated opacity
                }
              ]}
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
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    // Removed position relative and zIndex
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
    borderWidth: 0, // Ensure no border on the button itself
    // Removed zIndex
  },
  valueText: {
    fontSize: typography.fontSizes.sm, 
    color: colors.text, 
    fontWeight: typography.fontWeights.medium,
    flex: 1, 
    marginRight: 8, 
  },
  // Styles for the dropdown list container within the Modal
  dropdown: {
    position: 'absolute', // Position absolutely within the Modal overlay
    backgroundColor: colors.dropdownBackground, 
    borderRadius: 10, 
    shadowColor: '#000', // Add subtle shadow for elevation effect
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5, // Elevation for Android
    borderWidth: 0, // Remove border from dropdown list container
    // borderColor: colors.border, // No border color needed
    overflow: 'hidden', // Keep overflow hidden for border radius
  },
  list: {
    width: '100%',
    // Removed flex: 1, height is controlled by Animated.View
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

