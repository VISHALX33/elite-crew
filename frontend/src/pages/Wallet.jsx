import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import WalletModal from '../components/WalletModal';

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
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 bg-gradient-to-r from-orange-50 to-orange-100 p-8 rounded-3xl border border-orange-200">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-1">My Wallet</h1>
          <p className="text-orange-700 font-medium">Manage your balance and transactions</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs uppercase tracking-widest text-orange-600 font-bold mb-1">Current Balance</p>
            <p className="text-4xl font-black text-gray-900">₹{user?.wallet?.toLocaleString('en-IN')}</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-orange-200 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <span className="text-2xl">+</span> Add Money
          </button>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <span className="w-2 h-8 bg-orange-500 rounded-full"></span>
        Recent Transactions
      </h2>

      <WalletModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-600">{error}</div>
      ) : transactions.length === 0 ? (
        <div className="text-center text-gray-500">No transactions found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow-lg">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Type</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Amount</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Balance After</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Description</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(tx => (
                <tr key={tx._id} className="border-b last:border-none">
                  <td className="px-4 py-2 text-gray-600">{new Date(tx.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold 
                      ${tx.type === 'topup' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}</span>
                  </td>
                  <td className={`px-4 py-2 font-mono ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>{tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-2 text-gray-700 font-mono">₹{tx.balanceAfter.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-2 text-gray-500">{tx.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
