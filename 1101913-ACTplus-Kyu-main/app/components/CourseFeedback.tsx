// app/components/CourseFeedback.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

type Feedback = {
  id: number;
  star: number;
  comment: string | null;
  createdAt: string;
  user: {
    id: number;
    username: string;
    imageUrl: string | null;
  };
};

type CourseFeedbackProps = {
  courseId: number;
  isEnrolled: boolean;
};

export default function CourseFeedback({ courseId, isEnrolled }: CourseFeedbackProps) {
  const { data: session } = useSession();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userFeedback, setUserFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    fetchFeedbacks();
  }, [courseId]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v0/courses/${courseId}/feedback`);
      const data = await res.json();

      if (data.success) {
        setFeedbacks(data.feedbacks);
        setStatistics(data.statistics);

        // Find user's feedback
        const currentUser = session?.user as any;
        if (currentUser) {
          const myFeedback = data.feedbacks.find((f: Feedback) => f.user.id === currentUser.id);
          if (myFeedback) {
            setUserFeedback(myFeedback);
            setRating(myFeedback.star);
            setComment(myFeedback.comment || '');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/v0/courses/${courseId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ star: rating, comment: comment.trim() || null })
      });

      const data = await res.json();

      if (data.success) {
        alert(userFeedback ? 'Review updated successfully!' : 'Review submitted successfully!');
        setShowRatingForm(false);
        fetchFeedbacks();
      } else {
        alert(data.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete your review?')) {
      return;
    }

    try {
      const res = await fetch(`/api/v0/courses/${courseId}/feedback`, {
        method: 'DELETE'
      });

      const data = await res.json();

      if (data.success) {
        alert('Review deleted successfully!');
        setRating(0);
        setComment('');
        setUserFeedback(null);
        setShowRatingForm(false);
        fetchFeedbacks();
      } else {
        alert(data.error || 'Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting feedback:', error);
      alert('Failed to delete review');
    }
  };

  const renderStars = (count: number, size: string = 'w-5 h-5') => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`${size} ${star <= count ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews & Ratings</h2>

      {/* Statistics */}
      {statistics && statistics.total > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900 mb-2">
                {statistics.averageRating.toFixed(1)}
              </div>
              {renderStars(Math.round(statistics.averageRating), 'w-6 h-6')}
              <div className="text-sm text-gray-600 mt-2">
                {statistics.total} {statistics.total === 1 ? 'review' : 'reviews'}
              </div>
            </div>

            <div className="flex-1">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-3 mb-2">
                  <span className="text-sm text-gray-600 w-16">{star} stars</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all"
                      style={{
                        width: `${statistics.total > 0 
                          ? (statistics.ratingCounts[star] / statistics.total) * 100 
                          : 0}%`
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8">
                    {statistics.ratingCounts[star]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Rating Form for Enrolled Users */}
      {isEnrolled && session?.user && (
        <div className="mb-8">
          {userFeedback && !showRatingForm ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-green-900 mb-2">Your Review</p>
                  {renderStars(userFeedback.star)}
                  {userFeedback.comment && (
                    <p className="text-gray-700 mt-2">{userFeedback.comment}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowRatingForm(true)}
                    className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {!showRatingForm ? (
                <button
                  onClick={() => setShowRatingForm(true)}
                  className="w-full px-6 py-3 border-2 border-indigo-600 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition"
                >
                  Write a Review
                </button>
              ) : (
                <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-6">
                  <p className="font-semibold text-gray-900 mb-4">
                    {userFeedback ? 'Update Your Review' : 'Rate This Course'}
                  </p>

                  {/* Star Rating */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Rating
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="focus:outline-none"
                        >
                          <svg
                            className={`w-10 h-10 transition-colors ${
                              star <= (hoverRating || rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                            />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Review (Optional)
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                      placeholder="Share your experience with this course..."
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={submitting || rating === 0}
                      className="flex-1 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                    >
                      {submitting ? 'Submitting...' : userFeedback ? 'Update Review' : 'Submit Review'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowRatingForm(false);
                        if (userFeedback) {
                          setRating(userFeedback.star);
                          setComment(userFeedback.comment || '');
                        }
                      }}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {feedbacks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-5xl mb-4">💬</div>
            <p>No reviews yet. Be the first to review this course!</p>
          </div>
        ) : (
          feedbacks.map((feedback) => (
            <div key={feedback.id} className="border-b border-gray-200 pb-6 last:border-0">
              <div className="flex items-start gap-4">
                <img
                  src={feedback.user.imageUrl || '/uploads/images/user-default1.png'}
                  alt={feedback.user.username}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{feedback.user.username}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(feedback.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    {renderStars(feedback.star)}
                  </div>
                  {feedback.comment && (
                    <p className="text-gray-700">{feedback.comment}</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}