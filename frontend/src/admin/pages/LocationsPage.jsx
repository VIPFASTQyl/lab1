import React from 'react';
import { DataTable, StatusBadge } from '../components/common';

const mockLocations = [
  { id: 1, name: 'Central Park', city: 'New York', capacity: 50000, status: 'active' },
  { id: 2, name: 'Madison Square Garden', city: 'New York', capacity: 20000, status: 'active' },
  { id: 3, name: 'Staples Center', city: 'Los Angeles', capacity: 19000, status: 'inactive' },
];

export const LocationsPage = () => {
  const [locations, setLocations] = React.useState(mockLocations);

  const handleDelete = (location) => {
    if (window.confirm(`Delete location ${location.name}?`)) {
      setLocations(locations.filter(l => l.id !== location.id));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Locations Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage event venues and locations</p>
      </div>

      <DataTable
        title="All Locations"
        columns={[
          { key: 'name', label: 'Location Name', sortable: true },
          { key: 'city', label: 'City', sortable: true },
          { key: 'capacity', label: 'Capacity', sortable: true },
          { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
        ]}
        data={locations}
        searchable={true}
        onDelete={handleDelete}
      />
    </div>
  );
};
