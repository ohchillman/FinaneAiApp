import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import theme from '../theme';

const Card = ({ 
  children, 
  title = null, 
  subtitle = null, 
  style = {}, 
  contentStyle = {},
}) => {
  return (
    <View style={[styles.container, style]}>
      {(title || subtitle) && (
        <View style={styles.header}>
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}
      <View style={[styles.content, contentStyle]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.light,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  header: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.semiBold,
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
  },
  content: {
    padding: theme.spacing.md,
  },
});

export default Card;
