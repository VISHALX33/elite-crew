import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

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
        const res = await api.get('/purchases/my-purchases', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
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
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(p => p.status.toLowerCase() === statusFilter.toLowerCase());
    }
    
    // Apply time filter
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
    const statusMap = {
      'completed': 'bg-green-100 text-green-800',
      'shipped': 'bg-blue-100 text-blue-800',
      'processing': 'bg-orange-100 text-orange-800',
      'cancelled': 'bg-red-100 text-red-800',
      'delivered': 'bg-purple-100 text-purple-800'
    };
    return statusMap[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-orange-600 mb-2">Purchase History</h1>
        <p className="text-gray-600">View all your past product purchases</p>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Order Status
            </label>
            <select
              id="status-filter"
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="shipped">Shipped</option>
              <option value="processing">Processing</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Time Filter */}
          <div>
            <label htmlFor="time-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Time Period
            </label>
            <select
              id="time-filter"
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="last30">Last 30 Days</option>
              <option value="last90">Last 90 Days</option>
            </select>
          </div>

          {/* Results Count */}
          <div className="flex items-end justify-end">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold text-orange-600">{filteredPurchases.length}</span> purchase(s)
            </p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredPurchases.length === 0 && (
        <div className="bg-orange-50 border-l-4 border-orange-500 text-orange-700 p-4 mb-6 rounded-lg">
          <div className="flex flex-col items-center justify-center py-12">
            <svg className="h-16 w-16 text-orange-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium mb-2">No purchases found</h3>
            <p className="text-gray-600 text-center max-w-md">
              {statusFilter !== 'all' || timeFilter !== 'all'
                ? `You don't have any purchases matching your filters`
                : "You haven't made any purchases yet"}
            </p>
            <button
              onClick={() => navigate('/products')}
              className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition"
            >
              Browse Products
            </button>
          </div>
        </div>
      )}

      {/* Purchases List */}
      {!loading && !error && filteredPurchases.length > 0 && (
        <div className="space-y-4">
          {filteredPurchases.map(purchase => (
            <div key={purchase._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="p-6 flex flex-col md:flex-row gap-6">
                {/* Product Image */}
                <div className="flex-shrink-0">
                  <img 
                    src={purchase.product?.image || 'https://via.placeholder.com/120x120?text=Product'} 
                    alt={purchase.product?.title} 
                    className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                  />
                </div>
                
                {/* Purchase Details */}
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <h3 className="text-xl font-semibold text-gray-800">{purchase.product?.title}</h3>
                    <div className="text-lg font-bold text-green-600">₹{purchase.totalAmount}</div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Purchased on {formatDate(purchase.date)}</span>
                      </div>
                      
                      <div className="flex items-start gap-2 text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>
                          {purchase.address}, {purchase.pincode}
                          {purchase.landmark && ` (${purchase.landmark})`}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(purchase.status)}`}>
                          {purchase.status}
                        </span>
                      </div>
                      
                      <div className="mt-2 flex gap-2">
                        <button 
                          onClick={() => navigate(`/purchases/${purchase._id}`)}
                          className="text-sm text-orange-600 hover:text-orange-800 font-medium"
                        >
                          View Details
                        </button>
                        {['processing', 'shipped'].includes(purchase.status.toLowerCase()) && (
                          <button className="text-sm text-red-600 hover:text-red-800 font-medium">
                            Cancel Order
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Purchase Footer */}
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div>
                    Order ID: <span className="font-mono">{purchase._id}</span>
                  </div>
                  <div>
                    {purchase.deliveryDate && `Expected delivery: ${formatDate(purchase.deliveryDate)}`}
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