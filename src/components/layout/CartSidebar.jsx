import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { 
  updateQuantity, 
  removeCartItem, 
  clearCart 
} from '../../redux/slices/cartSlice';
import { useTheme } from '../../context/ThemeContext';
import { 
  X, 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const CartSidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { theme } = useTheme();
  
  // Get cart items from Redux
  const cartItems = useSelector((state) => state.cart.items);
  const user = useSelector((state) => state.auth.user);
  
  // State for free shipping threshold
  const [freeShippingThreshold] = useState(50); // $50 for free shipping
  const [isProcessing, setIsProcessing] = useState(false);
  const [removingItemId, setRemovingItemId] = useState(null);

  // Calculate cart totals
  const cartSummary = React.useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => 
      sum + (item.variant.price * item.quantity), 0
    );
    
    const shipping = subtotal >= freeShippingThreshold || cartItems.length === 0 ? 0 : 5.99;
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shipping + tax;
    
    return {
      subtotal: Number(subtotal.toFixed(2)),
      shipping: Number(shipping.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      total: Number(total.toFixed(2)),
      itemsCount: cartItems.reduce((count, item) => count + item.quantity, 0),
      freeShippingRemaining: Math.max(0, freeShippingThreshold - subtotal)
    };
  }, [cartItems, freeShippingThreshold]);

  // Handle quantity changes
  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    dispatch(updateQuantity({ itemId, quantity: newQuantity }));
  };

  // Handle item removal
  const handleRemoveItem = (itemId) => {
    setRemovingItemId(itemId);
    setTimeout(() => {
      dispatch(removeCartItem(itemId));
      toast.success('Item removed from cart');
      setRemovingItemId(null);
    }, 300);
  };

  // Handle clear cart
  const handleClearCart = () => {
    if (cartItems.length === 0) return;
    
    if (window.confirm('Are you sure you want to clear your cart?')) {
      dispatch(clearCart());
      toast.success('Cart cleared');
    }
  };

  // Handle checkout
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate processing delay
    setTimeout(() => {
      onClose();
      navigate('/checkout');
      setIsProcessing(false);
    }, 500);
  };

  // Handle continue shopping
  const handleContinueShopping = () => {
    onClose();
    navigate('/shop');
  };

  // Close sidebar on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Render empty cart
  if (cartItems.length === 0) {
    return (
      <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Sidebar */}
        <div className={`fixed inset-y-0 right-0 w-full sm:w-96 flex flex-col bg-white dark:bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <ShoppingBag className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Your Cart
              </h2>
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                0 items
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Empty Cart Content */}
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="w-24 h-24 mb-4 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <ShoppingBag className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Your cart is empty
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
              Looks like you haven't added any items to your cart yet.
            </p>
            <button
              onClick={handleContinueShopping}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Continue Shopping
            </button>
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Need help? <Link to="/contact" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">Contact us</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-screen w-80 max-w-[90vw] z-[101]  sm:w-96 flex flex-col bg-white dark:bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <ShoppingBag className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Your Cart
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {cartSummary.itemsCount} {cartSummary.itemsCount === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-4 sm:px-6">
            {/* Free Shipping Progress */}
            {cartSummary.freeShippingRemaining > 0 && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Free shipping on orders over ${freeShippingThreshold}
                  </span>
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    ${cartSummary.freeShippingRemaining.toFixed(2)} away
                  </span>
                </div>
                <div className="w-full h-2 bg-blue-100 dark:bg-blue-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min(100, ((freeShippingThreshold - cartSummary.freeShippingRemaining) / freeShippingThreshold) * 100)}%` 
                    }}
                  />
                </div>
              </div>
            )}

            {/* Items List */}
            <ul className="space-y-4">
              {cartItems.map((item) => {
                const itemTotal = item.variant.price * item.quantity;
                const isRemoving = removingItemId === item.id;
                
                return (
                  <li 
                    key={item.id}
                    className={`p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-300 ${
                      isRemoving ? 'opacity-0 scale-95' : 'opacity-100'
                    }`}
                  >
                    <div className="flex space-x-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                          <img
                            src={item.variant.image || item.product.image || '/api/placeholder/80/80'}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = '/api/placeholder/80/80';
                            }}
                          />
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white line-clamp-1">
                              {item.product.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {item.variant.color} • {item.variant.size}
                            </p>
                            {item.variant.sku && (
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                SKU: {item.variant.sku}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={isRemoving}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white min-w-[40px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.variant.stock}
                              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <p className="font-semibold text-gray-900 dark:text-white">
                              ${itemTotal.toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              ${item.variant.price.toFixed(2)} each
                            </p>
                          </div>
                        </div>

                        {/* Stock Warning */}
                        {item.variant.stock < 5 && (
                          <div className="flex items-center mt-3 text-amber-600 dark:text-amber-400 text-xs">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Only {item.variant.stock} left in stock
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Cart Summary */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          {/* Summary */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
              <span className="font-medium text-gray-900 dark:text-white">
                ${cartSummary.subtotal.toFixed(2)}
              </span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Shipping</span>
              {cartSummary.shipping === 0 ? (
                <span className="font-medium text-green-600 dark:text-green-400 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  FREE
                </span>
              ) : (
                <span className="font-medium text-gray-900 dark:text-white">
                  ${cartSummary.shipping.toFixed(2)}
                </span>
              )}
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Tax</span>
              <span className="font-medium text-gray-900 dark:text-white">
                ${cartSummary.tax.toFixed(2)}
              </span>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
              <div className="flex justify-between text-base font-semibold">
                <span className="text-gray-900 dark:text-white">Total</span>
                <span className="text-gray-900 dark:text-white">
                  ${cartSummary.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Free Shipping Message */}
          {cartSummary.freeShippingRemaining > 0 && cartSummary.freeShippingRemaining <= 20 && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-300 text-center">
                Add ${cartSummary.freeShippingRemaining.toFixed(2)} more for free shipping!
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleCheckout}
              disabled={isProcessing || cartItems.length === 0}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  Proceed to Checkout
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>

            <button
              onClick={handleContinueShopping}
              className="w-full py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              Continue Shopping
            </button>

            {cartItems.length > 0 && (
              <button
                onClick={handleClearCart}
                className="w-full py-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition-colors"
              >
                Clear Cart
              </button>
            )}
          </div>

          {/* Security Badges */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center space-x-6 text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <span className="text-xs">Secure Checkout</span>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span className="text-xs">30-Day Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSidebar;