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
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
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
    if (calculatedContentHeight <= 0) return;
    
    if (isOpen) {
      setIsAnimating(true);
      // Reset initial values
      opacityAnim.setValue(0);
      scaleAnim.setValue(1);
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.bezier(0.2, 0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.bezier(0.2, 0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.bezier(0.2, 0, 0.2, 1),
          useNativeDriver: true,
        })
      ]).start(({ finished }) => {
        if (finished) {
          setIsAnimating(false);
        } else {
          setTimeout(() => {
            setIsAnimating(false);
          }, 500);
        }
      });
    } else {
      setIsAnimating(true);
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          easing: Easing.bezier(0.2, 0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          easing: Easing.bezier(0.2, 0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 150,
          easing: Easing.bezier(0.2, 0, 0.2, 1),
          useNativeDriver: true,
        })
      ]).start(({ finished }) => {
        if (finished) {
          setIsAnimating(false);
        } else {
          setTimeout(() => {
            setIsAnimating(false);
          }, 500);
        }
      });
    }
  }, [isOpen, calculatedContentHeight]);

  const toggleDropdown = () => {
    // Don't allow toggle during animation
    if (isAnimating) return;
    
    // Only allow toggle if measured or fallback
    if (hasMeasured) {
      setActiveDropdownId(isOpen ? null : id);
    } else {
      // Fallback: allow toggle even if not measured
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

  const onPressIn = () => {
    Animated.spring(buttonScaleAnim, {
      toValue: 0.9,
      friction: 5,
      tension: 300,
      useNativeDriver: true,
    }).start();
  };
  
  const onPressOut = () => {
    Animated.spring(buttonScaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 400,
      useNativeDriver: true,
    }).start();
  };

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
      <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
        <TouchableOpacity 
          ref={containerRef}
          style={styles.container} 
          onPress={toggleDropdown}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          activeOpacity={0.8}
          disabled={isAnimating}
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
      </Animated.View>

      {hasMeasured && (
        <Modal
          transparent={true}
          visible={isOpen}
          onRequestClose={closeModal}
          animationType="none"
          hardwareAccelerated={true}
        >
          <TouchableWithoutFeedback onPress={closeModal}> 
            <View style={StyleSheet.absoluteFill}> 
              <Animated.View 
                style={[
                  styles.dropdown,
                  {
                    top: dropdownPosition.top,
                    left: dropdownPosition.left,
                    width: dropdownPosition.width,
                    opacity: opacityAnim,
                    transform: [{ scale: scaleAnim }],
                  }
                ]}
                collapsable={false}
              >
                {renderDropdownContent()}
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
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.20,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.border,
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
