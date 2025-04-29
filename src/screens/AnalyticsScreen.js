import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { LineChart, PieChart, BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import theme from '../theme';
import Card from '../components/Card';
import TimeFilter from '../components/TimeFilter';
import { useExpenses } from '../context/ExpenseContext';
import { generateChartData, generatePieChartData, formatCurrency, groupExpensesByCategory } from '../utils/helpers';
import { useUser } from '../context/UserContext';
import { Ionicons } from '@expo/vector-icons';

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
  const [barChartData, setBarChartData] = useState({
    labels: [],
    datasets: [{ data: [0, 0, 0, 0] }]
  });
  const [categoryNames, setCategoryNames] = useState([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [mostSpentCategory, setMostSpentCategory] = useState(null);
  const [avgDaily, setAvgDaily] = useState(0);
  const [mainCategory, setMainCategory] = useState({ name: '', amount: 0 });

  useEffect(() => {
    if (filteredExpenses.length > 0) {
      // Line chart data
      const data = generateChartData(filteredExpenses, selectedPeriod);
      setLineChartData(data);
      // Bar chart by category
      const grouped = groupExpensesByCategory(filteredExpenses);
      const sorted = Object.entries(grouped).sort((a, b) => b[1] - a[1]);
      const top4 = sorted.slice(0, 4);
      setCategoryNames(top4.map(([name]) => name));
      setBarChartData({
        labels: top4.map(([name]) => name.length > 10 ? name.slice(0, 10) + '…' : name),
        datasets: [{ data: top4.map(([, value]) => value) }]
      });
      // Main category
      setMainCategory(top4[0] ? { name: top4[0][0], amount: top4[0][1] } : { name: '', amount: 0 });
      // Total spent
      const total = Object.values(grouped).reduce((a, b) => a + b, 0);
      setTotalSpent(total);
      // Most spent category
      setMostSpentCategory(top4[0] ? { name: top4[0][0], amount: top4[0][1] } : null);
      // Avg daily
      let days = 1;
      if (selectedPeriod === 'Week') days = 7;
      else if (selectedPeriod === 'Month') days = 30;
      else if (selectedPeriod === 'Year') days = 365;
      setAvgDaily(total / days);
    } else {
      setLineChartData({ labels: [], datasets: [{ data: [0] }] });
      setBarChartData({ labels: [], datasets: [{ data: [0, 0, 0, 0] }] });
      setCategoryNames([]);
      setMainCategory({ name: '', amount: 0 });
      setTotalSpent(0);
      setMostSpentCategory(null);
      setAvgDaily(0);
    }
  }, [filteredExpenses, selectedPeriod, user.currency]);

  const chartConfig = {
    backgroundGradientFrom: '#F8F5FF',
    backgroundGradientTo: '#F8F5FF',
    decimalPlaces: 0,
    color: () => '#7B4EFF',
    labelColor: () => '#B7A8D6',
    style: { borderRadius: 16 },
    propsForBackgroundLines: { stroke: '#E5DDF6' },
    propsForLabels: { fontSize: 12 },
    barPercentage: 0.7,
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Analytics</Text>
        <Ionicons name="settings-outline" size={24} color="#7B4EFF" />
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Expenses Over Time */}
        <Text style={styles.sectionLabel}>Expenses Over Time</Text>
        <Text style={styles.bigNumber}>{formatCurrency(totalSpent, user.currency)}</Text>
        <Text style={styles.periodChange}>Last 7 Days <Text style={styles.positive}>+12%</Text></Text>
        <LineChart
          data={lineChartData}
          width={screenWidth}
          height={110}
          chartConfig={chartConfig}
          bezier
          style={styles.lineChart}
          withDots={false}
          withInnerLines={false}
          withOuterLines={false}
          withShadow={false}
        />
        <View style={styles.timeTabs}>
          {['1D', '1W', '1M', '3M', '1Y'].map((opt, idx) => (
            <Text
              key={opt}
              style={[styles.timeTab, (selectedPeriod === 'Day' && idx === 0) || (selectedPeriod === 'Week' && idx === 1) || (selectedPeriod === 'Month' && idx === 2) ? styles.timeTabActive : null]}
              onPress={() => changePeriod(idx === 0 ? 'Day' : idx === 1 ? 'Week' : idx === 2 ? 'Month' : idx === 3 ? '3M' : 'Year')}
            >
              {opt}
            </Text>
          ))}
        </View>
        {/* Expenses by Category */}
        <Text style={styles.sectionLabel}>Expenses by Category</Text>
        <Text style={styles.categoryMain}><Text style={styles.categoryMainLabel}>{mainCategory.name ? mainCategory.name + ': ' : ''}</Text>{mainCategory.amount ? formatCurrency(mainCategory.amount, user.currency) : '$0'}</Text>
        <Text style={styles.categorySubLabel}>Last 7 Days N/A</Text>
        <BarChart
          data={barChartData}
          width={screenWidth}
          height={120}
          chartConfig={chartConfig}
          fromZero
          showValuesOnTopOfBars={false}
          withInnerLines={false}
          withHorizontalLabels={false}
          style={styles.barChart}
        />
        <View style={styles.barLabelsRow}>
          {categoryNames.map((name, idx) => (
            <Text key={name} style={styles.barLabel}>{name}</Text>
          ))}
        </View>
        {/* Cards with metrics */}
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Total Spent</Text>
            <Text style={styles.metricValue}>{formatCurrency(totalSpent, user.currency)}</Text>
            <Text style={styles.metricSubValue}>N/A</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Most Spent Category</Text>
            <Text style={styles.metricValue}>{mostSpentCategory ? mostSpentCategory.name : '-'}</Text>
            <Text style={styles.metricSubValue}>{mostSpentCategory ? formatCurrency(mostSpentCategory.amount, user.currency) : ''}</Text>
          </View>
        </View>
        <View style={styles.metricsRow}>
          <View style={styles.metricCardFull}>
            <Text style={styles.metricLabel}>Avg Daily Spending</Text>
            <Text style={styles.metricValue}>{formatCurrency(avgDaily, user.currency)}</Text>
            <Text style={styles.metricSubValue}>N/A</Text>
          </View>
        </View>
        <View style={styles.bottomTabs}>
          {['Day', 'Week', 'Month'].map(opt => (
            <Text
              key={opt}
              style={[styles.bottomTab, selectedPeriod === opt && styles.bottomTabActive]}
              onPress={() => changePeriod(opt)}
            >
              {opt}
            </Text>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.fontSizes.xxxl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  sectionLabel: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textLight,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xs,
    fontWeight: theme.typography.fontWeights.medium,
  },
  bigNumber: {
    fontSize: theme.typography.fontSizes.xxxl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  periodChange: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.sm,
  },
  positive: {
    color: theme.colors.success,
    fontWeight: theme.typography.fontWeights.semiBold,
  },
  lineChart: {
    marginVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
  },
  timeTabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  timeTab: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeights.medium,
    fontSize: theme.typography.fontSizes.md,
    opacity: 0.5,
    paddingHorizontal: theme.spacing.sm,
  },
  timeTabActive: {
    opacity: 1,
    textDecorationLine: 'underline',
  },
  categoryMain: {
    fontSize: theme.typography.fontSizes.xxl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  categoryMainLabel: {
    fontWeight: theme.typography.fontWeights.medium,
    color: theme.colors.text,
  },
  categorySubLabel: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.sm,
  },
  barChart: {
    marginVertical: 0,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: 'transparent',
  },
  barLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  barLabel: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textLight,
    textAlign: 'center',
    flex: 1,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  metricCard: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginRight: theme.spacing.sm,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  metricCardFull: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  metricLabel: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xs,
    fontWeight: theme.typography.fontWeights.medium,
  },
  metricValue: {
    fontSize: theme.typography.fontSizes.xxl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
  },
  metricSubValue: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
  },
  bottomTabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.xs,
  },
  bottomTab: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: theme.spacing.sm,
    fontSize: theme.typography.fontSizes.lg,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeights.medium,
    opacity: 0.7,
  },
  bottomTabActive: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    opacity: 1,
  },
});

export default AnalyticsScreen;
