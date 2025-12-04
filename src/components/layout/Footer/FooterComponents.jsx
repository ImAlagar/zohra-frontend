// FooterComponents.jsx
import React from 'react';
import { motion } from 'framer-motion';
import AnimatedIcon from '../../Common/AnimatedIcon';
import { MOTION_VARIANTS, ICON_ANIMATIONS } from '../../../constants/animationConstants';
import { SOCIAL_MEDIA_COLORS } from '../../../constants/themeConstants';
import { Crown, Sparkles, Star } from 'lucide-react';

// Contact Item Component
export const ContactItem = React.memo(({ icon, title, content, animation, iconBgColor, accentColor, headingColor, textColor }) => (
  <motion.li
    className="flex items-start space-x-3 mb-4"
    variants={MOTION_VARIANTS.item}
  >
    <div className={`mt-1 p-2 rounded-xl flex-shrink-0 ${iconBgColor}`}>
      <AnimatedIcon 
        icon={icon} 
        animation={animation} 
        className={accentColor}
      />
    </div>
    <div className="flex-1 min-w-0">
      <p className={`font-semibold text-sm font-poppins ${headingColor} mb-1`}>{title}</p>
      <p className={`text-sm font-inter ${textColor}`}>{content}</p>
    </div>
  </motion.li>
));

ContactItem.displayName = 'ContactItem';

// Social Icon Component
export const SocialIcon = React.memo(({ icon: Icon, name, url, color, animation, theme, borderColor }) => (
  <motion.a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    className={`
      p-3 rounded-xl transition-all duration-300 font-inter
      ${theme === "dark" ? "bg-gray-800 text-gray-300" : "bg-white text-gray-700"}
      ${SOCIAL_MEDIA_COLORS[color] || ''} hover:text-white border ${borderColor} 
      shadow-sm hover:shadow-lg relative overflow-hidden
    `}
    whileHover={{ scale: 1.1, y: -3 }}
    whileTap={{ scale: 0.95 }}
    aria-label={name}
  >
    <motion.div animate={ICON_ANIMATIONS[animation] || ICON_ANIMATIONS.float}>
      <Icon size={20} />
    </motion.div>
  </motion.a>
));

SocialIcon.displayName = 'SocialIcon';

// Simple Link Component
export const SimpleLink = React.memo(({ children, onClick, icon: Icon, textColor, accentColor }) => (
  <motion.button
    whileHover={{ x: 5 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`flex items-center space-x-2 text-sm font-inter ${textColor} hover:text-amber-600 transition py-2 w-full text-left group`}
  >
    <motion.div animate={ICON_ANIMATIONS.shimmer} className="flex items-center">
      <Icon size={14} className={`${accentColor} group-hover:scale-110 transition-transform`} />
    </motion.div>
    <span>{children}</span>
  </motion.button>
));

SimpleLink.displayName = 'SimpleLink';

// Brand Logo Component
export const BrandLogo = React.memo(({ theme, iconBgColor, accentColor, headingColor, textColor }) => (
  <div className="flex items-center space-x-3 mb-6">
    <motion.div 
      animate={{
        rotate: 360,
        transition: {
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }
      }}
      whileHover={{ scale: 1.1 }} 
      className={`p-3 rounded-2xl ${iconBgColor} relative`}
    >
      <Crown className={accentColor} size={28} />
      <motion.div
        animate={{
          rotate: -360,
          transition: {
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }
        }}
        className="absolute -top-1 -right-1"
      >
        <Sparkles size={12} className="text-yellow-300" />
      </motion.div>
    </motion.div>
    <div>
      <h3 className={`text-2xl font-bold font-poppins ${headingColor}`}>ZOHRA</h3>
      <div className={`text-sm font-inter ${textColor} flex items-center`}>
        <AnimatedIcon animation="pulse">
          <Star size={12} className="text-amber-500 mr-1" fill="currentColor" />
        </AnimatedIcon>
        Premium Fashion & Elegance
      </div>
    </div>
  </div>
));

BrandLogo.displayName = 'BrandLogo';

// Explore Button Component
export const ExploreButton = React.memo(({ goldGradient, navigate }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className={`w-full py-3 rounded-lg font-medium font-poppins ${goldGradient} hover:opacity-90 text-white transition-all shadow-md hover:shadow-lg relative overflow-hidden`}
    onClick={() => navigate("/shop")}
  >
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
      animate={{ x: ["-100%", "100%"] }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
    />
    <span className="relative z-10">Explore All Collections</span>
  </motion.button>
));

ExploreButton.displayName = 'ExploreButton';