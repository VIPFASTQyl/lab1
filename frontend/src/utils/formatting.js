export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatTime = (time) => {
  return new Date(`2024-01-01 ${time}`).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    meridiem: 'short',
  });
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhoneNumber = (phone) => {
  const re = /^[0-9-+]{10,}$/;
  return re.test(phone);
};

export const onlyDigits = (value, maxLength) => {
  const digits = String(value || '').replace(/\D/g, '');
  return typeof maxLength === 'number' ? digits.slice(0, maxLength) : digits;
};

export const formatCardExpiry = (value) => {
  const digits = onlyDigits(value, 4);
  if (digits.length <= 2) {
    return digits;
  }
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
};

export const formatCardholderName = (value) => {
  return String(value || '').toUpperCase();
};

export const generateOrderNumber = () => {
  return `EVT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};
