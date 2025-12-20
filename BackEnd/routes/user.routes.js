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


router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

  
router.route('/:id').get(getUserById);

export default router;