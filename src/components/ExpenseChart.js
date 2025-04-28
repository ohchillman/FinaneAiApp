import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import theme from '../theme';
import { useUser } from '../context/UserContext';

// Calculate screen width dynamically for better responsiveness
const getScreenWidth = () => {
  return Dimensions.get('window').width; // Use full screen width
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
  const { isDebugMode } = useUser();
  
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
  
  // Ensure data always starts and ends at edges by adding padding points if needed
  const processedData = React.useMemo(() => {
    if (!data || !data.datasets || !data.datasets[0] || !data.datasets[0].data) {
      return data;
    }
    
    const originalData = [...data.datasets[0].data];
    
    // Only modify if we have actual data
    if (originalData.length > 0) {
      // Create a new array with padding points at start and end
      const paddedData = [originalData[0], ...originalData, originalData[originalData.length - 1]];
      
      return {
        ...data,
        datasets: [
          {
            ...data.datasets[0],
            data: paddedData
          }
        ]
      };
    }
    
    return data;
  }, [data]);
  
  return (
    <View style={[styles.container, style]}>
      <LineChart
        data={processedData}
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
        fromZero={false}
        yAxisInterval={1}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%', // Ensure container takes full width
    alignItems: 'flex-start', // Align to start for proper stretching
    marginVertical: theme.spacing.md,
    paddingBottom: theme.spacing.md, // Add padding at bottom for time filter
  },
  chart: {
    borderRadius: theme.borderRadius.md,
    paddingRight: 0, // Remove default padding
    paddingLeft: 0,
    marginLeft: 0,
    marginRight: 0,
    width: '100%', // Ensure chart takes full width
  },
  debugInfo: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
    width: '100%',
  },
  debugText: {
    fontSize: 10,
    color: theme.colors.primary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '500',
  }
});

export default ExpenseChart;
