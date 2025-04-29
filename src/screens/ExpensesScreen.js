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
import theme from '../theme';

import ExpenseItem from '../components/ExpenseItem';
import TimeFilter from '../components/TimeFilter';
import DropdownFilter from '../components/DropdownFilter';
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
          {/* Add Settings Icon based on screenshot */}
          <TouchableOpacity style={styles.settingsIcon}>
            <Ionicons name="settings-outline" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {/* Dropdown Filters */}
        <View style={styles.filterContainer}>
          {/* Single Row for all filters */}
          <View style={styles.filterRow}>
            <DropdownFilter
              id="category-filter"
              label="Category"
              value={selectedCategory}
              options={categoryOptions}
              onSelect={handleCategoryChange}
              style={styles.filterItem} // Use default flex: 1
              activeDropdownId={activeDropdownId}
              setActiveDropdownId={setActiveDropdownId}
            />
            <DropdownFilter
              id="period-filter"
              label="Period"
              value={selectedPeriodDisplay} // Use display value
              options={periodOptions}
              onSelect={handleDateRangeChange}
              style={styles.filterItem} // Use default flex: 1
              activeDropdownId={activeDropdownId}
              setActiveDropdownId={setActiveDropdownId}
            />
             <DropdownFilter
              id="sort-filter"
              label="Sort By"
              value={selectedSort}
              options={sortOptions}
              onSelect={handleSortChange}
              style={styles.filterItem} // Use default flex: 1
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
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.fontSizes.xxxl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text,
  },
  settingsIcon: {
    padding: theme.spacing.sm,
  },
  filterContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    zIndex: 10,
    backgroundColor: theme.colors.background,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  filterItem: {
    flex: 1,
  },
  filterItemFlex: {
    flex: 1,
  },
  filterItemThird: {
    flex: 0.5,
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  searchInput: {
    backgroundColor: theme.colors.inputBackground,
    borderRadius: theme.borderRadius.round,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
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
    marginTop: theme.spacing.xxl,
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.textLight,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarContainer: {
    width: '90%',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  calendarHeader: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  calendarTitle: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.semiBold,
    color: theme.colors.primary,
  },
  selectedRangeContainer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  selectedRangeText: {
    fontSize: theme.typography.fontSizes.lg,
    color: theme.colors.text,
    marginVertical: theme.spacing.xs,
  },
  calendarActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  calendarButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    flex: 1,
    marginHorizontal: theme.spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarCancelButton: {
    backgroundColor: theme.colors.inputBackground,
  },
  calendarApplyButton: {
    backgroundColor: theme.colors.secondary,
  },
  calendarButtonDisabled: {
    backgroundColor: theme.colors.inputBackground,
    opacity: 0.7,
  },
  calendarButtonText: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.medium,
    color: theme.colors.text,
  },
  calendarApplyText: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeights.semiBold,
  },
  calendarButtonTextDisabled: {
    color: theme.colors.textLight,
  },
});

export default ExpensesScreen;
