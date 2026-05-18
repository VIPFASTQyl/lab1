import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DataTable, StatusBadge } from '../components/common';

// Generic CRUD template - can be reused for Customers, Discounts, Locations, etc.
const mockCustomers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1-234-567-8900',
    orders: 5,
    totalSpent: '$450.00',
    status: 'active',
    joinDate: '2026-01-15',
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+1-234-567-8901',
    orders: 3,
    totalSpent: '$280.00',
    status: 'active',
    joinDate: '2026-02-20',
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike@example.com',
    phone: '+1-234-567-8902',
    orders: 1,
    totalSpent: '$99.00',
    status: 'inactive',
    joinDate: '2026-03-10',
  },
];

export const CustomersPage = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState(mockCustomers);

  const handleEdit = (customer) => {
    alert(`Edit customer: ${customer.name}`);
  };

  const handleDelete = (customer) => {
    if (window.confirm(`Delete customer ${customer.name}?`)) {
      setCustomers(customers.filter(c => c.id !== customer.id));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Customers Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage customer accounts and view their purchase history</p>
      </div>

      <DataTable
        title="All Customers"
        columns={[
          { key: 'name', label: 'Name', sortable: true },
          { key: 'email', label: 'Email', sortable: true },
          { key: 'orders', label: 'Orders', sortable: true },
          { key: 'totalSpent', label: 'Total Spent', sortable: true },
          {
            key: 'status',
            label: 'Status',
            render: (val) => <StatusBadge status={val} />,
          },
          { key: 'joinDate', label: 'Join Date', sortable: true },
        ]}
        data={customers}
        searchable={true}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};
