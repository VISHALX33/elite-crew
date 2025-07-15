import { useEffect, useState } from 'react';
import BlogCard from '../components/BlogCard.jsx';
import api from '../utils/api';

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchBlogs() {
      try {
        setLoading(true);
        const res = await api.get('/blogs', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setBlogs(res.data);
      } catch (err) {
        setError('Failed to load blogs');
      } finally {
        setLoading(false);
      }
    }
    fetchBlogs();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">All Blogs</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {blogs.map(blog => (
            <BlogCard key={blog._id} blog={blog} />
          ))}
        </div>
      )}
    </div>
  );
} 