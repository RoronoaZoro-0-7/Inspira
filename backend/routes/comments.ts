import express from 'express';
import { requireAuth } from '@clerk/express';
import { addComment, addReply, upvoteComment, getComment } from '../contollers/CommentController';
import authMiddleware from '../middlewares/authMiddleware';

const router = express.Router();

// Public routes (no authentication required)
router.get('/comments/:id', getComment);

// Protected routes (require authentication)
// router.use(requireAuth());
router.use(authMiddleware);

// Add comment to post
router.post('/posts/:id/comments', addComment);

// Add reply to comment
router.post('/comments/:id/replies', addReply);

// Upvote comment
router.post('/comments/:id/upvote', upvoteComment);

export default router;
