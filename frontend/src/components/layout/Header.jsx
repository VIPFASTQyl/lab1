import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon, ShoppingCart, User, LogOut } from 'lucide-react';
import { Button } from '../ui';

export const Header = ({ onCartClick, cartItemsCount = 0 }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userName, setUserName] = useState('');

  // Get user name from localStorage on mount
  React.useEffect(() => {
    const storedName = localStorage.getItem('userName');
    setUserName(storedName || '');
  }, []);

  const getInitial = () => {
    return userName ? userName.charAt(0).toUpperCase() : 'U';
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userName');
    setIsAccountOpen(false);
    navigate('/login');
  };

  const navigationItems = localStorage.getItem('isAdmin') === 'true'
    ? [
        { label: 'Home', href: '/' },
        { label: 'Events', href: '/admin/events' },
        { label: 'Admin', href: '/admin' },
      ]
    : [
        { label: 'Home', href: '/' },
        { label: 'Events', href: '/events' },
        { label: 'Partners', href: '/partners' },
      ];

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-dark-900 border-b border-gray-200 dark:border-dark-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-2xl font-bold text-primary-600 dark:text-primary-400 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center text-white font-bold">
              Ξ
            </div>
            <span className="hidden sm:inline">EventHub</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navigationItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-lg transition-colors"
            >
              {isDarkMode ? (
                <Sun size={20} className="text-gray-600 dark:text-gray-400" />
              ) : (
                <Moon size={20} className="text-gray-600 dark:text-gray-400" />
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={onCartClick}
              className="relative p-2 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-lg transition-colors"
            >
              <ShoppingCart size={20} className="text-gray-600 dark:text-gray-400" />
              {cartItemsCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-secondary-600 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                  {cartItemsCount > 9 ? '9+' : cartItemsCount}
                </span>
              )}
            </button>

            {/* User Menu */}
            <div className="hidden md:relative md:flex items-center">
              <button
                onClick={() => setIsAccountOpen(!isAccountOpen)}
                title={`Account: ${userName || 'Guest'}`}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary-600 dark:bg-primary-500 flex items-center justify-center text-white font-semibold text-sm">
                  {getInitial()}
                </div>
                <span className="text-sm font-medium">Account</span>
              </button>

              {/* Account Dropdown */}
              {isAccountOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-800 rounded-lg shadow-xl border border-gray-200 dark:border-dark-700">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium first:rounded-t-lg"
                  >
                    <LogOut size={18} />
                    Log Out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-lg transition-colors"
            >
              {isMenuOpen ? (
                <X size={24} className="text-gray-600 dark:text-gray-400" />
              ) : (
                <Menu size={24} className="text-gray-600 dark:text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="md:hidden pb-4 border-t border-gray-200 dark:border-dark-700">
            {/* User Info Section */}
            <div className="px-4 py-4 border-b border-gray-200 dark:border-dark-700 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-600 dark:bg-primary-500 flex items-center justify-center text-white font-semibold">
                {getInitial()}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{userName || 'Guest'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Your Account</p>
              </div>
            </div>

            {navigationItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium hover:bg-gray-50 dark:hover:bg-dark-800"
              >
                {item.label}
              </Link>
            ))}
            <div className="px-4 py-3 border-t border-gray-200 dark:border-dark-700">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors font-medium"
              >
                <LogOut size={18} />
                Log Out
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

Header.displayName = 'Header';
