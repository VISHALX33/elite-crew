import { useNavigate } from 'react-router-dom';

export default function BlogCard({ blog }) {
  const navigate = useNavigate();
  return (
    <div
      className="bg-white rounded shadow p-4 flex flex-col items-center cursor-pointer hover:shadow-lg transition"
      onClick={() => navigate(`/blogs/${blog._id}`)}
    >
      <img
        src={blog.image || 'https://via.placeholder.com/100x100?text=Blog'}
        alt={blog.title}
        className="w-24 h-24 object-cover rounded mb-2"
      />
      <h3 className="font-semibold text-lg mb-1 text-center">{blog.title}</h3>
      <div className="text-gray-500 text-sm text-center line-clamp-2 mb-1">
        {blog.content?.slice(0, 60)}{blog.content?.length > 60 ? '...' : ''}
      </div>
      <div className="text-pink-600 font-bold">♥ {blog.likes?.length || 0}</div>
    </div>
  );
}
