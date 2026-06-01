import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon, ShoppingCart, LogOut } from 'lucide-react';

export const Header = ({ onCartClick, cartItemsCount = 0 }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    setUserName(storedName || '');

    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = storedTheme ? storedTheme === 'dark' : prefersDark;
    setIsDarkMode(shouldUseDark);
    document.documentElement.classList.toggle('dark', shouldUseDark);
  }, []);

  const getInitial = () => {
    return userName ? userName.charAt(0).toUpperCase() : 'U';
  };

  const toggleDarkMode = () => {
    setIsDarkMode((current) => {
      const next = !current;
      document.documentElement.classList.toggle('dark', next);
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
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
    <header className="sticky top-0 z-50 bg-gradient-to-r from-[#F8FAFC] via-[#6598B3] to-[#022554] border-b border-black/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-2xl font-bold text-slate-950 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-[#6598B3] to-[#022554] flex items-center justify-center text-white font-bold">
              Ξ
            </div>
            <span className="hidden sm:inline">MADVERSE</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navigationItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="px-4 py-2 text-slate-950 hover:text-[#12679c] transition-colors font-medium"
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
              className="p-2 hover:bg-black/10 transition-colors"
            >
              {isDarkMode ? (
                <Sun size={20} className="text-slate-950" />
              ) : (
                <Moon size={20} className="text-slate-950" />
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={onCartClick}
              className="relative p-2 hover:bg-black/10 transition-colors"
            >
              <ShoppingCart size={20} className="text-slate-950" />
              {cartItemsCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-accent-600 text-white text-xs flex items-center justify-center font-semibold">
                  {cartItemsCount > 9 ? '9+' : cartItemsCount}
                </span>
              )}
            </button>

            {/* User Menu */}
            <div className="hidden md:relative md:flex items-center">
              <button
                onClick={() => setIsAccountOpen(!isAccountOpen)}
                title={`Account: ${userName || 'Guest'}`}
                className="flex items-center gap-2 px-4 py-2 text-slate-950 hover:bg-black/10 transition-colors"
              >
                <div className="w-8 h-8 bg-[#6598B3] flex items-center justify-center text-white font-semibold text-sm">
                  {getInitial()}
                </div>
                <span className="text-sm font-medium">Account</span>
              </button>

              {/* Account Dropdown */}
              {isAccountOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#fff8c7] shadow-xl border border-black/20">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-accent-700 hover:bg-black/5 transition-colors font-medium"
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
                className="md:hidden p-2 hover:bg-black/10 transition-colors"
            >
              {isMenuOpen ? (
                <X size={24} className="text-slate-950" />
              ) : (
                <Menu size={24} className="text-slate-950" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="md:hidden pb-4 border-t border-black/20">
            {/* User Info Section */}
            <div className="px-4 py-4 border-b border-black/20 flex items-center gap-3">
              <div className="w-10 h-10 bg-[#14b8a6] flex items-center justify-center text-white font-semibold">
                {getInitial()}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-950">{userName || 'Guest'}</p>
                <p className="text-xs text-slate-700">Your Account</p>
              </div>
            </div>

            {navigationItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 text-slate-950 hover:text-[#12679c] transition-colors font-medium hover:bg-black/5"
              >
                {item.label}
              </Link>
            ))}
            <div className="px-4 py-3 border-t border-black/20">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-accent-700 hover:bg-black/5 transition-colors font-medium"
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
