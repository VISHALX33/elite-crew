import { useEffect, useState } from 'react';
import ServiceCard from '../components/ServiceCard.jsx';
import api from '../utils/api';

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchServices() {
      try {
        setLoading(true);
        const res = await api.get('/services', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setServices(res.data);
      } catch (err) {
        setError('Failed to load services');
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">All Services</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {services.map(service => (
            <ServiceCard key={service._id} service={service} />
          ))}
        </div>
      )}
    </div>
  );
} 