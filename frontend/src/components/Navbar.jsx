import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useState } from 'react';
import { XMarkIcon, Bars3Icon } from '@heroicons/react/24/outline';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showSidebar, setShowSidebar] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <div className="flex-shrink-0 flex items-center">
              <Link 
                to="/" 
                className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent"
              >
                Elite Crew
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-4">
                {user && (
                  <>
                    <Link 
                      to="/services" 
                      className="text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Services
                    </Link>
                    <Link 
                      to="/blogs" 
                      className="text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Blogs
                    </Link>
                    <Link 
                      to="/booking-history" 
                      className="text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      My Bookings
                    </Link>
                    
                    {/* Wallet Balance */}
                    <div className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full font-medium text-sm flex items-center">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-4 w-4 mr-1" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" 
                        />
                      </svg>
                      ₹{user.wallet.toLocaleString()}
                    </div>

                    {/* Profile Dropdown */}
                    <div className="relative ml-3">
                      <div>
                        <button 
                          onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                          className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                        >
                          <img
                            src={user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random`}
                            alt="Profile"
                            className="w-8 h-8 rounded-full border-2 border-orange-100 object-cover"
                          />
                        </button>
                      </div>

                      {showProfileDropdown && (
                        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <Link
                            to="/profile"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                            onClick={() => setShowProfileDropdown(false)}
                          >
                            Your Profile
                          </Link>
                          <Link
                            to="/settings"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                            onClick={() => setShowProfileDropdown(false)}
                          >
                            Settings
                          </Link>
                          <button
                            onClick={() => {
                              handleLogout();
                              setShowProfileDropdown(false);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            Sign out
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              {user && (
                <>
                  <div className="bg-orange-50 text-orange-700 px-2 py-1 rounded-full text-xs mr-2">
                    ₹{user.wallet.toLocaleString()}
                  </div>
                  <button
                    onClick={toggleSidebar}
                    className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 focus:outline-none"
                  >
                    {showSidebar ? (
                      <XMarkIcon className="h-6 w-6" />
                    ) : (
                      <Bars3Icon className="h-6 w-6" />
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 right-0 z-50 w-64 bg-white shadow-lg transform ${showSidebar ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out md:hidden`}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="text-lg font-medium text-gray-900">Menu</div>
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-md text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="px-4 py-3">
          <div className="flex items-center space-x-3 pb-4 mb-4 border-b border-gray-200">
            <img
              src={user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random`}
              alt="Profile"
              className="w-10 h-10 rounded-full border-2 border-orange-100 object-cover"
            />
            <div>
              <div className="font-medium text-gray-900">{user.name}</div>
              <div className="text-sm text-gray-500">{user.email}</div>
            </div>
          </div>
          <nav className="space-y-2">
            <Link
              to="/services"
              onClick={toggleSidebar}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50"
            >
              Services
            </Link>
            <Link
              to="/blogs"
              onClick={toggleSidebar}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50"
            >
              Blogs
            </Link>
            <Link
              to="/booking-history"
              onClick={toggleSidebar}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50"
            >
              My Bookings
            </Link>
            <Link
              to="/profile"
              onClick={toggleSidebar}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50"
            >
              Profile
            </Link>
            <Link
              to="/settings"
              onClick={toggleSidebar}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50"
            >
              Settings
            </Link>
            <button
              onClick={() => {
                handleLogout();
                toggleSidebar();
              }}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
            >
              Sign Out
            </button>
          </nav>
        </div>
      </div>
      
      {/* Overlay */}
      {showSidebar && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
}