import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native'; // Import useRoute and useNavigation
import theme from '../theme';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import { useExpenses } from '../context/ExpenseContext';
import { useAI } from '../context/AIContext';
import { useVoice } from '../context/VoiceContext';
import { EXPENSE_CATEGORIES } from '../utils/constants';

const AddExpenseScreen = () => {
  const route = useRoute(); // Get route object
  const navigation = useNavigation(); // Get navigation object
  const expenseToEdit = route.params?.expense; // Check if an expense was passed for editing

  const [isEditing, setIsEditing] = useState(!!expenseToEdit); // Flag for edit mode
  const [expenseId, setExpenseId] = useState(expenseToEdit?.id || null);
  const [expenseText, setExpenseText] = useState(''); // Keep this for AI/Voice input
  const [amount, setAmount] = useState(expenseToEdit?.amount?.toString() || '');
  const [category, setCategory] = useState(expenseToEdit?.category || '');
  const [description, setDescription] = useState(expenseToEdit?.description || '');
  // Need updateExpense and deleteExpense from context
  const { addExpense, updateExpense, deleteExpense } = useExpenses();
  const { recognizeExpense, isRecognizing, apiKey } = useAI();
  const { isListening, startListening, stopListening, getLatestResult, isAvailable } = useVoice();

  // Populate fields if editing or reset if adding
  useEffect(() => {
    if (expenseToEdit) {
      setAmount(expenseToEdit.amount?.toString() || '');
      setCategory(expenseToEdit.category || '');
      setDescription(expenseToEdit.description || '');
      setExpenseId(expenseToEdit.id);
      setIsEditing(true);
    } else {
      // Reset fields if navigating here without an expense (for adding new)
      setAmount('');
      setCategory('');
      setDescription('');
      setExpenseId(null);
      setIsEditing(false);
    }
  }, [expenseToEdit]); // Re-run effect if expenseToEdit changes
  
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
      Alert.alert("Error", "Please enter amount and select category");
      return;
    }

    const expenseData = {
      title: description || category,
      amount: parseFloat(amount), // Ensure amount is a number
      category,
      description,
      date: isEditing ? expenseToEdit.date : new Date().toISOString(), // Keep original date if editing
    };

    let result;
    if (isEditing) {
      result = await updateExpense(expenseId, expenseData);
    } else {
      result = await addExpense(expenseData);
    }

    if (result) {
      // Reset form and navigate back
      setExpenseText("");
      setAmount("");
      setCategory("");
      setDescription("");
      Alert.alert("Success", `Expense ${isEditing ? "updated" : "saved"} successfully`);
      navigation.goBack(); // Navigate back after saving/updating
    } else {
      Alert.alert("Error", `Failed to ${isEditing ? "update" : "save"} expense`);
    }
  };

  const handleDelete = async () => {
    if (!isEditing || !expenseId) return;

    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this expense?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const result = await deleteExpense(expenseId);
            if (result) {
              Alert.alert("Success", "Expense deleted successfully");
              navigation.goBack(); // Navigate back after deleting
            } else {
              Alert.alert("Error", "Failed to delete expense");
            }
          },
        },
      ]
    );
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
            title={isEditing ? "Update Expense" : "Save Expense"} // Change button title based on mode
            onPress={handleSave}
            style={styles.saveButton}
            disabled={!amount || !category}
          />
          {/* Add Delete Button if editing */}
          {isEditing && (
            <Button
              title="Delete Expense"
              onPress={handleDelete}
              style={styles.deleteButton}
              variant="outline" // Use outline style for delete
            />
          )}
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
  inputCard: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  detailInput: {
    marginBottom: theme.spacing.md,
  },
  categoryLabel: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xs,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.md,
  },
  categoryItem: {
    flexDirection: 'row', // Arrange icon and text horizontally
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm, // Adjust padding
    paddingHorizontal: theme.spacing.md, // Adjust padding
    backgroundColor: theme.colors.secondary, // Light grey background for unselected
    borderRadius: theme.borderRadius.round, // Pill shape
    marginRight: theme.spacing.sm, // Add spacing between items
    marginBottom: theme.spacing.sm, // Add spacing between rows
    borderWidth: 1, // Add border
    borderColor: theme.colors.secondary, // Border color matches background for unselected
  },
  selectedCategory: {
    backgroundColor: theme.colors.background, // Use background color for selected
    borderColor: theme.colors.primary, // Primary color border for selected
  },
  categoryText: {
    fontSize: theme.typography.fontSizes.sm, // Slightly larger font size
    color: theme.colors.textLight,
    marginLeft: theme.spacing.xs, // Add space between icon and text
    textAlign: 'center',
  },
  selectedCategoryText: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeights.medium,
  },
  saveButton: {
    marginTop: theme.spacing.md,
  },
  deleteButton: {
    marginTop: theme.spacing.sm, // Add margin for delete button
    borderColor: theme.colors.error, // Use error color for border
  },
});

export default AddExpenseScreen;
