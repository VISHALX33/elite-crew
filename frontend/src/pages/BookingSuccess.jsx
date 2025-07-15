import { useLocation, useNavigate } from 'react-router-dom';

export default function BookingSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state;

  if (!data) {
    // If accessed directly, redirect to home
    navigate('/');
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-center">
        <div className="text-green-600 text-3xl mb-4 font-bold">Booking Successful!</div>
        <div className="mb-2 text-lg">Wallet Balance: <span className="font-bold">₹{data.wallet}</span></div>
        <div className="mb-6 text-lg">Total Paid: <span className="font-bold">₹{data.breakdown?.total}</span></div>
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          onClick={() => navigate('/')}
        >
          Go to Home
        </button>
      </div>
    </div>
  );
} 