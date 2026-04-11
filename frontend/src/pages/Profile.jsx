import { useAuth } from '../context/AuthContext.jsx';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center text-gray-600">
        Please log in to view your profile.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-orange-600 mb-2">My Profile</h1>
          <p className="text-gray-600">Your account information</p>
        </div>
        <Link 
          to="/settings" 
          className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-semibold"
        >
          Edit in Settings
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-orange-50">
        <div className="p-6 md:p-10">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center mb-10">
            <div className="relative">
              <img
                src={user.profileImage || `https://ui-avatars.com/api/?background=random&name=${encodeURIComponent(user.name || 'User')}`}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-orange-100 shadow-xl"
              />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">{user.name}</h2>
            <p className="text-orange-600 font-medium capitalize">{user.role || 'Customer'}</p>
          </div>

          {/* User Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Full Name</label>
              <div className="text-lg text-gray-800 font-medium pb-2 border-b border-gray-100 italic">
                {user.name}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Email Address</label>
              <div className="text-lg text-gray-800 font-medium pb-2 border-b border-gray-100 italic">
                {user.email}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Phone Number</label>
              <div className="text-lg text-gray-800 font-medium pb-2 border-b border-gray-100 italic">
                {user.phone || 'Not provided'}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider">User Unique ID</label>
              <div className="text-lg text-gray-800 font-medium pb-2 border-b border-gray-100 italic">
                {user.user_uni_id || 'N/A'}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Account Created</label>
              <div className="text-lg text-gray-800 font-medium pb-2 border-b border-gray-100 italic">
                {new Date(user.createdAt).toLocaleDateString(undefined, { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Wallet Balance</label>
              <div className="text-lg text-orange-600 font-bold pb-2 border-b border-gray-100 italic">
                ₹{(user.wallet ?? 0).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Footer Notice */}
          <div className="mt-12 p-4 bg-orange-50 rounded-xl border border-orange-100 flex items-center justify-center gap-3">
            <svg 
              className="w-5 h-5 text-orange-600" 
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-orange-800">
              To update your profile information, please visit the <Link to="/settings" className="font-bold underline">Settings</Link> page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}