import { useNavigate } from 'react-router-dom';
import { FaStar, FaRegStar, FaClock, FaUserTie } from 'react-icons/fa';

export default function ServiceCard({ service }) {
  const navigate = useNavigate();

  // Calculate star rating display
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-400" />);
      }
    }
    return stars;
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-full border border-gray-100"
      onClick={() => navigate(`/services/${service._id}`)}
    >
      {/* Service Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={service.image || 'https://via.placeholder.com/400x300?text=Service'}
          alt={service.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        {/* Popular Badge */}
        {service.isPopular && (
          <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
            Popular
          </span>
        )}
      </div>

      {/* Service Content */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">
          {service.title}
        </h3>
        
        {/* Price Section */}
        <div className="flex items-center mb-2">
          <span className="text-xl font-bold text-blue-600">
            ₹{service.price.toLocaleString()}
          </span>
          {service.originalPrice && (
            <span className="text-sm text-gray-500 line-through ml-2">
              ₹{service.originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Rating */}
        {service.rating && (
          <div className="flex items-center mb-2">
            <div className="flex mr-1">
              {renderStars(service.rating)}
            </div>
            <span className="text-xs text-gray-500">
              ({service.reviewCount || 0} reviews)
            </span>
          </div>
        )}

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">
          {service.description}
        </p>

        {/* Service Meta */}
        <div className="flex flex-wrap gap-2 text-xs text-gray-600">
          {service.duration && (
            <div className="flex items-center bg-gray-50 px-2 py-1 rounded">
              <FaClock className="mr-1" />
              {service.duration}
            </div>
          )}
          {service.providerType && (
            <div className="flex items-center bg-gray-50 px-2 py-1 rounded">
              <FaUserTie className="mr-1" />
              {service.providerType}
            </div>
          )}
          {service.category && (
            <div className="flex items-center bg-gray-50 px-2 py-1 rounded">
              {service.category}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}