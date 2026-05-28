import React, { useRef, useState } from 'react';
import { Button, Card, Input, Select, Alert } from '../components/ui';
import { CartSummary } from '../components/tickets';
import { CreditCard, Lock } from 'lucide-react';
import { useCartStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { purchaseApi } from '../utils/api';
import { onlyDigits, formatCardExpiry, formatCardholderName } from '../utils';

export const CheckoutPage = () => {
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const formRef = useRef(null);

  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const navigate = useNavigate();

  const handleCheckout = async (e) => {
    e?.preventDefault?.();

    if (!items.length) {
      setSubmitError('Your cart is empty.');
      return;
    }

    const formElement = formRef.current;
    if (!formElement) {
      setSubmitError('Checkout form is not ready.');
      return;
    }

    const formData = new FormData(formElement);
    const firstName = String(formData.get('firstName') || '').trim();
    const lastName = String(formData.get('lastName') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const cardholderName = String(formData.get('cardholderName') || '').trim();
    const buyerName = [firstName, lastName].filter(Boolean).join(' ') || cardholderName || email;

    try {
      setSubmitting(true);
      setSubmitError(null);

      const responses = [];

      for (const item of items) {
        const quantity = Number(item.quantity || 1);
        const unitPrice = Number(item.price || 0);
        const totalAmount = Number((unitPrice * quantity).toFixed(2));

        const response = await purchaseApi.create({
          eventId: item.eventId,
          eventTitle: item.eventTitle,
          ticketType: item.sectorName || item.ticketType || 'General Access',
          quantity,
          email,
          name: buyerName,
          unitPrice,
          totalAmount,
          paymentMethod: 'Card',
        });

        responses.push(response);
      }

      setOrderPlaced(true);
      clearCart();
      setTimeout(() => {
        navigate(`/confirmation?orderId=${responses[0]?.orderId || responses[0]?.purchaseId || 'unknown'}`);
      }, 1200);
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to complete checkout');
    } finally {
      setSubmitting(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 dark:from-dark-900 dark:to-dark-800">
        <Card className="max-w-md p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
            <span className="text-4xl">✓</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Order Confirmed!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your tickets have been successfully purchased. Redirecting to confirmation...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-900 dark:to-dark-800">
      {/* Header */}
      <section className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 py-8 md:py-12">
        <div className="page-container">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
            Checkout
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Complete your purchase
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="page-container py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form ref={formRef} onSubmit={handleCheckout} className="space-y-6">
              {/* Billing Information */}
              <Card className="p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Billing Information
                </h2>

                {submitError && (
                  <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
                    {submitError}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                      required
                    />
                    <Input
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      required
                    />
                  </div>

                  <Input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    required
                  />

                  <Input
                    type="text"
                    name="phoneNumber"
                    placeholder="Phone Number"
                    required
                  />

                  <Input
                    type="text"
                    name="streetAddress"
                    placeholder="Street Address"
                    required
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      type="text"
                      name="city"
                      placeholder="City"
                      required
                    />
                    <Select
                      name="state"
                      options={[
                        { label: 'Select State', value: '' },
                        { label: 'California', value: 'CA' },
                        { label: 'New York', value: 'NY' },
                        { label: 'Texas', value: 'TX' },
                      ]}
                      required
                    />
                    <Input
                      type="text"
                      name="zipCode"
                      placeholder="ZIP Code"
                      required
                    />
                  </div>
                </div>
              </Card>

              {/* Payment Information */}
              <Card className="p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <CreditCard size={24} className="text-primary-600 dark:text-primary-400" />
                  Payment Information
                </h2>

                <Alert
                  type="info"
                  title="Secure Payment"
                  message="Your payment information is encrypted and secure. We accept all major credit cards."
                  className="mb-6"
                />

                <div className="space-y-4">
                  <Input
                    type="text"
                    name="cardNumber"
                    placeholder="Card Number"
                    pattern="[0-9]*"
                    maxLength="16"
                    inputMode="numeric"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(onlyDigits(e.target.value, 16))}
                    required
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      type="text"
                      name="cardExpiry"
                      placeholder="MM/YY"
                      maxLength="5"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(formatCardExpiry(e.target.value))}
                      required
                    />
                    <Input
                      type="text"
                      name="cardCvv"
                      placeholder="CVV"
                      pattern="[0-9]*"
                      maxLength="3"
                      inputMode="numeric"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(onlyDigits(e.target.value, 3))}
                      required
                    />
                    <Input
                      type="text"
                      name="cardholderName"
                      placeholder="Cardholder Name"
                      value={cardholderName}
                      onChange={(e) => setCardholderName(formatCardholderName(e.target.value))}
                      required
                    />
                  </div>
                </div>
              </Card>

              {/* Terms */}
              <Card className="p-6 md:p-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-1"
                    required
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    I agree to the terms and conditions and confirm that I have read the privacy policy.
                    I understand that these are non-refundable tickets except in case of event cancellation.
                  </span>
                </label>
              </Card>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full justify-center flex items-center gap-2"
                disabled={submitting}
              >
                <Lock size={20} />
                {submitting ? 'Processing...' : 'Place Order - Securely'}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <CartSummary
              items={items}
              onRemove={(id) => removeItem(id)}
              onQuantityChange={(id, qty) => updateQuantity(id, qty)}
              onCheckout={() => handleCheckout()}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

CheckoutPage.displayName = 'CheckoutPage';
