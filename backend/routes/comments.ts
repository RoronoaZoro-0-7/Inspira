import express from 'express';
import { requireAuth } from '@clerk/express';
import { addReply, upvoteComment, getComment } from '../contollers/CommentController';
import authMiddleware from '../middlewares/authMiddleware';

const router = express.Router();

// Public routes (no authentication required)
router.get('/:id', getComment);

// Protected routes (require authentication)
// router.use(requireAuth());
router.use(authMiddleware);

// Add reply to comment
router.post('/:id/replies', addReply);

// Upvote comment
router.post('/:id/upvote', upvoteComment);

export default router;
