// Expense categories
export const EXPENSE_CATEGORIES = [
  { id: '1', name: 'Food', icon: 'fast-food-outline' },
  { id: '2', name: 'Transport', icon: 'car-outline' },
  { id: '3', name: 'Shopping', icon: 'cart-outline' },
  { id: '4', name: 'Entertainment', icon: 'film-outline' },
  { id: '5', name: 'Bills', icon: 'receipt-outline' },
  { id: '6', name: 'Health', icon: 'medical-outline' },
  { id: '7', name: 'Education', icon: 'school-outline' },
  { id: '8', name: 'Other', icon: 'cash-outline' },
];

// Time periods for filtering
export const TIME_PERIODS = {
  DAY: 'Day',
  WEEK: 'Week',
  MONTH: 'Month',
  QUARTER: '3M',
  YEAR: 'Year',
};

// Storage keys
export const STORAGE_KEYS = {
  EXPENSES: 'finance_ai_app_expenses',
  USER_PROFILE: 'finance_ai_app_user_profile',
  SETTINGS: 'finance_ai_app_settings',
};

// Default user profile
export const DEFAULT_USER_PROFILE = {
  name: 'User',
  email: '',
  avatar: null,
  isPro: false,
  currency: '$',
};

// OpenRouter API configuration
export const OPENROUTER_CONFIG = {
  API_URL: 'https://openrouter.ai/api/v1/chat/completions',
  MODEL: 'anthropic/claude-3-haiku',
};
