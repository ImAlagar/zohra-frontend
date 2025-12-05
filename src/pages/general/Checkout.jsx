import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { clearCart } from '../../redux/slices/cartSlice';
import { useTheme } from '../../context/ThemeContext';
import { 
  useCalculateOrderTotalsMutation,
  useInitiatePaymentMutation,
  useCreateCODOrderMutation,
} from '../../redux/services/orderService';
import {
  ArrowLeft,
  CheckCircle,
  CreditCard,
  Lock,
  MapPin,
  Package,
  Shield,
  Truck,
  User,
  ShoppingBag,
  AlertCircle,
  ChevronRight,
  Percent,
  Tag,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import RazorpayButton from './RazorpayButton';
import { useGetAvailableCouponsQuery, useValidateCouponMutation } from '../../redux/services/couponService';

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { theme } = useTheme();

  // Get cart items and user from Redux
  const cartItems = useSelector((state) => state.cart.items);
  const user = useSelector((state) => state.auth.user);

  // API mutations
  const [calculateOrderTotals] = useCalculateOrderTotalsMutation();
  const [initiatePayment] = useInitiatePaymentMutation();
  const [createCODOrder] = useCreateCODOrderMutation();
  const [validateCoupon] = useValidateCouponMutation();
  
  // Get available coupons
  const { data: availableCouponsData, refetch: refetchCoupons } = useGetAvailableCouponsQuery(
    cartItems.reduce((sum, item) => sum + (item.variant.price * item.quantity), 0)
  );

  // Form states
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [showCoupons, setShowCoupons] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [orderTotals, setOrderTotals] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  
  const [formData, setFormData] = useState({
    email: user?.email || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: '',
    shippingMethod: 'standard',
    paymentMethod: 'razorpay',
    saveInfo: false,
    giftNote: '',
    agreeTerms: false
  });

  // Shipping options
  const shippingOptions = [
    {
      id: 'standard',
      name: 'Standard Shipping',
      price: 0, // Free shipping for all orders according to backend
      delivery: '3-5 business days',
      icon: <Truck className="w-5 h-5" />
    },
    {
      id: 'express',
      name: 'Express Shipping',
      price: 12.99,
      delivery: '1-2 business days',
      icon: <Package className="w-5 h-5" />
    },
    {
      id: 'overnight',
      name: 'Overnight Shipping',
      price: 24.99,
      delivery: 'Next business day',
      icon: <Truck className="w-5 h-5" />
    }
  ];

  // Payment methods
  const paymentMethods = [
    {
      id: 'razorpay',
      name: 'Online Payment',
      icon: <CreditCard className="w-5 h-5" />
    },
    {
      id: 'cod',
      name: 'Cash on Delivery',
      icon: 'COD'
    }
  ];

  // Calculate initial cart summary
  const calculateCartSummary = () => {
    const subtotal = cartItems.reduce((sum, item) => 
      sum + (item.variant.price * item.quantity), 0
    );
    
    const shipping = shippingOptions.find(s => s.id === formData.shippingMethod)?.price || 0;
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shipping + tax;
    
    return {
      subtotal: Number(subtotal.toFixed(2)),
      shipping: Number(shipping.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      total: Number(total.toFixed(2)),
      itemsCount: cartItems.reduce((count, item) => count + item.quantity, 0)
    };
  };

  // Calculate order totals with backend
  const calculateOrderTotalsWithBackend = async () => {
    if (cartItems.length === 0) return;

    try {
      setIsCalculating(true);
      
      // Prepare order items for backend
      const orderItems = cartItems.map(item => ({
        productId: item.product._id,
        productVariantId: item.variant._id,
        quantity: item.quantity
      }));

      // Call backend to calculate totals with coupon
      const result = await calculateOrderTotals({
        orderItems,
        couponCode: appliedCoupon?.code || null
      }).unwrap();

      setOrderTotals(result.data);
      
    } catch (error) {
      console.error('Error calculating order totals:', error);
      toast.error('Failed to calculate order totals');
      
      // Fallback to local calculation
      const cartSummary = calculateCartSummary();
      setOrderTotals({
        subtotal: cartSummary.subtotal,
        shippingCost: cartSummary.shipping,
        totalAmount: cartSummary.total,
        couponDiscount: appliedCoupon?.discount || 0,
        quantitySavings: 0,
        hasQuantityDiscounts: false
      });
    } finally {
      setIsCalculating(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle shipping method change
  const handleShippingChange = (methodId) => {
    setFormData(prev => ({
      ...prev,
      shippingMethod: methodId
    }));
  };

  // Handle payment method change
  const handlePaymentChange = (methodId) => {
    setFormData(prev => ({
      ...prev,
      paymentMethod: methodId
    }));
  };

  // Handle coupon apply
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    try {
      const result = await validateCoupon({
        code: couponCode,
        subtotal: calculateCartSummary().subtotal
      }).unwrap();

      if (result.success && result.data) {
        setAppliedCoupon({
          ...result.data.coupon,
          discount: result.data.discount
        });
        setCouponError('');
        toast.success('Coupon applied successfully!');
        calculateOrderTotalsWithBackend();
      } else {
        setCouponError('Invalid coupon code');
        toast.error('Invalid coupon code');
      }
    } catch (error) {
      setCouponError(error.data?.message || 'Invalid coupon code');
      toast.error(error.data?.message || 'Failed to apply coupon');
    }
  };

  // Handle remove coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
    calculateOrderTotalsWithBackend();
    toast.success('Coupon removed');
  };

  // Validate form
  const validateForm = () => {
    const requiredFields = [
      'email', 'firstName', 'lastName', 'address', 
      'city', 'state', 'zipCode', 'phone'
    ];
    
    for (const field of requiredFields) {
      if (!formData[field]?.trim()) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }

    if (!formData.agreeTerms) {
      toast.error('Please agree to the terms and conditions');
      return false;
    }

    return true;
  };

  // Handle COD order
  const handleCreateCODOrder = async () => {
    if (!validateForm()) return;
    
    setIsProcessing(true);
    
    try {
      // Prepare order data
      const orderData = {
        userId: user?.id,
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.zipCode,
        orderItems: cartItems.map(item => ({
          productId: item.product._id,
          productVariantId: item.variant._id,
          quantity: item.quantity
        })),
        couponCode: appliedCoupon?.code || null
      };

      // Call backend to create COD order
      const result = await createCODOrder({ orderData }).unwrap();
      
      if (result.success) {
        setOrderNumber(result.data.orderNumber);
        dispatch(clearCart());
        setOrderSuccess(true);
        toast.success('COD order created successfully!');
      }
      
    } catch (error) {
      console.error('COD order error:', error);
      toast.error(error.data?.message || 'Failed to create COD order');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Razorpay payment
  const handleRazorpayPayment = async (razorpayOrderId, tempOrderData) => {
    // This will be handled by RazorpayButton component
    console.log('Razorpay payment initiated:', razorpayOrderId);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (formData.paymentMethod === 'cod') {
      await handleCreateCODOrder();
      return;
    }

    // For Razorpay payment, we'll let the RazorpayButton handle it
    setIsProcessing(true);
    
    try {
      // Prepare order data
      const orderData = {
        userId: user?.id,
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.zipCode,
        orderItems: cartItems.map(item => ({
          productId: item.product._id,
          productVariantId: item.variant._id,
          quantity: item.quantity
        })),
        couponCode: appliedCoupon?.code || null
      };

      // Call backend to initiate payment
      const result = await initiatePayment({ orderData }).unwrap();
      
      if (result.success && result.data.razorpayOrder) {
        // Store temp order data for verification
        const tempOrderData = result.data.tempOrderData;
        
        // RazorpayButton will handle the payment
        // We'll pass the necessary data to it
      }
      
    } catch (error) {
      console.error('Payment initiation error:', error);
      toast.error(error.data?.message || 'Failed to initiate payment');
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculate totals when cart or coupon changes
  useEffect(() => {
    calculateOrderTotalsWithBackend();
  }, [cartItems, appliedCoupon, formData.shippingMethod]);

  // Redirect if cart is empty and not in success state
  useEffect(() => {
    if (cartItems.length === 0 && !orderSuccess) {
      navigate('/cart');
    }
  }, [cartItems, orderSuccess, navigate]);

  // Prefill user data if available
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
      }));
    }
  }, [user]);

  // Success screen
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <Link 
              to="/"
              className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 sm:p-12">
            {/* Success Icon */}
            <div className="flex justify-center mb-8">
              <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
            </div>
            
            {/* Success Message */}
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Order Confirmed!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">
                Thank you for your purchase
              </p>
              <p className="text-gray-500 dark:text-gray-500">
                Order #{orderNumber}
              </p>
            </div>
            
            {/* Order Details */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Order Summary
              </h2>
              <div className="space-y-3">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 mr-4">
                        <img
                          src={item.variant.image || item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {item.product.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {item.quantity} × ${item.variant.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      ${(item.variant.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400 mb-2">
                    <span>Subtotal</span>
                    <span>${orderTotals?.subtotal?.toFixed(2) || '0.00'}</span>
                  </div>
                  {orderTotals?.quantitySavings > 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400 mb-2">
                      <span>Quantity Discount</span>
                      <span>-${orderTotals.quantitySavings.toFixed(2)}</span>
                    </div>
                  )}
                  {appliedCoupon && (
                    <div className="flex justify-between text-blue-600 dark:text-blue-400 mb-2">
                      <span>Coupon Discount ({appliedCoupon.code})</span>
                      <span>-${orderTotals?.couponDiscount?.toFixed(2) || '0.00'}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600 dark:text-gray-400 mb-2">
                    <span>Shipping</span>
                    <span>${orderTotals?.shippingCost?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400 mb-2">
                    <span>Tax</span>
                    <span>${(orderTotals?.totalAmount * 0.08).toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <span>Total</span>
                    <span>${orderTotals?.totalAmount?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Delivery Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Shipping Address</h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  {formData.firstName} {formData.lastName}<br />
                  {formData.address}<br />
                  {formData.city}, {formData.state} {formData.zipCode}<br />
                  {formData.country}
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <Truck className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Delivery</h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  {shippingOptions.find(s => s.id === formData.shippingMethod)?.name}<br />
                  Estimated delivery: {shippingOptions.find(s => s.id === formData.shippingMethod)?.delivery}
                </p>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/orders"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 text-center"
              >
                View Order Details
              </Link>
              <Link
                to="/shop"
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 text-center"
              >
                Continue Shopping
              </Link>
            </div>
            
            {/* Email Confirmation */}
            <div className="mt-8 text-center text-gray-500 dark:text-gray-400 text-sm">
              <p>A confirmation email has been sent to {formData.email}</p>
            </div>
          </div>
          
          {/* Support */}
          <div className="text-center mt-8">
            <p className="text-gray-600 dark:text-gray-400">
              Need help? <Link to="/contact" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">Contact our support team</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/cart"
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Checkout</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Complete your purchase with confidence
          </p>
        </div>

        {/* Main Content */}
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Contact Information */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center mb-6">
                  <User className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Contact Information
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                      placeholder="(123) 456-7890"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center mb-6">
                  <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Shipping Address
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      First name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Last name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                      placeholder="Doe"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Street address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                      placeholder="123 Main St"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Apartment, suite, etc. (optional)
                    </label>
                    <input
                      type="text"
                      name="apartment"
                      value={formData.apartment}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                      placeholder="Apt 4B"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                      placeholder="New York"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                      placeholder="California"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ZIP code *
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                      placeholder="10001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Country *
                    </label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Australia">Australia</option>
                      <option value="India">India</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Shipping Method */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center mb-6">
                  <Truck className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Shipping Method
                  </h2>
                </div>
                <div className="space-y-4">
                  {shippingOptions.map((option) => (
                    <label
                      key={option.id}
                      className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${
                        formData.shippingMethod === option.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="shippingMethod"
                          value={option.id}
                          checked={formData.shippingMethod === option.id}
                          onChange={() => handleShippingChange(option.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="ml-3 flex items-center">
                          <span className="mr-3 text-gray-500 dark:text-gray-400">
                            {option.icon}
                          </span>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {option.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {option.delivery}
                            </p>
                          </div>
                        </div>
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        ${option.price === 0 ? 'FREE' : `${option.price.toFixed(2)}`}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center mb-6">
                  <CreditCard className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Payment Method
                  </h2>
                </div>
                
                {/* Payment Method Selection */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {paymentMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-all ${
                        formData.paymentMethod === method.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={formData.paymentMethod === method.id}
                        onChange={() => handlePaymentChange(method.id)}
                        className="sr-only"
                      />
                      <div className="mb-2">
                        {typeof method.icon === 'string' ? (
                          <div className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">
                              {method.icon}
                            </span>
                          </div>
                        ) : (
                          method.icon
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {method.name}
                      </span>
                    </label>
                  ))}
                </div>

                {/* Payment Method Details */}
                {formData.paymentMethod === 'razorpay' && (
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-blue-800 dark:text-blue-300">
                      You will be redirected to Razorpay's secure payment gateway to complete your payment.
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                      We accept all major credit/debit cards, UPI, and net banking.
                    </p>
                  </div>
                )}

                {formData.paymentMethod === 'cod' && (
                  <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <p className="text-amber-800 dark:text-amber-300">
                      Pay when your order arrives. An additional cash handling fee may apply.
                    </p>
                    <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
                      Please keep exact change ready for delivery.
                    </p>
                  </div>
                )}
              </div>

              {/* Additional Options */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="saveInfo"
                      checked={formData.saveInfo}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">
                      Save my information for faster checkout next time
                    </span>
                  </label>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Gift message (optional)
                    </label>
                    <textarea
                      name="giftNote"
                      value={formData.giftNote}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                      placeholder="Add a personal note to your order..."
                    />
                  </div>
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      name="agreeTerms"
                      checked={formData.agreeTerms}
                      onChange={handleInputChange}
                      required
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">
                      I agree to the{' '}
                      <Link to="/terms" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                        Terms of Service
                      </Link>
                      {' '}and{' '}
                      <Link to="/privacy" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                </div>
              </div>

              {/* Place Order Button */}
              <div className="sticky bottom-0 bg-white dark:bg-gray-800 py-4 border-t border-gray-200 dark:border-gray-700 -mx-6 px-6">
                {formData.paymentMethod === 'razorpay' ? (
                  <RazorpayButton
                    orderData={{
                      userId: user?.id,
                      name: `${formData.firstName} ${formData.lastName}`,
                      email: formData.email,
                      phone: formData.phone,
                      address: formData.address,
                      city: formData.city,
                      state: formData.state,
                      pincode: formData.zipCode,
                      orderItems: cartItems.map(item => ({
                        productId: item.product._id,
                        productVariantId: item.variant._id,
                        quantity: item.quantity
                      })),
                      couponCode: appliedCoupon?.code || null
                    }}
                    amount={orderTotals?.totalAmount || 0}
                    isProcessing={isProcessing}
                    setIsProcessing={setIsProcessing}
                    setOrderSuccess={setOrderSuccess}
                    setOrderNumber={setOrderNumber}
                    disabled={!formData.agreeTerms || cartItems.length === 0}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={handleCreateCODOrder}
                    disabled={isProcessing || !formData.agreeTerms || cartItems.length === 0}
                    className="w-full py-4 px-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-xl shadow-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                        Processing COD Order...
                      </>
                    ) : (
                      <>
                        Place COD Order • ${orderTotals?.totalAmount?.toFixed(2) || '0.00'}
                      </>
                    )}
                  </button>
                )}
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-3">
                  <Shield className="inline-block w-4 h-4 mr-1" />
                  Your payment is secured and encrypted
                </p>
              </div>
            </form>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1 mt-8 lg:mt-0">
            <div className="sticky top-8">
              {/* Order Summary Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    Order Summary
                  </h2>
                </div>

                {/* Order Items */}
                <div className="p-6 max-h-96 overflow-y-auto">
                  {cartItems.map((item, index) => (
                    <div key={index} className="flex items-center py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                          <img
                            src={item.variant.image || item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = '/api/placeholder/64/64';
                            }}
                          />
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white line-clamp-1">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {item.variant.color} • {item.variant.size}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">
                          ${(item.variant.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          ${item.variant.price.toFixed(2)} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon Section */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                  {appliedCoupon ? (
                    <div className="mb-4">
                      <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                        <div className="flex items-center">
                          <Tag className="w-4 h-4 text-green-600 dark:text-green-400 mr-2" />
                          <span className="font-medium text-green-700 dark:text-green-300">
                            {appliedCoupon.code}
                          </span>
                        </div>
                        <button
                          onClick={handleRemoveCoupon}
                          className="text-red-600 hover:text-red-700 dark:text-red-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                        -${orderTotals?.couponDiscount?.toFixed(2) || '0.00'} discount applied
                      </p>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <button
                        onClick={() => setShowCoupons(!showCoupons)}
                        className="flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400"
                      >
                        <Percent className="w-4 h-4 mr-2" />
                        {showCoupons ? 'Hide Available Coupons' : 'Apply Coupon'}
                        <ChevronRight className={`w-4 h-4 ml-1 transition-transform ${showCoupons ? 'rotate-90' : ''}`} />
                      </button>
                      
                      {showCoupons && (
                        <div className="mt-4 space-y-3">
                          {availableCouponsData?.data?.map((coupon) => (
                            <div
                              key={coupon.id}
                              className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer"
                              onClick={() => {
                                setCouponCode(coupon.code);
                                handleApplyCoupon();
                                setShowCoupons(false);
                              }}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">{coupon.code}</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {coupon.discountType === 'PERCENTAGE' 
                                      ? `${coupon.discountValue}% off` 
                                      : `₹${coupon.discountValue} off`
                                    }
                                  </p>
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  Min. order: ₹{coupon.minOrderAmount}
                                </span>
                              </div>
                            </div>
                          ))}
                          
                          {(!availableCouponsData?.data || availableCouponsData.data.length === 0) && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                              No coupons available
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Coupon Input */}
                  {!appliedCoupon && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value);
                          setCouponError('');
                        }}
                        placeholder="Enter coupon code"
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={!couponCode.trim()}
                        className="px-4 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-900 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                  
                  {couponError && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-2">{couponError}</p>
                  )}
                </div>

                {/* Summary Totals */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Subtotal</span>
                      <span>${orderTotals?.subtotal?.toFixed(2) || '0.00'}</span>
                    </div>
                    
                    {orderTotals?.quantitySavings > 0 && (
                      <div className="flex justify-between text-green-600 dark:text-green-400">
                        <span>Quantity Discount</span>
                        <span>-${orderTotals.quantitySavings.toFixed(2)}</span>
                      </div>
                    )}
                    
                    {appliedCoupon && (
                      <div className="flex justify-between text-blue-600 dark:text-blue-400">
                        <span>Coupon Discount</span>
                        <span>-${orderTotals?.couponDiscount?.toFixed(2) || '0.00'}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Shipping</span>
                      <span>
                        {orderTotals?.shippingCost === 0 ? (
                          <span className="text-green-600 dark:text-green-400">FREE</span>
                        ) : (
                          `$${orderTotals?.shippingCost?.toFixed(2) || '0.00'}`
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>Tax</span>
                      <span>${(orderTotals?.totalAmount * 0.08).toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                      <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                        <span>Total</span>
                        <span>${orderTotals?.totalAmount?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Badges */}
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <Shield className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Secure Payment</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <Lock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">SSL Encrypted</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Money Back</p>
                </div>
              </div>

              {/* Need Help */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-blue-500 dark:text-blue-400 mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-blue-800 dark:text-blue-300 mb-1">
                      Need help with your order?
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      Contact our support team
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;