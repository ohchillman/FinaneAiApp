import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
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
  Modal,
  TouchableWithoutFeedback
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

const ITEM_HEIGHT = 40; // Define item height as a constant
const DROPDOWN_MARGIN = 5; // Margin between button and dropdown

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
  const scaleAnim = useRef(new Animated.Value(0.95)).current; // Added scale animation
  const containerRef = useRef(null);
  
  // Pre-calculate dimensions to avoid jitter
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 }); 
  const [hasMeasured, setHasMeasured] = useState(false);
  // State for calculated content height
  const [calculatedContentHeight, setCalculatedContentHeight] = useState(0);

  // Calculate exact height needed for all options without scrolling
  const exactContentHeight = options.length * ITEM_HEIGHT;

  // Update content height when options change
  useEffect(() => {
    // Always use exact content height to show all options without scrolling
    setCalculatedContentHeight(exactContentHeight);
  }, [options, exactContentHeight]);

  // Measure button position on mount and window resize
  useLayoutEffect(() => {
    const measureButton = () => {
      if (containerRef.current) {
        // Use setTimeout to ensure layout is stable before measuring
        setTimeout(() => {
          if (containerRef.current) { // Check ref again inside timeout
            containerRef.current.measureInWindow((pageX, pageY, width, height) => {
              if (!pageX && !pageY && !width && !height) {
                // Measurement failed, retry?
                console.warn('Dropdown measurement failed for ID:', id);
                return;
              }
              
              // Always position below the button with a margin
              setDropdownPosition({
                top: pageY + height + DROPDOWN_MARGIN, // Position below with margin
                left: pageX,
                width: width,
              });
              
              if (!hasMeasured) setHasMeasured(true); // Set measured only once initially
            });
          }
        }, 0); // Use timeout 0 to defer measurement until after current render cycle
      }
    };

    measureButton(); // Initial measurement

    const dimensionsListener = Dimensions.addEventListener('change', measureButton);
    return () => {
      dimensionsListener.remove();
    };
  }, []); // Run only on mount

  // Handle Animations
  useEffect(() => {
    // Only run animations if measurements are done and content height is known
    if (hasMeasured && calculatedContentHeight > 0) {
      if (isOpen) {
        // Reset animation values
        opacityAnim.setValue(0);
        scaleAnim.setValue(0.95);
        dropdownHeight.setValue(0);
        
        // Improved opening animation sequence
        Animated.sequence([
          // First, start height animation
          Animated.timing(dropdownHeight, {
            toValue: calculatedContentHeight,
            duration: 250,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Smoother cubic bezier curve
            useNativeDriver: false,
          }),
          // Then, once height is set, animate opacity and scale together
          Animated.parallel([
            Animated.timing(opacityAnim, {
              toValue: 1,
              duration: 200,
              easing: Easing.bezier(0.25, 0.1, 0.25, 1),
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 200,
              easing: Easing.bezier(0.25, 0.1, 0.25, 1),
              useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
              toValue: 1,
              duration: 200,
              easing: Easing.bezier(0.25, 0.1, 0.25, 1),
              useNativeDriver: true,
            })
          ])
        ]).start();
      } else {
        // Improved closing animation
        Animated.parallel([
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 150,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.95,
            duration: 150,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            useNativeDriver: true,
          }),
          Animated.timing(dropdownHeight, {
            toValue: 0,
            duration: 200,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            useNativeDriver: false,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 200,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            useNativeDriver: true,
          })
        ]).start();
      }
    }
  }, [isOpen, hasMeasured, calculatedContentHeight, dropdownHeight, rotateAnim, opacityAnim, scaleAnim]);

  const toggleDropdown = () => {
    // Ensure measurement is done before allowing toggle, prevents potential issues
    if (hasMeasured) {
      setActiveDropdownId(isOpen ? null : id);
    }
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
    <View style={[styles.wrapper, style]}>
      <TouchableOpacity 
        ref={containerRef}
        style={styles.container} 
        onPress={toggleDropdown}
        activeOpacity={0.8}
        // Disable press until measured to prevent opening before position is known
        disabled={!hasMeasured} 
      >
        <Text style={styles.valueText} numberOfLines={1} ellipsizeMode="tail">
          {label}: {value}
        </Text>
        {/* Show indicator only when measured */}
        {hasMeasured ? (
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Ionicons name="chevron-down" size={20} color={colors.primary} />
          </Animated.View>
        ) : (
          <View style={{ width: 20 }} /> // Placeholder for alignment
        )}
      </TouchableOpacity>

      {/* Only render Modal when measurements are ready */}
      {hasMeasured && (
        <Modal
          transparent={true}
          visible={isOpen}
          onRequestClose={closeModal}
          animationType="none"
        >
          <TouchableWithoutFeedback onPress={closeModal}> 
            <View style={StyleSheet.absoluteFill}> 
              {/* Outer Animated Container for HEIGHT animation (JS thread) */}
              <Animated.View 
                style={[
                  styles.dropdown,
                  {
                    top: dropdownPosition.top,
                    left: dropdownPosition.left,
                    width: dropdownPosition.width,
                    height: dropdownHeight,
                    transform: [{ scale: scaleAnim }], // Apply scale animation
                    opacity: opacityAnim, // Apply opacity directly to container
                  }
                ]}
              >
                {/* Content container */}
                <View style={{ flex: 1 }}>
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
                    scrollEnabled={false} // Disable scrolling since we're showing all options
                    showsVerticalScrollIndicator={false}
                    style={styles.list}
                    // Ensure list items are rendered immediately for height calculation
                    initialNumToRender={options.length} 
                  />
                </View>
              </Animated.View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {},
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
    borderWidth: 0,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 0,
    overflow: 'hidden',
    // Add origin for scale animation
    transformOrigin: 'top center',
  },
  list: {
    width: '100%',
  },
  optionItem: {
    height: ITEM_HEIGHT, // Use constant height
    justifyContent: 'center', // Center text vertically
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
