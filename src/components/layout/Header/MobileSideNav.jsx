import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiChevronRight, 
  FiUser, 
  FiHeart, 
  FiShoppingBag, 
  FiHelpCircle,
  FiStar,
  FiPackage,
  FiLogOut,
  FiHome,
  FiPercent,
  FiFilter
} from 'react-icons/fi';
import { MdDarkMode, MdLightMode } from 'react-icons/md';

const MobileSideNav = ({
  theme,
  menuOpen,
  shopOpen,
  toggleShop,
  location,
  navigate,
  isLoggedIn,
  user,
  handleLinkClick,
  handleOrdersClick,
  handleLoginClick,
  handleLogout,
  toggleTheme,
  setSearchOpen,
  setMenuOpen,
  getUserDisplayName,
  wishlistCount
}) => {
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [sizesOpen, setSizesOpen] = useState(false);

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
    { label: 'About', path: '/about', icon: <FiHelpCircle className="text-lg" /> },
    { label: 'Contact', path: '/contact', icon: <FiHelpCircle className="text-lg" /> },
  ];

  const accountMenuItems = [
    { label: 'My Orders', path: '/user/orders', icon: <FiPackage className="text-lg" /> },
    { label: 'Wishlist', path: '/wishlist', icon: <FiHeart className="text-lg" /> },
    { label: 'Reviews', path: '/user/reviews', icon: <FiStar className="text-lg" /> },
  ];

  const isActive = (path) => location.pathname === path;

  const handleNavigation = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  const sidebarVariants = {
    hidden: { x: '100%' },
    visible: { 
      x: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 200
      }
    },
    exit: { 
      x: '100%',
      transition: {
        duration: 0.2
      }
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { x: 0, opacity: 1 }
  };

  return (
    <AnimatePresence>
      {menuOpen && (
        <>
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          />

          {/* Sidebar */}
          <motion.div
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`fixed top-0 right-0 h-screen w-80 max-w-[90vw] z-[60] flex flex-col shadow-2xl ${
              theme === 'dark' 
                ? 'bg-gradient-to-b from-gray-900 to-gray-800' 
                : 'bg-gradient-to-b from-white to-gray-50'
            }`}
          >
            {/* Header */}
            <div className={`p-6 border-b ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <h2 className={`font-heading text-xl ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Dreamy Nights
                </h2>
                <button
                  onClick={() => setMenuOpen(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    theme === 'dark' 
                      ? 'hover:bg-gray-700 text-gray-300' 
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  ✕
                </button>
              </div>
              
              {/* User Info */}
              <div className="mt-6 flex items-center space-x-3">
                <div className={`p-3 rounded-full ${
                  theme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-100'
                }`}>
                  <FiUser className={`text-lg ${
                    theme === 'dark' ? 'text-purple-300' : 'text-purple-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className={`font-ui font-medium ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {getUserDisplayName()}
                  </p>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {isLoggedIn ? 'Welcome back!' : 'Welcome, guest!'}
                  </p>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto py-4">
              {/* Theme Toggle */}
              <div className={`px-6 py-3 mx-4 rounded-lg mb-4 ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
              }`}>
                <button
                  onClick={toggleTheme}
                  className="flex items-center justify-between w-full"
                >
                  <span className={`font-ui text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                  </span>
                  <div className={`p-2 rounded-full ${
                    theme === 'dark' ? 'bg-purple-900/50' : 'bg-purple-100'
                  }`}>
                    {theme === 'dark' ? (
                      <MdDarkMode className="text-purple-400 text-lg" />
                    ) : (
                      <MdLightMode className="text-purple-600 text-lg" />
                    )}
                  </div>
                </button>
              </div>

              {/* Main Menu */}
              <div className="px-4 mb-6">
                <h3 className={`font-ui text-xs uppercase tracking-wider mb-3 px-2 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Menu
                </h3>
                <div className="space-y-1">
                  {mainMenuItems.map((item, index) => (
                    <motion.button
                      key={item.label}
                      variants={itemVariants}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleNavigation(item.path)}
                      className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-all duration-300 ${
                        theme === 'dark'
                          ? 'hover:bg-gray-800 text-gray-300'
                          : 'hover:bg-gray-100 text-gray-700'
                      } ${isActive(item.path) ? 
                        (theme === 'dark' ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-50 text-purple-600') 
                        : ''}`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className={`${item.highlight && 'text-red-500'}`}>
                          {item.icon}
                        </span>
                        <span className={`font-ui text-sm ${
                          item.highlight ? 'font-semibold' : 'font-medium'
                        }`}>
                          {item.label}
                        </span>
                        {item.highlight && (
                          <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                            SALE
                          </span>
                        )}
                      </div>
                      <FiChevronRight className={`text-gray-400 ${isActive(item.path) && 'text-purple-500'}`} />
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Shop Categories */}
              <div className="px-4 mb-6">
                <h3 className={`font-ui text-xs uppercase tracking-wider mb-3 px-2 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Shop Categories
                </h3>
                <div className="space-y-1">
                  {shopCategories.map((item, index) => (
                    <motion.button
                      key={item.label}
                      variants={itemVariants}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleNavigation(item.path)}
                      className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-all duration-300 ${
                        theme === 'dark'
                          ? 'hover:bg-gray-800 text-gray-300'
                          : 'hover:bg-gray-100 text-gray-700'
                      } ${isActive(item.path) ? 
                        (theme === 'dark' ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-50 text-purple-600') 
                        : ''}`}
                    >
                      <div className="flex items-center space-x-3">
                        <span>{item.icon}</span>
                        <span className="font-ui text-sm font-medium">{item.label}</span>
                      </div>
                      <FiChevronRight className={`text-gray-400 ${isActive(item.path) && 'text-purple-500'}`} />
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Collections */}
              <div className="px-4 mb-6">
                <button
                  onClick={() => setCollectionsOpen(!collectionsOpen)}
                  className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-all duration-300 ${
                    theme === 'dark'
                      ? 'hover:bg-gray-800 text-gray-300'
                      : 'hover:bg-gray-100 text-gray-700'
                  } ${collectionsOpen ? 
                    (theme === 'dark' ? 'bg-gray-800 text-purple-300' : 'bg-gray-100 text-purple-600') 
                    : ''}`}
                >
                  <span className="font-ui text-sm font-medium">Collections</span>
                  <FiChevronRight className={`transition-transform duration-300 ${
                    collectionsOpen ? 'rotate-90 text-purple-500' : 'text-gray-400'
                  }`} />
                </button>

                <AnimatePresence>
                  {collectionsOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-8 pt-2 space-y-1">
                        {collections.map((item) => (
                          <button
                            key={item.label}
                            onClick={() => handleNavigation(item.path)}
                            className={`flex items-center justify-between w-full px-4 py-2 rounded-lg transition-all duration-300 ${
                              theme === 'dark'
                                ? 'hover:bg-gray-800 text-gray-400'
                                : 'hover:bg-gray-100 text-gray-600'
                            } ${isActive(item.path) ? 
                              (theme === 'dark' ? 'bg-purple-900/20 text-purple-300' : 'bg-purple-50 text-purple-600') 
                              : ''}`}
                          >
                            <span className="font-ui text-sm">{item.label}</span>
                            {isActive(item.path) && (
                              <div className={`w-1.5 h-1.5 rounded-full ${
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

              {/* By Size */}
              <div className="px-4 mb-6">
                <button
                  onClick={() => setSizesOpen(!sizesOpen)}
                  className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-all duration-300 ${
                    theme === 'dark'
                      ? 'hover:bg-gray-800 text-gray-300'
                      : 'hover:bg-gray-100 text-gray-700'
                  } ${sizesOpen ? 
                    (theme === 'dark' ? 'bg-gray-800 text-purple-300' : 'bg-gray-100 text-purple-600') 
                    : ''}`}
                >
                  <div className="flex items-center space-x-3">
                    <FiFilter className="text-base" />
                    <span className="font-ui text-sm font-medium">By Size</span>
                  </div>
                  <FiChevronRight className={`transition-transform duration-300 ${
                    sizesOpen ? 'rotate-90 text-purple-500' : 'text-gray-400'
                  }`} />
                </button>

                <AnimatePresence>
                  {sizesOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-4 pt-2 space-y-1">
                        {/* Size Grid */}
                        <div className="grid grid-cols-3 gap-2 px-2 mb-4">
                          {sizeCategories.slice(0, 6).map((item) => (
                            <button
                              key={item.label}
                              onClick={() => handleNavigation(item.path)}
                              className={`group relative p-2 rounded-lg transition-all duration-200 flex flex-col items-center justify-center ${
                                theme === 'dark'
                                  ? 'hover:bg-gray-800 border-gray-800'
                                  : 'hover:bg-gray-50 border-gray-200'
                              } border ${isActive(item.path) ? 
                                (theme === 'dark' ? 'bg-purple-900/30 border-purple-700' : 'bg-purple-50 border-purple-200') 
                                : ''}`}
                            >
                              {/* Size Badge */}
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 text-base font-bold transition-all duration-200 ${
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
                              <span className={`text-xs font-medium mb-0.5 ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                {item.label.split(' ')[0]}
                              </span>
                              
                              {/* Size Range */}
                              <span className={`text-[10px] ${
                                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                {item.range}
                              </span>
                              
                              {/* Popular Badge */}
                              {item.popular && (
                                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[9px] bg-green-500 text-white rounded-full">
                                  Popular
                                </span>
                              )}
                              
                              {/* Active Indicator */}
                              {isActive(item.path) && (
                                <div className={`absolute bottom-0.5 w-5 h-0.5 rounded-full ${
                                  theme === 'dark' ? 'bg-purple-400' : 'bg-purple-500'
                                }`} />
                              )}
                            </button>
                          ))}
                        </div>

                        {/* Size Guide Link */}
                        <button
                          onClick={() => handleNavigation('/size-guide')}
                          className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-all duration-300 ${
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

              {/* Account Menu */}
              {isLoggedIn && (
                <div className="px-4 mb-6">
                  <h3 className={`font-ui text-xs uppercase tracking-wider mb-3 px-2 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    My Account
                  </h3>
                  <div className="space-y-1">
                    {accountMenuItems.map((item, index) => (
                      <motion.button
                        key={item.label}
                        variants={itemVariants}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => {
                          if (item.label === 'Wishlist') {
                            navigate('/wishlist');
                            setMenuOpen(false);
                          } else {
                            handleNavigation(item.path);
                          }
                        }}
                        className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-all duration-300 ${
                          theme === 'dark'
                            ? 'hover:bg-gray-800 text-gray-300'
                            : 'hover:bg-gray-100 text-gray-700'
                        } ${isActive(item.path) ? 
                          (theme === 'dark' ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-50 text-purple-600') 
                          : ''}`}
                      >
                        <div className="flex items-center space-x-3">
                          {item.label === 'Wishlist' && wishlistCount > 0 ? (
                            <div className="relative">
                              {item.icon}
                              <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                {wishlistCount}
                              </span>
                            </div>
                          ) : (
                            item.icon
                          )}
                          <span className="font-ui text-sm font-medium">{item.label}</span>
                        </div>
                        <FiChevronRight className={`text-gray-400 ${isActive(item.path) && 'text-purple-500'}`} />
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className={`p-6 border-t ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              {isLoggedIn ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className={`flex items-center justify-center w-full px-4 py-3 rounded-lg transition-all duration-300 font-ui text-sm font-medium ${
                    theme === 'dark'
                      ? 'bg-gray-800 hover:bg-red-900/30 text-red-400 hover:text-red-300'
                      : 'bg-gray-100 hover:bg-red-50 text-red-500 hover:text-red-600'
                  }`}
                >
                  <FiLogOut className="mr-2" />
                  Sign Out
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleLoginClick();
                    setMenuOpen(false);
                  }}
                  className={`flex items-center justify-center w-full px-4 py-3 rounded-lg transition-all duration-300 font-ui text-sm font-medium ${
                    theme === 'dark'
                      ? 'bg-purple-900/30 hover:bg-purple-900/50 text-purple-300 hover:text-purple-200'
                      : 'bg-purple-50 hover:bg-purple-100 text-purple-600 hover:text-purple-700'
                  }`}
                >
                  <FiUser className="mr-2" />
                  Sign In / Register
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileSideNav;