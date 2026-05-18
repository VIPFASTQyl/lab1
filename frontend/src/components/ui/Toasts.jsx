import React from 'react';
import { useToastStore } from '../../store';

export const Toasts = () => {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div className="fixed right-4 bottom-6 z-50 flex flex-col gap-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`max-w-sm w-full p-3 rounded-lg shadow-lg text-sm transform transition-all duration-300 ease-out origin-bottom-right ${t.type === 'success' ? 'bg-green-600 text-white' : t.type === 'error' ? 'bg-red-600 text-white' : t.type === 'warning' ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-white'}`}
          style={{ animation: 'toast-in 300ms ease-out' }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">{t.message}</div>
            <button onClick={() => useToastStore.getState().removeToast(t.id)} className="ml-2 font-bold">✕</button>
          </div>
        </div>
      ))}
    </div>
  );
};

Toasts.displayName = 'Toasts';

export default Toasts;
