import React, { useEffect, useState } from 'react';
import { DataTable, StatusBadge } from '../components/common';
import { Button } from '../../components/ui';
import { eventApi, salesApi } from '../../utils/api';

export const TicketsPage = () => {
  const [ticketSummary, setTicketSummary] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [events, setEvents] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    eventId: '',
    sectorId: '',
    seatNumber: '',
    price: '',
    ticketType: 'General',
  });

  // Fetch events and sectors on mount
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [eventsData, sectorsData] = await Promise.all([
        eventApi.getAll(),
        eventApi.getSectors(),
      ]);
      setEvents(eventsData || []);
      setSectors(sectorsData || []);
      setError(null);
    } catch (err) {
      console.error('Failed to load initial data:', err);
      setError('Failed to load events and sectors');
    } finally {
      setLoading(false);
    }
  };

  const fetchTickets = async () => {
    try {
      const allTickets = await salesApi.getTickets();
      setTickets(allTickets || []);
      
      // Fetch ticket summary (grouped by event & ticket type)
      // Group tickets by event and type
      const grouped = {};
      (allTickets || []).forEach((ticket) => {
        const key = `${ticket.EventId}-${ticket.TicketType}`;
        if (!grouped[key]) {
          grouped[key] = {
            eventId: ticket.EventId,
            eventName: events.find(e => e.EventId === ticket.EventId)?.Title || `Event ${ticket.EventId}`,
            type: ticket.TicketType,
            total: 0,
            sold: 0,
            available: 0,
            revenue: 0,
          };
        }
        grouped[key].total += 1;
        if (ticket.Status === 'Sold') {
          grouped[key].sold += 1;
          grouped[key].revenue += ticket.Price;
        } else {
          grouped[key].available += 1;
        }
      });

      const summary = Object.values(grouped).map((item, idx) => ({
        id: idx,
        event: item.eventName,
        type: item.type,
        sold: item.sold,
        total: item.total,
        available: item.available,
        revenue: `$${item.revenue.toFixed(2)}`,
        status: item.total === item.sold ? 'sold-out' : item.available === 0 ? 'sold-out' : 'active',
      }));

      setTicketSummary(summary);
    } catch (err) {
      console.error('Failed to load ticket data:', err);
      setError('Failed to load ticket data');
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (events.length > 0) {
      fetchTickets();
    }
  }, [events]);

  const handleDelete = (ticket) => {
    const runDelete = async () => {
      try {
        setError(null);
        await salesApi.deleteTicket(ticket.TicketId || ticket.id);
        setTickets((prev) => prev.filter((row) => (row.TicketId || row.id) !== (ticket.TicketId || ticket.id)));
        await fetchTickets();
      } catch (err) {
        console.error('Failed to delete ticket:', err);
        setError(err.response?.data?.message || 'Failed to delete ticket');
      }
    };

    if (window.confirm('Delete this ticket?')) runDelete();
  };

  const handleEdit = async (ticket) => {
    const priceInput = window.prompt('Ticket price', String(ticket.Price ?? ''));
    if (priceInput === null) return;
    const statusInput = window.prompt('Ticket status', String(ticket.Status || 'Available'));
    if (statusInput === null) return;
    const typeInput = window.prompt('Ticket type', String(ticket.TicketType || 'General'));
    if (typeInput === null) return;

    try {
      await salesApi.updateTicket(ticket.TicketId || ticket.id, {
        price: Number(priceInput),
        status: statusInput,
        ticketType: typeInput,
      });
      await fetchTickets();
    } catch (err) {
      console.error('Failed to update ticket:', err);
      setError(err.response?.data?.message || 'Failed to update ticket');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
          onEdit={handleEdit}
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.eventId || !formData.sectorId || !formData.seatNumber || !formData.price) {
      setError('Event, sector, seat number, and price are required');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await salesApi.createTicket({
        eventId: Number(formData.eventId),
        sectorId: Number(formData.sectorId),
        seatNumber: formData.seatNumber.trim(),
        price: Number(formData.price),
        ticketType: formData.ticketType,
      });
      setFormData({ eventId: '', sectorId: '', seatNumber: '', price: '', ticketType: 'General' });
      await fetchTicketSummary();
    } catch (err) {
      console.error('Failed to create ticket:', err);
      setError(err.response?.data?.message || 'Failed to add ticket');
    } finally {
      setSaving(false);
    }
  };

  const selectedEvent = formData.eventId ? events.find(e => e.EventId === Number(formData.eventId)) : null;
  const filteredSectors = selectedEvent
    ? (sectors || []).filter(s => Number(s.VenueId) === Number(selectedEvent.VenueId))
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tickets Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Create and monitor event tickets</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Create New Ticket</h2>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <select
            name="eventId"
            value={formData.eventId}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            required
          >
            <option value="">Select Event</option>
            {events.map((event) => (
              <option key={event.EventId} value={event.EventId}>
                {event.Title}
              </option>
            ))}
          </select>

          <select
            name="sectorId"
            value={formData.sectorId}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            required
            disabled={!formData.eventId}
          >
            <option value="">Select Sector</option>
            {filteredSectors.map((sector) => (
              <option key={sector.SectorId} value={sector.SectorId}>
                {sector.SectorName || sector.Name}
              </option>
            ))}
          </select>

          <input
            type="text"
            name="seatNumber"
            value={formData.seatNumber}
            onChange={handleChange}
            placeholder="Seat (e.g., A1)"
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            required
          />

          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="Price"
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            required
          />

          <input
            type="text"
            name="ticketType"
            value={formData.ticketType}
            onChange={handleChange}
            placeholder="Type (General, VIP, etc.)"
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
          />

          <div className="md:col-span-5">
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Creating...' : 'Create Ticket'}
            </Button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 text-center text-gray-600 dark:text-gray-300">
          Loading ticket data...
        </div>
      ) : (
        <div className="space-y-6">
          <DataTable
            title="Ticket Summary by Event"
            columns={[
              { key: 'event', label: 'Event', sortable: true },
              { key: 'type', label: 'Ticket Type', sortable: true },
              { key: 'total', label: 'Total', sortable: true },
              { key: 'sold', label: 'Sold', sortable: true },
              { key: 'available', label: 'Available', sortable: true },
              { key: 'revenue', label: 'Revenue', sortable: true },
              { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
            ]}
            data={ticketSummary}
            searchable={true}
          />

          <DataTable
            title="All Tickets"
            columns={[
              { key: 'TicketId', label: 'Ticket ID', sortable: true },
              { key: 'EventId', label: 'Event', sortable: true, render: (val) => events.find((event) => event.EventId === Number(val))?.Title || `Event ${val}` },
              { key: 'SectorId', label: 'Sector', sortable: true, render: (val) => sectors.find((sector) => sector.SectorId === Number(val))?.SectorName || `Sector ${val}` },
              { key: 'SeatNumber', label: 'Seat', sortable: true },
              { key: 'Price', label: 'Price', sortable: true, render: (val) => `$${Number(val || 0).toFixed(2)}` },
              { key: 'Status', label: 'Status', sortable: true, render: (val) => <StatusBadge status={String(val || '').toLowerCase()} /> },
              { key: 'TicketType', label: 'Type', sortable: true },
            ]}
            data={tickets}
            searchable={true}
            onDelete={handleDelete}
          />
        </div>
      )}
    </div>
  );
};
