import React, { useEffect, useState } from 'react';
import { DataTable, StatusBadge } from '../components/common';
import { mysqlApi, paymentApi } from '../../utils/api';

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
          paymentId: payment.PaymentId,
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

  const handleEdit = async (payment) => {
    const amountInput = window.prompt('Payment amount', String(Number(payment.amount.replace('$', '')) || 0));
    if (amountInput === null) return;
    const methodInput = window.prompt('Payment method', payment.method || 'Card');
    if (methodInput === null) return;
    const statusInput = window.prompt('Payment status', payment.status || 'pending');
    if (statusInput === null) return;
    const referenceInput = window.prompt('Payment reference', payment.reference || '');
    if (referenceInput === null) return;

    try {
      await mysqlApi.update('payments', payment.paymentId, {
        Amount: Number(amountInput),
        PaymentMethod: methodInput,
        Status: statusInput,
        Reference: referenceInput || null,
      });
      setPayments((prev) => prev.map((row) => (
        row.paymentId === payment.paymentId
          ? { ...row, amount: `$${Number(amountInput).toFixed(2)}`, method: methodInput, status: String(statusInput).toLowerCase(), reference: referenceInput || '' }
          : row
      )));
    } catch (err) {
      console.error('Failed to update payment:', err);
      setError(err.response?.data?.message || 'Failed to update payment');
    }
  };

  const handleDelete = async (payment) => {
    if (!window.confirm(`Delete payment ${payment.id}?`)) return;
    try {
      await mysqlApi.delete('payments', payment.paymentId);
      setPayments((prev) => prev.filter((row) => row.paymentId !== payment.paymentId));
    } catch (err) {
      console.error('Failed to delete payment:', err);
      setError(err.response?.data?.message || 'Failed to delete payment');
    }
  };

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
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

PaymentsPage.displayName = 'PaymentsPage';