import React, { useEffect, useState } from 'react';
import { TrendingUp, Calendar, DollarSign, Users } from 'lucide-react';
import { MetricCard, DataTable, StatusBadge } from '../components/common';
import { paymentApi, salesApi } from '../../utils/api';

// Mock data
const mockMetrics = [
  { title: 'Total Events', value: '24', icon: Calendar, color: 'blue', trend: { up: true, label: '+3 this month' } },
  { title: 'Tickets Sold Today', value: '1,240', icon: TrendingUp, color: 'green', trend: { up: true, label: '+15% from yesterday' } },
  { title: 'Revenue', value: '$45,890', icon: DollarSign, color: 'purple', trend: { up: true, label: '+$5,200 vs last week' } },
  { title: 'Active Users', value: '3,520', icon: Users, color: 'orange', trend: { up: true, label: '+120 new users' } },
];

const mockUpcomingEvents = [
  { id: 1, title: 'Summer Music Festival', date: '2026-06-15', status: 'active', ticketsSold: 5420, available: 7080 },
  { id: 2, title: 'Broadway Show Night', date: '2026-06-20', status: 'active', ticketsSold: 3200, available: 4800 },
  { id: 3, title: 'Tech Conference 2024', date: '2026-07-01', status: 'draft', ticketsSold: 120, available: 4880 },
];

export const DashboardPage = () => {
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const loadRecentOrders = async () => {
      try {
        let ordersData = [];

        try {
          ordersData = await salesApi.getAdminOrders();
        } catch (adminErr) {
          ordersData = await salesApi.getAllOrders();
        }

        const mapped = await Promise.all((ordersData || []).slice(0, 4).map(async (order) => {
          const [details, client, payments] = await Promise.all([
            salesApi.getOrderDetails(order.OrderId).catch(() => []),
            order.ClientId ? salesApi.getClientById(order.ClientId).catch(() => null) : Promise.resolve(null),
            paymentApi.getAll({ orderId: order.OrderId }).catch(() => []),
          ]);

          return {
            id: `ORD-${String(order.OrderId).padStart(3, '0')}`,
            customer: client ? `${client.FirstName || ''} ${client.LastName || ''}`.trim() : (details[0]?.BuyerName || 'Unknown Buyer'),
            event: details?.map((item) => item.EventTitle).filter(Boolean).join(', ') || 'Multiple events',
            tickets: details?.reduce((sum, item) => sum + Number(item.Quantity || 0), 0) || 0,
            total: `$${Number(order.TotalAmount || 0).toFixed(2)}`,
            status: String(order.Status || 'completed').toLowerCase(),
            date: order.OrderDate ? new Date(order.OrderDate).toISOString().slice(0, 10) : '',
          };
        }));

        setRecentOrders(mapped);
      } catch (err) {
        console.error('Failed to load dashboard orders:', err);
        setRecentOrders([]);
      }
    };

    loadRecentOrders();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Welcome to your event management dashboard</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockMetrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart Placeholder */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Sales Overview</h2>
          <div className="h-64 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
            <p className="text-gray-400">Chart placeholder - integrate with Chart.js or Recharts</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Conversion Rate</span>
                <span className="font-bold text-gray-900 dark:text-white">42%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Avg Order Value</span>
                <span className="font-bold text-gray-900 dark:text-white">$125</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Revenue</span>
                <span className="font-bold text-gray-900 dark:text-white">$234,567</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <DataTable
        title="Recent Orders"
        columns={[
          { key: 'id', label: 'Order ID', sortable: true },
          { key: 'customer', label: 'Customer', sortable: true },
          { key: 'event', label: 'Event', sortable: true },
          { key: 'tickets', label: 'Tickets', sortable: true },
          { key: 'total', label: 'Total', sortable: true },
          {
            key: 'status',
            label: 'Status',
            render: (val) => <StatusBadge status={val} />,
          },
        ]}
        data={recentOrders}
        searchable={true}
      />

      {/* Upcoming Events */}
      <DataTable
        title="Upcoming Events"
        columns={[
          { key: 'title', label: 'Event Title', sortable: true },
          { key: 'date', label: 'Date', sortable: true },
          { key: 'ticketsSold', label: 'Tickets Sold', sortable: true },
          { key: 'available', label: 'Available', sortable: true },
          {
            key: 'status',
            label: 'Status',
            render: (val) => <StatusBadge status={val} />,
          },
        ]}
        data={mockUpcomingEvents}
        searchable={true}
      />
    </div>
  );
};
