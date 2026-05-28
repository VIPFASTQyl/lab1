import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button, Input, Badge } from '../components/ui';
import { Carousel, EventCard } from '../components/common';
import { eventApi } from '../utils/api';
import { DEFAULT_EVENT_IMAGE } from '../constants';

export const HomePage = () => {
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState(null);

  // Mock category data
  const categories = [
    { id: 1, icon: '🎵', name: 'Concerts', color: 'from-pink-400 to-pink-600' },
    { id: 2, icon: '⚽', name: 'Sports', color: 'from-green-400 to-green-600' },
    { id: 3, icon: '🎭', name: 'Theater', color: 'from-purple-400 to-purple-600' },
    { id: 4, icon: '🎪', name: 'Festival', color: 'from-yellow-400 to-orange-600' },
    { id: 5, icon: '😂', name: 'Comedy', color: 'from-red-400 to-red-600' },
    { id: 6, icon: '📚', name: 'Workshop', color: 'from-blue-400 to-blue-600' },
  ];

  // featuredEvents and upcomingEvents are derived from API results below

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingEvents(true);
        const data = await eventApi.getAll();
        const list = (data || []).map(ev => ({
          id: ev.EventId,
          Title: ev.Title,
          title: ev.Title,
          image: ev.ImageUrl || DEFAULT_EVENT_IMAGE,
          category: ev.Category || 'Other',
          date: ev.EventDate,
          description: ev.Description || ev.Title,
        }));
        setEvents(list);
        setEventsError(null);
      } catch (err) {
        console.error('Failed to load events for home:', err);
        setEventsError('Failed to load events');
      } finally {
        setLoadingEvents(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-dark-900">
      {/* Hero Section */}
      <section className="relative py-12 md:py-20 lg:py-28 bg-gradient-to-br from-primary-600 to-secondary-600 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-white rounded-full -ml-24 -mb-24" />
        </div>

        <div className="page-container relative z-10">
          <div className="text-center mb-12">
            <h1 className="section-title text-white mb-4">
              Discover Amazing Events
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
              Find and purchase tickets to concerts, sports, theater, and more
            </p>
          </div>
        </div>
      </section>

      {/* Featured Events Carousel */}
      <section className="py-12 md:py-20 bg-white dark:bg-dark-900">
        <div className="page-container">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Featured Events</h2>
          {loadingEvents ? (
            <div className="text-center py-12">Loading featured events...</div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">No events available</div>
          ) : (
            <Carousel
              items={events.slice(0, 3)}
              renderItem={(event) => (
                <Link
                  to={`/events/${event.id}`}
                  className="relative w-full h-full group cursor-pointer"
                >
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                    <Badge variant="secondary" size="md" className="mb-4">
                      {event.category}
                    </Badge>
                    <h3 className="text-3xl md:text-4xl font-bold">{event.title}</h3>
                  </div>
                </Link>
              )}
              autoPlay={true}
              interval={6000}
            />
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 md:py-20 bg-gray-50 dark:bg-dark-800">
        <div className="page-container">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/events?category=${category.name.toLowerCase()}`}
                className={`relative p-6 rounded-xl text-white font-bold text-center transition-transform hover:scale-105 overflow-hidden group cursor-pointer`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color}`} />
                <div className="relative z-10 flex flex-col items-center justify-center h-full gap-2">
                  <span className="text-4xl">{category.icon}</span>
                  <span>{category.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-12 md:py-20 bg-white dark:bg-dark-900">
        <div className="page-container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Upcoming Events</h2>
            <Link
              to="/events"
              className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:gap-3 transition-all font-semibold"
            >
              View All <ArrowRight size={20} />
            </Link>
          </div>

          {loadingEvents ? (
            <div className="text-center py-12">Loading upcoming events...</div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">No events available</div>
          ) : (
            <div className="grid-responsive">
              {events.slice(0, 6).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="page-container text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Never Miss an Event</h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter and get exclusive deals on upcoming events
          </p>
          <div className="max-w-md mx-auto flex gap-2">
            <Input
              type="email"
              placeholder="Enter your email"
              className="text-gray-900 dark:text-white bg-white"
            />
            <Button variant="secondary" size="md">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

HomePage.displayName = 'HomePage';
