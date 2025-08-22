import { Request, Response } from 'express';
import { getAuth } from '@clerk/express';
import prisma from '../index';

// Get current user profile
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: "Unauthorized", 
        message: "User not authenticated" 
      });
    }

    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ 
      error: "Internal server error", 
      message: "Failed to get user profile" 
    });
  }
};

// Update user profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: "Unauthorized", 
        message: "User not authenticated" 
      });
    }

    const { name, bio, expertiseTags, interestTags } = req.body;

    // Check if profile exists
    const profile = await prisma.profile.findUnique({
      where: { userId: req.user.clerkId }
    });

    if (!profile) {
      return res.status(404).json({
        error: "Not found",
        message: "Profile not found"
      });
    }

    const updatedProfile = await prisma.profile.update({
      where: {
        userId: req.user.clerkId
      },
      data: {
        name: name || undefined,
        bio: bio || undefined,
        expertiseTags: expertiseTags || undefined,
        interestTags: interestTags || undefined,
      },
      include: {
        user: true
      }
    });

    res.json({
      success: true,
      profile: updatedProfile
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      error: "Internal server error", 
      message: "Failed to update profile" 
    });
  }
};

// Get user by ID (public profile)
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: {
        id: userId
      },
      include: {
        profile: {
          select: {
            name: true,
            bio: true,
            expertiseTags: true,
            interestTags: true,
            credits: true,
            createdAt: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ 
        error: "Not found", 
        message: "User not found" 
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ 
      error: "Internal server error", 
      message: "Failed to get user" 
    });
  }
};

// Delete user account
export const deleteAccount = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: "Unauthorized", 
        message: "User not authenticated" 
      });
    }

    // Delete user (this will cascade to profile due to onDelete: Cascade)
    await prisma.user.delete({
      where: {
        id: req.user.id
      }
    });

    res.json({
      success: true,
      message: "Account deleted successfully"
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ 
      error: "Internal server error", 
      message: "Failed to delete account" 
    });
  }
};

// Get user credits
export const getUserCredits = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: "Unauthorized", 
        message: "User not authenticated" 
      });
    }

    const profile = await prisma.profile.findUnique({
      where: {
        userId: req.user.clerkId
      },
      select: {
        credits: true
      }
    });

    if (!profile) {
      return res.status(404).json({ 
        error: "Not found", 
        message: "Profile not found" 
      });
    }

    res.json({
      success: true,
      credits: profile.credits
    });
  } catch (error) {
    console.error('Get user credits error:', error);
    res.status(500).json({ 
      error: "Internal server error", 
      message: "Failed to get user credits" 
    });
  }
};

// GET /me/posts - List user's posts
export const getUserPosts = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: "Unauthorized", 
        message: "User not authenticated" 
      });
    }

    const profile = await prisma.profile.findUnique({
      where: {
        userId: req.user.clerkId
      }
    });
    console.log(profile);
    
    if (!profile) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "User profile not found"
      });
    }
    
    const posts = await prisma.post.findMany({
      where: {
        authorId: profile.id
      },
      include: {
        categories: true,
        _count: {
          select: {
            comments: true,
            upvotes: true
          }
        },
        helpfulMark: {
          include: {
            comment: {
              select: {
                content: true,
                author: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ 
      error: "Internal server error", 
      message: "Failed to get user posts" 
    });
  }
};

// GET /me/comments - List user's comments
export const getUserComments = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: "Unauthorized", 
        message: "User not authenticated" 
      });
    }

    const profile = await prisma.profile.findUnique({
      where: {
        userId: req.user.clerkId
      }
    });
    if (!profile) {
      return res.status(404).json({
        error: "Not found",
        message: "Profile not found"
      });
    }

    const comments = await prisma.comment.findMany({
      where: {
        authorId: profile.id
      },
      include: {
        post: {
          select: {
            id: true,
            title: true
          }
        },
        parent: {
          select: {
            content: true
          }
        },
        _count: {
          select: {
            upvotes: true,
            replies: true
          }
        },
        helpfulFor: {
          select: {
            post: {
              select: {
                title: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: comments
    });
  } catch (error) {
    console.error('Get user comments error:', error);
    res.status(500).json({ 
      error: "Internal server error", 
      message: "Failed to get user comments" 
    });
  }
};

// GET /me/credits - Credit ledger / transaction history
export const getCreditHistory = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: "Unauthorized", 
        message: "User not authenticated" 
      });
    }

    const profile = await prisma.profile.findUnique({
      where: {
        userId: req.user.clerkId
      }
    });
    if (!profile) {
      return res.status(404).json({
        error: "Not found",
        message: "Profile not found"
      });
    }

    // Build where clause
    const where: any = {
      userId: profile.id
    };

    const transactions = await prisma.creditTransaction.findMany({
      where,
      include: {
        post: {
          select: {
            title: true
          }
        },
        comment: {
          select: {
            content: true,
            post: {
              select: {
                title: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: {
        transactions,
        currentBalance: profile.credits || 0
      }
    });
  } catch (error) {
    console.error('Get credit history error:', error);
    res.status(500).json({ 
      error: "Internal server error", 
      message: "Failed to get credit history" 
    });
  }
};