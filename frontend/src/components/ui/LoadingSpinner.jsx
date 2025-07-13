import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const LoadingSpinner = ({ size = 'md', text = '', className }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div className={clsx('flex flex-col items-center justify-center gap-4', className)}>
      <div className="relative">
        <div className={clsx(
          sizes[size],
          'border-4 border-secondary-200 dark:border-secondary-700',
          'border-t-primary-600 rounded-full animate-spin'
        )} />
        <div className={clsx(
          sizes[size],
          'absolute inset-0',
          'border-4 border-transparent border-r-primary-400',
          'rounded-full animate-spin',
          'animation-delay-150'
        )} />
      </div>
      {text && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-secondary-600 dark:text-secondary-400 text-center max-w-xs"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

export default LoadingSpinner;
