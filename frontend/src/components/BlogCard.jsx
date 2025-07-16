import { useNavigate } from 'react-router-dom';

export default function BlogCard({ blog }) {
  const navigate = useNavigate();
  
  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col h-full"
      onClick={() => navigate(`/blogs/${blog._id}`)}
    >
      {/* Blog Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={blog.image || 'https://via.placeholder.com/400x300?text=Blog+Image'}
          alt={blog.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        {/* Category Badge */}
        {blog.category && (
          <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
            {blog.category}
          </span>
        )}
      </div>

      {/* Blog Content */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <span className="flex items-center mr-3">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            {new Date(blog.createdAt).toLocaleDateString()}
          </span>
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
            </svg>
            {blog.views || 0}
          </span>
        </div>

        <h3 className="font-bold text-xl mb-2 text-gray-800 line-clamp-2">
          {blog.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
          {blog.content}
        </p>

        {/* Footer with author and likes */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
          <div className="flex items-center">
            {blog.author?.avatar && (
              <img 
                src={blog.author.avatar} 
                alt={blog.author.name} 
                className="w-8 h-8 rounded-full mr-2 object-cover"
              />
            )}
            <span className="text-sm text-gray-700">
              {blog.author?.name || 'Unknown Author'}
            </span>
          </div>
          
          <div className="flex items-center text-orange-500 font-semibold">
            <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path>
            </svg>
            {blog.likes?.length || 0}
          </div>
        </div>
      </div>
    </div>
  );
}