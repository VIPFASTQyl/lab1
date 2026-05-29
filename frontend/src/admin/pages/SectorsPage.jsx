import React, { useEffect, useState } from 'react';
import { DataTable } from '../components/common';
import { Button } from '../../components/ui';
import { eventApi } from '../../utils/api';

export const SectorsPage = () => {
  const [sectors, setSectors] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    VenueId: '',
    SectorName: '',
    Capacity: '',
    BasePrice: '',
    Description: '',
  });

  const fetchSectors = async () => {
    try {
      setLoading(true);
      const data = await eventApi.getSectors();
      const mapped = (data || []).map((sector) => ({
        id: sector.SectorId,
        sectorName: sector.SectorName,
        venueName: sector.VenueName || 'N/A',
        venueId: sector.VenueId,
        capacity: sector.Capacity || 0,
        basePrice: sector.BasePrice || 0,
        description: sector.Description || '',
      }));
      setSectors(mapped);
      setError(null);
    } catch (err) {
      console.error('Failed to load sectors:', err);
      setError('Failed to load sectors');
    } finally {
      setLoading(false);
    }
  };

  const fetchVenues = async () => {
    try {
      const data = await eventApi.getVenues();
      setVenues(data || []);
    } catch (err) {
      console.error('Failed to load venues:', err);
    }
  };

  useEffect(() => {
    fetchSectors();
    fetchVenues();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.VenueId || !formData.SectorName.trim() || !formData.Capacity || formData.BasePrice === '') {
      setError('Venue, sector name, capacity, and base price are required');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const payload = {
        VenueId: Number(formData.VenueId),
        SectorName: formData.SectorName.trim(),
        Capacity: Number(formData.Capacity),
        BasePrice: Number(formData.BasePrice),
        Description: formData.Description.trim() || null,
      };
      if (editingId) {
        await eventApi.updateSector(editingId, payload);
      } else {
        await eventApi.createSector(payload);
      }
      setFormData({ VenueId: '', SectorName: '', Capacity: '', BasePrice: '', Description: '' });
      setEditingId(null);
      await fetchSectors();
    } catch (err) {
      console.error('Failed to create sector:', err);
      setError(err.response?.data?.message || 'Failed to add sector');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (sector) => {
    const runDelete = async () => {
      try {
        setError(null);
        await eventApi.deleteSector(sector.id);
        setSectors((prev) => prev.filter((s) => s.id !== sector.id));
      } catch (err) {
        console.error('Failed to delete sector:', err);
        setError(err.response?.data?.message || 'Failed to delete sector');
      }
    };

    if (window.confirm(`Delete sector ${sector.sectorName}?`)) runDelete();
  };

  const handleEdit = (sector) => {
    setEditingId(sector.id);
    setFormData({
      VenueId: sector.venueId || '',
      SectorName: sector.sectorName || '',
      Capacity: sector.capacity || '',
      BasePrice: sector.basePrice || '',
      Description: sector.description || '',
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ VenueId: '', SectorName: '', Capacity: '', BasePrice: '', Description: '' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sectors Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage venue sectors and seating areas</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add New Sector</h2>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <select
            name="VenueId"
            value={formData.VenueId}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            required
          >
            <option value="">Select Venue</option>
            {venues.map((venue) => (
              <option key={venue.VenueId} value={venue.VenueId}>
                {venue.Name}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="SectorName"
            value={formData.SectorName}
            onChange={handleChange}
            placeholder="Sector name"
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
            required
          />
          <input
            type="number"
            name="BasePrice"
            step="0.01"
            min="0"
            value={formData.BasePrice}
            onChange={handleChange}
            placeholder="Base price"
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
          <div className="md:col-span-5">
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Update Sector' : 'Add Sector'}
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
          Loading sectors...
        </div>
      ) : (
        <DataTable
          title="All Sectors"
          columns={[
            { key: 'sectorName', label: 'Sector Name', sortable: true },
            { key: 'venueName', label: 'Venue', sortable: true },
            { key: 'capacity', label: 'Capacity', sortable: true },
            { key: 'basePrice', label: 'Base Price', sortable: true },
            { key: 'description', label: 'Description', sortable: true },
          ]}
          data={sectors}
          searchable={true}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};
