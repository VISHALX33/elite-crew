import { useState, useEffect  } from 'react';
import VideoEmbed from '../components/VideoEmbed.jsx';

const initialVideos = [
  { 
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 
    title: 'Getting Started with React', 
    category: 'tutorial',
    views: 12500,
    date: '2023-05-15',
    duration: '12:34'
  },
  { 
    url: 'https://www.youtube.com/watch?v=ysz5S6PUM-U', 
    title: 'Advanced State Management', 
    category: 'tutorial',
    views: 8700,
    date: '2023-07-22',
    duration: '18:45'
  },
  { 
    url: 'https://www.youtube.com/watch?v=3JZ_D3ELwOQ', 
    title: 'Product Demo: New Features', 
    category: 'demo',
    views: 15600,
    date: '2023-09-10',
    duration: '08:12'
  },
  { 
    url: 'https://www.youtube.com/watch?v=ScMzIvxBSi4', 
    title: 'Meet Our Team', 
    category: 'company',
    views: 5200,
    date: '2023-04-05',
    duration: '05:30'
  },
  { 
    url: 'https://www.youtube.com/watch?v=example1', 
    title: 'CSS Best Practices', 
    category: 'tutorial',
    views: 9800,
    date: '2023-08-18',
    duration: '15:20'
  },
  { 
    url: 'https://www.youtube.com/watch?v=example2', 
    title: 'Year in Review', 
    category: 'company',
    views: 11200,
    date: '2023-12-15',
    duration: '10:45'
  },
];

export default function Videos() {
  const [videos, setVideos] = useState(initialVideos);
  const [filteredVideos, setFilteredVideos] = useState(initialVideos);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Extract unique categories from videos
  const categories = ['all', ...new Set(videos.map(video => video.category).filter(Boolean))];

  // Filter and sort videos
  useEffect(() => {
    let result = [...videos];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(video =>
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (video.description && video.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(video => video.category === categoryFilter);
    }
    
    // Apply sorting
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortBy === 'most-viewed') {
      result.sort((a, b) => b.views - a.views);
    }
    
    setFilteredVideos(result);
  }, [videos, searchTerm, categoryFilter, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-orange-600 mb-2">Video Library</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Explore our collection of tutorials, demos, and company videos
        </p>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-3 md:grid-cols-3 gap-4">
          {/* Search Input */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Videos
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                id="search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Search videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              id="sort"
              
              
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="most-viewed">Most Viewed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-600">
          Showing <span className="font-semibold text-orange-600">{filteredVideos.length}</span> video(s)
        </p>
      </div>

      {/* Empty State */}
      {filteredVideos.length === 0 && (
            <div className="bg-orange-50 border-l-4 border-orange-500 text-orange-700 p-4 mb-6 rounded-lg">
          <div className="flex flex-col items-center justify-center py-12">
            <svg className="h-16 w-16 text-orange-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium mb-2">No videos found</h3>
            <p className="text-gray-600 text-center max-w-md">
              {searchTerm || categoryFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'There are no videos available at the moment. Check back later!'}
            </p>
          </div>
        </div>
      )}

      {/* Videos Grid */}
      {filteredVideos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video, idx) => (
            <VideoEmbed key={idx} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}