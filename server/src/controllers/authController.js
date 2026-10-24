import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';

/**
 * @desc    Register a new student user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, collegeId, department, phone, avatar } = req.body;

    // Validate required fields
    if (!name || !email || !password || !collegeId || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, password, collegeId, and phone.',
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Create student user (password is automatically hashed by pre-save hook in User model)
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      collegeId,
      department: department || 'General',
      phone,
      avatar: avatar || '',
    });

    if (user) {
      // Issue JWT token in secure HTTP-only cookie
      const token = generateToken(res, user._id);

      return res.status(201).json({
        success: true,
        message: 'Student account registered successfully',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          collegeId: user.collegeId,
          department: user.department,
          phone: user.phone,
          avatar: user.avatar,
          trustScore: user.trustScore,
          totalLends: user.totalLends,
          totalBorrows: user.totalBorrows,
          token, // Returned for optional client storage
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid user data received',
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate student & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    // Explicitly select password field since it is select: false by default
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(res, user._id);

      return res.status(200).json({
        success: true,
        message: 'Logged in successfully',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          collegeId: user.collegeId,
          department: user.department,
          phone: user.phone,
          avatar: user.avatar,
          trustScore: user.trustScore,
          totalLends: user.totalLends,
          totalBorrows: user.totalBorrows,
          token,
        },
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Log out user & clear HTTP-only cookie
 * @route   POST /api/auth/logout
 * @access  Public
 */
export const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

/**
 * @desc    Get current logged-in user profile
 * @route   GET /api/auth/me
 * @access  Private (Protected)
 */
export const getUserProfile = async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
};

/**
 * @desc    Update current student profile
 * @route   PUT /api/auth/profile
 * @access  Private (Protected)
 */
export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.department = req.body.department || user.department;
    user.avatar = req.body.avatar || user.avatar;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        collegeId: updatedUser.collegeId,
        department: updatedUser.department,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
        trustScore: updatedUser.trustScore,
        totalLends: updatedUser.totalLends,
        totalBorrows: updatedUser.totalBorrows,
      },
    });
  } catch (error) {
    next(error);
  }
};
