import User from '../models/User.model.js';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

// Helper function to generate a JWT
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

// --- Helper function to set the cookie ---
const setTokenCookie = (res, token) => {
  res.cookie('jwt', token, {
    httpOnly: true, // Prevents client-side JS from accessing the cookie
    secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
    sameSite: 'strict', // Prevents CSRF attacks
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

// --- Register User ---
// POST /api/auth/register
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

    // Check if user (email or username) already exists
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

// --- Login User ---
// POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id);
      setTokenCookie(res, token); // 

      // 2. DON'T SEND TOKEN IN RESPONSE
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
    expires: new Date(0), // Set to a date in the past
  });
  res.status(200).json({ message: 'Logged out successfully' });
};