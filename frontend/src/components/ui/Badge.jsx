import React from 'react';

export const Badge = ({ variant = 'primary', size = 'md', children, className = '', ...props }) => {
  const variants = {
    primary: 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-200',
    secondary: 'bg-secondary-100 dark:bg-secondary-900 text-secondary-700 dark:text-secondary-200',
    accent: 'bg-accent-100 dark:bg-accent-900 text-accent-700 dark:text-accent-200',
    success: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200',
    warning: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200',
    error: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200',
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span className={`badge ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </span>
  );
};

Badge.displayName = 'Badge';
