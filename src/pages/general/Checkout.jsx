// components/Checkout.jsx
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { 
  useCalculateOrderTotalsMutation, 
  useInitiatePaymentMutation,
  useVerifyPaymentMutation,
} from "../../redux/services/orderService";
import { clearCart } from "../../redux/slices/cartSlice";
import { useGetAvailableCouponsQuery, useValidateCouponMutation } from "../../redux/services/couponService";
import { useCalculateQuantityPriceMutation } from "../../redux/services/productService";
import { 
  CreditCard, 
  MapPin, 
  ShoppingCart, 
  Shield, 
  Truck, 
  Percent, 
  Tag, 
  CheckCircle, 
  Lock, 
  ArrowLeft,
  ChevronRight,
  Package,
  Gift,
  AlertCircle,
  Loader2,
  Calendar,
  Clock,
  Smartphone,
  Mail,
  User,
  Home,
  Navigation,
  Sparkles,
  ShieldCheck,
  Zap,
  ShoppingBag,
  CreditCard as CardIcon,
  Banknote,
  QrCode,
  Wallet,
  Smartphone as PhoneIcon,
  X,
  ChevronDown,
  ChevronUp,
  Copy,
  Ticket,
  Sparkles as CouponIcon,
  BadgePercent
} from "lucide-react";
import razorpayService from "../../utils/razorpayService";

const Checkout = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const cartItems = useSelector((state) => state.cart.items);
  const user = useSelector((state) => state.auth.user);

  // API mutations
  const [calculateOrderTotals] = useCalculateOrderTotalsMutation();
  const [initiatePayment] = useInitiatePaymentMutation();
  const [verifyPayment] = useVerifyPaymentMutation();
  const [validateCoupon] = useValidateCouponMutation();
  const [calculateQuantityPrice] = useCalculateQuantityPriceMutation();

  // State
  const [individualItemTotals, setIndividualItemTotals] = useState({});
  const [quantityDiscounts, setQuantityDiscounts] = useState({});
  const [calculatingDiscounts, setCalculatingDiscounts] = useState(false);
  const [showAvailableCoupons, setShowAvailableCoupons] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [activeSection, setActiveSection] = useState("address");
  const [copiedCoupon, setCopiedCoupon] = useState(null);

  // Form state with user data pre-filled 
  const [orderData, setOrderData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    city: user?.city || "",
    state: user?.state || "",
    pincode: user?.pincode || "",
    paymentMethod: "ONLINE"
  });

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [totals, setTotals] = useState({
    subtotal: 0,
    discount: 0,
    shippingCost: 0,
    totalAmount: 0,
    quantityDiscount: 0,
    couponDiscount: 0
  });
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [deliveryEstimate, setDeliveryEstimate] = useState("");

  // Theme colors
  const isDark = theme === "dark";
  const bgPrimary = isDark ? "bg-gradient-to-br from-gray-900 to-gray-950" : "bg-gradient-to-br from-gray-50 to-white";
  const bgSecondary = isDark ? "bg-gray-800/50 backdrop-blur-lg" : "bg-white/80 backdrop-blur-lg";
  const textPrimary = isDark ? "text-gray-100" : "text-gray-900";
  const textSecondary = isDark ? "text-gray-400" : "text-gray-600";
  const borderColor = isDark ? "border-gray-700/50" : "border-gray-200/50";
  const cardBg = isDark ? "bg-gray-800/40 backdrop-blur-lg" : "bg-white/90 backdrop-blur-lg";
  const inputBg = isDark ? "bg-gray-700/30" : "bg-gray-50/80";
  const errorColor = isDark ? "text-red-400" : "text-red-600";
  const errorBorder = isDark ? "border-red-500/50" : "border-red-500";

  // Calculate subtotal for coupon eligibility
  const subtotal = cartItems.reduce((total, item) => {
    const price = item.variant?.price || item.product?.price || 0;
    const quantity = item.quantity || 0;
    return total + (price * quantity);
  }, 0);

  // Get available coupons
  const { 
    data: availableCouponsData, 
    isLoading: couponsLoading,
    refetch: refetchCoupons
  } = useGetAvailableCouponsQuery(subtotal, {
    skip: subtotal === 0
  });

  const availableCoupons = availableCouponsData?.data || [];

  // Calculate discounts
  useEffect(() => {
    const calculateIndividualTotals = async () => {
      if (cartItems.length === 0) return;

      setCalculatingDiscounts(true);
      const newTotals = {};
      const newDiscounts = {};
      
      for (const item of cartItems) {
        try {
            const productId = item.product?._id;
      if (!productId) continue;

      // Clean variant ID if it has '-default'
      let cleanVariantId = item.variant?._id;
      if (cleanVariantId && cleanVariantId.endsWith('-default')) {
        cleanVariantId = cleanVariantId.slice(0, -8);
      }

      const result = await calculateQuantityPrice({
        productId: productId,  // Original product ID
        variantId: cleanVariantId,  // Cleaned variant ID
        quantity: item.quantity
      }).unwrap();

          if (result.success) {
            const originalPrice = (item.variant?.price || item.product?.price || 0) * item.quantity;
            const discountedPrice = result.data.finalPrice;
            const itemDiscount = originalPrice - discountedPrice;

            newTotals[item.id] = {
              finalPrice: discountedPrice,
              originalPrice: originalPrice,
              discount: result.data.applicableDiscount,
              savings: result.data.totalSavings
            };

            newDiscounts[item.id] = {
              discount: itemDiscount,
              discountInfo: result.data.applicableDiscount,
              originalPrice: originalPrice,
              discountedPrice: discountedPrice
            };
          }
        } catch (error) {
          const price = Number(item.variant?.price) || Number(item.product?.price) || 0;
          const originalPrice = price * item.quantity;
          newTotals[item.id] = {
            finalPrice: originalPrice,
            originalPrice: originalPrice,
            discount: null,
            savings: 0
          };
        }
      }
      
      setIndividualItemTotals(newTotals);
      setQuantityDiscounts(newDiscounts);
      
      const discountedSubtotal = Object.values(newTotals).reduce((total, item) => total + item.finalPrice, 0);
      const originalSubtotal = Object.values(newTotals).reduce((total, item) => total + item.originalPrice, 0);
      
      setTotals(prev => ({
        ...prev,
        subtotal: discountedSubtotal,
        quantityDiscount: originalSubtotal - discountedSubtotal,
        totalAmount: discountedSubtotal - (appliedCoupon ? prev.couponDiscount : 0)
      }));
      
      setCalculatingDiscounts(false);
    };

    calculateIndividualTotals();
  }, [cartItems, calculateQuantityPrice]);

  // Calculate delivery estimate
  useEffect(() => {
    const today = new Date();
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + 5); // 5 days delivery
    setDeliveryEstimate(deliveryDate.toLocaleDateString('en-IN', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'short' 
    }));
  }, []);

  // Helper functions
  const getCleanProductId = (productId) => {
    if (!productId) return null;
    
    // List of color suffixes to remove
    const colorSuffixes = ['-Red', '-Blue', '-Green', '-Black', '-White', '-Yellow'];
    
    // Check if productId ends with any color suffix
    for (const suffix of colorSuffixes) {
      if (productId.endsWith(suffix)) {
        return productId.slice(0, -suffix.length);
      }
    }
    
    // Return as is for -default and other suffixes
    return productId;
  };


  const calculateItemTotal = (item) => {
    if (individualItemTotals[item.id]) {
      return individualItemTotals[item.id].finalPrice;
    }
    const price = item.variant?.price || item.product?.price || 0;
    const quantity = item.quantity || 0;
    return price * quantity;
  };

  const getProductImage = (item) => {
    if (!item) return '/placeholder-product.jpg';
    
    if (item.variant?.image) {
      return item.variant.image;
    }
    
    if (item.product?.images?.length > 0) {
      return item.product.images[0];
    }
    
    if (item.product?.image) {
      return item.product.image;
    }
    
    return '/placeholder-product.jpg';
  };

  
const getOrderItemsData = () => {
  return cartItems.map((item) => {
    // Get the IDs
    const productId = item.product?._id || item.product?.id;
    const variantId = item.variant?._id || item.variant?.id;



    if (!productId) {
      throw new Error(`Missing product ID for: ${item.product?.name || 'Unknown Product'}`);
    }

    // Create order item with original product ID
    const orderItem = {
      productId: productId,  // Keep original product ID
      quantity: item.quantity || 1
    };

    // If variant exists and is different from product ID
    if (variantId && variantId !== productId) {
      // Remove '-default' suffix from variant ID if present
      let cleanVariantId = variantId;
      if (variantId.endsWith('-default')) {
        cleanVariantId = variantId.slice(0, -8); // Remove '-default' (8 characters)
      }
      // Only add productVariantId if we have a clean variant ID
      if (cleanVariantId && cleanVariantId !== productId) {
        orderItem.productVariantId = cleanVariantId;
      }
    } else {
      // If variantId doesn't exist or is same as productId, use productId for variant
      orderItem.productVariantId = productId;
    }

    return orderItem;
  });
};


  // Form validation
  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;
    const pincodeRegex = /^\d{6}$/;
    
    if (!orderData.name?.trim()) {
      errors.name = 'Name is required';
    }

    if (!orderData.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(orderData.email)) {
      errors.email = 'Invalid email address';
    }

    if (!orderData.phone?.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(orderData.phone)) {
      errors.phone = 'Phone must be 10 digits';
    }

    if (!orderData.address?.trim()) {
      errors.address = 'Address is required';
    }

    if (!orderData.city?.trim()) {
      errors.city = 'City is required';
    }

    if (!orderData.state?.trim()) {
      errors.state = 'State is required';
    }

    if (!orderData.pincode?.trim()) {
      errors.pincode = 'Pincode is required';
    } else if (!pincodeRegex.test(orderData.pincode)) {
      errors.pincode = 'Pincode must be 6 digits';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle field blur
  const handleFieldBlur = (field) => {
    setTouchedFields({ ...touchedFields, [field]: true });
    
    // Validate specific field
    const errors = { ...formErrors };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;
    const pincodeRegex = /^\d{6}$/;

    if (field === 'name' && !orderData.name?.trim()) {
      errors.name = 'Name is required';
    } else if (field === 'email') {
      if (!orderData.email?.trim()) {
        errors.email = 'Email is required';
      } else if (!emailRegex.test(orderData.email)) {
        errors.email = 'Invalid email address';
      } else {
        delete errors.email;
      }
    } else if (field === 'phone') {
      if (!orderData.phone?.trim()) {
        errors.phone = 'Phone number is required';
      } else if (!phoneRegex.test(orderData.phone)) {
        errors.phone = 'Phone must be 10 digits';
      } else {
        delete errors.phone;
      }
    } else if (field === 'pincode') {
      if (!orderData.pincode?.trim()) {
        errors.pincode = 'Pincode is required';
      } else if (!pincodeRegex.test(orderData.pincode)) {
        errors.pincode = 'Pincode must be 6 digits';
      } else {
        delete errors.pincode;
      }
    } else if (field === 'address' && !orderData.address?.trim()) {
      errors.address = 'Address is required';
    } else if (field === 'city' && !orderData.city?.trim()) {
      errors.city = 'City is required';
    } else if (field === 'state' && !orderData.state?.trim()) {
      errors.state = 'State is required';
    } else {
      delete errors[field];
    }

    setFormErrors(errors);
  };

  // Handle input change
  const handleInputChange = (field, value) => {
    setOrderData({ ...orderData, [field]: value });
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      const newErrors = { ...formErrors };
      delete newErrors[field];
      setFormErrors(newErrors);
    }
  };

  // Coupon Functions
  const copyCouponCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    toast.success(`Coupon code ${code} copied!`);
    
    // Reset copied state after 2 seconds
    setTimeout(() => {
      setCopiedCoupon(null);
    }, 2000);
  };

  const applyCouponFromList = async (coupon) => {
    try {
      setCouponLoading(true);
      const result = await validateCoupon({
        code: coupon.code,
        subtotal: totals.subtotal
      }).unwrap();
      
      if (result.success) {
        setAppliedCoupon(result.data.coupon);
        setCouponCode(coupon.code);
        const couponDiscount = result.data.discount;
        
        setTotals(prev => ({
          ...prev,
          couponDiscount: couponDiscount,
          totalAmount: prev.subtotal - couponDiscount
        }));
        
        setShowCouponModal(false);
        toast.success("Coupon applied successfully!");
      }
    } catch (error) {
      toast.error(error.data?.message || "This coupon is not applicable");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    try {
      setCouponLoading(true);
      const result = await validateCoupon({
        code: couponCode.trim(),
        subtotal: totals.subtotal
      }).unwrap();
      
      if (result.success) {
        setAppliedCoupon(result.data.coupon);
        const couponDiscount = result.data.discount;
        
        setTotals(prev => ({
          ...prev,
          couponDiscount: couponDiscount,
          totalAmount: prev.subtotal - couponDiscount
        }));
        
        toast.success("Coupon applied successfully!");
      }
    } catch (error) {
      toast.error(error.data?.message || "Invalid coupon code");
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setAppliedCoupon(null);
    setTotals(prev => ({
      ...prev,
      couponDiscount: 0,
      totalAmount: prev.subtotal
    }));
    toast.info("Coupon removed");
  };

  // Payment handlers
  const handleRazorpayPayment = async () => {
    // First validate form
    if (!validateForm()) {
      // Mark all fields as touched to show errors
      const allFields = ['name', 'email', 'phone', 'address', 'city', 'state', 'pincode'];
      const touched = {};
      allFields.forEach(field => touched[field] = true);
      setTouchedFields(touched);
      
      toast.error("Please fix all form errors before proceeding");
      return;
    }

    try {
      setPaymentProcessing(true);
      const orderItemsData = getOrderItemsData();
      
      const paymentData = {
        orderData: {
          ...orderData,
          orderItems: orderItemsData,
          couponCode: appliedCoupon?.code || null
        }
      };

      const result = await initiatePayment(paymentData).unwrap();
      
      if (result.success) {
        const { razorpayOrder, tempOrderData } = result.data;

        const razorpayResponse = await razorpayService.openRazorpayCheckout({
          razorpayOrderId: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: "Zohra",
          description: `Order Payment - ${tempOrderData.orderNumber}`,
          prefill: {
            name: orderData.name,
            email: orderData.email,
            contact: orderData.phone
          },
          theme: {
            color: "#9333ea"
          }
        });

        const verificationResult = await verifyPayment({
          razorpay_order_id: razorpayResponse.razorpay_order_id,
          razorpay_payment_id: razorpayResponse.razorpay_payment_id,
          razorpay_signature: razorpayResponse.razorpay_signature,
          orderData: {
            ...orderData,
            orderItems: orderItemsData,
            couponCode: appliedCoupon?.code || null
          }
        }).unwrap();

        if (verificationResult.success) {
          const order = verificationResult.data;
          const successData = {
            orderNumber: order.orderNumber,
            totalAmount: order.totalAmount,
            items: cartItems,
            paymentMethod: 'ONLINE',
            status: 'confirmed'
          };
          
          toast.success("Payment successful! Order confirmed.");
          handleOrderSuccess(successData);
        }
      }
    } catch (error) {
      console.error("Payment failed:", error);
      const errorMessage = error.data?.message || "Payment processing failed";
      toast.error(`Payment failed: ${errorMessage}`);
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handleCODOrder = async () => {
    // First validate form
    if (!validateForm()) {
      // Mark all fields as touched to show errors
      const allFields = ['name', 'email', 'phone', 'address', 'city', 'state', 'pincode'];
      const touched = {};
      allFields.forEach(field => touched[field] = true);
      setTouchedFields(touched);
      
      toast.error("Please fix all form errors before proceeding");
      return;
    }

    try {
      setLoading(true);
      const orderItemsData = getOrderItemsData();
      
      const result = await createCODOrder({
        orderData: {
          ...orderData,
          orderItems: orderItemsData,
          couponCode: appliedCoupon?.code || null
        }
      }).unwrap();
      
      if (result.success) {
        const successData = {
          orderNumber: result.data.orderNumber,
          totalAmount: result.data.totalAmount,
          items: cartItems,
          paymentMethod: 'COD',
          status: 'confirmed'
        };
        
        toast.success("Order placed successfully!");
        handleOrderSuccess(successData);
      }
    } catch (error) {
      toast.error(error.data?.message || "Order creation failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = () => {
    if (orderData.paymentMethod === "COD") {
      handleCODOrder();
    } else {
      handleRazorpayPayment();
    }
  };

  const handleOrderSuccess = (successData) => {
    setOrderCompleted(true);
    localStorage.setItem('orderSuccessData', JSON.stringify(successData));
    dispatch(clearCart());
    navigate('/payment-success', { 
      state: successData,
      replace: true
    });
  };

  // Redirects
  useEffect(() => {
    if (!user) {
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }
    
    if (cartItems.length === 0 && !orderCompleted) {
      const orderSuccessData = localStorage.getItem('orderSuccessData');
      if (!orderSuccessData) {
        navigate("/cart");
      }
    }
  }, [user, cartItems, navigate, orderCompleted]);

  // Coupon Modal Component
  const CouponModal = () => (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 transition-opacity backdrop-blur-sm" 
          onClick={() => setShowCouponModal(false)}
        />
        
        {/* Modal Content */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-900 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-500/5 to-pink-500/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <CouponIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Available Coupons
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {availableCoupons.length} coupons available for your cart
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCouponModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {couponsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
              </div>
            ) : availableCoupons.length === 0 ? (
              <div className="text-center py-12">
                <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No coupons available
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Add more items to unlock coupons
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {availableCoupons.map((coupon) => {
                  const isApplied = appliedCoupon?.code === coupon.code;
                  const discountText = coupon.discountType === 'PERCENTAGE' 
                    ? `${coupon.discountValue}% OFF`
                    : `₹${coupon.discountValue} OFF`;
                  
                  const maxDiscountText = coupon.maxDiscount 
                    ? `Up to ₹${coupon.maxDiscount}`
                    : 'No limit';
                  
                  const validUntil = new Date(coupon.validUntil).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  });

                  return (
                    <div
                      key={coupon.id}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                        isApplied
                          ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className={`px-3 py-1 rounded-full ${
                              coupon.discountType === 'PERCENTAGE'
                                ? 'bg-gradient-to-r from-orange-500 to-red-500'
                                : 'bg-gradient-to-r from-green-500 to-emerald-500'
                            }`}>
                              <span className="text-white text-sm font-semibold">
                                {discountText}
                              </span>
                            </div>
                            {isApplied && (
                              <div className="px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                              </div>
                            )}
                          </div>
                          
                          <div className="mb-3">
                            <div className="flex items-center space-x-2 mb-1">
                              <div className={`px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center space-x-2`}>
                                <code className="font-mono font-bold text-gray-900 dark:text-white">
                                  {coupon.code}
                                </code>
                                <button
                                  onClick={() => copyCouponCode(coupon.code)}
                                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                >
                                  <Copy className={`w-4 h-4 ${
                                    copiedCoupon === coupon.code 
                                      ? 'text-purple-500' 
                                      : 'text-gray-500'
                                  }`} />
                                </button>
                              </div>
                            </div>
                            
                            {coupon.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {coupon.description}
                              </p>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center space-x-1">
                              <Tag className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600 dark:text-gray-400">
                                Min. order: ₹{coupon.minOrderAmount}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <BadgePercent className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600 dark:text-gray-400">
                                {maxDiscountText}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600 dark:text-gray-400">
                                Valid until: {validUntil}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600 dark:text-gray-400">
                                Used: {coupon.usedCount}/{coupon.usageLimit}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="ml-4">
                          {isApplied ? (
                            <button
                              onClick={handleRemoveCoupon}
                              className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-800/40 transition-colors font-medium"
                            >
                              Remove
                            </button>
                          ) : (
                            <button
                              onClick={() => applyCouponFromList(coupon)}
                              disabled={couponLoading}
                              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all font-medium disabled:opacity-50"
                            >
                              {couponLoading ? 'Applying...' : 'Apply'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  💡 Coupons are automatically validated when applied
                </p>
              </div>
              <button
                onClick={() => setShowCouponModal(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-500" />
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Helper function to render form field with error
  const renderFormField = (field, label, icon, type = "text", placeholder = "") => {
    const hasError = formErrors[field] && touchedFields[field];
    
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
          {icon}
          {label}
        </label>
        <input
          type={type}
          name={field}
          value={orderData[field]}
          onChange={(e) => handleInputChange(field, e.target.value)}
          onBlur={() => handleFieldBlur(field)}
          className={`w-full px-4 py-3 rounded-xl border ${hasError ? errorBorder : borderColor} ${inputBg} ${textPrimary} focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
          placeholder={placeholder}
        />
        {hasError && (
          <div className="mt-2 flex items-center space-x-1">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <p className={`text-sm ${errorColor}`}>{formErrors[field]}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${bgPrimary} transition-colors duration-300`}>
      {/* Coupon Modal */}
      {showCouponModal && <CouponModal />}

      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4 shadow-lg">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Complete Your Purchase
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Final step to get your favorite products delivered
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Checkout Steps */}
          <div className="lg:col-span-2 space-y-8">
            {/* Error Alert if any form errors exist */}
            {Object.keys(formErrors).length > 0 && (
              <div className={`p-4 rounded-xl border ${errorBorder} bg-red-50/50 dark:bg-red-900/20 backdrop-blur-lg`}>
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                  <div>
                    <h3 className="font-bold text-red-700 dark:text-red-300">Please fix the following errors:</h3>
                    <ul className="mt-2 text-sm text-red-600 dark:text-red-400 list-disc list-inside">
                      {Object.values(formErrors).map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Progress Indicators */}
            <div className="mb-8 px-2 sm:px-4">
              <div className="relative">
                {/* Progress Line Background */}
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 z-0"></div>
                
                {/* Progress Line Fill */}
                <div className="absolute top-5 left-0 h-0.5 bg-green-500 z-0" style={{ width: '50%' }}></div>
                
                <div className="relative flex justify-between items-center z-10">
                  {['Cart', 'Details', 'Payment', 'Confirm'].map((step, index) => (
                    <div key={step} className="flex flex-col items-center">
                      {/* Step Circle */}
                      <div className={`
                        w-10 h-10 sm:w-12 sm:h-12
                        rounded-full flex items-center justify-center border-2 
                        transition-all duration-300 mb-2
                        ${index <= 1 
                          ? index === 1 
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-transparent text-white shadow-lg' 
                            : 'bg-green-500 border-transparent text-white'
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-400'
                        }
                      `}>
                        {index < 1 ? (
                          <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                        ) : (
                          <span className="text-base sm:text-lg font-medium">{index + 1}</span>
                        )}
                      </div>
                      
                      {/* Step Label */}
                      <span className={`
                        text-xs sm:text-sm font-medium text-center px-1
                        ${index <= 1 
                          ? 'text-gray-900 dark:text-white font-semibold' 
                          : 'text-gray-500'
                        }
                      `}>
                        {step}
                      </span>
                      
                      {/* Mobile Step Indicator (optional dots) */}
                      {index < 3 && (
                        <div className="sm:hidden mt-2">
                          <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Coupon Section */}
            <div className={`${cardBg} rounded-2xl border ${borderColor} shadow-xl overflow-hidden backdrop-blur-lg`}>
              <div className="p-6 border-b ${borderColor}">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-400 rounded-xl flex items-center justify-center shadow-lg">
                      <Ticket className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Apply Coupon</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Save more with available coupons
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setShowAvailableCoupons(!showAvailableCoupons)}
                    className="flex items-center space-x-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                  >
                    <span className="font-medium">
                      {showAvailableCoupons ? 'Hide' : 'Show'} All Coupons
                    </span>
                    {showAvailableCoupons ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {/* Coupon Input Field */}
                <div className="mb-6">
                  <div className="flex space-x-3">
                    <div className="flex-1">
                      <div className="relative">
                        <Tag className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="Enter coupon code"
                          className={`w-full pl-12 pr-4 py-3 rounded-xl border ${borderColor} ${inputBg} ${textPrimary} focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all`}
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {couponLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        'Apply'
                      )}
                    </button>
                  </div>
                  
                  {/* Applied Coupon Display */}
                  {appliedCoupon && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-gray-900 dark:text-white">
                                {appliedCoupon.code}
                              </span>
                              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs font-medium">
                                {appliedCoupon.discountType === 'PERCENTAGE' 
                                  ? `${appliedCoupon.discountValue}% OFF`
                                  : `₹${appliedCoupon.discountValue} OFF`
                                }
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              You saved ₹{totals.couponDiscount.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleRemoveCoupon}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5 text-red-500" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Available Coupons List */}
                {showAvailableCoupons && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        Available Coupons ({availableCoupons.length})
                      </h3>
                      <button
                        onClick={() => setShowCouponModal(true)}
                        className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors font-medium"
                      >
                        View all details
                      </button>
                    </div>
                    
                    {couponsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                      </div>
                    ) : availableCoupons.length === 0 ? (
                      <div className="text-center py-6">
                        <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 dark:text-gray-400">
                          No coupons available for your cart value
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {availableCoupons.slice(0, 4).map((coupon) => {
                          const isApplied = appliedCoupon?.code === coupon.code;
                          const discountText = coupon.discountType === 'PERCENTAGE' 
                            ? `${coupon.discountValue}%`
                            : `₹${coupon.discountValue}`;
                          
                          return (
                            <div
                              key={coupon.id}
                              className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                                isApplied
                                  ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-900/20'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                              }`}
                              onClick={() => !isApplied && applyCouponFromList(coupon)}
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="flex items-center space-x-2 mb-2">
                                    <div className={`px-2 py-1 rounded ${
                                      coupon.discountType === 'PERCENTAGE'
                                        ? 'bg-orange-100 dark:bg-orange-900/30'
                                        : 'bg-green-100 dark:bg-green-900/30'
                                    }`}>
                                      <span className={`text-sm font-bold ${
                                        coupon.discountType === 'PERCENTAGE'
                                          ? 'text-orange-700 dark:text-orange-300'
                                          : 'text-green-700 dark:text-green-300'
                                      }`}>
                                        {discountText} OFF
                                      </span>
                                    </div>
                                    {isApplied && (
                                      <CheckCircle className="w-4 h-4 text-green-500" />
                                    )}
                                  </div>
                                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                                    {coupon.code}
                                  </h4>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    Min. order: ₹{coupon.minOrderAmount}
                                  </p>
                                </div>
                                {!isApplied && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copyCouponCode(coupon.code);
                                    }}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                  >
                                    <Copy className="w-4 h-4 text-gray-500" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        
                        {availableCoupons.length > 4 && (
                          <div 
                            className="md:col-span-2 p-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 text-center cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                            onClick={() => setShowCouponModal(true)}
                          >
                            <p className="text-gray-600 dark:text-gray-400">
                              + {availableCoupons.length - 4} more coupons available
                            </p>
                            <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                              View all coupons
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Address Card */}
            <div className={`${cardBg} rounded-2xl border ${borderColor} shadow-xl overflow-hidden backdrop-blur-lg`}>
              <div className="p-6 border-b ${borderColor}">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Delivery Address</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Where should we deliver your order?</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {renderFormField("name", "Full Name", <User className="w-4 h-4 mr-2" />, "text", "John Doe")}
                  
                  {renderFormField("email", "Email Address", <Mail className="w-4 h-4 mr-2" />, "email", "john@example.com")}
                  
                  {renderFormField("phone", "Phone Number", <PhoneIcon className="w-4 h-4 mr-2" />, "tel", "9876543210")}
                  
                  {renderFormField("pincode", "Pincode", <Navigation className="w-4 h-4 mr-2" />, "text", "560001")}
                  
                  {renderFormField("city", "City", <Home className="w-4 h-4 mr-2" />, "text", "e.g., Mumbai")}
                  
                  {renderFormField("state", "State", <MapPin className="w-4 h-4 mr-2" />, "text", "e.g., Maharashtra")}
                  
                  {/* Address field */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                      <Home className="w-4 h-4 mr-2" />
                      Complete Address
                    </label>
                    <textarea
                      name="address"
                      value={orderData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      onBlur={() => handleFieldBlur("address")}
                      rows="3"
                      className={`w-full px-4 py-3 rounded-xl border ${formErrors.address && touchedFields.address ? errorBorder : borderColor} ${inputBg} ${textPrimary} focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none`}
                      placeholder="Street, apartment, landmark..."
                    />
                    {formErrors.address && touchedFields.address && (
                      <div className="mt-2 flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <p className={`text-sm ${errorColor}`}>{formErrors.address}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className={`${cardBg} rounded-2xl border ${borderColor} shadow-xl overflow-hidden backdrop-blur-lg`}>
              <div className="p-6 border-b ${borderColor}">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Payment Method</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Choose how you want to pay</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Online Payment */}
                  <button
                    onClick={() => setOrderData({...orderData, paymentMethod: "ONLINE"})}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.02] ${
                      orderData.paymentMethod === "ONLINE"
                        ? "border-purple-500 bg-purple-50/50 dark:bg-purple-900/20 shadow-lg"
                        : "border-gray-200 dark:border-gray-700 hover:border-purple-300"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        orderData.paymentMethod === "ONLINE" 
                          ? "bg-gradient-to-r from-purple-500 to-pink-500" 
                          : "bg-gray-100 dark:bg-gray-700"
                      }`}>
                        <CardIcon className={`w-5 h-5 ${
                          orderData.paymentMethod === "ONLINE" 
                            ? "text-white" 
                            : "text-gray-600 dark:text-gray-400"
                        }`} />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Card / UPI / Wallet</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Pay securely online</p>
                      </div>
                      {orderData.paymentMethod === "ONLINE" && (
                        <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                      )}
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Security Badge */}
            <div className={`${cardBg} rounded-2xl border ${borderColor} shadow-xl p-6 backdrop-blur-lg`}>
              <div className="flex items-center justify-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Secure Checkout</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    🔒 256-bit SSL encryption • 💳 Safe payment processing
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className={`${cardBg} rounded-2xl border ${borderColor} shadow-2xl sticky top-8 overflow-hidden backdrop-blur-lg`}>
              {/* Order Summary Header */}
              <div className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b ${borderColor}">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Order Summary</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">{cartItems.length} items</p>
              </div>

              {/* Items List */}
              <div className="p-6 max-h-80 overflow-y-auto space-y-4">
                {cartItems.map((item) => {
                  const itemTotal = calculateItemTotal(item);
                  const productImage = getProductImage(item);
                  
                  return (
                    <div key={item.id} className="flex items-center space-x-3">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={productImage}
                          alt={item.product?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1">
                          {item.product?.name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {item.variant?.size} • Qty: {item.quantity}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            ₹{itemTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Details */}
              <div className="p-6 border-t ${borderColor}">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="font-medium text-gray-900 dark:text-white">₹{totals.subtotal.toFixed(2)}</span>
                  </div>
                  
                  {totals.quantityDiscount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-green-600 dark:text-green-400">Quantity Discount</span>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        -₹{totals.quantityDiscount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  {totals.couponDiscount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-purple-600 dark:text-purple-400">Coupon Discount</span>
                      <span className="font-medium text-purple-600 dark:text-purple-400">
                        -₹{totals.couponDiscount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                    <span className="font-medium text-green-600 dark:text-green-400">FREE</span>
                  </div>

                  {/* Delivery Estimate */}
                  <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-blue-600 dark:text-blue-400">
                        Estimated delivery: {deliveryEstimate}
                      </span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">Total Amount</span>
                      <div className="text-right">
                        <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          ₹{totals.totalAmount.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {orderData.paymentMethod === "COD" ? "Pay on delivery" : "Pay now"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Place Order Button */}
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading || paymentProcessing || calculatingDiscounts || Object.keys(formErrors).length > 0}
                    className={`
                      w-full py-4 mt-6 rounded-xl font-bold text-lg
                      transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl
                      relative overflow-hidden group
                      ${orderData.paymentMethod === "ONLINE" 
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" 
                        : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      }
                      text-white shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100
                    `}
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    
                    {paymentProcessing ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Processing Payment...
                      </div>
                    ) : loading || calculatingDiscounts ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        {calculatingDiscounts ? 'Calculating...' : 'Processing...'}
                      </div>
                    ) : Object.keys(formErrors).length > 0 ? (
                      "Fix errors to continue"
                    ) : orderData.paymentMethod === "COD" ? (
                      <>
                        <span>Place Order (COD)</span>
                        <Truck className="w-5 h-5 ml-2 inline" />
                      </>
                    ) : (
                      <>
                        <span>Pay ₹{totals.totalAmount.toFixed(0)}</span>
                        <Zap className="w-5 h-5 ml-2 inline" />
                      </>
                    )}
                  </button>

                  {/* Security Assurance */}
                  <div className="mt-4 text-center">
                    <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                      <Lock className="w-3 h-3" />
                      <span>256-bit SSL secured</span>
                      <div className="w-1 h-1 bg-gray-300 rounded-full" />
                      <Shield className="w-3 h-3" />
                      <span>Payment protected</span>
                    </div>
                  </div>

                  {/* Need Help */}
                  <div className="mt-4 p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-lg text-center">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Need help? Call us at{" "}
                      <a href="tel:+919940334421" className="text-purple-600 dark:text-purple-400 font-semibold hover:underline">
                        +91 99403 34421
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Cart */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/cart")}
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;