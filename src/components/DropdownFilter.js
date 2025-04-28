import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Animated, Easing, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';

const DropdownFilter = ({ label, value, options, onSelect, style }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownHeight = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const containerRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [maxHeight, setMaxHeight] = useState(200);
  
  // Calculate dropdown height based on number of options
  const contentHeight = Math.min(options.length * 44, maxHeight);

  useEffect(() => {
    // Animation for opening/closing dropdown
    Animated.parallel([
      Animated.timing(dropdownHeight, {
        toValue: isOpen ? contentHeight : 0,
        duration: 300,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        useNativeDriver: false,
      }),
      Animated.timing(rotateAnim, {
        toValue: isOpen ? 1 : 0,
        duration: 300,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: isOpen ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start();
  }, [isOpen, contentHeight]);

  // Measure button position to place dropdown correctly
  const measureButton = () => {
    if (containerRef.current) {
      containerRef.current.measure((x, y, width, height, pageX, pageY) => {
        const screenHeight = Dimensions.get('window').height;
        // Adjust max height based on space available
        const spaceBelow = screenHeight - pageY - height;
        setMaxHeight(Math.min(300, spaceBelow - 20));
        
        setDropdownPosition({
          top: height,
          left: 0,
          width: width,
        });
      });
    }
  };

  const toggleDropdown = () => {
    if (!isOpen) {
      measureButton();
    }
    setIsOpen(!isOpen);
  };

  const handleSelect = (option) => {
    onSelect(option);
    setIsOpen(false);
  };

  // Rotate animation for the chevron icon
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
        activeOpacity={0.7}
      >
        <Text style={styles.label}>{label}:</Text>
        <Text style={styles.value} numberOfLines={1} ellipsizeMode="tail">{value}</Text>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Ionicons name="chevron-down" size={16} color={theme.colors.textLight} />
        </Animated.View>
      </TouchableOpacity>

      {/* Dropdown content */}
      <Animated.View 
        style={[
          styles.dropdown, 
          {
            height: dropdownHeight,
            opacity: opacityAnim,
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
            display: dropdownHeight._value === 0 ? 'none' : 'flex',
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
              {item === value && (
                <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
          )}
          nestedScrollEnabled
          showsVerticalScrollIndicator={true}
          style={styles.list}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    zIndex: 100,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.inputBackground,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8, // Add some spacing between dropdowns
    ...theme.shadows.light,
  },
  label: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textLight,
    marginRight: 4,
  },
  value: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeights.medium,
    marginRight: 4,
    flex: 1,
  },
  dropdown: {
    position: 'absolute',
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    overflow: 'hidden',
    zIndex: 1000,
    ...theme.shadows.medium,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  list: {
    width: '100%',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  optionText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.text,
    flex: 1,
  },
  selectedOptionText: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeights.medium,
  },
});

export default DropdownFilter;
