import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ date: '', address: '', pincode: '', details: '' });
  const [purchaseResult, setPurchaseResult] = useState(null);
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const res = await api.get(`/products/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setProduct(res.data);
      } catch (err) {
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

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
      setPurchaseResult({ success: false, message: err.response?.data?.message || 'Purchase failed' });
    } finally {
      setPurchaseLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (error) return <div className="text-center text-red-500 mt-10">{error}</div>;
  if (!product) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex flex-col items-center mb-6">
        <img
          src={product.image || 'https://via.placeholder.com/120x120?text=Product'}
          alt={product.title}
          className="w-32 h-32 object-cover rounded mb-2"
        />
        <h1 className="text-2xl font-bold mb-1">{product.title}</h1>
        <div className="text-blue-700 font-bold text-lg mb-1">₹{product.price}</div>
        <p className="text-gray-500 text-center mb-2">{product.description}</p>
      </div>
      <div className="bg-gray-50 rounded p-4 mb-6">
        <h2 className="font-semibold mb-2">Calculation</h2>
        <div className="flex justify-between mb-1"><span>Base Price:</span> <span>₹{product.price}</span></div>
        <div className="flex justify-between mb-1"><span>TDS (10%):</span> <span>₹{tds}</span></div>
        <div className="flex justify-between mb-1"><span>GST (18%):</span> <span>₹{gst}</span></div>
        <div className="flex justify-between font-bold text-blue-700"><span>Total:</span> <span>₹{total}</span></div>
      </div>
      <form onSubmit={handlePurchase} className="bg-white rounded shadow p-4">
        <h2 className="font-semibold mb-4">Purchase Product</h2>
        <div className="mb-3">
          <label className="block mb-1">Date</label>
          <input type="date" name="date" className="w-full border rounded px-3 py-2" value={form.date} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="block mb-1">Address</label>
          <input type="text" name="address" className="w-full border rounded px-3 py-2" value={form.address} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="block mb-1">Pincode</label>
          <input type="text" name="pincode" className="w-full border rounded px-3 py-2" value={form.pincode} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="block mb-1">Other Details</label>
          <textarea name="details" className="w-full border rounded px-3 py-2" value={form.details} onChange={handleChange} />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition" disabled={purchaseLoading}>
          {purchaseLoading ? 'Purchasing...' : 'Purchase'}
        </button>
      </form>
      {purchaseResult && purchaseResult.success && (
        <div className="flex justify-center items-center mt-4">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
          <span className="ml-2 text-blue-600 font-semibold">Redirecting...</span>
        </div>
      )}
      {purchaseResult && !purchaseResult.success && (
        <div className="mt-4 p-3 rounded bg-red-100 text-red-700">{purchaseResult.message}</div>
      )}
    </div>
  );
}
