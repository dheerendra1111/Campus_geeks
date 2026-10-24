import mongoose from 'mongoose';

/**
 * BorrowRequest Schema for CampusGeeks
 * Implements the core State Machine managing the lifecycle of equipment sharing
 * between student borrowers and lenders.
 */
const borrowRequestSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
      index: true,
    },
    lender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    borrower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Please specify the borrowing start/pickup date'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please specify the estimated return date'],
    },
    totalDays: {
      type: Number,
      required: true,
      min: [1, 'Borrowing period must be at least 1 day'],
      default: 1,
    },
    estimatedCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    depositAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    purpose: {
      type: String,
      trim: true,
      maxlength: [300, 'Purpose note cannot exceed 300 characters'],
      default: 'Academic course project / exam preparation',
    },
    status: {
      type: String,
      enum: [
        'PENDING',    // Borrower submitted request, awaiting lender decision
        'APPROVED',   // Lender approved request, ready for in-person handoff
        'REJECTED',   // Lender declined the request
        'ACTIVE',     // Borrower confirmed item collected in person
        'RETURNED',   // Lender confirmed item returned in good condition
        'CANCELLED',  // Cancelled before handover
        'OVERDUE',    // Active borrowing has passed the agreed return date
      ],
      default: 'PENDING',
      index: true,
    },
    handoverDate: {
      type: Date,
    },
    actualReturnDate: {
      type: Date,
    },
    lenderNotes: {
      type: String,
      trim: true,
      maxlength: [200, 'Notes cannot exceed 200 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for fast dashboard queries
borrowRequestSchema.index({ borrower: 1, status: 1, createdAt: -1 });
borrowRequestSchema.index({ lender: 1, status: 1, createdAt: -1 });
borrowRequestSchema.index({ item: 1, status: 1 });

const BorrowRequest = mongoose.model('BorrowRequest', borrowRequestSchema);

export default BorrowRequest;
