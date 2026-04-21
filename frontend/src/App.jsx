import React, { useEffect, useState, useContext, createContext } from 'react';
import { Routes, Route, Navigate, useNavigate, useParams, useLocation, useSearchParams } from 'react-router-dom';

const API_BASE = '/api';

// Basket Context
const BasketContext = createContext();

function useBasket() {
  const [basket, setBasket] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('madverseBasket') || '[]');
    } catch {
      return [];
    }
  });

  const addToBasket = (item) => {
    const newBasket = [...basket, item];
    setBasket(newBasket);
    localStorage.setItem('madverseBasket', JSON.stringify(newBasket));
  };

  const removeFromBasket = (index) => {
    const itemToRemove = basket[index];
    if (itemToRemove) {
      // Restore stock in events
      try {
        const events = JSON.parse(localStorage.getItem('madverseEvents') || '{}');
        if (events[itemToRemove.eventId] && events[itemToRemove.eventId].ticketTypes) {
          const ticketType = events[itemToRemove.eventId].ticketTypes[itemToRemove.ticketType];
          if (ticketType) {
            // Restore the available stock
            ticketType.available += itemToRemove.quantity;
            localStorage.setItem('madverseEvents', JSON.stringify(events));
          }
        }
      } catch (error) {
        console.error('Error restoring stock:', error);
      }
    }

    const newBasket = basket.filter((_, i) => i !== index);
    setBasket(newBasket);
    localStorage.setItem('madverseBasket', JSON.stringify(newBasket));
  };

  const clearBasket = () => {
    // Restore stock for all items in basket
    try {
      const events = JSON.parse(localStorage.getItem('madverseEvents') || '{}');
      let hasChanges = false;

      basket.forEach(item => {
        if (events[item.eventId] && events[item.eventId].ticketTypes) {
          const ticketType = events[item.eventId].ticketTypes[item.ticketType];
          if (ticketType) {
            // Restore the available stock
            ticketType.available += item.quantity;
            hasChanges = true;
          }
        }
      });

      if (hasChanges) {
        localStorage.setItem('madverseEvents', JSON.stringify(events));
      }
    } catch (error) {
      console.error('Error clearing basket stock:', error);
    }

    setBasket([]);
    localStorage.removeItem('madverseBasket');
  };

  return { basket, addToBasket, removeFromBasket, clearBasket };
}

// Events Context - for managing festival events
const EventsContext = createContext();

function useEvents() {
  const [events, setEvents] = useState(() => {
    try {
      const stored = localStorage.getItem('madverseEvents');
      if (stored) {
        return JSON.parse(stored);
      }
      // Default events if none exist - with ticket types and stock
      return {
        1: { 
          name: 'E MARTÉ', 
          price: 300, 
          zones: ['VIP - 500€', 'Standard - 350€', 'General - 300€'], 
          description: 'Deep Space Pristhina - Tuesday',
          ticketTypes: {
            vip: { name: 'VIP', price: 500, stock: 20, available: 20 },
            group: { name: 'Group of 4', price: 1200, stock: 30, available: 30 },
            standard: { name: 'Standard', price: 300, stock: 200, available: 200 }
          }
        },
        2: { 
          name: 'E MERKURÉ', 
          price: 300, 
          zones: ['VIP - 500€', 'Standard - 350€', 'General - 300€'], 
          description: 'Deep Space Pristhina - Wednesday',
          ticketTypes: {
            vip: { name: 'VIP', price: 500, stock: 20, available: 20 },
            group: { name: 'Group of 4', price: 1200, stock: 30, available: 30 },
            standard: { name: 'Standard', price: 300, stock: 200, available: 200 }
          }
        },
        3: { 
          name: 'Event You Don\'t Wanna Miss', 
          price: 800, 
          zones: ['VIP - 1200€', 'General - 800€'], 
          description: 'An event you don\'t wanna miss',
          ticketTypes: {
            vip: { name: 'VIP', price: 1200, stock: 20, available: 20 },
            group: { name: 'Group of 4', price: 2800, stock: 40, available: 40 },
            standard: { name: 'Standard', price: 800, stock: 300, available: 300 }
          }
        },
        4: { 
          name: 'E ENJTE', 
          price: 300, 
          zones: ['VIP - 500€', 'Standard - 350€', 'General - 300€'], 
          description: 'Deep Space Pristhina - Thursday',
          ticketTypes: {
            vip: { name: 'VIP', price: 500, stock: 20, available: 20 },
            group: { name: 'Group of 4', price: 1200, stock: 30, available: 30 },
            standard: { name: 'Standard', price: 300, stock: 200, available: 200 }
          }
        },
        5: { 
          name: 'E PREMTE', 
          price: 300, 
          zones: ['VIP - 500€', 'Standard - 350€', 'General - 300€'], 
          description: 'Deep Space Pristhina - Friday',
          ticketTypes: {
            vip: { name: 'VIP', price: 500, stock: 20, available: 20 },
            group: { name: 'Group of 4', price: 1200, stock: 30, available: 30 },
            standard: { name: 'Standard', price: 300, stock: 200, available: 200 }
          }
        },
        6: { 
          name: 'E SHTUNE', 
          price: 300, 
          zones: ['VIP - 500€', 'Standard - 350€', 'General - 300€'], 
          description: 'Deep Space Pristhina - Saturday',
          ticketTypes: {
            vip: { name: 'VIP', price: 500, stock: 20, available: 20 },
            group: { name: 'Group of 4', price: 1200, stock: 30, available: 30 },
            standard: { name: 'Standard', price: 300, stock: 200, available: 200 }
          }
        },
        7: { 
          name: 'E DIELË', 
          price: 300, 
          zones: ['VIP - 500€', 'Standard - 350€', 'General - 300€'], 
          description: 'Deep Space Pristhina - Sunday',
          ticketTypes: {
            vip: { name: 'VIP', price: 500, stock: 20, available: 20 },
            group: { name: 'Group of 4', price: 1200, stock: 30, available: 30 },
            standard: { name: 'Standard', price: 300, stock: 200, available: 200 }
          }
        },
        8: { 
          name: 'ANA CARLA MAZA', 
          price: 1000, 
          zones: ['VIP - 1500€', 'Standard - 1000€', 'General - 800€'], 
          description: 'Ana Carla Maza Live',
          ticketTypes: {
            vip: { name: 'VIP', price: 1500, stock: 50, available: 50 },
            group: { name: 'Group of 4', price: 3600, stock: 60, available: 60 },
            standard: { name: 'Standard', price: 800, stock: 400, available: 400 }
          }
        },
        9: { 
          name: 'Cactus in the Snow', 
          price: 2500, 
          zones: ['VIP - 4000€', 'Standard - 2500€', 'General - 1500€'], 
          description: 'Cactus in the Snow',
          ticketTypes: {
            vip: { name: 'VIP', price: 4000, stock: 30, available: 30 },
            group: { name: 'Group of 4', price: 9000, stock: 50, available: 50 },
            standard: { name: 'Standard', price: 1500, stock: 500, available: 500 }
          }
        },
        10: { 
          name: 'PETER PAN QUARTET', 
          price: 300, 
          zones: ['Standard - 400€', 'General - 300€'], 
          description: 'Peter Pan Quartet',
          ticketTypes: {
            group: { name: 'Group of 4', price: 1200, stock: 40, available: 40 },
            standard: { name: 'Standard', price: 300, stock: 250, available: 250 }
          }
        },
        11: { 
          name: 'DURIM', 
          price: 20000, 
          zones: ['VIP - 30000€', 'Standard - 20000€'], 
          description: 'DURIM Concert',
          ticketTypes: {
            vip: { name: 'VIP', price: 30000, stock: 15, available: 15 },
            group: { name: 'Group of 4', price: 72000, stock: 20, available: 20 },
            standard: { name: 'Standard', price: 20000, stock: 150, available: 150 }
          }
        },
        12: { 
          name: 'Muse-X Festival', 
          price: 2500, 
          zones: ['VIP - 4500€', 'Standard - 2500€', 'General - 1500€', 'Student - 1000€'], 
          description: 'Muse-X Festival 2 Day',
          ticketTypes: {
            vip: { name: 'VIP', price: 4500, stock: 100, available: 100 },
            group: { name: 'Group of 4', price: 10000, stock: 150, available: 150 },
            standard: { name: 'Standard', price: 2500, stock: 1000, available: 1000 }
          }
        },
        13: { 
          name: 'LYREL.CS', 
          price: 3100, 
          zones: ['Standard - 4000€', 'General - 3100€'], 
          description: 'LYREL.CS Live',
          ticketTypes: {
            group: { name: 'Group of 4', price: 12000, stock: 50, available: 50 },
            standard: { name: 'Standard', price: 3100, stock: 400, available: 400 }
          }
        },
        14: { 
          name: 'EXHALE TIBANA', 
          price: 800, 
          zones: ['VIP - 1200€', 'Standard - 900€', 'General - 800€'], 
          description: 'Exhale Tibana',
          ticketTypes: {
            vip: { name: 'VIP', price: 1200, stock: 25, available: 25 },
            group: { name: 'Group of 4', price: 3000, stock: 35, available: 35 },
            standard: { name: 'Standard', price: 800, stock: 300, available: 300 }
          }
        },
        15: { 
          name: 'Stand UPR 2nd Edition', 
          price: 2800, 
          zones: ['Standard - 3200€', 'General - 2800€'], 
          description: 'Stand Up Comedy',
          ticketTypes: {
            group: { name: 'Group of 4', price: 10000, stock: 40, available: 40 },
            standard: { name: 'Standard', price: 2800, stock: 350, available: 350 }
          }
        },
        16: { 
          name: 'MARCEL DETTMANN - RAVE', 
          price: 1500, 
          zones: ['VIP - 2000€', 'Standard - 1500€', 'General - 1000€'], 
          description: 'Marcel Dettmann Rave',
          ticketTypes: {
            vip: { name: 'VIP', price: 2000, stock: 35, available: 35 },
            group: { name: 'Group of 4', price: 5000, stock: 60, available: 60 },
            standard: { name: 'Standard', price: 1500, stock: 400, available: 400 }
          }
        }
      };
    } catch {
      return {};
    }
  });

  const addEvent = (event) => {
    const newId = Math.max(0, ...Object.keys(events).map(Number)) + 1;
    const newEvents = { ...events, [newId]: event };
    setEvents(newEvents);
    localStorage.setItem('madverseEvents', JSON.stringify(newEvents));
    return newId;
  };

  const updateEvent = (id, updatedEvent) => {
    const newEvents = { ...events, [id]: updatedEvent };
    setEvents(newEvents);
    localStorage.setItem('madverseEvents', JSON.stringify(newEvents));
  };

  const deleteEvent = (id) => {
    const newEvents = { ...events };
    delete newEvents[id];
    setEvents(newEvents);
    localStorage.setItem('madverseEvents', JSON.stringify(newEvents));
  };

  return { events, addEvent, updateEvent, deleteEvent };
}

// Auth Context - for managing user authentication
const AuthContext = createContext();

function useAuth() {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = decodeJwtToken(token);
      return decoded || null;
    }
    return null;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const register = async (email, password, name) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Registration failed');
        setLoading(false);
        return false;
      }
      if (data.token) {
        localStorage.setItem('token', data.token);
        const decoded = decodeJwtToken(data.token);
        setUser(decoded || { email, name });
        setLoading(false);
        return true;
      }
      setLoading(false);
      return false;
    } catch (err) {
      setError('Network error during registration');
      setLoading(false);
      return false;
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Login failed');
        setLoading(false);
        return false;
      }
      if (data.token) {
        localStorage.setItem('token', data.token);
        const decoded = decodeJwtToken(data.token);
        setUser(decoded || { email });
        setLoading(false);
        return true;
      }
      setLoading(false);
      return false;
    } catch (err) {
      setError('Network error during login');
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    setUser(null);
    setError('');
  };

  return { user, loading, error, register, login, logout };
}

function decodeJwtToken(token) {
  try {
    const [, payload] = token.split('.');
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function getToken() {
  return localStorage.getItem('token');
}

function setToken(token) {
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
}

function setIsAdminFlag(isAdmin) {
  if (isAdmin) localStorage.setItem('isAdmin', 'true');
  else localStorage.removeItem('isAdmin');
}

function isAdminClient() {
  const token = getToken();
  if (!token) return false;
  const decoded = decodeJwtToken(token);
  return decoded?.isAdmin === true;
}

function ProtectedRoute({ children, requireAdmin = false }) {
  const token = getToken();
  if (!token) {
    return <Navigate to="/" replace />;
  }
  if (requireAdmin && !isAdminClient()) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function LoginPage() {
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!email || !password) {
      setFormError('Please fill in all fields');
      return;
    }

    const success = await login(email, password);
    if (success) {
      navigate('/events');
    } else {
      setFormError(error || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-madverse-dark flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <span className="text-black font-bold text-lg">M</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold font-display text-white mb-2">MADVERSE</h1>
          <p className="text-gray-400 font-body">Sign in to your account</p>
        </div>

        <div className="bg-madverse-darker border border-gray-700 rounded-lg p-8 space-y-6">
          {formError && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded font-body text-sm">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-300 font-body text-sm mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-madverse-dark border border-gray-700 text-white px-4 py-3 rounded font-body focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-body text-sm mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-madverse-dark border border-gray-700 text-white px-4 py-3 rounded font-body focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="••••••••"
              />
              <div className="text-right mt-2">
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-purple-400 hover:text-purple-300 text-sm font-body transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white font-body font-semibold py-3 rounded uppercase tracking-wide transition-colors"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-madverse-darker text-gray-500 font-body">or</span>
            </div>
          </div>

          <p className="text-center text-gray-400 font-body">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
            >
              Create one
            </button>
          </p>
        </div>

        <p className="text-center text-gray-500 text-xs font-body mt-4">
          Demo: Use any email/password to register
        </p>
      </div>
    </div>
  );
}

function RegisterPage() {
  const navigate = useNavigate();
  const { register, loading, error } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name || !email || !password || !confirmPassword) {
      setFormError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    const success = await register(email, password, name);
    if (success) {
      navigate('/events');
    } else {
      setFormError(error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-madverse-dark flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <span className="text-black font-bold text-lg">M</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold font-display text-white mb-2">MADVERSE</h1>
          <p className="text-gray-400 font-body">Create your account</p>
        </div>

        <div className="bg-madverse-darker border border-gray-700 rounded-lg p-8 space-y-6">
          {formError && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded font-body text-sm">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-300 font-body text-sm mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-madverse-dark border border-gray-700 text-white px-4 py-3 rounded font-body focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-body text-sm mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-madverse-dark border border-gray-700 text-white px-4 py-3 rounded font-body focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-body text-sm mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-madverse-dark border border-gray-700 text-white px-4 py-3 rounded font-body focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-gray-300 font-body text-sm mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-madverse-dark border border-gray-700 text-white px-4 py-3 rounded font-body focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white font-body font-semibold py-3 rounded uppercase tracking-wide transition-colors"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-madverse-darker text-gray-500 font-body">or</span>
            </div>
          </div>

          <p className="text-center text-gray-400 font-body">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
            >
              Sign in
            </button>
          </p>
        </div>

        <p className="text-center text-gray-500 text-xs font-body mt-4">
          By creating an account, you agree to our terms
        </p>
      </div>
    </div>
  );
}

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('If an account exists with this email, you will receive a password reset link shortly.');
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(data.message || 'Failed to send reset link');
      }
    } catch (err) {
      setError('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-madverse-dark flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <span className="text-black font-bold text-lg">M</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold font-display text-white mb-2">MADVERSE</h1>
          <p className="text-gray-400 font-body">Reset your password</p>
        </div>

        <div className="bg-madverse-darker border border-gray-700 rounded-lg p-8 space-y-6">
          {message && (
            <div className="bg-green-500/20 border border-green-500 text-green-200 p-4 rounded font-body text-sm">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded font-body text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-300 font-body text-sm mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-madverse-dark border border-gray-700 text-white px-4 py-3 rounded font-body focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="your@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white font-body font-semibold py-3 rounded uppercase tracking-wide transition-colors"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <p className="text-center text-gray-400 font-body">
            Remember your password?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Verify token is valid
    if (!token) {
      setError('Invalid reset link. Missing token.');
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch(`${API_BASE}/auth/verify-reset-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });

        if (!response.ok) {
          setError('Reset link has expired or is invalid. Please request a new one.');
        }
      } catch (err) {
        setError('Error verifying reset token.');
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Password reset successful! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (err) {
      setError('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-madverse-dark flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <span className="text-black font-bold text-lg">M</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold font-display text-white mb-2">MADVERSE</h1>
          <p className="text-gray-400 font-body">Create a new password</p>
        </div>

        <div className="bg-madverse-darker border border-gray-700 rounded-lg p-8 space-y-6">
          {message && (
            <div className="bg-green-500/20 border border-green-500 text-green-200 p-4 rounded font-body text-sm">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded font-body text-sm">
              {error}
            </div>
          )}

          {!error && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-300 font-body text-sm mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-madverse-dark border border-gray-700 text-white px-4 py-3 rounded font-body focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-body text-sm mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-madverse-dark border border-gray-700 text-white px-4 py-3 rounded font-body focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white font-body font-semibold py-3 rounded uppercase tracking-wide transition-colors"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          <p className="text-center text-gray-400 font-body text-sm">
            <button
              onClick={() => navigate('/login')}
              className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
            >
              Back to login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function DashboardPage() {
  const [dashData, setDashData] = useState(null);
  const [eventTickets, setEventTickets] = useState([]);
  const [error, setError] = useState('');
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleteConfirmPartnerId, setDeleteConfirmPartnerId] = useState(null);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    image: null, 
    imagePreview: null,
    ticketTypes: {
      vip: { name: 'VIP', enabled: false, price: '', stock: '' },
      group: { name: 'Group of 4', enabled: false, price: '', stock: '' },
      standard: { name: 'Standard', enabled: false, price: '', stock: '' }
    }
  });
  
  // Object Map states
  const [showObjectMapModal, setShowObjectMapModal] = useState(false);
  const [selectedEventForMap, setSelectedEventForMap] = useState(null);
  const [mapLayoutType, setMapLayoutType] = useState('cinema'); // cinema or festival
  const [mapRows, setMapRows] = useState(5);
  const [mapCols, setMapCols] = useState(8);
  const [mapSeats, setMapSeats] = useState([]); // Array of seat objects
  const [selectedSeatType, setSelectedSeatType] = useState('vip'); // Type to assign to clicked seats
  
  // Partners state
  const [partners, setPartners] = useState([]);
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [editingPartnerId, setEditingPartnerId] = useState(null);
  const [partnerFormData, setPartnerFormData] = useState({ name: '', logo_url: '', link: '', description: '', logoPreview: '' });

  const { events, addEvent, updateEvent, deleteEvent } = useEvents();

  useEffect(() => {
    async function loadDashboard() {
      try {
        const token = getToken();
        
        // Fetch summary data
        const summaryRes = await fetch(`${API_BASE}/dashboard/summary`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (summaryRes.ok) {
          const summaryData = await summaryRes.json();
          setDashData(summaryData);
        }

        // Fetch events data
        const eventsRes = await fetch(`${API_BASE}/dashboard/events`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          setEventTickets(eventsData);
        }

        // Fetch partners
        const partnersRes = await fetch(`${API_BASE}/partners`);
        if (partnersRes.ok) {
          const partnersData = await partnersRes.json();
          setPartners(partnersData);
        }
      } catch (err) {
        console.error('Dashboard load error:', err);
        setError('Failed to load dashboard data');
      }
    }

    loadDashboard();
    
    // Refresh dashboard data every 10 seconds for real-time updates
    const interval = setInterval(loadDashboard, 10000);
    
    return () => clearInterval(interval);
  }, []);

  // Calculate totals from fetched data
  const totalTicketsCapacity = eventTickets.reduce((sum, e) => sum + (e.total || 0), 0);
  const totalTicketsSold = eventTickets.reduce((sum, e) => sum + (e.sold || 0), 0);
  const totalRevenue = eventTickets.reduce((sum, e) => sum + parseFloat(e.revenue || 0), 0);
  const ticketPercentage = dashData?.occupancyPercentage || (totalTicketsCapacity > 0 ? ((totalTicketsSold / totalTicketsCapacity) * 100).toFixed(1) : 0);
  const activeMembers = dashData?.activeMembers || 0;

  const StatCard = ({ icon, title, value, subtitle, color }) => (
    <div className="bg-madverse-darker border border-gray-700 rounded-lg p-6 hover:border-purple-500 transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 font-body text-sm mb-2">{title}</p>
          <p className={`text-3xl font-bold font-display ${color}`}>{value}</p>
          {subtitle && <p className="text-gray-500 font-body text-xs mt-2">{subtitle}</p>}
        </div>
        <div className={`text-2xl ${color}`}>{icon}</div>
      </div>
    </div>
  );

  // Partner Handlers
  const handleOpenPartnerModal = (partner = null) => {
    if (partner) {
      setPartnerFormData({ name: partner.name, logo_url: partner.logo_url || '', link: partner.link || '', description: partner.description || '', logoPreview: partner.logo_url || '' });
      setEditingPartnerId(partner.id);
    } else {
      setPartnerFormData({ name: '', logo_url: '', link: '', description: '', logoPreview: '' });
      setEditingPartnerId(null);
    }
    setShowPartnerModal(true);
  };

  const handleClosePartnerModal = () => {
    setShowPartnerModal(false);
    setPartnerFormData({ name: '', logo_url: '', link: '', description: '', logoPreview: '' });
    setEditingPartnerId(null);
  };

  const handlePartnerImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPartnerFormData({ ...partnerFormData, logo_url: reader.result, logoPreview: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePartnerSubmit = async () => {
    try {
      const token = getToken();
      const method = editingPartnerId ? 'PUT' : 'POST';
      const url = editingPartnerId ? `${API_BASE}/partners/${editingPartnerId}` : `${API_BASE}/partners`;
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(partnerFormData)
      });

      if (res.ok) {
        showNotification(`Partner ${editingPartnerId ? 'updated' : 'created'} successfully`);
        handleClosePartnerModal();
        // Refresh partners
        const partnersRes = await fetch(`${API_BASE}/partners`);
        if (partnersRes.ok) {
          const partnersData = await partnersRes.json();
          setPartners(partnersData);
        }
      } else {
        const errorData = await res.json();
        showNotification(errorData.message || 'Failed to save partner', 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification('An error occurred while saving the partner', 'error');
    }
  };

  const handleDeletePartner = async (id) => {
    setDeleteConfirmPartnerId(null);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/partners/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showNotification('Partner deleted successfully');
        setPartners(partners.filter(p => p.id !== id));
      } else {
        showNotification('Failed to delete partner', 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification('An error occurred while deleting the partner', 'error');
    }
  };

  const handleOpenModal = (eventId = null) => {
    if (eventId && events[eventId]) {
      const event = events[eventId];
      const ticketTypes = {
        vip: { name: 'VIP', enabled: !!event.ticketTypes?.vip?.price, price: event.ticketTypes?.vip?.price || '', stock: event.ticketTypes?.vip?.stock || '' },
        group: { name: 'Group of 4', enabled: !!event.ticketTypes?.group?.price, price: event.ticketTypes?.group?.price || '', stock: event.ticketTypes?.group?.stock || '' },
        standard: { name: 'Standard', enabled: !!event.ticketTypes?.standard?.price, price: event.ticketTypes?.standard?.price || '', stock: event.ticketTypes?.standard?.stock || '' }
      };
      setFormData({
        name: event.name,
        description: event.description,
        image: event.image || null,
        imagePreview: event.image || null,
        ticketTypes
      });
      setEditingEventId(eventId);
    } else {
      setFormData({ 
        name: '', 
        description: '', 
        image: null, 
        imagePreview: null,
        ticketTypes: {
          vip: { name: 'VIP', enabled: false, price: '', stock: '' },
          group: { name: 'Group of 4', enabled: false, price: '', stock: '' },
          standard: { name: 'Standard', enabled: false, price: '', stock: '' }
        }
      });
      setEditingEventId(null);
    }
    setShowEventModal(true);
  };

  const handleCloseModal = () => {
    setShowEventModal(false);
    setFormData({ 
      name: '', 
      description: '', 
      image: null, 
      imagePreview: null,
      ticketTypes: {
        vip: { name: 'VIP', enabled: false, price: '', stock: '' },
        group: { name: 'Group of 4', enabled: false, price: '', stock: '' },
        standard: { name: 'Standard', enabled: false, price: '', stock: '' }
      }
    });
    setEditingEventId(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result, imagePreview: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEvent = () => {
    if (!formData.name || !formData.description) {
      showNotification('Please fill in event name and description', 'error');
      return;
    }

    // Check if at least one ticket type is enabled
    const enabledTypes = Object.values(formData.ticketTypes).filter(t => t.enabled);
    if (enabledTypes.length === 0) {
      showNotification('Please enable at least one ticket type', 'error');
      return;
    }

    // Validate ticket type prices and stock
    for (const type of enabledTypes) {
      if (!type.price || type.price <= 0) {
        showNotification(`Please enter a valid price for ${type.name}`, 'error');
        return;
      }
      if (!type.stock || type.stock <= 0) {
        showNotification(`Please enter valid stock for ${type.name}`, 'error');
        return;
      }
    }

    // Build ticket types object
    const ticketTypes = {};
    for (const [key, type] of Object.entries(formData.ticketTypes)) {
      if (type.enabled) {
        ticketTypes[key] = {
          name: type.name,
          price: parseFloat(type.price),
          stock: parseInt(type.stock),
          available: parseInt(type.stock)
        };
      }
    }

    // Calculate base price from ticket types (lowest price)
    const basePrice = Math.min(...enabledTypes.map(t => parseFloat(t.price)));

    const eventData = {
      name: formData.name,
      price: basePrice,
      zones: [], // Empty zones - pricing comes from ticket types
      description: formData.description,
      image: formData.image || null,
      ticketTypes
    };

    if (editingEventId) {
      updateEvent(editingEventId, eventData);
      showNotification('Event updated successfully');
    } else {
      addEvent(eventData);
      showNotification('Event created successfully');
    }
    handleCloseModal();
  };

  const handleDeleteEvent = (id) => {
    deleteEvent(id);
    setDeleteConfirmId(null);
    showNotification('Event deleted successfully');
  };

  // Object Map handlers
  const openObjectMapEditor = (eventId) => {
    const event = events[eventId];
    const existingMap = event.seatingLayout || { enabled: false, type: 'cinema', rows: 5, cols: 8, seats: [] };
    
    setSelectedEventForMap(eventId);
    setMapLayoutType(existingMap.type || 'cinema');
    setMapRows(existingMap.rows || 5);
    setMapCols(existingMap.cols || 8);
    setMapSeats(existingMap.seats || generateEmptySeats(existingMap.rows || 5, existingMap.cols || 8));
    setShowObjectMapModal(true);
  };

  const generateEmptySeats = (rows, cols) => {
    const seats = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        seats.push({
          id: `${r}-${c}`,
          row: r,
          col: c,
          type: '', // vip, group, standard
          available: true,
          selectedBy: null
        });
      }
    }
    return seats;
  };

  const regenerateGrid = (rows, cols) => {
    setMapRows(rows);
    setMapCols(cols);
    setMapSeats(generateEmptySeats(rows, cols));
  };

  const handleSeatClick = (seatId) => {
    const seat = mapSeats.find(s => s.id === seatId);
    if (seat) {
      const newSeats = mapSeats.map(s =>
        s.id === seatId ? { ...s, type: s.type === selectedSeatType ? '' : selectedSeatType } : s
      );
      setMapSeats(newSeats);
    }
  };

  const saveObjectMap = () => {
    if (!selectedEventForMap) return;
    
    const event = events[selectedEventForMap];
    const updatedEvent = {
      ...event,
      seatingLayout: {
        enabled: true,
        type: mapLayoutType,
        rows: mapRows,
        cols: mapCols,
        seats: mapSeats
      }
    };
    
    updateEvent(selectedEventForMap, updatedEvent);
    showNotification('Seating layout saved successfully!');
    setShowObjectMapModal(false);
  };

  const clearObjectMap = () => {
    if (!selectedEventForMap) return;
    
    const event = events[selectedEventForMap];
    const updatedEvent = {
      ...event,
      seatingLayout: { enabled: false, seats: [] }
    };
    
    updateEvent(selectedEventForMap, updatedEvent);
    setShowObjectMapModal(false);
    showNotification('Seating layout cleared!');
  };

  return (
    <div className="min-h-screen bg-madverse-dark py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-display text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400 font-body">Real-time event and ticket analytics</p>
        </div>

        {error && <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg mb-6">{error}</div>}

        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon="👥"
            title="Active Members"
            value={activeMembers}
            subtitle="Currently online"
            color="text-green-400"
          />
          <StatCard
            icon="🎫"
            title="Total Tickets Sold"
            value={totalTicketsSold.toLocaleString()}
            subtitle={`of ${totalTicketsCapacity.toLocaleString()} capacity`}
            color="text-blue-400"
          />
          <StatCard
            icon="📊"
            title="Ticket Occupancy"
            value={`${ticketPercentage}%`}
            subtitle="Overall capacity used"
            color="text-purple-400"
          />
          <StatCard
            icon="💰"
            title="Total Revenue"
            value={`€${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            subtitle="All events combined"
            color="text-yellow-400"
          />
        </div>

        {/* Event Breakdown Section */}
        <div className="bg-madverse-darker border border-gray-700 rounded-lg overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-xl font-bold font-display text-white">Event Performance</h2>
            <p className="text-gray-400 font-body text-sm mt-1">Ticket sales and capacity breakdown by event</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-madverse-dark border-b border-gray-700">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Event Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Capacity</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Sold</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Available</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Occupancy</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {eventTickets.map((event, idx) => {
                  const occupancy = ((event.sold / event.total) * 100).toFixed(1);
                  const occupancyColor = occupancy >= 80 ? 'text-green-400' : occupancy >= 60 ? 'text-yellow-400' : 'text-blue-400';
                  return (
                    <tr key={idx} className="border-b border-gray-700 hover:bg-madverse-darker/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">{event.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{event.total}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-400 font-semibold">{event.sold}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{event.total - event.sold}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${occupancy >= 80 ? 'bg-green-500' : occupancy >= 60 ? 'bg-yellow-500' : 'bg-blue-500'}`}
                              style={{ width: `${occupancy}%` }}
                            />
                          </div>
                          <span className={`text-xs font-semibold ${occupancyColor}`}>{occupancy}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-400 font-semibold">€{parseFloat(event.revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Summary Footer */}
          <div className="bg-madverse-dark border-t border-gray-700 px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-8">
            <div>
              <p className="text-gray-400 font-body text-sm">Total across all events</p>
            </div>
            <div className="flex gap-4 sm:gap-8 w-full sm:w-auto">
              <div className="text-right">
                <p className="text-gray-400 font-body text-xs">CAPACITY</p>
                <p className="text-white font-display text-lg">{totalTicketsCapacity.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 font-body text-xs">SOLD</p>
                <p className="text-purple-400 font-display text-lg">{totalTicketsSold.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 font-body text-xs">REVENUE</p>
                <p className="text-yellow-400 font-display text-lg">€{totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Event Management Section */}
        <div className="bg-madverse-darker border border-gray-700 rounded-lg overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold font-display text-white">Event Management</h2>
              <p className="text-gray-400 font-body text-sm mt-1">Create, edit, or delete events</p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="bg-purple-600 hover:bg-purple-700 text-white font-body font-semibold py-2 px-4 rounded uppercase tracking-wide transition-colors"
            >
              + New Event
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-madverse-dark border-b border-gray-700">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Event Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Ticket Types</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(events).map(([id, event]) => {
                  const ticketTypesList = event.ticketTypes ? Object.values(event.ticketTypes).map(t => `${t.name} €${t.price}`).join(', ') : 'No types';
                  return (
                    <tr key={id} className="border-b border-gray-700 hover:bg-madverse-darker/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">{event.name}</td>
                      <td className="px-6 py-4 text-sm text-yellow-400 font-semibold">{ticketTypesList}</td>
                      <td className="px-6 py-4 text-sm text-gray-400 truncate">{event.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => handleOpenModal(id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-body text-xs py-1 px-3 rounded transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => openObjectMapEditor(id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-body text-xs py-1 px-3 rounded transition-colors"
                            title="Configure seating map"
                          >
                            🎪 Map
                          </button>
                        <button
                          onClick={() => setDeleteConfirmId(id)}
                          className="bg-red-600 hover:bg-red-700 text-white font-body text-xs py-1 px-3 rounded transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                      {deleteConfirmId === id && (
                        <div className="mt-2 p-2 bg-red-500/20 border border-red-500 rounded">
                          <p className="text-xs text-red-200 mb-2">Confirm deletion?</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDeleteEvent(id)}
                              className="bg-red-600 text-white text-xs py-1 px-2 rounded"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="bg-gray-600 text-white text-xs py-1 px-2 rounded"
                            >
                              No
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Event Modal */}
        {showEventModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-madverse-darker border border-gray-700 rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold font-display text-white mb-6">
                {editingEventId ? 'Edit Event' : 'Create New Event'}
              </h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-gray-300 font-body text-sm mb-2">Event Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-madverse-dark border border-gray-700 text-white px-4 py-2 rounded font-body focus:outline-none focus:border-purple-500"
                    placeholder="e.g., ANA CARLA MAZA"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-body text-sm mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-madverse-dark border border-gray-700 text-white px-4 py-2 rounded font-body focus:outline-none focus:border-purple-500"
                    placeholder="e.g., Ana Carla Maza Live"
                    rows={3}
                  />
                </div>

                {/* Ticket Types Management */}
                <div className="bg-madverse-dark border border-gray-700 rounded-lg p-4">
                  <label className="block text-gray-300 font-body text-sm mb-4 font-semibold">Ticket Types</label>
                  <div className="space-y-3">
                    {Object.entries(formData.ticketTypes).map(([key, type]) => (
                      <div key={key} className="p-3 border border-gray-700 rounded bg-black/30">
                        <div className="flex items-center gap-3 mb-3">
                          <input
                            type="checkbox"
                            checked={type.enabled}
                            onChange={(e) => setFormData({
                              ...formData,
                              ticketTypes: {
                                ...formData.ticketTypes,
                                [key]: { ...type, enabled: e.target.checked }
                              }
                            })}
                            className="w-4 h-4 cursor-pointer"
                          />
                          <span className="text-white font-body font-semibold">{type.name}</span>
                        </div>

                        {type.enabled && (
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-gray-400 font-body text-xs mb-1 block">Price (€)</label>
                              <input
                                type="number"
                                value={type.price}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  ticketTypes: {
                                    ...formData.ticketTypes,
                                    [key]: { ...type, price: e.target.value }
                                  }
                                })}
                                className="w-full bg-madverse-dark border border-gray-600 text-white px-2 py-1 rounded text-sm font-body focus:outline-none focus:border-purple-500"
                                placeholder="e.g., 500"
                              />
                            </div>
                            <div>
                              <label className="text-gray-400 font-body text-xs mb-1 block">Stock</label>
                              <input
                                type="number"
                                value={type.stock}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  ticketTypes: {
                                    ...formData.ticketTypes,
                                    [key]: { ...type, stock: e.target.value }
                                  }
                                })}
                                className="w-full bg-madverse-dark border border-gray-600 text-white px-2 py-1 rounded text-sm font-body focus:outline-none focus:border-purple-500"
                                placeholder="e.g., 20"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 font-body text-sm mb-2">Event Image</label>
                  <div className="space-y-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full bg-madverse-dark border border-gray-700 text-gray-400 px-4 py-2 rounded font-body focus:outline-none focus:border-purple-500"
                    />
                    {formData.imagePreview && (
                      <div className="relative w-full h-48 rounded overflow-hidden border border-gray-700">
                        <img src={formData.imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleCloseModal}
                  className="bg-gray-700 hover:bg-gray-600 text-white font-body font-semibold py-2 px-6 rounded uppercase transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEvent}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-body font-semibold py-2 px-6 rounded uppercase transition-colors"
                >
                  {editingEventId ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* OBJECT MAP Modal */}
        {showObjectMapModal && selectedEventForMap && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-madverse-darker border border-gray-700 rounded-lg p-6 max-w-4xl w-full my-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold font-display text-white">🎪 OBJECT MAP - {events[selectedEventForMap]?.name}</h2>
                <button onClick={() => setShowObjectMapModal(false)} className="text-gray-400 hover:text-white text-2xl">✕</button>
              </div>

              <div className="space-y-6">
                {/* Layout Type Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-300 font-body text-sm mb-2">Layout Type</label>
                    <select
                      value={mapLayoutType}
                      onChange={(e) => setMapLayoutType(e.target.value)}
                      className="w-full bg-madverse-dark border border-gray-600 text-white px-3 py-2 rounded font-body focus:outline-none focus:border-purple-500"
                    >
                      <option value="cinema">🎬 Cinema (Assigned Seats)</option>
                      <option value="festival">🎪 Festival (Open Ground)</option>
                      <option value="vip_section">VIP Sections</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 font-body text-sm mb-2">Rows</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={mapRows}
                      onChange={(e) => regenerateGrid(parseInt(e.target.value), mapCols)}
                      className="w-full bg-madverse-dark border border-gray-600 text-white px-3 py-2 rounded font-body focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-body text-sm mb-2">Columns</label>
                    <input
                      type="number"
                      min="1"
                      max="15"
                      value={mapCols}
                      onChange={(e) => regenerateGrid(mapRows, parseInt(e.target.value))}
                      className="w-full bg-madverse-dark border border-gray-600 text-white px-3 py-2 rounded font-body focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Seat Type Selection */}
                <div>
                  <label className="block text-gray-300 font-body text-sm mb-3">🪑 Click seats to assign type (or click again to remove)</label>
                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() => setSelectedSeatType('vip')}
                      className={`px-4 py-2 rounded font-body font-semibold transition-colors ${selectedSeatType === 'vip' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                      VIP
                    </button>
                    <button
                      onClick={() => setSelectedSeatType('standard')}
                      className={`px-4 py-2 rounded font-body font-semibold transition-colors ${selectedSeatType === 'standard' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                      Standard
                    </button>
                    <button
                      onClick={() => setSelectedSeatType('group')}
                      className={`px-4 py-2 rounded font-body font-semibold transition-colors ${selectedSeatType === 'group' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                      Group of 4
                    </button>
                  </div>
                </div>

                {/* Grid Editor */}
                <div className="bg-madverse-dark rounded-lg p-6 border border-gray-700 overflow-x-auto">
                  <div className="grid gap-2 inline-grid" style={{ gridTemplateColumns: `repeat(${mapCols}, minmax(40px, 1fr))`, rowGap: '8px', columnGap: '8px' }}>
                    {mapSeats.map((seat) => {
                      const seatColorMap = {
                        vip: 'bg-purple-600 hover:bg-purple-700',
                        standard: 'bg-blue-600 hover:bg-blue-700',
                        group: 'bg-green-600 hover:bg-green-700',
                        '': 'bg-gray-700 hover:bg-gray-600'
                      };
                      const color = seatColorMap[seat.type] || seatColorMap[''];
                      
                      return (
                        <button
                          key={seat.id}
                          onClick={() => handleSeatClick(seat.id)}
                          className={`w-10 h-10 rounded text-xs font-bold text-white transition-all ${color} flex items-center justify-center`}
                          title={`Row ${seat.row + 1}, Seat ${String.fromCharCode(65 + seat.col)} - ${seat.type || 'Empty'}`}
                        >
                          {seat.type ? (seat.type === 'vip' ? '👑' : seat.type === 'standard' ? '🎫' : '👥') : ''}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-madverse-dark rounded-lg p-4 border border-gray-700">
                  <div className="text-center">
                    <p className="text-gray-400 font-body text-sm mb-1">Total Seats</p>
                    <p className="text-xl font-bold font-display text-white">{mapSeats.length}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 font-body text-sm mb-1">VIP Seats</p>
                    <p className="text-xl font-bold font-display text-purple-400">{mapSeats.filter(s => s.type === 'vip').length}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 font-body text-sm mb-1">Other Seats</p>
                    <p className="text-xl font-bold font-display text-blue-400">{mapSeats.filter(s => s.type && s.type !== 'vip').length}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowObjectMapModal(false)}
                    className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-body font-semibold rounded transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={clearObjectMap}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-body font-semibold rounded transition-colors"
                  >
                    Clear Map
                  </button>
                  <button
                    onClick={saveObjectMap}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-body font-semibold rounded transition-colors"
                  >
                    Save Map
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Partners Management Section */}
        <div className="bg-madverse-darker border border-gray-700 rounded-lg p-6 mb-8 mt-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold font-display text-white">Partners Management</h2>
              <p className="text-gray-400 font-body text-sm mt-1">Manage the partners displayed on the Partners page</p>
            </div>
            <button
              onClick={() => handleOpenPartnerModal()}
              className="bg-purple-600 hover:bg-purple-700 text-white font-body font-semibold py-2 px-4 rounded uppercase tracking-wide transition-colors"
            >
              + Add Partner
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-madverse-dark border-b border-gray-700">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Logo & Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Website</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {partners.map(partner => (
                  <tr key={partner.id} className="border-b border-gray-700 hover:bg-madverse-darker/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white flex items-center gap-3">
                      {partner.logo_url && (
                        <img src={partner.logo_url} alt={partner.name} className="w-10 h-10 rounded-full object-cover border border-gray-600" />
                      )}
                      <span>{partner.name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 pointer-events-none">
                      <a href={partner.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline pointer-events-auto">
                        {partner.link}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      <p className="line-clamp-1">{partner.description}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => handleOpenPartnerModal(partner)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-body text-xs py-1 px-3 rounded transition-colors pointer-events-auto"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirmPartnerId(partner.id)}
                          className="bg-red-600 hover:bg-red-700 text-white font-body text-xs py-1 px-3 rounded transition-colors pointer-events-auto"
                        >
                          Delete
                        </button>
                      </div>
                      {deleteConfirmPartnerId === partner.id && (
                        <div className="mt-2 p-2 bg-red-500/20 border border-red-500 rounded">
                          <p className="text-xs text-red-200 mb-2">Confirm deletion?</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDeletePartner(partner.id)}
                              className="bg-red-600 text-white text-xs py-1 px-2 rounded"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setDeleteConfirmPartnerId(null)}
                              className="bg-gray-600 text-white text-xs py-1 px-2 rounded"
                            >
                              No
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {partners.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500 font-body">No partners found. Add your first partner!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Partner Modal */}
        {showPartnerModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
            <div className="bg-madverse-darker border border-gray-700 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto relative">
              <h2 className="text-xl font-bold font-display text-white mb-4">
                {editingPartnerId ? 'Edit Partner' : 'Add Partner'}
              </h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-gray-400 text-sm font-bold mb-2">Partner Name *</label>
                  <input
                    type="text"
                    value={partnerFormData.name}
                    onChange={(e) => setPartnerFormData({...partnerFormData, name: e.target.value})}
                    className="w-full bg-black/30 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    placeholder="e.g. RedBull"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm font-bold mb-2">Partner Logo</label>
                  <div className="space-y-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePartnerImageUpload}
                      className="w-full bg-black/30 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    />
                    {partnerFormData.logoPreview && (
                      <div className="relative w-32 h-32 rounded overflow-hidden border border-gray-700 bg-black/50 mx-auto">
                        <img src={partnerFormData.logoPreview} alt="Logo Preview" className="w-full h-full object-contain" />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm font-bold mb-2">Website Link</label>
                  <input
                    type="url"
                    value={partnerFormData.link}
                    onChange={(e) => setPartnerFormData({...partnerFormData, link: e.target.value})}
                    className="w-full bg-black/30 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    placeholder="https://redbull.com"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm font-bold mb-2">Description</label>
                  <textarea
                    value={partnerFormData.description}
                    onChange={(e) => setPartnerFormData({...partnerFormData, description: e.target.value})}
                    className="w-full bg-black/30 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500 min-h-[80px]"
                    placeholder="Write a short description..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={handleClosePartnerModal}
                  className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePartnerSubmit}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded transition-colors"
                  disabled={!partnerFormData.name}
                >
                  Save Partner
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-madverse-darker border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-bold font-display text-white mb-4">Top Performing Events</h3>
            <div className="space-y-3">
              {eventTickets
                .sort((a, b) => b.sold - a.sold)
                .slice(0, 3)
                .map((event, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-madverse-dark rounded">
                    <span className="font-body text-gray-300">{idx + 1}. {event.name}</span>
                    <span className="text-purple-400 font-bold font-display">{event.sold} tickets</span>
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-madverse-darker border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-bold font-display text-white mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-body text-gray-300">Database</span>
                <span className="text-green-400 font-semibold">✓ Connected</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-body text-gray-300">Payment Gateway</span>
                <span className="text-green-400 font-semibold">✓ Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-body text-gray-300">API Status</span>
                <span className="text-green-400 font-semibold">✓ Operational</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-body text-gray-300">Server Load</span>
                <span className="text-yellow-400 font-semibold">⚠ 65%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div className={`fixed top-10 left-1/2 transform -translate-x-1/2 z-[100] px-8 py-4 rounded-xl shadow-2xl font-body font-bold text-lg text-center min-w-[320px] text-white transition-all duration-300 ${notification.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>
            {notification.message}
          </div>
        )}
      </div>
    </div>
  );
}

function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Open');
  const [priority, setPriority] = useState('Normal');
  const [error, setError] = useState('');

  async function loadTickets() {
    try {
      const res = await fetch(`${API_BASE}/tickets`, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || 'Failed to load tickets');
        return;
      }
      const data = await res.json();
      setTickets(data);
    } catch (err) {
      setError('Network error');
    }
  }

  useEffect(() => {
    loadTickets();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_BASE}/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify({ title, description, status, priority })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || 'Failed to create ticket');
        return;
      }
      setTitle('');
      setDescription('');
      setStatus('Open');
      setPriority('Normal');
      await loadTickets();
    } catch (err) {
      setError('Network error');
    }
  }

  return (
    <div className="min-h-screen bg-madverse-dark p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 font-display">Tickets</h1>
      {error && <div className="text-red-400 bg-red-900/20 p-3 rounded mb-4 text-sm sm:text-base">{error}</div>}

      <form onSubmit={handleCreate} className="bg-madverse-darker border border-gray-700 rounded-lg p-4 sm:p-6 mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 font-display">Create Ticket</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 font-body text-sm sm:text-base mb-2">Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-madverse-dark border border-gray-600 text-white px-3 py-2 rounded text-sm sm:text-base"
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 font-body text-sm sm:text-base mb-2">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-madverse-dark border border-gray-600 text-white px-3 py-2 rounded text-sm sm:text-base"
              rows="4"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 font-body text-sm sm:text-base mb-2">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)} className="w-full bg-madverse-dark border border-gray-600 text-white px-3 py-2 rounded text-sm sm:text-base">
                <option>Open</option>
                <option>In Progress</option>
                <option>Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-300 font-body text-sm sm:text-base mb-2">Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full bg-madverse-dark border border-gray-600 text-white px-3 py-2 rounded text-sm sm:text-base">
                <option>Low</option>
                <option>Normal</option>
                <option>High</option>
              </select>
            </div>
          </div>
          <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-body font-bold py-2 px-4 rounded text-sm sm:text-base mt-4">
            Create
          </button>
        </div>
      </form>

      <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 font-display">All Tickets</h2>
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-700 text-sm sm:text-base">
          <thead className="bg-madverse-dark">
            <tr>
              <th className="border border-gray-700 px-3 py-2 text-left text-gray-300 font-body">Id</th>
              <th className="border border-gray-700 px-3 py-2 text-left text-gray-300 font-body">Title</th>
              <th className="border border-gray-700 px-3 py-2 text-left text-gray-300 font-body">Status</th>
              <th className="border border-gray-700 px-3 py-2 text-left text-gray-300 font-body">Priority</th>
              <th className="border border-gray-700 px-3 py-2 text-left text-gray-300 font-body hidden sm:table-cell">Created</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(t => (
              <tr key={t.Id} className="hover:bg-madverse-dark/50">
                <td className="border border-gray-700 px-3 py-2 text-gray-300">{t.Id}</td>
                <td className="border border-gray-700 px-3 py-2 text-gray-300">{t.Title}</td>
                <td className="border border-gray-700 px-3 py-2 text-gray-300">{t.Status}</td>
                <td className="border border-gray-700 px-3 py-2 text-gray-300">{t.Priority}</td>
                <td className="border border-gray-700 px-3 py-2 text-gray-300 hidden sm:table-cell">{new Date(t.CreatedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Layout({ children }) {
  const navigate = useNavigate();
  const { user, logout: authLogout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const loadUserProfile = async () => {
    setLoadingProfile(true);
    try {
      const profileRes = await fetch(`${API_BASE}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });
      if (profileRes.ok) {
        const profileInfo = await profileRes.json();
        setProfileData(profileInfo);
      }

      const ordersRes = await fetch(`${API_BASE}/auth/orders`, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });
      if (ordersRes.ok) {
        const ordersInfo = await ordersRes.json();
        setOrders(ordersInfo.orders || []);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    }
    setLoadingProfile(false);
  };

  const handleProfileClick = () => {
    setShowProfile(!showProfile);
    if (!showProfile && !profileData) {
      loadUserProfile();
    }
  };

  function logout() {
    authLogout();
    setShowProfile(false);
    navigate('/login');
  }

  return (
    <div>
      <nav className="bg-madverse-darker border-b border-gray-700 px-4 py-3 flex justify-between items-center overflow-x-auto">
        <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-6 text-xs sm:text-sm md:text-base">
          <button onClick={() => navigate('/')} className="text-white font-bold hover:text-purple-400 whitespace-nowrap">Home</button>
          <button onClick={() => navigate('/tickets')} className="text-white hover:text-purple-400 whitespace-nowrap">Tickets</button>
          <button onClick={() => navigate('/checkout')} className="text-white hover:text-purple-400 whitespace-nowrap">Checkout</button>
          {user?.isAdmin && (
            <button onClick={() => navigate('/dashboard')} className="text-white hover:text-purple-400 whitespace-nowrap">Admin</button>
          )}
        </div>
        <div className="flex items-center space-x-4 relative">
          {user && (
            <>
              <button
                onClick={handleProfileClick}
                className="w-10 h-10 bg-purple-600 hover:bg-purple-700 text-white rounded-full flex items-center justify-center font-bold transition-colors"
                title={user.email}
              >
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </button>
              {showProfile && (
                <div className="absolute right-0 top-12 bg-madverse-darker border border-gray-700 rounded-lg shadow-lg w-full sm:w-96 md:w-80 z-50 max-w-xs">
                  <div className="p-4 border-b border-gray-700">
                    {loadingProfile ? (
                      <p className="text-gray-400 text-sm">Loading...</p>
                    ) : profileData ? (
                      <>
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {profileData.firstName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-semibold">{profileData.name}</p>
                            <p className="text-gray-400 text-sm">{profileData.email}</p>
                          </div>
                        </div>
                      </>
                    ) : null}
                  </div>

                  <div className="max-h-64 overflow-y-auto">
                    <div className="p-4">
                      <h3 className="text-white font-semibold mb-3">🎟️ Your Tickets</h3>
                      {orders.length === 0 ? (
                        <p className="text-gray-400 text-sm">No tickets purchased yet</p>
                      ) : (
                        <div className="space-y-3">
                          {orders.map((order) => (
                            <div key={order.orderId} className="bg-madverse-dark rounded p-3 border border-gray-600">
                              <p className="text-purple-400 text-sm font-semibold">Order #{order.orderId}</p>
                              <p className="text-gray-400 text-xs mb-2">{new Date(order.orderDate).toLocaleDateString()}</p>
                              <div className="space-y-1">
                                {order.tickets.map((ticket, idx) => (
                                  <div key={idx} className="text-sm">
                                    <p className="text-white">{ticket.eventTitle}</p>
                                    <p className="text-gray-400 text-xs">Qty: {ticket.quantity} × €{ticket.unitPrice}</p>
                                  </div>
                                ))}
                              </div>
                              <div className="  border-t border-gray-600 mt-2 pt-2">
                                <p className="text-white font-semibold text-sm">Total: €{order.totalAmount}</p>
                                <p className="text-xs capitalize" style={{color: order.status === 'Confirmed' ? '#10b981' : '#f59e0b'}}>{order.status}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-3 border-t border-gray-700">
                    <button
                      onClick={logout}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded text-sm font-semibold transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </nav>
      {children}
    </div>
  );
}

function LandingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { basket } = useBasket();
  const { user, logout: authLogout } = useAuth();

  const [showProfile, setShowProfile] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const loadUserProfile = async () => {
    setLoadingProfile(true);
    try {
      const profileRes = await fetch(`${API_BASE}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });
      if (profileRes.ok) {
        const profileInfo = await profileRes.json();
        setProfileData(profileInfo);
      }

      const ordersRes = await fetch(`${API_BASE}/auth/orders`, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });
      if (ordersRes.ok) {
        const ordersInfo = await ordersRes.json();
        setOrders(ordersInfo.orders || []);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    }
    setLoadingProfile(false);
  };

  const handleProfileClick = () => {
    setShowProfile(!showProfile);
    if (!showProfile && !profileData) {
      loadUserProfile();
    }
  };

  const handleLogout = () => {
    authLogout();
    setShowProfile(false);
    navigate('/login');
  };



  return (
    <>
      {/* Header */}
      <header className="bg-madverse-darker border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3">
                <span className="text-black font-bold text-sm">M</span>
              </div>
              <span className="text-white font-bold text-xl font-festival tracking-wider">MADVERSE</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <button className={`text-sm uppercase font-body font-semibold transition-colors ${location.pathname === '/' ? 'text-purple-400' : 'text-white hover:text-purple-400'}`} onClick={() => navigate('/')}>Home</button>
              <div className="dropdown-container">
                <button className={`text-sm uppercase font-body font-semibold transition-colors ${location.pathname === '/events' ? 'text-purple-400' : 'text-white hover:text-purple-400'}`} onClick={() => navigate('/events')}>Events</button>
                <div className="dropdown-menu"></div>
              </div>
              <button className={`text-sm uppercase font-body font-semibold transition-colors ${location.pathname === '/partners' ? 'text-purple-400' : 'text-white hover:text-purple-400'}`} onClick={() => navigate('/partners')}>Partners</button>
              <button className={`text-sm uppercase font-body font-semibold transition-colors ${location.pathname === '/contact' ? 'text-purple-400' : 'text-white hover:text-purple-400'}`} onClick={() => navigate('/contact')}>Contact</button>
            </nav>
            <div className="flex items-center space-x-4 relative">
              <button
                type="button"
                onClick={() => navigate('/checkout')}
                className="text-sm uppercase font-body font-semibold border border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white px-3 py-1 rounded transition-colors relative"
              >
                🛒 {basket.length > 0 && <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{basket.length}</span>}
              </button>
              {user?.isAdmin && (
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="text-sm uppercase font-body font-semibold border border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white px-3 py-1 rounded transition-colors"
                >
                  Admin Dashboard
                </button>
              )}
              
              {user ? (
                <>
                  <button
                    onClick={handleProfileClick}
                    className="w-10 h-10 bg-purple-600 hover:bg-purple-700 text-white rounded-full flex items-center justify-center font-bold transition-colors"
                    title={user.email}
                  >
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </button>
                  {showProfile && (
                    <div className="absolute right-0 top-12 bg-madverse-darker border border-gray-700 rounded-lg shadow-lg w-full sm:w-96 md:w-80 z-50 max-w-xs">
                      <div className="p-4 border-b border-gray-700">
                        {loadingProfile ? (
                          <p className="text-gray-400 text-sm">Loading...</p>
                        ) : profileData ? (
                          <>
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                {profileData.firstName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-white font-semibold">{profileData.name}</p>
                                <p className="text-gray-400 text-sm">{profileData.email}</p>
                              </div>
                            </div>
                          </>
                        ) : null}
                      </div>

                      <div className="max-h-64 overflow-y-auto">
                        <div className="p-4">
                          <h3 className="text-white font-semibold mb-3">🎟️ Your Tickets</h3>
                          {orders.length === 0 ? (
                            <p className="text-gray-400 text-sm">No tickets purchased yet</p>
                          ) : (
                            <div className="space-y-3">
                              {orders.map((order) => (
                                <div key={order.orderId} className="bg-madverse-dark rounded p-3 border border-gray-600">
                                  <p className="text-purple-400 text-sm font-semibold">Order #{order.orderId}</p>
                                  <p className="text-gray-400 text-xs mb-2">{new Date(order.orderDate).toLocaleDateString()}</p>
                                  <div className="space-y-1">
                                    {order.tickets.map((ticket, idx) => (
                                      <div key={idx} className="text-sm">
                                        <p className="text-white">{ticket.eventTitle}</p>
                                        <p className="text-gray-400 text-xs">Qty: {ticket.quantity} × €{ticket.unitPrice}</p>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="border-t border-gray-600 mt-2 pt-2">
                                    <p className="text-white font-semibold text-sm">Total: €{order.totalAmount}</p>
                                    <p className="text-xs capitalize" style={{color: order.status === 'Confirmed' ? '#10b981' : '#f59e0b'}}>{order.status}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="p-3 border-t border-gray-700">
                        <button
                          onClick={handleLogout}
                          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded text-sm font-semibold transition-colors"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="text-sm uppercase font-body font-semibold border border-white text-white hover:bg-white hover:text-madverse-dark px-3 py-1 rounded transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/register')}
                    className="text-sm uppercase font-body font-semibold bg-purple-600 text-white hover:bg-purple-700 px-3 py-1 rounded transition-colors"
                  >
                    Register
                  </button>
                </>
              )}


            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-bg min-h-screen flex items-center justify-center relative">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 max-w-7xl mx-auto px-4">
          <div className="ticket-3d">
            <div className="ticket-container">
              <div className="ticket-face ticket-front">
                <div className="ticket-logo">
                  <span className="text-madverse-dark font-bold text-xl">M</span>
                </div>
                <div className="ticket-title">MADVERSE</div>
                <div className="ticket-subtitle">Music Art and Dance Festival</div>
              </div>
            </div>
          </div>
          <div className="text-center lg:text-left z-10 max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 font-display tracking-tight">
              Relive the magic of Madverse with the Aftermovie
            </h1>
            <p className="text-xl md:text-2xl mb-8 font-body font-medium">
              A celebration of music, art, and dance - where creativity meets unity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                type="button"
                onClick={() => navigate('/events')}
                className="px-8 py-3 border border-white text-white hover:bg-white hover:text-madverse-dark transition-colors duration-300 rounded flex items-center justify-center space-x-2 font-body font-semibold tracking-wide"
              >
                <span>GET TICKETS</span>
              </button>

            </div>
          </div>
        </div>
      </section>





      {/* Footer */}
      <footer className="mt-16 border-t border-gray-700 py-6 text-center text-sm text-gray-400">
        <p>© {new Date().getFullYear()} Madverse TicketApp. All rights reserved.</p>
      </footer>
    </>
  );
}

function CheckoutPage() {
  const navigate = useNavigate();
  const { basket, removeFromBasket, clearBasket } = useBasket();

  const total = basket.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="min-h-screen bg-madverse-dark">
      {/* Header */}
      <header className="bg-madverse-darker border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="text-purple-400 hover:text-purple-300 text-2xl font-bold"
                title="Go Back"
              >
                ←
              </button>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3">
                  <span className="text-black font-bold text-sm">M</span>
                </div>
                <span className="text-white font-bold text-xl font-festival tracking-wider">MADVERSE</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="text-sm uppercase font-body font-semibold border border-white px-3 py-1 rounded hover:bg-white hover:text-madverse-dark transition-colors"
            >
              Home
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Title */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold font-display text-white mb-2">Checkout</h1>
            <p className="text-gray-400 font-body">Review and confirm your ticket order</p>
          </div>

          {basket.length === 0 ? (
            <div className="bg-madverse-darker border border-gray-700 rounded-lg p-12 text-center">
              <div className="text-6xl mb-4">🛒</div>
              <h2 className="text-2xl font-bold font-display text-white mb-4">Your basket is empty</h2>
              <p className="text-gray-400 font-body mb-8">Add tickets to get started!</p>
              <button
                onClick={() => navigate('/events')}
                className="bg-purple-600 hover:bg-purple-700 text-white font-body font-bold px-8 py-3 rounded uppercase tracking-wide transition-colors"
              >
                Browse Events
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {/* Order Items */}
              <div className="lg:col-span-2">
                <div className="bg-madverse-darker border border-gray-700 rounded-lg overflow-hidden">
                  <div className="px-4 sm:px-6 py-4 border-b border-gray-700 bg-madverse-dark">
                    <h2 className="text-lg sm:text-xl font-bold font-display text-white">Order Summary</h2>
                  </div>

                  <div className="divide-y divide-gray-700">
                    {basket.map((item, idx) => (
                      <div key={idx} className="p-6 hover:bg-madverse-dark/50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold font-display text-white mb-2">{item.eventName}</h3>
                            <div className="space-y-1">
                              <p className="text-gray-400 font-body text-sm">Type: <span className="text-purple-400 font-semibold">{item.ticketTypeName || item.ticketType}</span></p>
                              <p className="text-gray-400 font-body text-sm">Quantity: <span className="text-purple-400 font-semibold">×{item.quantity}</span></p>
                              <p className="text-gray-400 font-body text-sm">Price per ticket: <span className="text-yellow-400 font-semibold">€{item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold font-display text-yellow-400 mb-4">€{item.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            <button
                              onClick={() => removeFromBasket(idx)}
                              className="text-red-400 hover:text-red-300 font-body text-sm font-semibold"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Continue Shopping */}
                <button
                  onClick={() => navigate('/events')}
                  className="mt-6 w-full bg-gray-700 hover:bg-gray-600 text-white font-body font-semibold py-3 rounded uppercase tracking-wide transition-colors"
                >
                  Continue Shopping
                </button>
              </div>

              {/* Order Summary Sidebar */}
              <div>
                <div className="bg-madverse-darker border border-gray-700 rounded-lg p-6 sticky top-20">
                  <h3 className="text-xl font-bold font-display text-white mb-6">Order Total</h3>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-400 font-body">Subtotal</span>
                      <span className="text-white font-semibold">€{total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 font-body">Fees</span>
                      <span className="text-white font-semibold">€0.00</span>
                    </div>
                    <div className="border-t border-gray-700 pt-4 flex justify-between">
                      <span className="text-white font-bold">Total</span>
                      <span className="text-yellow-400 font-bold font-display text-2xl">€{total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch('http://localhost:5000/api/create-checkout-session', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ basket })
                        });
                        const data = await response.json();
                        if (data.url) {
                          window.location.href = data.url;
                        } else {
                          console.error("Failed to create session:", data);
                          alert("Failed to start checkout process.");
                        }
                      } catch (err) {
                        console.error("Payment Error:", err);
                        alert("Payment service unavailable.");
                      }
                    }}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-body font-bold py-3 rounded uppercase tracking-wide transition-colors mb-3"
                  >
                    Proceed to Payment
                  </button>

                  <button
                    onClick={clearBasket}
                    className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-400 font-body font-semibold py-3 rounded uppercase tracking-wide transition-colors"
                  >
                    Clear Basket
                  </button>

                  <div className="mt-6 pt-6 border-t border-gray-700">
                    <p className="text-gray-400 font-body text-xs">
                      ✓ Secure checkout<br/>
                      ✓ SSL encrypted<br/>
                      ✓ Money-back guarantee
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PaymentPage() {
  const navigate = useNavigate();
  const { basket, clearBasket } = useBasket();
  const [cardholderName, setCardholderName] = useState('');
  const [email, setEmail] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const total = basket.reduce((sum, item) => sum + item.total, 0);

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  };

  const formatExpiry = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setMessage('');

    if (basket.length === 0) {
      setMessage('Your basket is empty. Add tickets before paying.');
      return;
    }

    if (!cardholderName || !email || !cardNumber || !expiry || !cvc) {
      setMessage('Please complete all payment fields.');
      return;
    }

    if (cardNumber.replace(/\s/g, '').length < 16) {
      setMessage('Card number must be 16 digits.');
      return;
    }

    if (expiry.length !== 5) {
      setMessage('Expiry date must be in MM/YY format.');
      return;
    }

    if (cvc.length < 3) {
      setMessage('CVC must be at least 3 digits.');
      return;
    }

    setLoading(true);

    try {
      // Process each item in basket as a separate purchase
      let allTickets = [];
      let purchaseId = null;
      let eventTitle = null;

      for (const item of basket) {
        // Get the JWT token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Authentication required. Please log in first.');
        }
        
        const purchaseResponse = await fetch(`${API_BASE}/purchases`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            eventId: item.eventId,
            eventTitle: item.eventName,
            ticketType: item.ticketType,
            quantity: item.quantity,
            email: email,
            name: cardholderName
          })
        });

        if (!purchaseResponse.ok) {
          const errorData = await purchaseResponse.json();
          throw new Error(errorData.message || 'Purchase failed');
        }

        const purchaseData = await purchaseResponse.json();
        
        // Collect all tickets from all purchases
        if (purchaseData.tickets) {
          allTickets = [...allTickets, ...purchaseData.tickets];
        }
        
        // Keep the purchaseId from the last/first purchase for PDF download
        if (!purchaseId) {
          purchaseId = purchaseData.purchaseId;
          eventTitle = purchaseData.eventTitle;
        }

        console.log('✅ Purchase successful:', purchaseData.purchaseId);
      }

      // Clear basket after all purchases succeed
      clearBasket();
      setLoading(false);

      // Navigate to confirmation page with ticket data
      navigate('/tickets/confirmation', {
        state: {
          tickets: allTickets,
          eventTitle: eventTitle,
          purchaseId: purchaseId,
          purchaserEmail: email,
          purchaserName: cardholderName
        }
      });

    } catch (error) {
      console.error('Payment error:', error);
      setMessage(`Payment failed: ${error.message}. Please try again.`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-madverse-dark">
      <header className="bg-madverse-darker border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/checkout')}
                className="text-purple-400 hover:text-purple-300 text-2xl font-bold"
                title="Back to Checkout"
              >
                ←
              </button>
              <span className="text-white font-bold text-xl font-festival tracking-wider">MADVERSE</span>
            </div>
            <button
              onClick={() => navigate('/')}
              className="text-sm uppercase font-body font-semibold border border-white px-3 py-1 rounded hover:bg-white hover:text-madverse-dark transition-colors"
            >
              Home
            </button>
          </div>
        </div>
      </header>

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10">
            <h1 className="text-4xl md:text-5xl font-bold font-display text-white mb-2">Complete Your Purchase</h1>
            <p className="text-gray-400 font-body">Enter your billing information and email to receive your tickets</p>
          </div>

          {basket.length === 0 ? (
            <div className="bg-madverse-darker border border-gray-700 rounded-lg p-12 text-center">
              <h2 className="text-2xl font-bold font-display text-white mb-4">No items to pay for</h2>
              <p className="text-gray-400 font-body mb-8">Please add tickets first, then proceed to checkout.</p>
              <button
                onClick={() => navigate('/events')}
                className="bg-purple-600 hover:bg-purple-700 text-white font-body font-bold px-8 py-3 rounded uppercase tracking-wide transition-colors"
              >
                Browse Events
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-madverse-darker border border-gray-700 rounded-lg p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold font-display text-white">Card Details</h2>
                  <span className="text-xs uppercase tracking-widest text-indigo-300 border border-indigo-300/40 px-2 py-1 rounded">Powered by Stripe</span>
                </div>

                {message && (
                  <div className="mb-6 p-3 rounded border border-red-600 bg-red-900/30 text-red-300 text-sm font-body">
                    {message}
                  </div>
                )}

                <form onSubmit={handlePayment} className="space-y-4">
                  <div>
                    <label className="block text-gray-300 font-body text-sm mb-2">Cardholder Name</label>
                    <input
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value)}
                      className="w-full bg-madverse-dark border border-gray-700 text-white px-4 py-3 rounded font-body focus:outline-none focus:border-purple-500 transition-colors"
                      placeholder="Jane Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-body text-sm mb-2">Email for Your Tickets</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-madverse-dark border border-gray-700 text-white px-4 py-3 rounded font-body focus:outline-none focus:border-purple-500 transition-colors"
                      placeholder="you@example.com"
                    />
                    <p className="text-gray-500 text-xs mt-1">Your tickets and download link will be sent here</p>
                  </div>

                  <div>
                    <label className="block text-gray-300 font-body text-sm mb-2">Card Number</label>
                    <input
                      inputMode="numeric"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      className="w-full bg-madverse-dark border border-gray-700 text-white px-4 py-3 rounded font-body focus:outline-none focus:border-purple-500 transition-colors"
                      placeholder="4242 4242 4242 4242"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 font-body text-sm mb-2">Expiry</label>
                      <input
                        inputMode="numeric"
                        value={expiry}
                        onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                        className="w-full bg-madverse-dark border border-gray-700 text-white px-4 py-3 rounded font-body focus:outline-none focus:border-purple-500 transition-colors"
                        placeholder="MM/YY"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 font-body text-sm mb-2">CVC</label>
                      <input
                        inputMode="numeric"
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        className="w-full bg-madverse-dark border border-gray-700 text-white px-4 py-3 rounded font-body focus:outline-none focus:border-purple-500 transition-colors"
                        placeholder="123"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white font-body font-bold py-3 rounded uppercase tracking-wide transition-colors mt-2"
                  >
                    {loading ? 'Processing Your Purchase...' : `Complete Purchase & Get Tickets - €${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  </button>
                </form>
              </div>

              <div className="bg-madverse-darker border border-gray-700 rounded-lg p-6 h-fit">
                <h3 className="text-xl font-bold font-display text-white mb-4">Order Review</h3>
                <div className="space-y-3 mb-5 max-h-72 overflow-y-auto">
                  {basket.map((item, idx) => (
                    <div key={idx} className="bg-madverse-dark p-3 rounded border border-gray-700">
                      <p className="text-white font-semibold text-sm">{item.eventName}</p>
                      <p className="text-gray-400 text-xs">{item.ticketTypeName || item.ticketType} × {item.quantity}</p>
                      <p className="text-yellow-400 font-bold text-sm mt-1">€{item.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-700 pt-4 flex justify-between items-center">
                  <span className="text-gray-300 font-body">Total</span>
                  <span className="text-yellow-400 font-bold font-display text-2xl">€{total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EventsPage() {
  const navigate = useNavigate();
  const { basket } = useBasket();
  const { events } = useEvents();
  const { user, logout: authLogout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const loadUserProfile = async () => {
    setLoadingProfile(true);
    try {
      const profileRes = await fetch(`${API_BASE}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });
      if (profileRes.ok) {
        const profileInfo = await profileRes.json();
        setProfileData(profileInfo);
      }

      const ordersRes = await fetch(`${API_BASE}/auth/orders`, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });
      if (ordersRes.ok) {
        const ordersInfo = await ordersRes.json();
        setOrders(ordersInfo.orders || []);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    }
    setLoadingProfile(false);
  };

  const handleProfileClick = () => {
    setShowProfile(!showProfile);
    if (!showProfile && !profileData) {
      loadUserProfile();
    }
  };

  const handleLogout = () => {
    authLogout();
    setShowProfile(false);
    navigate('/login');
  };

  // Display mapping for events (gradient images and display info)
  const displayMapping = {
    1: { day: 'TUESDAY', date: 'Tuesday, 24 March 2026, 10:00', image: 'bg-gradient-to-br from-purple-600 to-purple-800' },
    2: { day: 'WEDNESDAY', date: 'Wednesday, 25 March 2026, 10:00', image: 'bg-gradient-to-br from-blue-600 to-purple-800' },
    3: { day: 'WEDNESDAY', date: 'Wednesday, 25 March 2026, 19:00', image: 'bg-gray-900' },
    4: { day: 'THURSDAY', date: 'Thursday, 26 March 2026, 10:00', image: 'bg-gradient-to-br from-purple-600 to-blue-800' },
    5: { day: 'FRIDAY', date: 'Friday, 27 March 2026, 12:30', image: 'bg-gradient-to-br from-purple-500 to-blue-600' },
    6: { day: 'SATURDAY', date: 'Saturday, 28 March 2026, 12:00', image: 'bg-gradient-to-br from-blue-500 to-purple-600' },
    7: { day: 'SUNDAY', date: 'Sunday, 29 March 2026, 12:00', image: 'bg-gradient-to-br from-purple-500 to-blue-700' },
    8: { day: 'EVENT', date: 'Saturday, 01 April 2026, 22:00', image: 'bg-gradient-to-br from-pink-500 to-red-500' },
    9: { day: 'EVENT', date: 'Saturday, 11 April 2026, 13:00', image: 'bg-gradient-to-br from-green-400 to-yellow-300' },
    10: { day: 'EVENT', date: 'Saturday, 11 April 2026, 21:00', image: 'bg-gray-800' },
    11: { day: 'EVENT', date: 'Sunday, 12 April 2026, 10:00', image: 'bg-gray-700' },
    12: { day: 'FESTIVAL', date: 'Friday, 17 April 2026, 19:00', image: 'bg-gradient-to-br from-yellow-400 to-red-600' },
    13: { day: 'EVENT', date: 'Wednesday, 22 April 2026, 20:00', image: 'bg-gradient-to-br from-blue-400 to-cyan-400' },
    14: { day: 'EVENT', date: 'Saturday, 25 April 2026, 23:00', image: 'bg-gradient-to-br from-pink-600 to-purple-700' },
    15: { day: 'EVENT', date: 'Tuesday, 12 May 2026, 20:00', image: 'bg-gradient-to-br from-orange-500 to-red-600' },
    16: { day: 'EVENT', date: 'Friday, 15 May 2026, 21:00', image: 'bg-gradient-to-br from-red-700 to-red-900' }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020617] to-[#343745]">
      {/* Header */}
      <header className="bg-madverse-darker border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3">
                <span className="text-black font-bold text-sm">M</span>
              </div>
              <span className="text-white font-bold text-xl font-festival tracking-wider">MADVERSE</span>
            </div>
            <div className="flex items-center space-x-4 relative">
              <button
                type="button"
                onClick={() => navigate('/checkout')}
                className="text-sm uppercase font-body font-semibold border border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white px-3 py-1 rounded transition-colors relative"
              >
                🛒 {basket.length > 0 && <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{basket.length}</span>}
              </button>
              {user?.isAdmin && (
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="text-sm uppercase font-body font-semibold border border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white px-3 py-1 rounded transition-colors"
                >
                  Admin Dashboard
                </button>
              )}
              {user && (
                <button
                  onClick={handleProfileClick}
                  className="w-10 h-10 bg-purple-600 hover:bg-purple-700 text-white rounded-full flex items-center justify-center font-bold transition-colors"
                  title={user.email}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </button>
              )}
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-sm uppercase font-body font-semibold border border-white px-3 py-1 rounded hover:bg-white hover:text-madverse-dark transition-colors"
              >
                Home
              </button>
              <button
                type="button"
                onClick={() => navigate('/contact')}
                className="text-sm uppercase font-body font-semibold border border-white px-3 py-1 rounded hover:bg-white hover:text-madverse-dark transition-colors"
              >
                Contact
              </button>

              {showProfile && (
                <div className="absolute right-0 top-12 bg-madverse-darker border border-gray-700 rounded-lg shadow-lg w-full sm:w-96 md:w-80 z-50 max-w-xs">
                  <div className="p-4 border-b border-gray-700">
                    {loadingProfile ? (
                      <p className="text-gray-400 text-sm">Loading...</p>
                    ) : profileData ? (
                      <>
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {profileData.firstName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-semibold">{profileData.name}</p>
                            <p className="text-gray-400 text-sm">{profileData.email}</p>
                          </div>
                        </div>
                      </>
                    ) : null}
                  </div>

                  <div className="max-h-64 overflow-y-auto">
                    <div className="p-4">
                      <h3 className="text-white font-semibold mb-3">🎟️ Your Tickets</h3>
                      {orders.length === 0 ? (
                        <p className="text-gray-400 text-sm">No tickets purchased yet</p>
                      ) : (
                        <div className="space-y-3">
                          {orders.map((order) => (
                            <div key={order.orderId} className="bg-madverse-dark rounded p-3 border border-gray-600">
                              <p className="text-purple-400 text-sm font-semibold">Order #{order.orderId}</p>
                              <p className="text-gray-400 text-xs mb-2">{new Date(order.orderDate).toLocaleDateString()}</p>
                              <div className="space-y-1">
                                {order.tickets.map((ticket, idx) => (
                                  <div key={idx} className="text-sm">
                                    <p className="text-white">{ticket.eventTitle}</p>
                                    <p className="text-gray-400 text-xs">Qty: {ticket.quantity} × €{ticket.unitPrice}</p>
                                  </div>
                                ))}
                              </div>
                              <div className="border-t border-gray-600 mt-2 pt-2">
                                <p className="text-white font-semibold text-sm">Total: €{order.totalAmount}</p>
                                <p className="text-xs capitalize" style={{color: order.status === 'Confirmed' ? '#10b981' : '#f59e0b'}}>{order.status}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-3 border-t border-gray-700">
                    <button
                      onClick={handleLogout}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded text-sm font-semibold transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-5xl md:text-6xl font-bold font-display tracking-tight text-white mb-4">
              ALL UPCOMING EVENTS
            </h1>
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(events).map(([id, event]) => {
            const display = displayMapping[id] || { day: 'EVENT', date: 'TBA', image: 'bg-gray-700' };
            return (
              <div key={id} className="bg-madverse-darker rounded-lg overflow-hidden border border-gray-700 group">
                {/* Event Image */}
                {event.image ? (
                  <div className="h-24 sm:h-32 w-full relative overflow-hidden">
                    <img src={event.image} alt={event.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center p-2">
                      <div className="text-center">
                        <div className="text-white font-display text-sm sm:text-xl font-bold line-clamp-2">{event.name}</div>
                        <div className="text-gray-300 font-body text-xs uppercase tracking-wider">{display.day}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={`h-24 sm:h-32 w-full ${display.image} flex items-center justify-center relative overflow-hidden p-2`}>
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="relative z-10 text-center">
                      <div className="text-white font-display text-sm sm:text-xl font-bold line-clamp-2">{event.name}</div>
                      <div className="text-gray-300 font-body text-xs uppercase tracking-wider">{display.day}</div>
                    </div>
                  </div>
                )}

                {/* Event Info */}
                <div className="p-3 sm:p-4">
                  <p className="text-gray-400 font-body text-xs mb-3 line-clamp-2">{display.date}</p>
                  
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-white font-body font-semibold text-xs sm:text-sm">FROM €{event.price}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(`/event/${id}`)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-body font-bold text-xs sm:text-sm py-2 rounded transition-colors uppercase tracking-wide"
                  >
                    BUY TICKETS
                  </button>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      </div>
    </div>
  );
}

function EventDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const eventId = parseInt(id);
  const { basket, addToBasket } = useBasket();
  const { events, updateEvent } = useEvents();
  
  const [selectedTicketType, setSelectedTicketType] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [selectedSeat, setSelectedSeat] = useState(null); // For cinema seating

  const event = events[eventId];

  // Set initial ticket type when event loads
  useEffect(() => {
    if (event && event.ticketTypes) {
      const firstType = Object.keys(event.ticketTypes)[0];
      setSelectedTicketType(firstType);
      setMessage('');
    }
  }, [eventId, event]);

  if (!event) {
    return (
      <div className="min-h-screen bg-madverse-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Event not found</h1>
          <button
            onClick={() => navigate('/events')}
            className="text-purple-400 hover:text-purple-300 font-body"
          >
            ← Back to Events
          </button>
        </div>
      </div>
    );
  }

  const handleAddToBasket = () => {
    if (!selectedTicketType) {
      setMessage('❌ Please select a ticket type');
      return;
    }

    // Check if seat selection is required (cinema type)
    const hasSeatingLayout = event.seatingLayout?.enabled && event.seatingLayout?.type === 'cinema';
    if (hasSeatingLayout && !selectedSeat) {
      setMessage('❌ Please select a seat first');
      return;
    }

    const ticketTypeData = event.ticketTypes[selectedTicketType];
    
    if (!ticketTypeData) {
      setMessage('❌ Invalid ticket type');
      return;
    }

    if (ticketTypeData.available < quantity) {
      setMessage(`❌ Only ${ticketTypeData.available} tickets available`);
      return;
    }

    // Deduct from stock
    const updatedEvent = { ...event };
    updatedEvent.ticketTypes[selectedTicketType].available -= quantity;
    
    // Update events
    updateEvent(eventId, updatedEvent);

    // Add to basket
    addToBasket({ 
      eventId,
      eventName: event.name, 
      ticketType: selectedTicketType, // Store the key (vip, group, standard), not the name
      ticketTypeName: ticketTypeData.name, // Store the display name for checkout
      quantity, 
      price: ticketTypeData.price,
      total: ticketTypeData.price * quantity,
      selectedSeat: selectedSeat ? { id: selectedSeat.id, row: selectedSeat.row, col: selectedSeat.col } : null // Add seat info
    });
    
    setQuantity(1);
    setMessage('✅ Added to basket!');
    setTimeout(() => setMessage(''), 3000);
  };

  const basketTotal = basket.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-madverse-dark">
      {/* Header with Back Button */}
      <header className="bg-madverse-darker border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/events')}
                className="text-purple-400 hover:text-purple-300 text-2xl font-bold"
                title="Back to Events"
              >
                ←
              </button>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3">
                  <span className="text-black font-bold text-sm">M</span>
                </div>
                <span className="text-white font-bold text-xl font-festival tracking-wider">MADVERSE</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="text-sm uppercase font-body font-semibold border border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white px-3 py-1 rounded transition-colors relative"
            >
              🛒 {basket.length > 0 && <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{basket.length}</span>}
            </button>
            {user?.isAdmin && (
              <button
                onClick={() => navigate('/dashboard')}
                className="text-sm uppercase font-body font-semibold border border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white px-3 py-1 rounded transition-colors"
              >
                Admin Dashboard
              </button>
            )}
            <button
              onClick={() => navigate('/')}
              className="text-sm uppercase font-body font-semibold border border-white px-3 py-1 rounded hover:bg-white hover:text-madverse-dark transition-colors"
            >
              Home
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Event Banner */}
          {event.image ? (
            <div className="rounded-lg overflow-hidden mb-12 relative h-48">
              <img src={event.image} alt={event.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-end">
                <div className="p-8 w-full">
                  <h1 className="text-4xl md:text-5xl font-bold font-display text-white mb-2">{event.name}</h1>
                  <p className="text-gray-200 font-body">{event.description}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-8 mb-12">
              <h1 className="text-4xl md:text-5xl font-bold font-display text-white mb-2">{event.name}</h1>
              <p className="text-gray-200 font-body">{event.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Left Column - Selection */}
            <div className="lg:col-span-2">
              {/* SELECT Section */}
              <div className="bg-madverse-darker border border-gray-700 rounded-lg p-4 sm:p-8 mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold font-display text-white mb-4 sm:mb-6">SELECT TICKET TYPE:</h2>

                {message && (
                  <div className={`mb-6 p-4 rounded-lg text-center font-body font-semibold text-sm sm:text-base ${message.includes('✅') ? 'bg-green-900/30 text-green-400 border border-green-600' : 'bg-red-900/30 text-red-400 border border-red-600'}`}>
                    {message}
                  </div>
                )}

                {/* Ticket Types Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {event.ticketTypes && Object.entries(event.ticketTypes).map(([typeKey, typeData]) => (
                    <button
                      key={typeKey}
                      onClick={() => setSelectedTicketType(typeKey)}
                      className={`p-5 rounded-lg border-2 transition-all text-left ${
                        selectedTicketType === typeKey
                          ? 'border-purple-500 bg-purple-900/30 shadow-lg shadow-purple-500/20'
                          : 'border-gray-700 bg-madverse-dark hover:border-purple-400'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-white font-bold text-lg font-display">{typeData.name}</h3>
                          <p className="text-gray-400 font-body text-sm">Stock: <span className={typeData.available > 0 ? 'text-green-400' : 'text-red-400'}>{typeData.available}/{typeData.stock}</span></p>
                        </div>
                        <span className="text-yellow-400 font-bold text-lg">€{typeData.price}</span>
                      </div>
                      {typeData.available === 0 && (
                        <p className="text-red-400 text-xs font-semibold">OUT OF STOCK</p>
                      )}
                    </button>
                  ))}
                </div>

                {/* Number of Tickets */}
                <div className="mb-6 bg-madverse-dark p-4 rounded-lg">
                  <label className="text-gray-300 font-body text-sm mb-3 block">Select number of tickets:</label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="bg-purple-600 hover:bg-purple-700 text-white w-10 h-10 rounded flex items-center justify-center font-bold transition-colors"
                    >
                      −
                    </button>
                    <span className="text-white font-display text-2xl w-8 text-center">{quantity}</span>
                    <button
                      onClick={() => {
                        const maxAvailable = selectedTicketType ? event.ticketTypes[selectedTicketType].available : 100;
                        setQuantity(Math.min(maxAvailable, quantity + 1));
                      }}
                      className="bg-purple-600 hover:bg-purple-700 text-white w-10 h-10 rounded flex items-center justify-center font-bold transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* OBJECT MAP - Seating Selection (Cinema only) */}
                {event.seatingLayout?.enabled && event.seatingLayout?.type === 'cinema' && (
                  <div className="mb-6 bg-madverse-dark p-4 rounded-lg border border-emerald-600/50">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-white font-bold font-display text-lg">🪑 Select Your Seat</h3>
                      {selectedSeat && (
                        <button
                          onClick={() => setSelectedSeat(null)}
                          className="text-xs bg-red-600/30 hover:bg-red-600/50 text-red-300 px-2 py-1 rounded transition-colors"
                        >
                          Clear Selection
                        </button>
                      )}
                    </div>

                    {selectedSeat && (
                      <div className="mb-4 p-3 bg-emerald-900/30 border border-emerald-600 rounded text-center">
                        <p className="text-emerald-400 font-body text-sm">
                          ✓ Selected: Row {selectedSeat.row + 1}, Seat {String.fromCharCode(65 + selectedSeat.col)} ({event.seatingLayout.seats.find(s => s.id === selectedSeat.id)?.type === 'vip' ? '👑 VIP' : '🎫 Standard'})
                        </p>
                      </div>
                    )}

                    <div className="bg-madverse-darker rounded-lg p-4 border border-gray-700 overflow-x-auto flex justify-center">
                      <div className="grid gap-2 inline-grid" style={{ gridTemplateColumns: `repeat(${event.seatingLayout?.cols || 8}, minmax(35px, 1fr))`, rowGap: '6px', columnGap: '6px' }}>
                        {event.seatingLayout?.seats?.map((seat) => {
                          if (seat.type !== selectedTicketType) return null; // Only show seats for selected ticket type
                          
                          const isSelected = selectedSeat?.id === seat.id;
                          const seatColor = isSelected 
                            ? 'bg-yellow-500 hover:bg-yellow-600 ring-2 ring-yellow-400' 
                            : seat.type === 'vip'
                            ? 'bg-purple-600 hover:bg-purple-700'
                            : seat.type === 'standard'
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : 'bg-green-600 hover:bg-green-700';
                          
                          return (
                            <button
                              key={seat.id}
                              onClick={() => setSelectedSeat(isSelected ? null : seat)}
                              className={`w-8 h-8 sm:w-9 sm:h-9 rounded text-xs font-bold text-white transition-all ${seatColor}`}
                              title={`Row ${seat.row + 1}, Seat ${String.fromCharCode(65 + seat.col)}`}
                            >
                              {seat.type === 'vip' ? '👑' : '🎫'}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-gray-400 font-body text-center">
                      Click a seat to select it. Available seats for {event.ticketTypes[selectedTicketType]?.name}
                    </div>
                  </div>
                )}

                {/* Price and SELECT Button */}
                <div className="flex justify-between items-center bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-4 rounded-lg border border-purple-600/30">
                  <div>
                    <p className="text-gray-400 font-body text-sm mb-1">Total price:</p>
                    <p className="text-white font-display text-2xl font-bold">
                      €{selectedTicketType && event.ticketTypes[selectedTicketType] ? (event.ticketTypes[selectedTicketType].price * quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                    </p>
                  </div>
                  <button
                    onClick={handleAddToBasket}
                    disabled={!selectedTicketType || event.ticketTypes[selectedTicketType]?.available === 0}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-body font-bold px-12 py-4 rounded-lg uppercase tracking-wide transition-colors text-lg"
                  >
                    ADD TO BASKET
                  </button>
                </div>
              </div>

              {/* OBJECT MAP Section */}
              <div className="bg-madverse-darker border border-gray-700 rounded-lg p-8">
                <h2 className="text-2xl font-bold font-display text-white mb-6">OBJECT MAP</h2>
                <div className="bg-gray-900 rounded-lg h-64 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🎪</div>
                    <p className="text-gray-400 font-body">Event layout and seating map</p>
                  </div>
                </div>
              </div>

              {/* ABOUT VENUE Section */}
              <div className="bg-madverse-darker border border-gray-700 rounded-lg p-8 mt-8">
                <h2 className="text-2xl font-bold font-display text-white mb-4">ABOUT VENUE</h2>
                <p className="text-gray-300 font-body leading-relaxed">
                  This is an immersive music and art experience venue dedicated to bringing world-class performances and unforgettable moments to our community. From cutting-edge production to intimate performances, every event is crafted with meticulous attention to detail.
                </p>
              </div>
            </div>

            {/* Right Column - Basket */}
            <div>
              <div className="bg-madverse-darker border border-gray-700 rounded-lg p-6 sticky top-20">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold font-display text-white">🛒 BASKET</h2>
                </div>

                {basket.length === 0 ? (
                  <p className="text-gray-400 font-body text-sm">The shopping cart is empty.</p>
                ) : (
                  <>
                    <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                      {basket.map((item, idx) => (
                        <div key={idx} className="bg-madverse-dark p-3 rounded border border-gray-700">
                          <p className="text-gray-300 font-body text-xs font-semibold">{item.ticketTypeName || item.ticketType}</p>
                          <p className="text-gray-500 font-body text-xs mb-2">{item.eventName}</p>
                          <div className="flex justify-between mt-2">
                            <span className="text-purple-400 font-body text-sm">×{item.quantity}</span>
                            <span className="text-yellow-400 font-bold font-body">€{(item.price * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-gray-700 pt-4">
                      <div className="flex justify-between mb-4">
                        <span className="text-gray-300 font-body">Total:</span>
                        <span className="text-yellow-400 font-bold font-display text-lg">€{basketTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <button 
                        onClick={() => navigate('/checkout')}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-body font-bold py-3 rounded uppercase tracking-wide transition-colors">
                        Proceed to Checkout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactUsPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to send message');
      }
    } catch (err) {
      console.error('Error sending contact form:', err);
      setError('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020617] to-[#343745] flex flex-col">
      <div className="flex-grow">
      {/* Back Button Section */}
      <section className="pt-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="text-purple-400 hover:text-purple-300 transition-colors"
            title="Go to Home"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </section>

      {/* Header Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 font-display tracking-tight text-white">
            Contact Us
          </h1>
          <p className="text-xl text-gray-400 font-body">
            Have questions? We'd love to hear from you. Get in touch with the Madverse team.
          </p>
        </div>
      </section>

      {/* Contact Content Section */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Contact Information */}
            <div>
              <div className="bg-madverse-darker border border-gray-700 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-bold font-display text-white mb-4">📍 Location</h3>
                <p className="text-gray-400 font-body">
                  Deep Space Pristina<br/>
                  Pristina, Kosovo
                </p>
              </div>

              <div className="bg-madverse-darker border border-gray-700 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-bold font-display text-white mb-4">📧 Email</h3>
                <p className="text-purple-400 font-body hover:text-purple-300">
                  <a href="mailto:info@madverse.com">info@madverse.com</a>
                </p>
              </div>

              <div className="bg-madverse-darker border border-gray-700 rounded-lg p-6">
                <h3 className="text-xl font-bold font-display text-white mb-4">📱 Phone</h3>
                <p className="text-purple-400 font-body hover:text-purple-300">
                  <a href="tel:+38121234567">+381 21 234 567</a>
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-madverse-darker border border-gray-700 rounded-lg p-8">
                <h2 className="text-2xl font-bold font-display text-white mb-6">Send us a Message</h2>

                {submitted && (
                  <div className="mb-6 p-4 bg-green-900/30 border border-green-600 rounded-lg">
                    <p className="text-green-400 font-body font-semibold">✓ Thank you! Your message has been sent successfully.</p>
                  </div>
                )}

                {error && (
                  <div className="mb-6 p-4 bg-red-900/30 border border-red-600 rounded-lg">
                    <p className="text-red-400 font-body font-semibold">✗ {error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 font-body text-sm mb-2">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-madverse-darker border border-gray-700 text-white px-4 py-3 rounded font-body focus:outline-none focus:border-purple-500 transition-colors"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 font-body text-sm mb-2">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-madverse-darker border border-gray-700 text-white px-4 py-3 rounded font-body focus:outline-none focus:border-purple-500 transition-colors"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-300 font-body text-sm mb-2">Subject</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-madverse-darker border border-gray-700 text-white px-4 py-3 rounded font-body focus:outline-none focus:border-purple-500 transition-colors"
                      placeholder="What is this about?"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-body text-sm mb-2">Message</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows="5"
                      className="w-full bg-madverse-darker border border-gray-700 text-white px-4 py-3 rounded font-body focus:outline-none focus:border-purple-500 transition-colors resize-none"
                      placeholder="Your message here..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white font-body font-semibold py-3 rounded uppercase tracking-wide transition-colors"
                  >
                    {loading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#020617] border-t border-gray-700 py-6 text-center text-sm text-gray-400">
        <p>© {new Date().getFullYear()} Madverse TicketApp. All rights reserved.</p>
      </footer>
      </div>
    </div>
  );
}

function OurPartnersPage() {
  const navigate = useNavigate();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPartners() {
      try {
        const res = await fetch(`${API_BASE}/partners`);
        if (res.ok) {
          const data = await res.json();
          setPartners(data);
        }
      } catch (err) {
        console.error('Failed to load partners', err);
      } finally {
        setLoading(false);
      }
    }
    loadPartners();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#020617] to-[#343745] relative">
      <div className="flex-grow p-8">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-8 left-8 text-purple-400 hover:text-purple-300 transition-colors"
          title="Go Back"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <img 
          src="/logo.png" 
          alt="Brand Logo" 
          className="absolute top-8 right-8 w-12 h-12 object-contain"
        />
        <h1 className="text-5xl font-bold text-center text-white mb-4 font-display mt-16 tracking-tight">Our Partners</h1>
        <p className="text-lg text-center text-purple-400 mb-12 font-body font-semibold">Partners we work with</p>
        
        {loading ? (
          <div className="text-center text-white mt-20 text-2xl">Loading partners...</div>
        ) : (
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-20">
            {partners.map(p => (
              <a
                key={p.id}
                href={p.link || '#'}
                target={p.link ? "_blank" : "_self"}
                rel="noopener noreferrer"
                className="bg-white/5 border border-gray-700 hover:border-purple-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] p-6 rounded-xl flex flex-col items-center justify-center text-center transform hover:scale-105 transition-all overflow-hidden group cursor-pointer"
              >
                {p.logo_url ? (
                  <img src={p.logo_url} alt={p.name} className="w-32 h-32 object-contain mb-4 rounded-lg group-hover:opacity-90 transition-opacity" />
                ) : (
                  <div className="w-32 h-32 bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-gray-400 text-xs font-bold">No Logo</span>
                  </div>
                )}
                <h3 className="text-white font-display text-xl font-bold mb-2">{p.name}</h3>
                {p.description && (
                  <p className="text-gray-400 font-body text-sm line-clamp-3">{p.description}</p>
                )}
              </a>
            ))}
            {partners.length === 0 && (
              <div className="col-span-full text-center text-white text-xl font-bold font-body mt-20">
                No partners found. Come back soon!
              </div>
            )}
          </div>
        )}
      </div>
      <footer className="bg-madverse-darker mt-16 border-t border-gray-700 py-6 text-center text-sm text-gray-400">
        <p>© {new Date().getFullYear()} Madverse TicketApp. All rights reserved.</p>
      </footer>
    </div>
  );
}

// Ticket Confirmation Page - Shows QR codes after purchase
function TicketConfirmationPage() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [eventTitle, setEventTitle] = useState('');
  const [purchaseId, setPurchaseId] = useState('');

  useEffect(() => {
    // Get tickets from location state (passed from checkout)
    const state = window.location.state || {};
    if (state.tickets) {
      setTickets(state.tickets);
      setEventTitle(state.eventTitle || 'Event');
      setPurchaseId(state.purchaseId || '');
    }
  }, []);

  const downloadQRCode = (qrCodeUrl, ticketCode) => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `ticket-${ticketCode}.png`;
    link.click();
  };

  const downloadPDF = () => {
    if (!purchaseId) {
      alert('PDF download information not available. Please check your email for the download link.');
      return;
    }
    window.location.href = `/api/purchases/download/${purchaseId}`;
  };

  return (
    <div className="min-h-screen bg-madverse-dark p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-4xl font-bold font-display text-white mb-2">Purchase Successful!</h1>
          <p className="text-gray-400 font-body text-lg">Your tickets have been sent to your email</p>
        </div>

        {tickets.length > 0 && (
          <div className="bg-madverse-darker border border-purple-500/50 rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-2 font-display">{eventTitle}</h2>
            <p className="text-gray-400 mb-6 font-body">Total Tickets: {tickets.length}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tickets.map((ticket, idx) => (
                <div key={idx} className="bg-madverse-dark border border-gray-700 rounded-lg p-6 flex flex-col items-center">
                  <p className="text-sm text-gray-400 mb-2 font-body">Ticket {idx + 1}</p>
                  <img
                    src={ticket.qrCodeUrl}
                    alt={`QR Code ${idx + 1}`}
                    className="w-48 h-48 mb-4"
                  />
                  <p className="text-xs text-gray-500 text-center mb-4 font-mono">{ticket.ticketCode}</p>
                  <div className="w-full space-y-2">
                    <p className="text-sm text-gray-300 font-body"><strong>Type:</strong> {ticket.ticketType}</p>
                    <button
                      onClick={() => downloadQRCode(ticket.qrCodeUrl, ticket.ticketCode)}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded font-body text-sm"
                    >
                      Download QR Code
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {purchaseId && (
              <div className="mt-8 p-6 bg-green-500/10 border border-green-500/30 rounded-lg">
                <h3 className="text-white font-bold mb-3 font-display">📥 Your PDF Ticket</h3>
                <p className="text-gray-300 text-sm mb-4 font-body">
                  Download your ticket as a PDF file. It contains your unique QR code for check-in.
                </p>
                <button
                  onClick={downloadPDF}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded font-body font-semibold"
                >
                  📥 Download PDF Ticket
                </button>
              </div>
            )}

            <div className="mt-8 p-6 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <h3 className="text-white font-bold mb-3 font-display">Important:</h3>
              <ul className="text-gray-300 text-sm space-y-2 font-body">
                <li>✓ Take a screenshot or save the QR codes</li>
                <li>✓ Download the PDF ticket for a complete record</li>
                <li>✓ Bring your phone to the event or print the codes</li>
                <li>✓ Staff will scan them for check-in</li>
                <li>✓ You will receive a confirmation email shortly</li>
              </ul>
            </div>
          </div>
        )}

        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate('/events')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded font-body font-semibold"
          >
            Browse More Events
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded font-body font-semibold"
          >
            View Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

// QR Code Scanner Page - For event staff to check in attendees
function ScannerPage() {
  const navigate = useNavigate();
  const [scannedCode, setScannedCode] = useState('');
  const [scanHistory, setScanHistory] = useState([]);
  const [manualInput, setManualInput] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [eventId] = useState('1'); // TODO: Get from params

  const handleScan = async (code) => {
    try {
      const response = await fetch(`/api/purchases/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketCode: code })
      });

      const data = await response.json();

      if (response.ok) {
        const scanRecord = {
          code,
          timestamp: new Date().toLocaleTimeString(),
          status: 'success'
        };
        setScanHistory([scanRecord, ...scanHistory]);
        setSuccessMessage(`✓ Ticket ${code} checked in!`);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Scan error:', error);
    }
  };

  const handleManualInput = (e) => {
    e.preventDefault();
    if (manualInput.trim()) {
      handleScan(manualInput);
      setManualInput('');
    }
  };

  return (
    <div className="min-h-screen bg-madverse-dark p-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="text-purple-400 hover:text-purple-300 mb-4 font-body"
        >
          ← Back
        </button>

        <div className="bg-madverse-darker border border-gray-700 rounded-lg p-8">
          <h1 className="text-3xl font-bold text-white mb-2 font-display">Check-In Scanner</h1>
          <p className="text-gray-400 mb-8 font-body">Scan ticket QR codes for event check-in</p>

          {successMessage && (
            <div className="bg-green-500/20 border border-green-500 text-green-200 p-4 rounded mb-6 font-body">
              {successMessage}
            </div>
          )}

          {/* Manual Input (as fallback) */}
          <form onSubmit={handleManualInput} className="mb-8">
            <label className="block text-gray-300 font-body mb-2">Or enter ticket code manually:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value.toUpperCase())}
                placeholder="Enter ticket code..."
                className="flex-1 bg-madverse-dark border border-gray-700 text-white px-4 py-3 rounded font-mono focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded font-body font-semibold"
              >
                Check In
              </button>
            </div>
          </form>

          {/* Scan History */}
          <div className="bg-madverse-dark rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4 font-display">Scan History ({scanHistory.length})</h2>
            {scanHistory.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {scanHistory.map((scan, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-madverse-darker border border-gray-700 rounded">
                    <span className="font-mono text-gray-300 text-sm">{scan.code}</span>
                    <span className="text-gray-400 text-xs font-body">{scan.timestamp}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8 font-body">No scans yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Inventory Dashboard - Shows available and sold tickets
function InventoryPage() {
  const navigate = useNavigate();
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [eventId] = useState('1'); // TODO: Get from params

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await fetch(`/api/purchases/inventory/${eventId}`);
        const data = await response.json();
        setInventory(data);
      } catch (error) {
        console.error('Error fetching inventory:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, [eventId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-madverse-dark flex items-center justify-center">
        <p className="text-white font-body">Loading inventory...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-madverse-dark p-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="text-purple-400 hover:text-purple-300 mb-4 font-body"
        >
          ← Back
        </button>

        {inventory && (
          <>
            {/* Header Stats */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-2 font-display">{inventory.eventTitle}</h1>
              <p className="text-gray-400 font-body">Ticket Availability Overview</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-madverse-darker border border-purple-500/30 rounded-lg p-6">
                <p className="text-gray-400 text-sm font-body">Total Capacity</p>
                <p className="text-3xl font-bold text-white font-display">{inventory.totalCapacity}</p>
              </div>
              <div className="bg-madverse-darker border border-green-500/30 rounded-lg p-6">
                <p className="text-gray-400 text-sm font-body">Tickets Sold</p>
                <p className="text-3xl font-bold text-green-400 font-display">{inventory.totalSold}</p>
              </div>
              <div className="bg-madverse-darker border border-orange-500/30 rounded-lg p-6">
                <p className="text-gray-400 text-sm font-body">Available</p>
                <p className="text-3xl font-bold text-orange-400 font-display">{inventory.totalAvailable}</p>
              </div>
              <div className="bg-madverse-darker border border-blue-500/30 rounded-lg p-6">
                <p className="text-gray-400 text-sm font-body">Checked In</p>
                <p className="text-3xl font-bold text-blue-400 font-display">{inventory.totalCheckedIn}</p>
              </div>
            </div>

            {/* Ticket Types Detail */}
            <div className="bg-madverse-darker border border-gray-700 rounded-lg overflow-hidden">
              <div className="bg-madverse-dark px-6 py-4 border-b border-gray-700">
                <h2 className="text-xl font-bold text-white font-display">Ticket Types</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-body">
                  <thead className="bg-madverse-dark border-b border-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-gray-300">Type</th>
                      <th className="px-6 py-4 text-center text-gray-300">Price</th>
                      <th className="px-6 py-4 text-center text-gray-300">Total</th>
                      <th className="px-6 py-4 text-center text-gray-300">Sold</th>
                      <th className="px-6 py-4 text-center text-gray-300">Available</th>
                      <th className="px-6 py-4 text-center text-gray-300">Checked In</th>
                      <th className="px-6 py-4 text-center text-gray-300">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.ticketTypes.map((type) => {
                      const soldPercent = Math.round((type.sold / type.total) * 100);
                      const availablePercent = Math.round((type.available / type.total) * 100);

                      return (
                        <tr key={type.type} className="border-b border-gray-700 hover:bg-madverse-dark/50">
                          <td className="px-6 py-4 text-white font-semibold">{type.name}</td>
                          <td className="px-6 py-4 text-center text-gray-300">€{type.price}</td>
                          <td className="px-6 py-4 text-center text-gray-300">{type.total}</td>
                          <td className="px-6 py-4 text-center text-green-400">{type.sold}</td>
                          <td className="px-6 py-4 text-center text-orange-400">{type.available}</td>
                          <td className="px-6 py-4 text-center text-blue-400">{type.checkedIn}</td>
                          <td className="px-6 py-4 text-center">
                            <div className="w-full bg-gray-700 rounded-full h-2" title={`${soldPercent}% sold`}>
                              <div
                                className="bg-gradient-to-r from-green-500 to-orange-500 h-2 rounded-full"
                                style={{ width: `${soldPercent}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-400 mt-1">{soldPercent}%</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-400 rounded"></div>
                <span className="text-sm text-gray-400 font-body">Sold</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-400 rounded"></div>
                <span className="text-sm text-gray-400 font-body">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-400 rounded"></div>
                <span className="text-sm text-gray-400 font-body">Checked In</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-400 rounded"></div>
                <span className="text-sm text-gray-400 font-body">Pending</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Stripe Payment Success Page
function SuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <div className="min-h-screen bg-gradient-to-b from-madverse-dark to-madverse-darker flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Success Card */}
        <div className="bg-madverse-darker border border-green-500/50 rounded-2xl p-8 md:p-12 text-center">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 border border-green-500 rounded-full mb-6">
            <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 font-display">Payment Successful! 🎉</h1>
          <p className="text-gray-400 text-lg font-body mb-2">Your payment has been processed successfully</p>
          
          {sessionId && (
            <p className="text-gray-500 text-sm font-body mb-6">
              Session ID: <code className="bg-gray-900 px-2 py-1 rounded text-green-400">{sessionId.slice(0, 20)}...</code>
            </p>
          )}

          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6 mb-8 text-left">
            <h3 className="text-white font-bold mb-4 font-display">Next Steps:</h3>
            <ul className="space-y-3 text-gray-300 font-body">
              <li className="flex items-start gap-3">
                <span className="text-green-400 mt-1">✓</span>
                <span>Check your email for ticket confirmation and PDF</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 mt-1">✓</span>
                <span>Download and keep your QR code safe</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 mt-1">✓</span>
                <span>Show your tickets at the event entrance</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-400 mt-1">✓</span>
                <span>Your account has been credited with your tickets</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => navigate('/tickets')}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg uppercase tracking-wide transition-colors mb-3"
          >
            View My Tickets
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg uppercase tracking-wide transition-colors"
          >
            Back to Home
          </button>
        </div>

        {/* Support Section */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 font-body mb-3">Need help?</p>
          <a href="mailto:support@madverse.com" className="text-purple-400 hover:text-purple-300 font-body">
            Contact Support →
          </a>
        </div>
      </div>
    </div>
  );
}

// Stripe Payment Cancelled Page
function CancelPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-madverse-dark to-madverse-darker flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Cancel Card */}
        <div className="bg-madverse-darker border border-orange-500/50 rounded-2xl p-8 md:p-12 text-center">
          {/* Cancel Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-500/20 border border-orange-500 rounded-full mb-6">
            <svg className="w-10 h-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 font-display">Payment Cancelled</h1>
          <p className="text-gray-400 text-lg font-body mb-8">
            Your payment was not completed. Don't worry, your basket has been saved!
          </p>

          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6 mb-8">
            <h3 className="text-white font-bold mb-3 font-display text-left">What Happened?</h3>
            <p className="text-gray-300 font-body text-left">
              You've cancelled the payment process. Your tickets are still in your basket and ready to purchase whenever you're ready.
            </p>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg uppercase tracking-wide transition-colors mb-3"
          >
            Return to Checkout
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg uppercase tracking-wide transition-colors"
          >
            Continue Shopping
          </button>
        </div>

        {/* Support Section */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 font-body mb-3">Still having issues?</p>
          <a href="mailto:support@madverse.com" className="text-purple-400 hover:text-purple-300 font-body">
            Get in Touch →
          </a>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/event/:id" element={<EventDetailPage />} />
      <Route path="/contact" element={<ContactUsPage />} />
      <Route path="/partners" element={<OurPartnersPage />} />
      <Route path="/dashboard" element={<ProtectedRoute requireAdmin={true}><DashboardPage /></ProtectedRoute>} />
      <Route
        path="/tickets"
        element={
          <ProtectedRoute>
            <Layout>
              <TicketsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/payment" element={<PaymentPage />} />
      <Route path="/success" element={<SuccessPage />} />
      <Route path="/cancel" element={<CancelPage />} />
      <Route path="/tickets/confirmation" element={<TicketConfirmationPage />} />
      <Route path="/scanner" element={<ProtectedRoute requireAdmin={true}><ScannerPage /></ProtectedRoute>} />
      <Route path="/inventory" element={<ProtectedRoute requireAdmin={true}><InventoryPage /></ProtectedRoute>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
