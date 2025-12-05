import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearCart } from '../../redux/slices/cartSlice';
import { useInitiatePaymentMutation, useVerifyPaymentMutation } from '../../redux/services/orderService';
import { toast } from 'react-hot-toast';
import { Lock } from 'lucide-react';

const RazorpayButton = ({
  orderData,
  amount,
  isProcessing,
  setIsProcessing,
  setOrderSuccess,
  setOrderNumber,
  disabled
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [initiatePayment] = useInitiatePaymentMutation();
  const [verifyPayment] = useVerifyPaymentMutation();

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      // Check if script is already loaded
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        console.log('Razorpay script loaded successfully');
        resolve(true);
      };
      script.onerror = () => {
        console.error('Failed to load Razorpay script');
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (disabled || isProcessing) return;
    
    setIsProcessing(true);

    try {
      // Validate order data
      if (!orderData || !orderData.orderItems || orderData.orderItems.length === 0) {
        toast.error('No items in cart');
        setIsProcessing(false);
        return;
      }

      // Load Razorpay script
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        toast.error('Failed to load payment gateway');
        setIsProcessing(false);
        return;
      }

      // Ensure amount is valid
      const paymentAmount = Math.max(1, Math.round(amount * 100)); // Convert to paise, minimum 1 rupee
      
      console.log('Initiating payment with:', {
        amount: paymentAmount,
        orderItems: orderData.orderItems,
        itemCount: orderData.orderItems.length
      });

      // Initiate payment with backend
      const result = await initiatePayment({ 
        orderData: {
          ...orderData,
          orderItems: orderData.orderItems // Already transformed in parent
        }
      }).unwrap();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to initiate payment');
      }

      const { razorpayOrder, tempOrderData } = result.data;
      
      // Ensure Razorpay key is available
      const razorpayKey = import.meta.env.VITE_APP_RAZORPAY_KEY_ID || process.env.REACT_APP_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        toast.error('Payment gateway configuration error');
        setIsProcessing(false);
        return;
      }

      const options = {
        key: razorpayKey,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency || 'INR',
        name: 'zohra',
        description: 'Order Payment',
        order_id: razorpayOrder.id,
        handler: async (response) => {
          try {
            console.log('Payment successful, verifying:', response);
            
            // Verify payment with backend
            const verifyResult = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderData: tempOrderData
            }).unwrap();

            if (verifyResult.success) {
              // Clear cart and show success
              dispatch(clearCart());
              setOrderNumber(verifyResult.data.orderNumber);
              setOrderSuccess(true);
              toast.success('Payment successful! Order confirmed.');
              navigate('/checkout/success');
            } else {
              toast.error(verifyResult.message || 'Payment verification failed');
            }
          } catch (verifyError) {
            console.error('Verification error:', verifyError);
            toast.error('Payment verification error. Please contact support.');
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: orderData.name,
          email: orderData.email,
          contact: orderData.phone
        },
        notes: {
          address: orderData.address,
          orderData: JSON.stringify(tempOrderData)
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            toast.info('Payment cancelled');
          },
          escape: false, // Prevent closing with ESC key
          animation: true
        }
      };

      console.log('Opening Razorpay checkout with options:', options);
      
      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
      // Handle errors
      razorpay.on('payment.failed', (response) => {
        console.error('Payment failed:', response.error);
        toast.error(`Payment failed: ${response.error.description || 'Unknown error'}`);
        setIsProcessing(false);
      });
      
    } catch (error) {
      console.error('Payment initiation error:', error);
      
      let errorMessage = 'Payment failed. Please try again.';
      if (error.data?.message) {
        errorMessage = error.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      setIsProcessing(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handlePayment}
      disabled={disabled || isProcessing}
      className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl shadow-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
    >
      {isProcessing ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
          Processing Payment...
        </>
      ) : (
        <>
          <Lock className="w-5 h-5 mr-3" />
          Pay Now • ₹{amount.toFixed(2)}
        </>
      )}
    </button>
  );
};

export default RazorpayButton;