import express from 'express';
import { requireAuth } from '@clerk/express';
import { getHome, getPosts, createPost, resolvePost, upvotePost, deletePost } from '../contollers/PostController';
import authMiddleware from '../middlewares/authMiddleware';

const router = express.Router();

// Public routes (no authentication required)
router.get('/', getHome);
router.get('/posts', getPosts);

// Protected routes (require authentication)
// router.use(requireAuth());
router.use(authMiddleware);

// Create post
router.post('/add', createPost);

// Post actions
router.patch('/:id/resolve', resolvePost);
router.post('/:id/upvote', upvotePost);
router.delete('/delete/:id', deletePost);

export default router;