import React, { useEffect, useState } from 'react';
import { DataTable } from '../components/common';
import { Button } from '../../components/ui';
import { eventApi } from '../../utils/api';

export const LocationsPage = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    Name: '',
    Address: '',
    City: '',
    Capacity: '',
  });

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const venues = await eventApi.getVenues();
      const mapped = (venues || []).map((venue) => ({
        id: venue.VenueId,
        name: venue.Name,
        address: venue.Address || '',
        city: venue.City,
        capacity: venue.Capacity || 0,
      }));
      setLocations(mapped);
      setError(null);
    } catch (err) {
      console.error('Failed to load venues:', err);
      setError('Failed to load locations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.Name.trim() || !formData.Address.trim() || !formData.City.trim()) {
      setError('Location name, address and city are required');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await eventApi.createVenue({
        Name: formData.Name.trim(),
        Address: formData.Address.trim(),
        City: formData.City.trim(),
        Capacity: formData.Capacity ? Number(formData.Capacity) : 1000,
      });
      setFormData({ Name: '', Address: '', City: '', Capacity: '' });
      await fetchLocations();
    } catch (err) {
      console.error('Failed to create venue:', err);
      setError(err.response?.data?.message || 'Failed to add location');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (location) => {
    const runDelete = async () => {
      try {
        setError(null);
        await eventApi.deleteVenue(location.id);
        setLocations((prev) => prev.filter((l) => l.id !== location.id));
      } catch (err) {
        console.error('Failed to delete venue:', err);
        setError(err.response?.data?.message || 'Failed to delete location');
      }
    };

    if (window.confirm(`Delete location ${location.name}?`)) runDelete();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Locations Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage event venues and locations</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add New Location</h2>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            name="Name"
            value={formData.Name}
            onChange={handleChange}
            placeholder="Venue name"
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            required
          />
          <input
            type="text"
            name="City"
            value={formData.City}
            onChange={handleChange}
            placeholder="City"
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            required
          />
          <input
            type="text"
            name="Address"
            value={formData.Address}
            onChange={handleChange}
            placeholder="Address"
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            required
          />
          <input
            type="number"
            name="Capacity"
            min="0"
            value={formData.Capacity}
            onChange={handleChange}
            placeholder="Capacity"
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
          />
          <div className="md:col-span-4">
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Saving...' : 'Add Location'}
            </Button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 text-center text-gray-600 dark:text-gray-300">
          Loading locations...
        </div>
      ) : (
        <DataTable
          title="All Locations"
          columns={[
            { key: 'name', label: 'Location Name', sortable: true },
            { key: 'address', label: 'Address', sortable: true },
            { key: 'city', label: 'City', sortable: true },
            { key: 'capacity', label: 'Capacity', sortable: true },
          ]}
          data={locations}
          searchable={true}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};
