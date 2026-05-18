import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

export const Alert = ({ type = 'info', title, message, onClose, className = '' }) => {
  const types = {
    info: {
      bg: 'bg-accent-50 dark:bg-accent-900/20',
      border: 'border-accent-200 dark:border-accent-800',
      iconClass: 'text-accent-600 dark:text-accent-400',
      text: 'text-accent-800 dark:text-accent-200',
      icon: Info,
    },
    success: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      iconClass: 'text-green-600 dark:text-green-400',
      text: 'text-green-800 dark:text-green-200',
      icon: CheckCircle,
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      iconClass: 'text-yellow-600 dark:text-yellow-400',
      text: 'text-yellow-800 dark:text-yellow-200',
      icon: AlertTriangle,
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      iconClass: 'text-red-600 dark:text-red-400',
      text: 'text-red-800 dark:text-red-200',
      icon: AlertCircle,
    },
  };

  const config = types[type];
  const Icon = config.icon;

  return (
    <div className={`${config.bg} ${config.border} border rounded-lg p-4 flex gap-3 ${className}`}>
      <Icon className={`${config.iconClass} flex-shrink-0 mt-0.5`} size={20} />
      <div className="flex-1">
        {title && <h3 className={`font-semibold ${config.text}`}>{title}</h3>}
        {message && <p className={`${config.text} text-sm`}>{message}</p>}
      </div>
      {onClose && (
        <button onClick={onClose} className={`${config.iconClass} hover:opacity-70 transition-opacity`}>
          ✕
        </button>
      )}
    </div>
  );
};

Alert.displayName = 'Alert';
