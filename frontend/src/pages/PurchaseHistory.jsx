import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBagIcon, 
  MapPinIcon, 
  CalendarIcon, 
  BuildingOfficeIcon,
  ChevronRightIcon,
  ArrowRightIcon,
  TruckIcon
} from '@heroicons/react/24/outline';

export default function PurchaseHistory() {
  const [purchases, setPurchases] = useState([]);
  const [filteredPurchases, setFilteredPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchPurchases() {
      try {
        setLoading(true);
        const res = await api.get('/purchases/my-purchases');
        setPurchases(res.data);
        setFilteredPurchases(res.data);
      } catch (err) {
        setError('Failed to load purchases');
      } finally {
        setLoading(false);
      }
    }
    fetchPurchases();
  }, []);

  useEffect(() => {
    let result = [...purchases];
    if (statusFilter !== 'all') {
      result = result.filter(p => p.status.toLowerCase() === statusFilter.toLowerCase());
    }
    const now = new Date();
    if (timeFilter === 'last30') {
      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
      result = result.filter(p => new Date(p.date) > thirtyDaysAgo);
    } else if (timeFilter === 'last90') {
      const ninetyDaysAgo = new Date(now.setDate(now.getDate() - 90));
      result = result.filter(p => new Date(p.date) > ninetyDaysAgo);
    }
    setFilteredPurchases(result);
  }, [purchases, statusFilter, timeFilter]);

  const getStatusBadge = (status) => {
    const s = status.toLowerCase();
    if (s === 'delivered' || s === 'completed') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    if (s === 'shipped') return 'bg-blue-50 text-blue-700 border-blue-100';
    if (s === 'processing') return 'bg-amber-50 text-amber-700 border-amber-100';
    if (s === 'cancelled') return 'bg-rose-50 text-rose-700 border-rose-100';
    return 'bg-gray-50 text-gray-700 border-gray-100';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Purchase History</h1>
          <p className="text-gray-500 font-medium">Track your orders and manage returns</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
          {['all', 'processing', 'shipped', 'delivered'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                statusFilter === status 
                ? 'bg-orange-600 text-white shadow-md shadow-orange-100' 
                : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-2xl">
          {error}
        </div>
      ) : filteredPurchases.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-16 text-center">
          <div className="h-20 w-20 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 mx-auto mb-6">
            <ShoppingBagIcon className="h-10 w-10" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-500 mb-8 max-w-xs mx-auto font-medium">
            You haven't purchased any items yet. Start shopping our premium collection!
          </p>
          <button 
            onClick={() => navigate('/products')}
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-xl shadow-gray-200"
          >
            Start Shopping <ArrowRightIcon className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredPurchases.map(purchase => (
            <div key={purchase._id} className="group bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-500 overflow-hidden">
              <div className="p-6 md:p-8">
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Product Image */}
                  <div className="relative flex-shrink-0">
                    <img 
                      src={purchase.product?.image || 'https://via.placeholder.com/400x300?text=Product'} 
                      alt={purchase.product?.title} 
                      className="w-full lg:w-48 h-48 lg:h-48 object-cover rounded-3xl shadow-sm group-hover:scale-[1.02] transition-transform duration-500"
                    />
                    <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border backdrop-blur-md shadow-sm ${getStatusBadge(purchase.status)}`}>
                      {purchase.status}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-2xl font-black text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">
                          {purchase.product?.title}
                        </h3>
                        {purchase.product?.vendor && (
                          <button 
                            onClick={() => navigate(`/vendor/${purchase.product.vendor._id}`)}
                            className="flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:underline decoration-2 underline-offset-4"
                          >
                            <BuildingOfficeIcon className="h-4 w-4" />
                            {purchase.product.vendor.companyName}
                          </button>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-black text-gray-900">₹{purchase.totalAmount}</div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1 italic">Inc. All Taxes</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50/50 p-6 rounded-3xl border border-gray-50 mt-auto">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-gray-600">
                          <CalendarIcon className="h-5 w-5 text-gray-400" />
                          <span className="text-sm font-bold">Ordered on {formatDate(purchase.date)}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                          <TruckIcon className="h-5 w-5 text-gray-400" />
                          <span className="text-sm font-bold text-emerald-600">
                            {purchase.deliveryDate ? `Expected by ${formatDate(purchase.deliveryDate)}` : 'Standard Delivery'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 text-gray-600 border-l border-gray-200 sm:pl-6">
                        <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div className="text-sm font-bold leading-relaxed">
                          {purchase.address}
                          <div className="text-gray-400 font-medium">Zip: {purchase.pincode}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="lg:w-48 flex flex-col gap-3 justify-center border-t lg:border-t-0 lg:border-l border-gray-100 pt-6 lg:pt-0 lg:pl-8">
                    <button 
                      onClick={() => navigate(`/products/${purchase.product?._id}`)}
                      className="w-full bg-gray-900 text-white px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-lg shadow-gray-100"
                    >
                      Refined View <ChevronRightIcon className="h-4 w-4" />
                    </button>
                    {['processing', 'pending'].includes(purchase.status.toLowerCase()) && (
                      <button className="w-full bg-white text-rose-600 border border-rose-100 px-6 py-4 rounded-2xl font-bold hover:bg-rose-50 transition-all">
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50/30 px-8 py-4 border-t border-gray-50 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                  <span className="uppercase tracking-widest">Order ID:</span>
                  <span className="text-gray-900 font-mono">{purchase._id}</span>
                </div>
                <div className="flex items-center gap-4">
                   <span className="text-xs font-bold text-gray-400">Invoice Available</span>
                   <div className="h-4 w-[1px] bg-gray-200" />
                   <span className="text-xs font-extrabold text-orange-600 uppercase cursor-pointer hover:underline">Download</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}