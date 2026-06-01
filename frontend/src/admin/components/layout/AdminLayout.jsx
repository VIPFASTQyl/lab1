import React, { useState } from 'react';
import { Sidebar } from './Sidebar';

export const AdminLayout = ({ children, isDark, setIsDark }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={isDark ? 'dark' : ''}>
      <div
        className="min-h-screen dark:from-[#061b33] dark:to-[#020814]"
        style={{
          backgroundImage:
            'linear-gradient(180deg, #fff8c7 0%, #ffb020 22%, #f97316 42%, #ef4444 64%, #174ba2 100%)',
        }}
      >
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        
        <div className="md:ml-64">
          <main className="p-4 sm:p-6 lg:p-8 bg-white/35 dark:bg-black/20 min-h-screen">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
