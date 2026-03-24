import React, { useEffect, useState, useContext, createContext } from 'react';
import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';

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
    const newBasket = basket.filter((_, i) => i !== index);
    setBasket(newBasket);
    localStorage.setItem('madverseBasket', JSON.stringify(newBasket));
  };

  const clearBasket = () => {
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
      // Default events if none exist
      return {
        1: { name: 'E MARTÉ', price: 300, zones: ['VIP - 500€', 'Standard - 350€', 'General - 300€'], description: 'Deep Space Pristhina - Tuesday' },
        2: { name: 'E MERKURÉ', price: 300, zones: ['VIP - 500€', 'Standard - 350€', 'General - 300€'], description: 'Deep Space Pristhina - Wednesday' },
        3: { name: 'Event You Don\'t Wanna Miss', price: 800, zones: ['VIP - 1200€', 'General - 800€'], description: 'An event you don\'t wanna miss' },
        4: { name: 'E ENJTE', price: 300, zones: ['VIP - 500€', 'Standard - 350€', 'General - 300€'], description: 'Deep Space Pristhina - Thursday' },
        5: { name: 'E PREMTE', price: 300, zones: ['VIP - 500€', 'Standard - 350€', 'General - 300€'], description: 'Deep Space Pristhina - Friday' },
        6: { name: 'E SHTUNE', price: 300, zones: ['VIP - 500€', 'Standard - 350€', 'General - 300€'], description: 'Deep Space Pristhina - Saturday' },
        7: { name: 'E DIELË', price: 300, zones: ['VIP - 500€', 'Standard - 350€', 'General - 300€'], description: 'Deep Space Pristhina - Sunday' },
        8: { name: 'ANA CARLA MAZA', price: 1000, zones: ['VIP - 1500€', 'Standard - 1000€', 'General - 800€'], description: 'Ana Carla Maza Live' },
        9: { name: 'Cactus in the Snow', price: 2500, zones: ['VIP - 4000€', 'Standard - 2500€', 'General - 1500€'], description: 'Cactus in the Snow' },
        10: { name: 'PETER PAN QUARTET', price: 300, zones: ['Standard - 400€', 'General - 300€'], description: 'Peter Pan Quartet' },
        11: { name: 'DURIM', price: 20000, zones: ['VIP - 30000€', 'Standard - 20000€'], description: 'DURIM Concert' },
        12: { name: 'Muse-X Festival', price: 2500, zones: ['VIP - 4500€', 'Standard - 2500€', 'General - 1500€', 'Student - 1000€'], description: 'Muse-X Festival 2 Day' },
        13: { name: 'LYREL.CS', price: 3100, zones: ['Standard - 4000€', 'General - 3100€'], description: 'LYREL.CS Live' },
        14: { name: 'EXHALE TIBANA', price: 800, zones: ['VIP - 1200€', 'Standard - 900€', 'General - 800€'], description: 'Exhale Tibana' },
        15: { name: 'Stand UPR 2nd Edition', price: 2800, zones: ['Standard - 3200€', 'General - 2800€'], description: 'Stand Up Comedy' },
        16: { name: 'MARCEL DETTMANN - RAVE', price: 1500, zones: ['VIP - 2000€', 'Standard - 1500€', 'General - 1000€'], description: 'Marcel Dettmann Rave' }
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
      const res = await fetch(`${API_BASE}/register`, {
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
      const res = await fetch(`${API_BASE}/login`, {
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
  return localStorage.getItem('isAdmin') === 'true';
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

function DashboardPage() {
  const [dashData, setDashData] = useState(null);
  const [error, setError] = useState('');
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '', zones: '', description: '', image: null, imagePreview: null });
  const { events, addEvent, updateEvent, deleteEvent } = useEvents();

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await fetch(`${API_BASE}/dashboard/summary`, {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.message || 'Failed to load dashboard');
          return;
        }
        const data = await res.json();
        setDashData(data);
      } catch (err) {
        setError('Network error');
      }
    }
    loadDashboard();
  }, []);

  // Mock event ticket data for demonstration
  const eventTickets = [
    { name: 'E MARTÉ', total: 500, sold: 380, revenue: 1140 },
    { name: 'E MERKURÉ', total: 500, sold: 420, revenue: 1260 },
    { name: 'E ENJTE', total: 500, sold: 365, revenue: 1095 },
    { name: 'E PREMTE', total: 500, sold: 445, revenue: 1335 },
    { name: 'E SHTUNE', total: 1000, sold: 895, revenue: 2685 },
    { name: 'E DIELË', total: 1000, sold: 920, revenue: 2760 },
    { name: 'ANA CARLA MAZA', total: 2000, sold: 1650, revenue: 16500 },
    { name: 'Muse-X Festival', total: 5000, sold: 4200, revenue: 105000 }
  ];

  const totalTicketsCapacity = eventTickets.reduce((sum, e) => sum + e.total, 0);
  const totalTicketsSold = eventTickets.reduce((sum, e) => sum + e.sold, 0);
  const totalRevenue = eventTickets.reduce((sum, e) => sum + e.revenue, 0);
  const ticketPercentage = ((totalTicketsSold / totalTicketsCapacity) * 100).toFixed(1);
  const activeMembers = Math.floor(Math.random() * 150) + 50;

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

  const handleOpenModal = (eventId = null) => {
    if (eventId && events[eventId]) {
      const event = events[eventId];
      setFormData({
        name: event.name,
        price: event.price,
        zones: event.zones.join(', '),
        description: event.description,
        image: event.image || null,
        imagePreview: event.image || null
      });
      setEditingEventId(eventId);
    } else {
      setFormData({ name: '', price: '', zones: '', description: '', image: null, imagePreview: null });
      setEditingEventId(null);
    }
    setShowEventModal(true);
  };

  const handleCloseModal = () => {
    setShowEventModal(false);
    setFormData({ name: '', price: '', zones: '', description: '', image: null, imagePreview: null });
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
    if (!formData.name || !formData.price || !formData.zones || !formData.description) {
      alert('Please fill in all fields');
      return;
    }

    const eventData = {
      name: formData.name,
      price: parseInt(formData.price),
      zones: formData.zones.split(',').map(z => z.trim()),
      description: formData.description,
      image: formData.image || null
    };

    if (editingEventId) {
      updateEvent(editingEventId, eventData);
      alert('Event updated successfully');
    } else {
      addEvent(eventData);
      alert('Event created successfully');
    }
    handleCloseModal();
  };

  const handleDeleteEvent = (id) => {
    deleteEvent(id);
    setDeleteConfirmId(null);
    alert('Event deleted successfully');
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
            value={`€${totalRevenue.toLocaleString()}`}
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-400 font-semibold">€{event.revenue.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Summary Footer */}
          <div className="bg-madverse-dark border-t border-gray-700 px-6 py-4 flex justify-between items-center">
            <div>
              <p className="text-gray-400 font-body text-sm">Total across all events</p>
            </div>
            <div className="flex gap-8">
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
                <p className="text-yellow-400 font-display text-lg">€{totalRevenue.toLocaleString()}</p>
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
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Zones</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(events).map(([id, event]) => (
                  <tr key={id} className="border-b border-gray-700 hover:bg-madverse-darker/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">{event.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-400 font-semibold">€{event.price}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{event.zones.length} zones</td>
                    <td className="px-6 py-4 text-sm text-gray-400 truncate">{event.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenModal(id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-body text-xs py-1 px-3 rounded transition-colors"
                        >
                          Edit
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
                ))}
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
                  <label className="block text-gray-300 font-body text-sm mb-2">Price (€)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-madverse-dark border border-gray-700 text-white px-4 py-2 rounded font-body focus:outline-none focus:border-purple-500"
                    placeholder="e.g., 1000"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-body text-sm mb-2">Zones (comma-separated)</label>
                  <textarea
                    value={formData.zones}
                    onChange={(e) => setFormData({ ...formData, zones: e.target.value })}
                    className="w-full bg-madverse-dark border border-gray-700 text-white px-4 py-2 rounded font-body focus:outline-none focus:border-purple-500"
                    placeholder="e.g., VIP - 1500€, Standard - 1000€, General - 800€"
                    rows={3}
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
    <div style={{ padding: 20 }}>
      <h1>Tickets</h1>
      {error && <div style={{ color: 'red' }}>{error}</div>}

      <form onSubmit={handleCreate} style={{ marginBottom: 20 }}>
        <h2>Create Ticket</h2>
        <div>
          <label>Title</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label>Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)}>
            <option>Open</option>
            <option>In Progress</option>
            <option>Closed</option>
          </select>
        </div>
        <div>
          <label>Priority</label>
          <select value={priority} onChange={e => setPriority(e.target.value)}>
            <option>Low</option>
            <option>Normal</option>
            <option>High</option>
          </select>
        </div>
        <button type="submit">Create</button>
      </form>

      <h2>All Tickets</h2>
      <table border="1" cellPadding="4" cellSpacing="0">
        <thead>
          <tr>
            <th>Id</th>
            <th>Title</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map(t => (
            <tr key={t.Id}>
              <td>{t.Id}</td>
              <td>{t.Title}</td>
              <td>{t.Status}</td>
              <td>{t.Priority}</td>
              <td>{new Date(t.CreatedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Layout({ children }) {
  const navigate = useNavigate();
  function logout() {
    setToken(null);
    setIsAdminFlag(false);
    navigate('/');
  }
  return (
    <div>
      <nav style={{ padding: 10, borderBottom: '1px solid #ccc' }}>
        <button onClick={() => navigate('/')}>Home</button>
        <button onClick={() => navigate('/tickets')}>Tickets</button>
        <button onClick={() => navigate('/checkout')}>Checkout</button>
        <button onClick={() => navigate('/dashboard')}>Admin Dashboard</button>
        <button onClick={logout} style={{ float: 'right' }}>Logout</button>
      </nav>
      {children}
    </div>
  );
}

function LandingPage() {
  const navigate = useNavigate();
  const { basket } = useBasket();
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('bg-madverse-dark', 'text-white');
      document.body.classList.remove('bg-white', 'text-gray-900');
    } else {
      document.body.classList.remove('bg-madverse-dark', 'text-white');
      document.body.classList.add('bg-white', 'text-gray-900');
    }
  }, [darkMode]);

  return (
    <>
      {/* Header */}
      <header className="bg-madverse-darker border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3">
                <span className="text-black font-bold text-sm">M</span>
              </div>
              <span className="text-white font-bold text-xl font-festival tracking-wider">MADVERSE</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <div className="dropdown-container">
                <button className="text-sm uppercase font-body font-semibold" onClick={() => navigate('/events')}>Events</button>
                <div className="dropdown-menu"></div>
              </div>
            </nav>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => navigate('/checkout')}
                className="text-sm uppercase font-body font-semibold border border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white px-3 py-1 rounded transition-colors relative"
              >
                🛒 {basket.length > 0 && <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{basket.length}</span>}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="text-sm uppercase font-body font-semibold border border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white px-3 py-1 rounded transition-colors"
              >
                Admin Dashboard
              </button>
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
              <button
                type="button"
                onClick={() => setDarkMode(v => !v)}
                className="text-sm uppercase font-body font-semibold border border-gray-500 px-3 py-1 rounded"
              >
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </button>
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
              <button className="px-8 py-3 border border-white text-white hover:bg-white hover:text-madverse-dark transition-colors duration-300 rounded flex items-center justify-center space-x-2 font-body font-semibold tracking-wide">
                <span>WATCH AFTERMOVIE</span>
              </button>
            </div>
          </div>
        </div>
      </section>



      {/* Fixed Radio */}
      <div className="fixed bottom-4 left-4 bg-madverse-darker rounded-full px-4 py-3 flex items-center space-x-4 shadow-lg">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
            <span className="text-madverse-dark font-bold text-sm">M</span>
          </div>
          <div className="text-xs">
            <div className="font-bold font-festival tracking-wider">MADVERSE</div>
            <div className="font-body font-semibold">RADIO</div>
          </div>
        </div>
      </div>

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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Order Items */}
              <div className="lg:col-span-2">
                <div className="bg-madverse-darker border border-gray-700 rounded-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-700 bg-madverse-dark">
                    <h2 className="text-xl font-bold font-display text-white">Order Summary</h2>
                  </div>

                  <div className="divide-y divide-gray-700">
                    {basket.map((item, idx) => (
                      <div key={idx} className="p-6 hover:bg-madverse-dark/50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold font-display text-white mb-2">{item.eventName}</h3>
                            <div className="space-y-1">
                              <p className="text-gray-400 font-body text-sm">Zone: <span className="text-purple-400 font-semibold">{item.zone}</span></p>
                              <p className="text-gray-400 font-body text-sm">Quantity: <span className="text-purple-400 font-semibold">×{item.quantity}</span></p>
                              <p className="text-gray-400 font-body text-sm">Price per ticket: <span className="text-yellow-400 font-semibold">EUR {item.price}</span></p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold font-display text-yellow-400 mb-4">EUR {item.total}</p>
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
                      <span className="text-white font-semibold">EUR {total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 font-body">Fees</span>
                      <span className="text-white font-semibold">EUR 0</span>
                    </div>
                    <div className="border-t border-gray-700 pt-4 flex justify-between">
                      <span className="text-white font-bold">Total</span>
                      <span className="text-yellow-400 font-bold font-display text-2xl">EUR {total}</span>
                    </div>
                  </div>

                  <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-body font-bold py-3 rounded uppercase tracking-wide transition-colors mb-3">
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

function EventsPage() {
  const navigate = useNavigate();
  const { basket } = useBasket();
  const { events } = useEvents();

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
    <div className="min-h-screen bg-madverse-dark">
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
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => navigate('/checkout')}
                className="text-sm uppercase font-body font-semibold border border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white px-3 py-1 rounded transition-colors relative"
              >
                🛒 {basket.length > 0 && <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{basket.length}</span>}
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-sm uppercase font-body font-semibold border border-white px-3 py-1 rounded hover:bg-white hover:text-madverse-dark transition-colors"
              >
                Home
              </button>
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
                  <div className="h-32 w-full relative overflow-hidden">
                    <img src={event.image} alt={event.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-white font-display text-xl font-bold">{event.name}</div>
                        <div className="text-gray-300 font-body text-xs uppercase tracking-wider">{display.day}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={`h-32 w-full ${display.image} flex items-center justify-center relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="relative z-10 text-center">
                      <div className="text-white font-display text-xl font-bold">{event.name}</div>
                      <div className="text-gray-300 font-body text-xs uppercase tracking-wider">{display.day}</div>
                    </div>
                  </div>
                )}

                {/* Event Info */}
                <div className="p-4">
                  <p className="text-gray-400 font-body text-xs mb-3">{display.date}</p>
                  
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-white font-body font-semibold text-sm">FROM €{event.price}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(`/event/${id}`)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-body font-bold text-sm py-2 rounded transition-colors uppercase tracking-wide"
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
  const eventId = parseInt(id);
  const { basket, addToBasket } = useBasket();
  const { events } = useEvents();
  
  const [selectedZone, setSelectedZone] = useState('General');
  const [quantity, setQuantity] = useState(1);

  const event = events[eventId];

  // Set initial zone when event loads
  useEffect(() => {
    if (event && event.zones.length > 0) {
      setSelectedZone(event.zones[0]);
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
    addToBasket({ 
      eventId,
      eventName: event.name, 
      zone: selectedZone, 
      quantity, 
      price: event.price,
      total: event.price * quantity
    });
    setQuantity(1);
    // Optional: Show success message or navigate to checkout
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Selection */}
            <div className="lg:col-span-2">
              {/* SELECT Section */}
              <div className="bg-madverse-darker border border-gray-700 rounded-lg p-8 mb-8">
                <h2 className="text-2xl font-bold font-display text-white mb-6">SELECT:</h2>

                {/* Select Zone */}
                <div className="mb-6">
                  <label className="text-gray-300 font-body text-sm mb-2 block">Select zone</label>
                  <select
                    value={selectedZone}
                    onChange={(e) => setSelectedZone(e.target.value)}
                    className="w-full bg-madverse-dark border border-gray-700 text-white font-body p-3 rounded cursor-pointer hover:border-purple-500 transition-colors"
                  >
                    {event.zones.map((zone, idx) => (
                      <option key={idx} value={zone}>{zone}</option>
                    ))}
                  </select>
                </div>

                {/* Number of Tickets */}
                <div className="mb-6">
                  <label className="text-gray-300 font-body text-sm mb-3 block">Select number of tickets you want to order</label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="bg-purple-600 hover:bg-purple-700 text-white w-10 h-10 rounded flex items-center justify-center font-bold transition-colors"
                    >
                      −
                    </button>
                    <span className="text-white font-display text-2xl w-8 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="bg-purple-600 hover:bg-purple-700 text-white w-10 h-10 rounded flex items-center justify-center font-bold transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Price and SELECT Button */}
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-400 font-body text-xs mb-1">Ticket price:</p>
                    <p className="text-white font-display text-lg font-bold">EUR {event.price}</p>
                  </div>
                  <button
                    onClick={handleAddToBasket}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-body font-bold px-8 py-3 rounded uppercase tracking-wide transition-colors"
                  >
                    SELECT
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
                          <p className="text-gray-300 font-body text-xs">{item.zone}</p>
                          <div className="flex justify-between mt-2">
                            <span className="text-purple-400 font-body text-sm">×{item.quantity}</span>
                            <span className="text-yellow-400 font-bold font-body">EUR {item.price * item.quantity}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-gray-700 pt-4">
                      <div className="flex justify-between mb-4">
                        <span className="text-gray-300 font-body">Total:</span>
                        <span className="text-yellow-400 font-bold font-display text-lg">EUR {basketTotal}</span>
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

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/event/:id" element={<EventDetailPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
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
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
