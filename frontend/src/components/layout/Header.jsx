import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Sun, Moon, ShoppingCart, User } from 'lucide-react';
import { Button } from '../ui';

export const Header = ({ onCartClick, cartItemsCount = 0 }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const navigationItems = [
    { label: 'Home', href: '/' },
    { label: 'Events', href: '/events' },
    { label: 'Categories', href: '/events?view=categories' },
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
            <button className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors">
              <User size={20} />
              <span className="text-sm font-medium">Account</span>
            </button>

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
            <div className="px-4 py-3">
              <Link to="/login" className="w-full">
                <Button variant="primary" size="md" className="w-full">
                  Sign In
                </Button>
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

Header.displayName = 'Header';
