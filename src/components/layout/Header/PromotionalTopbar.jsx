import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { topbarMessages, motionVariants } from '../../../constants/headerConstants';
import { useTheme } from '../../../context/ThemeContext';

const PromotionalTopbar = ({ topbarVisible }) => {
  const { theme } = useTheme();

  // Theme-based color configurations
  const getTopbarStyles = () => {
    if (theme === "dark") {
      return {
        background: "bg-gradient-to-r from-gray-900 via-[#F4CB45]/20 to-gray-900",
        textColor: "text-[#F4CB45]",
        border: "border-b border-[#F4CB45]/30"
      };
    } else {
      return {
        background: "bg-gradient-to-r from-[#F4CB45] to-yellow-400",
        textColor: "text-gray-900",
        border: "border-b border-yellow-500"
      };
    }
  };

  const styles = getTopbarStyles();

  return (
    <AnimatePresence>
      {topbarVisible && (
        <motion.div
          variants={motionVariants.topbar}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className={`relative overflow-hidden z-40 ${styles.background} ${styles.border}`}
        >
          <div className="py-2">
            <motion.div
              className="whitespace-nowrap"
              animate={{ x: [0, -1000] }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 30,
                  ease: "linear",
                },
              }}
            >
              {topbarMessages.map((message, index) => (
                <span key={index} className={`mx-8 text-sm font-medium font-inter ${styles.textColor}`}>
                  {message}
                </span>
              ))}
              {topbarMessages.map((message, index) => (
                <span key={`dup-${index}`} className={`mx-8 text-sm font-medium font-inter ${styles.textColor}`}>
                  {message}
                </span>
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PromotionalTopbar;