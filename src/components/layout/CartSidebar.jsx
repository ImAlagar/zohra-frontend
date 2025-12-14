import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiX,
  FiShoppingBag,
  FiTrash2,
  FiPlus,
  FiMinus,
  FiArrowRight,
  FiCheck,
  FiPercent
} from 'react-icons/fi';

import {
  updateQuantity,
  removeCartItem,
  clearCart,
} from '../../redux/slices/cartSlice';
import { useCalculateCartPricesMutation, useCalculateQuantityPriceMutation } from '../../redux/services/productService';
import { useTheme } from '../../context/ThemeContext';
import QuantityDiscountBadge from '../../components/discount/QuantityDiscountBadge';
import placeholderimage from "../../assets/images/placeholder.jpg";

const CartSidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { theme } = useTheme();

  const cartItems = useSelector((state) => state.cart.items);
  const user = useSelector((state) => state.auth.user);

  // API mutations for discounts
  const [calculateCartPrices] = useCalculateCartPricesMutation();
  const [calculateQuantityPrice] = useCalculateQuantityPriceMutation();
  
  const [discountedTotals, setDiscountedTotals] = useState(null);
  const [individualItemTotals, setIndividualItemTotals] = useState({});
  const [calculatingDiscounts, setCalculatingDiscounts] = useState(false);

  const isDark = theme === 'dark';
  const [isProcessing, setIsProcessing] = useState(false);

  // Helper functions from cartUtils
  const cleanProductId = (product) => {
    if (!product) return null;
    const rawId = product._id || product.id;
    if (!rawId) return null;
    
    if (rawId.includes('-')) {
      const parts = rawId.split('-');
      const lastPart = parts[parts.length - 1];
      if (/^[A-Z][a-z]*$/.test(lastPart)) {
        return parts.slice(0, -1).join('-');
      }
    }
    return rawId;
  };

  const isValidImage = (imageUrl) => {
    if (!imageUrl || typeof imageUrl !== 'string') return false;
    if (imageUrl === 'null' || imageUrl === 'undefined') return false;
    if (imageUrl.includes('via.placeholder.com')) return false;
    if (imageUrl.includes('No+Image')) return false;
    return true;
  };

  const getProductImage = (item) => {
    if (!item) return placeholderimage;

    // Priority 1: Variant image
    if (item.variant?.image && isValidImage(item.variant.image)) {
      return item.variant.image;
    }

    // Priority 2: Product main image
    if (item.product?.image && isValidImage(item.product.image)) {
      return item.product.image;
    }

    // Priority 3: Product images array
    if (item.product?.images && item.product.images.length > 0) {
      const validImage = item.product.images.find(img => isValidImage(img));
      if (validImage) return validImage;
    }

    return placeholderimage;
  };

  // Calculate individual item totals with discounts
  useEffect(() => {
    const calculateIndividualTotals = async () => {
      if (cartItems.length === 0) {
        setIndividualItemTotals({});
        return;
      }

      const newTotals = {};
      
      for (const item of cartItems) {
        try {
          const cleanProductIdValue = cleanProductId(item.product);
          if (!cleanProductIdValue) {
            // Fallback to original calculation
            const price = Number(item.variant?.price) || Number(item.price) || 0;
            newTotals[item.id] = {
              finalPrice: price * item.quantity,
              originalPrice: price * item.quantity,
              discount: null,
              savings: 0,
              hasDiscount: false
            };
            continue;
          }

          const result = await calculateQuantityPrice({
            productId: cleanProductIdValue,
            variantId: item.variant?._id,
            quantity: item.quantity
          }).unwrap();

          if (result.success) {
            newTotals[item.id] = {
              finalPrice: result.data.finalPrice,
              originalPrice: result.data.originalPrice,
              discount: result.data.applicableDiscount,
              savings: result.data.totalSavings,
              hasDiscount: result.data.totalSavings > 0
            };
          } else {
            // Fallback
            const price = Number(item.variant?.price) || Number(item.price) || 0;
            newTotals[item.id] = {
              finalPrice: price * item.quantity,
              originalPrice: price * item.quantity,
              discount: null,
              savings: 0,
              hasDiscount: false
            };
          }
        } catch (error) {
          console.error('Error calculating item price:', error);
          const price = Number(item.variant?.price) || Number(item.price) || 0;
          newTotals[item.id] = {
            finalPrice: price * item.quantity,
            originalPrice: price * item.quantity,
            discount: null,
            savings: 0,
            hasDiscount: false
          };
        }
      }
      
      setIndividualItemTotals(newTotals);
    };

    calculateIndividualTotals();
  }, [cartItems, calculateQuantityPrice]);

  // Calculate cart totals with discounts
  useEffect(() => {
    const calculateDiscountedCart = async () => {
      if (cartItems.length === 0) {
        setDiscountedTotals(null);
        return;
      }

      setCalculatingDiscounts(true);
      try {
        const items = cartItems.map(item => ({
          productId: item.product._id,
          quantity: item.quantity,
          variantId: item.variant?._id
        }));

        const result = await calculateCartPrices(items).unwrap();
        
        if (result.success) {
          setDiscountedTotals(result.data);
        } else {
          setDiscountedTotals(null);
        }
      } catch (error) {
        console.error('Error calculating cart discounts:', error);
        setDiscountedTotals(null);
      } finally {
        setCalculatingDiscounts(false);
      }
    };

    calculateDiscountedCart();
  }, [cartItems, calculateCartPrices]);

  // Calculate cart summary with discounts
  const cartSummary = useMemo(() => {
    // Calculate original subtotal
    const originalSubtotal = cartItems.reduce((sum, item) => {
      const price = Number(item.variant?.price) || Number(item.price) || 0;
      const qty = Number(item.quantity) || 0;
      return sum + price * qty;
    }, 0);

    // Calculate discounted subtotal
    let actualSubtotal = originalSubtotal;
    let totalDiscount = 0;

    if (Object.keys(individualItemTotals).length > 0) {
      actualSubtotal = Object.values(individualItemTotals).reduce((total, itemTotal) => {
        return total + (itemTotal.finalPrice || 0);
      }, 0);
      totalDiscount = originalSubtotal - actualSubtotal;
    } else if (discountedTotals?.summary?.subtotal) {
      actualSubtotal = discountedTotals.summary.subtotal;
      totalDiscount = discountedTotals.summary.totalDiscount || 0;
    }

    const shipping = actualSubtotal >= 50 ? 0 : 0;
    const total = actualSubtotal + shipping;

    return {
      originalSubtotal: Number(originalSubtotal.toFixed(2)),
      actualSubtotal: Number(actualSubtotal.toFixed(2)),
      totalDiscount: Number(totalDiscount.toFixed(2)),
      shipping: Number(shipping.toFixed(2)),
      total: Number(total.toFixed(2)),
      itemsCount: cartItems.reduce((c, item) => c + (item.quantity || 0), 0),
      hasDiscount: totalDiscount > 0
    };
  }, [cartItems, individualItemTotals, discountedTotals]);

  // Get item total with discounts
  const getItemTotalWithDiscount = (item) => {
    if (individualItemTotals[item.id]) {
      return individualItemTotals[item.id].finalPrice;
    }
    
    // Fallback calculation
    const price = Number(item.variant?.price) || Number(item.price) || 0;
    const qty = Number(item.quantity) || 0;
    return price * qty;
  };

  // Get item discount info
  const getItemDiscount = (item) => {
    if (individualItemTotals[item.id]) {
      const itemTotal = individualItemTotals[item.id];
      const originalPrice = (Number(item.variant?.price) || Number(item.price) || 0) * item.quantity;
      return originalPrice - itemTotal.finalPrice;
    }
    return 0;
  };

  // QUANTITY CHANGE with discount recalculation
  const handleQuantityChange = async (itemId, newQty) => {
    if (newQty < 1) return;
    
    dispatch(updateQuantity({ itemId, quantity: newQty }));
    
    // Update individual total for this item
    const item = cartItems.find(item => item.id === itemId);
    if (item) {
      try {
        const cleanProductIdValue = cleanProductId(item.product);
        if (cleanProductIdValue) {
          const result = await calculateQuantityPrice({
            productId: cleanProductIdValue,
            variantId: item.variant?._id,
            quantity: newQty
          }).unwrap();

          if (result.success) {
            setIndividualItemTotals(prev => ({
              ...prev,
              [itemId]: {
                finalPrice: result.data.finalPrice,
                originalPrice: result.data.originalPrice,
                discount: result.data.applicableDiscount,
                savings: result.data.totalSavings,
                hasDiscount: result.data.totalSavings > 0
              }
            }));
          }
        }
      } catch (error) {
        // If API call fails, it will be updated in the next useEffect cycle
        console.error('Error updating item discount:', error);
      }
    }
  };

  const handleRemoveItem = (itemId) => dispatch(removeCartItem(itemId));

  // CHECKOUT HANDLER
  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    setIsProcessing(true);

    setTimeout(() => {
      onClose();

      if (!user) {
        navigate('/login', { state: { from: '/checkout' } });
        return;
      }

      navigate('/checkout');
      setIsProcessing(false);
    }, 300);
  };

  // ESC CLOSE
  useEffect(() => {
    const keyClose = (e) => e.key === 'Escape' && isOpen && onClose();
    document.addEventListener('keydown', keyClose);

    return () => document.removeEventListener('keydown', keyClose);
  }, [isOpen, onClose]);

  // STOP BODY SCROLL
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => (document.body.style.overflow = 'unset');
  }, [isOpen]);

  // Render discount badge for item
  const renderItemDiscountBadge = (item) => {
    const discount = getItemDiscount(item);
    if (discount <= 0) return null;

    const discountInfo = individualItemTotals[item.id]?.discount;
    const isFixedAmount = discountInfo?.priceType === 'FIXED_AMOUNT';
    
    return (
      <div className={`absolute -top-1 -right-1 text-white text-xs px-2 py-1 rounded-full ${
        isFixedAmount ? 'bg-purple-500' : 'bg-green-500'
      }`}>
        {isFixedAmount ? (
          <>-₹{discount.toFixed(0)}</>
        ) : (
          <>{discountInfo?.value}% OFF</>
        )}
      </div>
    );
  };

  // Render discount indicator
  const renderDiscountIndicator = (item) => {
    const discount = getItemDiscount(item);
    if (discount <= 0) return null;

    const discountInfo = individualItemTotals[item.id]?.discount;
    const isFixedAmount = discountInfo?.priceType === 'FIXED_AMOUNT';
    
    return (
      <span className={`text-xs px-1.5 py-0.5 rounded ${
        isFixedAmount 
          ? 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400' 
          : 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400'
      }`}>
        {isFixedAmount ? 'Fixed Price' : 'Bulk Save'}
      </span>
    );
  };

  const EmptyCart = () => (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <FiShoppingBag className="w-10 h-10 text-gray-400" />
      </div>
      <p className="text-lg font-semibold">Your cart is empty</p>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Add items to get started</p>

      <button
        onClick={onClose}
        className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl font-medium hover:opacity-90 transition"
      >
        <Link to={'/shop'}>Continue Shopping</Link>
      </button>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />

          {/* SIDEBAR */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className={`fixed top-0 right-0 h-screen w-full max-w-sm z-[101] shadow-2xl flex flex-col border-l ${
              isDark
                ? 'bg-gray-900 text-white border-gray-800'
                : 'bg-white text-gray-900 border-gray-200'
            }`}
          >
            {/* HEADER */}
            <div className="p-5 border-b flex items-center justify-between font-ui text-base">
              <div className="flex items-center gap-3">
                <FiShoppingBag className="w-6 h-6" />
                <div>
                  <h2 className="text-lg font-semibold font-heading">Shopping Cart</h2>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {cartSummary.itemsCount} items
                    </p>
                    {calculatingDiscounts && (
                      <span className="text-xs text-blue-500 animate-pulse">
                        Calculating...
                      </span>
                    )}
                    {cartSummary.hasDiscount && (
                      <span className="text-xs text-green-500 flex items-center gap-1">
                        <FiPercent className="w-3 h-3" />
                        Discounts applied
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 font-body">
              {cartItems.length === 0 ? (
                <EmptyCart />
              ) : (
                cartItems.map((item) => {
                  const price = Number(item.variant?.price) || Number(item.price) || 0;
                  const originalTotal = price * (item.quantity || 0);
                  const discountedTotal = getItemTotalWithDiscount(item);
                  const itemDiscount = getItemDiscount(item);
                  const hasDiscount = itemDiscount > 0;
                  const imageUrl = getProductImage(item);

                  return (
                    <div
                      key={item.id}
                      className="flex gap-4 p-3 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-sm transition"
                    >
                      {/* IMAGE */}
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <img
                          src={imageUrl}
                          alt={item.product?.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            const placeholder = document.createElement('div');
                            placeholder.className = "w-full h-full bg-gray-200 flex items-center justify-center";
                            placeholder.innerHTML = '<FiImage class="w-6 h-6 text-gray-400" />';
                            e.target.parentElement.appendChild(placeholder);
                          }}
                        />
                        {renderItemDiscountBadge(item)}
                      </div>

                      {/* DETAILS */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-sm line-clamp-1 font-ui">
                              {item.product?.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Size: {item.variant?.size || 'One Size'}
                              </p>
                              {hasDiscount && renderDiscountIndicator(item)}
                            </div>
                            
                            {/* QUANTITY DISCOUNT BADGE */}
                            {item.product && (
                              <div className="mt-1">
                                <QuantityDiscountBadge 
                                  product={item.product}
                                  variant={item.variant}
                                  currentQuantity={item.quantity}
                                  compact={true}
                                />
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* QUANTITY */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="px-3 py-1 text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <FiMinus className="w-3 h-3" />
                            </button>
                            <span className="px-4 py-1 text-sm font-semibold font-ui">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="px-3 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <FiPlus className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="font-semibold font-ui">₹{discountedTotal.toFixed(2)}</p>
                            {hasDiscount && (
                              <>
                                <p className="text-xs line-through text-gray-500 dark:text-gray-400">
                                  ₹{originalTotal.toFixed(2)}
                                </p>
                                <p className="text-xs text-green-600 dark:text-green-400">
                                  Save ₹{itemDiscount.toFixed(2)}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* FOOTER */}
            {cartItems.length > 0 && (
              <div className="border-t p-4 space-y-4 font-ui border-gray-200 dark:border-gray-800">
                {/* DISCOUNT SUMMARY */}
                {cartSummary.totalDiscount > 0 && (
                  <div
                    className={`p-3 rounded-xl text-sm border flex flex-col gap-1 ${
                      isDark
                        ? 'bg-green-900/20 text-green-300 border-green-800/50'
                        : 'bg-green-50 text-green-700 border-green-200'
                    }`}
                  >
                    <span className="flex items-center gap-2 font-semibold">
                      <FiPercent className="w-4 h-4" /> 
                      Quantity Discounts Applied
                    </span>
                    <p className="text-xs opacity-80">
                      You saved ₹{cartSummary.totalDiscount.toFixed(2)} through bulk pricing
                    </p>
                  </div>
                )}

                {/* SHIPPING MESSAGE */}
                {cartSummary.actualSubtotal < 50 && (
                  <div
                    className={`p-3 rounded-xl text-sm border flex flex-col gap-1 ${
                      isDark
                        ? 'bg-blue-900/20 text-blue-300 border-blue-800/50'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}
                  >
                    <span className="flex items-center gap-2 font-semibold">
                      <FiCheck className="w-4 h-4" /> Free shipping on orders over ₹50
                    </span>
                    <p className="text-xs opacity-80">
                      Add ₹{(50 - cartSummary.actualSubtotal).toFixed(2)} more to qualify
                    </p>
                  </div>
                )}

                {/* SUMMARY */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm opacity-80">
                    <span>Original Subtotal</span>
                    <span>₹{cartSummary.originalSubtotal.toFixed(2)}</span>
                  </div>

                  {cartSummary.totalDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                      <span>Quantity Discounts</span>
                      <span>-₹{cartSummary.totalDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span
                      className={
                        cartSummary.shipping === 0
                          ? 'text-green-600 dark:text-green-400'
                          : ''
                      }
                    >
                      {cartSummary.shipping === 0
                        ? 'FREE'
                        : `₹${cartSummary.shipping.toFixed(2)}`}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-gray-300 dark:border-gray-600 flex justify-between text-base font-bold">
                    <span>Total</span>
                    <span className="text-blue-600 dark:text-blue-400">
                      ₹{cartSummary.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* BULK PURCHASE TIP */}
                {cartSummary.totalDiscount === 0 && cartItems.some(item => item.quantity === 1) && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <p className="text-xs text-yellow-700 dark:text-yellow-400 text-center">
                      💡 <strong>Tip:</strong> Increase quantities to unlock bulk discounts!
                    </p>
                  </div>
                )}

                {/* CHECKOUT BUTTON */}
                <button
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center transition ${
                    isProcessing 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-black dark:bg-white text-white dark:text-black hover:opacity-90'
                  }`}
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current" />
                      Processing...
                    </div>
                  ) : user ? (
                    <>
                      Proceed to Pay <FiArrowRight className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    'Login to Checkout'
                  )}
                </button>

                <button
                  onClick={() =>
                    window.confirm('Clear all items from cart?') && dispatch(clearCart())
                  }
                  className="w-full text-center text-sm text-red-500 dark:text-red-400 hover:underline"
                >
                  Clear Cart
                </button>

                <Link
                  to="/cart"
                  onClick={onClose}
                  className="w-full text-center text-sm text-blue-500 dark:text-blue-400 hover:underline block"
                >
                  View Full Cart Page
                </Link>

                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                  Free shipping & Returns • Secure checkout
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartSidebar;