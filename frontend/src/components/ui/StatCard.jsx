import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  trendValue,
  color = 'primary',
  size = 'md',
  className,
  animation = true,
  ...props 
}) => {
  const colors = {
    primary: {
      bg: 'bg-primary-50 dark:bg-primary-900/20',
      icon: 'text-primary-600 dark:text-primary-400',
      value: 'text-primary-900 dark:text-primary-100',
      border: 'border-primary-200 dark:border-primary-800',
    },
    success: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      icon: 'text-green-600 dark:text-green-400',
      value: 'text-green-900 dark:text-green-100',
      border: 'border-green-200 dark:border-green-800',
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      icon: 'text-amber-600 dark:text-amber-400',
      value: 'text-amber-900 dark:text-amber-100',
      border: 'border-amber-200 dark:border-amber-800',
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      icon: 'text-red-600 dark:text-red-400',
      value: 'text-red-900 dark:text-red-100',
      border: 'border-red-200 dark:border-red-800',
    },
    covid: {
      cases: {
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        icon: 'text-amber-600 dark:text-amber-400',
        value: 'text-amber-900 dark:text-amber-100',
        border: 'border-amber-200 dark:border-amber-800',
      },
      deaths: {
        bg: 'bg-red-50 dark:bg-red-900/20',
        icon: 'text-red-600 dark:text-red-400',
        value: 'text-red-900 dark:text-red-100',
        border: 'border-red-200 dark:border-red-800',
      },
      recovered: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        icon: 'text-green-600 dark:text-green-400',
        value: 'text-green-900 dark:text-green-100',
        border: 'border-green-200 dark:border-green-800',
      },
      active: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        icon: 'text-blue-600 dark:text-blue-400',
        value: 'text-blue-900 dark:text-blue-100',
        border: 'border-blue-200 dark:border-blue-800',
      },
    }
  };

  const sizes = {
    sm: {
      container: 'p-4',
      icon: 'w-8 h-8 p-1.5',
      title: 'text-sm',
      value: 'text-xl',
      subtitle: 'text-xs',
    },
    md: {
      container: 'p-6',
      icon: 'w-10 h-10 p-2',
      title: 'text-sm',
      value: 'text-2xl',
      subtitle: 'text-sm',
    },
    lg: {
      container: 'p-8',
      icon: 'w-12 h-12 p-2.5',
      title: 'text-base',
      value: 'text-3xl',
      subtitle: 'text-base',
    },
  };

  const getColorClasses = () => {
    if (color.includes('.')) {
      // Handle nested colors like 'covid.cases'
      const [category, type] = color.split('.');
      return colors[category]?.[type] || colors.primary;
    }
    return colors[color] || colors.primary;
  };

  const colorClasses = getColorClasses();
  const sizeClasses = sizes[size];

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  const valueVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, delay: 0.1 }
    }
  };

  const formatValue = (val) => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;
      } else if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`;
      }
    }
    return val;
  };

  const CardContent = () => (
    <div className={clsx(
      'relative bg-white dark:bg-secondary-800',
      'border-2 rounded-2xl shadow-soft hover:shadow-medium',
      'transition-all duration-300 group cursor-default',
      colorClasses.border,
      sizeClasses.container,
      className
    )}>
      {/* Background decoration */}
      <div className={clsx(
        'absolute top-0 right-0 w-24 h-24 rounded-full opacity-5 transform translate-x-8 -translate-y-8',
        colorClasses.bg
      )} />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className={clsx(
              'font-medium text-secondary-600 dark:text-secondary-400 uppercase tracking-wide',
              sizeClasses.title
            )}>
              {title}
            </p>
          </div>
          {icon && (
            <div className={clsx(
              'rounded-xl flex items-center justify-center',
              'group-hover:scale-110 transition-transform duration-200',
              colorClasses.bg,
              sizeClasses.icon
            )}>
              <span className={clsx('w-full h-full flex items-center justify-center', colorClasses.icon)}>
                {icon}
              </span>
            </div>
          )}
        </div>

        <motion.div
          variants={animation ? valueVariants : {}}
          initial={animation ? "hidden" : false}
          animate={animation ? "visible" : false}
          className="space-y-2"
        >
          <p className={clsx(
            'font-bold leading-none',
            colorClasses.value,
            sizeClasses.value
          )}>
            {formatValue(value)}
          </p>
          
          {subtitle && (
            <p className={clsx(
              'text-secondary-500 dark:text-secondary-400',
              sizeClasses.subtitle
            )}>
              {subtitle}
            </p>
          )}

          {trend && trendValue && (
            <div className="flex items-center gap-2">
              <span className={clsx(
                'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                trend === 'up' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                trend === 'down' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
              )}>
                {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
                {trendValue}
              </span>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );

  if (animation) {
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        {...props}
      >
        <CardContent />
      </motion.div>
    );
  }

  return <CardContent {...props} />;
};

export default StatCard;
