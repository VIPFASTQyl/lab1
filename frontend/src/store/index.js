import { create } from 'zustand';

// Simple toast store for cross-app notifications
export const useToastStore = create((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const newToast = { id, ...toast };
    set((s) => ({ toasts: [...s.toasts, newToast] }));
    // Auto remove after timeout
    const timeout = toast.duration ?? 4000;
    setTimeout(() => {
      useToastStore.getState().removeToast(id);
    }, timeout);
    return id;
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

// Cart store with localStorage persistence and refined id/dedupe logic
const CART_KEY = 'ticketapp_cart_v1';

const loadCart = () => {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const saveCart = (items) => {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
};

export const useCartStore = create((set, get) => ({
  items: loadCart(),

  // Add item: dedupe by eventTitle + sectorName where possible, otherwise use provided id
  addItem: (item) => {
    const safeId = item.id || `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    set((state) => {
      // Try to find by provided id first
      let idx = -1;
      if (item.id) idx = state.items.findIndex((i) => i.id === item.id);

      // Otherwise try to match by eventTitle + sectorName
      if (idx === -1 && item.eventTitle && item.sectorName) {
        idx = state.items.findIndex((i) => i.eventTitle === item.eventTitle && i.sectorName === item.sectorName);
      }

      let nextItems;
      if (idx !== -1) {
        nextItems = state.items.map((i, ix) => ix === idx ? { ...i, quantity: (i.quantity || 1) + (item.quantity || 1) } : i);
      } else {
        nextItems = [...state.items, { ...item, id: safeId, quantity: item.quantity || 1 }];
      }
      saveCart(nextItems);
      // notify
      useToastStore.getState().addToast({ message: 'Added to cart', type: 'success' });
      return { items: nextItems };
    });
  },

  removeItem: (id) => set((state) => {
    const next = state.items.filter((i) => i.id !== id);
    saveCart(next);
    useToastStore.getState().addToast({ message: 'Removed from cart', type: 'warning' });
    return { items: next };
  }),

  updateQuantity: (id, quantity) => set((state) => {
    const next = state.items.map((i) => i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i);
    saveCart(next);
    return { items: next };
  }),

  clearCart: () => {
    saveCart([]);
    useToastStore.getState().addToast({ message: 'Cart cleared', type: 'info' });
    set({ items: [] });
  },

  getTotal: () => {
    const state = get();
    return state.items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  },
}));

export const useEventStore = create((set) => ({
  events: [],
  currentEvent: null,
  filters: {},

  setEvents: (events) => set({ events }),
  setCurrentEvent: (event) => set({ currentEvent: event }),
  setFilters: (filters) => set({ filters }),
}));

export const useAuthStore = create((set) => ({
  isAuthenticated: false,
  user: null,
  token: null,

  login: (user, token) => set({ isAuthenticated: true, user, token }),
  logout: () => set({ isAuthenticated: false, user: null, token: null }),
}));
