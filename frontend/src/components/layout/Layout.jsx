import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { useCartStore } from '../../store';
import { Toasts } from '../ui/Toasts';

export const Layout = ({ children, onCartClick }) => {
  const items = useCartStore((s) => s.items);
  const cartItemsCount = items.reduce((sum, it) => sum + (it.quantity || 1), 0);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-dark-900">
      <Header onCartClick={onCartClick} cartItemsCount={cartItemsCount} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <Toasts />
    </div>
  );
};

Layout.displayName = 'Layout';
