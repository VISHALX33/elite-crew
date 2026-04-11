import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import WalletModal from '../components/WalletModal';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  WalletIcon, 
  ClockIcon, 
  CreditCardIcon,
  InformationCircleIcon 
} from '@heroicons/react/24/outline';

export default function Wallet() {
  const { user, token } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    api.get('/wallet/transactions', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setTransactions(res.data))
      .catch(() => setError('Failed to load transactions'))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Premium Header Card */}
      <div className="relative overflow-hidden mb-12 rounded-[2rem] bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900 p-8 md:p-12 shadow-2xl">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-orange-500 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-white rounded-full opacity-5 blur-3xl"></div>
        
        <div className="relative flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <div className="bg-orange-600 p-2 rounded-xl shadow-lg ring-4 ring-orange-500/20">
                <WalletIcon className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Main Wallet</h1>
            </div>
            <p className="text-gray-400 text-sm font-medium mb-1 uppercase tracking-widest">Available Balance</p>
            <div className="flex items-baseline justify-center md:justify-start gap-2">
              <span className="text-orange-500 text-3xl font-bold">₹</span>
              <span className="text-5xl md:text-6xl font-black text-white tracking-tighter">
                {(user?.wallet || 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="group relative px-10 py-5 bg-white text-gray-900 rounded-2xl font-extrabold shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:shadow-orange-500/10"
          >
            <div className="absolute inset-0 bg-orange-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-1.5 rounded-lg">
                <span className="text-orange-600 text-xl font-black">+</span>
              </div>
              <span>Add Funds</span>
            </div>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
          <div className="h-8 w-1.5 bg-orange-600 rounded-full"></div>
          Transaction History
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
          <ClockIcon className="h-4 w-4" />
          Real-time updates
        </div>
      </div>

      <WalletModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      
      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : error ? (
        <div className="p-8 bg-red-50 rounded-3xl border border-red-100 text-center">
          <div className="bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
            <InformationCircleIcon className="h-6 w-6 text-red-600" />
          </div>
          <p className="text-red-600 font-bold">{error}</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="p-16 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200 text-center">
          <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCardIcon className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-900 font-bold text-lg mb-2">No transactions yet</p>
          <p className="text-gray-500 max-w-xs mx-auto">Your card spending and top-ups will appear here once you start using your wallet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {transactions.map(tx => (
            <div 
              key={tx._id} 
              className="group bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-orange-100 transition-all duration-300"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-5">
                  <div className={`
                    w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110
                    ${tx.type === 'topup' 
                      ? 'bg-green-50 text-green-600 shadow-green-100' 
                      : 'bg-orange-50 text-orange-600 shadow-orange-100'}
                  `}>
                    {tx.type === 'topup' ? (
                      <ArrowUpIcon className="h-6 w-6" />
                    ) : (
                      <ArrowDownIcon className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 leading-tight mb-1">{tx.description || (tx.type === 'topup' ? 'Wallet Recharge' : 'Purchase')}</h3>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                      {new Date(tx.createdAt).toLocaleDateString(undefined, { 
                        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xl font-black mb-1 ${tx.amount > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount).toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 py-0.5 bg-gray-50 rounded-full inline-block">
                    Balance: ₹{tx.balanceAfter.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
