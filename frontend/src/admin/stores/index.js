import { create } from 'zustand';

export const useAdminStore = create((set) => ({
  isAdmin: false,  // Would check JWT claim in real app
  user: null,
  setAdmin: (isAdmin) => set({ isAdmin }),
  setUser: (user) => set({ user }),
  logout: () => set({ isAdmin: false, user: null }),
}));

export const useAdminNotifications = create((set) => ({
  notifications: [
    { id: 1, type: 'info', message: ' New order received', timestamp: new Date() },
  ],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [...state.notifications, { ...notification, id: Date.now(), timestamp: new Date() }],
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));
