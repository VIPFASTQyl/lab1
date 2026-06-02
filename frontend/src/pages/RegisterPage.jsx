import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../utils/api';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await authApi.register({ name, email, password });
      const token = res?.token;
      if (!token) throw new Error('No token returned from server');
      localStorage.setItem('authToken', token);
      localStorage.setItem('userName', name);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900">
      <div className="w-full max-w-md bg-white p-8 rounded shadow text-gray-900">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Create your account</h2>

        {error && <div className="mb-4 text-red-600">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label className="block mb-2 text-sm font-medium text-gray-900">Full name</label>
          <input
            type="text"
            className="w-full mb-4 p-2 border rounded text-gray-900 placeholder-gray-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label className="block mb-2 text-sm font-medium text-gray-900">Email</label>
          <input
            type="email"
            className="w-full mb-4 p-2 border rounded text-gray-900 placeholder-gray-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="block mb-2 text-sm font-medium text-gray-900">Password</label>
          <input
            type="password"
            className="w-full mb-4 p-2 border rounded text-gray-900 placeholder-gray-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white p-2 rounded disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-600">
          Already have an account? <Link to="/login" className="text-gray-900 underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
