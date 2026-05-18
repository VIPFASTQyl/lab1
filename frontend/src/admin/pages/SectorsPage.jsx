import React from 'react';
import { DataTable, StatusBadge } from '../components/common';

const mockSectors = [
  { id: 1, name: 'General Admission', venueName: 'Central Park', seats: 10000, price: 45, status: 'available' },
  { id: 2, name: 'VIP', venueName: 'Central Park', seats: 2000, price: 120, status: 'available' },
  { id: 3, name: 'Premium VIP', venueName: 'Madison Square Garden', seats: 500, price: 250, status: 'sold_out' },
];

export const SectorsPage = () => {
  const [sectors, setSectors] = React.useState(mockSectors);

  const handleDelete = (sector) => {
    if (window.confirm(`Delete sector ${sector.name}?`)) {
      setSectors(sectors.filter(s => s.id !== sector.id));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sectors Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage venue sectors and seating areas</p>
      </div>

      <DataTable
        title="All Sectors"
        columns={[
          { key: 'name', label: 'Sector Name', sortable: true },
          { key: 'venueName', label: 'Venue', sortable: true },
          { key: 'seats', label: 'Total Seats', sortable: true },
          { key: 'price', label: 'Base Price', sortable: true },
          { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
        ]}
        data={sectors}
        searchable={true}
        onDelete={handleDelete}
      />
    </div>
  );
};
