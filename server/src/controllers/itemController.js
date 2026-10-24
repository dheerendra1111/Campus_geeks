import Item from '../models/Item.js';
import User from '../models/User.js';
import { uploadImageBuffer } from '../config/cloudinary.js';

/**
 * @desc    Create a new equipment listing
 * @route   POST /api/items
 * @access  Private (Student only)
 */
export const createItem = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      condition,
      pricingType,
      price,
      pricePerDay,
      depositAmount,
      pickupLocation,
    } = req.body;

    // Validate required fields
    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, and category.',
      });
    }

    // Process image uploads
    let imageUrls = [];

    // 1. Files uploaded via Multer
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadImageBuffer(file.buffer, file.mimetype, 'campusgeeks/items');
        imageUrls.push(url);
      }
    }

    // 2. Fallback to image URLs sent in JSON body (e.g. from tests or URL paste)
    if (req.body.images) {
      const bodyImages = Array.isArray(req.body.images)
        ? req.body.images
        : [req.body.images];
      imageUrls = [...imageUrls, ...bodyImages];
    }

    // Default placeholder image if none provided
    if (imageUrls.length === 0) {
      imageUrls.push(
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'
      );
    }

    // Determine normalized pricing
    const resolvedType = pricingType === 'FOR_SALE' ? 'FOR_SALE' : (pricingType === 'RENT_PER_DAY' ? 'RENT_PER_DAY' : 'FREE');
    const exactSalePrice = resolvedType === 'FOR_SALE' ? Number(price || pricePerDay) || 0 : 0;
    const dailyRentalRate = resolvedType === 'RENT_PER_DAY' ? Number(pricePerDay) || 0 : (resolvedType === 'FOR_SALE' ? exactSalePrice : 0);
    const resolvedDeposit = resolvedType === 'FOR_SALE' ? 0 : (Number(depositAmount) || 0);

    const item = await Item.create({
      title,
      description,
      category,
      condition: condition || 'Good',
      images: imageUrls,
      owner: req.user._id,
      pricingType: resolvedType,
      price: exactSalePrice,
      pricePerDay: dailyRentalRate,
      depositAmount: resolvedDeposit,
      pickupLocation: pickupLocation || 'Campus Central Library / Main Gate',
    });

    // Increment user's totalLends counter
    await User.findByIdAndUpdate(req.user._id, { $inc: { totalLends: 1 } });

    res.status(201).json({
      success: true,
      message: 'Item listed successfully',
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all items with search, category filtering & pagination
 * @route   GET /api/items
 * @access  Public
 */
export const getItems = async (req, res, next) => {
  try {
    const {
      search,
      category,
      condition,
      pricingType,
      availableOnly,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const query = {};

    // 1. Search filter (text index or regex fallback)
    if (search && search.trim() !== '') {
      query.$text = { $search: search.trim() };
    }

    // 2. Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // 3. Condition filter
    if (condition) {
      query.condition = condition;
    }

    // 4. Pricing type filter
    if (pricingType) {
      query.pricingType = pricingType;
    }

    // 5. Availability filter (default: show only available or show all if availableOnly is false)
    if (availableOnly === 'true') {
      query.status = 'AVAILABLE';
    }

    // Calculate pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    // Determine sorting order
    let sortOptions = { createdAt: -1 };
    if (sort === 'price_asc') sortOptions = { pricePerDay: 1, createdAt: -1 };
    if (sort === 'price_desc') sortOptions = { pricePerDay: -1, createdAt: -1 };
    if (search && !sort) sortOptions = { score: { $meta: 'textScore' }, createdAt: -1 };

    const total = await Item.countDocuments(query);
    const items = await Item.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .populate('owner', 'name department trustScore collegeId avatar');

    res.status(200).json({
      success: true,
      count: items.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single item details by ID
 * @route   GET /api/items/:id
 * @access  Public
 */
export const getItemById = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id).populate(
      'owner',
      'name email phone department trustScore totalReviews totalLends collegeId avatar'
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all items listed by current logged-in user
 * @route   GET /api/items/user/my-listings
 * @access  Private (Student only)
 */
export const getMyListings = async (req, res, next) => {
  try {
    const items = await Item.find({ owner: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an item listing
 * @route   PUT /api/items/:id
 * @access  Private (Owner only)
 */
export const updateItem = async (req, res, next) => {
  try {
    let item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    // Verify ownership
    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized: you can only update items you listed.',
      });
    }

    // Disallow pricing changes if currently borrowed
    if (item.status === 'BORROWED' && req.body.pricePerDay !== undefined) {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify pricing while item is currently borrowed by a peer.',
      });
    }

    item = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Item listing updated successfully',
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an item listing
 * @route   DELETE /api/items/:id
 * @access  Private (Owner only)
 */
export const deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    // Verify ownership
    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized: you can only delete items you listed.',
      });
    }

    // Prevent deletion if item is actively borrowed
    if (item.status === 'BORROWED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete item while it is currently in an active borrow session.',
      });
    }

    await item.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Item listing deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
