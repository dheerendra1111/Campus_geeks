import React, { useState } from 'react';
import { Star, AlertCircle, Sparkles } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import reviewService from '../../services/reviewService';

export const ReviewModal = ({ isOpen, onClose, request, onReviewSuccess }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!request) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!comment.trim()) {
      setError('Please provide a brief comment on the equipment or interaction.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await reviewService.createReview({
        requestId: request._id,
        rating,
        comment: comment.trim(),
      });

      if (res.success) {
        onReviewSuccess();
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Leave a Peer Review">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1">
          <p className="text-xs text-slate-500 font-medium">Equipment item:</p>
          <p className="text-sm font-bold text-slate-900">{request.item?.title}</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Star Rating Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
            Rating (1 to 5 Stars)
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = hoverRating ? star <= hoverRating : star <= rating;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-2xl transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                >
                  <Star
                    className={`w-8 h-8 ${
                      active
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200 hover:text-slate-300'
                    }`}
                  />
                </button>
              );
            })}
            <span className="text-sm font-extrabold text-slate-700 ml-2">
              {hoverRating || rating} / 5 Stars
            </span>
          </div>
        </div>

        {/* Comment Textarea */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
            Your Feedback & Condition Note
          </label>
          <textarea
            rows={3}
            required
            placeholder="How was the equipment condition? Was the handover on time?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            className="px-6"
          >
            Submit Review
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReviewModal;
