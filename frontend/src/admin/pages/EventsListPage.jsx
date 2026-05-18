import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DataTable, StatusBadge } from '../components/common';

// Mock data
const mockEvents = [
  {
    id: 1,
    title: 'Summer Music Festival 2024',
    date: '2026-06-15',
    location: 'Central Park, New York',
    status: 'active',
    ticketsSold: 5420,
    revenue: '$243,900',
  },
  {
    id: 2,
    title: 'Broadway Show Night',
    date: '2026-06-20',
    location: 'Times Square Theater, New York',
    status: 'active',
    ticketsSold: 3200,
    revenue: '$208,000',
  },
  {
    id: 3,
    title: 'Tech Conference 2024',
    date: '2026-07-01',
    location: 'Silicon Valley Convention Center',
    status: 'draft',
    ticketsSold: 120,
    revenue: '$11,880',
  },
  {
    id: 4,
    title: 'NBA Finals Game 5',
    date: '2026-06-25',
    location: 'Staples Center, Los Angeles',
    status: 'active',
    ticketsSold: 8900,
    revenue: '$1,335,000',
  },
  {
    id: 5,
    title: 'Jazz Night at the Club',
    date: '2026-07-10',
    location: 'Blue note Jazz Club',
    status: 'active',
    ticketsSold: 450,
    revenue: '$15,750',
  },
];

export const EventsListPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState(mockEvents);

  const handleEdit = (event) => {
    navigate(`/admin/events/${event.id}/edit`, { state: { event } });
  };

  const handleDelete = (event) => {
    if (window.confirm(`Are you sure you want to delete "${event.title}"?`)) {
      setEvents(events.filter(e => e.id !== event.id));
      alert('Event deleted successfully');
    }
  };

  const handleView = (event) => {
    navigate(`/admin/events/${event.id}`, { state: { event } });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Events Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage all your events, create new ones, and track performance</p>
      </div>

      <DataTable
        title="All Events"
        columns={[
          { key: 'title', label: 'Event Title', sortable: true },
          { key: 'date', label: 'Date', sortable: true },
          { key: 'location', label: 'Location', sortable: true },
          { key: 'ticketsSold', label: 'Tickets Sold', sortable: true },
          { key: 'revenue', label: 'Revenue', sortable: true },
          {
            key: 'status',
            label: 'Status',
            render: (val) => <StatusBadge status={val} />,
          },
        ]}
        data={events}
        searchable={true}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        addButton={
          <button
            onClick={() => navigate('/admin/events/new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="h-5 w-5" />
            New Event
          </button>
        }
      />
    </div>
  );
};
