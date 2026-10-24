import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User Schema for CampusGeeks
 * Handles student authentication, campus identity (collegeId, department),
 * and dynamic peer reputation tracking (trustScore, review count).
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your campus/college email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address',
      ],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Do not return password by default in query results
    },
    collegeId: {
      type: String,
      required: [true, 'Please provide your Student ID / Roll Number'],
      trim: true,
      maxlength: [30, 'Student ID cannot exceed 30 characters'],
    },
    department: {
      type: String,
      required: [true, 'Please select or provide your academic department'],
      trim: true,
      default: 'General',
    },
    phone: {
      type: String,
      required: [true, 'Please provide a contact phone number for item handoffs'],
      trim: true,
      match: [/^[0-9+-\s]{8,18}$/, 'Please provide a valid phone number'],
    },
    avatar: {
      type: String,
      default: '',
    },
    trustScore: {
      type: Number,
      default: 5.0,
      min: [1.0, 'Trust score cannot be below 1.0'],
      max: [5.0, 'Trust score cannot exceed 5.0'],
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    totalLends: {
      type: Number,
      default: 0,
    },
    totalBorrows: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Pre-save hook: Hash the user's password before saving to database
 * if the password field has been modified or is new.
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Instance method to compare an entered plaintext password with the hashed password in MongoDB
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
