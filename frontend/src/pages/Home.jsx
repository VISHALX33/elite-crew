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
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchAll() {
      try {
        setLoading(true);
        const [servicesRes, productsRes, blogsRes, categoriesRes] = await Promise.all([
          api.get('/services', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
          api.get('/products', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
          api.get('/blogs', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
          api.get('/product-categories', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        ]);
        setServices(servicesRes.data);
        setProducts(productsRes.data);
        setBlogs(blogsRes.data);
        setCategories(categoriesRes.data);
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  // Filter products by selected category
  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category && (p.category._id === selectedCategory || p.category === selectedCategory));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Welcome Section */}
      <div className="bg-gradient-to-r from-orange-500 to-green-600 rounded-xl shadow-lg p-8 mb-10 text-white">
        <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name || 'User'}!</h1>
        <p className="text-lg opacity-90 mb-4">Discover our latest services, products, and resources</p>
        <button 
          onClick={() => navigate('/services')}
          className="bg-white text-orange-600 hover:bg-gray-100 px-6 py-2 rounded-lg font-medium transition-all transform hover:scale-105"
        >
          Explore Services
        </button>
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

      {/* Services Section */}
      {!loading && !error && (
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Popular Services
            </h2>
            <button 
              className="text-green-600 hover:text-green-800 font-medium flex items-center gap-1"
              onClick={() => navigate('/services')}
            >
              View All
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.slice(0, 3).map(service => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        </section>
      )}

      {/* Product Categories Section */}
      {!loading && !error && categories.length > 0 && (
        <section className="mb-6">
          <div className="flex flex-wrap gap-4 mb-4">
            <button
              className={`px-4 py-2 rounded-full font-semibold border transition ${selectedCategory === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
              onClick={() => setSelectedCategory('all')}
            >
              All Categories
            </button>
            {categories.map(cat => (
              <button
                key={cat._id}
                className={`px-4 py-2 rounded-full font-semibold border transition ${selectedCategory === cat._id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
                onClick={() => setSelectedCategory(cat._id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Products Section */}
      {!loading && !error && (
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Featured Products
            </h2>
            <button 
              className="text-green-600 hover:text-green-800 font-medium flex items-center gap-1"
              onClick={() => navigate('/products')}
            >
              View All
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.slice(0, 3).map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Blogs Section */}
      {!loading && !error && (
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              Latest Blogs
            </h2>
            <button 
              className="text-green-600 hover:text-green-800 font-medium flex items-center gap-1"
              onClick={() => navigate('/blogs')}
            >
              View All
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.slice(0, 3).map(blog => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>
        </section>
      )}

      {/* Videos Section */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Featured Videos
          </h2>
          <button 
            className="text-green-600 hover:text-green-800 font-medium flex items-center gap-1"
            onClick={() => navigate('/videos')}
          >
            View All
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.slice(0, 3).map((video, idx) => (
            <VideoEmbed key={idx} video={video} />
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-6 text-center">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Need help with something?</h3>
        <p className="text-gray-600 mb-4">Our support team is available 24/7 to assist you</p>
        <button 
          onClick={() => navigate('/contact')}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition"
        >
          Contact Support
        </button>
      </div>
    </div>
  );
}