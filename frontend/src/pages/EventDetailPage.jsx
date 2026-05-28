import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Tabs, Alert, Card, Input } from '../components/ui';
import { EventHeaderSection, ReviewsSection } from '../components/events';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { eventApi, ratingsApi, purchaseApi } from '../utils/api';
import { onlyDigits, formatCardExpiry, formatCardholderName } from '../utils';
import { DEFAULT_EVENT_IMAGE } from '../constants';

export const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const quickBuyRef = useRef(null);
  const [showAlert, setShowAlert] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [event, setEvent] = useState(null);
  const [venues, setVenues] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const [purchaseError, setPurchaseError] = useState(null);
  const [purchasing, setPurchasing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');

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

        const sectorData = eventRow.VenueId ? await eventApi.getSectors(eventRow.VenueId).catch(() => []) : [];
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
        setSectors(sectorData || []);
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

  useEffect(() => {
    if (location.hash === '#quick-buy' && quickBuyRef.current) {
      quickBuyRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.hash, event]);

  const reviewsSummary = useMemo(() => reviews, [reviews]);
  const startingPrice = useMemo(() => {
    const prices = sectors
      .map((sector) => Number(sector.BasePrice ?? sector.basePrice ?? 0))
      .filter((price) => Number.isFinite(price) && price > 0);
    return prices.length > 0 ? Math.min(...prices) : 0;
  }, [sectors]);

  const quickBuyTotal = useMemo(() => startingPrice * quantity, [startingPrice, quantity]);

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

  const handleQuickBuy = async (e) => {
    e.preventDefault();
    setPurchaseError(null);

    if (!startingPrice) {
      setPurchaseError('Ticket pricing is not available for this event yet.');
      return;
    }

    try {
      setPurchasing(true);
      await purchaseApi.create({
        eventId: event.id,
        eventTitle: event.title,
        ticketType: 'General Access',
        quantity,
        unitPrice: Number(startingPrice.toFixed(2)),
        totalAmount: Number((startingPrice * quantity).toFixed(2)),
        paymentMethod: 'Card',
      });
      setPurchaseComplete(true);
    } catch (err) {
      setPurchaseError(err.response?.data?.message || 'Failed to complete purchase');
    } finally {
      setPurchasing(false);
    }
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
          <EventHeaderSection
            event={event}
            onBuyTickets={() => quickBuyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          />

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

              <div ref={quickBuyRef} id="quick-buy" className="mt-10">
                <Card className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Quick Buy</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Choose how many tickets you want, then enter your card details.
                      </p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Starting from</p>
                      <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        {startingPrice ? `$${startingPrice.toFixed(2)}` : 'Unavailable'}
                      </p>
                    </div>
                  </div>

                  {purchaseComplete ? (
                    <Alert
                      type="success"
                      title="Purchase started"
                      message="Your ticket request is being processed. Redirecting to checkout..."
                    />
                  ) : null}

                  {purchaseError ? (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
                      {purchaseError}
                    </div>
                  ) : null}

                  <form onSubmit={handleQuickBuy} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Ticket Quantity
                        </label>
                        <Input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                          required
                        />
                      </div>
                      <div className="md:col-span-2 flex items-end">
                        <div className="w-full rounded-lg border border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-800 px-4 py-3">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Estimated total</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {startingPrice ? `$${quickBuyTotal.toFixed(2)}` : 'Unavailable'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        type="text"
                        placeholder="Card Number"
                        maxLength="16"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(onlyDigits(e.target.value, 16))}
                        required
                      />
                      <Input
                        type="text"
                        placeholder="Cardholder Name"
                        value={cardholderName}
                        onChange={(e) => setCardholderName(formatCardholderName(e.target.value))}
                        required
                      />
                      <Input
                        type="text"
                        placeholder="MM/YY"
                        maxLength="5"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(formatCardExpiry(e.target.value))}
                        required
                      />
                      <Input
                        type="text"
                        placeholder="CVV"
                        maxLength="3"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(onlyDigits(e.target.value, 3))}
                        required
                      />
                    </div>

                    <Button type="submit" variant="primary" size="lg" className="w-full justify-center">
                      {purchasing ? 'Processing...' : `Buy ${quantity} Ticket${quantity === 1 ? '' : 's'}`}
                    </Button>
                  </form>
                </Card>
              </div>
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
