import express from 'express';
import { requireAuth } from '@clerk/express';
import { 
  getCurrentUser, 
  updateProfile, 
  getUserById, 
  deleteAccount, 
  getUserCredits, 
  getUserPosts, 
  getUserComments, 
  getCreditHistory 
} from '../contollers/AuthController';
import authMiddleware from '../middlewares/authMiddleware';

const router = express.Router();

// Public routes (no authentication required)
router.get('/user/:userId', getUserById);


// Protected routes (require authentication)
// router.use(requireAuth());
// router.use();

// User profile
router.get('/me',getCurrentUser);
router.put('/profile', updateProfile);

// User content
router.get('/me/posts', getUserPosts);
router.get('/me/comments', getUserComments);

// Credits
router.get('/me/credits', getCreditHistory);
router.get('/credits', getUserCredits); // Alias for backward compatibility

// Account management
router.delete('/account', deleteAccount);

export default router;