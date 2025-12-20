import User from '../models/User.model.js';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
    'Password must be 8+ chars with a number, upper, and lower case'
  ),
  avatarId: z.string(),
  domains: z.array(z.string()).optional(),
  learningStyle: z.string().optional(),
  studyTime: z.string().optional(),
  teamPref: z.string().optional(),
});

const setTokenCookie = (res, token) => {
  res.cookie('jwt', token, {
    httpOnly: true,
   secure: true,      
    sameSite: 'none',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
};

export const registerUser = async (req, res) => {
  try {
    const userData = registerSchema.parse(req.body);
    const {
      name,
      email,
      username,
      password,
      avatarId,
      domains,
      learningStyle,
      studyTime,
      teamPref,
    } = userData;

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ message: 'This username is already taken' });
    }

    const user = await User.create({
      name,
      email,
      username,
      password,
      avatarId,
      domains,
      learningStyle,
      studyTime,
      teamPref,
    });

    if (user) {
      const token = generateToken(user._id);
      setTokenCookie(res, token);
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        avatarId: user.avatarId,
        domains: user.domains,
        learningStyle: user.learningStyle,
        studyTime: user.studyTime,
        teamPref: user.teamPref,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id);
      setTokenCookie(res,token);

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        avatarId: user.avatarId,
        domains: user.domains,
        learningStyle: user.learningStyle,
        studyTime: user.studyTime,
        teamPref: user.teamPref,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

export const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Forgot Password
// @route   POST /api/auth/forgotpassword
// @access  Public
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset url
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${frontendUrl}/resetpassword/${resetToken}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Token',
        message,
      });

      res.status(200).json({ success: true, data: 'Email sent' });
    } catch (err) {
      console.error(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      return res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reset Password
// @route   PUT /api/auth/resetpassword/:resetToken
// @access  Public
export const resetPassword = async (req, res) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Password updated success',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};