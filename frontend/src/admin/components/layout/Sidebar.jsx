import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu,
  X,
  LayoutDashboard,
  Calendar,
  MapPin,
  Ticket,
  ShoppingCart,
  Users,
  PieChart,
  Tag,
  Star,
  BarChart3,
  ChevronDown,
} from 'lucide-react';
import clsx from 'clsx';

const menuItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  {
    label: 'Events',
    icon: Calendar,
    submenu: [
      { label: 'All Events', path: '/admin/events' },
      { label: 'Add New Event', path: '/admin/events/new' },
    ],
  },
  {
    label: 'Locations',
    icon: MapPin,
    submenu: [
      { label: 'All Locations', path: '/admin/locations' },
      { label: 'Add Location', path: '/admin/locations/new' },
    ],
  },
  { label: 'Sectors', icon: MapPin, path: '/admin/sectors' },
  { label: 'Tickets', icon: Ticket, path: '/admin/tickets' },
  {
    label: 'Orders',
    icon: ShoppingCart,
    submenu: [
      { label: 'All Orders', path: '/admin/orders' },
      { label: 'Payments', path: '/admin/orders/payments' },
    ],
  },
  { label: 'Customers', icon: Users, path: '/admin/customers' },
  { label: 'Organizers', icon: Users, path: '/admin/organizers' },
  { label: 'Discounts', icon: Tag, path: '/admin/discounts' },
  { label: 'Reviews', icon: Star, path: '/admin/reviews' },
  { label: 'Reports', icon: BarChart3, path: '/admin/reports' },
];

export const Sidebar = ({ isOpen, setIsOpen }) => {
  const [expandedMenu, setExpandedMenu] = useState(null);

  const toggleSubmenu = (label) => {
    setExpandedMenu(expandedMenu === label ? null : label);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed left-0 top-0 h-full w-64 bg-slate-900 text-white z-40 transition-transform duration-300 md:translate-x-0 overflow-y-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Close Button (Mobile) */}
        <button
          onClick={() => setIsOpen(false)}
          className="md:hidden absolute top-4 right-4 p-2 hover:bg-slate-800 rounded"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Logo */}
        <div className="p-6 border-b border-slate-700">
          <Link to="/admin" className="flex items-center gap-2 font-bold text-lg">
            <LayoutDashboard className="h-6 w-6" />
            <span>EventHub Admin</span>
          </Link>
        </div>

        {/* Menu */}
        <nav className="p-4">
          {menuItems.map((item) => (
            <div key={item.label}>
              {item.submenu ? (
                <>
                  <button
                    onClick={() => toggleSubmenu(item.label)}
                    className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-800 transition text-left"
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="flex-1">{item.label}</span>
                    <ChevronDown
                      className={clsx(
                        'h-4 w-4 transition-transform',
                        expandedMenu === item.label && 'rotate-180'
                      )}
                    />
                  </button>
                  {expandedMenu === item.label && (
                    <div className="ml-4 mt-2 space-y-1 border-l border-slate-700 pl-4">
                      {item.submenu.map((sub) => (
                        <Link
                          key={sub.path}
                          to={sub.path}
                          className="block px-4 py-2 rounded-lg hover:bg-slate-800 transition text-sm text-slate-300 hover:text-white"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to={item.path}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-800 transition"
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 md:hidden z-30 p-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700"
      >
        <Menu className="h-6 w-6" />
      </button>
    </>
  );
};
