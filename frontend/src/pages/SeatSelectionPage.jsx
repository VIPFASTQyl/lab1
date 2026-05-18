import React, { useState } from 'react';
import { Button, Card } from '../components/ui';
import { SeatSelector } from '../components/tickets';
import { useCartStore } from '../store';
import { useNavigate } from 'react-router-dom';

export const SeatSelectionPage = () => {
  const [selectedSeats, setSelectedSeats] = useState([]);

  // Mock venue sectors
  const sectors = [
    { id: 1, name: 'Floor A', price: 150, available: 45 },
    { id: 2, name: 'Floor B', price: 120, available: 30 },
    { id: 3, name: 'Floor C', price: 100, available: 0 },
    { id: 4, name: 'Balcony Level 1', price: 90, available: 60 },
    { id: 5, name: 'Balcony Level 2', price: 75, available: 25 },
    { id: 6, name: 'Balcony Level 3', price: 60, available: 40 },
    { id: 7, name: 'Standing Room', price: 50, available: 100 },
    { id: 8, name: 'Premium VIP', price: 250, available: 15 },
  ];

  const addItem = useCartStore((s) => s.addItem);
  const handleSectorSelect = (selection) => {
    // Add selected sector to cart
    addItem({
      id: `sector-${selection.sector.id}`,
      eventTitle: 'Summer Music Festival 2024',
      sectorName: selection.sector.name,
      price: selection.sector.price,
      quantity: selection.quantity,
    });
    navigate('/checkout');
  };
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-900 dark:to-dark-800">
      {/* Header */}
      <section className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 py-8 md:py-12">
        <div className="page-container">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
            Select Your Seats
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Summer Music Festival 2024 • June 15, 2024
          </p>
        </div>
      </section>

      {/* Progress Steps */}
      <section className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 py-6">
        <div className="page-container">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {['Select Seats', 'Review Order', 'Payment', 'Confirmation'].map((step, index) => (
              <div key={step} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm transition-all ${
                  index === 0
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 dark:bg-dark-700 text-gray-600 dark:text-gray-400'
                }`}>
                  {index + 1}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  index === 0
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {step}
                </span>
                {index < 3 && (
                  <div className="flex-1 h-1 bg-gray-200 dark:bg-dark-700 mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="page-container py-12 md:py-16">
        <SeatSelector
          sectors={sectors}
          onSectorSelect={handleSectorSelect}
          selectedSeats={selectedSeats}
        />

        {/* Action Buttons */}
        <div className="flex gap-4 mt-12 max-w-7xl mx-auto">
          <Button variant="outline" size="lg" className="flex-1 justify-center">
            Back to Event
          </Button>
          <Button variant="primary" size="lg" className="flex-1 justify-center">
            Continue to Checkout
          </Button>
        </div>
      </section>
    </div>
  );
};

SeatSelectionPage.displayName = 'SeatSelectionPage';
