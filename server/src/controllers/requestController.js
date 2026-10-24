import BorrowRequest from '../models/BorrowRequest.js';
import Item from '../models/Item.js';
import User from '../models/User.js';
import { validateTransition, hasOverlappingBooking } from '../utils/stateMachine.js';

/**
 * @desc    Submit a borrow request for an item
 * @route   POST /api/requests
 * @access  Private (Student borrower)
 */
export const createRequest = async (req, res, next) => {
  try {
    const { itemId, startDate, endDate, purpose } = req.body;

    if (!itemId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide itemId, start date, and return date.',
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format provided.',
      });
    }

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: 'Return date must be strictly after the pickup date.',
      });
    }

    // Fetch the target item
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Equipment item not found.',
      });
    }

    if (item.status === 'UNAVAILABLE') {
      return res.status(400).json({
        success: false,
        message: 'This item is currently marked unavailable by its owner.',
      });
    }

    // Security check: Prevent self-borrowing
    if (item.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot borrow equipment that you already own.',
      });
    }

    // Overlap conflict detection
    const isOverlapping = await hasOverlappingBooking(itemId, start, end);
    if (isOverlapping) {
      return res.status(409).json({
        success: false,
        message: 'This item is already reserved or active for the selected dates. Please choose different dates.',
      });
    }

    // Calculate duration in days
    const diffTime = Math.abs(end - start);
    const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const estimatedCost =
      item.pricingType === 'RENT_PER_DAY' ? totalDays * item.pricePerDay : 0;

    const request = await BorrowRequest.create({
      item: item._id,
      lender: item.owner,
      borrower: req.user._id,
      startDate: start,
      endDate: end,
      totalDays,
      estimatedCost,
      depositAmount: item.depositAmount,
      purpose: purpose || 'Academic course project / exam preparation',
      status: 'PENDING',
    });

    // Increment borrower's counter
    await User.findByIdAndUpdate(req.user._id, { $inc: { totalBorrows: 1 } });

    res.status(201).json({
      success: true,
      message: 'Borrow request submitted successfully! Awaiting lender approval.',
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all borrow requests made by the current user (Outgoing)
 * @route   GET /api/requests/borrower
 * @access  Private (Student borrower)
 */
export const getBorrowerRequests = async (req, res, next) => {
  try {
    const requests = await BorrowRequest.find({ borrower: req.user._id })
      .populate('item', 'title images category condition pricingType pricePerDay depositAmount pickupLocation status')
      .populate('lender', 'name email phone department trustScore totalReviews avatar collegeId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all incoming borrow requests for items listed by current user (Incoming)
 * @route   GET /api/requests/lender
 * @access  Private (Student lender)
 */
export const getLenderRequests = async (req, res, next) => {
  try {
    const requests = await BorrowRequest.find({ lender: req.user._id })
      .populate('item', 'title images category condition pricingType pricePerDay depositAmount pickupLocation status')
      .populate('borrower', 'name email phone department trustScore totalReviews totalBorrows avatar collegeId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single borrow request by ID
 * @route   GET /api/requests/:id
 * @access  Private (Participant only)
 */
export const getRequestById = async (req, res, next) => {
  try {
    const request = await BorrowRequest.findById(req.params.id)
      .populate('item', 'title images category condition pricingType pricePerDay depositAmount pickupLocation status')
      .populate('lender', 'name email phone department trustScore totalReviews avatar collegeId')
      .populate('borrower', 'name email phone department trustScore totalReviews avatar collegeId');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Borrow request not found.',
      });
    }

    // Authorization check: Only borrower or lender can inspect
    const isBorrower = request.borrower._id.toString() === req.user._id.toString();
    const isLender = request.lender._id.toString() === req.user._id.toString();

    if (!isBorrower && !isLender) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized: you are not a participant in this request.',
      });
    }

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Transition status of a borrow request (State Machine)
 * @route   PATCH /api/requests/:id/status
 * @access  Private (Authorized participant)
 */
export const updateRequestStatus = async (req, res, next) => {
  try {
    const { status: targetStatus, lenderNotes } = req.body;

    if (!targetStatus) {
      return res.status(400).json({
        success: false,
        message: 'Please provide the target status to transition to.',
      });
    }

    const request = await BorrowRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Borrow request not found.',
      });
    }

    const isLender = request.lender.toString() === req.user._id.toString();
    const isBorrower = request.borrower.toString() === req.user._id.toString();

    if (!isLender && !isBorrower) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized: you are not a participant in this borrow transaction.',
      });
    }

    const userRole = isLender ? 'LENDER' : 'BORROWER';

    // 1. Validate state machine transition against role
    const transitionCheck = validateTransition(request.status, targetStatus, userRole);
    if (!transitionCheck.allowed) {
      return res.status(400).json({
        success: false,
        message: transitionCheck.reason,
      });
    }

    // 2. Extra conflict check if lender is approving
    if (targetStatus === 'APPROVED') {
      const isOverlapping = await hasOverlappingBooking(
        request.item,
        request.startDate,
        request.endDate,
        request._id
      );

      if (isOverlapping) {
        return res.status(409).json({
          success: false,
          message: 'Cannot approve request: another reservation already exists for these dates.',
        });
      }
    }

    // 3. Update Item status accordingly
    if (targetStatus === 'ACTIVE') {
      request.handoverDate = new Date();
      await Item.findByIdAndUpdate(request.item, { status: 'BORROWED' });
    } else if (targetStatus === 'RETURNED') {
      request.actualReturnDate = new Date();
      await Item.findByIdAndUpdate(request.item, { status: 'AVAILABLE' });
    } else if (targetStatus === 'REJECTED' || targetStatus === 'CANCELLED') {
      // If was previously active, free the item back up
      if (request.status === 'ACTIVE') {
        await Item.findByIdAndUpdate(request.item, { status: 'AVAILABLE' });
      }
    }

    // 4. Update request status
    request.status = targetStatus;
    if (lenderNotes) request.lenderNotes = lenderNotes;

    await request.save();

    res.status(200).json({
      success: true,
      message: `Borrow request marked as ${targetStatus}.`,
      data: request,
    });
  } catch (error) {
    next(error);
  }
};
