import React, { useEffect, useState } from 'react';
import { DataTable } from '../components/common';
import { Button } from '../../components/ui';
import { organizersApi } from '../../utils/api';

export const OrganizersPage = () => {
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    Name: '',
    Email: '',
    Phone: '',
    Address: '',
    OrganizerType: '',
    Description: '',
  });

  const fetchOrganizers = async () => {
    try {
      setLoading(true);
      const data = await organizersApi.getAll();
      const mapped = (data || []).map((organizer) => ({
        id: organizer.OrganizerId,
        name: organizer.Name,
        email: organizer.Email || '',
        phone: organizer.Phone || '',
        address: organizer.Address || '',
        organizerType: organizer.OrganizerType || '',
        description: organizer.Description || '',
      }));
      setOrganizers(mapped);
      setError(null);
    } catch (err) {
      console.error('Failed to load organizers:', err);
      setError('Failed to load organizers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.Name.trim() || !formData.OrganizerType.trim()) {
      setError('Organizer name and type are required');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const payload = {
        Name: formData.Name.trim(),
        Email: formData.Email.trim() || null,
        Phone: formData.Phone.trim() || null,
        Address: formData.Address.trim() || null,
        OrganizerType: formData.OrganizerType.trim(),
        Description: formData.Description.trim() || null,
      };
      if (editingId) {
        await organizersApi.update(editingId, payload);
      } else {
        await organizersApi.create(payload);
      }
      setFormData({
        Name: '',
        Email: '',
        Phone: '',
        Address: '',
        OrganizerType: '',
        Description: '',
      });
      setEditingId(null);
      await fetchOrganizers();
    } catch (err) {
      console.error('Failed to create organizer:', err);
      setError(err.response?.data?.message || 'Failed to add organizer');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (organizer) => {
    const runDelete = async () => {
      try {
        setError(null);
        await organizersApi.delete(organizer.id);
        setOrganizers((prev) => prev.filter((item) => item.id !== organizer.id));
      } catch (err) {
        console.error('Failed to delete organizer:', err);
        setError(err.response?.data?.message || 'Failed to delete organizer');
      }
    };

    if (window.confirm(`Delete organizer ${organizer.name}?`)) runDelete();
  };

  const handleEdit = (organizer) => {
    setEditingId(organizer.id);
    setFormData({
      Name: organizer.name || '',
      Email: organizer.email || '',
      Phone: organizer.phone || '',
      Address: organizer.address || '',
      OrganizerType: organizer.organizerType || '',
      Description: organizer.description || '',
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ Name: '', Email: '', Phone: '', Address: '', OrganizerType: '', Description: '' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Organizers Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage event organizers and assign them to events</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add New Organizer</h2>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            name="Name"
            value={formData.Name}
            onChange={handleChange}
            placeholder="Organizer name"
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            required
          />
          <input
            type="email"
            name="Email"
            value={formData.Email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
          />
          <input
            type="text"
            name="Phone"
            value={formData.Phone}
            onChange={handleChange}
            placeholder="Phone"
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
          />
          <input
            type="text"
            name="Address"
            value={formData.Address}
            onChange={handleChange}
            placeholder="Address"
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
          />
          <input
            type="text"
            name="OrganizerType"
            value={formData.OrganizerType}
            onChange={handleChange}
            placeholder="Organizer type"
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            required
          />
          <input
            type="text"
            name="Description"
            value={formData.Description}
            onChange={handleChange}
            placeholder="Description (optional)"
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
          />
          <div className="md:col-span-3">
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Update Organizer' : 'Add Organizer'}
            </Button>
            {editingId && (
              <button type="button" onClick={handleCancel} className="ml-3 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 text-center text-gray-600 dark:text-gray-300">
          Loading organizers...
        </div>
      ) : (
        <DataTable
          title="All Organizers"
          columns={[
            { key: 'name', label: 'Organizer Name', sortable: true },
            { key: 'email', label: 'Email', sortable: true },
            { key: 'phone', label: 'Phone', sortable: true },
            { key: 'organizerType', label: 'Type', sortable: true },
            { key: 'address', label: 'Address', sortable: true },
            { key: 'description', label: 'Description', sortable: true },
          ]}
          data={organizers}
          searchable={true}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};
