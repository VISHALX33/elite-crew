import { Link, useLocation } from 'react-router-dom';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/booking-history', label: 'Booking History' },
  { to: '/purchase-history', label: 'Purchase History' },
  { to: '/blogs', label: 'Blogs' },
  { to: '/profile', label: 'Profile' },
];

const mobileLinks = [
  { 
    to: '/', 
    label: 'Home', 
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ) 
  },
  { 
    to: '/booking-history', 
    label: 'Bookings', 
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ) 
  },
  { 
    to: '/purchase-history', 
    label: 'Purchases', 
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ) 
  },
  { 
    to: '/blogs', 
    label: 'Blogs', 
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ) 
  },
  { 
    to: '/profile', 
    label: 'Profile', 
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ) 
  },
];

export default function Footer() {
  const location = useLocation();
  
  return (
    <footer className="mt-12">
      {/* Desktop Footer */}
      <div className="hidden md:block bg-gradient-to-r from-orange-50 to-indigo-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-3 md:grid-cols-4 gap-8">
            {/* Brand Column */}
            <div className="space-y-4">
              <Link to="/" className="flex items-center">
                <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">Elite Crew</span>
              </Link>
              <p className="text-gray-600 text-sm">
                Providing premium services with excellence and dedication.
              </p>
              <div className="flex space-x-4">
                {/* Social Icons would go here */}
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Quick Links</h3>
              <div className="space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`block text-sm hover:text-orange-600 transition-colors ${
                      location.pathname === link.to ? 'text-orange-600 font-medium' : 'text-gray-600'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Contact Us</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>123 Service Lane</p>
                <p>Metropolis, MP 12345</p>
                <p>Email: info@elitecrew.com</p>
                <p>Phone: (123) 456-7890</p>
              </div>
            </div>

            {/* Newsletter */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Newsletter</h3>
              <p className="text-sm text-gray-600">Subscribe to our newsletter for the latest updates.</p>
              <div className="mt-2 flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <button className="bg-orange-600 text-white px-4 py-2 rounded-r-lg hover:bg-orange-700 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Elite Crew. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-sm text-gray-500 hover:text-orange-600">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm text-gray-500 hover:text-orange-600">
                Terms of Service
              </Link>
              <Link to="/contact" className="text-sm text-gray-500 hover:text-orange-600">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-200 shadow-lg">
        <div className="flex justify-around items-center py-2">
          {mobileLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                location.pathname === link.to 
                  ? 'text-orange-600 bg-orange-50' 
                  : 'text-gray-600 hover:text-orange-600'
              }`}
            >
              <div className={`p-1 rounded-full ${
                location.pathname === link.to ? 'bg-orange-100' : ''
              }`}>
                {link.icon}
              </div>
              <span className="text-xs mt-1">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}