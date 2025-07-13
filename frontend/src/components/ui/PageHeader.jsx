import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const PageHeader = ({ 
  title, 
  subtitle, 
  icon,
  breadcrumb,
  actions,
  stats,
  backgroundPattern = true,
  className,
  ...props 
}) => {
  return (
    <div className={clsx(
      'relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800',
      'dark:from-primary-800 dark:via-primary-900 dark:to-secondary-900',
      'text-white overflow-hidden',
      className
    )} {...props}>
      
      {/* Background Pattern */}
      {backgroundPattern && (
        <div className="absolute inset-0 opacity-10">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `
                radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 0%, transparent 50%),
                radial-gradient(circle at 75% 75%, rgba(255,255,255,0.15) 0%, transparent 50%),
                linear-gradient(45deg, transparent 48%, rgba(255,255,255,0.05) 49%, rgba(255,255,255,0.05) 51%, transparent 52%)
              `,
              backgroundSize: '200px 200px, 300px 300px, 50px 50px'
            }}
          />
        </div>
      )}

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white opacity-5 rounded-full blur-xl" />
        <div className="absolute top-1/2 -left-8 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl" />
        <div className="absolute bottom-0 right-1/3 w-16 h-16 bg-white opacity-10 rounded-full blur-lg" />
      </div>

      <div className="relative px-6 py-8 lg:px-8 lg:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          {breadcrumb && (
            <motion.nav
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <ol className="flex items-center space-x-2 text-sm text-primary-100">
                {breadcrumb.map((item, index) => (
                  <li key={index} className="flex items-center">
                    {index > 0 && <span className="mx-2">/</span>}
                    {item.href ? (
                      <a 
                        href={item.href}
                        className="hover:text-white transition-colors duration-200"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <span className={index === breadcrumb.length - 1 ? 'text-white font-medium' : ''}>
                        {item.label}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </motion.nav>
          )}

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Title Section */}
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-4 mb-2"
              >
                {icon && (
                  <div className="flex-shrink-0 w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <span className="text-2xl">{icon}</span>
                  </div>
                )}
                <h1 className="text-3xl lg:text-4xl font-bold leading-tight">
                  {title}
                </h1>
              </motion.div>
              
              {subtitle && (
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-lg text-primary-100 leading-relaxed max-w-3xl"
                >
                  {subtitle}
                </motion.p>
              )}
            </div>

            {/* Actions */}
            {actions && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex-shrink-0"
              >
                <div className="flex items-center gap-3">
                  {actions}
                </div>
              </motion.div>
            )}
          </div>

          {/* Stats */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {stats.map((stat, index) => (
                <div 
                  key={index}
                  className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-20"
                >
                  <div className="text-2xl font-bold text-white">
                    {stat.value}
                  </div>
                  <div className="text-sm text-primary-100">
                    {stat.label}
                  </div>
                  {stat.change && (
                    <div className={clsx(
                      'text-xs mt-1 flex items-center gap-1',
                      stat.change.startsWith('+') ? 'text-green-300' : 
                      stat.change.startsWith('-') ? 'text-red-300' : 'text-primary-200'
                    )}>
                      <span>{stat.change}</span>
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
