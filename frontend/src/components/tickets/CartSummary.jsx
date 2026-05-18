import React from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { Button, Card } from '../ui';

export const CartSummary = ({ items = [], onRemove, onQuantityChange, onCheckout }) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

  if (items.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">Your cart is empty</p>
        <Button variant="primary" size="md">
          Continue Shopping
        </Button>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Items List */}
      <div className="lg:col-span-2 space-y-4">
        {items.map((item) => (
          <Card key={item.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                  {item.eventTitle}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {item.sectorName} • ${item.price} per ticket
                </p>
              </div>
              <button
                onClick={() => onRemove?.(item.id)}
                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-red-600 hover:text-red-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onQuantityChange?.(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-dark-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus size={18} />
                </button>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => onQuantityChange?.(item.id, Number(e.target.value))}
                  className="w-12 text-center input-field"
                />
                <button
                  onClick={() => onQuantityChange?.(item.id, item.quantity + 1)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-dark-700 rounded transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <Card className="p-6 md:p-8 sticky top-24">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Order Summary</h3>

          <div className="space-y-3 mb-6 pb-6 border-b border-gray-200 dark:border-dark-700">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Tax (8%)</span>
              <span className="font-medium">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Service Fee</span>
              <span className="font-medium">$5.00</span>
            </div>
          </div>

          <div className="mb-6 flex justify-between text-xl font-bold">
            <span className="text-gray-900 dark:text-white">Total</span>
            <span className="text-primary-600 dark:text-primary-400">
              ${(total + 5).toFixed(2)}
            </span>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={onCheckout}
            className="w-full justify-center"
          >
            Proceed to Checkout
          </Button>
        </Card>
      </div>
    </div>
  );
};

CartSummary.displayName = 'CartSummary';
