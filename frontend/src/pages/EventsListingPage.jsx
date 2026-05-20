import React, { useState } from 'react';
import { LayoutGrid, List } from 'lucide-react';
import { Button } from '../components/ui';
import { EventCard, EventFilters } from '../components/common';

export const EventsListingPage = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({});

  // Mock events data
  const events = [
    {
      id: 1,
      title: 'Summer Music Festival',
      image: 'https://picsum.photos/300/400?random=10',
      date: '2024-06-15',
      location: 'New York, USA',
      category: 'Festival',
      priceFrom: 45,
      rating: 4.8,
      description: 'Experience the ultimate summer music festival',
    },
    {
      id: 2,
      title: 'Broadway Show Night',
      image: 'https://picsum.photos/300/400?random=11',
      date: '2024-06-20',
      location: 'New York, USA',
      category: 'Theater',
      priceFrom: 65,
      rating: 4.9,
      description: 'Watch the award-winning Broadway production',
    },
    {
      id: 3,
      title: 'NBA Finals Game 5',
      image: 'https://picsum.photos/300/400?random=12',
      date: '2024-06-25',
      location: 'Los Angeles, USA',
      category: 'Sports',
      priceFrom: 150,
      rating: 4.7,
      description: 'Witness the championship game live',
    },
    {
      id: 4,
      title: 'Tech Conference 2024',
      image: 'https://picsum.photos/300/400?random=13',
      date: '2024-07-01',
      location: 'San Francisco, USA',
      category: 'Workshop',
      priceFrom: 99,
      rating: 4.6,
      description: 'Learn from industry leaders',
    },
    {
      id: 5,
      title: 'Comedy Night Special',
      image: 'https://picsum.photos/300/400?random=14',
      date: '2024-07-05',
      location: 'Chicago, USA',
      category: 'Comedy',
      priceFrom: 40,
      rating: 4.8,
      description: 'Laugh with top comedians',
    },
    {
      id: 6,
      title: 'Jazz Night at the Club',
      image: 'https://picsum.photos/300/400?random=15',
      date: '2024-07-10',
      location: 'New Orleans, USA',
      category: 'Concert',
      priceFrom: 35,
      rating: 4.9,
      description: 'Smooth jazz in an intimate setting',
    },
    {
      id: 7,
      title: 'Modern Art Exhibition',
      image: 'https://picsum.photos/300/400?random=16',
      date: '2024-07-15',
      location: 'Chicago, USA',
      category: 'Festival',
      priceFrom: 25,
      rating: 4.5,
      description: 'Contemporary art from around the world',
    },
    {
      id: 8,
      title: 'Marathon Championship',
      image: 'https://picsum.photos/300/400?random=17',
      date: '2024-07-20',
      location: 'Boston, USA',
      category: 'Sports',
      priceFrom: 30,
      rating: 4.7,
      description: 'Join thousands of runners',
    },
  ];

  const filteredEvents = events.filter((event) => {
    if (filters.category && filters.category !== 'all' && event.category !== filters.category) {
      return false;
    }
    if (filters.priceMin && event.priceFrom < filters.priceMin) {
      return false;
    }
    if (filters.priceMax && event.priceFrom > filters.priceMax) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      {/* Header */}
      <section className="bg-gradient-to-r from-primary-600 to-secondary-600 py-12 md:py-16">
        <div className="page-container">
          <h1 className="section-title text-white mb-2">Browse Events</h1>
          <p className="text-white/90 text-lg">Find your next favorite event</p>
        </div>
      </section>

      {/* Main Content */}
      <div className="page-container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <EventFilters
              onFilterChange={setFilters}
              onReset={() => setFilters({})}
            />
          </div>

          {/* Events Grid */}
          <div className="lg:col-span-3">
            {/* Controls */}
            <div className="flex items-center justify-between mb-8">
              <p className="text-gray-600 dark:text-gray-400">
                Showing {filteredEvents.length} events
              </p>

              <div className="flex items-center gap-2 bg-white dark:bg-dark-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list'
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700'
                  }`}
                  title="List View"
                >
                  <List size={20} />
                </button>
              </div>
            </div>

            {/* Events */}
            {filteredEvents.length > 0 ? (
              <div className={viewMode === 'grid' ? 'grid-responsive' : 'space-y-4'}>
                {filteredEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    variant={viewMode}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
                  No events found with your current filters
                </p>
                <Button variant="primary" onClick={() => setFilters({})}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

EventsListingPage.displayName = 'EventsListingPage';
