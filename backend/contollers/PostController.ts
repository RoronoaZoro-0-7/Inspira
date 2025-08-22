import { Request, Response } from 'express';
import prisma from '../index';
import { uploadFile, getPublicUrl } from '../utils/s3Client';

// GET / - Home/landing page
export const getHome = async (req: Request, res: Response) => {
  try {
    const stats = await prisma.$transaction([
      prisma.post.count(),
      prisma.user.count(),
      prisma.comment.count(),
    ]);

    res.json({
      success: true,
      data: {
        totalPosts: stats[0],
        totalUsers: stats[1],
        totalComments: stats[2],
        platform: "Inspira - A platform for asking and answering questions",
        description: "Get help from experts and earn credits by helping others"
      }
    });
  } catch (error) {
    console.error('Get home error:', error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to get home data"
    });
  }
};

// GET /posts - Fetch all posts with filters
export const getPosts = async (req: Request, res: Response) => {
  try {
    const {
      sort = 'newest',
      category,
      page = '1',
      limit = '10'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};
    if (category) {
      where.categoryIds = {
        has: category as string
      };
    }

    // Build order by clause
    let orderBy: any = {};
    switch (sort) {
      case 'trending':
        orderBy = {
          upvotes: {
            _count: 'desc'
          }
        };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    const [posts, total] = await prisma.$transaction([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              name: true,
              imageUrl: true
            }
          },
          categories: true,
          _count: {
            select: {
              comments: true,
              upvotes: true
            }
          }
        },
        orderBy,
        skip,
        take: limitNum
      }),
      prisma.post.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to get posts"
    });
  }
};

// POST /posts - Create a post
export const createPost = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "User not authenticated"
      });
    }

    const { title, content, categoryIds } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        error: "Bad request",
        message: "Title and content are required"
      });
    }

    // Handle file uploads (images/videos) from req.files (multer or similar)
    const uploadedImageUrls: string[] = [];
    const uploadedVideoUrls: string[] = [];

    // Cast req.files for multer compatibility
    const files = req.files as Record<string, Express.Multer.File[]> | undefined;
    if (files && Array.isArray(files['images'])) {
      for (const file of files['images']) {
        const key = `images/${Date.now()}_${file.originalname}`;
        await uploadFile(key, file.buffer, file.mimetype);
        uploadedImageUrls.push(getPublicUrl(key));
      }
    }

    if (files && Array.isArray(files['videos'])) {
      for (const file of files['videos']) {
        const key = `videos/${Date.now()}_${file.originalname}`;
        await uploadFile(key, file.buffer, file.mimetype);
        uploadedVideoUrls.push(getPublicUrl(key));
      }
    }

    const POST_COST = 5; // Credits required to create a post

    // Check if user has enough credits
    const userProfile = await prisma.profile.findUnique({
      where: { userId: req.user.id },
      select: { credits: true }
    });

    if (!userProfile || userProfile.credits < POST_COST) {
      return res.status(400).json({
        error: "Insufficient credits",
        message: `You need ${POST_COST} credits to create a post. You have ${userProfile?.credits || 0} credits.`
      });
    }

    // Create post and deduct credits in a transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Create the post
      const post = await tx.post.create({
        data: {
          title,
          content,
          categoryIds: categoryIds || [],
          imageUrls: uploadedImageUrls,
          videoUrls: uploadedVideoUrls,
          authorId: req.user.profile!.id
        },
        include: {
          author: {
            select: {
              name: true,
              imageUrl: true
            }
          },
          categories: true
        }
      });

      // Deduct credits
      await tx.profile.update({
        where: { userId: req.user.id },
        data: { credits: { decrement: POST_COST } }
      });

      // Record credit transaction
      await tx.creditTransaction.create({
        data: {
          userId: req.user.profile!.id,
          type: 'POST_COST',
          delta: -POST_COST,
          postId: post.id,
          notes: `Created post: ${title}`
        }
      });

      return post;
    });

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to create post"
    });
  }
};

// PATCH /posts/:id/resolve - Mark comment as helpful
export const resolvePost = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "User not authenticated"
      });
    }

    const { id } = req.params;
    const { commentId } = req.body;
    if (!commentId) {
      return res.status(400).json({
        error: "Bad request",
        message: "Comment ID is required"
      });
    }

    // Get post and verify ownership
    const post = await prisma.post.findUnique({
      where: { id },
      include: { author: true }
    });

    if (!post) {
      return res.status(404).json({
        error: "Not found",
        message: "Post not found"
      });
    }

    if (post.authorId !== req.user.profile!.id) {
      return res.status(403).json({
        error: "Forbidden",
        message: "Only the post owner can mark comments as helpful"
      });
    }

    // Check if already resolved
    const existingHelpful = await prisma.helpfulMark.findUnique({
      where: { postId: id }
    });

    if (existingHelpful) {
      return res.status(400).json({
        error: "Bad request",
        message: "Post is already resolved"
      });
    }

    // Get comment and verify it belongs to the post
    const comment = await prisma.comment.findFirst({
      where: {
        id: commentId,
        postId: id
      },
      include: { author: true }
    });

    if (!comment) {
      return res.status(404).json({
        error: "Not found",
        message: "Comment not found or doesn't belong to this post"
      });
    }

    const HELPFUL_REWARD = 10; // Credits given to helpful comment author

    // Mark as helpful and transfer credits in a transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Create helpful mark
      const helpfulMark = await tx.helpfulMark.create({
        data: {
          postId: id,
          commentId,
          markedById: req.user.profile!.id
        }
      });

      // Update post with helpful comment ID
      await tx.post.update({
        where: { id },
        data: { helpfulCommentIds: [commentId] }
      });

      // Transfer credits from post author to comment author
      await tx.profile.update({
        where: { id: comment.authorId },
        data: { credits: { increment: HELPFUL_REWARD } }
      });

      // Record credit transactions
      await tx.creditTransaction.createMany({
        data: [
          {
            userId: req.user.profile!.id,
            type: 'HELPFUL_REWARD',
            delta: -HELPFUL_REWARD,
            postId: id,
            commentId,
            notes: `Marked comment as helpful`
          },
          {
            userId: comment.authorId,
            type: 'HELPFUL_REWARD',
            delta: HELPFUL_REWARD,
            postId: id,
            commentId,
            notes: `Received helpful reward`
          }
        ]
      });

      return helpfulMark;
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Resolve post error:', error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to resolve post"
    });
  }
};

// POST /posts/:id/upvote - Upvote a post
export const upvotePost = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "User not authenticated"
      });
    }

    const { id } = req.params;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id }
    });

    if (!post) {
      return res.status(404).json({
        error: "Not found",
        message: "Post not found"
      });
    }

    // Try to create upvote (will fail if already exists due to unique constraint)
    try {
      const upvote = await prisma.postUpvote.create({
        data: {
          postId: id,
          userId: req.user.profile!.id
        }
      });

      res.json({
        success: true,
        data: upvote
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        // Already upvoted, remove the upvote
        await prisma.postUpvote.delete({
          where: {
            postId_userId: {
              postId: id,
              userId: req.user.profile!.id
            }
          }
        });

        res.json({
          success: true,
          data: { removed: true }
        });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Upvote post error:', error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to upvote post"
    });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "User not authenticated"
      });
    }

    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: { id }
    });

    if (!post) {
      return res.status(404).json({
        error: "Not found",
        message: "Post not found"
      });
    }

    // Check if user is the author
    if (post.authorId !== req.user.profile!.id) {
      return res.status(403).json({
        error: "Forbidden",
        message: "You are not authorized to delete this post"
      });
    }

    await prisma.post.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: "Post deleted successfully"
    });
  } catch (error: any) {
    console.error('Delete post error:', error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to delete post"
    });
  }
};