import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Tabs, Alert, Card, Input } from '../components/ui';
import { EventHeaderSection, ReviewsSection } from '../components/events';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { discountsApi, eventApi, ratingsApi, purchaseApi } from '../utils/api';
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
  const [discount, setDiscount] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [discountCode, setDiscountCode] = useState('');
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
        const [eventData, venueData, ratingsData, discountsData] = await Promise.all([
          eventApi.getById(id),
          eventApi.getVenues().catch(() => []),
          ratingsApi.getByEvent(id).catch(() => []),
          discountsApi.getAll().catch(() => []),
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
          price: Number(eventRow.Price || 0),
          discountId: eventRow.DiscountId || null,
          venueName: venueRow ? venueRow.Name : `Venue ${eventRow.VenueId || ''}`,
          venueCity: venueRow ? venueRow.City : '',
          venueCapacity: venueRow?.Capacity || null,
          location: venueRow ? [venueRow.Name, venueRow.City].filter(Boolean).join(', ') : `Venue ${eventRow.VenueId || ''}`,
        };

        const discountRow = (discountsData || []).find((item) => String(item.DiscountId) === String(eventRow.DiscountId));

        setEvent(normalizedEvent);
        setVenues(venueData || []);
        setSectors(sectorData || []);
        setDiscount(discountRow || null);
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
  const eventBasePrice = useMemo(() => Number(event?.price || 0), [event]);

  const startingPrice = useMemo(() => {
    if (eventBasePrice > 0) return eventBasePrice;

    const prices = sectors
      .map((sector) => Number(sector.BasePrice ?? sector.basePrice ?? 0))
      .filter((price) => Number.isFinite(price) && price > 0);
    return prices.length > 0 ? Math.min(...prices) : 0;
  }, [eventBasePrice, sectors]);

  const quantityValue = useMemo(() => Math.max(1, Number(quantity) || 1), [quantity]);
  const hasAssignedDiscount = Boolean(event?.discountId);

  const discountPercentage = useMemo(() => {
    if (!discount) return 0;
    if (String(discount.Status || '').toLowerCase() !== 'active') return 0;
    const now = new Date();
    const startDate = discount.StartDate ? new Date(discount.StartDate) : null;
    const endDate = discount.EndDate ? new Date(discount.EndDate) : null;
    const withinDates = (!startDate || startDate <= now) && (!endDate || endDate >= now);
    return withinDates ? Number(discount.Percentage || 0) : 0;
  }, [discount]);

  const discountCodeMatches = useMemo(() => {
    if (!hasAssignedDiscount || !discount?.Code) return false;
    return String(discountCode || '').trim().toUpperCase() === String(discount.Code || '').trim().toUpperCase();
  }, [discountCode, discount, hasAssignedDiscount]);

  const discountedUnitPrice = useMemo(() => {
    const safeStartingPrice = Number(startingPrice || 0);
    if (!safeStartingPrice || !discountPercentage || !discountCodeMatches) return safeStartingPrice;
    return Number((safeStartingPrice * (1 - discountPercentage / 100)).toFixed(2));
  }, [startingPrice, discountPercentage, discountCodeMatches]);

  const liveUnitPrice = discountPercentage > 0 ? discountedUnitPrice : startingPrice;

  const quickBuyTotal = useMemo(() => discountedUnitPrice * quantityValue, [discountedUnitPrice, quantityValue]);

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

    if (hasAssignedDiscount && discountPercentage > 0 && !discountCodeMatches) {
      setPurchaseError('Enter the correct discount code to apply the discount.');
      return;
    }

    try {
      setPurchasing(true);
      const ticketQuantity = quantityValue;
      await purchaseApi.create({
        eventId: event.id,
        eventTitle: event.title,
        ticketType: 'General Access',
        quantity: ticketQuantity,
        unitPrice: Number(discountedUnitPrice.toFixed(2)),
        totalAmount: Number((discountedUnitPrice * ticketQuantity).toFixed(2)),
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Category</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{event.category}</p>
            </div>
            <div className="card p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{event.status}</p>
            </div>
            <div className="card p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Discount</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{hasAssignedDiscount ? 'Yes' : 'No'}</p>
              {hasAssignedDiscount && discountPercentage === 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Discount assigned, but not currently active.
                </p>
              )}
              {discountPercentage > 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {discount.Code} - {discountPercentage}% off
                </p>
              )}
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
                      {startingPrice ? (
                        <div className="flex flex-col md:items-end gap-1">
                          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                            ${Number(liveUnitPrice || 0).toFixed(2)}
                          </p>
                          {discountPercentage > 0 && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-through">
                              ${startingPrice.toFixed(2)}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">Unavailable</p>
                      )}
                      {discountPercentage > 0 && (
                        <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                          {discount.Code} applies {discountPercentage}% off
                        </p>
                      )}
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
                          value={quantity || ''}
                          onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : '')}
                          required
                        />
                      </div>
                      <div className="md:col-span-2 flex items-end">
                        <div className="w-full rounded-lg border border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-800 px-4 py-3">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Estimated total</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {startingPrice ? `$${quickBuyTotal.toFixed(2)}` : 'Unavailable'}
                          </p>
                          {startingPrice && discountPercentage > 0 && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              Base price ${startingPrice.toFixed(2)}
                            </p>
                          )}
                          {discountPercentage > 0 && (
                            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                              Discount applied: {discountPercentage}% off
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 px-4 py-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Discount</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {hasAssignedDiscount ? 'Yes' : 'No'}
                      </p>
                      {hasAssignedDiscount && discountPercentage === 0 && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Discount assigned, but not currently active.
                        </p>
                      )}
                      {hasAssignedDiscount && discountPercentage > 0 && (
                        <div className="mt-3">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Discount Code
                          </label>
                          <Input
                            type="text"
                            value={discountCode}
                            onChange={(e) => setDiscountCode(e.target.value)}
                            placeholder="Enter discount code"
                          />
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            {discountCodeMatches ? 'Code accepted' : 'Type the assigned code to unlock the discount'}
                          </p>
                        </div>
                      )}
                      {discountPercentage > 0 && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {discountPercentage}% off this purchase
                        </p>
                      )}
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
                      {purchasing ? 'Processing...' : `Buy ${quantityValue} Ticket${quantityValue === 1 ? '' : 's'}`}
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
