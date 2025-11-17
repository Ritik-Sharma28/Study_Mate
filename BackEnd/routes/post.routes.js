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

// GET all posts (for the main feed)
// POST a new post (must be logged in)
router.route('/').get(getPosts).post(protect, createPost);
router.route('/myposts').get(protect, getMyPosts);

// 2. Add new route
router.route('/user/:userId').get(getPostsByUserId);

// GET, PUT (update), and DELETE a specific post
// We will check that the user is the author in the controller
router
  .route('/:id')
  .get(getPostById)
  .put(protect, updatePost)
  .delete(protect, deletePost);

// PUT to like/unlike a post
router.route('/:id/like').put(protect, likePost);

export default router;