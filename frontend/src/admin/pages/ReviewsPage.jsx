import React, { useEffect, useMemo, useState } from 'react';
import { DataTable } from '../components/common';
import { Button } from '../../components/ui';
import { eventApi, ratingsApi, salesApi } from '../../utils/api';

export const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [events, setEvents] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    EventId: '',
    ClientId: '',
    Rating: '5',
    Comment: '',
  });

  const eventById = useMemo(() => {
    const map = new Map();
    for (const event of events || []) {
      map.set(Number(event.EventId), event.Title || `Event ${event.EventId}`);
    }
    return map;
  }, [events]);

  const clientById = useMemo(() => {
    const map = new Map();
    for (const client of clients || []) {
      map.set(Number(client.ClientId), `${client.FirstName || ''} ${client.LastName || ''}`.trim() || `Client ${client.ClientId}`);
    }
    return map;
  }, [clients]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ratingsData, eventsData, clientsData] = await Promise.all([
        ratingsApi.getAdminAll(),
        eventApi.getAll(),
        salesApi.getClients(),
      ]);

      setEvents(eventsData || []);
      setClients(clientsData || []);

      const mapped = (ratingsData || []).map((row) => ({
        id: row.RatingId,
        EventId: Number(row.EventId),
        ClientId: Number(row.ClientId),
        rating: Number(row.Rating),
        comment: row.Comment || '',
        date: row.RatingDate ? new Date(row.RatingDate).toISOString().slice(0, 10) : '',
        event: `Event ${row.EventId}`,
        reviewer: `Client ${row.ClientId}`,
      }));

      setReviews(mapped);
      setError(null);
    } catch (err) {
      console.error('Failed to load reviews:', err);
      setError(err.response?.data?.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!reviews.length) return;
    setReviews((prev) => prev.map((row) => ({
      ...row,
      event: eventById.get(Number(row.EventId)) || `Event ${row.EventId}`,
      reviewer: clientById.get(Number(row.ClientId)) || `Client ${row.ClientId}`,
    })));
  }, [eventById, clientById]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setEditing(null);
    setFormData({ EventId: '', ClientId: '', Rating: '5', Comment: '' });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.EventId || !formData.ClientId || !formData.Rating) {
      setError('Event, customer and rating are required');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await ratingsApi.createAdmin({
        EventId: Number(formData.EventId),
        ClientId: Number(formData.ClientId),
        Rating: Number(formData.Rating),
        Comment: formData.Comment.trim() || null,
      });
      resetForm();
      await fetchData();
    } catch (err) {
      console.error('Failed to create review:', err);
      setError(err.response?.data?.message || 'Failed to add review');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (review) => {
    setEditing(review);
    setFormData({
      EventId: String(review.EventId || ''),
      ClientId: String(review.ClientId || ''),
      Rating: String(review.rating || '5'),
      Comment: review.comment || '',
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editing) return;

    try {
      setSaving(true);
      setError(null);
      await ratingsApi.updateAdmin(editing.id, {
        EventId: Number(formData.EventId),
        ClientId: Number(formData.ClientId),
        Rating: Number(formData.Rating),
        Comment: formData.Comment.trim() || null,
      });
      resetForm();
      await fetchData();
    } catch (err) {
      console.error('Failed to update review:', err);
      setError(err.response?.data?.message || 'Failed to update review');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (review) => {
    const runDelete = async () => {
      try {
        setError(null);
        await ratingsApi.deleteAdmin(review.id);
        setReviews((prev) => prev.filter((r) => r.id !== review.id));
      } catch (err) {
        console.error('Failed to delete review:', err);
        setError(err.response?.data?.message || 'Failed to delete review');
      }
    };

    if (window.confirm('Delete this review?')) runDelete();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reviews Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage all reviews saved in the database</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add / Edit Review</h2>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={editing ? handleUpdate : handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            name="EventId"
            value={formData.EventId}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            required
          >
            <option value="">Select Event</option>
            {(events || []).map((event) => (
              <option key={event.EventId} value={event.EventId}>{event.Title}</option>
            ))}
          </select>

          <select
            name="ClientId"
            value={formData.ClientId}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            required
          >
            <option value="">Select Customer</option>
            {(clients || []).map((client) => (
              <option key={client.ClientId} value={client.ClientId}>
                {`${client.FirstName || ''} ${client.LastName || ''}`.trim()} ({client.Email})
              </option>
            ))}
          </select>

          <select
            name="Rating"
            value={formData.Rating}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            required
          >
            <option value="5">5 - Excellent</option>
            <option value="4">4 - Good</option>
            <option value="3">3 - Average</option>
            <option value="2">2 - Poor</option>
            <option value="1">1 - Bad</option>
          </select>

          <input
            name="Comment"
            value={formData.Comment}
            onChange={handleChange}
            placeholder="Comment (optional)"
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
          />

          <div className="md:col-span-4">
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Saving...' : (editing ? 'Update Review' : 'Add Review')}
            </Button>
            {editing && (
              <button
                type="button"
                onClick={resetForm}
                className="ml-3 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 text-center text-gray-600 dark:text-gray-300">
          Loading reviews...
        </div>
      ) : (
        <DataTable
          title="All Reviews"
          columns={[
            { key: 'reviewer', label: 'Reviewer', sortable: true },
            { key: 'event', label: 'Event', sortable: true },
            { key: 'rating', label: 'Rating', sortable: true },
            { key: 'comment', label: 'Comment', sortable: false },
            { key: 'date', label: 'Date', sortable: true },
          ]}
          data={reviews}
          searchable={true}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};
