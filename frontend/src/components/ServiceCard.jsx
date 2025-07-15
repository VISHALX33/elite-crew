import { useNavigate } from 'react-router-dom';

export default function ServiceCard({ service }) {
  const navigate = useNavigate();
  return (
    <div
      className="bg-white rounded shadow p-4 flex flex-col items-center cursor-pointer hover:shadow-lg transition"
      onClick={() => navigate(`/services/${service._id}`)}
    >
      <img
        src={service.image || 'https://via.placeholder.com/100x100?text=Service'}
        alt={service.title}
        className="w-24 h-24 object-cover rounded mb-2"
      />
      <h3 className="font-semibold text-lg mb-1 text-center">{service.title}</h3>
      <div className="text-blue-700 font-bold mb-1">₹{service.price}</div>
      <p className="text-gray-500 text-sm text-center line-clamp-2">{service.description}</p>
    </div>
  );
}
