// Format currency
export const formatCurrency = (amount, currency = '$') => {
  if (!amount) return `${currency}0.00`;
  
  // Convert to number if it's a string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Format with 2 decimal places
  return `${currency}${numAmount.toFixed(2)}`;
};

// Get date string in format "Apr 27, 2025"
export const formatDate = (date) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(date).toLocaleDateString('en-US', options);
};

// Get time string in format "10:30 AM"
export const formatTime = (date) => {
  const options = { hour: 'numeric', minute: 'numeric', hour12: true };
  return new Date(date).toLocaleTimeString('en-US', options);
};

// Get relative time (Today, Yesterday, or date)
export const getRelativeTime = (date) => {
  const now = new Date();
  const expenseDate = new Date(date);
  
  // Check if same day
  if (
    expenseDate.getDate() === now.getDate() &&
    expenseDate.getMonth() === now.getMonth() &&
    expenseDate.getFullYear() === now.getFullYear()
  ) {
    return `Today, ${formatTime(date)}`;
  }
  
  // Check if yesterday
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (
    expenseDate.getDate() === yesterday.getDate() &&
    expenseDate.getMonth() === yesterday.getMonth() &&
    expenseDate.getFullYear() === yesterday.getFullYear()
  ) {
    return `Yesterday, ${formatTime(date)}`;
  }
  
  // Otherwise return formatted date and time
  return `${formatDate(date)}, ${formatTime(date)}`;
};

// Filter expenses by time period
export const filterExpensesByPeriod = (expenses, period) => {
  if (!expenses || !expenses.length) return [];
  
  const now = new Date();
  const filtered = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    
    switch (period) {
      case 'Day':
        // Same day
        return (
          expenseDate.getDate() === now.getDate() &&
          expenseDate.getMonth() === now.getMonth() &&
          expenseDate.getFullYear() === now.getFullYear()
        );
      
      case 'Week':
        // Last 7 days
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return expenseDate >= weekAgo;
      
      case 'Month':
        // Current month
        return (
          expenseDate.getMonth() === now.getMonth() &&
          expenseDate.getFullYear() === now.getFullYear()
        );
      
      case '3M':
        // Last 3 months
        const threeMonthsAgo = new Date(now);
        threeMonthsAgo.setMonth(now.getMonth() - 3);
        return expenseDate >= threeMonthsAgo;
      
      case 'Year':
        // Current year
        return expenseDate.getFullYear() === now.getFullYear();
      
      default:
        return true;
    }
  });
  
  return filtered;
};

// Calculate total expenses
export const calculateTotalExpenses = (expenses) => {
  if (!expenses || !expenses.length) return 0;
  
  return expenses.reduce((total, expense) => {
    return total + parseFloat(expense.amount);
  }, 0);
};

// Group expenses by category
export const groupExpensesByCategory = (expenses) => {
  if (!expenses || !expenses.length) return {};
  
  const grouped = {};
  
  expenses.forEach(expense => {
    if (!grouped[expense.category]) {
      grouped[expense.category] = 0;
    }
    
    grouped[expense.category] += parseFloat(expense.amount);
  });
  
  return grouped;
};

// Generate chart data from expenses
export const generateChartData = (expenses, period) => {
  if (!expenses || !expenses.length) {
    // Return default data with zeros instead of empty arrays
    return {
      labels: ['1D', '1W', '1M', '3M', '1Y'],
      datasets: [{ data: [0, 0, 0, 0, 0] }]
    };
  }
  
  const now = new Date();
  let labels = [];
  let data = [];
  
  switch (period) {
    case 'Day':
      // Hours of the day
      labels = ['12AM', '6AM', '12PM', '6PM', '11PM'];
      data = [0, 0, 0, 0, 0];
      break;
    
    case 'Week':
      // Days of the week
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      labels = [];
      data = Array(7).fill(0);
      
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        labels.push(days[d.getDay()]);
      }
      
      expenses.forEach(expense => {
        const expenseDate = new Date(expense.date);
        const dayIndex = labels.indexOf(days[expenseDate.getDay()]);
        if (dayIndex !== -1) {
          const amount = parseFloat(expense.amount) || 0;
          data[dayIndex] += amount;
        }
      });
      break;
    
    case 'Month':
      // Days of the month
      labels = ['1', '5', '10', '15', '20', '25', '30'];
      data = [0, 0, 0, 0, 0, 0, 0];
      
      expenses.forEach(expense => {
        const expenseDate = new Date(expense.date);
        const day = expenseDate.getDate();
        const amount = parseFloat(expense.amount) || 0;
        
        if (day <= 5) data[0] += amount;
        else if (day <= 10) data[1] += amount;
        else if (day <= 15) data[2] += amount;
        else if (day <= 20) data[3] += amount;
        else if (day <= 25) data[4] += amount;
        else data[5] += amount;
      });
      break;
    
    case '3M':
      // Last 3 months
      labels = [];
      data = Array(3).fill(0);
      
      for (let i = 2; i >= 0; i--) {
        const d = new Date(now);
        d.setMonth(now.getMonth() - i);
        labels.push(d.toLocaleString('default', { month: 'short' }));
      }
      
      expenses.forEach(expense => {
        const expenseDate = new Date(expense.date);
        const expenseMonth = expenseDate.toLocaleString('default', { month: 'short' });
        const monthIndex = labels.indexOf(expenseMonth);
        if (monthIndex !== -1) {
          const amount = parseFloat(expense.amount) || 0;
          data[monthIndex] += amount;
        }
      });
      break;
    
    case 'Year':
      // Months of the year
      labels = [];
      data = Array(12).fill(0);
      
      for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear(), i, 1);
        labels.push(d.toLocaleString('default', { month: 'short' }));
      }
      
      expenses.forEach(expense => {
        const expenseDate = new Date(expense.date);
        if (expenseDate.getFullYear() === now.getFullYear()) {
          const amount = parseFloat(expense.amount) || 0;
          data[expenseDate.getMonth()] += amount;
        }
      });
      break;
    
    default:
      // Return default data for unknown periods
      return {
        labels: ['1D', '1W', '1M', '3M', '1Y'],
        datasets: [{ data: [0, 0, 0, 0, 0] }]
      };
  }
  
  // Ensure all data points are valid numbers
  const validData = data.map(value => {
    const num = Number(value);
    return isFinite(num) ? num : 0;
  });
  
  return {
    labels,
    datasets: [{ data: validData }]
  };
};

// Generate pie chart data from expenses by category
export const generatePieChartData = (expenses) => {
  if (!expenses || !expenses.length) return [];
  
  const groupedExpenses = groupExpensesByCategory(expenses);
  const totalAmount = calculateTotalExpenses(expenses);
  
  // Colors for pie chart
  const colors = [
    '#FF6384', // Red
    '#36A2EB', // Blue
    '#FFCE56', // Yellow
    '#4BC0C0', // Teal
    '#9966FF', // Purple
    '#FF9F40', // Orange
    '#C9CBCF', // Grey
    '#7ED321', // Green
  ];
  
  return Object.keys(groupedExpenses).map((category, index) => {
    const amount = groupedExpenses[category];
    const percentage = totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0;
    
    return {
      name: category,
      population: percentage,
      color: colors[index % colors.length],
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    };
  });
};

// Generate unique ID for expenses
export const generateUniqueId = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Generate test data for debug mode
export const generateTestExpenses = () => {
  const EXPENSE_CATEGORIES = [
    { id: '1', name: 'Food', icon: 'fast-food-outline' },
    { id: '2', name: 'Transport', icon: 'car-outline' },
    { id: '3', name: 'Shopping', icon: 'cart-outline' },
    { id: '4', name: 'Entertainment', icon: 'film-outline' },
    { id: '5', name: 'Bills', icon: 'receipt-outline' },
    { id: '6', name: 'Health', icon: 'medical-outline' },
    { id: '7', name: 'Education', icon: 'school-outline' },
    { id: '8', name: 'Other', icon: 'cash-outline' },
  ];
  
  const FOOD_DESCRIPTIONS = [
    'Grocery shopping', 'Restaurant dinner', 'Coffee shop', 'Fast food lunch',
    'Pizza delivery', 'Sushi takeout', 'Breakfast cafe', 'Bakery', 'Ice cream'
  ];
  
  const TRANSPORT_DESCRIPTIONS = [
    'Gas station', 'Uber ride', 'Taxi', 'Bus ticket', 'Train ticket',
    'Parking fee', 'Car maintenance', 'Subway pass', 'Bike repair'
  ];
  
  const SHOPPING_DESCRIPTIONS = [
    'Clothing store', 'Electronics', 'Home goods', 'Online shopping',
    'Department store', 'Bookstore', 'Furniture', 'Shoes', 'Accessories'
  ];
  
  const ENTERTAINMENT_DESCRIPTIONS = [
    'Movie tickets', 'Concert tickets', 'Streaming subscription', 'Game purchase',
    'Theme park', 'Museum entry', 'Sports event', 'Theater show', 'Music album'
  ];
  
  const BILLS_DESCRIPTIONS = [
    'Electricity bill', 'Water bill', 'Internet bill', 'Phone bill',
    'Rent payment', 'Insurance premium', 'Subscription service', 'Credit card payment'
  ];
  
  const HEALTH_DESCRIPTIONS = [
    'Pharmacy', 'Doctor visit', 'Gym membership', 'Health insurance',
    'Dental care', 'Vitamins', 'Therapy session', 'Medical test'
  ];
  
  const EDUCATION_DESCRIPTIONS = [
    'Textbooks', 'Online course', 'Tuition fee', 'School supplies',
    'Workshop fee', 'Language class', 'Certification exam', 'Educational app'
  ];
  
  const OTHER_DESCRIPTIONS = [
    'Gift purchase', 'Donation', 'Office supplies', 'Pet supplies',
    'Home repair', 'Gardening', 'Cleaning service', 'Miscellaneous'
  ];
  
  const DESCRIPTIONS_BY_CATEGORY = {
    'Food': FOOD_DESCRIPTIONS,
    'Transport': TRANSPORT_DESCRIPTIONS,
    'Shopping': SHOPPING_DESCRIPTIONS,
    'Entertainment': ENTERTAINMENT_DESCRIPTIONS,
    'Bills': BILLS_DESCRIPTIONS,
    'Health': HEALTH_DESCRIPTIONS,
    'Education': EDUCATION_DESCRIPTIONS,
    'Other': OTHER_DESCRIPTIONS
  };
  
  // Generate random amount between min and max
  const randomAmount = (min, max) => {
    return (Math.random() * (max - min) + min).toFixed(2);
  };
  
  // Generate random date within the last year
  const randomDate = (daysBack = 365) => {
    const today = new Date();
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - Math.floor(Math.random() * daysBack));
    
    // Add random hours
    pastDate.setHours(
      Math.floor(Math.random() * 24),
      Math.floor(Math.random() * 60),
      Math.floor(Math.random() * 60)
    );
    
    return pastDate.toISOString();
  };
  
  // Generate random description for a category
  const randomDescription = (category) => {
    const descriptions = DESCRIPTIONS_BY_CATEGORY[category] || OTHER_DESCRIPTIONS;
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  };
  
  // Generate 50-100 random expenses over the last year
  const numExpenses = Math.floor(Math.random() * 51) + 50; // 50-100 expenses
  const expenses = [];
  
  for (let i = 0; i < numExpenses; i++) {
    const categoryObj = EXPENSE_CATEGORIES[Math.floor(Math.random() * EXPENSE_CATEGORIES.length)];
    const category = categoryObj.name;
    
    // Different amount ranges for different categories
    let amountRange = [5, 50]; // Default
    
    if (category === 'Bills') amountRange = [50, 200];
    else if (category === 'Shopping') amountRange = [20, 150];
    else if (category === 'Transport') amountRange = [5, 60];
    else if (category === 'Food') amountRange = [10, 80];
    
    const expense = {
      id: generateUniqueId(),
      amount: randomAmount(amountRange[0], amountRange[1]),
      category: category,
      description: randomDescription(category),
      date: randomDate(),
      notes: Math.random() > 0.7 ? 'Test note for debug mode' : ''
    };
    
    expenses.push(expense);
  }
  
  // Sort by date, newest first
  expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  return expenses;
};
