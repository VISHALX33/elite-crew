import React, { useState } from 'react';
import { XMarkIcon, CreditCardIcon, SparklesIcon } from '@heroicons/react/24/outline';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const WalletModal = ({ isOpen, onClose }) => {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const amounts = [100, 200, 500, 1000, 2000, 5000];

  const handleTopUp = async (amount) => {
    setLoading(true);
    setError('');
    try {
      // 1. Create Razorpay order
      const orderRes = await api.post('/purchases/razorpay/order', { amount });
      const order = orderRes.data;

      // 2. Load script if needed
      if (!window.Razorpay) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = resolve;
          document.body.appendChild(script);
        });
      }

      // 3. Open Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'QuickHaat Wallet',
        description: `Top up ₹${amount} in your wallet`,
        order_id: order.id,
        handler: async (response) => {
          try {
            await api.post('/purchases/razorpay/verify-topup', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: amount
            });
            await refreshUser();
            onClose();
          } catch (err) {
            setError('Payment verification failed');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: { color: '#EA580C' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-fade-in-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-8 text-white">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
          <div className="flex items-center space-x-3 mb-2">
            <SparklesIcon className="h-8 w-8 text-orange-200" />
            <h2 className="text-2xl font-bold">QuickHaat Wallet</h2>
          </div>
          <p className="text-orange-100 opacity-90">Instant Top-up via Razorpay</p>
          
          <div className="mt-8 bg-white bg-opacity-20 backdrop-blur-md rounded-2xl p-4 flex justify-between items-center border border-white border-opacity-30">
            <div>
              <p className="text-xs uppercase tracking-wider text-orange-100 font-medium">Available Balance</p>
              <p className="text-3xl font-bold">₹{user?.wallet?.toLocaleString('en-IN')}</p>
            </div>
            <CreditCardIcon className="h-10 w-10 text-orange-200" />
          </div>
        </div>

        {/* Amount Selection */}
        <div className="p-8">
          <h3 className="text-gray-900 font-semibold mb-4 text-center">Select Amount to Add</h3>
          
          {error && (
            <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium border border-red-100 flex items-center">
              <span className="mr-2">⚠️</span> {error}
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            {amounts.map((amount) => (
              <button
                key={amount}
                disabled={loading}
                onClick={() => handleTopUp(amount)}
                className="group relative overflow-hidden bg-gray-50 hover:bg-orange-50 border-2 border-gray-100 hover:border-orange-500 p-4 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 active:scale-95 disabled:opacity-50"
              >
                <span className="block text-lg font-bold text-gray-800 group-hover:text-orange-600">₹{amount}</span>
                <span className="text-[10px] text-gray-500 group-hover:text-orange-400 font-medium">+ Add</span>
              </button>
            ))}
          </div>

          <p className="mt-6 text-center text-xs text-gray-500 leading-relaxed">
            By proceeding, you agree to our terms of service. Payments are processed securely via Razorpay.
          </p>
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-80 flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600"></div>
            <p className="text-orange-600 font-bold animate-pulse text-sm">Initializing Secure Payment...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletModal;
