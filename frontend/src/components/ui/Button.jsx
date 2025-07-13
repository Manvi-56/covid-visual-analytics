import React from 'react';
import clsx from 'clsx';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  loading = false,
  icon,
  className,
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm focus:ring-primary-500',
    secondary: 'bg-secondary-100 hover:bg-secondary-200 text-secondary-900 dark:bg-secondary-800 dark:hover:bg-secondary-700 dark:text-secondary-100 focus:ring-secondary-500',
    outline: 'border border-secondary-300 bg-white hover:bg-secondary-50 text-secondary-700 dark:border-secondary-600 dark:bg-secondary-800 dark:hover:bg-secondary-700 dark:text-secondary-200 focus:ring-secondary-500',
    ghost: 'hover:bg-secondary-100 text-secondary-700 dark:hover:bg-secondary-800 dark:text-secondary-200 focus:ring-secondary-500',
    success: 'bg-success hover:bg-green-600 text-white shadow-sm focus:ring-green-500',
    warning: 'bg-warning hover:bg-amber-600 text-white shadow-sm focus:ring-amber-500',
    error: 'bg-error hover:bg-red-600 text-white shadow-sm focus:ring-red-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
    xl: 'px-8 py-4 text-lg gap-3',
  };

  return (
    <button
      className={clsx(
        baseClasses,
        variants[variant],
        sizes[size],
        loading && 'cursor-wait',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon && (
        <span className="w-4 h-4">{icon}</span>
      )}
      {children}
    </button>
  );
};

export default Button;
