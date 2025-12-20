import express from 'express';
import { findPartner, recommendPosts } from '../controllers/match.controller.js';

const router = express.Router();


router.get('/partners/find-partner', findPartner);


router.get('/posts/recommend-posts', recommendPosts);


export default router;