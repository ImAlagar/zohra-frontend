import React from 'react';
import { motion } from 'framer-motion';
import { HOVER_ANIMATIONS } from '../../constants/animationConstants';

const ThemeButton = ({ 
  children, 
  variant = "primary", 
  size = "md",
  fullWidth = false,
  icon: Icon,
  iconPosition = "left",
  onClick,
  disabled = false,
  className = ""
}) => {
  // Button variants
  const variants = {
    primary: "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl",
    secondary: "bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-200 hover:bg-pink-200 dark:hover:bg-pink-800",
    outline: "border-2 border-pink-500 text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900",
    ghost: "text-pink-600 hover:bg-pink-100 dark:hover:bg-pink-900",
  };
  
  // Button sizes
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };
  
  return (
    <motion.button
      whileHover={HOVER_ANIMATIONS.button}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        rounded-full font-medium font-poppins transition-all duration-300
        ${variants[variant]} 
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <div className="flex items-center justify-center gap-2">
        {Icon && iconPosition === "left" && <Icon size={20} />}
        {children}
        {Icon && iconPosition === "right" && <Icon size={20} />}
      </div>
    </motion.button>
  );
};

export default ThemeButton;