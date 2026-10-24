import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Protect Middleware
 * Ensures the incoming request has a valid JWT (either in HTTP-only cookies or Authorization Bearer header).
 * Populates req.user with the authenticated user's document (without password).
 */
export const protect = async (req, res, next) => {
  let token;

  // 1. Check HTTP-only cookie first
  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  // 2. Fallback to Authorization: Bearer <token> header
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: no authentication token provided',
    });
  }

  try {
    const secret =
      process.env.JWT_SECRET ||
      'campusgeeks_super_secret_jwt_key_2026_change_in_production';

    // Verify token
    const decoded = jwt.verify(token, secret);

    // Fetch user from DB (excluding password)
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized: user account not found',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(`[Auth Middleware Error] ${error.message}`);
    return res.status(401).json({
      success: false,
      message: 'Not authorized: invalid or expired authentication token',
    });
  }
};
