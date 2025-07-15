import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="flex items-center justify-between px-4 py-3 bg-white shadow">
      <Link to="/" className="text-2xl font-bold text-blue-700">Elite Crew</Link>
      <div className="flex items-center gap-4">
        {user && (
          <>
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded font-semibold text-sm">
              Wallet: ₹{user.wallet}
            </div>
            <Link to="/profile">
              <img
                src={user.profileImage || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name || 'User')}
                alt="Profile"
                className="w-10 h-10 rounded-full border object-cover"
              />
            </Link>
            <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition">Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}
