import React, { useEffect, useState } from 'react';
import { DataTable, StatusBadge } from '../components/common';
import { paymentApi, salesApi } from '../../utils/api';

const mapOrder = async (order) => {
  const [details, client, payments] = await Promise.all([
    salesApi.getOrderDetails(order.OrderId).catch(() => []),
    order.ClientId ? salesApi.getClientById(order.ClientId).catch(() => null) : Promise.resolve(null),
    paymentApi.getAll({ orderId: order.OrderId }).catch(() => []),
  ]);

  const items = (details || []).map((item) => ({
    orderDetailId: item.DetailId,
    eventId: item.EventId,
    eventTitle: item.EventTitle || 'Unknown Event',
    ticketType: item.TicketType || '',
    buyerName: item.BuyerName || `${client?.FirstName || ''} ${client?.LastName || ''}`.trim(),
    buyerEmail: item.BuyerEmail || client?.Email || '',
    quantity: Number(item.Quantity || 0),
    unitPrice: Number(item.UnitPrice || 0),
    lineTotal: Number(item.TotalPrice || 0) || Number(item.Quantity || 0) * Number(item.UnitPrice || 0),
  }));

  const payment = payments?.[0]
    ? {
        paymentId: payments[0].PaymentId,
        amount: Number(payments[0].Amount || 0),
        paymentDate: payments[0].PaymentDate,
        status: payments[0].Status || 'pending',
      }
    : null;

  return {
    orderId: order.OrderId,
    id: `ORD-${String(order.OrderId).padStart(3, '0')}`,
    orderDate: order.OrderDate,
    totalAmount: Number(order.TotalAmount || 0),
    orderStatus: String(order.Status || 'completed').toLowerCase(),
    buyer: {
      clientId: order.ClientId,
      fullName: client ? `${client.FirstName || ''} ${client.LastName || ''}`.trim() : items[0]?.buyerName || 'Unknown Buyer',
      email: client?.Email || items[0]?.buyerEmail || '',
      phoneNumber: client?.PhoneNumber || '',
      address: client?.Address || '',
    },
    payment,
    items,
  };
};

export const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        let ordersData = [];

        try {
          ordersData = await salesApi.getAdminOrders();
        } catch (adminErr) {
          ordersData = await salesApi.getAllOrders();
        }

        const enriched = await Promise.all((ordersData || []).map(mapOrder));
        setOrders(enriched.map((order) => ({
          ...order,
          customer: order.buyer?.fullName || 'Unknown Buyer',
          email: order.buyer?.email || '',
          event: order.items?.map((item) => item.eventTitle).filter(Boolean).join(', ') || 'Multiple events',
          tickets: order.items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) || 0,
          total: `$${Number(order.totalAmount || 0).toFixed(2)}`,
          status: String(order.orderStatus || 'completed').toLowerCase(),
          date: order.orderDate ? new Date(order.orderDate).toISOString().slice(0, 10) : '',
        })));
        setError(null);
      } catch (err) {
        console.error('Failed to load admin orders:', err);
        setError(err.response?.data?.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

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
        <p className="text-gray-600 dark:text-gray-400 mt-2">View who bought tickets, what they bought, and payment totals</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Orders Table */}
        {loading ? (
          <div className="rounded-lg bg-white p-6 text-center text-gray-600 shadow dark:bg-slate-800 dark:text-gray-300">
            Loading orders...
          </div>
        ) : (
          <DataTable
            title="All Orders"
            columns={[
              { key: 'id', label: 'Order ID', sortable: true },
              { key: 'customer', label: 'Customer', sortable: true },
              { key: 'email', label: 'Email', sortable: true },
              { key: 'event', label: 'Event(s)', sortable: true },
              { key: 'tickets', label: 'Tickets', sortable: true },
              { key: 'total', label: 'Total Paid', sortable: true },
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
        )}

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
                    {selectedOrder.items?.map((item) => (
                      <div key={item.orderDetailId} className="rounded-lg border border-gray-200 dark:border-slate-700 p-3">
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-900 dark:text-white font-medium">{item.eventTitle}</span>
                          <span className="text-blue-600 dark:text-blue-400 font-semibold">${item.lineTotal.toFixed(2)}</span>
                        </div>
                        <div className="mt-2 flex justify-between text-sm text-gray-600 dark:text-gray-400">
                          <span>Quantity: {item.quantity}</span>
                          <span>Unit price: ${item.unitPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}

                    <div className="flex justify-between text-lg font-bold pt-2">
                      <span className="text-gray-900 dark:text-white">Total:</span>
                      <span className="text-blue-600 dark:text-blue-400">{selectedOrder.total}</span>
                    </div>

                    {selectedOrder.payment && (
                      <div className="mt-4 rounded-lg bg-gray-50 dark:bg-slate-700 p-3">
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                          <span>Payment status</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{selectedOrder.payment.status}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-2">
                          <span>Payment amount</span>
                          <span className="font-semibold text-gray-900 dark:text-white">${selectedOrder.payment.amount.toFixed(2)}</span>
                        </div>
                      </div>
                    )}
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
