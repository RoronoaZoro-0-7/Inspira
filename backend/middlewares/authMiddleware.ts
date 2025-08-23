import { getAuth } from '@clerk/express';
import { NextFunction, Request, Response } from 'express';
import prisma from "../index";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const authMiddleware = async function (req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ 
        error: "Unauthorized", 
        message: "No user ID found in request" 
      });
    }
    const clerkId = userId;
    const user = await prisma.user.findUnique({
      where: {
        clerkId: clerkId
      },
      include: {
        profile: true
      }
    });
    console.log(user);

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = user;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      error: "Internal server error",
      message: "Authentication failed"
    });
  }
};

export default authMiddleware;