import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DataTable, StatusBadge } from '../components/common';
import { eventApi } from '../../utils/api';

// Mock data - kept for fallback only
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
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch events on mount
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventApi.getAll();
      // Transform database format to table format
      const transformedEvents = (data || []).map(event => ({
        id: event.EventId,
        title: event.Title,
        date: event.EventDate,
        location: 'TBD', // Will need venue lookup
        status: event.Status?.toLowerCase() === 'upcoming' ? 'active' : 'draft',
        ticketsSold: 0, // Will need to query ticket sales
        revenue: '$0', // Will need to calculate
        ...event // Keep original data for edit/delete
      }));
      setEvents(transformedEvents);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setError('Failed to load events');
      setEvents(mockEvents); // Fallback to mock data
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event) => {
    navigate(`/admin/events/${event.id}/edit`, { state: { event } });
  };

  const handleDelete = async (event) => {
    if (window.confirm(`Are you sure you want to delete "${event.title}"?`)) {
      try {
        await eventApi.delete(event.id);
        setEvents(events.filter(e => e.id !== event.id));
        alert('Event deleted successfully');
      } catch (err) {
        console.error('Delete failed:', err);
        alert('Failed to delete event');
      }
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

      {loading && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 text-lg">Loading events...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
          <p>{error}</p>
        </div>
      )}

      {!loading && (
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
      )}
    </div>
  );
};
