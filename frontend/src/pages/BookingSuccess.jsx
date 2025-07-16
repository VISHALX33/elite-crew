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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-green-50 p-4">
      {/* Success Card */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-2xl">
        {/* Header with Confetti Effect */}
        <div className="bg-gradient-to-r from-orange-500 to-green-600 p-6 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div 
                key={i}
                className="absolute w-2 h-2 bg-yellow-300 rounded-full opacity-70"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  transform: `rotate(${Math.random() * 360}deg)`
                }}
              />
            ))}
          </div>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-20 w-20 mx-auto text-white mb-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          <h1 className="text-3xl font-bold text-white mb-2">Booking Confirmed!</h1>
          <p className="text-white/90">Your service has been successfully booked</p>
        </div>

        {/* Booking Details */}
        <div className="p-6 md:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Booking Summary</h2>
            
            {/* Breakdown Details */}
            <div className="space-y-3 mb-6">
              {data.breakdown && Object.entries(data.breakdown).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                  <span className="font-medium">₹{value}</span>
                </div>
              ))}
            </div>

            {/* Total Amount */}
            <div className="border-t border-gray-200 pt-4 flex justify-between">
              <span className="text-lg font-semibold text-gray-800">Total Paid:</span>
              <span className="text-xl font-bold text-green-600">₹{data.breakdown?.total}</span>
            </div>
          </div>

          {/* Wallet Balance */}
          <div className="bg-orange-50 rounded-lg p-4 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-gray-700">Wallet Balance:</span>
              </div>
              <span className="text-lg font-bold text-orange-600">₹{data.wallet}</span>
            </div>
          </div>

          {/* Next Steps */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">What's Next?</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>You'll receive a confirmation email shortly</span>
              </li>
              <li className="flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Our service provider will contact you before the appointment</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105"
              onClick={() => navigate('/booking-history')}
            >
              View Booking Details
            </button>
            <button
              className="flex-1 bg-white border border-orange-500 text-orange-600 hover:bg-orange-50 px-6 py-3 rounded-lg font-medium transition"
              onClick={() => navigate('/')}
            >
              Back to Home
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 text-center text-sm text-gray-500">
          Need help? Contact our support team at support@example.com
        </div>
      </div>
    </div>
  );
}