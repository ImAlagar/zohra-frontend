import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiChevronRight,
  FiChevronDown,
  FiHome,
  FiPercent,
  FiHelpCircle,
  FiStar,
  FiPackage,
  FiHeart,
  FiFilter
} from 'react-icons/fi';

const DesktopNav = ({ 
  theme, 
  location, 
  navigate, 
  shopOpen, 
  toggleShop, 
  handleLinkClick,
  isLoggedIn,
  user,
  wishlistCount
}) => {
  const [expandedSections, setExpandedSections] = useState({
    shop: false,
    collections: false,
    size: false,
    account: false
  });
  const navRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setExpandedSections({
          shop: false,
          collections: false,
          size: false,
          account: false
        });
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    if (path.startsWith('/shop/') && location.pathname.startsWith('/shop/')) return true;
    if (path.startsWith('/collection/') && location.pathname.startsWith('/collection/')) return true;
    if (path.startsWith('/size/') && location.pathname.startsWith('/size/')) return true;
    if (path.startsWith('/user/') && location.pathname.startsWith('/user/')) return true;
    return location.pathname === path;
  };

  const handleNavigation = (path) => {
    navigate(path);
    handleLinkClick();
    setExpandedSections({
      shop: false,
      collections: false,
      size: false,
      account: false
    });
  };

  // Navigation categories
  const shopCategories = [
    { label: 'All Nightwear', path: '/shop/all', icon: '🛏️' },
    { label: 'Pajama Sets', path: '/shop/pajama-sets', icon: '👚' },
    { label: 'Nightgowns', path: '/shop/nightgowns', icon: '👗' },
    { label: 'Nightshirts', path: '/shop/nightshirts', icon: '👕' },
    { label: 'Robes', path: '/shop/robes', icon: '🧥' },
    { label: 'Sleep Masks', path: '/shop/sleep-masks', icon: '😴' },
  ];

  const collections = [
    { label: 'Dreamy Florals', path: '/collection/dreamy-florals' },
    { label: 'Princess Pajamas', path: '/collection/princess' },
    { label: 'Cozy & Warm', path: '/collection/cozy-warm' },
    { label: 'Summer Breeze', path: '/collection/summer' },
    { label: 'Holiday Specials', path: '/collection/holiday' },
    { label: 'New Arrivals', path: '/collection/new' },
  ];

  // Size categories with icons
  const sizeCategories = [
    { 
      label: 'Medium (M)', 
      path: '/size/medium', 
      icon: 'M',
      description: 'Bust: 34-36", Waist: 28-30"',
      range: 'Size 8-10',
      popular: true
    },
    { 
      label: 'Large (L)', 
      path: '/size/large', 
      icon: 'L',
      description: 'Bust: 36-38", Waist: 30-32"',
      range: 'Size 12-14'
    },
    { 
      label: 'Extra Large (XL)', 
      path: '/size/xlarge', 
      icon: 'XL',
      description: 'Bust: 38-40", Waist: 32-34"',
      range: 'Size 16-18'
    },
    { 
      label: '2XL', 
      path: '/size/2xl', 
      icon: '2XL',
      description: 'Bust: 40-42", Waist: 34-36"',
      range: 'Size 20-22'
    },
    { 
      label: '3XL & Plus', 
      path: '/size/plus', 
      icon: '3XL+',
      description: 'Bust: 42"+',
      range: 'Size 24+'
    },
    { 
      label: 'Size Guide', 
      path: '/size-guide', 
      icon: '📏',
      special: true
    },
  ];

  const mainMenuItems = [
    { label: 'Home', path: '/', icon: <FiHome className="text-lg" /> },
    { label: 'Sale', path: '/sale', icon: <FiPercent className="text-lg" />, highlight: true },
    { label: 'About', path: '/about-us', icon: <FiHelpCircle className="text-lg" /> },
    { label: 'Contact', path: '/contact', icon: <FiHelpCircle className="text-lg" /> },
  ];

  const accountMenuItems = [
    { label: 'My Orders', path: '/user/orders', icon: <FiPackage className="text-lg" /> },
    { label: 'Wishlist', path: '/wishlist', icon: <FiHeart className="text-lg" /> },
    { label: 'Reviews', path: '/user/reviews', icon: <FiStar className="text-lg" /> },
  ];

  return (
    <nav ref={navRef} className="hidden xl:flex items-center justify-center flex-1">
      <div className="flex items-center space-x-1">
        {/* Main Menu Items */}
        {mainMenuItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            onClick={handleLinkClick}
            className={`group relative flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              theme === 'dark'
                ? 'hover:bg-gray-800/50 text-gray-300 hover:text-white'
                : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
            } ${isActive(item.path) ? 
              (theme === 'dark' ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-50 text-purple-600') 
              : ''}`}
          >
            {item.icon}
            <span className={`font-ui text-sm font-medium ${
              item.highlight ? 'text-red-500' : ''
            }`}>
              {item.label}
            </span>
            {item.highlight && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                SALE
              </span>
            )}
            
            {/* Active indicator */}
            {isActive(item.path) && (
              <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 rounded-full ${
                theme === 'dark' ? 'bg-purple-400' : 'bg-purple-500'
              }`} />
            )}
          </Link>
        ))}

        {/* Shop Dropdown */}
        <div className="relative">
          <button
            onClick={() => toggleSection('shop')}
            className={`group flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              theme === 'dark'
                ? 'hover:bg-gray-800/50 text-gray-300 hover:text-white'
                : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
            } ${expandedSections.shop || isActive('/shop/') ? 
              (theme === 'dark' ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-50 text-purple-600') 
              : ''}`}
          >
            <span className="font-ui text-sm font-medium">Shop</span>
            <FiChevronDown className={`transition-transform duration-300 ${
              expandedSections.shop ? 'rotate-180' : ''
            } ${expandedSections.shop || isActive('/shop/') ? 
              (theme === 'dark' ? 'text-purple-400' : 'text-purple-500') 
              : 'text-gray-400'}`} />
            
            {/* Active indicator */}
            {isActive('/shop/') && !expandedSections.shop && (
              <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 rounded-full ${
                theme === 'dark' ? 'bg-purple-400' : 'bg-purple-500'
              }`} />
            )}
          </button>

          <AnimatePresence>
            {expandedSections.shop && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`absolute top-full left-0 mt-2 w-64 py-3 rounded-lg shadow-xl z-50 ${
                  theme === 'dark'
                    ? 'bg-gray-900 border border-gray-800'
                    : 'bg-white border border-gray-200'
                }`}
              >
                <div className="space-y-1">
                  {shopCategories.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => handleNavigation(item.path)}
                      className={`flex items-center justify-between w-full px-4 py-2.5 text-sm transition-all duration-200 ${
                        theme === 'dark'
                          ? 'hover:bg-gray-800 text-gray-300 hover:text-white'
                          : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                      } ${isActive(item.path) ? 
                        (theme === 'dark' ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-50 text-purple-600') 
                        : ''}`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-base">{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <FiChevronRight className={`text-sm ${
                        isActive(item.path) ? 
                          (theme === 'dark' ? 'text-purple-400' : 'text-purple-500') 
                          : 'text-gray-400'
                      }`} />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Collections Dropdown */}
        <div className="relative">
          <button
            onClick={() => toggleSection('collections')}
            className={`group flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              theme === 'dark'
                ? 'hover:bg-gray-800/50 text-gray-300 hover:text-white'
                : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
            } ${expandedSections.collections || isActive('/collection/') ? 
              (theme === 'dark' ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-50 text-purple-600') 
              : ''}`}
          >
            <span className="font-ui text-sm font-medium">Collections</span>
            <FiChevronDown className={`transition-transform duration-300 ${
              expandedSections.collections ? 'rotate-180' : ''
            } ${expandedSections.collections || isActive('/collection/') ? 
              (theme === 'dark' ? 'text-purple-400' : 'text-purple-500') 
              : 'text-gray-400'}`} />
            
            {/* Active indicator */}
            {isActive('/collection/') && !expandedSections.collections && (
              <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 rounded-full ${
                theme === 'dark' ? 'bg-purple-400' : 'bg-purple-500'
              }`} />
            )}
          </button>

          <AnimatePresence>
            {expandedSections.collections && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`absolute top-full left-0 mt-2 w-64 py-3 rounded-lg shadow-xl z-50 ${
                  theme === 'dark'
                    ? 'bg-gray-900 border border-gray-800'
                    : 'bg-white border border-gray-200'
                }`}
              >
                <div className="space-y-1">
                  {collections.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => handleNavigation(item.path)}
                      className={`flex items-center justify-between w-full px-4 py-2.5 text-sm transition-all duration-200 ${
                        theme === 'dark'
                          ? 'hover:bg-gray-800 text-gray-300 hover:text-white'
                          : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                      } ${isActive(item.path) ? 
                        (theme === 'dark' ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-50 text-purple-600') 
                        : ''}`}
                    >
                      <span className="font-medium">{item.label}</span>
                      {isActive(item.path) && (
                        <div className={`w-2 h-2 rounded-full ${
                          theme === 'dark' ? 'bg-purple-400' : 'bg-purple-500'
                        }`} />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* By Size Dropdown */}
        <div className="relative">
          <button
            onClick={() => toggleSection('size')}
            className={`group flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              theme === 'dark'
                ? 'hover:bg-gray-800/50 text-gray-300 hover:text-white'
                : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
            } ${expandedSections.size || isActive('/size/') ? 
              (theme === 'dark' ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-50 text-purple-600') 
              : ''}`}
          >
            <FiFilter className="text-base" />
            <span className="font-ui text-sm font-medium">By Size</span>
            <FiChevronDown className={`transition-transform duration-300 ${
              expandedSections.size ? 'rotate-180' : ''
            } ${expandedSections.size || isActive('/size/') ? 
              (theme === 'dark' ? 'text-purple-400' : 'text-purple-500') 
              : 'text-gray-400'}`} />
            
            {/* Active indicator */}
            {isActive('/size/') && !expandedSections.size && (
              <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 rounded-full ${
                theme === 'dark' ? 'bg-purple-400' : 'bg-purple-500'
              }`} />
            )}
          </button>

          <AnimatePresence>
            {expandedSections.size && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`absolute top-full left-0 mt-2 w-80 py-4 rounded-xl shadow-2xl z-50 ${
                  theme === 'dark'
                    ? 'bg-gray-900 border border-gray-800'
                    : 'bg-white border border-gray-200'
                }`}
              >
                {/* Size Grid Header */}
                <div className="px-5 mb-3">
                  <h3 className={`font-ui font-medium text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Filter by Size
                  </h3>
                  <p className={`text-xs mt-1 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Find your perfect fit
                  </p>
                </div>

                {/* Size Grid */}
                <div className="grid grid-cols-3 gap-2 px-4">
                  {sizeCategories.slice(0, 6).map((item) => (
                    <button
                      key={item.label}
                      onClick={() => handleNavigation(item.path)}
                      className={`group relative p-3 rounded-lg transition-all duration-200 flex flex-col items-center justify-center ${
                        theme === 'dark'
                          ? 'hover:bg-gray-800 border-gray-800'
                          : 'hover:bg-gray-50 border-gray-200'
                      } border ${isActive(item.path) ? 
                        (theme === 'dark' ? 'bg-purple-900/30 border-purple-700' : 'bg-purple-50 border-purple-200') 
                        : ''}`}
                    >
                      {/* Size Badge */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 text-lg font-bold transition-all duration-200 ${
                        isActive(item.path)
                          ? (theme === 'dark' 
                              ? 'bg-purple-600 text-white' 
                              : 'bg-purple-500 text-white')
                          : (theme === 'dark' 
                              ? 'bg-gray-800 text-gray-300 group-hover:bg-gray-700' 
                              : 'bg-gray-100 text-gray-700 group-hover:bg-gray-200')
                      }`}>
                        {item.icon}
                      </div>
                      
                      {/* Size Label */}
                      <span className={`text-xs font-medium mb-1 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {item.label.split(' ')[0]}
                      </span>
                      
                      {/* Size Range */}
                      <span className={`text-xs ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {item.range}
                      </span>
                      
                      {/* Popular Badge */}
                      {item.popular && (
                        <span className="absolute -top-1 -right-1 px-2 py-0.5 text-[10px] bg-green-500 text-white rounded-full">
                          Popular
                        </span>
                      )}
                      
                      {/* Active Indicator */}
                      {isActive(item.path) && (
                        <div className={`absolute bottom-1 w-6 h-0.5 rounded-full ${
                          theme === 'dark' ? 'bg-purple-400' : 'bg-purple-500'
                        }`} />
                      )}
                    </button>
                  ))}
                </div>

                {/* Size Guide Link */}
                <div className="mt-4 px-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <button
                    onClick={() => handleNavigation('/size-guide')}
                    className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-all duration-200 ${
                      theme === 'dark'
                        ? 'hover:bg-gray-800 text-gray-300 hover:text-white'
                        : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                    } ${isActive('/size-guide') ? 
                      (theme === 'dark' ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-50 text-purple-600') 
                      : ''}`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">📏</span>
                      <div className="text-left">
                        <div className="font-medium text-sm">Size Guide</div>
                        <div className={`text-xs ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          Find your perfect size
                        </div>
                      </div>
                    </div>
                    <FiChevronRight className={`text-sm ${
                      isActive('/size-guide') ? 
                        (theme === 'dark' ? 'text-purple-400' : 'text-purple-500') 
                        : 'text-gray-400'
                    }`} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Account Dropdown (for logged in users) */}
        {isLoggedIn && (
          <div className="relative">
            <button
              onClick={() => toggleSection('account')}
              className={`group flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                theme === 'dark'
                  ? 'hover:bg-gray-800/50 text-gray-300 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
              } ${expandedSections.account || isActive('/user/') || isActive('/wishlist') ? 
                (theme === 'dark' ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-50 text-purple-600') 
                : ''}`}
            >
              <FiUser className="text-lg" />
              <span className="font-ui text-sm font-medium">Account</span>
              <FiChevronDown className={`transition-transform duration-300 ${
                expandedSections.account ? 'rotate-180' : ''
              } ${expandedSections.account || isActive('/user/') || isActive('/wishlist') ? 
                (theme === 'dark' ? 'text-purple-400' : 'text-purple-500') 
                : 'text-gray-400'}`} />
              
              {/* Wishlist count badge */}
              {wishlistCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                  {wishlistCount}
                </span>
              )}
              
              {/* Active indicator */}
              {(isActive('/user/') || isActive('/wishlist')) && !expandedSections.account && (
                <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 rounded-full ${
                  theme === 'dark' ? 'bg-purple-400' : 'bg-purple-500'
                }`} />
              )}
            </button>

            <AnimatePresence>
              {expandedSections.account && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`absolute top-full right-0 mt-2 w-64 py-3 rounded-lg shadow-xl z-50 ${
                    theme === 'dark'
                      ? 'bg-gray-900 border border-gray-800'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <div className="space-y-1">
                    {accountMenuItems.map((item) => (
                      <button
                        key={item.label}
                        onClick={() => handleNavigation(item.path)}
                        className={`flex items-center justify-between w-full px-4 py-2.5 text-sm transition-all duration-200 ${
                          theme === 'dark'
                            ? 'hover:bg-gray-800 text-gray-300 hover:text-white'
                            : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                        } ${isActive(item.path) ? 
                          (theme === 'dark' ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-50 text-purple-600') 
                          : ''}`}
                      >
                        <div className="flex items-center space-x-3">
                          {item.icon}
                          <span className="font-medium">{item.label}</span>
                        </div>
                        <FiChevronRight className={`text-sm ${
                          isActive(item.path) ? 
                            (theme === 'dark' ? 'text-purple-400' : 'text-purple-500') 
                            : 'text-gray-400'
                        }`} />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </nav>
  );
};

export default DesktopNav;