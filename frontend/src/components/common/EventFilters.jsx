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

 
};

EventFilters.displayName = 'EventFilters';
