import React, { useState } from 'react';
import { DataTable, StatusBadge } from '../components/common';

const mockDiscounts = [
  {
    id: 'DISC-001',
    code: 'SUMMER2024',
    description: 'Summer festival discount',
    discount: '20%',
    applicableTo: 'Summer Music Festival',
    usageCount: 234,
    expiryDate: '2026-08-31',
    status: 'active',
  },
  {
    id: 'DISC-002',
    code: 'BROADWAY15',
    description: 'Broadway show discount',
    discount: '15%',
    applicableTo: 'All Broadway Events',
    usageCount: 145,
    expiryDate: '2026-07-31',
    status: 'active',
  },
  {
    id: 'DISC-003',
    code: 'TECH50',
    description: 'Tech conference early bird',
    discount: '50%',
    applicableTo: 'Tech Conference 2024',
    usageCount: 89,
    expiryDate: '2026-06-30',
    status: 'expired',
  },
];

export const DiscountsPage = () => {
  const [discounts, setDiscounts] = useState(mockDiscounts);

  const handleEdit = (discount) => {
    alert(`Edit discount: ${discount.code}`);
  };

  const handleDelete = (discount) => {
    if (window.confirm(`Delete discount ${discount.code}?`)) {
      setDiscounts(discounts.filter(d => d.id !== discount.id));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Discounts & Promo Codes</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Create and manage discount codes for your events</p>
      </div>

      <DataTable
        title="All Discounts"
        columns={[
          { key: 'code', label: 'Code', sortable: true },
          { key: 'description', label: 'Description', sortable: true },
          { key: 'discount', label: 'Discount', sortable: true },
          { key: 'usageCount', label: 'Usage Count', sortable: true },
          { key: 'expiryDate', label: 'Expiry Date', sortable: true },
          {
            key: 'status',
            label: 'Status',
            render: (val) => <StatusBadge status={val} />,
          },
        ]}
        data={discounts}
        searchable={true}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};
