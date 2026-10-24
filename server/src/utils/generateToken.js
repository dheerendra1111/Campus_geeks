import jwt from 'jsonwebtoken';

/**
 * Generate a JWT token and attach it as an HTTP-only secure cookie to the response.
 * Also returns the token string for optional client-side Authorization header usage.
 *
 * @param {import('express').Response} res - Express response object
 * @param {string} userId - MongoDB ObjectId string of the user
 * @returns {string} The signed JWT string
 */
export const generateToken = (res, userId) => {
  const secret = process.env.JWT_SECRET || 'campusgeeks_super_secret_jwt_key_2026_change_in_production';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  const token = jwt.sign({ id: userId }, secret, {
    expiresIn,
  });

  // Attach as HTTP-only cookie
  res.cookie('jwt', token, {
    httpOnly: true, // Prevents client-side script from accessing the token (mitigates XSS)
    secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
    sameSite: 'strict', // Mitigates CSRF attacks
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });

  return token;
};
