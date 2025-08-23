import { Request, Response } from 'express';
import Razorpay from 'razorpay';
import prisma from '../index';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Credit package configurations
const CREDIT_PACKAGES = {
  starter: { credits: 50, price: 499, name: 'Starter Pack' },
  value: { credits: 150, price: 1299, name: 'Value Pack' },
  pro: { credits: 300, price: 1999, name: 'Pro Pack' },
};

// POST /api/payments/create-order - Create Razorpay order
export const createOrder = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: "Unauthorized", 
        message: "User not authenticated" 
      });
    }

    if (!req.user.profile) {
      return res.status(401).json({ 
        error: "Unauthorized", 
        message: "User profile not found" 
      });
    }

    const { packageType } = req.body;

    if (!packageType || !CREDIT_PACKAGES[packageType as keyof typeof CREDIT_PACKAGES]) {
      return res.status(400).json({ 
        error: "Bad request", 
        message: "Invalid package type" 
      });
    }

    const packageConfig = CREDIT_PACKAGES[packageType as keyof typeof CREDIT_PACKAGES];

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: packageConfig.price, // Amount in paise (₹4.99 = 499 paise)
      currency: 'INR',
      receipt: `credits_${packageType}_${Date.now()}`,
      notes: {
        userId: req.user.profile.id,
        packageType: packageType,
        credits: packageConfig.credits.toString(),
      },
    });

    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        packageType: packageType,
        credits: packageConfig.credits,
        packageName: packageConfig.name,
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ 
      error: "Internal server error", 
      message: "Failed to create order" 
    });
  }
};

// POST /api/payments/verify - Verify payment and add credits
export const verifyPayment = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: "Unauthorized", 
        message: "User not authenticated" 
      });
    }

    if (!req.user.profile) {
      return res.status(401).json({ 
        error: "Unauthorized", 
        message: "User profile not found" 
      });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, packageType } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !packageType) {
      return res.status(400).json({ 
        error: "Bad request", 
        message: "Missing payment verification parameters" 
      });
    }

    // Verify payment signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const crypto = require('crypto');
    const signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(text)
      .digest('hex');

    if (signature !== razorpay_signature) {
      return res.status(400).json({ 
        error: "Bad request", 
        message: "Invalid payment signature" 
      });
    }

    // Get package configuration
    const packageConfig = CREDIT_PACKAGES[packageType as keyof typeof CREDIT_PACKAGES];
    if (!packageConfig) {
      return res.status(400).json({ 
        error: "Bad request", 
        message: "Invalid package type" 
      });
    }

    // Check if payment already processed
    const existingTransaction = await prisma.creditTransaction.findFirst({
      where: {
        userId: req.user.profile.id,
        type: 'PURCHASE',
        notes: {
          contains: razorpay_payment_id
        }
      }
    });

    if (existingTransaction) {
      return res.status(400).json({ 
        error: "Bad request", 
        message: "Payment already processed" 
      });
    }

    // Add credits to user account
    const result = await prisma.$transaction(async (tx) => {
      // Update user credits
      const updatedProfile = await tx.profile.update({
        where: { id: req.user.profile.id },
        data: {
          credits: {
            increment: packageConfig.credits
          }
        }
      });

      // Create credit transaction record
      const transaction = await tx.creditTransaction.create({
        data: {
          userId: req.user.profile.id,
          type: 'PURCHASE',
          delta: packageConfig.credits,
          balanceAfter: updatedProfile.credits,
          notes: `Razorpay Payment: ${razorpay_payment_id}, Order: ${razorpay_order_id}, Package: ${packageType}`,
        }
      });

      return { updatedProfile, transaction };
    });

    res.json({
      success: true,
      data: {
        message: "Payment verified and credits added successfully",
        creditsAdded: packageConfig.credits,
        newBalance: result.updatedProfile.credits,
        transactionId: result.transaction.id,
      }
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ 
      error: "Internal server error", 
      message: "Failed to verify payment" 
    });
  }
};

// GET /api/payments/packages - Get available credit packages
export const getPackages = async (req: Request, res: Response) => {
  try {
    const packages = Object.entries(CREDIT_PACKAGES).map(([key, config]) => ({
      id: key,
      name: config.name,
      credits: config.credits,
      price: config.price,
      priceInRupees: (config.price / 100).toFixed(2),
      pricePerCredit: (config.price / config.credits / 100).toFixed(3),
    }));

    res.json({
      success: true,
      data: packages
    });
  } catch (error) {
    console.error('Get packages error:', error);
    res.status(500).json({ 
      error: "Internal server error", 
      message: "Failed to get packages" 
    });
  }
};
