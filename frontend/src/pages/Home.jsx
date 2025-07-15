import { useAuth } from '../context/AuthContext.jsx';
import { useEffect, useState } from 'react';
import ServiceCard from '../components/ServiceCard.jsx';
import ProductCard from '../components/ProductCard.jsx';
import BlogCard from '../components/BlogCard.jsx';
import VideoEmbed from '../components/VideoEmbed.jsx';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

const videos = [
  { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: 'Sample Video 1' },
  { url: 'https://www.youtube.com/watch?v=ysz5S6PUM-U', title: 'Sample Video 2' },
  { url: 'https://www.youtube.com/watch?v=3JZ_D3ELwOQ', title: 'Sample Video 3' },
  { url: 'https://www.youtube.com/watch?v=ScMzIvxBSi4', title: 'Sample Video 4' },
];

export default function Home() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchAll() {
      try {
        setLoading(true);
        const [servicesRes, productsRes, blogsRes] = await Promise.all([
          api.get('/services', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
          api.get('/products', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
          api.get('/blogs', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        ]);
        setServices(servicesRes.data);
        setProducts(productsRes.data);
        setBlogs(blogsRes.data);
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Welcome, {user?.name || 'User'}!</h1>
      {/* Services Section */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Services</h2>
          <button className="text-blue-600 hover:underline" onClick={() => navigate('/services')}>View All</button>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {services.slice(0, 3).map(service => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        )}
      </section>
      {/* Products Section */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Products</h2>
          <button className="text-blue-600 hover:underline" onClick={() => navigate('/products')}>View All</button>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {products.slice(0, 3).map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
      {/* Blogs Section */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Blogs</h2>
          <button className="text-blue-600 hover:underline" onClick={() => navigate('/blogs')}>View All</button>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {blogs.slice(0, 3).map(blog => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>
        )}
      </section>
      {/* Videos Section */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Videos</h2>
          <button className="text-blue-600 hover:underline" onClick={() => navigate('/videos')}>View All</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {videos.slice(0, 3).map((video, idx) => (
            <VideoEmbed key={idx} video={video} />
          ))}
        </div>
      </section>
    </div>
  );
}
