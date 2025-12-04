// Footer.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../../../context/ThemeContext';
import { useThemeColors } from '../../../components/Common/ThemeProviderUtils';
import { MOTION_VARIANTS } from '../../../constants/animationConstants';
import {
  CONTACT_DATA,
  SOCIAL_MEDIA,
  CATEGORIES,
  TRUST_BADGES,
  QUICK_LINKS,
  POLICY_LINKS
} from '../../../constants/footerData';
import {
  ContactItem,
  SocialIcon,
  SimpleLink,
  BrandLogo,
  ExploreButton
} from '../../../components/layout/Footer/FooterComponents';
import AnimatedIcon from '../../Common/AnimatedIcon';

// FIXED IMPORTS: Removed duplicate Heart, fixed Sparkles import
import { 
  Crown, 
  Heart, 
  ShoppingBag, 
  Mail, 
  Home, 
  User, 
  Star, 
  Sparkles,  // Changed from Sparkles as HeartIcon
  Shield  // Added Shield icon for policy links
} from 'lucide-react';


const Footer = React.memo(() => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const colors = useThemeColors(theme);
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      className={`${colors.bgColor} ${colors.textColor} transition-colors duration-500 relative overflow-hidden`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={MOTION_VARIANTS.container}
    >
      {/* Trust Badges Section */}
      <TrustBadgesSection 
        trustBadges={TRUST_BADGES} 
        colors={colors} 
        theme={theme} 
      />

      {/* Main Footer Content */}
      <div className="px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          
          {/* Brand Section */}
          <BrandSection 
            colors={colors} 
            socialMedia={SOCIAL_MEDIA} 
            theme={theme} 
            borderColor={colors.borderColor}
          />

          {/* Collections Section */}
          <CollectionsSection 
            colors={colors} 
            categories={CATEGORIES} 
            navigate={navigate} 
            goldGradient={colors.goldGradient}
          />

          {/* Quick Links Section */}
          <QuickLinksSection 
            colors={colors} 
            quickLinks={QUICK_LINKS} 
            navigate={navigate}
          />

          {/* Contact Section */}
          <ContactSection 
            colors={colors} 
            contactData={CONTACT_DATA}
          />

        </div>
      </div>

      {/* Bottom Footer */}
      <BottomFooter 
        colors={colors} 
        theme={theme} 
        currentYear={currentYear} 
        policyLinks={POLICY_LINKS}
      />

    </motion.footer>
  );
});

// Sub-components for better organization
const TrustBadgesSection = React.memo(({ trustBadges, colors, theme }) => (
  <div className={`border-b ${colors.borderColor} ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
    <div className="px-6 lg:px-8 py-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {trustBadges.map((badge, index) => (
          <motion.div
            key={index}
            className="flex items-center justify-center space-x-2 p-3 rounded-lg"
            whileHover={{ scale: 1.05, y: -2 }}
          >
            <div className={`p-2 rounded-lg ${colors.iconBgColor}`}>
              <AnimatedIcon
                icon={badge.icon} 
                animation={badge.animation}
                className={colors.accentColor}
              />
            </div>
            <span className={`text-xs font-medium font-inter ${colors.textColor}`}>
              {badge.text}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
));

TrustBadgesSection.displayName = 'TrustBadgesSection';

const BrandSection = React.memo(({ colors, socialMedia, theme, borderColor }) => (
  <motion.div variants={MOTION_VARIANTS.item} className="md:col-span-2 lg:col-span-1">
    <BrandLogo 
      theme={theme}
      iconBgColor={colors.iconBgColor}
      accentColor={colors.accentColor}
      headingColor={colors.headingColor}
      textColor={colors.textColor}
    />
    
    <p className="text-sm leading-relaxed mb-6 font-inter">
      Crafting exceptional apparel experiences with unmatched quality, style, 
      and elegance. Redefining fashion with every stitch.
    </p>

    <div className="space-y-4">
      <h4 className={`text-sm font-semibold font-poppins ${colors.headingColor}`}>
        Connect With Us
      </h4>
      <div className="flex space-x-3">
        {socialMedia.map((social) => (
          <SocialIcon 
            key={social.id} 
            {...social} 
            theme={theme}
            borderColor={borderColor}
          />
        ))}
      </div>
    </div>
  </motion.div>
));

BrandSection.displayName = 'BrandSection';

const CollectionsSection = React.memo(({ colors, categories, navigate, goldGradient }) => (
  <motion.div variants={MOTION_VARIANTS.item}>
    <SectionHeader 
      icon={ShoppingBag}  // Pass component directly instead of string
      title="Collections" 
      animation="float" 
      colors={colors}
    />
    
    <div className="grid grid-cols-2 gap-2">
      {categories.map((category, index) => (
        <motion.button
          key={index}
          whileHover={{ x: 3 }}
          className={`text-sm font-inter ${colors.textColor} hover:text-amber-600 transition py-2 text-left`}
          onClick={() => navigate(`/collection/${category.toLowerCase().replace(/ /g, '-')}`)}
        >
          {category}
        </motion.button>
      ))}
    </div>

    <div className="mt-8">
      <ExploreButton goldGradient={goldGradient} navigate={navigate} />
    </div>
  </motion.div>
));

CollectionsSection.displayName = 'CollectionsSection';

const QuickLinksSection = React.memo(({ colors, quickLinks, navigate }) => (
  <motion.div variants={MOTION_VARIANTS.item}>
    <SectionHeader 
      icon={Heart}  // Pass component directly
      title="Quick Links" 
      animation="heartbeat" 
      colors={colors}
    />
    
    <div className="space-y-4">
      {quickLinks.map((link, index) => (
        <SimpleLink 
          key={index}
          onClick={() => navigate(link.path)}
          icon={link.icon}
          textColor={colors.textColor}
          accentColor={colors.accentColor}
        >
          {link.label}
        </SimpleLink>
      ))}
    </div>
  </motion.div>
));

QuickLinksSection.displayName = 'QuickLinksSection';

const ContactSection = React.memo(({ colors, contactData }) => (
  <motion.div variants={MOTION_VARIANTS.item} className="md:col-span-2 lg:col-span-1">
    <SectionHeader 
      icon={Mail}  // Pass component directly
      title="Contact Us" 
      animation="pulse" 
      colors={colors}
    />
    
    <ul className="space-y-0 mb-8">
      {contactData.map((item) => (
        <ContactItem 
          key={item.id} 
          {...item} 
          iconBgColor={colors.iconBgColor}
          accentColor={colors.accentColor}
          headingColor={colors.headingColor}
          textColor={colors.textColor}
        />
      ))}
    </ul>
  </motion.div>
));

ContactSection.displayName = 'ContactSection';

const BottomFooter = React.memo(({ colors, theme, currentYear, policyLinks }) => (
  <div className={`border-t ${colors.borderColor} ${theme === "dark" ? "bg-gray-800/50" : "bg-white"}`}>
    <div className="mx-auto mb-5 px-6 lg:px-8 py-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
      <CopyrightSection colors={colors} currentYear={currentYear} />
      <PolicyLinks policyLinks={policyLinks} colors={colors} />
    </div>
  </div>
));

BottomFooter.displayName = 'BottomFooter';

const CopyrightSection = React.memo(({ colors, currentYear }) => (
  <div 
    className={`
       text-sm font-inter ${colors.textColor}
      flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-center
    `}
  >
    <div className="flex items-center gap-1">
      <AnimatedIcon 
        icon={Crown}
        animation="rotateSlow"
        className="text-amber-500"
        size={14}
      />
      <span>© {currentYear} ZOHRA. All rights reserved.</span>
    </div>

    <span className="hidden sm:inline">•</span>

    <div className="flex items-center gap-1">
      <span>Crafted with</span>
      <AnimatedIcon 
        icon={Heart}
        animation="heartbeat"
        className="text-rose-500"
        size={16}
      />
      <span>by our team</span>
    </div>
  </div>
));

CopyrightSection.displayName = 'CopyrightSection';


const PolicyLinks = React.memo(({ policyLinks, colors }) => (
  <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm font-inter">
    {policyLinks.map((policy, index) => (
      <Link 
        key={index}
        to={policy.path} 
        className={`${colors.textColor} hover:text-amber-600 transition-colors flex items-center`}
      >
        {policy.icon && (
          // FIXED: Use icon prop instead of children
          <AnimatedIcon 
            icon={policy.icon}
            animation="pulse"
            className="mr-1"
            size={12}
          />
        )}
        {policy.label}
      </Link>
    ))}
  </div>
));

PolicyLinks.displayName = 'PolicyLinks';

// Helper component for section headers - SIMPLIFIED VERSION
const SectionHeader = ({ icon: Icon, title, animation, colors }) => {
  // Check if Icon is valid
  if (!Icon) {
    console.warn('Icon is not provided to SectionHeader');
    return null;
  }
  
  return (
    <div className="flex items-center space-x-2 mb-6">
      {/* Use icon prop directly */}
      <AnimatedIcon 
        icon={Icon}
        animation={animation}
        className={colors.accentColor}
        size={18}
      />
      <h4 className={`text-sm font-semibold font-poppins ${colors.headingColor} uppercase`}>
        {title}
      </h4>
    </div>
  );
};

Footer.displayName = 'Footer';    
export default Footer;