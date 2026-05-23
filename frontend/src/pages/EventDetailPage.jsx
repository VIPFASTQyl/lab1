import React, { useEffect, useMemo, useState } from 'react';
import { Button, Tabs, Alert } from '../components/ui';
import { EventHeaderSection, ReviewsSection } from '../components/events';
import { useCartStore } from '../store';
import { useNavigate, useParams } from 'react-router-dom';
import { eventApi, ratingsApi } from '../utils/api';
import { DEFAULT_EVENT_IMAGE } from '../constants';

export const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [event, setEvent] = useState(null);
  const [venues, setVenues] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [eventData, venueData, ratingsData] = await Promise.all([
          eventApi.getById(id),
          eventApi.getVenues().catch(() => []),
          ratingsApi.getByEvent(id).catch(() => []),
        ]);

        const eventRow = eventData || {};
        const venueRow = (venueData || []).find((v) => String(v.VenueId) === String(eventRow.VenueId)) || null;

        const normalizedEvent = {
          id: eventRow.EventId,
          title: eventRow.Title,
          image: eventRow.ImageUrl || DEFAULT_EVENT_IMAGE,
          date: eventRow.EventDate,
          startTime: eventRow.StartTime || '',
          endTime: eventRow.EndTime || '',
          category: eventRow.Category || 'Other',
          description: eventRow.Description || '',
          status: eventRow.Status || 'Upcoming',
          venueId: eventRow.VenueId,
          venueName: venueRow ? venueRow.Name : `Venue ${eventRow.VenueId || ''}`,
          venueCity: venueRow ? venueRow.City : '',
          venueCapacity: venueRow?.Capacity || null,
          location: venueRow ? [venueRow.Name, venueRow.City].filter(Boolean).join(', ') : `Venue ${eventRow.VenueId || ''}`,
        };

        setEvent(normalizedEvent);
        setVenues(venueData || []);
        setReviews((ratingsData || []).map((rating) => ({
          id: rating.id,
          name: rating.name || 'Guest',
          rating: Number(rating.rating || 0),
          comment: rating.comment || '',
          date: rating.date,
        })));
      } catch (err) {
        console.error('Failed to load event detail:', err);
        setError(err.response?.data?.message || 'Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    if (id) load();
  }, [id]);

  const reviewsSummary = useMemo(() => reviews, [reviews]);

  const handleSubmitReview = async ({ rating, comment }) => {
    const created = await ratingsApi.create({ eventId: id, rating, comment });
    setReviews((prev) => [{
      id: created.id,
      name: created.name || 'Guest',
      rating: Number(created.rating || 0),
      comment: created.comment || '',
      date: created.date,
    }, ...prev]);
  };
  const tabs = event ? [
    {
      label: 'About',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">About This Event</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {event.description || 'No description provided.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Category</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{event.category}</p>
            </div>
            <div className="card p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{event.status}</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      label: 'Venue',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Venue Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Venue Name</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{event.venueName}</p>
              </div>
              <div className="card p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">City</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{event.venueCity || 'TBA'}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Venue Capacity</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {event.venueCapacity ? event.venueCapacity.toLocaleString() : 'Capacity not available'}
            </p>
          </div>
        </div>
      ),
    },
  ] : [];

  return (
    <div className="min-h-screen bg-white dark:bg-dark-900">
      {loading ? (
        <div className="page-container py-20 text-center">Loading event details...</div>
      ) : error ? (
        <div className="page-container py-20 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button variant="primary" onClick={() => navigate('/events')}>Back to Events</Button>
        </div>
      ) : event ? (
        <>
          {/* Header */}
          <EventHeaderSection event={event} />

          {/* Main Content */}
          <div className="page-container py-12 md:py-16">
            <div className="max-w-5xl mx-auto">
              {showAlert && (
                <div className="mb-8">
                  <Alert
                    type="success"
                    title="Event Details"
                    message="This page now reflects the event saved from the admin dashboard."
                    onClose={() => setShowAlert(false)}
                  />
                </div>
              )}

              <Tabs tabs={tabs} />
            </div>
          </div>

          {/* Reviews Section */}
          <ReviewsSection eventId={event.id} reviews={reviewsSummary} onSubmitReview={handleSubmitReview} />
        </>
      ) : null}
    </div>
  );
};

EventDetailPage.displayName = 'EventDetailPage';
