import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext.jsx';

export default function ServiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ date: '', time: '', address: '', pincode: '', details: '' });
  const [bookingResult, setBookingResult] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    async function fetchService() {
      try {
        setLoading(true);
        const res = await api.get(`/services/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setService(res.data);
      } catch (err) {
        setError('Failed to load service');
      } finally {
        setLoading(false);
      }
    }
    fetchService();
  }, [id]);

  const tds = service ? service.price * 0.10 : 0;
  const gst = service ? service.price * 0.18 : 0;
  const total = service ? Math.round(service.price + tds + gst) : 0;

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleBook = async e => {
    e.preventDefault();
    setBookingResult(null);
    setBookingLoading(true);
    try {
      const res = await api.post(`/services/${id}/use`, form, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      // Update wallet in AuthContext
      setUser({ ...user, wallet: res.data.wallet });
      setBookingResult({ success: true, ...res.data });
      setTimeout(() => {
        navigate('/booking-success', { state: res.data });
      }, 1000);
    } catch (err) {
      setBookingResult({ success: false, message: err.response?.data?.message || 'Booking failed' });
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (error) return <div className="text-center text-red-500 mt-10">{error}</div>;
  if (!service) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex flex-col items-center mb-6">
        <img
          src={service.image || 'https://via.placeholder.com/120x120?text=Service'}
          alt={service.title}
          className="w-32 h-32 object-cover rounded mb-2"
        />
        <h1 className="text-2xl font-bold mb-1">{service.title}</h1>
        <div className="text-blue-700 font-bold text-lg mb-1">₹{service.price}</div>
        <p className="text-gray-500 text-center mb-2">{service.description}</p>
      </div>
      <div className="bg-gray-50 rounded p-4 mb-6">
        <h2 className="font-semibold mb-2">Calculation</h2>
        <div className="flex justify-between mb-1"><span>Base Price:</span> <span>₹{service.price}</span></div>
        <div className="flex justify-between mb-1"><span>TDS (10%):</span> <span>₹{tds}</span></div>
        <div className="flex justify-between mb-1"><span>GST (18%):</span> <span>₹{gst}</span></div>
        <div className="flex justify-between font-bold text-blue-700"><span>Total:</span> <span>₹{total}</span></div>
      </div>
      <form onSubmit={handleBook} className="bg-white rounded shadow p-4">
        <h2 className="font-semibold mb-4">Book Service</h2>
        <div className="mb-3">
          <label className="block mb-1">Date</label>
          <input type="date" name="date" className="w-full border rounded px-3 py-2" value={form.date} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="block mb-1">Time</label>
          <input type="time" name="time" className="w-full border rounded px-3 py-2" value={form.time} onChange={handleChange} required />
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
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition" disabled={bookingLoading}>
          {bookingLoading ? 'Booking...' : 'Book Service'}
        </button>
      </form>
      {bookingResult && (
        <div className={`mt-4 p-3 rounded ${bookingResult.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {bookingResult.success ? (
            <>
              <div>Booking successful!</div>
              <div>Wallet Balance: ₹{bookingResult.wallet}</div>
              <div>Total Paid: ₹{bookingResult.breakdown?.total}</div>
            </>
          ) : (
            <div>{bookingResult.message}</div>
          )}
        </div>
      )}
      {bookingResult && bookingResult.success && (
        <div className="flex justify-center items-center mt-4">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
          <span className="ml-2 text-blue-600 font-semibold">Redirecting...</span>
        </div>
      )}
    </div>
  );
}
