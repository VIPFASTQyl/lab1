import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, TrendingUp, Users, DollarSign, RefreshCw } from 'lucide-react';
import { MetricCard, DataTable } from '../components/common';
import { dashboardApi, salesApi } from '../../utils/api';

const formatCurrency = (value) => `$${Number(value || 0).toFixed(2)}`;

export const ReportsPage = () => {
  const [summary, setSummary] = useState(null);
  const [events, setEvents] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true);
        const [summaryData, eventData, ordersData] = await Promise.all([
          dashboardApi.getSummary(),
          dashboardApi.getEvents(),
          salesApi.getAllOrders().catch(() => []),
        ]);

        const mappedOrders = (ordersData || []).slice(0, 5).map((order) => ({
          id: `ORD-${String(order.OrderId).padStart(3, '0')}`,
          orderDate: order.OrderDate,
          customer: order.ClientId ? `Client #${order.ClientId}` : 'Unknown Buyer',
          total: formatCurrency(order.TotalAmount),
          status: String(order.Status || 'completed').toLowerCase(),
        }));

        setSummary(summaryData || null);
        setEvents(Array.isArray(eventData) ? eventData : []);
        setRecentOrders(mappedOrders);
        setError(null);
      } catch (err) {
        console.error('Failed to load reports:', err);
        setError(err.response?.data?.message || 'Failed to load reports');
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  const topEvents = useMemo(() => {
    return [...events]
      .sort((a, b) => Number(b.revenue || 0) - Number(a.revenue || 0))
      .slice(0, 3)
      .map((event) => ({
        name: event.name,
        revenue: formatCurrency(event.revenue),
      }));
  }, [events]);

  const conversionMetrics = useMemo(() => [
    { label: 'Occupancy Rate', value: summary ? `${Number(summary.occupancyPercentage || 0).toFixed(1)}%` : '0%' },
    { label: 'Available Tickets', value: summary ? Number(summary.availableTickets || 0).toLocaleString() : '0' },
    { label: 'Sold Tickets', value: summary ? Number(summary.soldTickets || 0).toLocaleString() : '0' },
    { label: 'Active Members', value: summary ? Number(summary.activeMembers || 0).toLocaleString() : '0' },
  ], [summary]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Live data pulled from the admin dashboard endpoints</p>
        </div>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:text-gray-200 dark:hover:bg-slate-800"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={summary ? formatCurrency(summary.totalRevenue) : '$0.00'}
          icon={DollarSign}
          color="green"
        />
        <MetricCard
          title="Tickets Sold"
          value={summary ? Number(summary.soldTickets || 0).toLocaleString() : '0'}
          icon={TrendingUp}
          color="purple"
        />
        <MetricCard
          title="Available Tickets"
          value={summary ? Number(summary.availableTickets || 0).toLocaleString() : '0'}
          icon={BarChart3}
          color="blue"
        />
        <MetricCard
          title="Active Members"
          value={summary ? Number(summary.activeMembers || 0).toLocaleString() : '0'}
          icon={Users}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Sales Overview</h2>
          {loading ? (
            <div className="h-64 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400">
              Loading summary...
            </div>
          ) : summary ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-gray-50 dark:bg-slate-700 p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Occupancy</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{Number(summary.occupancyPercentage || 0).toFixed(1)}%</p>
                </div>
                <div className="rounded-lg bg-gray-50 dark:bg-slate-700 p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Revenue</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(summary.totalRevenue)}</p>
                </div>
              </div>
              <div className="rounded-lg bg-gray-50 dark:bg-slate-700 p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Ticket status</p>
                <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{Number(summary.totalTickets || 0).toLocaleString()}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">{Number(summary.soldTickets || 0).toLocaleString()}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Sold</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{Number(summary.availableTickets || 0).toLocaleString()}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Available</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400">
              No summary data available
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Conversion Metrics</h2>
          <div className="space-y-3">
            {conversionMetrics.map((metric) => (
              <div key={metric.label} className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">{metric.label}</span>
                <span className="font-bold text-gray-900 dark:text-white">{metric.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Top Events by Revenue</h2>
          <div className="space-y-3">
            {topEvents.length > 0 ? topEvents.map((event, idx) => (
              <div key={`${event.name}-${idx}`} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-700 rounded">
                <span className="text-gray-700 dark:text-gray-300">{event.name}</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{event.revenue}</span>
              </div>
            )) : (
              <div className="text-gray-500 dark:text-gray-400">No event data available</div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Orders</h2>
          <DataTable
            title="Recent Orders"
            columns={[
              { key: 'id', label: 'Order ID', sortable: true },
              { key: 'customer', label: 'Customer', sortable: true },
              { key: 'total', label: 'Total', sortable: true },
              { key: 'orderDate', label: 'Date', sortable: true },
            ]}
            data={recentOrders}
            searchable={true}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Export Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Export to CSV
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
            Export to Excel
          </button>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
            Export to PDF
          </button>
        </div>
      </div>
    </div>
  );
};
