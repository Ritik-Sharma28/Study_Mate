import express from 'express';
import {
  getDmMessages,
  getGroupMessages,
  getChatList, // 1. Import
} from '../controllers/message.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.route('/my-chats').get(protect, getChatList);

router.route('/dm/:roomId').get(protect, getDmMessages);
router.route('/group/:groupId').get(protect, getGroupMessages);

export default router;