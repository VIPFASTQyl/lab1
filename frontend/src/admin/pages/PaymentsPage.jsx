import React, { useEffect, useState } from 'react';
import { DataTable, StatusBadge } from '../components/common';
import { paymentApi } from '../../utils/api';

export const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPayments = async () => {
      try {
        setLoading(true);
        const data = await paymentApi.getAll();
        setPayments((data || []).map((payment) => ({
          id: `PAY-${String(payment.PaymentId).padStart(3, '0')}`,
          orderId: `ORD-${String(payment.OrderId).padStart(3, '0')}`,
          amount: `$${Number(payment.Amount || 0).toFixed(2)}`,
          method: payment.PaymentMethod || 'Card',
          status: String(payment.Status || 'pending').toLowerCase(),
          date: payment.PaymentDate ? new Date(payment.PaymentDate).toISOString().slice(0, 10) : '',
          reference: payment.Reference || '',
        })));
        setError(null);
      } catch (err) {
        console.error('Failed to load payments:', err);
        setError(err.response?.data?.message || 'Failed to load payments');
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payments</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Track payments captured for ticket purchases</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-lg bg-white p-6 text-center text-gray-600 shadow dark:bg-slate-800 dark:text-gray-300">
          Loading payments...
        </div>
      ) : (
        <DataTable
          title="All Payments"
          columns={[
            { key: 'id', label: 'Payment ID', sortable: true },
            { key: 'orderId', label: 'Order ID', sortable: true },
            { key: 'amount', label: 'Amount', sortable: true },
            { key: 'method', label: 'Method', sortable: true },
            { key: 'reference', label: 'Reference', sortable: true },
            {
              key: 'status',
              label: 'Status',
              render: (val) => <StatusBadge status={val} />,
            },
            { key: 'date', label: 'Date', sortable: true },
          ]}
          data={payments}
          searchable={true}
        />
      )}
    </div>
  );
};

PaymentsPage.displayName = 'PaymentsPage';