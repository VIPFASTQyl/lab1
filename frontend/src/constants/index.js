export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const CATEGORIES = [
  { value: 'concert', label: 'Concert' },
  { value: 'sports', label: 'Sports' },
  { value: 'theater', label: 'Theater' },
  { value: 'festival', label: 'Festival' },
  { value: 'comedy', label: 'Comedy' },
  { value: 'workshop', label: 'Workshop' },
];

export const DATE_RANGES = [
  { value: 'today', label: 'Today' },
  { value: 'tomorrow', label: 'Tomorrow' },
  { value: 'thisweek', label: 'This Week' },
  { value: 'thismonth', label: 'This Month' },
  { value: 'all', label: 'All Dates' },
];

export const TICKET_TYPES = [
  { id: 1, name: 'General Access', description: 'Standard admission' },
  { id: 2, name: 'VIP Pass', description: 'Priority seating and access' },
  { id: 3, name: 'Premium VIP', description: 'Best seating and exclusive perks' },
];

export const PAYMENT_METHODS = [
  { id: 'card', label: 'Credit Card' },
  { id: 'paypal', label: 'PayPal' },
  { id: 'apple', label: 'Apple Pay' },
  { id: 'google', label: 'Google Pay' },
];

export const STATUS_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
};
