import React, { useEffect, useState } from 'react';
import { DataTable, StatusBadge } from '../components/common';
import { Button } from '../../components/ui';
import { salesApi } from '../../utils/api';

export const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    FirstName: '',
    LastName: '',
    Email: '',
    Phone: '',
    Address: '',
  });
  const [editing, setEditing] = useState(null);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const data = await salesApi.getClients();
      const mapped = (data || []).map((c) => ({
        id: c.ClientId,
        firstName: c.FirstName,
        lastName: c.LastName,
        name: `${c.FirstName || ''} ${c.LastName || ''}`.trim(),
        email: c.Email,
        phone: c.Phone || '',
        address: c.Address || '',
        joinDate: c.RegistrationDate ? new Date(c.RegistrationDate).toISOString().slice(0, 10) : '',
        status: 'active',
      }));
      setCustomers(mapped);
      setError(null);
    } catch (err) {
      console.error('Failed to load clients:', err);
      setError('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.FirstName.trim() || !formData.LastName.trim() || !formData.Email.trim()) {
      setError('First name, last name and email are required');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      await salesApi.createClient({
        firstName: formData.FirstName.trim(),
        lastName: formData.LastName.trim(),
        email: formData.Email.trim(),
        phone: formData.Phone.trim() || null,
        address: formData.Address.trim() || null,
      });
      setFormData({ FirstName: '', LastName: '', Email: '', Phone: '', Address: '' });
      await fetchClients();
    } catch (err) {
      console.error('Failed to create client:', err);
      setError(err.response?.data?.message || 'Failed to add customer');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (customer) => {
    setEditing(customer);
    setFormData({
      FirstName: customer.firstName || '',
      LastName: customer.lastName || '',
      Email: customer.email || '',
      Phone: customer.phone || '',
      Address: customer.address || '',
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editing) return;
    try {
      setSaving(true);
      setError(null);
      await salesApi.updateClient(editing.id, {
        firstName: formData.FirstName.trim(),
        lastName: formData.LastName.trim(),
        email: formData.Email.trim(),
        phone: formData.Phone.trim() || null,
        address: formData.Address.trim() || null,
      });
      setEditing(null);
      setFormData({ FirstName: '', LastName: '', Email: '', Phone: '', Address: '' });
      await fetchClients();
    } catch (err) {
      console.error('Failed to update client:', err);
      setError(err.response?.data?.message || 'Failed to update customer');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (customer) => {
    const runDelete = async () => {
      try {
        setError(null);
        await salesApi.deleteClient(customer.id);
        setCustomers((prev) => prev.filter((c) => c.id !== customer.id));
      } catch (err) {
        console.error('Failed to delete client:', err);
        setError(err.response?.data?.message || 'Failed to delete customer');
      }
    };
    if (window.confirm(`Delete customer ${customer.name}?`)) runDelete();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Customers Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage customer accounts and view their purchase history</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add / Edit Customer</h2>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">{error}</div>
        )}

        <form onSubmit={editing ? handleUpdate : handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            name="FirstName"
            value={formData.FirstName}
            onChange={handleChange}
            placeholder="First name"
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            required
          />
          <input
            name="LastName"
            value={formData.LastName}
            onChange={handleChange}
            placeholder="Last name"
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            required
          />
          <input
            name="Email"
            value={formData.Email}
            onChange={handleChange}
            placeholder="Email"
            type="email"
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            required
          />
          <input
            name="Phone"
            value={formData.Phone}
            onChange={handleChange}
            placeholder="Phone (optional)"
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
          />
          <input
            name="Address"
            value={formData.Address}
            onChange={handleChange}
            placeholder="Address (optional)"
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white md:col-span-3"
          />
          <div className="md:col-span-4">
            <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Saving...' : (editing ? 'Update Customer' : 'Add Customer')}</Button>
            {editing && <button type="button" onClick={() => { setEditing(null); setFormData({ FirstName: '', LastName: '', Email: '', Phone: '', Address: '' }); }} className="ml-3 px-4 py-2 border rounded-lg">Cancel</button>}
          </div>
        </form>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 text-center text-gray-600 dark:text-gray-300">Loading customers...</div>
      ) : (
        <DataTable
          title="All Customers"
          columns={[
            { key: 'name', label: 'Name', sortable: true },
            { key: 'email', label: 'Email', sortable: true },
            { key: 'phone', label: 'Phone', sortable: true },
            { key: 'totalSpent', label: 'Total Spent', sortable: true },
            { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
            { key: 'joinDate', label: 'Join Date', sortable: true },
          ]}
          data={customers.map(c => ({ ...c, totalSpent: '-' }))}
          searchable={true}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};
