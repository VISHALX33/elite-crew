import { useEffect, useState } from 'react';
import api from '../utils/api';

export default function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchBookings() {
      try {
        setLoading(true);
        const res = await api.get('/services/my-bookings', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setBookings(res.data);
      } catch (err) {
        setError('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Service Bookings</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : bookings.length === 0 ? (
        <div className="text-gray-500">No bookings found.</div>
      ) : (
        <div className="space-y-4">
          {bookings.map(b => (
            <div key={b._id} className="bg-white rounded shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <img src={b.service?.image || 'https://via.placeholder.com/60x60?text=Service'} alt={b.service?.title} className="w-16 h-16 object-cover rounded" />
                <div>
                  <div className="font-semibold text-lg">{b.service?.title}</div>
                  <div className="text-gray-500 text-sm">{b.date} {b.time}</div>
                  <div className="text-gray-500 text-sm">{b.address}, {b.pincode}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-blue-700">₹{b.totalAmount}</div>
                <div className="text-xs text-gray-400">{b.status}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
