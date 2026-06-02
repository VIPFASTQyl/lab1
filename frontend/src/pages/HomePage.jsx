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
    <div
      className="min-h-screen text-slate-950 dark:text-white"
      style={{
        backgroundImage:
          'linear-gradient(180deg, #fff8c7 0%, #ffb020 24%, #f97316 45%, #ef4444 66%, #174ba2 100%)',
      }}
    >
      {/* Hero Section */}
      <section className="relative py-12 md:py-20 lg:py-28 bg-gradient-to-br from-[#f97316] via-[#ef4444] to-[#174ba2] overflow-hidden border-b border-black/20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#fff8c7] -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#ffb020] -ml-24 -mb-24" />
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
      <section className="py-12 md:py-20 bg-[#fff8c7] dark:bg-[#061b33] border-y border-black/20">
        <div className="page-container">
          <h2 className="text-3xl font-bold text-slate-950 dark:text-white mb-8">Featured Events</h2>
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

      {/* Upcoming Events */}
      <section className="py-12 md:py-20 bg-[#ffef91] dark:bg-[#0d3768] border-y border-black/20">
        <div className="page-container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-slate-950 dark:text-white">Upcoming Events</h2>
            <Link
              to="/events"
              className="inline-flex items-center gap-2 text-[#174ba2] dark:text-white hover:gap-3 transition-all font-semibold"
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
      
    </div>
  );
};

HomePage.displayName = 'HomePage';
