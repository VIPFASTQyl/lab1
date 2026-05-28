import React, { useState } from 'react';
import { Sidebar } from './Sidebar';

export const AdminLayout = ({ children, isDark, setIsDark }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="bg-gray-50 dark:bg-slate-900 min-h-screen">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        
        <div className="md:ml-64">
          <main className="p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
