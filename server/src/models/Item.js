import mongoose from 'mongoose';

/**
 * Item Schema for CampusGeeks
 * Handles equipment listings, condition grading, pricing models (Free vs Rent per day + Deposit),
 * and search indexing.
 */
const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an item title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a description of the item and its condition'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: [
        'Electronics & Kits',
        'Lab Gear',
        'Textbooks & Notes',
        'Drafting & Tools',
        'Sports & Events',
        'Other / General',
      ],
      index: true,
    },
    condition: {
      type: String,
      required: [true, 'Please specify the item condition'],
      enum: ['Brand New', 'Like New', 'Good', 'Fair'],
      default: 'Good',
    },
    images: {
      type: [String],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'Please provide at least one photo of the item',
      },
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    pricingType: {
      type: String,
      enum: ['FREE', 'FOR_SALE', 'RENT_PER_DAY'],
      default: 'FREE',
    },
    price: {
      type: Number,
      default: 0,
      min: [0, 'Selling price cannot be negative'],
    },
    pricePerDay: {
      type: Number,
      default: 0,
      min: [0, 'Price per day cannot be negative'],
    },
    depositAmount: {
      type: Number,
      default: 0,
      min: [0, 'Deposit amount cannot be negative'],
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'BORROWED', 'UNAVAILABLE'],
      default: 'AVAILABLE',
      index: true,
    },
    pickupLocation: {
      type: String,
      default: 'Campus Library / Main Gate',
      trim: true,
      maxlength: [120, 'Location description cannot exceed 120 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound text index for fast keyword searching across title and description
itemSchema.index({ title: 'text', description: 'text' });

// Compound index for optimized catalog filtering by category and availability
itemSchema.index({ category: 1, status: 1, createdAt: -1 });

const Item = mongoose.model('Item', itemSchema);

export default Item;
