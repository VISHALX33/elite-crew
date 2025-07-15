import { useEffect, useState } from 'react';
import api from '../utils/api';

export default function PurchaseHistory() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchPurchases() {
      try {
        setLoading(true);
        const res = await api.get('/purchases/my-purchases', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setPurchases(res.data);
      } catch (err) {
        setError('Failed to load purchases');
      } finally {
        setLoading(false);
      }
    }
    fetchPurchases();
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Product Purchases</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : purchases.length === 0 ? (
        <div className="text-gray-500">No purchases found.</div>
      ) : (
        <div className="space-y-4">
          {purchases.map(p => (
            <div key={p._id} className="bg-white rounded shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <img src={p.product?.image || 'https://via.placeholder.com/60x60?text=Product'} alt={p.product?.title} className="w-16 h-16 object-cover rounded" />
                <div>
                  <div className="font-semibold text-lg">{p.product?.title}</div>
                  <div className="text-gray-500 text-sm">{p.date}</div>
                  <div className="text-gray-500 text-sm">{p.address}, {p.pincode}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-blue-700">₹{p.totalAmount}</div>
                <div className="text-xs text-gray-400">{p.status}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
