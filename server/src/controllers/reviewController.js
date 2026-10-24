import Review from '../models/Review.js';
import BorrowRequest from '../models/BorrowRequest.js';
import User from '../models/User.js';

/**
 * @desc    Submit a peer review for a completed borrow transaction
 * @route   POST /api/reviews
 * @access  Private (Participants in completed transaction only)
 */
export const createReview = async (req, res, next) => {
  try {
    const { requestId, rating, comment } = req.body;

    if (!requestId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide requestId, star rating (1-5), and feedback comment.',
      });
    }

    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5.',
      });
    }

    const request = await BorrowRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Borrow transaction not found.',
      });
    }

    // Reviews can only be left once the item is marked RETURNED
    if (request.status !== 'RETURNED') {
      return res.status(400).json({
        success: false,
        message: 'Reviews can only be submitted after the item has been returned and verified.',
      });
    }

    const isLender = request.lender.toString() === req.user._id.toString();
    const isBorrower = request.borrower.toString() === req.user._id.toString();

    if (!isLender && !isBorrower) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized: you were not a participant in this transaction.',
      });
    }

    // Determine who is being rated
    const revieweeId = isBorrower ? request.lender : request.borrower;
    const roleOfReviewee = isBorrower ? 'LENDER' : 'BORROWER';

    // Prevent duplicate review submission
    const existingReview = await Review.findOne({
      request: requestId,
      reviewer: req.user._id,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this transaction.',
      });
    }

    const review = await Review.create({
      request: requestId,
      reviewer: req.user._id,
      reviewee: revieweeId,
      roleOfReviewee,
      rating: numericRating,
      comment: comment.trim(),
    });

    // Dynamically recalculate reviewee's trust score
    const allReviews = await Review.find({ reviewee: revieweeId });
    const totalScore = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const newTrustScore = Number((totalScore / allReviews.length).toFixed(1));

    await User.findByIdAndUpdate(revieweeId, {
      trustScore: newTrustScore,
      totalReviews: allReviews.length,
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully! Peer trust score updated.',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all reviews received by a user
 * @route   GET /api/reviews/user/:userId
 * @access  Public
 */
export const getUserReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'name department avatar collegeId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};
