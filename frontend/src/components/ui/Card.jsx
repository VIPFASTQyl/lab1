import React from 'react';

export const Card = React.forwardRef(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`card overflow-hidden ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = ({ className = '', children, ...props }) => (
  <div className={`px-6 py-4 border-b border-gray-200 dark:border-dark-700 ${className}`} {...props}>
    {children}
  </div>
);

export const CardBody = ({ className = '', children, ...props }) => (
  <div className={`px-6 py-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ className = '', children, ...props }) => (
  <div className={`px-6 py-4 border-t border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-700 ${className}`} {...props}>
    {children}
  </div>
);
