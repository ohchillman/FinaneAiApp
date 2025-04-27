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
  if (!expenses || !expenses.length) return {
    labels: [],
    datasets: [{ data: [0] }]
  };
  
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
          data[dayIndex] += parseFloat(expense.amount);
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
        
        if (day <= 5) data[0] += parseFloat(expense.amount);
        else if (day <= 10) data[1] += parseFloat(expense.amount);
        else if (day <= 15) data[2] += parseFloat(expense.amount);
        else if (day <= 20) data[3] += parseFloat(expense.amount);
        else if (day <= 25) data[4] += parseFloat(expense.amount);
        else data[5] += parseFloat(expense.amount);
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
          data[monthIndex] += parseFloat(expense.amount);
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
          data[expenseDate.getMonth()] += parseFloat(expense.amount);
        }
      });
      break;
    
    default:
      break;
  }
  
  return {
    labels,
    datasets: [{ data }]
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
