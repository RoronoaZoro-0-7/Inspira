import express from 'express';
import { requireAuth } from '@clerk/express';
import { 
  getConversations, 
  getMessages, 
  sendMessage, 
  createConversation, 
  searchUsers, 
  markMessageAsRead 
} from '../contollers/ChatController';
import authMiddleware from '../middlewares/authMiddleware';

const router = express.Router();

// All chat routes require authentication
router.use(requireAuth());
router.use(authMiddleware);

// Conversations
router.get('/conversations', getConversations);
router.post('/conversations', createConversation);

// Messages
router.get('/conversations/:conversationId/messages', getMessages);
router.post('/conversations/:conversationId/messages', sendMessage);
router.patch('/messages/:messageId/read', markMessageAsRead);

// User search
router.get('/users', searchUsers);

export default router;
