import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Star, Heart } from 'lucide-react';
import { Badge } from '../ui';

export const EventCard = ({ event, variant = 'grid', onClick }) => {
  const [isFavorite, setIsFavorite] = React.useState(false);

  if (variant === 'list') {
    return (
      <Link to={`/events/${event.id}`} className="card overflow-hidden hover:shadow-lg transition-shadow" onClick={onClick}>
        <div className="flex gap-4 h-32">
          {/* Image */}
          <div className="w-32 h-32 flex-shrink-0 bg-gradient-to-br from-primary-400 to-secondary-400 overflow-hidden">
            <img
              src={event.image || 'https://via.placeholder.com/128'}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="flex-1 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1">
                  {event.title}
                </h3>
                <Badge variant="secondary" size="sm">
                  {event.category}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{event.description}</p>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <MapPin size={14} />
                {event.location}
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                {new Date(event.date).toLocaleDateString()}
              </div>
              <span className="font-semibold text-primary-600 dark:text-primary-400 ml-auto">
                From ${event.priceFrom}
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Grid variant
  return (
    <Link to={`/events/${event.id}`} className="card overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1" onClick={onClick}>
      {/* Image Container */}
      <div className="relative h-48 bg-gradient-to-br from-primary-400 to-secondary-400 overflow-hidden group">
        <img
          src={event.image || 'https://via.placeholder.com/300'}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

        {/* Badge */}
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" size="sm">
            {event.category}
          </Badge>
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsFavorite(!isFavorite);
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-white dark:bg-dark-800 shadow-md hover:shadow-lg transition-all duration-200 group-hover:scale-110"
        >
          <Heart
            size={20}
            className={`transition-colors ${
              isFavorite
                ? 'fill-secondary-600 text-secondary-600'
                : 'text-gray-400 dark:text-gray-500'
            }`}
          />
        </button>

        {/* Rating */}
        {event.rating && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/95 dark:bg-dark-800/95 px-2 py-1 rounded-lg">
            <Star size={16} className="fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-sm text-gray-900 dark:text-white">
              {event.rating}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-base text-gray-900 dark:text-white line-clamp-2 mb-2">
          {event.title}
        </h3>

        <div className="space-y-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Calendar size={16} />
            <span>{new Date(event.date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 line-clamp-1">
            <MapPin size={16} />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        </div>

        {/* Price */}
        <div className="pt-4 border-t border-gray-200 dark:border-dark-700 flex items-center justify-between">
          <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
            From ${event.priceFrom}
          </span>
          <button className="px-3 py-1 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
            Buy
          </button>
        </div>
      </div>
    </Link>
  );
};

EventCard.displayName = 'EventCard';
