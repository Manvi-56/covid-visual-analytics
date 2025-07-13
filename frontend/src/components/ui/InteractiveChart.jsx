import React, { useState, cloneElement } from 'react';
import ChartModal from './ChartModal';
import { motion } from 'framer-motion';

const InteractiveChart = ({ 
  children, 
  title, 
  description,
  className = "h-[400px]",
  modalTitle = null 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleChartClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Chart Container */}
      <motion.div
        className={`${className} w-full cursor-pointer relative group overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700`}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
        onClick={handleChartClick}
      >
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-200 z-10 flex items-center justify-center">
          <motion.div
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border border-slate-200 dark:border-slate-700"
            initial={{ scale: 0.8 }}
            whileHover={{ scale: 1 }}
          >
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
              <span className="text-sm font-medium">Click to expand</span>
            </div>
          </motion.div>
        </div>

        {/* Chart Content */}
        <div className="w-full h-full">
          {cloneElement(children, { 
            isModal: false,
            onTooltip: true 
          })}
        </div>
      </motion.div>

      {/* Modal */}
      <ChartModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={modalTitle || title || "Chart Details"}
      >
        <div className="w-full h-full">
          {cloneElement(children, { 
            isModal: true,
            onTooltip: true
          })}
        </div>
      </ChartModal>
    </>
  );
};

export default InteractiveChart;
