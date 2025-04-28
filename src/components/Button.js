import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import theme from '../theme';

const Button = ({ title, onPress, variant = 'primary', size = 'medium', loading = false, disabled = false, style, icon, iconPosition = 'right' }) => {
  const getButtonStyle = () => {
    let buttonStyle = [styles.button, styles[`${size}Button`]];
    
    if (variant === 'primary') {
      buttonStyle.push(styles.primaryButton);
    } else if (variant === 'secondary') {
      buttonStyle.push(styles.secondaryButton);
    } else if (variant === 'outline') {
      buttonStyle.push(styles.outlineButton);
    }
    
    if (disabled) {
      buttonStyle.push(styles.disabledButton);
    }
    
    if (style) {
      buttonStyle.push(style);
    }
    
    return buttonStyle;
  };
  
  const getTextStyle = () => {
    let textStyle = [styles.buttonText, styles[`${size}Text`]];
    
    if (variant === 'primary') {
      textStyle.push(styles.primaryText);
    } else if (variant === 'secondary') {
      textStyle.push(styles.secondaryText);
    } else if (variant === 'outline') {
      textStyle.push(styles.outlineText);
    }
    
    if (disabled) {
      textStyle.push(styles.disabledText);
    }
    
    return textStyle;
  };

  const renderProBadge = () => {
    if (title.toLowerCase().includes('pro') || title.toLowerCase() === 'recognize') {
      return (
        <View style={styles.proBadge}>
          <Text style={styles.proText}>Pro</Text>
        </View>
      );
    }
    return null;
  };

  const renderStarIcon = () => {
    if (title.toLowerCase() === 'recognize') {
      return (
        <View style={styles.starIcon}>
          <Text style={styles.starText}>⭐</Text>
        </View>
      );
    }
    return null;
  };
  
  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <Text style={getTextStyle()}>Loading...</Text>
      ) : (
        <View style={styles.buttonContent}>
          {icon && iconPosition === 'left' && (
            <View style={styles.iconLeft}>{icon}</View>
          )}
          <Text style={getTextStyle()}>{title}</Text>
          {icon && iconPosition === 'right' && (
            <View style={styles.iconRight}>{icon}</View>
          )}
          {renderProBadge()}
          {renderStarIcon()}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  mediumButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  largeButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    ...theme.shadows.sm,
  },
  secondaryButton: {
    backgroundColor: theme.colors.secondary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  disabledButton: {
    backgroundColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  buttonText: {
    fontWeight: theme.typography.fontWeights.medium,
    textAlign: 'center',
  },
  smallText: {
    fontSize: theme.typography.fontSizes.sm,
  },
  mediumText: {
    fontSize: theme.typography.fontSizes.md,
  },
  largeText: {
    fontSize: theme.typography.fontSizes.lg,
  },
  primaryText: {
    color: 'white',
  },
  secondaryText: {
    color: theme.colors.primary,
  },
  outlineText: {
    color: theme.colors.primary,
  },
  disabledText: {
    color: theme.colors.textLight,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  proBadge: {
    position: 'absolute',
    right: 10,
    backgroundColor: theme.colors.proBackground,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  proText: {
    color: theme.colors.proText,
    fontSize: 10,
    fontWeight: theme.typography.fontWeights.bold,
  },
  starIcon: {
    position: 'absolute',
    right: 40,
  },
  starText: {
    fontSize: 14,
  }
});

export default Button;
