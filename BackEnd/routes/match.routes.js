import express from 'express';
import { findPartner, recommendPosts } from '../controllers/match.controller.js';

const router = express.Router();

// Matches the old Python /api/v1/partners/... route
router.get('/partners/find-partner', findPartner);

// Matches the old Python /api/v1/posts/... route
router.get('/posts/recommend-posts', recommendPosts);


export default router;