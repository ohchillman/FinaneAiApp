import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity, 
  TouchableWithoutFeedback, 
  Keyboard, 
  Platform,
  Modal
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, CalendarList } from 'react-native-calendars';

// Assuming theme object might exist elsewhere or defining fallback colors
const theme = {
  colors: {
    background: '#FFFFFF',
    primary: '#734F96',
    text: '#333333',
    textLight: '#888888',
    inputBackground: '#F0F0F0',
    border: '#D1D5DB',
    white: '#FFFFFF',
  },
  spacing: {
    sm: 8,
    md: 16,
    lg: 20,
    xl: 24,
  },
  typography: {
    fontSizes: {
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 28,
    },
    fontWeights: {
      regular: '400',
      medium: '500',
      bold: '700',
    },
  },
  shadows: {
    light: {
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.18,
      shadowRadius: 1.00,
      elevation: 1,
    },
    medium: {
       shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
    }
  }
};

import ExpenseItem from '../components/ExpenseItem';
import TimeFilter from '../components/TimeFilter';
import DropdownFilter from '../components/DropdownFilter'; // Updated component
import { useExpenses } from '../context/ExpenseContext';
import { useUser } from '../context/UserContext';
import { EXPENSE_CATEGORIES } from '../utils/constants';

const ExpensesScreen = ({ navigation }) => {
  const {
    filteredExpenses,
    isLoading,
    refreshExpenses,
    filterExpensesByCategory,
    filterExpensesBySearch,
    changeDateRangeFilter,
    changeSortCriteria,
    dateRangeFilter,
    sortCriteria
  } = useExpenses();
  const { user } = useUser();
  const insets = useSafeAreaInsets();

  // State for filters
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedSort, setSelectedSort] = useState(sortCriteria || 'Date');
  const [searchText, setSearchText] = useState('');
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  // State for calendar date picker
  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [markedDates, setMarkedDates] = useState({});
  const [calendarKey, setCalendarKey] = useState(Date.now().toString()); // Force re-render when needed

  // Determine the display value for the Period dropdown
  const getPeriodDisplayValue = () => {
    if (typeof dateRangeFilter === 'object' && dateRangeFilter?.type === 'custom') {
      const start = dateRangeFilter.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const end = dateRangeFilter.endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `${start} - ${end}`;
    }
    return dateRangeFilter || 'Last 30 Days'; // Fallback to string value
  };

  const [selectedPeriodDisplay, setSelectedPeriodDisplay] = useState(getPeriodDisplayValue());

  // Sync local state with context when context values change
  useEffect(() => {
    setSelectedPeriodDisplay(getPeriodDisplayValue());
  }, [dateRangeFilter]);

  useEffect(() => {
    setSelectedSort(sortCriteria || 'Date');
  }, [sortCriteria]);

  // Update marked dates when start/end dates change
  useEffect(() => {
    updateMarkedDates();
  }, [startDate, endDate]);

  // Function to update marked dates for calendar
  const updateMarkedDates = () => {
    const newMarkedDates = {};
    
    if (startDate && endDate) {
      // Format dates for the calendar
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Mark start date
      const startDateStr = start.toISOString().split('T')[0];
      newMarkedDates[startDateStr] = {
        startingDay: true,
        color: '#734F96',
        textColor: 'white'
      };
      
      // Mark end date
      const endDateStr = end.toISOString().split('T')[0];
      if (startDateStr !== endDateStr) {
        newMarkedDates[endDateStr] = {
          endingDay: true,
          color: '#734F96',
          textColor: 'white'
        };
        
        // Mark dates in between
        const currentDate = new Date(start);
        currentDate.setDate(currentDate.getDate() + 1);
        
        while (currentDate < end) {
          const dateStr = currentDate.toISOString().split('T')[0];
          newMarkedDates[dateStr] = {
            color: '#EDE8F2',
            textColor: '#734F96'
          };
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
    } else if (startDate) {
      // Only start date is selected
      const startDateStr = new Date(startDate).toISOString().split('T')[0];
      newMarkedDates[startDateStr] = {
        selected: true,
        color: '#734F96',
        textColor: 'white'
      };
    }
    
    setMarkedDates(newMarkedDates);
  };

  // Options for dropdowns - Add 'Custom Range'
  const categoryOptions = ['All Categories', ...EXPENSE_CATEGORIES.map(cat => cat.name)];
  const periodOptions = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'This Year', 'Custom Range'];
  const sortOptions = ["Date", "Amount", "Category", "Name"];

  // Handle category change
  const handleCategoryChange = (newCategory) => {
    setSelectedCategory(newCategory);
    filterExpensesByCategory(newCategory === 'All Categories' ? null : newCategory);
  };

  // Handle date range change
  const handleDateRangeChange = (newRange) => {
    if (newRange === 'Custom Range') {
      // Reset dates and open calendar
      setStartDate(null);
      setEndDate(null);
      setMarkedDates({});
      setCalendarKey(Date.now().toString()); // Force calendar re-render
      setCalendarVisible(true);
    } else {
      // For predefined ranges, update context directly
      changeDateRangeFilter(newRange);
    }
  };

  // Handle sort change
  const handleSortChange = (newSort) => {
    setSelectedSort(newSort);
    changeSortCriteria(newSort);
  };

  // Function to close all dropdowns
  const closeAllDropdowns = () => {
    setActiveDropdownId(null);
    Keyboard.dismiss();
  };

  // Calendar date selection handler
  const handleDayPress = (day) => {
    if (!startDate || (startDate && endDate)) {
      // First selection or new range
      setStartDate(day.dateString);
      setEndDate(null);
    } else {
      // Second selection - complete the range
      const selectedDate = new Date(day.dateString);
      const start = new Date(startDate);
      
      if (selectedDate < start) {
        // If selected date is before start date, swap them
        setEndDate(startDate);
        setStartDate(day.dateString);
      } else {
        setEndDate(day.dateString);
      }
    }
  };

  // Apply custom date range and close calendar
  const applyCustomDateRange = () => {
    if (startDate && endDate) {
      changeDateRangeFilter({
        type: 'custom',
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      });
      setCalendarVisible(false);
    }
  };

  // Cancel custom date range selection
  const cancelCustomDateRange = () => {
    setCalendarVisible(false);
    setStartDate(null);
    setEndDate(null);
  };

  return (
    <TouchableWithoutFeedback onPress={closeAllDropdowns}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Expenses</Text>
        </View>

        {/* Dropdown Filters */}
        <View style={styles.filterContainer}>
          {/* Row 1: Category & Period */}
          <View style={styles.filterRow}>
            <DropdownFilter
              id="category-filter"
              label="Category"
              value={selectedCategory}
              options={categoryOptions}
              onSelect={handleCategoryChange}
              style={[styles.filterItem, styles.filterItemFlex]}
              activeDropdownId={activeDropdownId}
              setActiveDropdownId={setActiveDropdownId}
            />
            <DropdownFilter
              id="period-filter"
              label="Period"
              value={selectedPeriodDisplay} // Use display value
              options={periodOptions}
              onSelect={handleDateRangeChange}
              style={[styles.filterItem, styles.filterItemFlex, { marginRight: 0 }]}
              activeDropdownId={activeDropdownId}
              setActiveDropdownId={setActiveDropdownId}
            />
          </View>
          {/* Row 2: Sort By */}
          <View style={styles.filterRow}>
             <DropdownFilter
              id="sort-filter"
              label="Sort By"
              value={selectedSort}
              options={sortOptions}
              onSelect={handleSortChange}
              style={[styles.filterItem, styles.filterItemThird, { marginRight: 0 }]}
              activeDropdownId={activeDropdownId}
              setActiveDropdownId={setActiveDropdownId}
            />
          </View>
        </View>

        {/* Expense List */}
        {isLoading ? (
          <ActivityIndicator style={styles.loader} size="large" color={theme.colors.primary} />
        ) : (
          <FlatList
            data={filteredExpenses}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ExpenseItem
                item={item}
                currency={user?.currency || '$'}
                onPress={() => navigation.navigate('Add', { expense: item })}
              />
            )}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={<Text style={styles.emptyText}>No expenses found.</Text>}
            onRefresh={refreshExpenses}
            refreshing={isLoading}
            keyboardShouldPersistTaps="handled"
          />
        )}

        {/* Calendar Modal for Date Range Selection */}
        <Modal
          transparent={true}
          visible={isCalendarVisible}
          animationType="fade"
          onRequestClose={cancelCustomDateRange}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.calendarContainer}>
              {/* Calendar Header */}
              <View style={styles.calendarHeader}>
                <Text style={styles.calendarTitle}>
                  {!startDate 
                    ? 'Select Start Date' 
                    : !endDate 
                      ? 'Select End Date' 
                      : 'Date Range Selected'}
                </Text>
              </View>
              
              {/* Calendar Component */}
              <Calendar
                key={calendarKey}
                onDayPress={handleDayPress}
                markedDates={markedDates}
                markingType="period"
                maxDate={new Date().toISOString().split('T')[0]} // Can't select future dates
                theme={{
                  calendarBackground: '#FFFFFF',
                  textSectionTitleColor: '#734F96',
                  selectedDayBackgroundColor: '#734F96',
                  selectedDayTextColor: '#FFFFFF',
                  todayTextColor: '#734F96',
                  dayTextColor: '#333333',
                  textDisabledColor: '#D9DADC',
                  dotColor: '#734F96',
                  selectedDotColor: '#FFFFFF',
                  arrowColor: '#734F96',
                  monthTextColor: '#734F96',
                  indicatorColor: '#734F96',
                  textDayFontWeight: '300',
                  textMonthFontWeight: 'bold',
                  textDayHeaderFontWeight: '500',
                  textDayFontSize: 16,
                  textMonthFontSize: 16,
                  textDayHeaderFontSize: 14
                }}
              />
              
              {/* Selected Date Range Display */}
              <View style={styles.selectedRangeContainer}>
                <Text style={styles.selectedRangeText}>
                  {startDate 
                    ? `Start: ${new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` 
                    : 'Start: Not selected'}
                </Text>
                <Text style={styles.selectedRangeText}>
                  {endDate 
                    ? `End: ${new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` 
                    : 'End: Not selected'}
                </Text>
              </View>
              
              {/* Action Buttons */}
              <View style={styles.calendarActions}>
                <TouchableOpacity 
                  style={[styles.calendarButton, styles.calendarCancelButton]} 
                  onPress={cancelCustomDateRange}
                >
                  <Text style={styles.calendarButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.calendarButton, 
                    styles.calendarApplyButton,
                    (!startDate || !endDate) && styles.calendarButtonDisabled
                  ]} 
                  onPress={applyCustomDateRange}
                  disabled={!startDate || !endDate}
                >
                  <Text style={[
                    styles.calendarButtonText, 
                    styles.calendarApplyText,
                    (!startDate || !endDate) && styles.calendarButtonTextDisabled
                  ]}>
                    Apply
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: Platform.OS === 'android' ? theme.spacing.xl : theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: theme.typography.fontWeights.bold,
    color: '#000000',
  },
  settingsIcon: {
    padding: theme.spacing.sm,
  },
  filterContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    zIndex: 10, 
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  filterItem: {
    marginRight: theme.spacing.sm,
  },
  filterItemFlex: {
    flex: 1,
  },
  filterItemThird: {
     flexGrow: 0.6,
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  searchInput: {
    backgroundColor: theme.colors.inputBackground,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textLight,
  },
  // Calendar Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  calendarHeader: {
    backgroundColor: '#EDE8F2',
    paddingVertical: 15,
    alignItems: 'center',
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#734F96',
  },
  selectedRangeContainer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#EDE8F2',
  },
  selectedRangeText: {
    fontSize: 16,
    color: '#333333',
    marginVertical: 2,
  },
  calendarActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#EDE8F2',
  },
  calendarButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarCancelButton: {
    backgroundColor: '#F0F0F0',
  },
  calendarApplyButton: {
    backgroundColor: '#EDE8F2',
  },
  calendarButtonDisabled: {
    backgroundColor: '#F0F0F0',
    opacity: 0.7,
  },
  calendarButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  calendarApplyText: {
    color: '#734F96',
    fontWeight: '600',
  },
  calendarButtonTextDisabled: {
    color: '#999999',
  },
});

export default ExpensesScreen;
