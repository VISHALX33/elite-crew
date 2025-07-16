import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext.jsx';
import StarRating from '../components/StarRating.jsx';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ 
    date: '', 
    address: '', 
    pincode: '', 
    details: '',
    landmark: ''
  });
  const [purchaseResult, setPurchaseResult] = useState(null);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const res = await api.get(`/products/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setProduct(res.data);
        // Set default date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setForm(f => ({ ...f, date: tomorrow.toISOString().split('T')[0] }));
      } catch (err) {
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  // Fetch reviews
  useEffect(() => {
    async function fetchReviews() {
      setReviewLoading(true);
      setReviewError('');
      try {
        const res = await api.get(`/products/${id}/reviews`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setReviews(res.data.reviews);
        setAverageRating(res.data.averageRating);
        setTotalReviews(res.data.totalReviews);
      } catch (err) {
        setReviewError('Failed to load reviews');
      } finally {
        setReviewLoading(false);
      }
    }
    fetchReviews();
  }, [id]);

  // Check if user already reviewed
  const hasReviewed = user && reviews.some(r => r.user._id === user._id);

  // Submit review
  const handleReviewSubmit = async e => {
    e.preventDefault();
    setSubmittingReview(true);
    setReviewError('');
    setReviewSuccess('');
    try {
      await api.post(`/products/${id}/reviews`, { rating: myRating, comment: myComment }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setReviewSuccess('Review submitted!');
      setMyRating(0);
      setMyComment('');
      // Refresh reviews
      const res = await api.get(`/products/${id}/reviews`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setReviews(res.data.reviews);
      setAverageRating(res.data.averageRating);
      setTotalReviews(res.data.totalReviews);
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const tds = product ? product.price * 0.10 : 0;
  const gst = product ? product.price * 0.18 : 0;
  const total = product ? Math.round(product.price + tds + gst) : 0;

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handlePurchase = async e => {
    e.preventDefault();
    setPurchaseResult(null);
    setPurchaseLoading(true);
    try {
      const res = await api.post('/purchases/buy', {
        productId: id,
        categoryId: product.category?._id,
        ...form,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      // Update wallet in AuthContext
      setUser({ ...user, wallet: res.data.wallet });
      setPurchaseResult({ success: true, ...res.data });
      setTimeout(() => {
        navigate('/purchase-success', { state: res.data });
      }, 1000);
    } catch (err) {
      setPurchaseResult({ 
        success: false, 
        message: err.response?.data?.message || 'Purchase failed. Please check your wallet balance and try again.' 
      });
    } finally {
      setPurchaseLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
    </div>
  );
  
  if (error) return (
    <div className="text-center py-10">
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 max-w-md mx-auto" role="alert">
        <p className="font-bold">Error</p>
        <p>{error}</p>
      </div>
    </div>
  );
  
  if (!product) return null;

  // Handle multiple images if available
  const images = product.images?.length > 0 ? product.images : [product.image || 'https://via.placeholder.com/600x600?text=Product'];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Product Header */}
      <div className="flex flex-col md:flex-row gap-8 mb-10">
        {/* Image Gallery */}
        <div className="w-full md:w-1/2">
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-4">
            <img
              src={images[currentImage]}
              alt={product.title}
              className="w-full h-96 object-contain p-4"
            />
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImage(idx)}
                  className={`rounded-md overflow-hidden border-2 ${currentImage === idx ? 'border-orange-500' : 'border-transparent'}`}
                >
                  <img 
                    src={img} 
                    alt={`${product.title} thumbnail ${idx + 1}`}
                    className="w-full h-20 object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="w-full md:w-1/2">
          <div className="mb-4">
            <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded">
              {product.category?.name || 'Product'}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.title}</h1>
          <div className="flex items-center gap-2 mb-4">
            <div className="text-2xl font-bold text-green-600">₹{product.price}</div>
            {product.originalPrice && (
              <div className="text-lg text-gray-500 line-through">₹{product.originalPrice}</div>
            )}
          </div>
          
          <div className="prose text-gray-700 mb-6">
            {product.description}
          </div>

          {/* Key Features */}
          {product.features?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Key Features</h3>
              <ul className="space-y-2">
                {product.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Pricing Breakdown */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Pricing Details</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Base Price:</span>
            <span className="font-medium">₹{product.price}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">TDS (10%):</span>
            <span className="font-medium">₹{tds.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">GST (18%):</span>
            <span className="font-medium">₹{gst.toFixed(2)}</span>
          </div>
          <div className="border-t border-gray-200 pt-3 flex justify-between">
            <span className="text-lg font-bold text-gray-800">Total Amount:</span>
            <span className="text-xl font-bold text-green-600">₹{total}</span>
          </div>
        </div>
      </div>

      {/* Purchase Form */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Purchase Information</h2>
        
        <form onSubmit={handlePurchase}>
          <div className="grid grid-cols-3 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Date
              </label>
              <input 
                type="date" 
                id="date"
                name="date" 
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                value={form.date} 
                onChange={handleChange} 
                min={new Date().toISOString().split('T')[0]}
                required 
              />
            </div>
            
            <div>
              <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">
                Pincode
              </label>
              <input 
                type="text" 
                id="pincode"
                name="pincode" 
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                value={form.pincode} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Full Address
              </label>
              <textarea 
                id="address"
                name="address" 
                rows="3"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                value={form.address} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="landmark" className="block text-sm font-medium text-gray-700 mb-1">
                Landmark (Optional)
              </label>
              <input 
                type="text" 
                id="landmark"
                name="landmark" 
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                value={form.landmark} 
                onChange={handleChange} 
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-1">
                Additional Instructions (Optional)
              </label>
              <textarea 
                id="details"
                name="details" 
                rows="2"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                value={form.details} 
                onChange={handleChange} 
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={purchaseLoading}
              className={`flex-1 bg-gradient-to-r from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700 text-white py-3 px-6 rounded-lg font-medium transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 ${purchaseLoading ? 'opacity-75' : ''}`}
            >
              {purchaseLoading ? (
                <div className="flex items-center justify-center">
                  <svg 
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                  >
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    ></circle>
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing Purchase...
                </div>
              ) : (
                `Pay ₹${total}`
              )}
            </button>
            
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-6 rounded-lg font-medium transition"
            >
              Back to Products
            </button>
          </div>
        </form>

        {/* Purchase Result Messages */}
        {purchaseResult && purchaseResult.success && (
          <div className="mt-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-green-700 font-medium">Purchase successful! Redirecting...</span>
            </div>
          </div>
        )}
        
        {purchaseResult && !purchaseResult.success && (
          <div className="mt-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-red-700 font-medium">{purchaseResult.message}</span>
            </div>
          </div>
        )}
      </div>

      {/* Reviews Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          Reviews
          <StarRating value={averageRating} readOnly size={5} />
          <span className="text-sm text-gray-500">({totalReviews} review{totalReviews !== 1 ? 's' : ''})</span>
        </h2>
        {reviewLoading ? (
          <div className="text-gray-500">Loading reviews...</div>
        ) : reviewError ? (
          <div className="text-red-600">{reviewError}</div>
        ) : (
          <>
            {user && !hasReviewed && (
              <form onSubmit={handleReviewSubmit} className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">Your Rating:</span>
                  <StarRating value={myRating} onChange={setMyRating} size={6} />
                </div>
                <textarea
                  className="w-full border rounded px-3 py-2 mb-2"
                  placeholder="Write a comment (optional)"
                  value={myComment}
                  onChange={e => setMyComment(e.target.value)}
                  rows={2}
                />
                <button
                  type="submit"
                  className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 font-semibold"
                  disabled={submittingReview || !myRating}
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
                {reviewSuccess && <div className="text-green-600 text-sm mt-2">{reviewSuccess}</div>}
                {reviewError && <div className="text-red-600 text-sm mt-2">{reviewError}</div>}
              </form>
            )}
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="text-gray-500">No reviews yet.</div>
              ) : (
                reviews.map(r => (
                  <div key={r._id} className="border-b pb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <img
                        src={r.user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.user.name)}&background=random`}
                        alt={r.user.name}
                        className="w-8 h-8 rounded-full object-cover border"
                      />
                      <span className="font-semibold text-gray-800">{r.user.name}</span>
                      <StarRating value={r.rating} readOnly size={4} />
                      <span className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    {r.comment && <div className="text-gray-700 ml-10">{r.comment}</div>}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}