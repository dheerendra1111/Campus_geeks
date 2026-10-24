import express from 'express';
import {
  createItem,
  getItems,
  getItemById,
  getMyListings,
  updateItem,
  deleteItem,
} from '../controllers/itemController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getItems);
router.get('/user/my-listings', protect, getMyListings);
router.get('/:id', getItemById);

// Protected routes
router.post('/', protect, upload.array('images', 5), createItem);
router.put('/:id', protect, updateItem);
router.delete('/:id', protect, deleteItem);

export default router;
