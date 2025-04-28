import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import theme from '../theme';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import ExpenseChart from '../components/ExpenseChart';
import TimeFilter from '../components/TimeFilter';
import { useExpenses } from '../context/ExpenseContext';
import { useUser } from '../context/UserContext';
import { useAI } from '../context/AIContext';
import { useVoice } from '../context/VoiceContext';
import { generateChartData, formatCurrency } from '../utils/helpers';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const [expenseText, setExpenseText] = useState('');
  const { 
    filteredExpenses, 
    totalAmount, 
    selectedPeriod, 
    changePeriod, 
    isLoading,
    refreshExpenses
  } = useExpenses();
  const { user, isDebugMode } = useUser();
  const { recognizeExpense, isRecognizing } = useAI();
  const { isListening, startListening, stopListening, getLatestResult } = useVoice();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [chartData, setChartData] = useState({
    labels: ['1D', '1W', '1M', '3M', '1Y'],
    datasets: [{ data: [0, 0, 0, 0, 0] }],
  });

  // Generate chart data when expenses change
  useEffect(() => {
    if (filteredExpenses.length > 0) {
      const data = generateChartData(filteredExpenses, selectedPeriod);
      setChartData(data);
    }
  }, [filteredExpenses, selectedPeriod]);

  // Listen for voice recognition results
  useEffect(() => {
    if (!isListening && getLatestResult()) {
      setExpenseText(getLatestResult());
      handleRecognize(getLatestResult());
    }
  }, [isListening]);

  // Handle recognize button press
  const handleRecognize = async (text = expenseText) => {
    if (!text.trim()) return;
    
    try {
      const result = await recognizeExpense(text);
      if (result) {
        // Navigate to add expense screen with pre-filled data
        navigation.navigate('Add', {
          amount: result.amount ? result.amount.toString() : '',
          category: result.category || '',
          description: result.description || ''
        });
      }
    } catch (error) {
      console.error('Recognition error:', error);
    }
  };

  // Handle voice input
  const handleVoiceInput = async () => {
    if (isListening) {
      await stopListening();
    } else {
      await startListening();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Personal</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.expenseSection}>
          <Text style={styles.expenseLabel}>Expense for period</Text>
          {isLoading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} />
          ) : (
            <>
              <Text style={styles.expenseAmount}>
                {formatCurrency(totalAmount, user.currency)}
              </Text>
              <View style={styles.expenseChange}>
                <Text style={styles.expenseChangeText}>Last 30 Days</Text>
                <Text style={styles.expenseChangePercent}>+12%</Text>
              </View>
            </>
          )}
        </View>
        
        <View style={styles.chartContainer}>
          <ExpenseChart data={chartData} />
          
          {/* Use timeFilter naming convention from remote */}
          <View style={styles.timeFilterContainer}>
            <TouchableOpacity 
              style={styles.timeFilterOption}
              onPress={() => changePeriod('Day')}
            >
              <Text style={[
                styles.timeFilterText, 
                selectedPeriod === 'Day' && styles.activeTimeFilterText
              ]}>1D</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.timeFilterOption}
              onPress={() => changePeriod('Week')}
            >
              <Text style={[
                styles.timeFilterText, 
                selectedPeriod === 'Week' && styles.activeTimeFilterText
              ]}>1W</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.timeFilterOption}
              onPress={() => changePeriod('Month')}
            >
              <Text style={[
                styles.timeFilterText, 
                selectedPeriod === 'Month' && styles.activeTimeFilterText
              ]}>1M</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.timeFilterOption}
              onPress={() => changePeriod('3M')}
            >
              <Text style={[
                styles.timeFilterText, 
                selectedPeriod === '3M' && styles.activeTimeFilterText
              ]}>3M</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.timeFilterOption}
              onPress={() => changePeriod('Year')}
            >
              <Text style={[
                styles.timeFilterText, 
                selectedPeriod === 'Year' && styles.activeTimeFilterText
              ]}>1Y</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.timeFilterSection}>
          <TimeFilter
            options={['Day', 'Week', 'Month']}
            selectedOption={selectedPeriod}
            onSelect={changePeriod}
            style={styles.timeFilter}
          />
        </View>

        <View style={styles.inputContainer}>
          <Input
            value={expenseText}
            onChangeText={setExpenseText}
            placeholder="Enter your expense..."
            rightIcon={
              isListening ? (
                <ActivityIndicator color={theme.colors.primary} />
              ) : (
                <Ionicons name="mic-outline" size={24} color={theme.colors.primary} />
              )
            }
            onRightIconPress={handleVoiceInput}
            style={styles.input}
          />
          <Button 
            title="Recognize" 
            onPress={() => handleRecognize()}
            loading={isRecognizing}
            disabled={!expenseText.trim() || isRecognizing}
            style={styles.recognizeButton}
          />
          <Text style={styles.recognizeDescription}>
            Automatically assign category based on description by AI
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  debugIndicator: {
    backgroundColor: theme.colors.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: [{ translateX: -25 }],
  },
  debugText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
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
  settingsButton: {
    padding: theme.spacing.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  expenseSection: {
    marginTop: theme.spacing.md,
  },
  expenseLabel: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  expenseAmount: {
    fontSize: theme.typography.fontSizes.xxxl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
  },
  expenseChange: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  expenseChangeText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textLight,
    marginRight: theme.spacing.xs,
  },
  expenseChangePercent: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.semiBold,
    color: theme.colors.success,
  },
  chartContainer: {
    marginVertical: theme.spacing.md,
    alignItems: 'center', // Center align for proper chart positioning
    width: '100%', // Ensure container takes full width
  },
  // Use timeFilter naming convention from remote
  timeFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
    width: '100%', // Ensure the filter takes full width
    paddingHorizontal: theme.spacing.sm, // Add padding for better alignment with chart
  },
  timeFilterOption: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
  timeFilterText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textLight,
  },
  activeTimeFilterText: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeights.semiBold,
  },
  timeFilterSection: {
    marginVertical: theme.spacing.md,
  },
  timeFilter: {
    width: '100%',
  },
  inputContainer: {
    marginTop: theme.spacing.md,
  },
  input: {
    marginBottom: theme.spacing.sm,
  },
  recognizeButton: {
    marginBottom: theme.spacing.sm,
  },
  recognizeDescription: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
});

export default HomeScreen;

