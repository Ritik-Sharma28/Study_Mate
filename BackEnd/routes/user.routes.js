import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  getUserById,
  searchUsers,
} from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.route('/search').get(protect, searchUsers);

// Both routes are protected and use the logged-in user's token
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

  // 2. Add new public route
router.route('/:id').get(getUserById);

export default router;