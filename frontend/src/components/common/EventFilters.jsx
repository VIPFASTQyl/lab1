import React, { useState } from 'react';
import { Filter, ChevronDown } from 'lucide-react';
import { Button, Input, Select } from '../ui';

export const EventFilters = ({ onFilterChange, onReset }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    date: 'all',
    city: '',
    priceMin: 0,
    priceMax: 1000,
  });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'concert', label: 'Concert' },
    { value: 'sports', label: 'Sports' },
    { value: 'theater', label: 'Theater' },
    { value: 'festival', label: 'Festival' },
    { value: 'comedy', label: 'Comedy' },
    { value: 'workshop', label: 'Workshop' },
  ];

  const dateRanges = [
    { value: 'all', label: 'All Dates' },
    { value: 'today', label: 'Today' },
    { value: 'tomorrow', label: 'Tomorrow' },
    { value: 'thisweek', label: 'This Week' },
    { value: 'thismonth', label: 'This Month' },
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      category: 'all',
      date: 'all',
      city: '',
      priceMin: 0,
      priceMax: 1000,
    };
    setFilters(resetFilters);
    onReset?.();
  };

  return (
    <div className="card p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-primary-600 dark:text-primary-400" />
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">Filters</h3>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-lg transition-colors"
        >
          <ChevronDown
            size={20}
            className={`text-gray-600 dark:text-gray-400 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

      {/* Filters (Hidden on Mobile by default) */}
      <div className={`space-y-4 md:space-y-6 ${isOpen ? 'block' : 'hidden md:block'}`}>
        {/* Category */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Category
          </label>
          <Select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            options={categories}
            className="w-full"
          />
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Date
          </label>
          <Select
            value={filters.date}
            onChange={(e) => handleFilterChange('date', e.target.value)}
            options={dateRanges}
            className="w-full"
          />
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
            City
          </label>
          <Input
            type="text"
            placeholder="Search by city..."
            value={filters.city}
            onChange={(e) => handleFilterChange('city', e.target.value)}
            className="w-full"
          />
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Price Range
          </label>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.priceMin}
                onChange={(e) =>
                  handleFilterChange('priceMin', Math.min(Number(e.target.value), filters.priceMax))
                }
                className="flex-1"
              />
              <Input
                type="number"
                placeholder="Max"
                value={filters.priceMax}
                onChange={(e) =>
                  handleFilterChange('priceMax', Math.max(Number(e.target.value), filters.priceMin))
                }
                className="flex-1"
              />
            </div>
            <input
              type="range"
              min="0"
              max="1000"
              value={filters.priceMax}
              onChange={(e) => handleFilterChange('priceMax', Number(e.target.value))}
              className="w-full"
            />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ${filters.priceMin} - ${filters.priceMax}
            </p>
          </div>
        </div>

        {/* Reset Button */}
        <Button
          variant="ghost"
          size="md"
          onClick={handleReset}
          className="w-full justify-center"
        >
          Reset Filters
        </Button>
      </div>
    </div>
  );
};

EventFilters.displayName = 'EventFilters';
