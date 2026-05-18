import React, { useState } from 'react';
import { Button, Tabs, Alert } from '../components/ui';
import { EventHeaderSection, ReviewsSection } from '../components/events';
import { useCartStore } from '../store';
import { useNavigate } from 'react-router-dom';

export const EventDetailPage = () => {
  const [showAlert, setShowAlert] = useState(true);

  // Mock event data
  const event = {
    id: 1,
    title: 'Summer Music Festival 2024',
    image: 'https://via.placeholder.com/1200x600?text=Summer+Festival',
    date: '2024-06-15',
    startTime: '6:00 PM',
    location: 'Central Park, New York, USA',
    organizer: 'Urban Events Inc.',
    category: 'Festival',
    description: `Experience the ultimate summer music festival featuring world-class performers from around the globe. 
      With multiple stages, amazing food vendors, and unforgettable performances, this is the event you won't want to miss. 
      Join thousands of music lovers for a day of incredible live music, entertainment, and memories that will last a lifetime.`,
    venue: 'Central Park Amphitheater',
    venueCapacity: 50000,
    venueDescription: 'State-of-the-art outdoor amphitheater with excellent acoustics and comfortable seating.',
    ticketsAvailable: 12500,
    priceFrom: 45,
    performingArtists: [
      'The Weeknd',
      'Ariana Grande',
      'Post Malone',
      'Billie Eilish',
      'Harry Styles',
    ],
  };

  const reviews = [
    {
      id: 1,
      name: 'John Doe',
      rating: 5,
      comment: 'Amazing event! The performances were incredible and the venue was perfect. Highly recommend!',
      date: '2024-06-10',
    },
    {
      id: 2,
      name: 'Jane Smith',
      rating: 4,
      comment: 'Great festival with amazing artists. Only minor issue was the long queue at the entrance.',
      date: '2024-06-09',
    },
    {
      id: 3,
      name: 'Mike Johnson',
      rating: 5,
      comment: 'Best festival I have ever been to. The organization was top-notch!',
      date: '2024-06-08',
    },
  ];

  const tabs = [
    {
      label: 'About',
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">About This Event</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {event.description}
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Performing Artists</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {event.performingArtists.map((artist) => (
                <div
                  key={artist}
                  className="p-4 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-lg text-center font-semibold text-gray-900 dark:text-white"
                >
                  {artist}
                </div>
              ))}
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
                <p className="text-lg font-bold text-gray-900 dark:text-white">{event.venue}</p>
              </div>
              <div className="card p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Capacity</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{event.venueCapacity.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Venue Description</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {event.venueDescription}
            </p>
          </div>

          {/* Map Placeholder */}
          <div className="w-full h-96 bg-gray-200 dark:bg-dark-700 rounded-lg flex items-center justify-center">
            <p className="text-gray-600 dark:text-gray-400">Map will be displayed here</p>
          </div>
        </div>
      ),
    },
    {
      label: 'Tickets',
      content: (
        <div className="space-y-6">
          <Alert
            type="info"
            title="Limited Tickets Available"
            message={`Only ${event.ticketsAvailable} tickets remaining for this event`}
          />

          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Ticket Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: 'General Access', price: 45, color: 'from-blue-500 to-blue-600' },
                { name: 'VIP Pass', price: 120, color: 'from-purple-500 to-purple-600' },
                { name: 'Premium VIP', price: 250, color: 'from-yellow-500 to-yellow-600' },
              ].map((ticket) => (
                <div
                  key={ticket.name}
                  className={`card p-6 bg-gradient-to-br ${ticket.color} text-white text-center`}
                >
                  <h4 className="text-lg font-bold mb-2">{ticket.name}</h4>
                  <p className="text-3xl font-bold mb-4">${ticket.price}</p>
                  <Button
                    variant="secondary"
                    size="md"
                    className="w-full"
                    onClick={() => {
                      const addItem = useCartStore.getState().addItem;
                      addItem({
                        id: `${event.id}-${ticket.name}`,
                        eventTitle: event.title,
                        sectorName: ticket.name,
                        price: ticket.price,
                        quantity: 1,
                      });
                    }}
                  >
                    Select Ticket
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full justify-center mt-6"
          >
            Continue to Seat Selection
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-dark-900">
      {/* Header */}
      <EventHeaderSection event={event} />

      {/* Main Content */}
      <div className="page-container py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
          {/* Alert */}
          {showAlert && (
            <div className="mb-8">
              <Alert
                type="success"
                title="Event Confirmed"
                message="This event has been confirmed and tickets are now available"
                onClose={() => setShowAlert(false)}
              />
            </div>
          )}

          {/* Tabs */}
          <Tabs tabs={tabs} />
        </div>
      </div>

      {/* Reviews Section */}
      <ReviewsSection eventId={event.id} reviews={reviews} />
    </div>
  );
};

EventDetailPage.displayName = 'EventDetailPage';
