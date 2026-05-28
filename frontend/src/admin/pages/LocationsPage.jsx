import React, { useEffect, useState } from 'react';
import { DataTable } from '../components/common';
import { eventApi } from '../../utils/api';

export const LocationsPage = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
