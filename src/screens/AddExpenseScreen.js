import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import { useExpenses } from '../context/ExpenseContext';
import { useAI } from '../context/AIContext';
import { useVoice } from '../context/VoiceContext';
import { EXPENSE_CATEGORIES } from '../utils/constants';

const AddExpenseScreen = () => {
  const [expenseText, setExpenseText] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const { createExpense } = useExpenses();
  const { recognizeExpense, isRecognizing, apiKey } = useAI();
  const { isListening, startListening, stopListening, getLatestResult, isAvailable } = useVoice();
  
  // Listen for voice recognition results
  useEffect(() => {
    if (!isListening && getLatestResult()) {
      setExpenseText(getLatestResult());
      handleRecognize(getLatestResult());
    }
  }, [isListening]);

  const handleRecognize = async (text = expenseText) => {
    if (!text.trim()) {
      Alert.alert('Error', 'Please enter an expense description or use voice input');
      return;
    }
    
    if (!apiKey) {
      Alert.alert('API Key Required', 'Please set your OpenRouter API key in settings');
      return;
    }
    
    try {
      const result = await recognizeExpense(text);
      if (result) {
        if (result.amount) setAmount(result.amount.toString());
        if (result.category) setCategory(result.category);
        if (result.description) setDescription(result.description);
      }
    } catch (error) {
      Alert.alert('Recognition Error', error.message || 'Failed to recognize expense');
    }
  };

  const handleVoiceInput = async () => {
    if (isListening) {
      await stopListening();
    } else {
      if (!isAvailable) {
        Alert.alert('Error', 'Voice recognition is not available on this device');
        return;
      }
      
      const started = await startListening();
      if (!started) {
        Alert.alert('Error', 'Failed to start voice recognition');
      }
    }
  };

  const handleSave = async () => {
    if (!amount || !category) {
      Alert.alert('Error', 'Please enter amount and select category');
      return;
    }
    
    const expenseData = {
      title: description || category,
      amount,
      category,
      description,
      date: new Date().toISOString(),
    };
    
    const result = await createExpense(expenseData);
    if (result) {
      // Reset form
      setExpenseText('');
      setAmount('');
      setCategory('');
      setDescription('');
      Alert.alert('Success', 'Expense saved successfully');
    } else {
      Alert.alert('Error', 'Failed to save expense');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Add Expense</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.inputCard}>
          <Input
            value={expenseText}
            onChangeText={setExpenseText}
            placeholder="Enter your expense or use voice..."
            rightIcon={
              isListening ? (
                <ActivityIndicator color={theme.colors.primary} />
              ) : (
                <Ionicons name="mic-outline" size={24} color={theme.colors.primary} />
              )
            }
            onRightIconPress={handleVoiceInput}
            style={styles.expenseInput}
          />
          
          <Button
            title={isRecognizing ? 'Recognizing...' : 'Recognize'}
            onPress={() => handleRecognize()}
            loading={isRecognizing}
            style={styles.recognizeButton}
            disabled={!expenseText.trim() || isRecognizing}
          />
        </Card>

        <Card title="Expense Details" style={styles.detailsCard}>
          <Input
            label="Amount ($)"
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            keyboardType="numeric"
            style={styles.detailInput}
          />
          
          <Text style={styles.categoryLabel}>Category</Text>
          <View style={styles.categoriesContainer}>
            {EXPENSE_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryItem,
                  category === cat.name && styles.selectedCategory,
                ]}
                onPress={() => setCategory(cat.name)}
              >
                <Ionicons
                  name={cat.icon}
                  size={24}
                  color={
                    category === cat.name
                      ? theme.colors.primary
                      : theme.colors.textLight
                  }
                />
                <Text
                  style={[
                    styles.categoryText,
                    category === cat.name && styles.selectedCategoryText,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Input
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Enter description"
            multiline
            numberOfLines={3}
            style={styles.detailInput}
          />
          
          <Button
            title="Save Expense"
            onPress={handleSave}
            style={styles.saveButton}
            disabled={!amount || !category}
          />
        </Card>
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
  inputCard: {
    marginTop: theme.spacing.md,
  },
  expenseInput: {
    marginBottom: theme.spacing.sm,
  },
  recognizeButton: {
    marginBottom: theme.spacing.xs,
  },
  detailsCard: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  detailInput: {
    marginBottom: theme.spacing.md,
  },
  categoryLabel: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.md,
  },
  categoryItem: {
    width: '25%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
  },
  selectedCategory: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.md,
  },
  categoryText: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  selectedCategoryText: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeights.medium,
  },
  saveButton: {
    marginTop: theme.spacing.md,
  },
});

export default AddExpenseScreen;
