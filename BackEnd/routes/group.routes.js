import express from 'express';
import {
  getAllGroups,
  getMyGroups,
  joinGroup,
  leaveGroup,
  getGroupMembers,
} from '../controllers/group.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();



router.route('/').get(protect, getAllGroups);
router.route('/my-groups').get(protect, getMyGroups);
router.route('/:id/join').post(protect, joinGroup);
router.route('/:id/leave').delete(protect, leaveGroup);
router.route('/:id/members').get(protect, getGroupMembers);

export default router;