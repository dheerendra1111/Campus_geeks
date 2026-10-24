import mongoose from 'mongoose';

/**
 * Review Schema for CampusGeeks
 * Handles peer accountability, star ratings (1 to 5), and feedback
 * for completed borrowing transactions.
 */
const reviewSchema = new mongoose.Schema(
  {
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BorrowRequest',
      required: true,
      index: true,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    roleOfReviewee: {
      type: String,
      enum: ['LENDER', 'BORROWER'],
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a star rating between 1 and 5'],
      min: [1, 'Rating must be at least 1 star'],
      max: [5, 'Rating cannot exceed 5 stars'],
    },
    comment: {
      type: String,
      required: [true, 'Please provide a brief feedback comment'],
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent the same reviewer from submitting multiple reviews for the same transaction
reviewSchema.index({ request: 1, reviewer: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
