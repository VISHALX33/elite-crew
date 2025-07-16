import { useNavigate } from 'react-router-dom';
import { FaStar, FaRegStar, FaShoppingCart } from 'react-icons/fa';

export default function ProductCard({ product }) {
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
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-full"
      onClick={() => navigate(`/products/${product._id}`)}
    >
      {/* Product Image with Badges */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={product.image || 'https://via.placeholder.com/400x400?text=Product+Image'}
          alt={product.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        
        {/* Sale Badge */}
        {product.onSale && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            SALE
          </div>
        )}
        
        {/* Add to Cart Button */}
        <button 
          className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-md"
          onClick={(e) => {
            e.stopPropagation();
            // Add to cart functionality here
          }}
        >
          <FaShoppingCart className="h-4 w-4" />
        </button>
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-lg text-gray-800 mb-1 line-clamp-2">
          {product.title}
        </h3>
        
        {/* Price Section */}
        <div className="flex items-center mb-2">
          <span className="text-xl font-bold text-orange-600 mr-2">
            ₹{product.price.toLocaleString()}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through">
              ₹{product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>
        
        {/* Rating */}
        {product.rating && (
          <div className="flex items-center mb-2">
            <div className="flex mr-1">
              {renderStars(product.rating)}
            </div>
            <span className="text-xs text-gray-500">
              ({product.reviewCount || 0})
            </span>
          </div>
        )}
        
        {/* Description */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-grow">
          {product.description}
        </p>
        
        {/* Additional Info */}
        <div className="flex justify-between items-center text-xs text-gray-500">
          {product.stock && (
            <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          )}
          {product.freeShipping && (
              <span className="text-orange-600">Free Shipping</span>
          )}
        </div>
      </div>
    </div>
  );
}