import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'md',
  icon,
  className,
  ...props 
}) => {
  const variants = {
    default: 'bg-secondary-100 text-secondary-800 dark:bg-secondary-800 dark:text-secondary-200',
    primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200',
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    covid: {
      cases: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
      deaths: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      recovered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      active: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    }
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  const getVariantClasses = () => {
    if (typeof variants[variant] === 'string') {
      return variants[variant];
    }
    return variants.default;
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 font-medium rounded-full',
        getVariantClasses(),
        sizes[size],
        className
      )}
      {...props}
    >
      {icon && <span className="w-3 h-3">{icon}</span>}
      {children}
    </span>
  );
};

export default Badge;
