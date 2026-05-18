import React from 'react';

export const MetricCard = ({ title, value, icon: Icon, trend = null, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300',
    green: 'bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-300',
    purple: 'bg-purple-50 dark:bg-purple-900 text-purple-600 dark:text-purple-300',
    orange: 'bg-orange-50 dark:bg-orange-900 text-orange-600 dark:text-orange-300',
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
          {trend && (
            <p className={clsx('text-sm mt-2', trend.up ? 'text-green-600' : 'text-red-600')}>
              {trend.up ? '↑' : '↓'} {trend.label}
            </p>
          )}
        </div>
        {Icon && (
          <div className={clsx('p-3 rounded-lg', colorClasses[color])}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </div>
  );
};

const clsx = (...args) => args.filter(Boolean).join(' ');
