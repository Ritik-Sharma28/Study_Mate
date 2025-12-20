import express from 'express';
import {
    addComment,
    getComments,
    deleteComment,
} from '../controllers/comment.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.route('/:postId').get(protect, getComments).post(protect, addComment);
router.route('/:commentId').delete(protect, deleteComment);

export default router;
