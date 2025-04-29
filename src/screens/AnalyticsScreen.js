import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit'; // Removed PieChart as it's not used
import { Dimensions } from 'react-native';
import theme from '../theme';
import Card from '../components/Card';
// import TimeFilter from '../components/TimeFilter'; // Removed as bottom tabs are used
import { useExpenses } from '../context/ExpenseContext';
// Simplified imports - assuming helpers handle calculations
import { generateLineChartData, groupExpensesByCategory, formatCurrency, getPeriodInfo } from '../utils/helpers'; 
import { useUser } from '../context/UserContext';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width - (theme.spacing.lg * 2); // Use theme spacing

const AnalyticsScreen = () => {
  const { 
    expenses, // Use raw expenses for calculations within the selected period
    selectedPeriod, 
    changePeriod, 
    isLoading 
  } = useExpenses();
  const { user } = useUser();
  
  // State for calculated analytics data
  const [periodExpenses, setPeriodExpenses] = useState([]);
  const [lineChartData, setLineChartData] = useState({ labels: [], datasets: [{ data: [0] }] });
  const [barChartData, setBarChartData] = useState({ labels: [], datasets: [{ data: [0] }] });
  const [totalSpent, setTotalSpent] = useState(0);
  const [mostSpentCategory, setMostSpentCategory] = useState({ name: '-', amount: 0 });
  const [avgSpending, setAvgSpending] = useState(0); // Changed to avgSpending (can be daily/weekly/monthly)
  const [periodLabel, setPeriodLabel] = useState('Current Period');
  const [categorySummary, setCategorySummary] = useState({ name: '-', amount: 0 });

  useEffect(() => {
    // 1. Filter expenses based on the selectedPeriod ('Day', 'Week', 'Month')
    const { startDate, endDate, days, label } = getPeriodInfo(selectedPeriod);
    setPeriodLabel(label); // e.g., "This Week", "This Month"
    
    const filtered = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate >= startDate && expDate <= endDate;
    });
    setPeriodExpenses(filtered);

    if (filtered.length > 0) {
      // 2. Calculate Total Spent for the period
      const total = filtered.reduce((sum, exp) => sum + exp.amount, 0);
      setTotalSpent(total);

      // 3. Generate Line Chart Data (e.g., daily totals for the week/month)
      const lineData = generateLineChartData(filtered, selectedPeriod, startDate, endDate);
      setLineChartData(lineData);

      // 4. Group by Category and Generate Bar Chart Data
      const grouped = groupExpensesByCategory(filtered);
      const sortedCategories = Object.entries(grouped).sort(([, a], [, b]) => b - a);
      
      // Use top 4 categories for bar chart, ensure labels match data
      const topCategories = sortedCategories.slice(0, 4);
      setBarChartData({
        labels: topCategories.map(([name]) => name.length > 8 ? name.slice(0, 7) + '…' : name), // Shorter labels
        datasets: [{ data: topCategories.map(([, amount]) => amount) }]
      });
      
      // Set summary for the top category
      if (topCategories.length > 0) {
        setCategorySummary({ name: topCategories[0][0], amount: topCategories[0][1] });
      } else {
        setCategorySummary({ name: '-', amount: 0 });
      }

      // 5. Find Most Spent Category
      if (sortedCategories.length > 0) {
        setMostSpentCategory({ name: sortedCategories[0][0], amount: sortedCategories[0][1] });
      } else {
        setMostSpentCategory({ name: '-', amount: 0 });
      }

      // 6. Calculate Average Spending (daily for week/month, monthly for year?)
      // For simplicity, let's stick to Avg Daily for Day/Week/Month periods
      if (days > 0) {
        setAvgSpending(total / days);
      } else {
        setAvgSpending(0); // Avoid division by zero
      }

    } else {
      // Reset states if no expenses in the period
      setLineChartData({ labels: [], datasets: [{ data: [0] }] });
      setBarChartData({ labels: [], datasets: [{ data: [0] }] });
      setTotalSpent(0);
      setMostSpentCategory({ name: '-', amount: 0 });
      setAvgSpending(0);
      setCategorySummary({ name: '-', amount: 0 });
    }
  }, [expenses, selectedPeriod, user.currency]); // Rerun when expenses or period change

  const chartConfig = {
    backgroundGradientFrom: theme.colors.background, // Match background
    backgroundGradientTo: theme.colors.background,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(123, 78, 255, ${opacity})`, // Primary color #7B4EFF
    labelColor: (opacity = 1) => `rgba(183, 168, 214, ${opacity})`, // Lighter text color #B7A8D6
    style: { borderRadius: 16 },
    propsForDots: {
      r: "0", // Hide dots
      strokeWidth: "0",
    },
    propsForBackgroundLines: {
      stroke: theme.colors.border, // Use border color #E5DDF6
      strokeDasharray: '', // Solid lines
    },
    propsForLabels: { 
      fontSize: 10, // Smaller font size for labels
      // dx: -5, // Adjust label position if needed
    },
    barPercentage: 0.6, // Adjust bar width
    // fillShadowGradient: theme.colors.primary, // Optional: Add gradient below line
    // fillShadowGradientOpacity: 0.1,
  };
  
  // Specific config for Bar chart to remove vertical labels
  const barChartSpecificConfig = {
    ...chartConfig,
    propsForVerticalLabels: { enabled: false }, // Hide Y-axis labels if needed
    propsForHorizontalLabels: { 
      fontSize: 10, // Font size for X-axis labels
      // dy: 5, // Adjust label position if needed
    },
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator style={styles.loader} size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Analytics</Text>
        {/* Settings Icon - Consider adding navigation if needed */}
        <TouchableOpacity onPress={() => console.log('Settings pressed')}> 
          <Ionicons name="settings-outline" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Expenses Over Time */}
        <Text style={styles.sectionLabel}>Expenses Over Time</Text>
        <Text style={styles.bigNumber}>{formatCurrency(totalSpent, user.currency)}</Text>
        {/* Removed percentage change for now */}
        <Text style={styles.periodChange}>{periodLabel}</Text> 
        
        {lineChartData.labels.length > 0 ? (
          <LineChart
            data={lineChartData}
            width={screenWidth}
            height={150} // Increased height for better visibility
            chartConfig={chartConfig}
            bezier // Smooth line
            style={styles.chartStyle}
            withInnerLines={true} // Show background lines
            withOuterLines={false}
            withShadow={false} // Disable default shadow
            fromZero={true} // Start Y-axis from 0
            // yAxisLabel={user.currency || '$'} // Optional: Add currency symbol to Y-axis
            // yLabelsOffset={5}
            // xLabelsOffset={-5}
          />
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>No expense data for this period.</Text>
          </View>
        )}
        
        {/* Removed top time tabs (1D, 1W, etc.) */}

        {/* Expenses by Category */}
        <Text style={styles.sectionLabel}>Expenses by Category</Text>
        <Text style={styles.categoryMain}>
          <Text style={styles.categoryMainLabel}>{categorySummary.name !== '-' ? `${categorySummary.name}: ` : ''}</Text>
          {formatCurrency(categorySummary.amount, user.currency)}
        </Text>
        <Text style={styles.categorySubLabel}>{periodLabel}</Text>
        
        {barChartData.labels.length > 0 ? (
          <BarChart
            data={barChartData}
            width={screenWidth}
            height={180} // Increased height
            chartConfig={barChartSpecificConfig} // Use specific config
            fromZero
            showValuesOnTopOfBars={false} // Values not shown in screenshot
            withInnerLines={false} // No horizontal grid lines in screenshot
            withHorizontalLabels={false} // No Y-axis labels in screenshot
            style={styles.chartStyle}
            // verticalLabelRotation={-30} // Rotate labels if they overlap
          />
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>No category data for this period.</Text>
          </View>
        )}
        
        {/* Removed separate bar label row, labels are part of the chart */}

        {/* Cards with metrics */}
        <View style={styles.metricsRow}>
          <Card style={styles.metricCard}> 
            <Text style={styles.metricLabel}>Total Spent</Text>
            <Text style={styles.metricValue}>{formatCurrency(totalSpent, user.currency)}</Text>
            {/* <Text style={styles.metricSubValue}>{periodLabel}</Text> */}
          </Card>
          <Card style={styles.metricCard}> 
            <Text style={styles.metricLabel}>Most Spent Category</Text>
            <Text style={styles.metricValue}>{mostSpentCategory.name}</Text>
            <Text style={styles.metricSubValue}>{formatCurrency(mostSpentCategory.amount, user.currency)}</Text>
          </Card>
        </View>
        <View style={styles.metricsRow}>
          <Card style={styles.metricCardFull}> 
            <Text style={styles.metricLabel}>Avg Daily Spending</Text>
            <Text style={styles.metricValue}>{formatCurrency(avgSpending, user.currency)}</Text>
            {/* <Text style={styles.metricSubValue}>{periodLabel}</Text> */}
          </Card>
        </View>
        
        {/* Bottom Period Selection Tabs */}
        <View style={styles.bottomTabs}>
          {['Day', 'Week', 'Month'].map(opt => (
            <TouchableOpacity
              key={opt}
              style={[styles.bottomTab, selectedPeriod === opt && styles.bottomTabActive]}
              onPress={() => changePeriod(opt)}
            >
              <Text style={[styles.bottomTabText, selectedPeriod === opt && styles.bottomTabTextActive]}>
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl, // Adjust top padding if needed
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
    fontSize: theme.typography.fontSizes.lg, // Slightly larger section label
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xs,
    fontWeight: theme.typography.fontWeights.semiBold, // Bolder section label
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
    marginBottom: theme.spacing.md, // Increased margin below period label
  },
  positive: { // Style for positive change (if added back)
    color: theme.colors.success,
    fontWeight: theme.typography.fontWeights.semiBold,
  },
  chartStyle: {
    marginVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    paddingRight: 0, // Remove default padding if it causes issues
    marginRight: -theme.spacing.sm, // Offset potential chart padding
  },
  placeholderContainer: {
    height: 150, // Match chart height
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.secondary, // Light background for placeholder
    borderRadius: theme.borderRadius.lg,
    marginVertical: theme.spacing.sm,
  },
  placeholderText: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textLight,
  },
  categoryMain: {
    fontSize: theme.typography.fontSizes.xxl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  categoryMainLabel: {
    fontWeight: theme.typography.fontWeights.medium, // Match screenshot style
    color: theme.colors.text,
  },
  categorySubLabel: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.md, // Increased margin
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md, // Use gap for spacing between cards
  },
  metricCard: {
    flex: 1,
    // Use Card component's default styling, add specific overrides if needed
    // backgroundColor: theme.colors.card, // Handled by Card component
    // borderRadius: theme.borderRadius.lg, // Handled by Card component
    padding: theme.spacing.lg,
    alignItems: "flex-start",
    // borderWidth: 1, // Removed border, rely on Card shadow
    // borderColor: theme.colors.border,
  },
  metricCardFull: {
    flex: 1,
    // Use Card component's default styling
    padding: theme.spacing.lg,
    alignItems: "flex-start",
  },
  metricLabel: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xs,
    fontWeight: theme.typography.fontWeights.medium,
  },
  metricValue: {
    fontSize: theme.typography.fontSizes.xl, // Slightly smaller metric value
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
  },
  metricSubValue: {
    fontSize: theme.typography.fontSizes.sm, // Smaller sub-value text
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
  },
  bottomTabs: {
    flexDirection: "row",
    justifyContent: "space-around", // Use space-around for equal spacing
    backgroundColor: theme.colors.secondary, // Light background for tab container
    borderRadius: theme.borderRadius.lg, // Rounded corners for container
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl, // More margin at the bottom
    padding: theme.spacing.xs, // Padding inside the container
    overflow: "hidden", // Ensure active tab background stays within bounds
  },
  bottomTab: {
    flex: 1,
    borderRadius: theme.borderRadius.md, // Rounded corners for individual tabs (for active state)
    paddingVertical: theme.spacing.sm,
    margin: theme.spacing.xs, // Add small margin around tabs
  },
  bottomTabText: {
    textAlign: "center",
    fontSize: theme.typography.fontSizes.md, // Standard text size
    color: theme.colors.primary, // Default text color
    fontWeight: theme.typography.fontWeights.medium,
    opacity: 0.7, // Default opacity for inactive tabs
  },
  bottomTabActive: {
    backgroundColor: theme.colors.card, // White background for active tab
    // Shadow for active tab (optional, match screenshot)
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  bottomTabTextActive: {
    color: theme.colors.primary, // Ensure text color is primary
    opacity: 1, // Full opacity for active tab text
    fontWeight: theme.typography.fontWeights.semiBold, // Slightly bolder text
  },
});

export default AnalyticsScreen;
