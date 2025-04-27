import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import theme from '../theme';
import Card from '../components/Card';
import TimeFilter from '../components/TimeFilter';
import { useExpenses } from '../context/ExpenseContext';
import { generateChartData, generatePieChartData, formatCurrency, groupExpensesByCategory } from '../utils/helpers';
import { useUser } from '../context/UserContext';

const screenWidth = Dimensions.get('window').width - 32; // Accounting for margins

const AnalyticsScreen = () => {
  const { 
    filteredExpenses, 
    selectedPeriod, 
    changePeriod, 
    isLoading 
  } = useExpenses();
  const { user } = useUser();
  const [lineChartData, setLineChartData] = useState({
    labels: [],
    datasets: [{ data: [0] }]
  });
  const [pieChartData, setPieChartData] = useState([]);
  const [topExpenses, setTopExpenses] = useState([]);
  
  // Generate chart data when expenses change
  useEffect(() => {
    if (filteredExpenses.length > 0) {
      // Line chart data
      const data = generateChartData(filteredExpenses, selectedPeriod);
      setLineChartData(data);
      
      // Pie chart data
      const pieData = generatePieChartData(filteredExpenses);
      setPieChartData(pieData);
      
      // Top expenses by category
      const groupedExpenses = groupExpensesByCategory(filteredExpenses);
      const sortedCategories = Object.keys(groupedExpenses).sort(
        (a, b) => groupedExpenses[b] - groupedExpenses[a]
      );
      
      const totalAmount = sortedCategories.reduce(
        (total, category) => total + groupedExpenses[category], 
        0
      );
      
      const topThree = sortedCategories.slice(0, 3).map(category => ({
        category,
        amount: formatCurrency(groupedExpenses[category], user.currency),
        percentage: `${Math.round((groupedExpenses[category] / totalAmount) * 100)}%`
      }));
      
      setTopExpenses(topThree);
    } else {
      // Reset charts if no expenses
      setLineChartData({
        labels: [],
        datasets: [{ data: [0] }]
      });
      setPieChartData([]);
      setTopExpenses([]);
    }
  }, [filteredExpenses, selectedPeriod, user.currency]);

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
      r: '4',
      strokeWidth: '2',
      stroke: theme.colors.primary,
    },
    propsForBackgroundLines: {
      stroke: theme.colors.chartGrid,
      strokeDasharray: '',
    },
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <TimeFilter
          options={['Week', 'Month', 'Year']}
          selectedOption={selectedPeriod}
          onSelect={changePeriod}
          style={styles.timeFilter}
        />

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : filteredExpenses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No expenses found</Text>
            <Text style={styles.emptySubtext}>
              Add some expenses to see analytics
            </Text>
          </View>
        ) : (
          <>
            <Card title="Expense Trend" style={styles.card}>
              <LineChart
                data={lineChartData}
                width={screenWidth - 32} // Accounting for card padding
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
              />
            </Card>

            <Card title="Expense by Category" style={styles.card}>
              {pieChartData.length > 0 ? (
                <PieChart
                  data={pieChartData}
                  width={screenWidth - 32} // Accounting for card padding
                  height={220}
                  chartConfig={chartConfig}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                />
              ) : (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>No category data available</Text>
                </View>
              )}
            </Card>

            <Card title="Top Expenses" style={styles.card}>
              {topExpenses.length > 0 ? (
                topExpenses.map((item, index) => (
                  <View key={index} style={styles.topExpenseItem}>
                    <View style={styles.topExpenseInfo}>
                      <Text style={styles.topExpenseCategory}>{item.category}</Text>
                      <Text style={styles.topExpenseAmount}>{item.amount}</Text>
                    </View>
                    <View style={styles.percentageBar}>
                      <View 
                        style={[
                          styles.percentageFill, 
                          { width: item.percentage }
                        ]} 
                      />
                    </View>
                    <Text style={styles.percentageText}>{item.percentage}</Text>
                  </View>
                ))
              ) : (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>No expense data available</Text>
                </View>
              )}
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSizes.xxl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  timeFilter: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  card: {
    marginBottom: theme.spacing.lg,
  },
  chart: {
    marginVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  topExpenseItem: {
    marginBottom: theme.spacing.md,
  },
  topExpenseInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  topExpenseCategory: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.medium,
    color: theme.colors.text,
  },
  topExpenseAmount: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.semiBold,
    color: theme.colors.text,
  },
  percentageBar: {
    height: 8,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.round,
    marginBottom: theme.spacing.xs,
  },
  percentageFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.round,
  },
  percentageText: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textLight,
    textAlign: 'right',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  emptyText: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.medium,
    color: theme.colors.text,
  },
  emptySubtext: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
  },
  noDataContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textLight,
  },
});

export default AnalyticsScreen;
