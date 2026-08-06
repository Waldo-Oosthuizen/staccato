import { useState, useEffect } from 'react';
import { FaHome } from 'react-icons/fa';
import { IoPeople } from 'react-icons/io5';
import { HiOutlineClipboardList } from 'react-icons/hi';
import { AiOutlineCalendar } from 'react-icons/ai';
import { NavLink, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on route change
  useEffect(() => {
    setIsNavOpen(false);
  }, [location]);

  // Close sidebar on Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setIsNavOpen(false);
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const toggleNav = () => {
    setIsNavOpen((prev) => !prev);
  };

  const navItems = [
    {
      path: '/home',
      label: 'Home',
      icon: <FaHome className="h-6 w-6" />,
    },
    {
      path: '/students',
      label: 'Students',
      icon: <IoPeople className="h-6 w-6" />,
    },
    {
      path: '/StudentManagement',
      label: 'Manage',
      icon: <HiOutlineClipboardList className="h-6 w-6" />,
    },
    {
      path: '/schedule',
      label: 'Calendar',
      icon: <AiOutlineCalendar className="h-6 w-6" />,
    },
  ];

  return (
    <div className="relative">
      {/* Desktop Sidebar */}
      <nav
        className={`fixed top-0 left-0 h-full bg-white hidden md:flex flex-col
        ${isNavOpen ? 'md:w-64' : 'md:w-16'}
        transition-all duration-300 ease-in-out z-40 shadow-lg`}>
        {/* Header */}
        <div className="relative h-16 flex items-center ">
          <button
            onClick={toggleNav}
            className={`p-2 text-gray-700  rounded-md transition-all duration-300 hover:bg-slate-100
            ${isNavOpen ? 'ml-48' : 'ml-2'}`}>
            {isNavOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            )}
          </button>

          {isNavOpen && (
            <h1 className="text-xl font-semibold absolute left-4 text-slate-700">
              Staccato
            </h1>
          )}
        </div>

        {/* Links */}
        <div className="flex flex-col space-y-2 mt-6 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center px-3 py-3 rounded-md transition-all duration-200
                ${isNavOpen ? '' : 'justify-center'}
                ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 text-white shadow-md'
                    : 'hover:bg-slate-100 transition-colors duration-200'
                }`
              }>
              <span className="flex items-center justify-center w-6">
                {item.icon}
              </span>

              {isNavOpen && (
                <span className="ml-4 font-medium">{item.label}</span>
              )}
            </NavLink>
          ))}
        </div>

        {/* Footer */}
        {isNavOpen && (
          <div className="mt-auto p-4 border-t border-slate-200 text-sm text-slate-600">
            © 2026 Staccato
          </div>
        )}
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t z-40">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full text-sm  
                ${isActive ? ' font-semibold rounded-t bg-gradient-to-r text-emerald-700' : 'text-slate-500'}`
              }>
              {item.icon}
              <span className="mt-1">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Overlay */}
      {isNavOpen && (
        <div
          onClick={toggleNav}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 hidden md:block"
        />
      )}
    </div>
  );
};

export default Navbar;
