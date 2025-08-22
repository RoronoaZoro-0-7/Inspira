import express from 'express';
import { requireAuth } from '@clerk/express';
import { getHome, getPosts, createPost, resolvePost, upvotePost } from '../contollers/PostController';
import authMiddleware from '../middlewares/authMiddleware';

const router = express.Router();

// Public routes (no authentication required)
router.get('/', getHome);
router.get('/posts', getPosts);

// Protected routes (require authentication)
router.use(requireAuth());
router.use(authMiddleware);

// Create post
router.post('/posts', createPost);

// Post actions
router.patch('/posts/:id/resolve', resolvePost);
router.post('/posts/:id/upvote', upvotePost);

export default router;
