import React from 'react';
import clsx from 'clsx';

const statusStyles = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  draft: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  sold_out: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  available: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
};

export const StatusBadge = ({ status, text = null }) => {
  const displayText = text || status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  const style = statusStyles[status] || statusStyles.inactive;

  return (
    <span className={clsx('inline-flex items-center px-3 py-1 rounded-full text-sm font-medium', style)}>
      {displayText}
    </span>
  );
};
