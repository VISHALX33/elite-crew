import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext.jsx';

export default function BlogDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [likeLoading, setLikeLoading] = useState(false);
  const [comment, setComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    async function fetchBlog() {
      try {
        setLoading(true);
        const res = await api.get(`/blogs/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setBlog(res.data);
      } catch (err) {
        setError('Failed to load blog');
      } finally {
        setLoading(false);
      }
    }
    fetchBlog();
  }, [id]);

  const handleLike = async () => {
    setLikeLoading(true);
    try {
      await api.post(`/blogs/${id}/like`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      // Refetch blog
      const res = await api.get(`/blogs/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setBlog(res.data);
    } catch {}
    setLikeLoading(false);
  };

  const handleComment = async e => {
    e.preventDefault();
    setCommentLoading(true);
    try {
      await api.post(`/blogs/${id}/comment`, { text: comment }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setComment('');
      // Refetch blog
      const res = await api.get(`/blogs/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setBlog(res.data);
    } catch {}
    setCommentLoading(false);
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (error) return <div className="text-center text-red-500 mt-10">{error}</div>;
  if (!blog) return null;

  const liked = blog.likes?.includes(user?._id);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex flex-col items-center mb-6">
        <img
          src={blog.image || 'https://via.placeholder.com/120x120?text=Blog'}
          alt={blog.title}
          className="w-32 h-32 object-cover rounded mb-2"
        />
        <h1 className="text-2xl font-bold mb-1">{blog.title}</h1>
        <div className="text-gray-500 text-center mb-2">{blog.content}</div>
        <div className="flex items-center gap-2 mb-2">
          <button
            className={`px-3 py-1 rounded font-semibold text-white ${liked ? 'bg-pink-600' : 'bg-gray-400'} transition`}
            onClick={handleLike}
            disabled={likeLoading}
          >
            {liked ? '♥ Liked' : '♡ Like'}
          </button>
          <span className="text-pink-600 font-bold">{blog.likes?.length || 0}</span>
        </div>
      </div>
      <div className="bg-white rounded shadow p-4 mb-6">
        <h2 className="font-semibold mb-2">Comments</h2>
        <form onSubmit={handleComment} className="flex gap-2 mb-4">
          <input
            type="text"
            className="flex-1 border rounded px-3 py-2"
            placeholder="Add a comment..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            required
            disabled={commentLoading}
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition" disabled={commentLoading}>
            {commentLoading ? '...' : 'Post'}
          </button>
        </form>
        <div className="space-y-3">
          {blog.comments?.length === 0 && <div className="text-gray-400">No comments yet.</div>}
          {blog.comments?.map((c, idx) => (
            <div key={idx} className="bg-gray-50 rounded p-2">
              <div className="font-semibold text-sm">{c.user?.name || 'User'}</div>
              <div className="text-gray-700 text-sm">{c.text}</div>
              <div className="text-gray-400 text-xs">{new Date(c.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 