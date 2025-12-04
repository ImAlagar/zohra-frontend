import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { topbarMessages } from '../../../constants/headerConstants';
import { MOTION_VARIANTS } from '../../../constants/animationConstants';
import { useTheme } from '../../../context/ThemeContext';

const PromotionalTopbar = React.memo(({ topbarVisible }) => {
  const { theme } = useTheme();
  
  // Golden/Amber theme matching footer
  const getTopbarStyles = () => {
    if (theme === "dark") {
      return {
        background: "bg-gradient-to-r from-gray-900 via-amber-500/20 to-gray-900",
        textColor: "text-amber-400",
        border: "border-b border-amber-500/30"
      };
    } else {
      return {
        background: "bg-gradient-to-r from-amber-200 to-yellow-40",
        textColor: "text-gray-900",
        border: "border-b border-amber-500"
      };
    }
  };

  const styles = getTopbarStyles();

  return (
    <AnimatePresence>
      {topbarVisible && (
        <motion.div
          variants={MOTION_VARIANTS.topbar}
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
              {[...topbarMessages, ...topbarMessages].map((message, index) => (
                <span 
                  key={`${index}-${message.substring(0, 10)}`}
                  className={`mx-8 text-sm font-medium font-inter ${styles.textColor}`}
                >
                  {message}
                </span>
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

PromotionalTopbar.displayName = 'PromotionalTopbar';
export default PromotionalTopbar;