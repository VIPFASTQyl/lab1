import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { Button, Input, Badge } from '../components/ui';
import { Carousel, EventCard } from '../components/common';

export const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock featured events for carousel
  const featuredEvents = [
    {
      id: 1,
      title: 'Electronic Music Festival 2024',
      image: 'https://picsum.photos/1200/400?random=1',
      category: 'Festival',
    },
    {
      id: 2,
      title: 'Live Concert - The Weeknd',
      image: 'https://picsum.photos/1200/400?random=2',
      category: 'Concert',
    },
    {
      id: 3,
      title: 'Championship Finals',
      image: 'https://picsum.photos/1200/400?random=3',
      category: 'Sports',
    },
  ];

  // Mock category data
  const categories = [
    { id: 1, icon: '🎵', name: 'Concerts', color: 'from-pink-400 to-pink-600' },
    { id: 2, icon: '⚽', name: 'Sports', color: 'from-green-400 to-green-600' },
    { id: 3, icon: '🎭', name: 'Theater', color: 'from-purple-400 to-purple-600' },
    { id: 4, icon: '🎪', name: 'Festival', color: 'from-yellow-400 to-orange-600' },
    { id: 5, icon: '😂', name: 'Comedy', color: 'from-red-400 to-red-600' },
    { id: 6, icon: '📚', name: 'Workshop', color: 'from-blue-400 to-blue-600' },
  ];

  // Mock upcoming events
  const upcomingEvents = [
    {
      id: 1,
      title: 'Summer Music Festival',
      image: 'https://picsum.photos/300/400?random=4',
      date: '2024-06-15',
      location: 'New York, USA',
      category: 'Festival',
      priceFrom: 45,
      rating: 4.8,
    },
    {
      id: 2,
      title: 'Broadway Show Night',
      image: 'https://picsum.photos/300/400?random=5',
      date: '2024-06-20',
      location: 'New York, USA',
      category: 'Theater',
      priceFrom: 65,
      rating: 4.9,
    },
    {
      id: 3,
      title: 'NBA Finals Game 5',
      image: 'https://picsum.photos/300/400?random=6',
      date: '2024-06-25',
      location: 'Los Angeles, USA',
      category: 'Sports',
      priceFrom: 150,
      rating: 4.7,
    },
    {
      id: 4,
      title: 'Tech Conference 2024',
      image: 'https://picsum.photos/300/400?random=7',
      date: '2024-07-01',
      location: 'San Francisco, USA',
      category: 'Workshop',
      priceFrom: 99,
      rating: 4.6,
    },
    {
      id: 5,
      title: 'Comedy Night Special',
      image: 'https://picsum.photos/300/400?random=8',
      date: '2024-07-05',
      location: 'Chicago, USA',
      category: 'Comedy',
      priceFrom: 40,
      rating: 4.8,
    },
    {
      id: 6,
      title: 'Jazz Night at the Club',
      image: 'https://picsum.photos/300/400?random=9',
      date: '2024-07-10',
      location: 'New Orleans, USA',
      category: 'Concert',
      priceFrom: 35,
      rating: 4.9,
    },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    // Navigate to events page with search query
    window.location.href = `/events?search=${searchQuery}`;
  };

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

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="flex gap-2 md:gap-3 flex-col sm:flex-row">
              <Input
                type="text"
                placeholder="Search events by name, city, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={Search}
                className="flex-1 md:text-lg"
              />
              <Button
                type="submit"
                variant="secondary"
                size="md"
                className="w-full sm:w-auto px-8"
              >
                Search
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Featured Events Carousel */}
      <section className="py-12 md:py-20 bg-white dark:bg-dark-900">
        <div className="page-container">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Featured Events</h2>
          <Carousel
            items={featuredEvents}
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

          <div className="grid-responsive">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
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
