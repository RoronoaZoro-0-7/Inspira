import express from 'express';
import { requireAuth } from '@clerk/express';
import { getHome, getPosts, getPostById, createPost, resolvePost, upvotePost, deletePost, getCategoryCounts, manualFixCategories } from '../contollers/PostController';
import { getCommentsByPostId, addComment } from '../contollers/CommentController';
import authMiddleware from '../middlewares/authMiddleware';

const router = express.Router();

// Public routes (no authentication required)
router.get('/', getHome);
router.get('/posts', getPosts);
router.get('/categories', getCategoryCounts);
router.get('/fix-categories', manualFixCategories);
router.get('/:id', getPostById);
router.get('/:id/comments', getCommentsByPostId);

// Protected routes (require authentication)
router.use(requireAuth());
router.use(authMiddleware);

// Create post
router.post('/add', createPost);

// Post actions
router.patch('/:id/resolve', resolvePost);
router.post('/:id/upvote', upvotePost);
router.delete('/delete/:id', deletePost);

// Comment actions
router.post('/:id/comments', addComment);

export default router;