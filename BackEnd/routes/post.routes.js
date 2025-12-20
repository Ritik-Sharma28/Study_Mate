import express from 'express';
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  getMyPosts,
  getPostsByUserId,
} from '../controllers/post.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();



router.route('/').get(getPosts).post(protect, createPost);
router.route('/myposts').get(protect, getMyPosts);


router.route('/user/:userId').get(getPostsByUserId);



router
  .route('/:id')
  .get(getPostById)
  .put(protect, updatePost)
  .delete(protect, deletePost);


router.route('/:id/like').put(protect, likePost);

export default router;