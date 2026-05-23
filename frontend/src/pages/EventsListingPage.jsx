import React, { useState, useEffect } from 'react';
import { LayoutGrid, List } from 'lucide-react';
import { Button } from '../components/ui';
import { EventCard, EventFilters } from '../components/common';
import { eventApi } from '../utils/api';
import { DEFAULT_EVENT_IMAGE } from '../constants';

export const EventsListingPage = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({});
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch events from database
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventApi.getAll();
      // Transform database format to component format
      const transformedEvents = (data || []).map(event => ({
        id: event.EventId,
        title: event.Title,
        image: event.ImageUrl || DEFAULT_EVENT_IMAGE,
        date: event.EventDate,
        location: 'TBD', // Will need to fetch venue info
        category: event.Category || 'Other',
        priceFrom: 0, // Will need to fetch from ticket pricing
        rating: 4.5, // Default rating
        description: event.Description || event.Title,
      }));
      setEvents(transformedEvents);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  // No hardcoded events - events come from the API
  const displayEvents = events;

  const filteredEvents = displayEvents.filter((event) => {
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
            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400 text-lg">Loading events...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <p className="text-red-600 dark:text-red-400 text-lg mb-4">{error}</p>
                <Button variant="primary" onClick={fetchEvents}>
                  Retry
                </Button>
              </div>
            )}

            {/* Controls */}
            {!loading && !error && (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

EventsListingPage.displayName = 'EventsListingPage';
