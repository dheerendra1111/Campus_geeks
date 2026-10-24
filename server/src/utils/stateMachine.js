import BorrowRequest from '../models/BorrowRequest.js';

/**
 * State Transition Matrix for Borrow Requests
 * Defines which roles (LENDER or BORROWER) can trigger which state transitions.
 */
export const ALLOWED_TRANSITIONS = {
  PENDING: {
    APPROVED: ['LENDER'],
    REJECTED: ['LENDER'],
    CANCELLED: ['BORROWER'],
  },
  APPROVED: {
    ACTIVE: ['BORROWER'],    // Borrower marks item collected in person
    CANCELLED: ['LENDER', 'BORROWER'], // Either party can cancel prior to handover
  },
  ACTIVE: {
    RETURNED: ['LENDER'],    // Lender confirms item returned in good shape
  },
  OVERDUE: {
    RETURNED: ['LENDER'],    // Lender confirms late return
  },
  REJECTED: {},
  RETURNED: {},
  CANCELLED: {},
};

/**
 * Validates if a requested transition is allowed based on current status and user role
 * @param {string} currentStatus - Existing request status
 * @param {string} nextStatus - Desired target status
 * @param {'LENDER' | 'BORROWER'} userRole - Role of the requesting student
 * @returns {{ allowed: boolean, reason?: string }}
 */
export const validateTransition = (currentStatus, nextStatus, userRole) => {
  const allowedForCurrent = ALLOWED_TRANSITIONS[currentStatus];

  if (!allowedForCurrent || !allowedForCurrent[nextStatus]) {
    return {
      allowed: false,
      reason: `Cannot transition borrow request from ${currentStatus} to ${nextStatus}.`,
    };
  }

  const allowedRoles = allowedForCurrent[nextStatus];
  if (!allowedRoles.includes(userRole)) {
    return {
      allowed: false,
      reason: `Only the ${allowedRoles.join(' or ')} can change status to ${nextStatus}.`,
    };
  }

  return { allowed: true };
};

/**
 * Check if an item is already booked for an overlapping date range
 * @param {string} itemId - The target item's ObjectId
 * @param {Date} requestedStart - The desired start date
 * @param {Date} requestedEnd - The desired end date
 * @param {string} [excludeRequestId] - Optional request to exclude (e.g. self during updates)
 * @returns {Promise<boolean>} true if an overlapping APPROVED or ACTIVE request exists
 */
export const hasOverlappingBooking = async (
  itemId,
  requestedStart,
  requestedEnd,
  excludeRequestId = null
) => {
  const query = {
    item: itemId,
    status: { $in: ['APPROVED', 'ACTIVE'] },
    // Overlap condition: startA <= endB && endA >= startB
    startDate: { $lte: new Date(requestedEnd) },
    endDate: { $gte: new Date(requestedStart) },
  };

  if (excludeRequestId) {
    query._id = { $ne: excludeRequestId };
  }

  const conflict = await BorrowRequest.findOne(query);
  return Boolean(conflict);
};
