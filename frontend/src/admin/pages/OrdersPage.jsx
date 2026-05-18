import React, { useState } from 'react';
import { DataTable, StatusBadge } from '../components/common';

const mockOrders = [
  {
    id: 'ORD-001',
    customer: 'John Doe',
    email: 'john@example.com',
    event: 'Summer Music Festival',
    tickets: 2,
    total: '$90.00',
    status: 'completed',
    date: '2026-05-18',
  },
  {
    id: 'ORD-002',
    customer: 'Jane Smith',
    email: 'jane@example.com',
    event: 'Broadway Show',
    tickets: 4,
    total: '$260.00',
    status: 'completed',
    date: '2026-05-18',
  },
  {
    id: 'ORD-003',
    customer: 'Mike Johnson',
    email: 'mike@example.com',
    event: 'Tech Conference',
    tickets: 1,
    total: '$99.00',
    status: 'pending',
    date: '2026-05-18',
  },
  {
    id: 'ORD-004',
    customer: 'Sarah Wilson',
    email: 'sarah@example.com',
    event: 'Jazz Night',
    tickets: 3,
    total: '$105.00',
    status: 'cancelled',
    date: '2026-05-17',
  },
];

export const OrdersPage = () => {
  const [orders, setOrders] = useState(mockOrders);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleEdit = (order) => {
    setSelectedOrder(order);
  };

  const handleView = (order) => {
    setSelectedOrder(order);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Orders Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">View and manage customer orders</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Orders Table */}
        <DataTable
          title="All Orders"
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
            { key: 'date', label: 'Date', sortable: true },
          ]}
          data={orders}
          searchable={true}
          onView={handleView}
          onEdit={handleEdit}
        />

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Order Details: {selectedOrder.id}
                </h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Customer</label>
                    <p className="text-lg text-gray-900 dark:text-white">{selectedOrder.customer}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedOrder.email}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</label>
                    <div className="mt-2">
                      <StatusBadge status={selectedOrder.status} />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">Order Items</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Event:</span>
                      <span className="text-gray-900 dark:text-white font-medium">{selectedOrder.event}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Quantity:</span>
                      <span className="text-gray-900 dark:text-white font-medium">{selectedOrder.tickets} tickets</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-gray-900 dark:text-white">Total:</span>
                      <span className="text-blue-600 dark:text-blue-400">{selectedOrder.total}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-slate-700">
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                  >
                    Close
                  </button>
                  <button className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    Download Invoice
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
