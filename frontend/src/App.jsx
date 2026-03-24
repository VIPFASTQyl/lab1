import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

const API_BASE = '/api';

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

function decodeJwt(token) {
  try {
    const [, payload] = token.split('.');
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function ProtectedRoute({ children, requireAdmin = false }) {
  const token = getToken();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (requireAdmin && !isAdminClient()) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || 'Login failed');
        return;
      }
      const data = await res.json();
      setToken(data.token);
      const payload = decodeJwt(data.token);
      setIsAdminFlag(payload?.isAdmin);
      navigate(payload?.isAdmin ? '/dashboard' : '/');
    } catch (err) {
      setError('Network error');
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '40px auto' }}>
      <h1>TicketApp Login</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 8 }}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width: '100%' }}
            required
          />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%' }}
            required
          />
        </div>
        {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
        <button type="submit">Login</button>
      </form>
      <p style={{ marginTop: 16 }}>
        No account?{' '}
        <button type="button" onClick={() => navigate('/register')}>
          Register here
        </button>
      </p>
    </div>
  );
}

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || 'Registration failed');
        return;
      }
      setSuccess('Registration successful. You can now log in.');
      setTimeout(() => navigate('/login'), 1000);
    } catch {
      setError('Network error');
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '40px auto' }}>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 8 }}>
          <label>Name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            style={{ width: '100%' }}
            required
          />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width: '100%' }}
            required
          />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%' }}
            required
          />
        </div>
        {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
        {success && <div style={{ color: 'green', marginBottom: 8 }}>{success}</div>}
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadSummary() {
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
        setSummary(data);
      } catch (err) {
        setError('Network error');
      }
    }
    loadSummary();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Dashboard</h1>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {summary && (
        <div style={{ display: 'flex', gap: 16 }}>
          <div>
            <strong>Total Tickets</strong>
            <div>{summary.totalTickets}</div>
          </div>
          <div>
            <strong>Open Tickets</strong>
            <div>{summary.openTickets}</div>
          </div>
          <div>
            <strong>Closed Tickets</strong>
            <div>{summary.closedTickets}</div>
          </div>
        </div>
      )}
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
    navigate('/login');
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
                <button className="text-sm uppercase font-body font-semibold">Festivals</button>
                <div className="dropdown-menu"></div>
              </div>
              <div className="dropdown-container">
                <button className="text-sm uppercase font-body font-semibold">Experiences</button>
                <div className="dropdown-menu"></div>
              </div>
              <div className="dropdown-container">
                <button className="text-sm uppercase font-body font-semibold">Store</button>
                <div className="dropdown-menu"></div>
              </div>
              <div className="dropdown-container">
                <button className="text-sm uppercase font-body font-semibold">Music</button>
                <div className="dropdown-menu"></div>
              </div>
              <div className="dropdown-container">
                <button className="text-sm uppercase font-body font-semibold">More</button>
                <div className="dropdown-menu"></div>
              </div>
            </nav>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => setDarkMode(v => !v)}
                className="text-sm uppercase font-body font-semibold border border-gray-500 px-3 py-1 rounded"
              >
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm uppercase font-body font-semibold border border-white px-3 py-1 rounded"
              >
                Sign In / Register
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
                onClick={() => navigate('/tickets')}
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
  return (
    <div style={{ padding: 20 }}>
      <h1>Checkout</h1>
      <p>This is a placeholder checkout page where selected tickets would be reviewed and purchased.</p>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requireAdmin>
            <Layout>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        }
      />
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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
