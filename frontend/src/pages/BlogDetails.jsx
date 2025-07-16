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

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
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
  
  if (!blog) return null;

  const liked = blog.likes?.includes(user?._id);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Blog Header with Gradient Background */}
      <div className="bg-gradient-to-r from-orange-500 to-green-500 rounded-lg shadow-lg p-6 mb-8 text-white">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <img
            src={blog.image || 'https://via.placeholder.com/200x200?text=Blog'}
            alt={blog.title}
            className="w-40 h-40 object-cover rounded-lg border-4 border-white shadow-md"
          />
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold mb-2">{blog.title}</h1>
            <div className="flex items-center justify-center md:justify-start gap-4 mb-3">
              <span className="bg-white text-orange-600 px-3 py-1 rounded-full text-sm font-semibold">
                {blog.category || 'General'}
              </span>
              <span className="text-white/90">
                {new Date(blog.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="flex items-center gap-1">
                <span className="text-white/90">By:</span>
                <span className="font-semibold">{blog.author?.name || 'Unknown Author'}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-white/90">Views:</span>
                <span className="font-semibold">{blog.views || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Blog Content */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="prose max-w-none text-gray-700 mb-6">
          {blog.content}
        </div>

        {/* Like Button */}
        <div className="flex items-center gap-4 mb-8">
          <button
            className={`px-4 py-2 rounded-lg font-semibold text-white flex items-center gap-2 transition-all transform hover:scale-105 ${
              liked ? 'bg-green-600 shadow-lg' : 'bg-orange-500 hover:bg-orange-600'
            }`}
            onClick={handleLike}
            disabled={likeLoading}
          >
            {likeLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>
                {liked ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                )}
                {liked ? 'Liked' : 'Like'}
              </>
            )}
          </button>
          <span className="text-orange-600 font-bold text-lg">{blog.likes?.length || 0} likes</span>
        </div>

        {/* Tags */}
        {blog.tags?.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">TAGS</h3>
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag, index) => (
                <span key={index} className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-2 border-orange-200">Comments ({blog.comments?.length || 0})</h2>
        
        {/* Comment Form */}
        <form onSubmit={handleComment} className="mb-8">
          <div className="mb-4">
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              Add your comment
            </label>
            <textarea
              id="comment"
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Share your thoughts..."
              value={comment}
              onChange={e => setComment(e.target.value)}
              required
              disabled={commentLoading}
            ></textarea>
          </div>
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-all flex items-center gap-2"
            disabled={commentLoading}
          >
            {commentLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Posting...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
                Post Comment
              </>
            )}
          </button>
        </form>

        {/* Comments List */}
        <div className="space-y-6">
          {blog.comments?.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="mt-2">No comments yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            blog.comments?.map((c, idx) => (
              <div key={idx} className="bg-orange-50 rounded-lg p-4 border-l-4 border-green-500">
                <div className="flex items-start gap-3">
                  <div className="bg-orange-100 text-orange-800 rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                    {c.user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-orange-800">{c.user?.name || 'Anonymous'}</div>
                      <div className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="text-gray-700 mt-1">{c.text}</div>
                    <div className="flex gap-3 mt-2">
                      <button className="text-xs text-gray-500 hover:text-orange-600">Reply</button>
                      <button className="text-xs text-gray-500 hover:text-orange-600">Like</button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}