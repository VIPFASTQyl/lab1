import React from 'react';
import { DataTable, StatusBadge } from '../components/common';

const mockOrganizers = [
  { id: 1, name: 'Urban Events Inc.', contact: 'contact@urbanevents.com', events: 12, revenue: '$456,000', status: 'active' },
  { id: 2, name: 'Festival Productions', contact: 'info@festivalprod.com', events: 8, revenue: '$234,500', status: 'active' },
  { id: 3, name: 'Concerts Plus', contact: 'hello@concertsplus.com', events: 5, revenue: '$120,000', status: 'inactive' },
];

export const OrganizersPage = () => {
  const [organizers, setOrganizers] = React.useState(mockOrganizers);

  const handleDelete = (organizer) => {
    if (window.confirm(`Delete organizer ${organizer.name}?`)) {
      setOrganizers(organizers.filter(o => o.id !== organizer.id));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Organizers Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage event organizers and partners</p>
      </div>

      <DataTable
        title="All Organizers"
        columns={[
          { key: 'name', label: 'Organizer Name', sortable: true },
          { key: 'contact', label: 'Contact Email', sortable: true },
          { key: 'events', label: 'Events', sortable: true },
          { key: 'revenue', label: 'Total Revenue', sortable: true },
          { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
        ]}
        data={organizers}
        searchable={true}
        onDelete={handleDelete}
      />
    </div>
  );
};
