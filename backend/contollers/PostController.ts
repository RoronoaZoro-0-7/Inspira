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
      // First find the category by slug to get its ID
      const categoryRecord = await prisma.category.findUnique({
        where: { slug: category as string }
      });
      
      if (categoryRecord) {
        where.categoryIds = {
          has: categoryRecord.id
        };
      } else {
        // If category doesn't exist, return empty results
        where.id = 'non-existent-id';
      }
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

// GET /posts/:id - Get a single post by ID
export const getPostById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: { id },
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
      }
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Post not found",
        message: "The requested post does not exist"
      });
    }

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Get post by ID error:', error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "Failed to get post"
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

    // Resolve category tags to category IDs
    const categoryNames = categoryIds || [];
    const categoryIdsToStore: string[] = [];
    for (const name of categoryNames) {
      let category = await prisma.category.findUnique({ where: { slug: name } });
      if (!category) {
        // Create category with proper name formatting
        const displayName = name.charAt(0).toUpperCase() + name.slice(1);
        category = await prisma.category.create({ 
          data: { 
            slug: name, 
            name: displayName 
          } 
        });
      }
      categoryIdsToStore.push(category.id);
    }

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

    // Fetch user profile and check for existence
    const userProfile = await prisma.profile.findUnique({
      where: { userId: req.user.clerkId }
    });
    if (!userProfile) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "User profile not found"
      });
    }

    // Check if user has enough credits
    if (userProfile.credits < POST_COST) {
      return res.status(400).json({
        error: "Insufficient credits",
        message: `You need ${POST_COST} credits to create a post. You have ${userProfile.credits} credits.`
      });
    }

    // Step 1: Create the post with proper category relationships
    const post = await prisma.post.create({
      data: {
        title,
        content,
        categoryIds: categoryIdsToStore,
        imageUrls: uploadedImageUrls,
        videoUrls: uploadedVideoUrls,
        authorId: userProfile.id,
        categories: {
          connect: categoryIdsToStore.map(id => ({ id }))
        }
      },
      include: {
        categories: true,
        author: {
          select: {
            name: true,
            imageUrl: true
          }
        }
      }
    });

    // Step 2: Deduct credits from the user's profile
    await prisma.profile.update({
      where: { userId: req.user.clerkId },
      data: { credits: { decrement: POST_COST } }
    });

    // Step 3: Record the credit transaction
    await prisma.creditTransaction.create({
      data: {
        userId: userProfile.id,
        type: 'POST_COST',
        delta: -POST_COST,
        postId: post.id,
        notes: `Created post: ${title}`
      }
    });

    // Step 4: Return the created post
    res.status(201).json({
      success: true,
      data: post
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
    const profile = await prisma.profile.findUnique({
      where: {
        userId: req.user.clerkId
      }
    });
    
    if (!profile) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "User profile not found"
      });
    }
    
    if (post.authorId !== profile.id) {
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
          markedById: profile.id
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
            userId: profile.id,
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
    const profile = await prisma.profile.findUnique({
      where: {
        userId: req.user.clerkId
      }
    });
    
    if (!profile) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "User profile not found"
      });
    }
    
    // Try to create upvote (will fail if already exists due to unique constraint)
    try {
      const upvote = await prisma.postUpvote.create({
        data: {
          postId: id,
          userId: profile.id
        }
      });

      // Get updated upvote count
      const upvoteCount = await prisma.postUpvote.count({
        where: { postId: id }
      });

      res.json({
        success: true,
        data: { upvotes: upvoteCount }
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        // Already upvoted, remove the upvote
        await prisma.postUpvote.delete({
          where: {
            postId_userId: {
              postId: id,
              userId: profile.id
            }
          }
        });

        // Get updated upvote count
        const upvoteCount = await prisma.postUpvote.count({
          where: { postId: id }
        });

        res.json({
          success: true,
          data: { upvotes: upvoteCount }
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

    // Get user profile to check ownership
    const profile = await prisma.profile.findUnique({
      where: {
        userId: req.user.clerkId
      }
    });

    if (!profile) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "User profile not found"
      });
    }

    // Check if user is the author
    if (post.authorId !== profile.id) {
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

// GET /posts/categories - Get category counts
export const getCategoryCounts = async (req: Request, res: Response) => {
  try {
    // Define the categories we want to count
    const categories = ['coding', 'design', 'business', 'writing', 'marketing'];
    
    const categoryCounts = await Promise.all(
      categories.map(async (categorySlug) => {
        // First, find the category by slug
        const category = await prisma.category.findUnique({
          where: { slug: categorySlug }
        });
        
        if (!category) {
          return {
            name: categorySlug,
            count: 0
          };
        }
        
        // Count posts that have this category ID in their categoryIds array
        const count = await prisma.post.count({
          where: {
            categoryIds: {
              has: category.id
            }
          }
        });
        
        return {
          name: categorySlug,
          count
        };
      })
    );

    res.json({
      success: true,
      data: {
        categories: categoryCounts
      }
    });
  } catch (error) {
    console.error('Get category counts error:', error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to get category counts"
    });
  }
};

// Initialize default categories
export const initializeDefaultCategories = async () => {
  try {
    const defaultCategories = [
      { slug: 'coding', name: 'Coding' },
      { slug: 'design', name: 'Design' },
      { slug: 'business', name: 'Business' },
      { slug: 'writing', name: 'Writing' },
      { slug: 'marketing', name: 'Marketing' }
    ];

    for (const category of defaultCategories) {
      await prisma.category.upsert({
        where: { slug: category.slug },
        update: {},
        create: {
          slug: category.slug,
          name: category.name
        }
      });
    }

    console.log('✅ Default categories initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize default categories:', error);
  }
};

// Fix existing posts that don't have proper category relationships
export const fixExistingPostCategories = async () => {
  try {
    // Get all posts that have categoryIds
    const posts = await prisma.post.findMany({
      where: {
        categoryIds: {
          isEmpty: false
        }
      },
      include: {
        categories: true
      }
    });

    let fixedCount = 0;
    for (const post of posts) {
      if (post.categories.length === 0 && post.categoryIds.length > 0) {
        // Connect the categories
        await prisma.post.update({
          where: { id: post.id },
          data: {
            categories: {
              connect: post.categoryIds.map(id => ({ id }))
            }
          }
        });
        fixedCount++;
      }
    }

    if (fixedCount > 0) {
      console.log(`✅ Fixed category relationships for ${fixedCount} posts`);
    } else {
      console.log('✅ All posts already have proper category relationships');
    }
  } catch (error) {
    console.error('❌ Failed to fix existing post categories:', error);
  }
};

// Manual fix endpoint for category relationships
export const manualFixCategories = async (req: Request, res: Response) => {
  try {
    await fixExistingPostCategories();
    res.json({
      success: true,
      message: "Category relationships fixed successfully"
    });
  } catch (error) {
    console.error('Manual fix categories error:', error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to fix category relationships"
    });
  }
};