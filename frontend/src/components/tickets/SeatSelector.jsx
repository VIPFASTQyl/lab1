import React, { useState } from 'react';
import { Button, Card, Badge } from '../ui';

export const SeatSelector = ({ sectors = [], onSectorSelect, selectedSeats = [] }) => {
  const [selectedSector, setSelectedSector] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const handleSectorSelect = (sector) => {
    setSelectedSector(sector);
    setQuantity(1);
  };

  const handleAddToCart = () => {
    if (selectedSector) {
      onSectorSelect?.({
        sector: selectedSector,
        quantity,
      });
      setQuantity(1);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Venue Map */}
      <div className="lg:col-span-2">
        <Card className="p-6 md:p-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Select Your Seats</h3>

          {/* Stage */}
          <div className="mb-12 text-center">
            <div className="inline-block px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg font-bold">
              STAGE
            </div>
          </div>

          {/* Sectors Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {sectors.map((sector) => (
              <button
                key={sector.id}
                onClick={() => handleSectorSelect(sector)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-center ${
                  selectedSector?.id === sector.id
                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-dark-700 hover:border-primary-600'
                } ${sector.available === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                disabled={sector.available === 0}
              >
                <h4 className="font-bold text-gray-900 dark:text-white mb-1">{sector.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">${sector.price}</p>
                <Badge
                  variant={sector.available > 0 ? 'success' : 'error'}
                  size="sm"
                  className="w-full text-center justify-center"
                >
                  {sector.available > 0 ? `${sector.available} left` : 'Sold out'}
                </Badge>
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-dark-700 grid grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500" />
              <span>Sold Out</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-primary-600" />
              <span>Selected</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Selection Summary */}
      <div className="lg:col-span-1">
        <Card className="p-6 md:p-8 sticky top-24">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Selection</h3>

          {selectedSector ? (
            <>
              <div className="mb-6 pb-6 border-b border-gray-200 dark:border-dark-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Selected Sector</p>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {selectedSector.name}
                </h4>
                <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                  ${selectedSector.price} per ticket
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 bg-gray-200 dark:bg-dark-700 rounded-lg font-bold hover:bg-gray-300 dark:hover:bg-dark-600 transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={selectedSector.available}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.min(Number(e.target.value), selectedSector.available))
                    }
                    className="flex-1 text-center input-field"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(selectedSector.available, quantity + 1))}
                    className="px-3 py-2 bg-gray-200 dark:bg-dark-700 rounded-lg font-bold hover:bg-gray-300 dark:hover:bg-dark-600 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="mb-6 pb-6 border-b border-gray-200 dark:border-dark-700">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    ${(selectedSector.price * quantity).toFixed(2)}
                  </span>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={handleAddToCart}
                className="w-full justify-center"
              >
                Add to Cart
              </Button>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">Select a sector to get started</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

SeatSelector.displayName = 'SeatSelector';
