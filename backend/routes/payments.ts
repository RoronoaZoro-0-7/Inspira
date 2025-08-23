import express from 'express';
import { requireAuth } from '@clerk/express';
import { createOrder, verifyPayment, getPackages } from '../contollers/PaymentController';
import authMiddleware from '../middlewares/authMiddleware';

const router = express.Router();

// All payment routes require authentication
router.use(requireAuth());
router.use(authMiddleware);

// Payment routes
router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.get('/packages', getPackages);

export default router;
