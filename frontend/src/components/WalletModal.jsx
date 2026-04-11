import React, { useState } from 'react';
import { XMarkIcon, CreditCardIcon, SparklesIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const WalletModal = ({ isOpen, onClose }) => {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const amounts = [100, 200, 500, 1000, 2000, 5000];

  const handleTopUp = async (amount) => {
    setLoading(true);
    setError('');
    try {
      const orderRes = await api.post('/purchases/razorpay/order', { amount });
      const order = orderRes.data;

      if (!window.Razorpay) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = resolve;
          document.body.appendChild(script);
        });
      }

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
            setSuccess(true);
            setTimeout(() => {
              setSuccess(false);
              onClose();
            }, 2000);
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-md transition-all duration-500" 
        onClick={onClose}
      ></div>

      <div className="relative bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in duration-300">
        <div className="bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 p-8 md:p-10 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-white/80 hover:text-white hover:bg-white/10 rounded-full p-2 transition-all duration-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
          
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-xl border border-white/30">
              <SparklesIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">Top Up Wallet</h2>
              <p className="text-orange-100 text-sm font-medium">Fast, Secure, Reliable</p>
            </div>
          </div>
          
          <div className="bg-black/10 backdrop-blur-2xl rounded-3xl p-6 flex justify-between items-center border border-white/20 shadow-inner">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-orange-100 font-bold mb-1">Current Balance</p>
              <p className="text-3xl font-black">₹{user?.wallet?.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-white/10 p-4 rounded-2xl">
              <CreditCardIcon className="h-8 w-8 text-orange-100" />
            </div>
          </div>
        </div>

        <div className="p-8 md:p-10 space-y-8">
          <div>
            <h3 className="text-gray-900 font-black mb-6 text-center text-lg uppercase tracking-wider">Select Recharge Amount</h3>
            
            {error && (
              <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100 flex items-center gap-3 animate-head-shake">
                <InformationCircleIcon className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {amounts.map((amount) => (
                <button
                  key={amount}
                  disabled={loading || success}
                  onClick={() => handleTopUp(amount)}
                  className="group relative overflow-hidden bg-gray-50 hover:bg-white border-2 border-gray-100 hover:border-orange-500 p-5 rounded-[2rem] transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10 active:scale-95 disabled:opacity-50"
                >
                  <div className="absolute top-0 right-0 -tr-1 -tr-1 w-8 h-8 bg-orange-500 rounded-full opacity-0 group-hover:opacity-10 scale-0 group-hover:scale-150 transition-all duration-500"></div>
                  <span className="block text-xl font-black text-gray-900 group-hover:text-orange-600 transition-colors">₹{amount}</span>
                  <span className="text-[10px] text-gray-400 group-hover:text-orange-400 font-bold uppercase tracking-widest mt-1 block">+ Add</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-[0.1em] leading-relaxed">
              Payments secured via Razorpay <br /> 
              PCI DSS Compliant Infrastructure
            </p>
          </div>
        </div>

        {loading && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center space-y-4 animate-fade-in z-10">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-100 border-t-orange-600"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <CreditCardIcon className="h-6 w-6 text-orange-600 animate-pulse" />
              </div>
            </div>
            <p className="text-orange-600 font-black tracking-widest uppercase text-xs">Securing Connection...</p>
          </div>
        )}

        {success && (
          <div className="absolute inset-0 bg-white flex flex-col items-center justify-center space-y-6 animate-fade-in z-20">
            <div className="bg-green-50 p-6 rounded-full animate-bounce">
              <CheckCircleIcon className="h-20 w-20 text-green-500" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-black text-gray-900 mb-2">Payment Successful!</h2>
              <p className="text-gray-500 font-medium tracking-tight">Your wallet has been credited.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletModal;
