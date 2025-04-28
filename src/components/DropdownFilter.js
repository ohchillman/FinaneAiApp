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
  TouchableWithoutFeedback,
  InteractionManager,
  LayoutAnimation,
  UIManager
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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
const DROPDOWN_MARGIN = 10; // Increased margin between button and dropdown
const MEASUREMENT_DELAY = 150; // Longer delay for more reliable measurements

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
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const containerRef = useRef(null);
  const initialMeasurementDone = useRef(false);
  
  // Pre-calculate dimensions to avoid jitter
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 }); 
  const [hasMeasured, setHasMeasured] = useState(false);
  const [calculatedContentHeight, setCalculatedContentHeight] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [measurementAttempts, setMeasurementAttempts] = useState(0);

  // Calculate exact height needed for all options without scrolling
  const exactContentHeight = options.length * ITEM_HEIGHT;

  // Update content height when options change
  useEffect(() => {
    setCalculatedContentHeight(exactContentHeight);
  }, [options, exactContentHeight]);

  // Measure button position on mount with multiple attempts
  useEffect(() => {
    // First measurement after interactions
    InteractionManager.runAfterInteractions(() => {
      // Schedule multiple measurements with increasing delays
      const delays = [50, 150, 300, 500];
      
      delays.forEach((delay, index) => {
        setTimeout(() => {
          if (!initialMeasurementDone.current) {
            measureDropdownPosition();
            setMeasurementAttempts(prev => prev + 1);
          }
        }, delay);
      });
    });
  }, []);

  // Re-measure when dimensions change
  useEffect(() => {
    const dimensionsListener = Dimensions.addEventListener('change', () => {
      // Reset measurement state on dimension change
      initialMeasurementDone.current = false;
      setHasMeasured(false);
      measureDropdownPosition();
    });
    
    return () => {
      dimensionsListener.remove();
    };
  }, []);

  // Measure position function - can be called multiple times
  const measureDropdownPosition = () => {
    if (!containerRef.current) return;
    
    containerRef.current.measureInWindow((pageX, pageY, width, height) => {
      if (!pageX && !pageY && !width && !height) {
        console.warn('Dropdown measurement failed for ID:', id);
        return;
      }
      
      // Always position below the button with a margin
      const newPosition = {
        top: pageY + height + DROPDOWN_MARGIN,
        left: pageX,
        width: width,
      };
      
      // Only update if position actually changed or first measurement
      if (!hasMeasured || 
          newPosition.top !== dropdownPosition.top || 
          newPosition.left !== dropdownPosition.left || 
          newPosition.width !== dropdownPosition.width) {
        
        setDropdownPosition(newPosition);
        
        if (!hasMeasured) {
          setHasMeasured(true);
          initialMeasurementDone.current = true;
        }
      }
    });
  };

  // Re-measure before opening dropdown
  useEffect(() => {
    if (isOpen) {
      // Force measurement when opening
      measureDropdownPosition();
      
      // Configure smooth layout transitions
      LayoutAnimation.configureNext({
        duration: 200,
        update: {
          type: LayoutAnimation.Types.easeInEaseOut,
        },
      });
    }
  }, [isOpen]);

  // Handle Animations with improved timing
  useEffect(() => {
    if (!hasMeasured || calculatedContentHeight <= 0) return;
    
    if (isOpen) {
      setIsAnimating(true);
      
      // Pre-set initial values
      dropdownHeight.setValue(0);
      opacityAnim.setValue(0);
      scaleAnim.setValue(0.95);
      
      // Use a single animation group with proper timing
      Animated.parallel([
        // Height animation
        Animated.timing(dropdownHeight, {
          toValue: calculatedContentHeight,
          duration: 250,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: false,
          delay: 0, // Start immediately
        }),
        // Opacity and scale animations
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
          delay: 50, // Slight delay for smoother appearance
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
          delay: 50, // Slight delay for smoother appearance
        }),
        // Rotation animation
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        })
      ]).start(({ finished }) => {
        if (finished) {
          setIsAnimating(false);
        }
      });
    } else {
      setIsAnimating(true);
      
      // Closing animation
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
          duration: 150,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        })
      ]).start(({ finished }) => {
        if (finished) {
          setIsAnimating(false);
        }
      });
    }
  }, [isOpen, hasMeasured, calculatedContentHeight]);

  const toggleDropdown = () => {
    // Don't allow toggle during animation
    if (isAnimating) return;
    
    // Always re-measure before opening
    if (!isOpen) {
      measureDropdownPosition();
    }
    
    // Only allow toggle if measured
    if (hasMeasured) {
      setActiveDropdownId(isOpen ? null : id);
    }
  };

  const handleSelect = (option) => {
    onSelect(option);
    setActiveDropdownId(null);
  };

  const closeModal = () => {
    if (!isAnimating) {
      setActiveDropdownId(null);
    }
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });

  // Pre-render the dropdown content to avoid jitter
  const renderDropdownContent = () => (
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
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
      style={styles.list}
      initialNumToRender={options.length}
      removeClippedSubviews={false}
    />
  );

  return (
    <View style={[styles.wrapper, style]}>
      <TouchableOpacity 
        ref={containerRef}
        style={styles.container} 
        onPress={toggleDropdown}
        activeOpacity={0.8}
        disabled={!hasMeasured || isAnimating}
      >
        <Text style={styles.valueText} numberOfLines={1} ellipsizeMode="tail">
          {label}: {value}
        </Text>
        {hasMeasured ? (
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Ionicons name="chevron-down" size={20} color={colors.primary} />
          </Animated.View>
        ) : (
          <View style={{ width: 20 }} />
        )}
      </TouchableOpacity>

      {hasMeasured && (
        <Modal
          transparent={true}
          visible={isOpen}
          onRequestClose={closeModal}
          animationType="none"
          onShow={() => {
            // Force re-measurement when modal shows
            measureDropdownPosition();
          }}
          hardwareAccelerated={true}
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
                    opacity: 1, // Keep this at 1, opacity is handled by inner view
                  }
                ]}
                collapsable={false}
              >
                {/* Inner Animated Container for OPACITY and SCALE animations (Native thread) */}
                <Animated.View 
                  style={{ 
                    flex: 1, 
                    opacity: opacityAnim,
                    transform: [{ scale: scaleAnim }]
                  }}
                  collapsable={false}
                >
                  {renderDropdownContent()}
                </Animated.View>
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
  },
  list: {
    width: '100%',
  },
  optionItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
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
