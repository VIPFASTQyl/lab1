import React from 'react';
import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react';
import { MetricCard } from '../components/common';

export const ReportsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">View detailed analytics and reports</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Revenue" value="$234,567" icon={DollarSign} color="green" />
        <MetricCard title="Events Created" value="24" icon={BarChart3} color="blue" />
        <MetricCard title="Tickets Sold" value="32,450" icon={TrendingUp} color="purple" />
        <MetricCard title="Active Customers" value="3,520" icon={Users} color="orange" />
      </div>

      {/* Report Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Report */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Sales Report</h2>
          <div className="h-64 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400">
            Chart placeholder - integrate with Chart.js or Recharts
          </div>
        </div>

        {/* Customer Growth */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Customer Growth</h2>
          <div className="h-64 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400">
            Chart placeholder - integrate with Chart.js or Recharts
          </div>
        </div>

        {/* Top Events */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Top Events by Revenue</h2>
          <div className="space-y-3">
            {[
              { name: 'NBA Finals Game 5', revenue: '$1,335,000' },
              { name: 'Summer Music Festival', revenue: '$243,900' },
              { name: 'Broadway Show Night', revenue: '$208,000' },
            ].map((event, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-700 rounded">
                <span className="text-gray-700 dark:text-gray-300">{event.name}</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{event.revenue}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Conversion Metrics */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Conversion Metrics</h2>
          <div className="space-y-3">
            {[
              { label: 'Cart Abandonment Rate', value: '32%' },
              { label: 'Conversion Rate', value: '42%' },
              { label: 'Average Order Value', value: '$125' },
              { label: 'Repeat Customer Rate', value: '28%' },
            ].map((metric, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">{metric.label}</span>
                <span className="font-bold text-gray-900 dark:text-white">{metric.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Options */}
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
