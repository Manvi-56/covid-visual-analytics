import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

const Navigation = ({ tabs, activeTab, onTabChange, className }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className={clsx('relative', className)}>
      {/* Desktop Navigation */}
      <div className="hidden lg:block">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={clsx(
                'group relative px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200',
                'border-2 backdrop-blur-sm',
                'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                activeTab === tab.id
                  ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-500/25'
                  : 'bg-white/80 dark:bg-secondary-800/80 text-secondary-700 dark:text-secondary-200 border-secondary-200 dark:border-secondary-700 hover:border-primary-300'
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </div>
              
              {/* Tooltip */}
              <div className={clsx(
                'absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2',
                'px-3 py-2 bg-secondary-900 text-white text-xs rounded-lg',
                'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
                'pointer-events-none whitespace-nowrap z-50'
              )}>
                {tab.description}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-secondary-900" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 bg-white dark:bg-secondary-800 border-2 border-secondary-200 dark:border-secondary-700 rounded-xl shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{tabs.find(t => t.id === activeTab)?.icon}</span>
              <span className="font-medium">{tabs.find(t => t.id === activeTab)?.label}</span>
            </div>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              ▼
            </motion.div>
          </div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-secondary-800 border-2 border-secondary-200 dark:border-secondary-700 rounded-xl shadow-lg z-50"
            >
              <div className="p-2 space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      onTabChange(tab.id);
                      setIsOpen(false);
                    }}
                    className={clsx(
                      'w-full px-3 py-2 rounded-lg text-left transition-colors duration-200',
                      activeTab === tab.id
                        ? 'bg-primary-600 text-white'
                        : 'text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-700'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span>{tab.icon}</span>
                      <div>
                        <div className="font-medium text-sm">{tab.label}</div>
                        <div className={clsx(
                          'text-xs',
                          activeTab === tab.id ? 'text-primary-100' : 'text-secondary-500 dark:text-secondary-400'
                        )}>
                          {tab.description}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navigation;
