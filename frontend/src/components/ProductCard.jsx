import { useNavigate } from 'react-router-dom';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  return (
    <div
      className="bg-white rounded shadow p-4 flex flex-col items-center cursor-pointer hover:shadow-lg transition"
      onClick={() => navigate(`/products/${product._id}`)}
    >
      <img
        src={product.image || 'https://via.placeholder.com/100x100?text=Product'}
        alt={product.title}
        className="w-24 h-24 object-cover rounded mb-2"
      />
      <h3 className="font-semibold text-lg mb-1 text-center">{product.title}</h3>
      <div className="text-blue-700 font-bold mb-1">₹{product.price}</div>
      <p className="text-gray-500 text-sm text-center line-clamp-2">{product.description}</p>
    </div>
  );
}
