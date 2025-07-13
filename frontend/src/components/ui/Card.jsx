import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const Card = ({ 
  children, 
  className, 
  gradient = false, 
  hover = true,
  animation = true,
  ...props 
}) => {
  const baseClasses = clsx(
    'relative bg-white dark:bg-secondary-800',
    'border border-secondary-200 dark:border-secondary-700',
    'rounded-2xl shadow-soft dark:shadow-none',
    'overflow-hidden',
    hover && 'hover:shadow-medium transition-all duration-300',
    gradient && 'bg-gradient-to-br from-white to-secondary-50 dark:from-secondary-800 dark:to-secondary-900',
    className
  );

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  if (animation) {
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className={baseClasses}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={baseClasses} {...props}>
      {children}
    </div>
  );
};

const CardHeader = ({ children, className, ...props }) => (
  <div 
    className={clsx(
      'px-6 py-4 border-b border-secondary-200 dark:border-secondary-700',
      'bg-secondary-50 dark:bg-secondary-800/50',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

const CardContent = ({ children, className, ...props }) => (
  <div 
    className={clsx('p-6', className)}
    {...props}
  >
    {children}
  </div>
);

const CardTitle = ({ children, className, ...props }) => (
  <h3 
    className={clsx(
      'text-xl font-semibold text-secondary-900 dark:text-secondary-100',
      'flex items-center gap-2',
      className
    )}
    {...props}
  >
    {children}
  </h3>
);

const CardDescription = ({ children, className, ...props }) => (
  <p 
    className={clsx(
      'text-sm text-secondary-600 dark:text-secondary-400',
      'mt-1',
      className
    )}
    {...props}
  >
    {children}
  </p>
);

Card.Header = CardHeader;
Card.Content = CardContent;
Card.Title = CardTitle;
Card.Description = CardDescription;

export default Card;
