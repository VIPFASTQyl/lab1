import React from 'react';
import { DataTable, StatusBadge } from '../components/common';

const mockTickets = [
  { id: 1, event: 'Summer Music Festival', type: 'General Access', sold: 5420, total: 10000, revenue: '$243,900', status: 'active' },
  { id: 2, event: 'Broadway Show', type: 'VIP Pass', sold: 1200, total: 2000, revenue: '$144,000', status: 'active' },
  { id: 3, event: 'Tech Conference', type: 'Workshop Pass', sold: 120, total: 500, revenue: '$11,880', status: 'draft' },
];

export const TicketsPage = () => {
  const [tickets, setTickets] = React.useState(mockTickets);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tickets Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Monitor ticket sales and availability</p>
      </div>

      <DataTable
        title="All Tickets"
        columns={[
          { key: 'event', label: 'Event', sortable: true },
          { key: 'type', label: 'Ticket Type', sortable: true },
          { key: 'sold', label: 'Sold', sortable: true },
          { key: 'total', label: 'Total', sortable: true },
          { key: 'revenue', label: 'Revenue', sortable: true },
          { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
        ]}
        data={tickets}
        searchable={true}
      />
    </div>
  );
};
