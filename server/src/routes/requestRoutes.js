import express from 'express';
import {
  createRequest,
  getBorrowerRequests,
  getLenderRequests,
  getRequestById,
  updateRequestStatus,
} from '../controllers/requestController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All borrow request routes require authentication
router.use(protect);

router.post('/', createRequest);
router.get('/borrower', getBorrowerRequests);
router.get('/lender', getLenderRequests);
router.get('/:id', getRequestById);
router.patch('/:id/status', updateRequestStatus);

export default router;
