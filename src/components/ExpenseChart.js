import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import theme from '../theme';

// Calculate screen width dynamically for better responsiveness
const getScreenWidth = () => {
  const width = Dimensions.get('window').width;
  return width - (theme.spacing.lg * 2); // Account for container padding
};

const ExpenseChart = ({ 
  data = {
    labels: ['1D', '1W', '1M', '3M', '1Y'],
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43, 50],
      },
    ],
  },
  height = 220, // Increased height for better visualization
  style = {},
}) => {
  const chartConfig = {
    backgroundGradientFrom: theme.colors.background,
    backgroundGradientTo: theme.colors.background,
    decimalPlaces: 0,
    color: () => theme.colors.chartLine,
    labelColor: () => theme.colors.textLight,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '0',
      strokeWidth: '0',
    },
    propsForBackgroundLines: {
      stroke: theme.colors.chartGrid,
      strokeDasharray: '',
    },
    strokeWidth: 3, // Increased stroke width for better visibility
    fillShadowGradientFrom: theme.colors.primary,
    fillShadowGradientTo: theme.colors.background,
    fillShadowGradientOpacity: 0.1,
  };

  // Get current screen width for responsive rendering
  const screenWidth = getScreenWidth();
  
  return (
    <View style={[styles.container, style]}>
      <LineChart
        data={data}
        width={screenWidth}
        height={height}
        chartConfig={chartConfig}
        bezier
        withInnerLines={false}
        withOuterLines={false} // Removed outer lines for cleaner look
        withHorizontalLabels={false}
        withVerticalLabels={false}
        withDots={false}
        style={styles.chart}
        withShadow={false} // Disable default shadow
        segments={4} // Reduce number of segments for smoother appearance
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%', // Ensure container takes full width
    alignItems: 'flex-start', // Align to start instead of center
    marginVertical: theme.spacing.md,
    paddingBottom: theme.spacing.md, // Add padding at bottom for time filter
  },
  chart: {
    borderRadius: theme.borderRadius.md,
    paddingRight: 0, // Remove default padding
    paddingLeft: 0,
    marginLeft: 0, // Reset margin for proper alignment
    marginRight: 0,
  },
});

export default ExpenseChart;
