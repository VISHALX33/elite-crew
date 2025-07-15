import { Link, useLocation } from 'react-router-dom';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/booking-history', label: 'Booking History' },
  { to: '/purchase-history', label: 'Purchase History' },
  { to: '/blogs', label: 'Blogs' },
  { to: '/profile', label: 'Profile' },
];

const mobileLinks = [
  { to: '/', label: 'Home', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7m-9 2v8m4-8v8m5 0h-4a2 2 0 01-2-2v-4a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2z" /></svg>
  ) },
  { to: '/booking-history', label: 'Bookings', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 17l4 4 4-4m-4-5v9" /></svg>
  ) },
  { to: '/purchase-history', label: 'Purchases', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h18v18H3V3zm3 3v12h12V6H6zm3 3h6v6H9V9z" /></svg>
  ) },
  { to: '/blogs', label: 'Blogs', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2z" /></svg>
  ) },
  { to: '/profile', label: 'Profile', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A9 9 0 1112 21a9 9 0 01-6.879-3.196z" /></svg>
  ) },
];

export default function Footer() {
  const location = useLocation();
  return (
    <footer className="mt-8">
      {/* Desktop Footer */}
      <div className="hidden md:flex justify-between items-center py-6 px-8 bg-gray-100 border-t text-gray-700 text-sm">
        <div className="font-bold text-blue-700 text-lg">Elite Crew</div>
        <div className="text-center">&copy; {new Date().getFullYear()} Elite Crew. All rights reserved.</div>
        <div className="flex gap-6">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`hover:text-blue-700 transition ${location.pathname === link.to ? 'text-blue-700 font-bold' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      {/* Mobile Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden flex justify-around items-center bg-white border-t py-2 shadow">
        {mobileLinks.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={`flex flex-col items-center text-xs text-gray-700 hover:text-blue-700 transition ${location.pathname === link.to ? 'text-blue-700 font-bold' : ''}`}
          >
            {link.icon}
            <span className="text-[10px] mt-1">{link.label}</span>
          </Link>
        ))}
      </div>
    </footer>
  );
}
