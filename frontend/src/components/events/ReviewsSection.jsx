import React, { useState } from 'react';
import { Star, UserCircle } from 'lucide-react';
import { Button, Card, Input } from '../ui';

export const ReviewsSection = ({ eventId, reviews = [], onSubmitReview }) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const handleSubmitReview = async () => {
    if (!comment.trim()) return;
    try {
      setSubmitting(true);
      setSubmitError(null);
      if (onSubmitReview) {
        await onSubmitReview({ eventId, rating, comment });
      }
      setComment('');
      setRating(5);
      setShowReviewForm(false);
    } catch (err) {
      setSubmitError(err?.response?.data?.message || err?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Reviews & Ratings</h2>

        {/* Rating Summary */}
        <Card className="p-6 md:p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
                {averageRating}
              </div>
              <div className="flex justify-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={`${
                      i < Math.round(averageRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Based on {reviews.length} reviews
              </p>
            </div>

            {/* Rating Bars */}
            <div className="md:col-span-2">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = reviews.filter((r) => r.rating === stars).length;
                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;

                return (
                  <div key={stars} className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-1 min-w-fit text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stars}
                      <Star size={14} className="fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-dark-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 min-w-fit">
                      {count} reviews
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Add Review Button */}
        <div className="mb-8">
          <Button
            variant="secondary"
            size="md"
            onClick={() => setShowReviewForm(!showReviewForm)}
          >
            {showReviewForm ? 'Cancel' : 'Write a Review'}
          </Button>
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <Card className="p-6 md:p-8 mb-8 animate-slide-up">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Share Your Experience</h3>

            {submitError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">
                {submitError}
              </div>
            )}

            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((stars) => (
                    <button
                      key={stars}
                      onClick={() => setRating(stars)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        size={28}
                        className={`${
                          stars <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Your Review
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts about this event..."
                  className="input-field w-full h-32"
                />
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={handleSubmitReview}
              disabled={!comment.trim() || submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </Card>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <Card key={review.id} className="p-6 md:p-8">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <UserCircle size={40} className="text-gray-400 dark:text-gray-500 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 dark:text-white">{review.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={`${
                                i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300 dark:text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(review.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">No reviews yet. Be the first to review!</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

ReviewsSection.displayName = 'ReviewsSection';
