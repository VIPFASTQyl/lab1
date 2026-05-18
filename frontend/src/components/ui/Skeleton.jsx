import React from 'react';

export const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-dark-700 rounded-lg ${className}`} />
);

Skeleton.displayName = 'Skeleton';
