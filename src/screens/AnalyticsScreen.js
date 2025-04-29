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
    backgroundColor: '#F8F5FF',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#181028',
    flex: 1,
    textAlign: 'left',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionLabel: {
    fontSize: 15,
    color: '#6B5A8E',
    marginTop: 18,
    marginBottom: 2,
    fontWeight: '500',
  },
  bigNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#181028',
    marginBottom: 2,
    marginTop: 2,
  },
  periodChange: {
    fontSize: 14,
    color: '#B7A8D6',
    marginBottom: 8,
  },
  positive: {
    color: '#3CBF61',
    fontWeight: 'bold',
  },
  lineChart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  timeTabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 8,
  },
  timeTab: {
    color: '#7B4EFF',
    fontWeight: '500',
    fontSize: 15,
    opacity: 0.5,
    paddingHorizontal: 6,
  },
  timeTabActive: {
    opacity: 1,
    textDecorationLine: 'underline',
  },
  categoryMain: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#181028',
    marginTop: 8,
    marginBottom: 2,
  },
  categoryMainLabel: {
    fontWeight: '500',
    color: '#181028',
  },
  categorySubLabel: {
    fontSize: 13,
    color: '#B7A8D6',
    marginBottom: 8,
  },
  barChart: {
    marginVertical: 0,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  barLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
    marginBottom: 12,
  },
  barLabel: {
    fontSize: 13,
    color: '#B7A8D6',
    textAlign: 'center',
    flex: 1,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#F8F5FF',
    borderRadius: 18,
    padding: 16,
    marginRight: 8,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#E5DDF6',
  },
  metricCardFull: {
    flex: 1,
    backgroundColor: '#F8F5FF',
    borderRadius: 18,
    padding: 16,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#E5DDF6',
  },
  metricLabel: {
    fontSize: 15,
    color: '#6B5A8E',
    marginBottom: 4,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#181028',
  },
  metricSubValue: {
    fontSize: 15,
    color: '#B7A8D6',
    marginTop: 2,
  },
  bottomTabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#ECE6F7',
    borderRadius: 16,
    marginTop: 18,
    marginBottom: 18,
    padding: 4,
  },
  bottomTab: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: 8,
    fontSize: 16,
    color: '#7B4EFF',
    fontWeight: '500',
    opacity: 0.7,
  },
  bottomTabActive: {
    backgroundColor: '#fff',
    borderRadius: 12,
    opacity: 1,
  },
});

export default AnalyticsScreen;
