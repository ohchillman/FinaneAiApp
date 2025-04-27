import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import theme from '../theme';

const screenWidth = Dimensions.get('window').width - 32; // Accounting for margins

const ExpenseChart = ({ 
  data = {
    labels: ['1D', '1W', '1M', '3M', '1Y'],
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43, 50],
      },
    ],
  },
  height = 200,
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
  };

  return (
    <View style={[styles.container, style]}>
      <LineChart
        data={data}
        width={screenWidth}
        height={height}
        chartConfig={chartConfig}
        bezier
        withInnerLines={false}
        withOuterLines={true}
        withHorizontalLabels={false}
        withVerticalLabels={false}
        withDots={false}
        style={styles.chart}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.md,
  },
  chart: {
    borderRadius: theme.borderRadius.md,
  },
});

export default ExpenseChart;
