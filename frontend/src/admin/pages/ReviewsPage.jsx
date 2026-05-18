import React from 'react';
import { DataTable, StatusBadge } from '../components/common';

const mockReviews = [
  {
    id: 1,
    reviewer: 'John Doe',
    event: 'Summer Music Festival',
    rating: '5',
    comment: 'Amazing event! Highly recommend.',
    date: '2026-05-18',
    status: 'approved',
  },
  {
    id: 2,
    reviewer: 'Jane Smith',
    event: 'Broadway Show',
    rating: '4',
    comment: 'Great show, long wait at entrance.',
    date: '2026-05-17',
    status: 'approved',
  },
  {
    id: 3,
    reviewer: 'Mike Johnson',
    event: 'Tech Conference',
    rating: '3',
    comment: 'Good content but needs better organization.',
    date: '2026-05-16',
    status: 'pending',
  },
];

export const ReviewsPage = () => {
  const [reviews, setReviews] = React.useState(mockReviews);

  const handleApprove = (review) => {
    setReviews(reviews.map(r => r.id === review.id ? { ...r, status: 'approved' } : r));
  };

  const handleDelete = (review) => {
    if (window.confirm('Delete this review?')) {
      setReviews(reviews.filter(r => r.id !== review.id));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reviews Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Moderate and manage customer reviews</p>
      </div>

      <DataTable
        title="All Reviews"
        columns={[
          { key: 'reviewer', label: 'Reviewer', sortable: true },
          { key: 'event', label: 'Event', sortable: true },
          { key: 'rating', label: 'Rating', sortable: true },
          { key: 'comment', label: 'Comment', sortable: false },
          { key: 'date', label: 'Date', sortable: true },
          {
            key: 'status',
            label: 'Status',
            render: (val) => <StatusBadge status={val} />,
          },
        ]}
        data={reviews}
        searchable={true}
        onEdit={handleApprove}
        onDelete={handleDelete}
      />
    </div>
  );
};
