import React from 'react';
import { Calendar, MapPin, Clock, User, Share2 } from 'lucide-react';
import { Button, Badge } from '../ui';

export const EventHeaderSection = ({ event }) => {
  return (
    <div className="relative w-full">
      {/* Hero Image */}
      <div className="relative h-96 md:h-screen max-h-screen w-full bg-gradient-to-br from-primary-600 to-secondary-600 overflow-hidden">
        <img
          src={event.image || 'https://via.placeholder.com/1200'}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />

        {/* Content Overlay */}
        <div className="absolute inset-0 flex items-end">
          <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pb-8 md:pb-12">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
              <div className="flex-1">
                <Badge variant="secondary" size="md" className="mb-4">
                  {event.category}
                </Badge>
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
                  {event.title}
                </h1>
              </div>
              <Button variant="secondary" size="lg">
                Share Event
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Info Card */}
      <div className="relative -mt-12 md:-mt-16 max-w-7xl mx-auto px-4 md:px-6 lg:px-8 mb-8">
        <div className="card p-6 md:p-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="text-primary-600 dark:text-primary-400" size={24} />
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Date</label>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {new Date(event.date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-2">
              <Clock className="text-primary-600 dark:text-primary-400" size={24} />
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Time</label>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {event.startTime || '06:00 PM'}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="text-primary-600 dark:text-primary-400" size={24} />
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Location</label>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">
              {event.location || 'TBA'}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-2">
              <User className="text-primary-600 dark:text-primary-400" size={24} />
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Organizer</label>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {event.organizer || 'TBA'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

EventHeaderSection.displayName = 'EventHeaderSection';
