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
  
  // Pre-calculate dimensions to avoid jitter
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 }); 
  const [maxHeight, setMaxHeight] = useState(150);
  const [hasMeasured, setHasMeasured] = useState(false);
  
  // Calculate content height based on options
  const contentHeight = Math.min(options.length * 40, maxHeight);

  // Measure button position on mount and window resize
  useLayoutEffect(() => {
    const measureButton = () => {
      if (containerRef.current) {
        containerRef.current.measureInWindow((pageX, pageY, width, height) => {
          const screenHeight = Dimensions.get('window').height;
          const spaceBelow = screenHeight - pageY - height;
          const calculatedMaxHeight = Math.max(50, spaceBelow - 20);
          
          setMaxHeight(Math.min(150, calculatedMaxHeight));
          setDropdownPosition({
            top: pageY + height + 2,
            left: pageX,
            width: width,
          });
          setHasMeasured(true);
        });
      }
    };

    // Initial measurement
    measureButton();

    // Re-measure on dimension change
    const dimensionsListener = Dimensions.addEventListener('change', measureButton);

    return () => {
      dimensionsListener.remove();
    };
  }, []);

  // Re-measure when dropdown opens if needed
  useEffect(() => {
    if (isOpen && containerRef.current) {
      containerRef.current.measureInWindow((pageX, pageY, width, height) => {
        const screenHeight = Dimensions.get('window').height;
        const spaceBelow = screenHeight - pageY - height;
        const calculatedMaxHeight = Math.max(50, spaceBelow - 20);
        
        setMaxHeight(Math.min(150, calculatedMaxHeight));
        setDropdownPosition({
          top: pageY + height + 2,
          left: pageX,
          width: width,
        });
      });
    }

    // Animations
    if (isOpen) {
      // Reset opacity before starting open animation
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
                  }
                ]}
              >
                {/* Inner Animated Container for OPACITY animation (Native thread) */}
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
